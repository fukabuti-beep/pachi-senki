// パチ戦記 オンラインランキング用サーバーの見本(Cloudflare Workers + KV)。手順は docs/ONLINE.md。
// エンドポイント:
//   POST /submit {board,score,name,id} → {ok,rank}     自己ベスト更新時にゲームが送る(1プレイヤー1件=自己ベストのみ)
//   GET  /top?board=stage              → [{name,score}] 上位50件
//   GET  /me?board=stage&id=xxxx       → {rank,score}   自分の順位(上位100件の中にいれば)
// 各ボードの上位100件を KV に保存。値の検証・レート制限・「ありえない速さ」の弾きつき(tests/rankserver.js で検証)。
// ※ ブラウザゲームのスコアは改ざん可能。上位の明らかな異常値は管理者が KV から削除する運用を想定。景品は付けないこと。
const BOARDS = { stage: 2000, chain: 999, score: 99999, hits: 1e9 };   // ボードと上限値
const KEEP = 100, TOP = 50;
// 初めて送ってきてからの経過時間に対する上限(放置+転生を最大限うまく回しても届かない、かなり甘めの線)
const PACE = { stage: h => 80 + 120 * h, chain: h => 60 + 40 * h, score: () => BOARDS.score, hits: h => 300 + 800 * h };
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...cors } });
const clean = s => String(s || '').replace(/[<>&"'`\\\u0000-\u001f]/g, '').trim().slice(0, 10);
const idOk = id => /^[a-z0-9]{8,32}$/.test(id);
async function load(env, b) { try { const l = JSON.parse((await env.RANK.get('b:' + b)) || '[]'); return Array.isArray(l) ? l : [] } catch { return [] } }
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method === 'GET' && url.pathname === '/top') {
      const b = url.searchParams.get('board'); if (!BOARDS[b]) return json({ error: 'board' }, 400);
      return json((await load(env, b)).slice(0, TOP).map(r => ({ name: r.name, score: r.score })));
    }
    if (req.method === 'GET' && url.pathname === '/me') {
      const b = url.searchParams.get('board'), id = String(url.searchParams.get('id') || ''); if (!BOARDS[b] || !idOk(id)) return json({ error: 'invalid' }, 400);
      const list = await load(env, b), i = list.findIndex(r => r.id === id);
      return json(i >= 0 ? { rank: i + 1, score: list[i].score } : { rank: 0 });
    }
    if (req.method === 'POST' && url.pathname === '/submit') {
      let d; try { d = await req.json() } catch { return json({ error: 'json' }, 400) }
      const b = d && d.board, score = Math.floor(+(d && d.score)), name = clean(d && d.name), id = String((d && d.id) || '');
      if (!BOARDS[b] || !Number.isFinite(score) || score <= 0 || score > BOARDS[b] || !name || !idOk(id)) return json({ error: 'invalid' }, 400);
      const rl = 'rl:' + b + ':' + id; if (await env.RANK.get(rl)) return json({ error: 'slow down' }, 429);
      await env.RANK.put(rl, '1', { expirationTtl: 60 });
      // 初めて見たプレイヤーなら記録開始時刻を残す → 経過時間に対してありえない値は弾く
      const uk = 'u:' + id; let first = +(await env.RANK.get(uk)); const now = Date.now();
      if (!first) { first = now; await env.RANK.put(uk, String(now)) }
      const hours = Math.max(0, (now - first) / 3600000);
      if (score > PACE[b](hours)) return json({ error: 'too fast' }, 422);
      const list = await load(env, b), i = list.findIndex(r => r.id === id);
      if (i >= 0) { if (list[i].score >= score) list[i].name = name; else list.splice(i, 1, { id, name, score, t: now }) }
      else list.push({ id, name, score, t: now });
      list.sort((a, b2) => b2.score - a.score || a.t - b2.t);
      const kept = list.slice(0, KEEP); await env.RANK.put('b:' + b, JSON.stringify(kept));
      return json({ ok: true, rank: kept.findIndex(r => r.id === id) + 1 });
    }
    return json({ error: 'not found' }, 404);
  }
};
