// 強化項目の追加(23-upgrades2)と遺物コレクション(96r-relic): セーブ互換 / 効果 / ドロップ / 転生で残る
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const sv = o => ({ pachi2: JSON.stringify(Object.assign({ v: 2, gold: 5, stage: 7 }, o)) });
// (a) 旧セーブ(lv 10個)でも読める・追加分はLv1。新セーブ(14〜15個)は追加分も復元。壊れた値は1
{
  const g = createGame({ seed: 1, storage: sv({ lv: [3, 2, 2, 2, 1, 1, 1, 1, 1, 1] }) });
  ok(g.eval('G.lv.length') === 15 && g.eval('G.lv[0]') === 3 && g.eval('G.lv.slice(10).every(v=>v===1)'), '旧セーブ: ' + g.eval('JSON.stringify(G.lv)'));
  const g2 = createGame({ seed: 1, storage: sv({ lv: [3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 4, 3, 2, 5] }) });
  ok(g2.eval('JSON.stringify(G.lv.slice(10))') === '[4,3,2,5,1]', '新セーブの追加分が復元されない: ' + g2.eval('JSON.stringify(G.lv)'));
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
  g.advance(5); const s = JSON.parse(g.store.pachi2 || '{}'); ok(Array.isArray(s.lv) && s.lv.length === 15, 'セーブに追加分が無い: ' + g.store.pachi2);
  // 会心ダメージ(添字14, STAGE25 解放・無制限): 会心の一撃だけが強くなる
  const c0 = g.eval('UPX.critD()'); g.eval('for(let i=0;i<5;i++)buy(14)');
  ok(g.eval('G.lv[14]') === 6 && Math.abs(g.eval('UPX.critD()') - (c0 + .4)) < 1e-9, '会心ダメージ: ' + g.eval('G.lv[14]') + ' ' + g.eval('UPX.critD()'));
  const h0 = g.eval('G.hp=G.mx=1e9;hurt(100,"#fff",0,0);1e9-G.hp'), h1 = g.eval('G.hp=G.mx=1e9;hurt(100,"#fff",0,1);1e9-G.hp');
  ok(Math.abs(h1 / h0 - 3 * g.eval('UPX.critD()')) < 1e-6, '会心倍率: ' + h1 / h0);
  const g4 = createGame({ seed: 1, storage: sv({ lv: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7] }) });
  ok(g4.eval('G.lv[14]') === 7, '会心ダメージのセーブ復元: ' + g4.eval('JSON.stringify(G.lv)'));
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
// (g) リソース(96s-smith): 魔石の入手 / 宝石(JACKPOT) / 武器強化と限界突破 / 武器の倍率 / 護符 / 保存
{
  const g = createGame({ seed: 9 }); g.start(); g.advance(1);
  const m0 = g.eval('RES.ms'); g.eval('G.stage=1;spawn();G.hp=1;kill()'); ok(g.eval('RES.ms') > m0, '魔石が増えない');
  g.eval('G.stage=5;spawn();G.hp=1;kill()'); ok(g.eval('RES.ms') >= m0 + 1 + 12, 'ボスの魔石: ' + g.eval('RES.ms'));
  const g0 = g.eval('RES.gem'); g.eval('jackpot()'); ok(g.eval('RES.gem') === g0 + 5, 'JACKPOT の宝石');
  g.eval('RES.ms=1e9;RES.gem=0;for(let i=0;i<12;i++)smithUp(0)');
  ok(g.eval('RES.w[0]') === 10, '限界突破に宝石が要らない/強化できない: ' + g.eval('RES.w[0]'));
  g.eval('RES.gem=2;smithUp(0)'); ok(g.eval('RES.w[0]') === 11 && g.eval('RES.gem') === 0, '限界突破');
  g.eval('PR.length=0;heroAtk(0,1)'); const d1 = g.eval('PR[PR.length-1].d'); g.eval('RES.w[0]=0;PR.length=0;heroAtk(0,1)'); const d0 = g.eval('PR[PR.length-1].d');
  ok(d1 / d0 > 2 && d1 / d0 < 2.6, '武器の倍率: ' + d1 / d0);
  const a0 = g.eval('SB.a()'); g.eval("RES.gem=3;smithBuff('a')"); ok(Math.abs(g.eval('SB.a()') / a0 - 2) < 1e-9 && g.eval('RES.ba') === 180, '闘気の護符');
  g.advance(260); ok(g.eval('RES.ba') === 0, '護符が切れない: ' + g.eval('RES.ba')); // ヒットストップ中はゲーム時間が遅れるので余裕を見る
  g.eval('resSave()'); const sv = JSON.parse(g.store.pachi2_res); ok(sv.w[0] === 0 && sv.ms > 0, 'リソースの保存');
  const g2 = createGame({ seed: 9, storage: { pachi2_res: '{bad' } }); ok(g2.eval('RES.ms') === 0 && g2.eval('RES.w.join()') === '0,0,0', '壊れたリソースセーブ');
  const g3 = createGame({ seed: 9, storage: { pachi2_res: JSON.stringify({ ms: -5, gem: 'x', w: [3, 1e9, null], bg: 99999 }) } });
  ok(g3.eval('RES.ms') === 0 && g3.eval('RES.gem') === 0 && g3.eval('RES.w.join()') === '3,999,0' && g3.eval('RES.bg') === 3600, '不正なリソースセーブ: ' + g3.eval('JSON.stringify(RES)'));
}
const tick = () => new Promise(r => setImmediate(r));
(async () => {
// (h) 応援(97s): 既定(Web・URL未設定)では課金なし / mock で購入→お礼(ゲーム数値は変えない)
{
  const g = createGame({ seed: 10 }); g.start(); g.advance(1);
  ok(g.eval('supNative()') === null, '既定で応援の課金が有効になっている');
  g.eval('MON.mock=1'); ok(!!g.eval('supNative()'), 'mock で応援が出ない');
  const a0 = g.eval('SB.a()'), g0 = g.eval('SB.g()'); g.eval("supBuy('tip_s')"); g.advance(1); await tick(); g.advance(.1); await tick();
  ok(g.eval('SUP.n') === 1 && JSON.parse(g.store.pachi2_sup).n === 1, '応援の記録');
  ok(g.eval('SB.a()') === a0 && g.eval('SB.g()') === g0, '応援でゲームが有利になった');
  ok(/★/.test(g.eval('MQP.n[0]')), 'サポーターの★');
  // サポーターコード: 正しいコードで登録 / 違うコードは不可 / 大文字小文字・空白は無視
  const g2 = createGame({ seed: 10 }); g2.start(); g2.advance(1);
  g2.eval("$('supcode').value='pachi-xxxx-yyyy'"); ok(g2.eval('supCode()') === false && g2.eval('SUP.code') === 0, '違うコードで登録できた');
  g2.eval("$('supcode').value=' pachi-nvtu-wbwd '"); const gem0 = g2.eval('RES.gem');
  ok(g2.eval('supCode()') === true && g2.eval('SUP.code') === 1 && JSON.parse(g2.store.pachi2_sup).code === 1, 'サポーターコードで登録できない');
  ok(g2.eval('RES.gem') === gem0 + 30 && /^\d{4}-\d\d-\d\d$/.test(JSON.parse(g2.store.pachi2_sup).at) && g2.eval('SUPTAB.n') === '応援★', 'パトロン特典(宝石30/登録日/タブ)');
  g2.eval("$('supcode').value='PACHI-NVTU-WBWD'"); g2.eval('supCode()'); ok(g2.eval('RES.gem') === gem0 + 30, '宝石が2回もらえる');
  ok(/^https:\/\/fukabuchi\.booth\.pm\//.test(g2.eval('BOOTH_URL')) && g2.eval('SUPPORT_URL') === g2.eval('BOOTH_URL'), 'BOOTH の URL');
}
// (i) ランキング(97t): 自己ベスト記録 / 名前の検証 / 既定は通信しない / プロバイダへ送信
{
  const g = createGame({ seed: 11 }); g.start(); g.advance(1);
  ok(g.eval('rkProvider()') === '', '既定でオンライン接続している');
  g.eval('G.stage=33;X.best=33'); g.advance(1.2); ok(g.eval('RK.best.stage') === 33, '自己ベスト(ステージ)');
  ok(g.eval("rkName('<b>あいう&えお12345678</b>')") === 'bあいうえお1234', '名前の検証: ' + g.eval("rkName('<b>あいう&えお12345678</b>')"));
  g.eval("var __sub=[];window.PachiNative=Object.assign(window.PachiNative||{},{rank:{submit:(b,v,n)=>{__sub.push([b,v,n]);return Promise.resolve(true)},top:b=>Promise.resolve([{name:'A',score:9},{name:'<x>',score:'5'}])}});RK.name='テスト';RK.last=-99;RK.pend.stage=33");
  g.advance(1.2); await tick(); ok(g.eval('__sub.length') >= 1 && g.eval('__sub[0][0]') === 'stage', '送信されない: ' + g.eval('JSON.stringify(__sub)'));
  g.eval("rkFetch('stage')"); await tick(); await tick(); g.advance(.2); ok(g.eval('RK.top.stage.length') === 2 && g.eval('RK.top.stage[1].name') === 'x', 'ランキング取得: ' + g.eval('JSON.stringify(RK.top)'));
  ok(/自己ベスト/.test(g.eval('rkShareText()')), '共有テキスト');
}
// (j) ログインボーナス(92b): 初日/連続/途切れ/同日2回目なし
{
  const g = createGame({ seed: 12 }); g.start();
  g.eval("var __d='2026-11-01';dailyToday=()=>__d;DLY.last='';DLY.streak=0");
  const ms0 = g.eval('RES.ms'), gm0 = g.eval('RES.gem');
  const r1 = g.eval('dailyClaim()'); ok(r1 && r1.streak === 1 && g.eval('RES.gem') === gm0 + 1 && g.eval('RES.ms') > ms0, '初日');
  ok(g.eval('dailyClaim()') === null, '同日に2回もらえる');
  g.eval("__d='2026-11-02'"); ok(g.eval('dailyClaim().streak') === 2, '連続');
  g.eval("for(const d of ['03','04','05','06']){__d='2026-11-'+d;dailyClaim()}__d='2026-11-07'"); const r7 = g.eval('dailyClaim()'); ok(r7.day === 7 && r7.gem === 5, '7日目の宝石5');
  g.eval("__d='2026-11-10'"); ok(g.eval('dailyClaim().streak') === 1, '途切れたら1日目');
  g.eval("__d='2026-12-01';DLY.last='2026-11-30';DLY.streak=3"); ok(g.eval('dailyClaim().streak') === 4, '月またぎの連続');
  ok(JSON.parse(g.store.pachi2_daily).last === '2026-12-01', 'ログインボーナスの保存');
}
// (k) ログインボーナスの「受け取る!」で閉じる / JACKPOT パネル / デイリーミッション / 魔石くじ
{
  const g = createGame({ seed: 13 }); g.start(); g.advance(1);
  g.eval("dailyShow({day:1,streak:1,ms:10,gem:1})"); ok(g.eval('fxOpen') === true, 'ログボが開かない');
  g.eval('fxBtn(0)'); ok(g.eval('fxOpen') === false, 'ログボの受け取るで閉じない');
  const gold0 = g.eval('G.gold'); g.eval('G.pool=5000;G.roul=1;jackpot()');
  ok(g.eval('!!JPX.p') && g.eval('G.jp') >= 6.9 && g.eval('JPX.p.pool') === 5000 && g.eval('JPX.coins.length') > 0, 'JACKPOT パネル');
  ok(g.eval('JPX.p.tot') === Math.floor(g.eval('G.gold') - gold0) && g.eval('JPX.p.tot') >= 5000, 'JACKPOT 合計: ' + g.eval('JPX.p.tot'));
  g.advance(10); ok(g.eval('!JPX.p') && g.eval('JPX.coins.length') === 0, 'JACKPOT 演出が残る');
  // ミッション
  g.eval("MS={d:msToday(),ids:[0,1,2],lv:[0,0,0],p:[0,0,0],c:[0,0,0],b:0,s0:G.stage};msSave()");
  for (let i = 0; i < 5; i++) g.eval('msAdd("hit")'); ok(g.eval('MS.p[0]') === 5, 'ミッション進捗');
  const gem0 = g.eval('RES.gem'); g.eval('msClaim(0)'); ok(g.eval('MS.c[0]') === 1 && g.eval('RES.gem') === gem0 + 2, 'ミッション報酬');
  g.eval('msClaim(1)'); ok(g.eval('MS.c[1]') === 0, '未達成で受け取れた');
  g.eval('MS.p[1]=99;MS.p[2]=999;msClaim(1);msClaim(2)'); ok(g.eval('MS.b') === 1 && g.eval('RES.gem') === gem0 + 2 + 2 + 2 + 5, '全達成ボーナス: ' + (g.eval('RES.gem') - gem0));
  g.eval("MS.d='2000-01-01'"); g.eval('msCheckDay()'); ok(g.eval('MS.d') !== '2000-01-01' && g.eval('MS.c.join()') === '0,0,0' && new Set(g.eval('MS.ids')).size === 3, '日付で入れ替わらない');
  // くじ
  g.eval('RES.ms=1000;G.gold=0'); g.eval('kujiDraw(10)'); ok(g.eval('RES.ms') >= 0 && g.eval('RES.ms') % 200 === 0 && g.eval('fxOpen') === true, '10連');
  g.eval('fxClose();RES.ms=50'); g.eval('kujiDraw(1)'); ok(g.eval('RES.ms') === 50, '魔石不足で引けた');
  let cnt = {}; for (let i = 0; i < 2000; i++) { const k = g.eval('kujiRoll().k'); cnt[k] = (cnt[k] || 0) + 1 }
  ok(cnt.gold > 800 && cnt.gold < 1100 && cnt.wpn > 30 && cnt.wpn < 140, 'くじの確率: ' + JSON.stringify(cnt));
}
// (l) 強化画面のグループ(鍛冶屋/魂の祭壇はメニューから移動)/ 押せ!! の文字分割
{
  const g = createGame({ seed: 14 }); g.start(); g.advance(1);
  ok(g.eval("FM.every(m=>m.n!=='鍛冶屋'&&m.n!=='魂の祭壇')") && g.eval('UPG.list.map(x=>x[0]).join()') === '通常強化,鍛冶屋,魂の祭壇', 'グループの移動: ' + g.eval('UPG.list.map(x=>x[0]).join()'));
  g.eval('grpSet(1)'); ok(g.eval('UPG.g') === 1 && /鍛冶屋/.test(g.eval("$('upx').innerHTML")), '鍛冶屋が強化画面に出ない');
  g.eval('RES.ms=1e6;fxOpen=false;smithUp(0)'); ok(g.eval('RES.w[0]') === 1 && g.eval('fxOpen') === false, '強化画面から買うとメニューが開く');
  g.eval('grpSet(2)'); ok(/魂の祭壇/.test(g.eval("$('upx').innerHTML")), '魂の祭壇が強化画面に出ない');
  g.eval('grpSet(0)'); ok(g.eval('UPG.g') === 0, '通常強化に戻れない');
  g.eval("PUSH=null;pushPrompt(()=>{},{jp:1,ms:20000})"); ok(/class="ch"/.test(g.eval("$('pkT').innerHTML")) && /押/.test(g.eval("$('pkT').innerHTML")), '押せ!! の文字分割: ' + g.eval("$('pkT').innerHTML"));
}
})().then(() => {
if (bad) { console.error(bad + ' failure(s)'); process.exit(1) }
console.log('CONTENT OK');
});
