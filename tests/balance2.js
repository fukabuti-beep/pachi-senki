// バランス第2弾: 転生の魂(記録超えは満額・記録までは BAL.soulRep)/ PREC の保存と旧セーブ移行 / 強化の上限解放 / 新強化(ボス特効・魂の収穫)のセーブ互換と効果
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const F = s => s < 30 ? 0 : 5 * Math.pow(s / 30, 2.5);
const st = (o, x, extra) => Object.assign({ pachi2: JSON.stringify(Object.assign({ v: 2, gold: 5, stage: 7, lv: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }, o)) }, x ? { pachi2x: JSON.stringify(x) } : {}, extra || {});
// (a) 新規: 初回は従来どおり F(s)。転生で PREC=記録 → 記録までは soulRep、超えた分は満額
{
  const g = createGame({ seed: 1 }); g.start(); g.advance(1);
  ok(g.eval('PREC') === 0, '新規の PREC: ' + g.eval('PREC'));
  ok(g.eval('soulGain(29)') === 0 && g.eval('soulGain(30)') === 5 && g.eval('soulGain(50)') === Math.floor(F(50)), '初回の魂: ' + g.eval('soulGain(50)'));
  g.eval('if(fxOpen)fxClose();G.stage=50;X.best=50;spawn()'); const gn = g.eval('presDo()');
  ok(gn === Math.floor(F(50)), '初回転生の魂 ' + gn);
  ok(g.eval('PREC') === 50 && JSON.parse(g.store.pachi2_prec).b === 50, 'PREC の保存: ' + g.store.pachi2_prec);
  const rep = g.eval('BAL.soulRep');
  ok(rep > 0 && rep < 1, 'soulRep ' + rep);
  ok(g.eval('soulGain(50)') === Math.floor(F(50) * rep), '記録と同じ STAGE: ' + g.eval('soulGain(50)'));
  ok(g.eval('soulGain(40)') === Math.floor(F(40) * rep), '記録より手前: ' + g.eval('soulGain(40)'));
  ok(g.eval('soulGain(60)') === Math.floor(F(60) - (1 - rep) * F(50)), '記録超え: ' + g.eval('soulGain(60)'));
  ok(g.eval('soulGain(30)') >= 1, '記録より手前でも STAGE30 なら転生できる');
  ok(g.eval('soulGain(60)') >= 2 * g.eval('soulGain(50)'), '記録更新のうま味が薄い');
  // 転生画面の説明に記録が出る
  const h = g.eval('presInfo(55)'); ok(/最高記録 STAGE 50/.test(h) && /記録更新中/.test(h), '説明文: ' + h);
  ok(/記録まであと 10/.test(g.eval('presInfo(40)')), '説明文(手前)');
  // 上限の解放: 転生1回で 当たり確率 MAX12→13。黄金玉/FEVER/SP/RUSH延長は伸びない
  ok(g.eval('UPMAX[2]') === 13 && g.eval('UPMAX[5]') === 16 && g.eval('UPMAX[8]') === 10 && g.eval('UPMAX[9]') === 10 && g.eval('UPMAX[6]') === 8 && g.eval('UPMAX[7]') === 5, '上限の解放: ' + g.eval('JSON.stringify(UPMAX)'));
  g.eval('G.gold=1e15;for(let i=0;i<30;i++)buy(2)'); ok(g.eval('G.lv[2]') === 13 && g.eval('cost(2)') === Infinity, '解放後の MAX: ' + g.eval('G.lv[2]'));
}
// (b) 上限の解放は最大 +5 / 起動時に X.pres から復元
{
  const g = createGame({ seed: 2, storage: st({}, { pres: 9, best: 120, souls: 300 }) }); g.start(); g.advance(1);
  ok(g.eval('UPMAX[2]') === 17 && g.eval('UPMAX[13]') === 15 && g.eval('UPMAX[1]') === 11, '上限+5で頭打ち: ' + g.eval('JSON.stringify(UPMAX)'));
  g.eval('G.gold=1e15;G.stage=30;for(let i=0;i<30;i++)buy(12)');
  ok(g.eval('G.lv[12]') === 15 && g.eval('UPX.evP()') <= g.eval('BAL.evP') + .25 + 1e-9, '招待の内部上限は維持');
}
// (c) 旧セーブ(pachi2_prec 無し)の PREC: 転生済みで記録より手前→X.best / 記録上にいる・未転生→0。一度決めたら保存
{
  const g1 = createGame({ seed: 3, storage: st({ stage: 40 }, { pres: 2, best: 80, souls: 50 }) });
  ok(g1.eval('PREC') === 80 && JSON.parse(g1.store.pachi2_prec).b === 80, '旧セーブ(手前): ' + g1.eval('PREC'));
  const g2 = createGame({ seed: 3, storage: st({ stage: 80 }, { pres: 2, best: 80, souls: 50 }) });
  ok(g2.eval('PREC') === 0, '旧セーブ(記録上): ' + g2.eval('PREC'));
  const g3 = createGame({ seed: 3, storage: st({ stage: 40 }, { pres: 0, best: 80 }) });
  ok(g3.eval('PREC') === 0, '旧セーブ(未転生): ' + g3.eval('PREC'));
  const g4 = createGame({ seed: 3, storage: st({ stage: 40 }, { pres: 2, best: 80 }, { pachi2_prec: '{"b":"x"}' }) });
  ok(g4.eval('PREC') === 80, '壊れた pachi2_prec: ' + g4.eval('PREC'));
  const g5 = createGame({ seed: 3, storage: st({ stage: 40 }, { pres: 2, best: 80 }, { pachi2_prec: '{"b":65}' }) });
  ok(g5.eval('PREC') === 65, '保存済みの PREC: ' + g5.eval('PREC'));
  g5.start(); g5.advance(2); ok(!/NaN|null/.test(g5.eval('JSON.stringify([G.gold,G.hp,soulGain(70)])')), 'NaN');
}
// (d) 新強化: 旧セーブ(10/15個)は Lv1、新セーブは復元。ボス特効はボス戦だけ、魂の収穫は魂に掛かる
{
  const g = createGame({ seed: 4, storage: st({ lv: [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2] }) });
  ok(g.eval('G.lv.length') === g.eval('UP.length') && g.eval('G.lv[15]') === 1 && g.eval('G.lv[16]') === 1 && g.eval('G.lv[14]') === 2, '旧セーブ15個: ' + g.eval('JSON.stringify(G.lv)'));
  const g2 = createGame({ seed: 4, storage: st({ lv: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 3] }) });
  ok(g2.eval('G.lv[15]') === 4 && g2.eval('G.lv[16]') === 3, '新セーブの復元: ' + g2.eval('JSON.stringify(G.lv)'));
  g2.start(); g2.advance(1);
  const a4 = g2.eval('G.aw=0;G.fv=0;G.stage=4;atk()'), a5 = g2.eval('G.stage=5;atk()'), a5b = g2.eval('G.lv[15]=1;atk()');
  ok(Math.abs(a5 / a5b - Math.pow(1.15, 3)) < 1e-9 && Math.abs(a4 - a5b) < 1e-9, 'ボス特効: ' + [a4, a5, a5b]);
  ok(g2.eval('soulGain(60)') === Math.floor(F(60) * 1.12), '魂の収穫 Lv3: ' + g2.eval('soulGain(60)'));
  ok(g2.eval('UP[15][4]') === 30 && g2.eval('UP[16][4]') === 40, '解放ステージ');
  g2.eval('G.lv[16]=1;G.stage=45;G.gold=1e15;for(let i=0;i<20;i++)buy(16)'); ok(g2.eval('G.lv[16]') === 10, '魂の収穫 MAX10: ' + g2.eval('G.lv[16]'));
  g2.advance(5); ok(JSON.parse(g2.store.pachi2).lv.length === g2.eval('UP.length'), 'セーブに新強化');
  // 22-migrate(v<2 の旧セーブ)が読み込み時に atk() を呼んでも壊れない
  const g3 = createGame({ seed: 5, storage: { pachi2: JSON.stringify({ gold: 5, stage: 60, lv: [10, 1, 1, 1, 1, 1, 1, 1, 1, 1] }) } });
  ok(g3.eval('G.stage') >= 1 && g3.eval('G.stage') < 60 && Number.isFinite(g3.eval('G.hp')), 'v1 移行: ' + g3.eval('G.stage'));
}
// (e) 強化シートに新強化のボタンとアイコン / 必殺は間隔の下限を守る
{
  const g = createGame({ seed: 6 }); g.start();
  ok(/id="u16"/.test(g.eval('$("up").innerHTML')) && /id="ic15"/.test(g.eval('$("up").innerHTML')), '強化ボタン');
  ok(g.eval('typeof ICN2.bos') === 'object' && g.eval('ICN2.har.length') === 10, 'アイコン');
  // 必殺の回数は乱数の並びで ±2 ほど揺れるので、3つのシードの平均で見る(1つだけだと他の機能が乱数を使うたびに落ちる)
  let n = 0, mn = Infinity;
  for (const sd of [6, 7, 8]) { const h = sd === 6 ? g : createGame({ seed: sd }); if (sd !== 6) h.start();
    h.eval('__u=[];{const o=ult;ult=function(){__u.push(T);return o.apply(this,arguments)}}'); h.advance(600, 0.05);
    const u = JSON.parse(h.eval('JSON.stringify(__u)')); n += u.length; u.slice(1).forEach((t, i) => { mn = Math.min(mn, t - u[i]) }); }
  ok(n / 3 >= 14.5 && mn >= 14 - 1e-6, '必殺の間隔: 平均n=' + (n / 3).toFixed(1) + ' min=' + mn);
}
if (bad) { console.error(bad + ' failure(s)'); process.exit(1) } console.log('BALANCE2 OK');
