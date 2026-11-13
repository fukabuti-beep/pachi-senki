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
// 6) 演出の動きの設定: 既定は ふつう(端末の設定に関係なく動く)。ひかえめ は保存されて読み直せる
{ const g = createGame({ seed: 8 }); g.start(); ok(g.eval('moLow()') === false, '既定は ふつう'); g.eval('moSet(1)'); ok(g.eval('moLow()') === true, 'ひかえめ にできる');
  const g2 = createGame({ seed: 8, storage: g.store }); ok(g2.eval('moLow()') === true, '読み直しても ひかえめ'); g2.eval('moSet(0)'); ok(g2.eval('moLow()') === false, 'ふつう に戻せる'); }
// 7) 攻撃エフェクト(84c)と追加の効果音(79d): つながっていること・上限・ゲームの乱数を使わないこと
{ const g = createGame({ seed: 9 }); g.start(); g.advance(3, .05);
  ok(g.eval("(function(){let n=0;const o=atkSwing;atkSwing=function(){n++;return o.apply(this,arguments)};HA[0]=T-.1;drawB(T);atkSwing=o;return n})()") >= 3, '振るエフェクトが戦闘の描画から呼ばれる');
  ok(g.eval("(function(){let n=0;const o=atkProj;atkProj=function(){n++;return o.apply(this,arguments)};PR.push({i:1,t:.1,d:0,cr:0});drawB(T);atkProj=o;PR.length=0;return n})()") >= 1, '飛ぶエフェクトが戦闘の描画から呼ばれる');
  g.eval('for(let i=0;i<40;i++)afxHit(i%4,i%2)'); ok(g.eval('AFX.length') <= 14, '当たりエフェクトの上限: ' + g.eval('AFX.length')); g.advance(1, .05); g.eval('drawB(T)'); ok(g.eval('AFX.every(f=>T-f.t0<.55)'), '当たりエフェクトは消える(残っているのは この1秒の新しい命中だけ)');
  g.eval("AFX.length=0;hurt(1,'#ffa070',0,0)"); ok(g.eval('AFX.length') === 1 && g.eval('AFX[0].i') === 0, '剣士の命中で斬り跡が出る');
  const n = g.eval("(function(){let c=0;const o=Math.random;Math.random=function(){c++;return o()};try{for(let i=0;i<4;i++){afxHit(i,1);seSwing(i);atkSwing(i%3,60,52,.05);atkSwing(i%3,60,52,.15);atkProj({i:i%3,t:.1},.5,150,80)}afxDraw(T);seUi('ok');seBuy()}finally{Math.random=o}return c})()");
  ok(n === 0, 'エフェクトと追加の効果音がゲームの乱数を使っている: ' + n);
  ok(g.eval("typeof seUi==='function'&&typeof seBuy==='function'&&typeof seSwing==='function'"), '追加の効果音がある'); }
// 8) ルーレットと押せ!!の音(79e): 登場・カウント・押下・回り始め・溜め・超倍率が鳴り、重ねていた古い音は鳴らない
{ const g = createGame({ seed: 10 }); g.start(); g.advance(1, .05);
  g.eval("var __s={};['phSnd','seAori','seDecide','seHy','seCount','seRoulStart','seRoulTame','seRoulSup','seMiniTick','seMiniRes'].forEach(n=>{const o=eval(n);eval(n+'=function(){const k=n+(n===\\'phSnd\\'||n===\\'seHy\\'?\\':\\'+arguments[0]:\\'\\');__s[k]=(__s[k]||0)+1;return o.apply(this,arguments)}')})");
  g.eval(calm + 'pushPrompt(()=>{},{ms:2400})'); g.advance(2, .05);
  const a = g.eval('JSON.stringify(__s)'); const s1 = JSON.parse(a);
  ok(s1['phSnd:in'] === 1 && s1.seAori === 1 && !s1['seHy:pop'], '押せ!!の登場は 熱さの音+煽り だけ: ' + a);
  ok(s1.seCount >= 2, 'カウントダウンの音: ' + s1.seCount);
  g.eval('pushPress(0)'); g.advance(.2, .05); const s2 = JSON.parse(g.eval('JSON.stringify(__s)'));
  ok(s2['phSnd:hit'] === 1 && s2.seDecide === 1 && !s2['seHy:wave'], '押下は 決定音+熱さの上乗せ だけ: ' + JSON.stringify(s2));
  g.advance(1.5, .05); g.eval(calm + 'G.rush=15;startRoul(10)'); g.advance(.1, .05); ok(g.eval('__s.seRoulStart') === 1, 'ルーレットの回り始めの音');
  g.eval('RL.sup=1;RL.t=99'); g.advance(.2, .05); g.eval('if(RL){RL.st=.85}'); g.advance(.2, .05); ok(g.eval('__s.seRoulTame') === 1, '超倍率の溜めの音');
  g.eval('if(RL){RL.st=1.95}'); g.advance(.2, .05); ok(g.eval('__s.seRoulSup') === 1, '超倍率の解放の音');
  g.eval('RL=null;G.roul=0;$("rl").style.display="none"'); }
console.log(fails ? fails + ' tempo failure(s)' : 'TEMPO OK'); process.exit(fails ? 1 : 0);
