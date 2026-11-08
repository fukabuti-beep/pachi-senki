// パチ戦記 オンラインランキング用サーバーの見本(Cloudflare Workers + KV)。手順は ONLINE.md。
// エンドポイント: POST /submit {board,score,name,id} / GET /top?board=stage
// 各ボードの上位100件を KV に保存(1プレイヤー1件=自己ベストのみ)。簡易な値の検証とレート制限つき。
// ※ ブラウザゲームのスコアは改ざん可能。上位の明らかな異常値は管理者が KV から削除する運用を想定。
const BOARDS = { stage: 2000, chain: 999, score: 99999, hits: 1e9 };   // ボードと上限値
const KEEP = 100;
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...cors } });
const clean = s => String(s || '').replace(/[<>&"'`\\\u0000-\u001f]/g, '').trim().slice(0, 10);
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method === 'GET' && url.pathname === '/top') {
      const b = url.searchParams.get('board'); if (!BOARDS[b]) return json({ error: 'board' }, 400);
      const list = JSON.parse((await env.RANK.get('b:' + b)) || '[]');
      return json(list.slice(0, 20).map(r => ({ name: r.name, score: r.score })));
    }
    if (req.method === 'POST' && url.pathname === '/submit') {
      let d; try { d = await req.json() } catch { return json({ error: 'json' }, 400) }
      const b = d.board, score = Math.floor(+d.score), name = clean(d.name), id = String(d.id || '');
      if (!BOARDS[b] || !Number.isFinite(score) || score <= 0 || score > BOARDS[b] || !name || !/^[a-z0-9]{8,32}$/.test(id)) return json({ error: 'invalid' }, 400);
      const rl = 'rl:' + id; if (await env.RANK.get(rl)) return json({ error: 'slow down' }, 429);
      await env.RANK.put(rl, '1', { expirationTtl: 60 });
      const key = 'b:' + b, list = JSON.parse((await env.RANK.get(key)) || '[]');
      const i = list.findIndex(r => r.id === id);
      if (i >= 0) { if (list[i].score >= score) { list[i].name = name; } else list.splice(i, 1, { id, name, score, t: Date.now() }) }
      else list.push({ id, name, score, t: Date.now() });
      list.sort((a, b2) => b2.score - a.score || a.t - b2.t);
      await env.RANK.put(key, JSON.stringify(list.slice(0, KEEP)));
      return json({ ok: true, rank: list.findIndex(r => r.id === id) + 1 });
    }
    return json({ error: 'not found' }, 404);
  }
};
