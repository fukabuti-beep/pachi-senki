// ランキング: ゲーム側(97t)とサーバー見本(server/ranking-worker.js)をつないで確かめる(fetch をメモリ上のサーバーへ)
const fs = require('fs'), path = require('path');
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
(async () => {
  const src = fs.readFileSync(path.join(__dirname, '../server/ranking-worker.js'), 'utf8');
  const W = (await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'))).default; const kv = new Map();
  const env = { RANK: { get: async k => kv.has(k) ? kv.get(k) : null, put: async (k, v) => { kv.set(k, v) } } };
  let down = false, calls = 0;
  const fetch = async (url, opt = {}) => { calls++; if (down) throw new Error('offline'); const r = await W.fetch(new Request(url, { method: opt.method || 'GET', headers: opt.headers, body: opt.body }), env); const t = await r.text(); return { ok: r.ok, status: r.status, json: async () => JSON.parse(t) } };
  const flush = async () => { for (let i = 0; i < 20; i++) await new Promise(r => setImmediate(r)) };
  const g = createGame({ seed: 1, globals: { PACHI_RANK_API: 'https://rank.example', fetch, AbortController: globalThis.AbortController } }); g.start(); g.advance(1);
  ok(g.eval('rkProvider()') === 'api', '接続先が有効にならない');
  g.eval('RK.name="テスト";X.best=Math.max(X.best,33);rkCheck()'); ok(g.eval('RK.pend.stage') === 33, '自己ベストが送信待ちにならない');
  g.eval('RK.last=-999;rkUpd()'); await flush();
  ok(JSON.parse(kv.get('b:stage') || '[]').some(r => r.name === 'テスト' && r.score === 33), 'サーバーに届かない');
  ok(g.eval('RK.me.stage&&RK.me.stage.rank') === 1, '送信結果の順位: ' + g.eval('JSON.stringify(RK.me)'));
  // 他のプレイヤーが上に → 一覧と自分の順位
  await W.fetch(new Request('https://rank.example/submit', { method: 'POST', body: JSON.stringify({ board: 'stage', score: 50, name: 'ライバル', id: 'zzzzzzzz9' }) }), env);
  g.eval('rkFetch("stage")'); await flush();
  ok(g.eval('RK.top.stage.length') === 2 && g.eval('RK.top.stage[0].name') === 'ライバル', '一覧: ' + g.eval('JSON.stringify(RK.top.stage)'));
  ok(g.eval('RK.me.stage.rank') === 2, '自分の順位: ' + g.eval('JSON.stringify(RK.me.stage)'));
  g.eval('fxTab=FM.findIndex(m=>m.n==="ランキング");fxMenu()'); const html = g.eval("$('fxmc').innerHTML");
  ok(/あなた: <b>2位/.test(html) && /rkmine/.test(html), '画面に自分の順位/自分の行: ' + html.slice(0, 200));
  // 通信できない時: 失敗を表示・送信は間をあけて再試行・ゲームは止まらない
  down = true; g.eval('rkFetch("chain")'); await flush(); ok(/読み込めません/.test(g.eval('RK.err')), '失敗の表示');
  g.eval('X.best=40;rkCheck();RK.last=-999;rkUpd()'); await flush(); ok(g.eval('RK.pend.stage') === 40 && g.eval('RK.wait') > 60, '失敗した送信を残して間をあける: ' + g.eval('RK.wait'));
  down = false; for (const k of [...kv.keys()]) if (k.startsWith('rl:')) kv.delete(k);   // 本物の KV は60秒で消える
  g.eval('RK.last=-9999;rkUpd()'); await flush(); ok(JSON.parse(kv.get('b:stage')).find(r => r.name === 'テスト').score === 40 && g.eval('RK.wait') === 60, '回復したら送れる');
  g.advance(5, .05); ok(g.eval('FERR') === 0, 'ゲームのエラー');
  // 接続先が無い時は通信しない
  const h = createGame({ seed: 2, globals: { fetch: () => { throw new Error('must not fetch') } } }); h.start(); h.advance(65, .05); ok(h.eval('rkProvider()') === '', '既定は通信しない');
  if (fails) { console.error(fails + ' rankclient failure(s)'); process.exit(1); }
  console.log('RANKCLIENT OK');
})();
