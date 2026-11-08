// 大当たり後の流れ(87-hitev):
//   ルーレットイベント(押せ!!→全画面ルーレット→超倍率チャンス) / 777(押せ!!→激しめアニメ→JACKPOT) / ミニルーレット(非ブロッキング)
// どの分岐でも詰まらず、PUSH 中は RUSH が減らず、終了時にゲームのロックが解除されること
const { createGame } = require('../tools/harness');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
const runRoul = (tap, sup) => {
  const g = createGame({ seed: 7 });
  g.start(); g.advance(1, 0.05);
  g.eval(`HEV.force='roul';BAL.supP=${sup ? 1 : 0};bigHit(false)`);
  g.advance(1.2, 0.05);                         // カットイン(1.0s)のあと PUSH が出ている
  ok(g.eval('!!PUSH') && g.eval('G.roul') === 1, 'PUSH shown after cutin');
  const rushBefore = g.eval('G.rush');
  g.advance(0.5, 0.05);
  ok(Math.abs(g.eval('G.rush') - rushBefore) < 1e-6, 'RUSH timer paused during PUSH');
  if (tap) { g.eval('$("push").onpointerdown()'); ok(g.eval('PUSH.done') === 1, 'tap presses'); g.advance(1, 0.05); }
  else g.advance(2.4, 0.05);                    // 放置 → 自動で押される
  ok(g.eval('!PUSH'), 'PUSH finished (' + (tap ? 'tap' : 'auto') + ')');
  ok(g.eval('!!RL') && g.eval('!!RL.sup') === !!sup, 'roulette started after PUSH (sup=' + sup + ')');
  g.eval('HEV.force=null');
  let endRoul = null, sawSup = false, gold0 = g.eval('G.gold');
  for (let i = 0; i < 300 && endRoul === null; i++) { g.advance(0.05, 0.05); if (g.eval('!!(RL&&RL.sx)')) sawSup = g.eval('RL.m2'); if (g.eval("!RL")) endRoul = g.eval("G.roul"); }
  ok(endRoul === 0, "roulette finished and game unlocked (roul at end=" + endRoul + ")");
  if (sup) ok([100, 300, 777].includes(sawSup), '超倍率が出ない: ' + sawSup); else ok(sawSup === false, '押していないのに超倍率');
  ok(g.eval('G.gold') > gold0, 'ルーレットでゴールドが増えない');
  ok(g.eval('!PUSH'), 'no PUSH left over');
  ok(Number.isFinite(g.eval('G.gold')) && Number.isFinite(g.eval('G.rush')), 'no NaN');
};
runRoul(false, false); runRoul(true, true);
// 777: PUSH → バリエーション(v0 従来=即JACKPOT / v1 777叩きつけ / v2 カウントダウン) → 従来の jackpot()
for (const v of [0, 1, 2]) {
  const g = createGame({ seed: 3 }); g.start(); g.advance(1, 0.05);
  g.eval(`HEV.jv=${v};bigHit(true)`); g.advance(1.2, 0.05);
  ok(g.eval('!!PUSH'), 'jackpot v' + v + ': PUSH shown'); g.advance(3, 0.05);
  if (v === 0) ok(g.eval('!HEV.jr') && g.eval('G.jp') > 0, 'jackpot v0: 従来どおり押した直後に JACKPOT にならない');
  else {
    ok(g.eval('!!HEV.jr') && g.eval('G.jp') <= 0, 'jackpot v' + v + ': 押した後に前置きアニメが出ない');
    g.advance(2.8, 0.05);
    ok(g.eval('!HEV.jr') && g.eval('G.jp') > 0, 'jackpot v' + v + ': アニメ後に JACKPOT が始まらない');
  }
}
// 通常: ミニルーレットは画面を塞がず(RL無し・PUSH無し・G.roul解除)、勝手に回って報酬が入る
{
  const g = createGame({ seed: 5 }); g.start(); g.advance(1, 0.05);
  g.eval("HEV.force='mini';G.roul=0;G.rush=0;bigHit(false)"); g.advance(1.0, 0.05);
  ok(g.eval('!!HEV.mr') && g.eval('!RL') && g.eval('!PUSH') && g.eval('G.roul') === 0, 'ミニルーレットが非ブロッキングで始まらない');
  const g0 = g.eval('G.gold'); g.advance(2.6, 0.05);
  ok(g.eval('G.gold') > g0, 'ミニルーレットの報酬が入らない');
  g.eval("for(let i=0;i<8;i++)miniRoul(1)"); ok(g.eval('HEV.mq.length') <= 3, 'ミニルーレットの待ち行列が上限を超える');
}
// ランダム分岐で何度回しても詰まらない
{
  const g = createGame({ seed: 11 }); g.start(); g.advance(1, 0.05);
  for (let i = 0; i < 16; i++) {
    g.eval(`G.roul=0;G.jp=0;G.rush=0;bigHit(${i % 5 === 4})`);
    for (let s = 0; s < 40 && (g.eval('G.roul') || g.eval('!!PUSH') || g.eval('!!RL') || g.eval('!!HEV.jr')); s++) g.advance(1, 0.05);
    ok(g.eval('!PUSH && !RL && !HEV.jr'), 'round ' + i + ': flow completes without leftovers');
  }
}
if (fails) { console.error(fails + ' push test failure(s)'); process.exit(1); }
console.log('PUSH OK');
