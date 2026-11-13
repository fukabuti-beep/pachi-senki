// feature 担当の不変条件テスト: セーブ互換 / オフライン上限 / NaN無し / 実績 / 転生 / ミニゲーム / 仲間
// 実行: node tests/feature.js
const { createGame } = require('../tools/harness');
let failures = 0;
const ok = (c, msg) => { if (!c) { failures++; console.error('FAIL: ' + msg); } };
const fin = (v) => Number.isFinite(v);
const H = 3600 * 1000;
const mkStore = (x, g) => { const s = {}; if (g) s.pachi2 = JSON.stringify(g); if (x !== undefined) s.pachi2x = typeof x === 'string' ? x : JSON.stringify(x); return s; };
const noErr = (g, name) => ok(g.eval('FERR') === 0, name + ': feature hook threw (FERR=' + g.eval('FERR') + ')');

// 1) 旧セーブ {gold,stage,lv} (v無し) だけで起動できる。旧バランスのstageは攻撃力で倒せる範囲に補正される(Lv・ゴールドは維持)
{
  const g = createGame({ seed: 1, storage: mkStore(undefined, { gold: 100, stage: 7, lv: [2, 2] }) });
  g.start(); g.advance(10, 0.05);
  ok(g.eval('G.stage') >= 1 && g.eval('G.stage') <= 7, 'old save: stage kept or clamped down (never raised)');
  ok(g.eval('X.best') >= 1, 'old save: best initialised from stage');
  ok(g.eval('X.souls') === 0 && g.eval('X.pres') === 0, 'old save: meta defaults');
  noErr(g, 'old save');
  ok(JSON.parse(g.store.pachi2).lv.length >= 10, 'pachi2 still {gold,stage,lv}'); // 追加強化(23-upgrades2)で末尾に増える。先頭10個の意味は不変
  ok(Object.keys(JSON.parse(g.store.pachi2)).sort().join() === 'gold,lv,stage,v', 'pachi2 format: {v,gold,stage,lv}');
}
// 1b) v:2 のセーブはそのまま(補正されない)
{
  const g = createGame({ seed: 1, storage: mkStore(undefined, { v: 2, gold: 100, stage: 7, lv: [2, 2] }) });
  ok(g.eval('G.stage') === 7, 'v2 save: stage untouched');
  ok(g.eval('X.best') >= 7, 'v2 save: best initialised from stage');
}
// 1c) 旧バランスで伸びすぎたセーブ(stage120/Lv120)は、倒せる範囲に戻され進行が止まらない
{
  const lv = [120, 11, 12, 120, 15, 15, 8, 5, 10, 10];
  const g = createGame({ seed: 1, storage: mkStore(undefined, { gold: 5000, stage: 120, lv }) });
  const s0 = g.eval('G.stage');
  ok(s0 >= 1 && s0 < 120, 'old overgrown save: stage clamped down (' + s0 + ')');
  ok(g.eval('G.lv[0]') === 120 && g.eval('G.gold') >= 5000, 'old overgrown save: Lv and gold kept');
  g.start(); g.advance(120, 0.05);
  ok(g.eval('G.stage') > s0, 'old overgrown save: can still progress (' + s0 + ' -> ' + g.eval('G.stage') + ')');
  noErr(g, 'old overgrown save');
}

// 2) 壊れた/悪意あるメタセーブでも NaN/例外なし
for (const bad of ['{bad json', 'null', '[]', '"x"', JSON.stringify({ t: 'x', souls: -5, pres: 'a', best: Infinity, gps: NaN, ach: 5, st: { hit: 'q' } }), '{"t":1e999,"souls":1e999}']) {
  const g = createGame({ seed: 2, storage: mkStore(bad) });
  g.start(); g.advance(3, 0.05);
  const x = g.eval('X');
  ok(fin(x.t) && fin(x.souls) && fin(x.pres) && fin(x.best) && fin(x.gps) && x.souls >= 0 && x.best >= 1, 'normX sanitises: ' + bad);
  ok(fin(g.eval('G.gold')), 'gold finite with bad meta');
  noErr(g, 'bad meta');
}

