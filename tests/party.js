// 遠征隊の編成(98g): 編成/相性ボーナス/経験値と Lv/お土産/後半の行き先/メニューの「!」/セーブ互換/転生で残る
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const busyOff = 'sp=null;RL=null;G.roul=0;G.jp=0;cut=null;MG=null;MG2=null;HL=null;';
{
  const g = createGame({ seed: 11 }); g.start(); g.advance(1);
  ok(g.eval('EXD.length') === 5 && !g.eval('expOpen(3)') && !g.eval('expOpen(4)'), '後半の行き先が最初から解放');
  ok(g.eval("ptToggle('dog')") === false && g.eval('PTY.sel.length') === 0, '未加入の仲間を編成できた');
  ok(g.eval('ptMenu()').includes('STAGE 12'), '仲間なしの案内');
  g.eval('X.best=200');
  ok(g.eval('expOpen(3)') && g.eval('expOpen(4)'), '後半の行き先が解放されない');
  ok(g.eval("ptToggle('dog')") && g.eval("ptToggle('mage')") && g.eval("ptToggle('dragon')"), '編成できない');
  ok(g.eval('JSON.stringify(PTY.sel)') === '["mage","dragon"]', '3人目で先頭が外れない: ' + g.eval('JSON.stringify(PTY.sel)'));
  g.eval("ptToggle('dragon')"); ok(g.eval('JSON.stringify(PTY.sel)') === '["mage"]', '外せない');
  ok(JSON.parse(g.store.pachi2_party).sel[0] === 'mage', '編成が保存されない');
  // 相性ボーナス: ◎ > ○ > なし、上限
  const b = (i, ids) => g.eval('ptBonus(' + i + ',0,' + JSON.stringify(ids) + ').m');
  ok(b(1, ['mage']) > b(1, ['dog']) && b(1, ['dog']) > b(1, ['dragon']) && b(1, []) === 1, '相性の順序');
  g.eval("PTY.lv.mage=20;PTY.lv.golem=20");
  ok(b(3, ['golem', 'mage']) <= 1.8 && g.eval("ptBonus(3,0,['golem','mage']).b") <= .2 + 1e-9, '上限');
  g.eval("PTY.lv.mage=1;PTY.lv.golem=1");
  ok(g.eval('expMenu()').includes('報酬 x') && g.eval('expMenu()').includes('魔王城'), '遠征メニューに見込みが出ない');
  // 出発 → 遠征中は編成を変えられない → 帰還 → 経験値/Lv/お土産
  g.eval("PTY.sel=['dog','dragon']"); ok(g.eval('expGo(0)'), '出発できない');
  ok(g.eval('JSON.stringify(PTY.go)') === '["dog","dragon"]', '出発時の編成が記録されない');
  ok(g.eval("ptToggle('mage')") === false, '遠征中に編成を変えられた');
  g.eval('EXP.t0-=1801*1000'); g.advance(2);
  // メニュー内の「!」: 遊ぶ ボタンと 遠征 タブ
  g.eval('fxTab=FM.findIndex(m=>m.n==="遠征");fxMenu()');
  const html = g.els.fxmc.innerHTML;
  ok((html.match(/mgdot/g) || []).length === 2, 'メニュー内の ! が2つ出ない: ' + (html.match(/mgdot/g) || []).length);
  ok(g.eval('fmgMark("遊ぶ",1)') && g.eval('fmgMark("遠征",0)') && !g.eval('fmgMark("図鑑",0)') && !g.eval('fmgMark("集める",1)'), 'fmgMark の対象');
  const ms0 = g.eval('RES.ms'), gem0 = g.eval('RES.gem');
  g.eval('var __r=expClaim()');
  ok(g.eval('__r.pt.length') === 2 && g.eval('__r.pm') > 1, '仲間の帰還結果が無い');
  ok(g.eval('PTY.go.length') === 0 && g.eval('PTY.trip') === 1 && g.eval('PTY.xp.dog+PTY.lv.dog') > 1, '経験値が入らない');
  const gifts = g.eval('__r.pt.reduce((s,p)=>s+(p.gift&&p.gift.k==="ms"?p.gift.v:0),0)'), ggem = g.eval('__r.pt.reduce((s,p)=>s+(p.gift&&p.gift.k==="gem"?p.gift.v:0),0)');
  ok(g.eval('RES.ms') === ms0 + g.eval('__r.ms') + gifts && g.eval('RES.gem') === gem0 + g.eval('__r.gem') + ggem, 'お土産/報酬の付与');
  ok(!g.eval('fmgMark("遊ぶ",1)'), '受け取り後も ! が残る');
  ok(g.eval('ptHtml(__r)').includes('ポチ'), '帰還モーダルに仲間が出ない');
  // 何度も回す: Lv 上限、経験値、遺物の上限、お土産の頻度、大成功率
  let big = 0, gift = 0, n = 200;
  for (let k = 0; k < n; k++) { g.eval("PTY.sel=['golem','mage'];expGo(3);EXP.t0-=43201*1000"); const r = JSON.parse(g.eval('JSON.stringify(expClaim())')); if (r.big) big++; r.pt.forEach(p => { if (p.gift) gift++ }) }
  ok(g.eval('PTY.lv.golem') === 20 && g.eval('PTY.xp.golem') === 0, 'Lv 上限: ' + g.eval('PTY.lv.golem'));
  ok(big > n * .2 && big < n * .5, '大成功の頻度: ' + big);
  ok(gift > n * 2 * .35 && gift < n * 2 * .65, 'お土産の頻度: ' + gift);
  ok(g.eval('Object.values(RLV).every(v=>v<=RLMAX)'), '遺物の上限');
  ok(g.eval('RLD.every(r=>RLV[r.id]===RLMAX)'), '低Lv優先で全遺物が MAX にならない');
  ok(g.eval('ptRelicLow()') === null, '全 MAX で遺物が出た');
  ok(g.eval('AC_.some(a=>a[0]==="pt10"&&a[4]())'), '実績 pt10');
  g.eval("PTY.sel=['pixie'];expGo(4);EXP.t0-=57601*1000;expClaim()"); ok(g.eval('PTY.sky') === 1 && g.eval('AC_.some(a=>a[0]==="ex5"&&a[4]())'), '天空の神殿の実績');
  ok(g.eval('FM.find(m=>m.n==="仲間").r()').includes('ゴーレム'), '仲間タブに遠征専用の仲間が出ない');
  // 呼び戻しは経験値なし / 転生で残る
  const xp = g.eval('PTY.xp.dog'), lv = g.eval('PTY.lv.dog');
  g.eval("PTY.sel=['dog'];expGo(0);expCancel()"); ok(g.eval('PTY.go.length') === 0 && g.eval('PTY.xp.dog') === xp, '呼び戻しで経験値が入った');
  g.eval("expGo(1)"); g.eval(busyOff + 'G.stage=60;presDo()');
  ok(g.eval('G.stage') === 1 && g.eval('PTY.lv.dog') === lv && g.eval('PTY.go[0]') === 'dog' && g.eval('PTY.lv.golem') === 20, '転生で仲間が消えた');
  // 保存 → 読み直し
  const st = JSON.parse(JSON.stringify(g.store));
  const g2 = createGame({ seed: 11, storage: st }); g2.start(); g2.advance(1);
  ok(g2.eval('PTY.lv.golem') === 20 && g2.eval('PTY.go[0]') === 'dog' && g2.eval('EXP.d') === 1, '読み直し');
}
// 後半の行き先で遠征中のセーブ(d=4)を読める
{
  const g = createGame({ seed: 12, storage: { pachi2_exp: JSON.stringify({ d: 4, t0: 1, n: 2 }), pachi2_party: JSON.stringify({ sel: ['pixie'], go: ['pixie'], lv: { pixie: 3 } }) } });
  g.start(); g.advance(2);
  ok(g.eval('EXP.d') === 4 && g.eval('expDone()') && g.eval('PTY.go[0]') === 'pixie' && g.eval('PTY.lv.pixie') === 3, '後半の遠征中セーブ');
}
// 壊れた/不正なセーブ・旧セーブ(キー無し)
{
  const g = createGame({ seed: 13, storage: { pachi2_party: '{bad' } }); ok(g.eval('PTY.sel.length') === 0 && g.eval('PTY.lv.dog') === 1, '壊れたセーブ');
  const g2 = createGame({ seed: 13, storage: { pachi2_party: JSON.stringify({ sel: ['x', 'dog', 'dog', 'mage', 'dragon'], go: 'a', lv: { dog: 999, mage: -3, dragon: 'q' }, xp: { dog: NaN }, trip: -1 }) } });
  ok(g2.eval('JSON.stringify(PTY.sel)') === '["dog","mage"]' && g2.eval('PTY.go.length') === 0 && g2.eval('PTY.lv.dog') === 20 && g2.eval('PTY.lv.mage') === 1 && g2.eval('PTY.trip') === 0, '不正なセーブ');
  // 旧セーブ: 編成なしの遠征(d=2)を受け取ると従来どおり(倍率1)
  const g3 = createGame({ seed: 14, storage: { pachi2_exp: JSON.stringify({ d: 2, t0: 1, n: 1 }) } }); g3.start(); g3.advance(1);
  g3.eval('var __r=expClaim()'); ok(g3.eval('__r&&__r.pm') === 1 && g3.eval('__r.pt.length') === 0, '旧セーブの遠征');
  // 遠征していないのに go が残っていたら片付ける
  const g4 = createGame({ seed: 14, storage: { pachi2_party: JSON.stringify({ go: ['dog'] }) } }); ok(g4.eval('PTY.go.length') === 0, '残った go');
}
// 長時間: 例外ゼロ(仲間を連れて遠征を回しながら)
{
  const g = createGame({ seed: 15 }); g.start();
  for (let k = 0; k < 10; k++) { g.eval("X.best=Math.max(X.best,140);PTY.sel=['pixie','golem'];if(EXP.d<0)expGo(" + (k % 5) + ");EXP.t0-=6e7"); g.advance(30, .1); g.eval('expClaim()'); }
  ok(g.eval('FERR') === 0, '例外: ' + g.eval('FERR'));
}
if (bad) { console.error('party: ' + bad + ' 件失敗'); process.exit(1) }
console.log('party OK');
