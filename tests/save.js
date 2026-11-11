// セーブデータの整備(97w): 引き継ぎコードの書き出し→読み込み / 壊れたコードは拒否 / 自動バックアップ3世代 / 壊れたセーブの検出と復元
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
(async () => {
  // 1) 書き出し→別の端末(空のセーブ)で読み込み
  const st1 = {}; const g = createGame({ seed: 1, storage: st1 }); g.start(); g.advance(1);
  g.eval('G.stage=42;G.gold=123456;localStorage.setItem("pachi2",JSON.stringify({v:2,gold:G.gold,stage:G.stage,lv:G.lv}));RES.gem=77;resSave&&resSave()');
  const code = g.eval('svCode()'); ok(/^PACHI2:[A-Za-z0-9+/=]+:[a-z0-9]+$/.test(code), 'コードの形: ' + code.slice(0, 30));
  ok(g.eval(`!!svParse(${JSON.stringify(code)})`), '自分のコードが読めない');
  ok(g.eval(`svParse(${JSON.stringify(code.slice(0, -2) + 'zz')})`) === null, '壊れたコードを受け付けた');
  ok(g.eval(`svParse("PACHI2:abc:def")`) === null && g.eval(`svParse("")`) === null, '変なコードを受け付けた');
  const st2 = {}; const h = createGame({ seed: 2, storage: st2 }); h.start(); h.advance(5, .05);   // 自動保存(4秒)で pachi2 ができてから
  h.eval('window.__rl=0;window.location=window.location||{};window.location.reload=()=>{window.__rl=1}');
  const r = h.eval(`(function(){const p=svParse(${JSON.stringify(code)});return svApply(p.d)})()`);
  ok(r === true && h.eval('window.__rl') === 1, '読み込みで再読込しない');
  ok(JSON.parse(h.eval('localStorage.getItem("pachi2")')).stage === 42, '読み込んだ STAGE: ' + h.eval('localStorage.getItem("pachi2")'));
  ok(h.eval('localStorage.getItem("pachi2_res")') !== null, '他の項目(魔石/宝石)も移る');
  ok(h.eval('svBaks().some(b=>b.why==="読み込み前")'), '読み込み前の状態がバックアップに残らない');
  // 2) 自動バックアップは最大3世代
  for (let i = 0; i < 5; i++) g.eval(`svBackup("手動",1)`); ok(g.eval('svBaks().length') === 3, 'バックアップの数: ' + g.eval('svBaks().length'));
  ok(g.eval('localStorage.getItem("pbak_pachi2")') !== null && !/pbak/.test(g.eval('JSON.stringify(Object.keys(svCollect()))')), 'バックアップが引き継ぎコードに混ざる');
  g.advance(650, .05); ok(g.eval('svBaks()[0].why') === '自動', '10分で自動バックアップされない');
  // 3) 壊れたセーブ: 検出→自動バックアップを止める→案内→戻せる
  const good = JSON.stringify([{ t: Date.now(), why: '自動', st: 55, best: 60, d: { pachi2: JSON.stringify({ v: 2, gold: 9, stage: 55, lv: [] }) } }]);
  const st3 = { pachi2: '{broken', pbak_pachi2: good }; const k = createGame({ seed: 3, storage: st3 }); k.start();
  ok(k.eval('SV.broken') === 1, '壊れたセーブを検出しない');
  k.advance(5, .05); ok(k.eval('SV.told') === 1 && k.eval('fxOpen') === true, '復元の案内が出ない');
  ok(k.eval('svBackup("自動")') === false && JSON.parse(k.eval('localStorage.getItem("pbak_pachi2")'))[0].st === 55, '壊れた状態で無事なバックアップを上書きした');
  k.eval('window.__rl=0;window.location=window.location||{};window.location.reload=()=>{window.__rl=1};SV.broken=0;svApply(svBaks()[0].d)');
  ok(JSON.parse(k.eval('localStorage.getItem("pachi2")')).stage === 55 && k.eval('window.__rl') === 1, 'バックアップから戻せない');
  // 4) メニュー
  ok(g.eval('FM.some(m=>m.n==="セーブ")&&fmgOf("セーブ")===FMGRP.findIndex(q=>q.n==="その他")'), 'メニュー「その他」にセーブが無い');
  ok(/svcode/.test(g.eval('svMenu()')), 'セーブ画面');
  if (fails) { console.error(fails + ' save failure(s)'); process.exit(1); }
  console.log('SAVE OK');
})();
