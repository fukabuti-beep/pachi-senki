// 物語・ガイド・エンディングの間はゲームを止める(98p)。harness の既定は無効なので、ここでは PACHI_NOPAUSE=0 で有効にして確かめる
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL: ' + m) } };
const seen = {}; 'a0 a1 a2 a3 a4 a5 a6 a7 b0 b1 b2 b3 b4 b5 b6 jp p1 j4'.split(' ').forEach(k => seen[k] = 1);
const tut = (s, g) => ({ pachi2_tut: JSON.stringify({ v: 1, s, g: g || {}, skip: 1, off: 1, old: 1 }) });
const calm = 'if(fxOpen)fxClose();RL=null;G.roul=0;G.jp=0;cut=null;PUSH=null;if(typeof HEV!=="undefined")HEV.jr=null;if(typeof AR!=="undefined"){AR.title=null;AR.pend=null;AR.boom=null}';
// 1) 会話シーン: 出ている間は止まり、終わると動く
{ const s = Object.assign({}, seen); delete s.b0; const g = createGame({ seed: 41, storage: tut(s), globals: { PACHI_NOPAUSE: 0 } }); g.start(); g.advance(2, .05); g.eval(calm);
  ok(!g.eval('pzOn()'), '何も出ていなければ動く'); const hp0 = g.eval('G.hp'); g.advance(2, .05); ok(g.eval('G.hp') < hp0 || g.eval('G.stage') > 1, 'ふだんは戦闘が進む');
  g.eval(calm + 'styQueue("b0")'); for (let i = 0; i < 60 && !g.eval('pzOn()'); i++) { g.eval(calm); g.advance(.1, .05); }
  ok(g.eval('pzOn()') && g.eval('!!STY.cur'), '会話が出たら止まる');
  const st = g.eval('JSON.stringify([G.hp,G.stage,G.gold,balls.length,G.sp])'); g.advance(1.5, .05);
  ok(g.eval('JSON.stringify([G.hp,G.stage,G.gold,balls.length,G.sp])') === st, '会話中はゲームが進まない');
  ok(g.eval('STY.cur&&STY.cur.t>0'), '会話そのものは進む');
  for (let i = 0; i < 400 && g.eval('!!STY.cur'); i++) g.advance(.1, .05);
  ok(!g.eval('STY.cur') && !g.eval('pzOn()'), '会話は自動で終わり、ゲームに戻る'); const g1 = g.eval('G.gold') + g.eval('G.stage') * 1e9; g.eval(calm); g.advance(20, .05);
  ok(g.eval('G.gold') + g.eval('G.stage') * 1e9 !== g1 || g.eval('balls.length') > 0, '終わったら また進む');
  // メニューを開くと会話は隠れて、止めるのも解ける
  g.eval(calm + 'TS.s.b1=0;styQueue("b1")'); for (let i = 0; i < 60 && !g.eval('pzOn()'); i++) { g.eval(calm); g.advance(.1, .05); }
  g.eval('fxMenu()'); g.advance(.2, .05); ok(!g.eval('pzOn()'), 'メニュー中は止めない'); g.eval('fxClose()'); ok(g.eval('FERR') === 0, '例外なし'); }
// 2) ガイド(チュートリアル): 出ている間は止まる
{ const g = createGame({ seed: 42, globals: { PACHI_NOPAUSE: 0 } }); g.start(); g.advance(1, .05); g.eval('if(fxOpen)fxClose()');   // ログインボーナスの画面を閉じる
  for (let i = 0; i < 900 && !g.eval('!!(TUT.cur&&TUT.el&&TUT.el.style.display==="block")'); i++) { g.eval('if(fxOpen)fxClose()'); g.advance(.1, .05); }   // ログボの画面を閉じる → 旅立ちの会話(止まる)→ そのあとガイド
  ok(g.eval('!!TUT.cur') && g.eval('pzOn()'), 'ガイドが出たら止まる'); const b0 = g.eval('JSON.stringify([G.hp,balls.length])'); g.advance(1, .05); ok(g.eval('JSON.stringify([G.hp,balls.length])') === b0, 'ガイド中は進まない');
  g.eval('tutSkip()'); g.advance(.2, .05); ok(!g.eval('pzOn()'), 'スキップで戻る'); }
// 3) エンディング: 止まって、曲が切り替わり、閉じると戻る
{ const s = Object.assign({ b7: 1, f1: 1 }, seen); const g = createGame({ seed: 43, storage: tut(s), globals: { PACHI_NOPAUSE: 0 } }); g.start(); g.advance(1, .05); g.eval(calm + 'X.best=205;G.stage=205;spawn()');
  for (let i = 0; i < 80 && !g.eval('!!END.on'); i++) { g.eval(calm); g.advance(.1, .05); }
  ok(g.eval('!!END.on') && g.eval('pzOn()'), 'エンディング中は止まる'); ok(g.eval('bgmState()') === 'tt', 'エンディングの曲に切り替わる');
  const st = g.eval('JSON.stringify([G.hp,G.stage,G.gold])'), t0 = g.eval('END.on.t'); g.advance(2, .05); ok(g.eval('JSON.stringify([G.hp,G.stage,G.gold])') === st && g.eval('END.on.t') > t0, 'ゲームは止まり、エンディングは進む');
  g.eval('endClose()'); g.advance(.2, .05); ok(!g.eval('pzOn()') && g.eval('bgmState()') !== 'tt', '閉じるとゲームと曲が戻る'); }
// 4) 既定(テスト用の無効化)では止まらない
{ const g = createGame({ seed: 44 }); g.start(); ok(g.eval('PZ.off') === 1 && !g.eval('pzOn()'), 'PACHI_NOPAUSE で無効'); }
console.log(fails ? fails + ' pause failure(s)' : 'PAUSE OK'); process.exit(fails ? 1 : 0);
