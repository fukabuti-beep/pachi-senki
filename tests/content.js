// 強化項目の追加(23-upgrades2)と遺物コレクション(96r-relic): セーブ互換 / 効果 / ドロップ / 転生で残る
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const sv = o => ({ pachi2: JSON.stringify(Object.assign({ v: 2, gold: 5, stage: 7 }, o)) });
// (a) 旧セーブ(lv 10個)でも読める・追加分はLv1。新セーブ(14個)は追加分も復元。壊れた値は1
{
  const g = createGame({ seed: 1, storage: sv({ lv: [3, 2, 2, 2, 1, 1, 1, 1, 1, 1] }) });
  ok(g.eval('G.lv.length') === 14 && g.eval('G.lv[0]') === 3 && g.eval('G.lv.slice(10).every(v=>v===1)'), '旧セーブ: ' + g.eval('JSON.stringify(G.lv)'));
  const g2 = createGame({ seed: 1, storage: sv({ lv: [3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 4, 3, 2, 5] }) });
  ok(g2.eval('JSON.stringify(G.lv.slice(10))') === '[4,3,2,5]', '新セーブの追加分が復元されない: ' + g2.eval('JSON.stringify(G.lv)'));
  const g3 = createGame({ seed: 1, storage: sv({ lv: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 'x', -3, null, 1e99] }) });
  ok(g3.eval('G.lv.slice(10).every(v=>Number.isFinite(v)&&v>=1)'), '壊れた追加分: ' + g3.eval('JSON.stringify(G.lv)'));
}
// (b) 購入と効果 / 上限 / セーブに追加分が書かれる
{
  const g = createGame({ seed: 2 }); g.start(); g.advance(1);
  const e0 = g.eval('UPX.evP()'), s0 = g.eval('UPX.supP()'), t0 = g.eval('UPX.tap()');
  g.eval('G.gold=1e12;G.stage=30;for(let i=0;i<5;i++){buy(10);buy(11);buy(12);buy(13)}');
  ok(g.eval('G.lv[10]') === 6 && g.eval('G.lv[13]') === 6, '追加強化が買えない: ' + g.eval('JSON.stringify(G.lv)'));
  ok(g.eval('UPX.evP()') > e0 && g.eval('UPX.supP()') > s0 && g.eval('UPX.tap()') > t0 && g.eval('UPX.trsRate()') > 1, '追加強化の効果が無い');
  g.eval('G.gold=1e15;for(let i=0;i<30;i++){buy(12);buy(13)}');
  ok(g.eval('G.lv[12]') === 10 && g.eval('UPX.evP()') <= g.eval('BAL.evP') + .25 + 1e-9, 'MAX/上限: ' + g.eval('G.lv[12]'));
  g.advance(5); const s = JSON.parse(g.store.pachi2 || '{}'); ok(Array.isArray(s.lv) && s.lv.length === 14, 'セーブに追加分が無い: ' + g.store.pachi2);
}
// (c) 遺物: 初回ボスで確定ドロップ → 演出(ミニゲーム後) → 効果 → 保存 → 転生でも残る
{
  const g = createGame({ seed: 3 }); g.start(); g.advance(1);
  ok(g.eval('relicCount()') === 0, '初期の遺物');
  const a0 = g.eval('SB.a()');
  g.eval('G.stage=5;spawn();G.hp=1;hurt(10,"#fff")');
  ok(g.eval('relicCount()') === 1, '初回ボスで遺物が出ない');
  let shown = false; for (let i = 0; i < 40 && !shown; i++) { g.advance(.5); shown = g.eval('!!RDR.show') }
  ok(shown, '遺物の演出が出ない(ミニゲーム後)');
  g.eval("RLV={ken:5,hai:5,kan:5,uroko:5,suna:5,hachi:5};relicSave()");
  ok(g.eval('SB.a()') > a0 * 1.3, '遺物のダメージ効果: ' + g.eval('SB.a()'));
  ok(Math.abs(g.eval('relicBonus("gold")') - .55) < 1e-9, 'gold ボーナス計算: ' + g.eval('relicBonus("gold")'));
  g.eval('G.rush=0;G.roul=0;bigHit(false)'); ok(g.eval('G.rush') > 9, '時の砂の RUSH 延長: ' + g.eval('G.rush'));
  ok(JSON.parse(g.store.pachi2_relic).ken === 5, '遺物が保存されない');
  g.eval('sp=null;RL=null;G.roul=0;G.jp=0;cut=null;MG=null;if(typeof MG2!=="undefined")MG2=null;X.souls=0;G.stage=60;X.best=60;presDo()');
  ok(g.eval('G.stage') === 1 && g.eval('RLV.ken') === 5, '転生で遺物が消えた/転生できない: stage=' + g.eval('G.stage'));
  for (let i = 0; i < 200; i++) g.eval('relicRoll()');
  ok(g.eval('Object.values(RLV).every(v=>v<=RLMAX)') && g.eval('relicCount()') === 10, 'Lv上限/全種');
}
{
  const g = createGame({ seed: 4, storage: { pachi2_relic: '{bad' } }); g.start(); g.advance(2); ok(g.eval('relicCount()') === 0, '壊れた遺物セーブ');
  const g2 = createGame({ seed: 4, storage: { pachi2_relic: JSON.stringify({ ken: 99, xxx: 3, hai: 'a' }) } });
  ok(g2.eval('RLV.ken') === 5 && g2.eval('RLV.hai') === undefined && g2.eval('RLV.xxx') === undefined, '不正な遺物セーブ: ' + g2.eval('JSON.stringify(RLV)'));
}
// (d) 魂の祭壇: 魂を使っても所持魂(ボーナス)は減らない / 開始ステージ・初期ゴールド・魂の器・自動強化
{
  const g = createGame({ seed: 5 }); g.start(); g.advance(1);
  g.eval('X.souls=100;saveX()'); const a0 = g.eval('SB.a()');
  for (let i = 0; i < 3; i++) g.eval("soulBuy('start')"); g.eval("soulBuy('gold');soulBuy('auto');soulBuy('soul');soulBuy('relic')");
  ok(g.eval('X.souls') === 100 && g.eval('SB.a()') === a0, '魂を使ったらボーナスが減った');
  ok(g.eval('SOUL.spent') === 3 + 6 + 9 + 2 + 5 + 5 + 4, '使用済み魂: ' + g.eval('SOUL.spent'));
  ok(g.eval('relicDropP()') > .35, '遺物の目利き');
  g.eval('sp=null;RL=null;G.roul=0;G.jp=0;cut=null;MG=null;if(typeof MG2!=="undefined")MG2=null;G.stage=80;X.best=80');
  const gn = g.eval('soulGain(80)'); g.eval('presDo()');
  ok(g.eval('G.stage') === 16, '開始ステージ(+15): ' + g.eval('G.stage'));
  ok(g.eval('G.gold') > 0, '初期ゴールド: ' + g.eval('G.gold'));
  ok(g.eval('X.souls') === 100 + gn + Math.floor(gn * .1), '魂の器: ' + g.eval('X.souls') + ' gn=' + gn);
  const lv0 = g.eval('G.lv.reduce((a,b)=>a+b,0)'); g.eval('G.gold=1e9'); g.advance(5);
  ok(g.eval('G.lv.reduce((a,b)=>a+b,0)') > lv0, '自動強化が買わない');
  g.eval('soulAutoToggle()'); const lv1 = g.eval('G.lv.reduce((a,b)=>a+b,0)'); g.advance(5); ok(g.eval('G.lv.reduce((a,b)=>a+b,0)') === lv1, '自動強化OFFでも買う');
  ok(JSON.parse(g.store.pachi2_soul).lv.start === 3, '祭壇の保存');
  ok(g.eval('soulNext(30)') > 30, '次の魂ステージ');
  const g2 = createGame({ seed: 5, storage: { pachi2_soul: '{bad' } }); ok(g2.eval('SOUL.spent') === 0, '壊れた祭壇セーブ');
}
// (e) 図鑑: 撃破で記録・★でダメージ+1%・保存
{
  const g = createGame({ seed: 6 }); g.start(); g.advance(1);
  const a0 = g.eval('SB.a()');
  g.eval('for(let i=0;i<10;i++){G.stage=1;spawn();G.hp=1;kill()}');
  ok(g.eval('ZK.m0') === 10 && g.eval("zkStar('m0')") === 1, '図鑑の記録: ' + g.eval('JSON.stringify(ZK)'));
  ok(Math.abs(g.eval('SB.a()') / a0 - 1.01) < 1e-9, '★のダメージボーナス: ' + g.eval('SB.a()') / a0);
  g.eval('G.stage=5;spawn();G.hp=1;kill()'); ok(g.eval("zkStar('b0')") === 1, 'ボスの★');
  ok(JSON.parse(g.store.pachi2_zukan).m0 === 10, '図鑑の保存');
  const g2 = createGame({ seed: 6, storage: { pachi2_zukan: JSON.stringify({ m0: 'x', b9: 5, m1: 1e99 }) } }); ok(g2.eval('ZK.m0') === undefined && g2.eval('ZK.b9') === undefined && g2.eval('ZK.m1') === 1e9, '不正な図鑑セーブ');
}
// (f) 攻撃モーション: 特殊モーションの位置オフセットが有限で、時間が経てば戻る
{
  const g = createGame({ seed: 7 }); g.start(); g.advance(1);
  for (const [i, k] of [[0, 'jump'], [0, 'spin'], [0, 'double'], [1, 'cast'], [1, 'nova'], [2, 'back'], [2, 'rain']]) {
    g.eval(`AMV.m[${i}]={k:'${k}',t0:T}`); g.advance(.2);
    ok(Number.isFinite(g.eval(`heroDX(${i},T)`)) && Number.isFinite(g.eval(`heroDY(${i},T)`)), 'モーション ' + k);
    g.advance(1); ok(g.eval(`AMV.m[${i}]===null||AMV.m[${i}].k!=='${k}'||T-AMV.m[${i}].t0<AMD['${k}']`), 'モーションが終わらない ' + k);
  }
}
if (bad) { console.error(bad + ' failure(s)'); process.exit(1) }
console.log('CONTENT OK');
