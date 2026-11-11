// ランキングサーバー見本(server/ranking-worker.js)を、KV の代わりのメモリで動かして確かめる
const fs = require('fs'), path = require('path');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
(async () => {
  const src = fs.readFileSync(path.join(__dirname, '../server/ranking-worker.js'), 'utf8');
  const mod = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
  const W = mod.default; const kv = new Map();
  const env = { RANK: { get: async k => kv.has(k) ? kv.get(k) : null, put: async (k, v) => { kv.set(k, v) } } };
  const call = async (method, p, body) => { const r = await W.fetch(new Request('https://x.dev' + p, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }), env); return { s: r.status, j: await r.json().catch(() => null) } };
  const clearRl = () => { for (const k of [...kv.keys()]) if (k.startsWith('rl:')) kv.delete(k) };
  let r = await call('POST', '/submit', { board: 'stage', score: 50, name: 'あいう', id: 'aaaaaaaa1' }); ok(r.s === 200 && r.j.rank === 1, '送信: ' + JSON.stringify(r));
  r = await call('POST', '/submit', { board: 'stage', score: 60, name: 'あいう', id: 'aaaaaaaa1' }); ok(r.s === 429, '連打は 429');
  clearRl(); r = await call('POST', '/submit', { board: 'stage', score: 70, name: 'べつ<b>', id: 'bbbbbbbb2' }); ok(r.s === 200 && r.j.rank === 1, '2人目が1位');
  r = await call('GET', '/top?board=stage'); ok(r.j.length === 2 && r.j[0].name === 'べつb' && r.j[1].score === 50, '上位と名前の掃除: ' + JSON.stringify(r.j));
  r = await call('GET', '/me?board=stage&id=aaaaaaaa1'); ok(r.j.rank === 2 && r.j.score === 50, '自分の順位: ' + JSON.stringify(r.j));
  clearRl(); r = await call('POST', '/submit', { board: 'stage', score: 40, name: 'あいう2', id: 'aaaaaaaa1' }); ok(r.s === 200 && (await call('GET', '/me?board=stage&id=aaaaaaaa1')).j.score === 50, '低い記録で自己ベストは下がらない');
  clearRl(); r = await call('POST', '/submit', { board: 'stage', score: 1500, name: 'ずる', id: 'cccccccc3' }); ok(r.s === 422, '始めたばかりで STAGE1500 は弾く: ' + r.s);
  kv.set('u:cccccccc3', String(Date.now() - 20 * 3600000)); clearRl(); r = await call('POST', '/submit', { board: 'stage', score: 1500, name: 'ながい', id: 'cccccccc3' }); ok(r.s === 200, '20時間後なら通る: ' + r.s);
  for (const bad of [{ board: 'x', score: 1, name: 'a', id: 'dddddddd4' }, { board: 'stage', score: -1, name: 'a', id: 'dddddddd4' }, { board: 'stage', score: 5, name: '', id: 'dddddddd4' }, { board: 'stage', score: 5, name: 'a', id: 'BAD!' }]) { clearRl(); r = await call('POST', '/submit', bad); ok(r.s === 400, '不正な送信は 400: ' + JSON.stringify(bad)) }
  ok((await call('GET', '/top?board=nope')).s === 400 && (await call('GET', '/nope')).s === 404, 'ボード/パスの誤り');
  if (fails) { console.error(fails + ' rankserver failure(s)'); process.exit(1); }
  console.log('RANKSERVER OK');
})();
