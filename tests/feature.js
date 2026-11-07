// feature 担当の不変条件テスト: セーブ互換 / オフライン上限 / NaN無し / 実績 / 転生 / ミニゲーム / 仲間
// 実行: node tests/feature.js
const { createGame } = require('../tools/harness');
let failures = 0;
const ok = (c, msg) => { if (!c) { failures++; console.error('FAIL: ' + msg); } };
const fin = (v) => Number.isFinite(v);
const H = 3600 * 1000;
const mkStore = (x, g) => { const s = {}; if (g) s.pachi2 = JSON.stringify(g); if (x !== undefined) s.pachi2x = typeof x === 'string' ? x : JSON.stringify(x); return s; };
const noErr = (g, name) => ok(g.eval('FERR') === 0, name + ': feature hook threw (FERR=' + g.eval('FERR') + ')');

// 1) 旧セーブ {gold,stage,lv} だけで起動できる
{
  const g = createGame({ seed: 1, storage: mkStore(undefined, { gold: 100, stage: 7, lv: [2, 2] }) });
  g.start(); g.advance(10, 0.05);
  ok(g.eval('G.stage') >= 7, 'old save: stage kept');
  ok(g.eval('X.best') >= 7, 'old save: best initialised from stage');
  ok(g.eval('X.souls') === 0 && g.eval('X.pres') === 0, 'old save: meta defaults');
  noErr(g, 'old save');
  ok(JSON.parse(g.store.pachi2).lv.length === 10, 'pachi2 still {gold,stage,lv}');
  ok(Object.keys(JSON.parse(g.store.pachi2)).sort().join() === 'gold,lv,stage', 'pachi2 format untouched');
}

// 2) 壊れた/悪意あるメタセーブでも NaN/例外なし
for (const bad of ['{bad json', 'null', '[]', '"x"', JSON.stringify({ t: 'x', souls: -5, pres: 'a', best: Infinity, gps: NaN, ach: 5, st: { hit: 'q' } }), '{"t":1e999,"souls":1e999}']) {
  const g = createGame({ seed: 2, storage: mkStore(bad) });
  g.start(); g.advance(3, 0.05);
  const x = g.eval('X');
  ok(fin(x.t) && fin(x.souls) && fin(x.pres) && fin(x.best) && fin(x.gps) && x.souls >= 0 && x.best >= 1, 'normX sanitises: ' + bad);
  ok(fin(g.eval('G.gold')), 'gold finite with bad meta');
  noErr(g, 'bad meta');
}

// 3) オフライン計算
{
  const calc = (awayH, gps = 100) => {
    const g = createGame({ seed: 3, storage: mkStore({ t: Date.now() - awayH * H, gps, best: 1 }, { gold: 0, stage: 5, lv: [] }) });
    g.eval('G.gold=0');
    const before = g.eval('G.gold');
    g.start();
    return { g, gain: g.eval('G.gold') - before, dlg: g.eval('OFFD') };
  };
  const a1 = calc(1), a8 = calc(8), a100 = calc(24 * 100), none = calc(0.001), fut = calc(-5);
  ok(a1.gain > 0 && fin(a1.gain), 'offline: 1h gives gold');
  ok(a8.gain > a1.gain, 'offline: 8h > 1h');
  ok(a100.gain === a8.gain, 'offline: capped at 8h (' + a100.gain + ' vs ' + a8.gain + ')');
  const maxByRate = 100 * 0.5 * (7200 + (28800 - 7200) * 0.5);
  ok(a100.gain <= maxByRate + 1, 'offline: gain <= rate*eff*effective seconds');
  ok(none.gain === 0 && none.dlg === null, 'offline: <60s gives nothing');
  ok(fut.gain === 0, 'offline: clock in the future gives nothing');
  ok(a1.dlg && a1.dlg.g === a1.gain, 'offline: dialog opened with the granted amount');
  a1.g.advance(10, 0.05);
  ok(a1.g.eval('OFFD') === null, 'offline: dialog auto closes');
  ok(a1.g.eval('G.gold') >= a1.gain && fin(a1.g.eval('G.gold')), 'offline: gold kept and finite');
  noErr(a1.g, 'offline');
  // gps が無い(初回/旧セーブ)でも有限
  const g0 = createGame({ seed: 3, storage: mkStore({ t: Date.now() - 5 * H }, { gold: 0, stage: 20, lv: [] }) });
  g0.start(); ok(fin(g0.eval('G.gold')) && g0.eval('G.gold') > 0, 'offline: fallback rate works without gps');
  // 二重付与なし: 保存後に再起動しても直近の時刻なので 0
  const g2 = createGame({ seed: 3, storage: g0.store });
  const gold2 = g2.eval('G.gold'); g2.start();
  ok(g2.eval('G.gold') === gold2, 'offline: no double grant after restart');
}

if (failures) { console.error('\n' + failures + ' feature test failure(s)'); process.exit(1); }
console.log('FEATURE OK');
