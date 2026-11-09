// 魂の祭壇「開始ステージ」で高い STAGE から再出発した直後に、強化 Lv1 のまま止まらないこと(再出発の勢い)
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
(async () => {
  const g = createGame({ seed: 7 }); g.start();
  g.eval('X.best=110;G.stage=112;SOUL.lv.start=10;SOUL.lv.gold=0;SOUL.lv.auto=0');
  ok(g.eval('presDo()') > 0, 'prestige ok');
  const s0 = g.eval('G.stage'); ok(s0 === 51, 'restart at 51 (' + s0 + ')');
  ok(g.eval('SOUL_RUN&&SOUL_RUN.stage') === 66, 'momentum set');
  g.advance(240, 0.05);
  ok(g.eval('G.stage') > s0 + 10, 'progresses after restart (' + g.eval('G.stage') + ')');
  g.advance(200, 0.05); ok(g.eval('SOUL_RUN') === null, 'momentum ends');
  // 開始ステージ無しなら勢いは付かない
  const h = createGame({ seed: 8 }); h.start(); h.eval('G.stage=40;SOUL.lv.start=0'); h.eval('presDo()'); ok(h.eval('SOUL_RUN') === null, 'no momentum without start perk');
  if (fails) { console.error(fails + ' soulrun failure(s)'); process.exit(1); }
  console.log('SOULRUN OK');
})();
