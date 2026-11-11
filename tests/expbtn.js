// 遠征ボタン(98j): 操作パネルにある・押すと遠征タブが開く・状態の札(GO/残り時間/!)
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
(async () => {
  const g = createGame({ seed: 1 }); g.start(); g.advance(1);
  ok(g.eval('!!document.getElementById("expb")'), 'ボタンが無い');
  g.eval('fxClose&&fxClose();expBtnOpen()');
  ok(g.eval('fxOpen') === true && g.eval('FM[fxTab].n') === '遠征', '押しても遠征タブが開かない: ' + g.eval('FM[fxTab]&&FM[fxTab].n'));
  g.eval('fxClose&&fxClose()');
  g.eval('EXB.last="";expBtnUpd()'); ok(g.eval('EXB.lb.textContent') === 'GO', '出発前は GO: ' + g.eval('EXB.lb.textContent'));
  g.eval('expGo(0);EXB.last="";expBtnUpd()'); ok(/^\d+m$/.test(g.eval('EXB.lb.textContent')), '遠征中は残り時間: ' + g.eval('EXB.lb.textContent'));
  g.eval('EXP.t0-=1801*1000;EXB.last="";expBtnUpd()'); ok(g.eval('EXB.lb.textContent') === '!', '帰還は !: ' + g.eval('EXB.lb.textContent'));
  g.advance(30, .1); ok(true, 'update ok');
  if (fails) { console.error(fails + ' expbtn failure(s)'); process.exit(1); }
  console.log('EXPBTN OK');
})();
