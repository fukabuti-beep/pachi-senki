// 転生の再発防止: 演出の最中でも「転生する!」で必ず転生できる / 転生後に古い演出(setTimeout含む)の副作用が出ない
// / ループ内で例外が出ても次のフレームが止まらない
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const noErr = (g, tag) => { const s = g.eval('JSON.stringify([G.gold,G.stage,G.hp,G.mx])'); ok(!/null|NaN/.test(s), tag + ': NaN ' + s) };

// 演出を起こすコード / 起こしてから転生ボタンを押すまでの秒数
const SC = [
  ['回転中(当たり)', 'G.q=1;QL.length=0;QL.push({h:1,c:3});startSpin()', 1.5],
  ['777 カットイン中', 'bigHit(true)', .3],
  ['777 押せ!!中', 'bigHit(true)', 1.5],
  ['777 前置きアニメ中', 'HEV.jv=1;bigHit(true)', 4.3],
  ['JACKPOT 表示中', 'HEV.jv=0;bigHit(true)', 4.5],
  ['全画面ルーレット中', 'HEV.force="roul";bigHit(false)', 5],
  ['ルーレットの押せ!!中', 'HEV.force="roul";bigHit(false)', 1.5],
  ['ミニルーレット中', 'HEV.force="mini";bigHit(false)', 1.5],
  ['BONUS STOP 中', 'X.mgi=0;mini()', .5],
  ['宝箱くじ中', 'mg2Start("chest")', .5],
  ['ボス撃破直後(ミニゲーム予約)', 'G.stage=65;spawn();G.hp=1;hurt(1e9,"#fff")', .3],
  ['節目演出の予約中', 'G.stage=70;spawn();G.hp=1;hurt(1e9,"#fff")', .3],
  ['ラッシュ斬り中', 'actRush()', .1],
  ['RUSH 連チャン中', 'G.rush=15;G.combo=5;bigHit(false)', .5],
];
SC.forEach(([name, code, wait], i) => {
  const g = createGame({ seed: 40 + i }); g.start(); g.advance(1);
  g.eval('if(fxOpen)fxClose();DLY.shown=1;G.stage=60;X.best=60;spawn()');
  g.eval(code); g.advance(wait);
  const busy = g.eval('presBusy()');
  // 呼び出し回数を数える(転生後に古い演出から呼ばれたら NG)
  g.eval('__c={jp:0,mini:0,roul:0};{const a=jackpot;jackpot=function(){__c.jp++;return a.apply(this,arguments)}}{const b=mini;mini=function(){__c.mini++;return b.apply(this,arguments)}}{const c=startRoul;startRoul=function(){__c.roul++;return c.apply(this,arguments)}}');
  // 実際のボタン操作どおり: 転生する(presAsk) → 確認ダイアログの「転生する!」
  g.eval('presAsk()');
  ok(g.eval('fxOpen') === true, name + ': 確認ダイアログが開かない(busy=' + busy + ')');
  g.eval('FB[0][1]()');
  ok(g.eval('G.stage') === 1 && g.eval('X.pres') === 1, name + ': 転生できない stage=' + g.eval('G.stage'));
  ok(!g.eval('presBusy()'), name + ': 転生直後に演出が残っている ' + g.eval('JSON.stringify({sp:!!sp,RL:!!RL,roul:G.roul,jp:G.jp,cut:!!cut,MG:!!MG,MG2:!!MG2,PUSH:!!PUSH})'));
  const hp0 = g.eval('G.hp'), mx0 = g.eval('G.mx'), gold0 = g.eval('G.gold');
  g.eval('G.q=0;QL.length=0;__hr=hitRoll;hitRoll=()=>0;__hpS=G.hp'); // 新しい周回で自然に当たらないように
  g.advance(8);
  const c = JSON.parse(g.eval('JSON.stringify(__c)'));
  if (g.eval('G.stage') >= 5) c.mini = 0; // 新しい周回で正当にボスを倒した分は除外
  ok(c.jp === 0 && c.mini === 0 && c.roul === 0, name + ': 転生後に古い演出が走った ' + JSON.stringify(c));
  ok(!g.eval('!!(RL||G.jp>0||MG||MG2||PUSH||HEV.jr||HEV.mr||JPX.p||GK.rr)'), name + ': 転生後に古い演出の状態が復活');
  ok(g.eval('G.gold') - gold0 < 1e6, name + ': 転生後に古い報酬が入った +' + (g.eval('G.gold') - gold0));
  ok(g.eval('$("rl").style.display') !== 'flex' && g.eval('$("mg").style.display') !== 'flex' && !/on/.test(g.eval('$("push").className')), name + ': 演出の画面が残った');
  g.eval('hitRoll=__hr'); g.advance(20); noErr(g, name);
  void hp0; void mx0;
});

// 押せ!!が押された後(GO!!の0.7秒の間)に転生 → コールバック(ルーレット/JACKPOT)が走らない
{
  const g = createGame({ seed: 70 }); g.start(); g.advance(1);
  g.eval('DLY.shown=1;if(fxOpen)fxClose();G.stage=60;X.best=60;HEV.jv=0;bigHit(true)'); g.advance(1.5);
  ok(g.eval('!!PUSH'), '押せ!! が出ていない');
  g.eval('pushPress(0)'); g.advance(.2);
  g.eval('__j=0;{const a=jackpot;jackpot=function(){__j++;return a.apply(this,arguments)}}');
  g.eval('presAsk();FB[0][1]()'); g.advance(3);
  ok(g.eval('G.stage') === 1 && g.eval('__j') === 0 && !(g.eval('G.jp') > 0), 'GO!! の途中で転生 → JACKPOT が入った');
}

// 放置(自然進行)の最中に転生ボタンを何度押しても毎回すぐ転生できる
{
  const g = createGame({ seed: 71 }); g.start(); g.advance(1);
  g.eval('DLY.shown=1;if(fxOpen)fxClose()');
  for (let k = 0; k < 6; k++) {
    g.eval('G.stage=45;X.best=Math.max(X.best,45);spawn();G.gold=1e15;for(let i=0;i<10;i++)for(let j=0;j<G.lv.length;j++)buy(j)');
    g.advance(7 + k * 3);
    const p0 = g.eval('X.pres');
    g.eval('presAsk();FB[0][1]()');
    ok(g.eval('X.pres') === p0 + 1 && g.eval('G.stage') <= 1 + 15, '自然進行中の転生 ' + k + ': pres ' + p0 + '→' + g.eval('X.pres'));
    g.advance(2);
  }
  noErr(g, '連続転生');
}

// ループ内の例外で以後のフレームが止まらない(次の requestAnimationFrame を先に予約する)
{
  const src = require('fs').readFileSync(require('path').join(__dirname, '../src/js/99-main.js'), 'utf8');
  ok(/function loop\(ts\)\{requestAnimationFrame\(loop\);/.test(src), 'loop() の先頭で requestAnimationFrame を予約していない');
}

if (bad) { console.error('prestige tests: ' + bad + ' failure(s)'); process.exit(1) }
console.log('prestige tests OK');
