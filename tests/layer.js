// 演出の交通整理(89c-layer)のテスト: バナーの優先度/位置、ミニゲームの待機、RUSHリザルトとカットイン、ボーナス帯の退避、ミニルーレットの位置、上限
// 実行: node tests/layer.js
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const idle = 'G.jp=0;G.roul=0;RL=null;PUSH=null;cut=null;HEV.jr=null;HEV.mr=null;HEV.mq.length=0;JPX.p=null;MG=null;MG2=null;if(typeof HL!=="undefined")HL=null;GK.rr=null;GK.rs=null;LY.bnQ.length=0;LY.bnHot=-9;';

// (a) バナー: 熱いバナーの直後の普通のバナーは待つ / 熱いバナー同士は即上書き / パネルが開いている時は上へ
{
  const g = createGame({ seed: 3 }); g.start(); g.advance(1);
  ok(g.eval('LY.init') === 1, '起動後に lyInit されていない');
  g.eval(idle + "banner('激アツ!!','#ff2244');banner('FEVER TIME!!','#22e0ff')");
  ok(g.eval("$('bn').textContent") === '激アツ!!', '普通のバナーが熱いバナーを上書きした: ' + g.eval("$('bn').textContent"));
  ok(g.eval('LY.bnQ.length') === 1, '普通のバナーが待ち行列に入らない');
  g.advance(1.2);
  ok(g.eval("$('bn').textContent") === 'FEVER TIME!!', '待たせたバナーが後で出ない: ' + g.eval("$('bn').textContent"));
  g.eval("banner('擬似連 ×2','#33dd66');banner('擬似連 ×3','#ff2244')");
  ok(g.eval("$('bn').textContent") === '擬似連 ×3', '熱いバナー同士が即時に切り替わらない');
  for (let i = 0; i < 10; i++) g.eval("banner('RARE DROP!!','#ffd400')");
  ok(g.eval('LY.bnQ.length') <= 2, 'バナーの待ち行列が上限を超える: ' + g.eval('LY.bnQ.length'));
  g.advance(6); ok(g.eval('LY.bnQ.length') === 0, 'バナーの待ち行列が残る');
  // パネル(全画面ルーレット)が開いている時は .bup + top を指定、閉じたら戻す
  g.eval("$('rl').style.display='flex';banner('超倍率 x777!!','#ffd400')");
  ok(/\bbup\b/.test(g.eval("$('bn').className")) && /px$/.test(g.eval("$('bn').style.top")), 'パネル中のバナーが上へ移らない: ' + g.eval("$('bn').className+' '+$('bn').style.top"));
  g.eval("$('rl').style.display='none';banner('大当たり!!','#ff2d7a')");
  ok(!/bup/.test(g.eval("$('bn').className")) && g.eval("$('bn').style.top") === '', 'パネルを閉じてもバナーが戻らない');
  console.log('バナー: OK');
}

// (b) ミニゲーム: JACKPOT/押せ!!/ルーレット中は待って、終わってから1回だけ始まる
{
  const g = createGame({ seed: 5 }); g.start(); g.advance(1);
  g.eval(idle + 'G.stage=5;X.mgi=0;var __mg0=X.st.mg;G.jp=3;mini()');
  ok(g.eval('!MG&&!MG2') && g.eval('LY.miniQ') === 1, 'JACKPOT 中にミニゲームが始まった/予約されない');
  g.eval('mini()'); ok(g.eval('X.st.mg') === g.eval('__mg0'), '待機中に回数が数えられた');
  g.eval('G.jp=0;JPX.p=null'); g.advance(.3);
  ok(g.eval('!!(MG||MG2)'), 'JACKPOT 後に待たせたミニゲームが始まらない');
  ok(g.eval('X.st.mg') === g.eval('__mg0') + 1, 'ミニゲームの回数が変わった: ' + (g.eval('X.st.mg') - g.eval('__mg0')));
  g.advance(10);
  g.eval(idle + 'G.stage=5;X.mgi=0;RL={t:0,ph:0,a:0,a1:1,k:0,m:2,base:1,kick:0,last:-1};mini()');
  ok(g.eval('!MG&&!MG2'), 'ルーレット中にミニゲームが始まった');
  g.eval('RL=null;$("rl").style.display="none"'); g.advance(.3); ok(g.eval('!!(MG||MG2)'), 'ルーレット後に始まらない');
  // 転生で予約は破棄
  g.advance(10); g.eval(idle + 'G.jp=3;mini();PGEN++;G.jp=0;JPX.p=null'); g.advance(.3);
  ok(g.eval('!MG&&!MG2&&LY.miniQ===0'), '転生後に古い予約のミニゲームが始まった');
  console.log('ミニゲームの待機: OK');
}

