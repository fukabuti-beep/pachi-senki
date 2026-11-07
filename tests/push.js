// PUSH演出 / カットイン / ルーレットの流れ: 大当たり→PUSH→(押す or 自動)→ルーレット→終了 で詰まらないこと
const { createGame } = require('../tools/harness');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
const run = (tap) => {
  const g = createGame({ seed: 7 });
  g.start(); g.advance(1, 0.05);
  g.eval('bigHit(false)');
  g.advance(1.2, 0.05);                         // カットイン(1.0s)のあと PUSH が出ている
  ok(g.eval('!!PUSH') && g.eval('G.roul') === 1, 'PUSH shown after cutin');
  const rushBefore = g.eval('G.rush');
  g.advance(0.5, 0.05);
  ok(Math.abs(g.eval('G.rush') - rushBefore) < 1e-6, 'RUSH timer paused during PUSH');
  if (tap) { g.eval('$("push").onpointerdown()'); ok(g.eval('PUSH.done') === 1, 'tap presses'); g.advance(1, 0.05); }
  else g.advance(2.4, 0.05);                    // 放置 → 自動で押される
  ok(g.eval('!PUSH'), 'PUSH finished (' + (tap ? 'tap' : 'auto') + ')');
  ok(g.eval('!!RL'), 'roulette started after PUSH');
  g.advance(14, 0.05);                          // ルーレット(回転4.6s+DOUBLE UP PUSH最大2.4s+表示1.8s)
  ok(g.eval('!RL && G.roul') === 0 || (g.eval('!RL') && g.eval('G.roul') === 0), 'roulette finished and game unlocked (RL=' + g.eval('!!RL') + ' roul=' + g.eval('G.roul') + ')');
  ok(g.eval('!PUSH'), 'no PUSH left over');
  ok(Number.isFinite(g.eval('G.gold')) && Number.isFinite(g.eval('G.rush')), 'no NaN');
};
run(false); run(true);
// JACKPOT も PUSH を挟む
{
  const g = createGame({ seed: 3 }); g.start(); g.advance(1, 0.05);
  g.eval('bigHit(true)'); g.advance(1.2, 0.05);
  ok(g.eval('!!PUSH'), 'jackpot: PUSH shown'); g.advance(3.2, 0.05);
  ok(g.eval('G.jp') > 0, 'jackpot: starts after PUSH');
}
// ルーレット後半の DOUBLE UP? (小さなPUSH)で詰まらない: 何度も回して全部完走
{
  const g = createGame({ seed: 11 }); g.start(); g.advance(1, 0.05);
  for (let i = 0; i < 12; i++) {
    g.eval('G.roul=0;G.jp=0;G.rush=0;bigHit(false)');
    for (let s = 0; s < 40 && (g.eval('G.roul') || g.eval('!!PUSH') || g.eval('!!RL')); s++) g.advance(1, 0.05);
    ok(g.eval('!PUSH && !RL'), 'round ' + i + ': flow completes without leftovers');
  }
}
if (fails) { console.error(fails + ' push test failure(s)'); process.exit(1); }
console.log('PUSH OK');