// 3) オフライン計算
{
  const calc = (awayH, gps = 100) => {
    const g = createGame({ seed: 3, storage: mkStore({ t: Date.now() - awayH * H, gps, best: 1 }, { gold: 0, stage: 5, lv: [] }) });
    g.eval('G.gold=0');
    const before = g.eval('G.gold');
    g.start();
    return { g, gain: g.eval('G.gold') - before, dlg: g.eval('OFFD') };
  };
  const a1 = calc(1), a8 = calc(8), a100 = calc(24 * 100), none = calc(0.001), fut = calc(-5);
  ok(a1.gain > 0 && fin(a1.gain), 'offline: 1h gives gold');
  ok(a8.gain > a1.gain, 'offline: 8h > 1h');
  ok(a100.gain === a8.gain, 'offline: capped at 8h (' + a100.gain + ' vs ' + a8.gain + ')');
  const maxByRate = 100 * 0.5 * (7200 + (28800 - 7200) * 0.5);
  ok(a100.gain <= maxByRate + 1, 'offline: gain <= rate*eff*effective seconds');
  ok(none.gain === 0 && none.dlg === null, 'offline: <60s gives nothing');
  ok(fut.gain === 0, 'offline: clock in the future gives nothing');
  ok(a1.dlg && a1.dlg.g === a1.gain, 'offline: dialog opened with the granted amount');
  a1.g.advance(10, 0.05);
  ok(a1.g.eval('OFFD') === null, 'offline: dialog auto closes');
  ok(a1.g.eval('G.gold') >= a1.gain && fin(a1.g.eval('G.gold')), 'offline: gold kept and finite');
  noErr(a1.g, 'offline');
  // gps が無い(初回/旧セーブ)でも有限
  const g0 = createGame({ seed: 3, storage: mkStore({ t: Date.now() - 5 * H }, { gold: 0, stage: 20, lv: [] }) });
  g0.start(); ok(fin(g0.eval('G.gold')) && g0.eval('G.gold') > 0, 'offline: fallback rate works without gps');
  // 二重付与なし: 保存後に再起動しても直近の時刻なので 0
  const g2 = createGame({ seed: 3, storage: g0.store });
  const gold2 = g2.eval('G.gold'); g2.start();
  ok(g2.eval('G.gold') === gold2, 'offline: no double grant after restart');
}

// 4) 実績: 条件達成で一度だけ報酬、保存、再起動後も維持
{
  const g = createGame({ seed: 4, storage: mkStore(undefined, { gold: 0, stage: 1, lv: [] }) });
  g.start(); g.advance(1, 0.05);
  const gold0 = g.eval('G.gold');
  g.eval('X.st.cmb=100;X.st.jp=1;X.best=25;X.st.r50=1;G.stage=25');
  g.advance(2, 0.05);
  const a = g.eval('Object.keys(X.ach).sort().join()');
  ok(['c30', 'c100', 'jp1', 's10', 's25', 'r50'].every(k => a.includes(k)), 'achievements granted: ' + a);
  ok(g.eval('G.gold') > gold0, 'achievement gold granted');
  const n1 = g.eval('Object.keys(X.ach).length'), gA = g.eval('G.gold');
  g.eval('achCheck()'); ok(g.eval('Object.keys(X.ach).length') === n1 && g.eval('achCheck()') === 0, 'achievements not granted twice');
  ok(JSON.parse(g.store.pachi2x).ach.c100 === 1, 'achievements saved');
  g.eval("AC_.forEach(a=>{X.ach[a[0]]=1});$('x');FM[0].r()"); // 一覧描画が例外を出さない
  noErr(g, 'achievements');
  const g2 = createGame({ seed: 4, storage: g.store });
  ok(g2.eval('X.ach.c100') === 1, 'achievements persisted across reload');
  // 実統計: bigHit/kill/ボス撃破のラップが数える
  const g3 = createGame({ seed: 5 });
  g3.start(); g3.eval('bigHit(false);bigHit(true);G.stage=5;spawn();kill()');
  ok(g3.eval('X.st.hit') === 2 && g3.eval('X.st.jp') === 1 && g3.eval('X.st.boss') === 1, 'stat wrappers count bigHit/jackpot/boss kills');
  g3.advance(3, 0.05); noErr(g3, 'stats');
}

