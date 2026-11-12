// 物語の最終章とエンディング(98y、完全版のみ): STAGE 200 の撃破 → 最終章 f1 → エンディング → 2周目へ / ごほうびは初回だけ / 体験版には入らない
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL: ' + m) } };
const g = createGame({ seed: 7 }); g.start(); g.advance(1, .05);
const calm = 'if(fxOpen)fxClose();RL=null;G.roul=0;G.jp=0;cut=null;PUSH=null;if(typeof HEV!=="undefined")HEV.jr=null;if(typeof AR!=="undefined"){AR.title=null;AR.pend=null;AR.boom=null}';
ok(g.eval('scnOf("f1")&&scnOf("f1").L.length>=5'), '最終章のシーンがある');
// 魔王を倒す(STAGE 200 のボス)
g.eval(calm + 'TS.s.b6=1;TS.s.a7=1;G.stage=200;X.best=200;spawn();G.hp=0;kill()');
ok(g.eval('STY.q.indexOf("b7")>=0||(STY.cur&&STY.cur.id==="b7")'), 'STAGE 200 で虚無の王の撃破シーン');
// 会話を進める(タップで早送り)
for (let i = 0; i < 80 && !g.eval('TS.s.f1&&!STY.cur&&!STY.q.length'); i++) { g.eval(calm + 'if(STY.cur)styTap()'); g.advance(.5, .05); }
ok(g.eval('TS.s.b7===1&&TS.s.f1===1'), 'b7 のあとに最終章 f1 が流れる');
const gem0 = g.eval('RES.gem');
for (let i = 0; i < 20 && !g.eval('!!END.on'); i++) { g.eval(calm); g.advance(.5, .05); }
ok(g.eval('!!END.on') && g.eval('$("edg").style.display') === 'block', 'エンディングが出る');
ok(g.eval('RES.gem') - gem0 >= 10, '初回のごほうび 宝石10: ' + (g.eval('RES.gem') - gem0));
ok(g.eval('JSON.parse(localStorage.getItem("pachi2_end")).n') === 1, '見た回数を保存');
ok(/ホムラ/.test(g.eval('$("edgr").innerHTML')) && /終焉の虚空/.test(g.eval('$("edgr").innerHTML')), 'スタッフロールに英雄と8つの土地');
g.eval('END.on.fast=4'); g.advance(30, .05);
ok(g.eval('$("edgb").style.display') === 'block', '最後に「2周目へ」ボタン');
g.eval('endClose()'); ok(!g.eval('END.on') && g.eval('$("edg").style.display') === 'none', '2周目へ で閉じる');
ok(g.eval('G.stage') >= 201, 'ゲームは2周目に進んでいる: ' + g.eval('G.stage'));
g.advance(5, .05); ok(!g.eval('END.on'), '2回目は自動では出ない');
ok(g.eval('FERR') === 0, '例外なし: ' + g.eval('FERR'));
// 体験版には入らない
const f = createGame({ seed: 8, globals: { PACHI_EDITION: 'free' } }); f.start();
ok(f.eval('typeof endOpen') === 'undefined' && !f.eval('scnOf("f1")'), '体験版に最終章が入っている');
console.log(fails ? fails + ' finale failure(s)' : 'FINALE OK'); process.exit(fails ? 1 : 0);