// (c) RUSHリザルト: カットイン中はかくし(数え中)、数え終わっていたら下げる。NEXT はリザルトの上に描く
{
  const g = createGame({ seed: 7 }); g.start(); g.advance(1);
  const RR = "GK.rr={t0:T,n:4,g:1234,k:5,jp:0,rec:0};GK.rr.sc=gkScore(GK.rr);GK.rr.gr=gkGrade(GK.rr.sc)[0];";
  g.eval(idle + 'G.rush=0;' + RR + "cut={t0:T,h:0,txt:'x',c:'#fff',cb:null,f:0}");
  g.advance(.05); ok(g.eval('!!GK.rr') && g.eval('LY.rrHide') === 1, '数え中のリザルトがカットインで隠れない/消えた');
  g.eval('cut=null'); g.advance(.05); ok(g.eval('LY.rrHide') === 0 && g.eval('!!GK.rr'), 'カットイン後にリザルトが戻らない');
  g.eval(idle + 'G.rush=0;' + RR + "GK.rr.t0=T-2;cut={t0:T,h:0,txt:'x',c:'#fff',cb:null,f:0}"); g.advance(.05);
  ok(g.eval('!GK.rr'), '数え終わったリザルトがカットインで下がらない');
  // 描画順: リザルトと NEXT が同時なら NEXT(GK.pop)が最後に描かれる
  g.eval(idle + 'cut=null;G.rush=0;' + RR + "GK.rr.t0=T-.5;gkPop('NEXT ×3','#ff2244',1);var __tx=[];(function(){const o=gkTxtR;gkTxtR=function(t){__tx.push(String(t));return o.apply(this,arguments)}})();gkDraw(T)");
  const tx = g.eval('__tx');
  ok(tx.length > 1 && tx[tx.length - 1] === 'NEXT ×3', 'NEXT がリザルトより上に描かれない: ' + tx.slice(-3).join(','));
  ok(g.eval('!!GK.rr') && g.eval('!!GK.pop'), '描画の入れ替えで状態が消えた');
  console.log('RUSHリザルト: OK');
}

// (d) ボーナスタイムの帯: カットイン/JACKPOT 中は描かない、終われば描く。ミニルーレット中は左上角+コンボ/敵名を右へ
{
  const g = createGame({ seed: 9 }); g.start(); g.advance(1);
  g.eval(idle + "btStart(0);var __bt=0;(function(){const o=thickTxt;thickTxt=function(c,t){if(/黄金タイム/.test(String(t)))__bt++;return o.apply(this,arguments)}})()");
  g.advance(.5); ok(g.eval('__bt') > 0, 'ボーナス帯が描かれない');
  g.eval("__bt=0;cut={t0:T,h:0,txt:'x',c:'#fff',cb:null,f:0}"); g.advance(.4); g.eval('__bt=0'); g.advance(.3);
  ok(g.eval('__bt') === 0, 'カットイン中にボーナス帯が描かれた');
  g.eval('cut=null;G.jp=0'); g.advance(.6); ok(g.eval('__bt') > 0, 'カットイン後にボーナス帯が戻らない');
  g.eval(idle + 'miniRoul(100)'); g.advance(.5);
  ok(g.eval('LY.ox') > 40 && g.eval('lyNameX()') > 40, 'ミニルーレット中にコンボ/敵名がずれない: ' + g.eval('LY.ox'));
  g.advance(4); ok(g.eval('!HEV.mr') && g.eval('LY.ox') < 1, 'ミニルーレット後に位置が戻らない');
  console.log('ボーナス帯/ミニルーレット: OK');
}

// (e) 長時間: 演出を重ねて呼んでも例外なし・上限を守る・ピーク演出(衝撃リング)が出る
{
  const g = createGame({ seed: 13 }); g.start();
  g.eval('var __imp=0;(function(){const o=lyImpact;lyImpact=function(){__imp++;return o.apply(this,arguments)}})()');
  let maxImp = 0, maxQ = 0;
  for (let s = 0; s < 6 * 60; s++) {
    if (s % 23 === 5) g.eval('try{bigHit(Math.random()<.3)}catch(e){}');
    if (s % 31 === 11) g.eval('try{mini()}catch(e){}');
    if (s % 47 === 20) g.eval('try{btStart()}catch(e){}');
    if (s % 37 === 3) g.eval("try{$('app').classList.add('upo');banner('擬似連 ×2','#3d6')}catch(e){}");
    g.advance(1);
    maxImp = Math.max(maxImp, g.eval('LY.imp.length')); maxQ = Math.max(maxQ, g.eval('LY.bnQ.length'));
  }
  ok(maxImp <= 6, '衝撃リングの上限超過: ' + maxImp);
  ok(maxQ <= 2, 'バナー待ち行列の上限超過: ' + maxQ);
  ok(g.eval('__imp') > 0, 'ピーク演出(衝撃リング)が一度も出ない');
  ok(Number.isFinite(g.eval('LY.ox')), 'LY.ox が NaN');
  console.log('長時間: OK (impact=' + g.eval('__imp') + ')');
}

if (bad) { console.error(bad + ' failure(s)'); process.exit(1) }
console.log('layer: all OK');
