// ミニゲーム「宝玉かくし」(98yc、完全版のみ)と 追加の筐体テーマ
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL: ' + m) } };
const g = createGame({ seed: 31 }); g.start(); g.advance(1, .05); g.eval('if(fxOpen)fxClose()');
ok(g.eval("MGT.some(m=>m[0]==='shell'&&m[2]===45)"), 'ローテーションに入っている');
const play = (pickRight) => { g.eval('RL=null;G.roul=0;G.jp=0;cut=null;G.stage=60;spawn();mg2Start("shell")'); ok(g.eval('!!SHG') && g.eval('mg2e.style.display') === 'flex', '始まる');
  const ball = g.eval('SHG.ball'); for (let i = 0; i < 400 && g.eval('SHG&&SHG.ph<2'); i++) g.advance(.05, .05);
  ok(g.eval('SHG.ph') === 2 && g.eval('SHG.ball') === ball && g.eval('SHG.slot.slice().sort().join()') === '0,1,2', '混ぜても宝玉は同じ杯・杯は3つ');
  const gold0 = g.eval('G.gold'); const pos = g.eval('SHG.slot.indexOf(SHG.ball)');
  if (pickRight === 'auto') g.advance(4.5, .05); else g.eval('shChoose(' + (pickRight ? pos : (pos + 1) % 3) + ',0)');
  const win = g.eval('SHG.win'); g.advance(1.5, .05); const got = g.eval('G.gold') - gold0, base = g.eval('SHB()');
  g.advance(3, .05); ok(!g.eval('SHG') && g.eval('mg2e.style.display') === 'none', '終わると閉じる'); return { win, got, base }; };
let r = play(true); ok(r.win === 1 && r.got > r.base * 5, '当てると x6: ' + (r.got / r.base).toFixed(2));
r = play(false); ok(r.win === 0 && r.got > 0 && r.got < r.base * 2.5, 'はずれても x1 はもらえる: ' + (r.got / r.base).toFixed(2));
r = play('auto'); ok(r.got > 0, '放置でも自動で決着');
g.eval('RL=null;G.roul=0;G.jp=0;cut=null;G.stage=60;spawn();mg2Start("shell")'); g.advance(.5, .05); g.eval('presDo()'); g.advance(.2, .05); ok(!g.eval('SHG'), '転生で打ち切り');
ok(g.eval('FERR') === 0, '例外なし: ' + g.eval('FERR'));
// 筐体テーマ
ok(g.eval('GSC.cab.L.length') === 7 && g.eval('GSC.cab.L[5][0]') === '星空', 'テーマが7つ');
g.eval('RES.gem=200'); ok(g.eval('gsBuyC("cab",5)') !== false && g.eval('GS.own.cab.indexOf(5)>=0'), '星空を買える');
const g2 = createGame({ seed: 32, storage: g.store }); ok(g2.eval('GS.own.cab.indexOf(5)>=0'), '読み直しても持っている');
const css = require('fs').readFileSync(require('path').join(__dirname, '../src/css/39-gemshop.css'), 'utf8'); ok(/body\.gsc5\{/.test(css) && /body\.gsc6\{/.test(css), 'テーマの CSS');
// 体験版には入らない(テーマは入る)
const f = createGame({ seed: 33, globals: { PACHI_EDITION: 'free' } }); f.start();
ok(f.eval('typeof shStart') === 'undefined' && !f.eval("MGT.some(m=>m[0]==='shell')") && f.eval('GSC.cab.L.length') === 7, '体験版の中身');
console.log(fails ? fails + ' shell failure(s)' : 'SHELL OK'); process.exit(fails ? 1 : 0);