// 5) 転生: 条件/リセット/魂の永続/ボーナス/旧セーブ互換
{
  const g = createGame({ seed: 6, storage: mkStore(undefined, { gold: 5000, stage: 29, lv: [5, 4, 3] }) });
  g.start(); g.advance(1, 0.05);
  ok(g.eval('soulGain(29)') === 0 && g.eval('soulGain(30)') === 5, 'soulGain thresholds');
  g.eval('presAsk()'); ok(g.eval('X.souls') === 0, 'no prestige below PRES_MIN');
  g.eval('G.stage=40;spawn()');
  while (g.eval('presBusy()')) g.advance(1, 0.05); // 演出が終わるまで
  g.eval('presAsk()'); ok(g.eval('fxOpen') === true, 'confirm dialog opens');
  g.eval('FB[1][1]()'); // やめる → メニューに戻るだけ
  ok(g.eval('X.souls') === 0 && g.eval('G.stage') === 40, 'cancel does not prestige');
  const dmgBefore = g.eval('SB.a()');
  const gn0 = g.eval('soulGain(40)'); // 転生後は PREC=記録 になり soulGain が変わる(第2弾)ので先に見る
  const gn = g.eval('presDo()');
  ok(gn === gn0 && gn > 0, 'prestige returns soul gain ' + gn);
  ok(g.eval('G.stage') === 1 && g.eval('G.gold') < 5000 && g.eval('G.lv.every(v=>v===1)'), 'prestige resets stage/gold/lv');
  ok(g.eval('X.souls') === gn && g.eval('X.pres') === 1 && g.eval('X.best') >= 40, 'souls/pres/best kept');
  ok(g.eval('SB.a()') > dmgBefore && g.eval('SB.g()') > 1, 'soul bonus active');
  const sv = JSON.parse(g.store.pachi2);
  ok(sv.stage === 1 && sv.gold === 0 && sv.lv.every(v => v === 1), 'pachi2 saved immediately after prestige');
  ok(g.eval('Object.keys(X.ach).includes("pr1")') || (g.advance(1, 0.05), g.eval('X.ach.pr1') === 1), 'first prestige achievement');
  g.advance(60, 0.05); noErr(g, 'prestige');
  ok(['gold', 'hp', 'mx', 'stage'].every(k => fin(g.eval('G.' + k))), 'state finite after prestige');
  // ゴールド上乗せ: 魂ありのほうが収入が多い(同シード/同条件)
  const run = (souls) => { const q = createGame({ seed: 7, storage: mkStore({ souls }, { gold: 0, stage: 3, lv: [] }) }); q.start(); q.advance(60, 0.05); return q.eval('G.gold + 0'); };
  ok(run(50) > run(0), 'souls increase income');
  // 再起動しても魂が残る
  const g2 = createGame({ seed: 6, storage: g.store });
  ok(g2.eval('X.souls') === gn && g2.eval('SB.a()') === g.eval('SB.a()'), 'souls persist across reload');
  g2.start(); g2.advance(5, 0.05); noErr(g2, 'reload');
}

// 6) ミニゲーム: 解放条件 / 放置で自動決着 / 連打 / 重複防止 / stopMG の null 安全
{
  const g = createGame({ seed: 8, storage: mkStore(undefined, { gold: 0, stage: 1, lv: [] }) });
  g.start(); g.advance(1, 0.05);
  ok(g.eval('mgPick()') === 'stop' && g.eval('mgPick()') === 'stop', 'stage1: only BONUS STOP');
  g.eval('G.stage=12'); const seen12 = new Set([g.eval('mgPick()'), g.eval('mgPick()'), g.eval('mgPick()'), g.eval('mgPick()')]);
  ok(seen12.has('chest') && !seen12.has('tap'), 'stage12: chest unlocked, tap locked');
  g.eval('G.stage=25'); const seen25 = new Set(Array.from({ length: 6 }, () => g.eval('mgPick()')));
  ok(['stop', 'chest', 'tap'].every(k => seen25.has(k)), 'stage25: all three rotate');
  g.eval('stopMG()'); // MG が無くても落ちない
  for (const ty of ['chest', 'tap']) {
    g.eval('G.stage=25;G.gold=0;MG2=null;fg=0'); g.advance(2, 0.05);
    const g0 = g.eval('G.gold');
    g.eval(`mg2Start('${ty}')`); ok(g.eval('!!MG2'), ty + ' starts');
    g.eval('mini()'); ok(g.eval('MG2.ty') === ty && g.eval('MG') === null, ty + ': mini() during a minigame is ignored');
    g.advance(10, 0.05); // 放置 → 自動決着して閉じる
    ok(g.eval('MG2') === null, ty + ': auto-resolves and closes with no input');
    ok(g.eval('G.gold') > g0 && fin(g.eval('G.gold')), ty + ': pays out with no input');
  }
  // 連打は放置より多い
  // ミニゲームの払い出し(mg2Fin)だけを測る(6秒の間の撃破や大当たりの収入が混ざると、乱数しだいで放置が勝つことがあった)
  g.eval('var __pay=0;(function(){const o=mg2Fin;mg2Fin=function(){const g0=G.gold;const r=o.apply(this,arguments);__pay+=G.gold-g0;return r}})()');
  const tap = (n) => { g.eval("G.stage=25;MG2=null;__pay=0;mg2Start('tap')"); for (let i = 0; i < n; i++) g.eval('mg2Tap({})'); g.advance(6, 0.05); return g.eval('__pay'); };
  ok(tap(50) > tap(0), 'tapping beats idle');
  g.eval("G.stage=25;MG2=null;mg2Start('chest');mg2Tap({clientX:0})"); ok(g.eval('MG2.s') === 1 && g.eval('MG2.pk') === 0, 'chest tap picks');
  g.eval('mg2Tap({clientX:0})'); g.advance(3, 0.05); ok(g.eval('MG2') === null, 'chest result closes');
  // ボス撃破経由(既存フロー: setTimeout(mini,1200))
  g.eval('MG2=null;G.stage=25;spawn();kill()'); g.advance(20, 0.05);
  ok(g.eval('X.st.mg') >= 1 && g.eval('MG') === null && g.eval('MG2') === null, 'boss kill -> minigame -> closes');
  ok(g.eval('(function(){let k=0;for(let i=0;i<9;i++){mini();k++;if(MG)stopMG();MG2=null}return k})()') === 9, 'repeated mini() ok');
  noErr(g, 'minigames');
  // 配列/状態の健全性(長時間 + ボス連打)
  for (let i = 0; i < 12; i++) { g.eval('G.stage=Math.max(G.stage,5);G.stage=G.stage-G.stage%5+4;spawn();G.stage++;spawn();kill()'); g.advance(8, 0.05); }
  ok(g.eval('MG2?MG2.co.length:0') <= 30 && fin(g.eval('G.gold')), 'coin particles bounded');
  noErr(g, 'minigames soak');
}

