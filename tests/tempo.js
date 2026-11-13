// テンポと後半の作り(98q ミニゲームの札 / 98r 転生の演出 / 98z 塔の予約 / 94c 後半の敵の守り / 98o 作戦)
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL: ' + m) } };
const calm = 'if(fxOpen)fxClose();RL=null;G.roul=0;G.jp=0;cut=null;PUSH=null;if(typeof HEV!=="undefined")HEV.jr=null;';
// 1) ミニゲーム: いきなり始まらず札が出る。タップで始まる。放置は時間切れで おまかせ受け取り
{ const g = createGame({ seed: 3 }); g.start(); g.advance(1, .05); g.eval(calm + 'G.stage=12');
  g.eval('mini()'); ok(g.eval('MI.on') === 1 && !g.eval('!!(MG||MG2)'), '札が出るだけで ミニゲームは始まらない');
  g.eval(calm + 'miPlay()'); g.advance(.3, .05); ok(g.eval('!!(MG||MG2||(typeof HL!=="undefined"&&HL)||(typeof SHG!=="undefined"&&SHG))') && !g.eval('MI.on'), '札をタップで始まる');
  g.advance(12, .05); g.eval(calm + 'MG=null;if(MG2)mg2End();MI.on=0');
  const g0 = g.eval('G.gold=0;mini();0'); let k = 0; while (g.eval('MI.on') && k++ < 800) { g.eval(calm); g.advance(.05, .05); }
  ok(!g.eval('MI.on') && k > 300, '約' + g.eval('MIT') + '秒で札が消える(' + (k * .05).toFixed(0) + '秒)'); ok(!g.eval('!!(MG||MG2)'), '時間切れでは始まらない');
  g.eval('MI.on=0;mini();PGEN++'); g.advance(.2, .05); ok(!g.eval('MI.on'), '転生したら札は消える'); }
// 2) 無限の塔: 演出中でも受け付けて、終わったら始まる
{ const g = createGame({ seed: 4, storage: { pachi2x: JSON.stringify({ best: 60, souls: 0, pres: 0, st: {}, ach: {} }) } }); g.start(); g.advance(1, .05);
  g.eval(calm + 'G.jp=3;twStart(1)'); ok(!g.eval('TW.on') && g.eval('!!TW.q'), '演出中は予約になる');
  for (let i = 0; i < 200 && !g.eval('TW.on'); i++) g.advance(.1, .05);
  ok(g.eval('TW.on') === 1 && !g.eval('TW.q'), '演出が終わると塔が始まる'); g.eval('twEnd(0,1)');
  g.eval(calm + 'twStart(1)'); ok(g.eval('TW.on') === 1, '演出が無ければすぐ始まる'); }
// 3) 転生の演出: ボタン → 演出 → 途中で転生(テストの既定=待たない も確かめる)
{ const mk = nop => { const g = createGame({ seed: 5, storage: { pachi2: JSON.stringify({ v: 2, gold: 0, stage: 40, lv: [30, 5, 5, 30, 5, 5, 3, 3, 3, 3] }) }, globals: { PACHI_NOPAUSE: nop } }); g.start(); g.advance(1, .05); g.eval(calm); return g; };
  const a = mk(1); a.eval('presAnim()'); ok(a.eval('X.pres') === 1 && a.eval('G.stage') < 40, 'テストでは待たずに転生');
  const b = mk(0); b.eval('presAnim()'); ok(b.eval('X.pres') === 0 && b.eval('PRA.on') === 1, '演出が始まり、まだ転生していない');
  b.advance(2, .05); ok(b.eval('X.pres') === 1, '演出の途中で転生する'); b.advance(2, .05); ok(b.eval('PRA.on') === 0, '演出が終わる');
  const c = mk(0); c.eval('presAsk();fxBtn(0)'); ok(c.eval('PRA.on') === 1 && c.eval('X.pres') === 0, '確認画面の「転生する!」が演出を呼ぶ'); }
// 4) 後半の敵の守り: STAGE 60 までは変わらず、先は固くなる(雑魚にも)。体力は不変
{ const g = createGame({ seed: 6 }); g.start(); g.advance(1, .05);
  ok(g.eval('hvLateK(60)') === 1 && g.eval('hvLateK(30)') === 1 && g.eval('hvLateK(100)') > 5, '守りは STAGE 60 の先から: ' + g.eval('hvLateK(100).toFixed(1)'));
  const d = s => g.eval(calm + 'G.stage=' + s + ';spawn();G.hp=G.mx;(function(){const h=G.hp;hurt(G.mx*.001);return (h-G.hp)/(G.mx*.001)})()');
  const a = d(51), b = d(101); ok(b < a * .5 && b > 0, '同じ割合の攻撃でも STAGE 101 の方が効かない: ' + a.toFixed(2) + ' → ' + b.toFixed(3)); }
// 5) 作戦: 資源があると選択肢が並び、押す先の強化画面が実在する
{ const g = createGame({ seed: 7, storage: { pachi2: JSON.stringify({ v: 2, gold: 1e12, stage: 45, lv: [20, 5, 5, 20, 5, 5, 3, 3, 3, 3] }), pachi2_res: JSON.stringify({ ms: 900, gem: 40, w: [1, 1, 1] }) } }); g.start(); g.advance(1, .05);
  const L = JSON.parse(g.eval('JSON.stringify(glPlan())')); ok(L.length >= 3, '出来ることが並ぶ: ' + L.map(x => x[1]).join());
  ok(L.every(x => g.eval('UPG.list.some(u=>u[0]===' + JSON.stringify(x[3]) + ')')), '開く先の強化画面がある'); ok(g.eval("glMenu().indexOf('作戦')>0"), '目標タブに作戦'); }
console.log(fails ? fails + ' tempo failure(s)' : 'TEMPO OK'); process.exit(fails ? 1 : 0);
