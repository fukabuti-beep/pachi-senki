// エリア(98h-area): 25ステージごとの舞台 / 敵の色違い / エリアの主(図鑑 b4〜b11) / ボスの怒り・形態変化 / タイトル帯
// 見た目のみ: HP・報酬・図鑑の★の仕組みは変えないことも確認する
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const origSpr = st => st % 5 == 0 ? 'b' + ((st / 5 - 1) % 4) : 'm' + ((st - 1 + 3 * Math.floor((st - 1) / 5)) % 10);
{
  const g = createGame({ seed: 11, storage: { pachi2_zukan: JSON.stringify({ m0: 12, b5: 3 }) } });
  // エリアの判定
  ok(JSON.stringify([1, 25, 26, 50, 51, 175, 200, 201, 226].map(s => g.eval(`arArea(${s})`))) === JSON.stringify([0, 0, 1, 1, 2, 6, 7, 0, 1]), 'arArea の区切り');
  ok(g.eval('arLap(201)') === 1 && g.eval('arLap(200)') === 0, '周回(II)の判定');
  // 敵の選択: 25の倍数だけエリアの主、それ以外は従来どおり
  let same = true; for (let s = 1; s <= 260; s++) { const e = g.eval(`enSpr(${s})`); if (s % 25 == 0) { if (e !== 'b' + (4 + ((s / 25 - 1) % 8))) same = false } else if (e !== origSpr(s)) same = false }
  ok(same, '敵スプライトの選択が従来と食い違う / エリアの主のキーが違う');
  for (let i = 4; i <= 11; i++) ok(g.eval(`!!SPR.b${i}&&SPR.b${i}.width===24&&SPR.b${i}.height===24&&!!ZKN.b${i}&&ZKK.includes('b${i}')`), `エリアの主 b${i} のスプライト/図鑑登録`);
  // 図鑑: 保存済みの新キーも読み込まれる・元のキーも壊れない
  ok(g.eval('ZK.b5') === 3 && g.eval('ZK.m0') === 12, '図鑑の撃破数の読み込み: ' + g.eval('JSON.stringify(ZK)'));
  ok(g.eval('zkStar("b5")') === 1 && g.eval('zkStar("b4")') === 0, '新キーの★判定');
  g.start(); g.advance(1.5);
  ok(g.eval('!!AR.title') && g.eval('AR.title.a') === 0, '開始時にエリアタイトルが出ない');
  g.advance(4); ok(g.eval('!AR.title'), 'タイトルが消えない');
  // エリアの主: HP/報酬は従来どおり、怒りは見た目だけ
  g.eval('G.stage=24;spawn();G.hp=1;hurt(10,"#fff")'); g.advance(.2);
  ok(g.eval('enSpr()') === 'b4' && g.eval('G.mx===hpOf(25)'), 'STAGE25 のエリアの主/HP');
  const hp0 = g.eval('G.hp'); g.eval('G.hp=G.mx*.45'); const hpSet = g.eval('G.hp'); g.advance(.1);
  ok(g.eval('AR.rageSt') === 25 && g.eval('AR.form') === 1, 'HP50%で形態変化にならない');
  ok(g.eval('G.hp') <= hpSet && g.eval('G.hp') > 0, '形態変化で HP が回復した');
  ok(g.eval('!!SPR["b4@r"]'), '第2形態のスプライト');
  g.eval('var __g0=G.gold,__zk0=ZK.b4||0;G.hp=1;hurt(10,"#fff")'); g.advance(.1);
  ok(g.eval('(ZK.b4||0)-__zk0') === 1, '図鑑にエリアの主の撃破が数えられない');
  ok(g.eval('!!AR.boom') && g.eval('G.stage') === 26, 'エリアの主の大爆発');
  ok(g.eval('AR.pend') === 1 && g.eval('AR.prevA') === 0, 'FINISH中は前エリアの背景のまま');
  g.advance(1); ok(g.eval('!AR.title'), 'タイトルは FINISH!! の後');
  g.advance(1.5); ok(g.eval('!!AR.title') && g.eval('AR.title.a') === 1 && g.eval('AR.title.i') === 1, 'エリア2のタイトルが出ない');
  g.advance(4); ok(g.eval('!AR.title&&!AR.boom'), 'タイトル/爆発が残る');
  // 普通のボスは怒り(形態変化ではない)、雑魚は怒らない
  g.eval('G.stage=29;spawn();G.hp=1;hurt(10,"#fff")'); g.advance(.2); g.eval('G.hp=G.mx*.3'); g.advance(.1);
  ok(g.eval('AR.rageSt') === 30 && g.eval('AR.form') === 0, '普通のボスの怒り');
  g.eval('G.stage=31;spawn();G.hp=G.mx*.2'); g.advance(.1); ok(g.eval('AR.rageSt') === 0, '雑魚が怒った/リセットされない');
  // 色違い: 図鑑のキーはそのまま、描画用だけ別名
  ok(g.eval('arVarName("m3",2)') === 'm3@2' && g.eval('!!SPR["m3@2"]&&PXL["m3@2"].length===PXL.m3.length'), '色違いスプライト');
  ok(g.eval('arVarName("m3",0)') === 'm3' && g.eval('arVarName("b5",3)') === 'b5', '色違いの対象外');
  // 全エリアを描画して例外なし・キャッシュは有限
  for (let a = 0; a < 8; a++) {
    g.eval(`G.stage=${a * 25 + 7};spawn()`); g.advance(.5);
    g.eval(`G.stage=${a * 25 + 24};spawn();G.hp=1;hurt(10,"#fff")`); g.advance(.5); g.eval('G.hp=G.mx*.4'); g.advance(1.2);
  }
  ok(g.eval('Object.keys(ARB).length') === 8, '背景キャッシュの数: ' + g.eval('Object.keys(ARB).length'));
  ok(g.eval('Object.keys(ARS).length') <= 40, 'シルエットキャッシュ: ' + g.eval('Object.keys(ARS).length'));
  ok(g.eval('F.length<=200&&PT.length<=2000&&RG.length<=24&&DK.length<=260'), '配列の上限');
  // 転生でエリア1に戻るとタイトルが出る
  g.eval('G.stage=1;spawn()'); g.advance(1.2); ok(g.eval('!!AR.title&&AR.title.a===0'), '周回で草原に戻った時のタイトル');
  // drawB が全エリアで動く(ハーネスの Canvas スタブ)
  let thrown = 0; for (const s of [3, 30, 55, 80, 105, 130, 155, 180, 205, 25, 200]) { try { g.eval(`G.stage=${s};spawn();drawB(T);drawB(T+.5)`) } catch (e) { thrown++ } }
  ok(thrown === 0, 'drawB で例外');
}
// 旧セーブ(図鑑なし)でも落ちない
{
  const g = createGame({ seed: 12 }); g.start(); g.advance(2);
  ok(g.eval('Object.keys(ZK).filter(k=>/^b([4-9]|1[01])$/.test(k)).length') === 0, '旧セーブで新キーが勝手に増える');
}
if (bad) { console.error(bad + ' failure(s)'); process.exit(1) }
console.log('AREA OK');
