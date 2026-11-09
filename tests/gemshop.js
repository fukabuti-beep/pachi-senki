// 宝石ショップ(98i): 購入/残高不足/上限/効果/セーブ・旧セーブ・壊れたセーブ/転生で残る/メニュー表示
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const busyOff = 'sp=null;G.roul=0;G.jp=0;cut=null;MG=null;MG2=null;HL=null;';
{
  const g = createGame({ seed: 21 }); g.start(); g.advance(2);
  // 初期状態(旧セーブ=pachi2_gemshop 無し)
  ok(g.eval('GS.spent') === 0 && g.eval('gsLv("atk")') === 0 && g.eval('GS.sel.title') === -1, '初期状態がおかしい');
  ok(g.eval('fmgOf("宝石ショップ")') === g.eval('FMGRP.findIndex(x=>x.n==="育てる")'), '「育てる」グループに入らない');
  // 残高不足: 何も変わらない
  g.eval('RES.gem=5');
  ok(g.eval('gsBuyM("atk")') === false && g.eval('RES.gem') === 5 && g.eval('gsLv("atk")') === 0, '残高不足なのに買えた');
  ok(g.eval('gsBuyB("ms")') === true && g.eval('RES.gem') === 2, 'ブーストが買えない');
  ok(g.eval('gsBuyB("luck")') === false && g.eval('RES.gem') === 2, '残高不足のブーストが買えた');
  ok(g.eval('gsBuyC("cab",1)') === false && g.eval('GS.own.cab.length') === 1, '残高不足の見た目が買えた');
  // 勲章: 値段が上がる・上限
  g.eval('RES.gem=10000');
  const a0 = g.eval('SB.a()'), g0 = g.eval('SB.g()');
  ok(g.eval('gsBuyM("atk")') && g.eval('RES.gem') === 9990, '勲章 Lv1 の値段');
  ok(g.eval('gsBuyM("atk")') && g.eval('RES.gem') === 9975, '勲章 Lv2 の値段');
  ok(Math.abs(g.eval('SB.a()') / a0 - 1.08) < 1e-6, 'ダメージ倍率が反映されない: ' + g.eval('SB.a()') / a0);
  g.eval('gsBuyM("gold")'); ok(Math.abs(g.eval('SB.g()') / g0 - 1.04) < 1e-6, 'ゴールド倍率');
  for (let i = 0; i < 20; i++) g.eval('gsBuyM("atk")');
  ok(g.eval('gsLv("atk")') === 10, '上限を超えた: ' + g.eval('gsLv("atk")'));
  const gm = g.eval('RES.gem'); ok(g.eval('gsBuyM("atk")') === false && g.eval('RES.gem') === gm, 'MAX なのに宝石が減った');
  ok(g.eval('gsMenu()') !== '', 'メニュー');
  // 祭りの太鼓 → BT.dur
  g.eval('gsBuyM("bt");gsBuyM("bt")'); ok(g.eval('BT.dur') === 48, 'ボーナスタイムの長さ: ' + g.eval('BT.dur'));
  // 魔石: 勲章 + 加護
  g.eval('gsBuyM("ms")'); const m0 = g.eval('RES.ms'); g.eval('BT.cur=null;resMs(10)');
  ok(g.eval('RES.ms') - m0 === 22, '魔石 x1.1 x2 にならない: ' + (g.eval('RES.ms') - m0));
  // ブーストの重ねがけ上限
  g.eval('GS.bf.ms=0'); let n = 0; for (let i = 0; i < 10; i++) if (g.eval('gsBuyB("ms")')) n++;
  ok(n === 6 && g.eval('GS.bf.ms') === 1800, 'ブーストの上限: ' + n);
  // ゲーム時間で減る
  g.eval('GS.bf.luck=10'); g.advance(12); ok(g.eval('GS.bf.luck') === 0, 'ブーストが減らない');
  // 幸運の香: 大当たり判定が増える(通常時)
  g.eval('G.rush=0;DRY=0'); const hits = s => g.eval(`(function(){let n=0;GS.bf.luck=${s};for(let i=0;i<4000;i++){DRY=0;if(hitRoll())n++}GS.bf.luck=0;DRY=0;return n})()`);
  const h0 = hits(0), h1 = hits(900); ok(h1 > h0 * 1.3 && h1 < h0 * 1.8, '幸運の香の効果: ' + h0 + ' -> ' + h1);
  // ボーナスタイム招来
  g.eval(busyOff + 'BT.cur=null'); const gb = g.eval('RES.gem');
  ok(g.eval('gsCallBt()') && g.eval('!!BT.cur') && g.eval('RES.gem') === gb - 3, '招来できない');
  ok(g.eval('gsCallBt()') === false && g.eval('RES.gem') === gb - 3, 'ボーナスタイム中に招来できた');
  // 遠征: 羅針盤 / 早馬
  g.eval('X.best=60;EXP.d=-1'); g.eval('gsBuyM("exp")');
  ok(g.eval('expGo(2)'), '遠征に出発できない');
  const l = g.eval('expLeft()'); ok(Math.abs(l - 28800 * .94) < 5, '羅針盤で短くならない: ' + l);
  const ge = g.eval('RES.gem'); ok(g.eval('gsExpRush(0)') && g.eval('RES.gem') === ge - 2 && Math.abs(g.eval('expLeft()') - (l - 3600)) < 5, '1時間短縮');
  const nc = g.eval('gsNowCost()'); ok(nc === Math.ceil(g.eval('expLeft()') / 1800), '今すぐの値段');
  ok(g.eval('gsExpRush(1)') && g.eval('expDone()'), '今すぐ帰還できない');
  ok(g.eval('expClaim()') !== null, '帰還後に受け取れない');
  ok(g.eval('gsExpRush(0)') === false, '遠征中でないのに早馬が使えた');
  // ミッション入れ替え(1日1回・達成済みは不可)
  g.eval('msCheckDay();MS.c=[0,0,0];MS.p=[0,0,0]'); const id0 = g.eval('MS.ids[0]');
  ok(g.eval('gsSwap(0)') && g.eval('MS.ids[0]') !== id0 && g.eval('MS.ids[0]') !== g.eval('MS.ids[1]') && g.eval('MS.ids[0]') !== g.eval('MS.ids[2]'), '入れ替えできない');
  ok(g.eval('MSD[MS.ids[0]].k') !== 'stage', 'ステージ系に入れ替わった');
  ok(g.eval('gsSwap(1)') === false, '1日2回入れ替えできた');
  g.eval('GS.sw="";MS.p[1]=msGoal(1)'); ok(g.eval('gsSwap(1)') === false, '達成済みを入れ替えできた');
  // ターボ: 自動強化が無いと買えない
  g.eval('SOUL.lv.auto=0'); const gk = g.eval('RES.gem'); ok(g.eval('gsBuyTurbo()') === false && g.eval('RES.gem') === gk, '自動強化なしでターボが買えた');
  g.eval('SOUL.lv.auto=1'); ok(g.eval('gsBuyTurbo()') && g.eval('RES.gem') === gk - 20 && g.eval('GS.own.turbo') === 1, 'ターボが買えない');
  // 見た目: 購入・付け替え・称号の取り外し
  ok(g.eval('gsBuyC("ball",3)') && g.eval('GS.sel.ball') === 3, '玉の色');
  ok(g.eval('gsBuyC("ball",0)') && g.eval('GS.sel.ball') === 0, '付け替え(持っている物は無料)');
  const gt = g.eval('RES.gem'); ok(g.eval('gsBuyC("ball",3)') && g.eval('RES.gem') === gt, '2回目に宝石が減った');
  ok(g.eval('gsBuyC("title",2)') && g.eval('GS.sel.title') === 2 && g.eval('gsBuyC("title",2)') && g.eval('GS.sel.title') === -1, '称号の付け外し');
  g.eval('gsBuyC("title",2);gsBuyC("cab",2);gsBuyC("reel",1)');
  ok(g.eval('pxText(pc,"7 1 3",180,242,5,"#ffe14d","#ff9a2a","c")') === undefined, '図柄の描画で例外');
  g.eval('drawB(1)'); ok(g.eval('FERR') === 0, 'FERR');
  // 転生しても残る
  const before = g.eval('JSON.stringify({lv:GSM.map(m=>gsLv(m.k)),own:GS.own,sel:GS.sel})');
  g.eval(busyOff + 'G.stage=80;X.best=80'); const gn = g.eval('presDo()'); ok(gn > 0, '転生できない');
  ok(g.eval('JSON.stringify({lv:GSM.map(m=>gsLv(m.k)),own:GS.own,sel:GS.sel})') === before, '転生で消えた');
  g.eval('gsSave()'); const st = g.store.pachi2_gemshop;
  // 読み込み直し
  const g2 = createGame({ seed: 22, storage: { pachi2_gemshop: st, pachi2_res: g.store.pachi2_res } }); g2.start(); g2.advance(1);
  ok(g2.eval('JSON.stringify({lv:GSM.map(m=>gsLv(m.k)),own:GS.own,sel:GS.sel})') === before, 'セーブから戻らない');
  ok(g2.eval('BT.dur') === 48, '読み込み後に BT.dur が反映されない');
  ok(g2.eval('GS.spent') === g.eval('GS.spent'), 'spent');
}
{ // 壊れた/不正なセーブ
  const g = createGame({ seed: 23, storage: { pachi2_gemshop: '{"lv":{"atk":99,"gold":"x","zzz":3},"own":{"ball":[0,99,-1,"2"],"title":[1]},"sel":{"ball":5,"title":1,"cab":3},"bf":{"ms":99999},"spent":-5}' } });
  g.start(); g.advance(1);
  ok(g.eval('gsLv("atk")') === 10 && g.eval('gsLv("gold")') === 0 && g.eval('GS.lv.zzz') === undefined, '勲章の不正値');
  ok(g.eval('JSON.stringify(GS.own.ball)') === '[0,2]' && g.eval('GS.sel.ball') === 0, '持っていない玉を選べた: ' + g.eval('JSON.stringify(GS.own.ball)'));
  ok(g.eval('GS.sel.title') === 1 && g.eval('GS.sel.cab') === 0, '称号/筐体の選択');
  ok(g.eval('GS.bf.ms') <= 1800 && g.eval('GS.bf.ms') > 1790 && g.eval('GS.spent') === 0, 'ブースト/累計の上限');
  const g2 = createGame({ seed: 24, storage: { pachi2_gemshop: 'not json' } }); g2.start(); g2.advance(1);
  ok(g2.eval('GS.spent') === 0 && g2.eval('FERR') === 0, '壊れた JSON で落ちる');
}
{ // 長時間放置で例外なし(自動購入あり)
  const g = createGame({ seed: 25 }); g.start(); g.eval('RES.gem=500;GS.bf.luck=900;GS.bf.ms=900');
  for (let i = 0; i < 300; i++) { g.advance(1, 0.05); g.eval('gsAutoBuy()'); }
  ok(g.eval('FERR') === 0 && g.eval('Number.isFinite(G.gold)&&Number.isFinite(RES.ms)'), '長時間で例外/NaN');
}
if (bad) { console.error('gemshop: ' + bad + ' failed'); process.exit(1); }
console.log('gemshop: ok');
