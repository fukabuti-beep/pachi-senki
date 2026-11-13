// 遠征(98d) / ボーナスタイム(98e) / ハイ&ロー(98f): セーブ互換・効果・自動決着・転生で残る
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const busyOff = 'sp=null;RL=null;G.roul=0;G.jp=0;cut=null;MG=null;MG2=null;HL=null;PUSH=null;if(typeof JPX!=="undefined")JPX.p=null;if(typeof HEV!=="undefined")HEV.jr=null;if(typeof UJ!=="undefined")UJ.s=0;';
// (a) 遠征: 出発 → 実時間で帰還 → 受け取り → 保存 → 転生でも残る
{
  const g = createGame({ seed: 1 }); g.start(); g.advance(1);
  ok(g.eval('EXP.d') === -1 && g.eval('expOpen(0)') && !g.eval('expOpen(2)'), '初期の遠征状態');
  ok(g.eval('expGo(2)') === false, '未解放の行き先に出発できた');
  ok(g.eval('expGo(0)') === true && g.eval('EXP.d') === 0, '出発できない');
  ok(g.eval('expGo(0)') === false, '遠征中に二重出発できた');
  ok(JSON.parse(g.store.pachi2_exp).d === 0, '出発が保存されない');
  ok(g.eval('expClaim()') === null, '帰還前に受け取れた');
  g.eval('EXP.t0-=1801*1000'); g.advance(2);
  ok(g.eval('expDone()') && g.eval('EXP.ntf') === 1, '帰還の通知が無い');
  ok(g.els.fxmbi.style.display === 'block', 'メニューボタンの ! が出ない');
  const ms0 = g.eval('RES.ms'); g.eval('var __r=expClaim()');
  ok(g.eval('__r&&__r.ms>0') && g.eval('RES.ms') === ms0 + g.eval('__r.ms'), '魔石が増えない');
  ok(g.eval('EXP.d') === -1 && g.eval('EXP.n') === 1 && g.els.fxmbi.style.display === 'none', '受け取り後の状態');
  // 竜の巣(遺物のチャンスあり)を何度も回しても壊れない / 大成功が出る
  g.eval('X.best=60'); let big = 0;
  for (let i = 0; i < 60; i++) { g.eval('expGo(2);EXP.t0-=28801*1000'); const r = g.eval('JSON.stringify(expClaim())'); if (JSON.parse(r).big) big++; }
  ok(big > 0 && big < 30, '大成功の頻度: ' + big);
  ok(g.eval('Object.values(RLV).every(v=>v<=RLMAX)'), '遺物の上限');
  g.eval('expGo(1)');
  g.eval(busyOff + 'G.stage=60;presDo()');
  ok(g.eval('G.stage') === 1 && g.eval('EXP.d') === 1 && g.eval('EXP.n') === 61, '転生で遠征が消えた');
  // 時計の巻き戻し: 出発時刻が未来なら今に直す(マイナス残りにならない)
  g.eval('EXP.t0=Date.now()+1e9'); ok(g.eval('expLeft()') <= 7200 && g.eval('EXP.t0') <= g.eval('Date.now()'), '時計の巻き戻し');
  ok(g.eval('expMenu()').includes('遠征'), 'メニュー');
  g.eval('expCancel()'); ok(g.eval('EXP.d') === -1, '呼び戻し');
  g.eval('expGo(0);EXP.t0-=2e6;expCollect()'); ok(g.eval('fxOpen') && g.eval('EXP.d') === -1, '受け取りモーダル');
  const g2 = createGame({ seed: 1, storage: { pachi2_exp: '{bad' } }); ok(g2.eval('EXP.d') === -1, '壊れた遠征セーブ');
  const g3 = createGame({ seed: 1, storage: { pachi2_exp: JSON.stringify({ d: 9, t0: 'x', n: -5 }) } }); ok(g3.eval('EXP.d') === -1 && g3.eval('EXP.n') === 0, '不正な遠征セーブ');
  const g4 = createGame({ seed: 1, storage: { pachi2_exp: JSON.stringify({ d: 1, t0: 1, n: 3 }) } }); g4.start(); g4.advance(2);
  ok(g4.eval('expDone()') && g4.eval('EXP.n') === 3 && g4.els.fxmbi.style.display === 'block', '帰還済みセーブの復元');
}
// (b) ボーナスタイム: 発生 → 効果 → 40秒で終了 → 次の予定 / 演出中は待つ / 保存
{
  const g = createGame({ seed: 2 }); g.start(); g.advance(1);
  const a0 = g.eval('SB.a()'), g0 = g.eval('SB.g()');
  g.eval('btStart(2)'); ok(Math.abs(g.eval('SB.a()') / a0 - 2) < 1e-9 && g.eval('SB.g()') === g0, '討伐タイムの効果');
  g.advance(41); ok(g.eval('BT.cur') === null && g.eval('BT.left') > 100 && g.eval('SB.a()') === a0, '終了しない/効果が残る');
  g.eval('btStart(0)'); ok(Math.abs(g.eval('SB.g()') / g0 - 2) < 1e-9, '黄金タイムの効果');
  g.eval('BT.cur=null;btStart(1)'); const m0 = g.eval('RES.ms'); g.eval('resMs(10)'); ok(g.eval('RES.ms') === m0 + 30, '魔石フィーバーの効果');
  g.advance(6); ok(JSON.parse(g.store.pachi2_bt).k === 1, '実行中の保存');
  g.eval('BT.cur=null;BT.left=0.5;G.roul=1'); g.advance(2); ok(g.eval('BT.cur') === null, '演出中に始まった');
  g.eval('G.roul=0'); g.advance(1); ok(g.eval('BT.cur') !== null, '演出後に始まらない');
  ok(g.eval('btGolden(new Date(2026,0,1,12,30))') && g.eval('btGolden(new Date(2026,0,1,21,0))') && !g.eval('btGolden(new Date(2026,0,1,15,0))'), 'ゴールデンタイム判定');
  ok(g.eval('btMenu()').includes('ボーナスタイム'), 'メニュー');
  // 15分放置で自然に発生する
  const g2 = createGame({ seed: 3 }); g2.start(); g2.advance(900, .1); ok(g2.eval('BT.n') >= 1, '自然発生しない: ' + g2.eval('BT.n'));
  const g3 = createGame({ seed: 3, storage: { pachi2_bt: JSON.stringify({ left: 'x', k: 1, rem: 20, n: 4 }) } }); g3.start(); g3.advance(1);
  ok(g3.eval('BT.cur&&BT.cur.k') === 1 && g3.eval('BT.n') === 4 && g3.eval('BT.left') === 240, '保存の復元');
  const g4 = createGame({ seed: 3, storage: { pachi2_bt: '{bad' } }); ok(g4.eval('BT.cur') === null, '壊れたセーブ');
}
// (c) ハイ&ロー: STAGE30 でローテーションに入る / 放置で自動決着 / 報酬は必ず x1 以上 / 他のミニゲームと重ならない
{
  const g = createGame({ seed: 4 }); g.start(); g.advance(1);
  ok(g.eval("MGT.some(m=>m[0]==='hilo'&&m[2]===30)"), 'MGT に入っていない');
  let seen = 0, golds = [];
  for (let k = 0; k < 12; k++) {
    g.eval(busyOff + 'G.stage=35;X.mgi=3;var __g0=G.gold;MI.go=1;mini()');
    if (g.eval('!!HL')) { seen++; g.eval('mini()'); ok(!g.eval('!!MG') && !g.eval('!!MG2'), 'ハイ&ロー中に別のミニゲーム');
      for (let i = 0; i < 60 && g.eval('!!HL'); i++) g.advance(.5);
      ok(!g.eval('!!HL'), '自動で決着しない'); golds.push(g.eval('G.gold-__g0')); }
  }
  ok(seen === 12, 'ハイ&ローが始まらない: ' + seen);
  ok(golds.every(v => v >= g.eval('HLB()') * .99), '報酬が x1 未満: ' + golds);
  // 手で選ぶ: 当たり判定(同じ数字は当たり)
  g.eval(busyOff + 'hlStart();HL.a=7;hlChoose(1,0);HL.b=7;hlJudge()'); ok(g.eval('HL.w') === 1, '同値が当たりにならない');
  g.eval('HL.ph=0;HL.a=13;hlChoose(1,0);HL.b=2;hlJudge()'); ok(g.eval('HL.w') === 1 && g.eval('HL.fl') === 0, 'はずれ判定');
  g.eval('hlEnd()');
  const p0 = g.eval('X.st.mgp'); g.eval('hlStart();HL.w=3;hlFin()'); ok(g.eval('X.st.mgp') === p0 + 1, '3連勝が大成功にならない'); g.eval('hlEnd()');
  // 遺物の演出はハイ&ロー後
  g.eval(busyOff + 'hlStart();RDR.q={r:RLD[0],lv:1,nw:1,ready:0};RDR.show=null'); g.advance(1); ok(!g.eval('!!RDR.show'), 'ハイ&ロー中に遺物演出');
  for (let i = 0; i < 60 && g.eval('!!HL'); i++) g.advance(.5); g.advance(1); ok(g.eval('!!RDR.show') || g.eval('RDR.q') === null, '遺物演出が出ない');
}
// (d) 長時間: 例外ゼロ
{
  const g = createGame({ seed: 5 }); g.start(); g.eval('X.best=60;G.stage=40;expGo(2)'); g.advance(600, .1);
  ok(g.eval('FERR') === 0, 'featUpdate 例外: ' + g.eval('FERR'));
}
if (bad) { console.error('content2: ' + bad + ' failed'); process.exit(1) } else console.log('content2 OK');