// 7) 仲間: 解放(最高到達)/援護攻撃/転生後も残る/描画で例外なし
{
  const g = createGame({ seed: 9, storage: mkStore({ best: 1 }, { gold: 0, stage: 1, lv: [] }) });
  g.start(); g.advance(20, 0.05);
  ok(g.eval('ALY.every(a=>a.h===-9)'), 'no ally acts before unlock');
  g.eval('G.stage=150;X.best=150;G.hp=G.mx=1e30'); g.advance(30, 0.05);
  ok(g.eval('ALY.every(a=>a.h>0)'), 'all allies act once unlocked');
  ok(g.eval('alyAnn') === 150, 'unlock announced once');
  g.eval('ALY.forEach(a=>a.go())'); // 直接発動も安全
  g.advance(30, 0.05);
  ok(fin(g.eval('G.gold')) && fin(g.eval('G.sp')) && g.eval('G.sp') <= 100, 'allies keep state finite/bounded');
  ok(g.eval('PT.length') <= 1500 && g.eval('F.length') <= 150, 'allies do not leak fx arrays');
  g.eval('FM[3].r()'); noErr(g, 'allies');
  // 転生しても最高到達が残る → 仲間も残る
  g.eval('G.stage=150;spawn();'); while (g.eval('presBusy()')) g.advance(1, 0.05);
  g.eval('presDo()'); ok(g.eval('G.stage') === 1 && g.eval('ALY.every(alyOn)'), 'allies survive prestige');
  const g2 = createGame({ seed: 9, storage: g.store }); ok(g2.eval('ALY.every(alyOn)'), 'allies persist across reload');
  g.advance(10, 0.05); noErr(g, 'allies after prestige');
}

// 8) 総合: 全機能を強制発火しながら長時間回しても NaN/例外/配列リークなし
{
  const g = createGame({ seed: 10, storage: mkStore({ t: Date.now() - 2 * H, gps: 50 }, { gold: 0, stage: 1, lv: [] }) });
  g.start();
  for (let s = 0; s < 4 * 60; s++) {
    g.advance(1, 0.05);
    if (s % 20 === 5) g.eval('G.gold=Math.max(G.gold,1e6);for(let i=0;i<UP.length;i++)buy(i)');
    if (s % 40 === 10) g.eval('bigHit(Math.random()<.3)');
    if (s % 50 === 20) g.eval('mini()');
    if (s % 50 === 22) g.eval("MG2&&mg2Tap({})");
    if (s % 90 === 30) g.eval('G.stage+=7;X.best=Math.max(X.best,G.stage);spawn()');
    if (s % 120 === 100 && !g.eval('presBusy()')) g.eval('presDo()');
    if (s % 60 === 0) g.eval('FM.forEach(m=>m.r())');
    const st = g.eval('({gold:G.gold,hp:G.hp,sp:G.sp,souls:X.souls,gps:X.gps,pt:PT.length,f:F.length,pr:PR.length,fx:FX.length,b:balls.length,q:fxQ.length})');
    for (const k of ['gold', 'hp', 'sp', 'souls', 'gps']) if (!fin(st[k])) { ok(false, `${k}=${st[k]} at ${s}s`); break; }
    if (st.pt > 1500 || st.f > 150 || st.pr > 100 || st.fx > 20 || st.b > 200 || st.q > 6) { ok(false, 'array leak ' + JSON.stringify(st) + ' at ' + s); break; }
  }
  noErr(g, 'soak');
}

if (failures) { console.error('\n' + failures + ' feature test failure(s)'); process.exit(1); }
console.log('FEATURE OK');
