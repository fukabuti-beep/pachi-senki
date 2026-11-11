// 作り手の指摘への対応: リソース消費系は強化画面へ / 魂の祭壇のコスト増と上限なし項目 / ルーレットの占有時間短縮とタップ早送り
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
(async () => {
  const g = createGame({ seed: 1 }); g.start(); g.advance(1);
  ok(g.eval('UPG.list.map(x=>x[0]).join()') === '通常強化,鍛冶屋,魂の祭壇,宝石屋,くじ', '強化画面のグループ: ' + g.eval('UPG.list.map(x=>x[0]).join()'));
  ok(g.eval('!FM.some(m=>["くじ","宝石ショップ","育成","鍛冶屋","魂の祭壇","転生"].includes(m.n))'), 'メニューに消費系タブが残っている: ' + g.eval('FM.map(m=>m.n).join()'));
  for (let i = 1; i < 5; i++) { const h = g.eval(`grpSet(${i});$('upx').innerHTML`); ok(typeof h === 'string' && h.length > 50, 'グループ ' + i + ' が描けない'); }
  // 魂の祭壇: コストは Lv で増える・上限なしの項目がある・効果が乗る
  ok(g.eval("SOULD.find(d=>d.k==='start').c(10)") > g.eval("SOULD.find(d=>d.k==='start').c(0)") * 10, 'コストが増えていない');
  ok(g.eval("SOULD.filter(d=>!isFinite(d.max)).length") >= 2, '上限なしの項目が無い');
  const a0 = g.eval('SB.a()'); g.eval("X.souls+=10000;soulBuy('pow');soulBuy('pow')"); ok(g.eval("soulLv('pow')") === 2 && g.eval('SB.a()') > a0 * 1.15, '魂の力が効かない');
  ok(/Lv2</.test(g.eval("altarHtml()")) || /Lv2/.test(g.eval("altarHtml()")), '上限なし項目の表示');
  // ルーレット: 5秒未満で閉じる / タップで早送り(約1秒)/ 倍率の抽選は 60 のまま
  g.eval('sp=null;G.q=0;QL.length=0;startRoul(100)'); let t = 0; while (g.eval('!!RL') && t < 20) { g.advance(.1); t += .1; g.eval('sp=null') }
  ok(t < 5, 'ルーレットが長い: ' + t.toFixed(1));
  g.eval('startRoul(100)'); g.advance(.2); g.eval('RQ.ff=1'); t = 0; while (g.eval('!!RL') && t < 20) { g.advance(.1); t += .1; g.eval('sp=null') }
  ok(t < 1.6, '早送りが効かない: ' + t.toFixed(1));
  if (fails) { console.error(fails + ' upmove failure(s)'); process.exit(1); }
  console.log('UPMOVE OK');
})();
