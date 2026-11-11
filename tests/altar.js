// 魂の祭壇に転生を統合(98i-altar)/ リソースのアイコン(29d-resicon)
//  1) メニューに「転生」タブは無く、「育てる」には案内の「育成」タブ。「開く」で強化シートの各グループへ
//  2) 祭壇(強化シート)から 転生する → 確認 → 転生できる。「やめる」はメニューを開かず閉じるだけ。STAGE 30 未満はボタンが無効
//  3) resIcon/resAmt/resIconCanvas が全種類で動き、HUD・強化シート・各メニュー・戦闘画面にアイコンが出る
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const alt = g => g.eval("UPG.list.find(m=>m[0]==='魂の祭壇')[1]()");
{ // 1)
  const g = createGame({ seed: 5 }); g.start(); g.advance(1);
  g.eval('if(fxOpen)fxClose()');
  ok(g.eval("FM.every(m=>m.n!=='転生')"), 'メニューに転生タブが残っている');
  ok(g.eval("FM.every(m=>m.n!=='育成')"), '育成タブはメニューから外す(リソース消費系は強化ボタンへ集約=98k)');
  ok(g.eval("UPG.list.map(x=>x[0]).join()").indexOf('通常強化,鍛冶屋,魂の祭壇') === 0, 'グループ: ' + g.eval("UPG.list.map(x=>x[0]).join()"));
  g.eval('altOpen(2)');
  ok(g.eval('fxOpen') === false && g.eval('so') === true && g.eval('UPG.g') === 2 && /転生する/.test(g.eval("$('upx').innerHTML")), '開く → 魂の祭壇');
  ok(g.eval('FERR') === 0, 'FERR ' + g.eval('FERR'));
}
{ // 2)
  const g = createGame({ seed: 6 }); g.start(); g.advance(1);
  g.eval('if(fxOpen)fxClose();DLY.shown=1;G.stage=12;spawn()');
  const low = alt(g);
  ok(/class="fxb altgo d"/.test(low) && /あと 18 STAGE/.test(low), 'STAGE 30 未満: ' + low.replace(/<[^>]+>/g, ' ').slice(0, 200));
  g.eval('G.stage=45;X.best=45;spawn();altOpen(2)');
  const h = alt(g), gn = g.eval('presGainShow(45)');
  ok(/class="fxb altgo"/.test(h) && h.indexOf('+' + gn) >= 0, '祭壇に獲得予定の魂: ' + gn);
  ok(/onclick="presAsk\(\)"/.test(h) && /onclick="soulBuy\('start'\)"/.test(h), '転生ボタンと永続強化が同じ画面に');
  g.eval('presAsk()'); ok(g.eval('fxOpen') === true, '確認が開かない');
  g.eval('FB[1][1]()'); ok(g.eval('fxOpen') === false && g.eval('G.stage') === 45 && g.eval('UPG.g') === 2, 'やめる → 祭壇に戻る(メニューを開かない)');
  g.eval('__rf=0;{const o=grpRefresh;grpRefresh=function(){__rf++;return o.apply(this,arguments)}}');
  g.eval('presAsk()'); g.eval('FB[0][1]()');
  ok(g.eval('G.stage') === 1 && g.eval('X.pres') === 1 && g.eval('X.souls') === gn, '祭壇から転生できない: souls=' + g.eval('X.souls'));
  ok(g.eval('__rf') >= 1 && alt(g).indexOf('<b>' + gn + '</b>') >= 0, '転生後に祭壇が描き直されない');
  ok(g.eval('FERR') === 0, 'FERR ' + g.eval('FERR'));
}
{ // 3)
  const g = createGame({ seed: 7 }); g.start(); g.advance(1);
  g.eval('if(fxOpen)fxClose();DLY.shown=1;RES.ms=500;RES.gem=9;X.best=40');
  const kinds = g.eval('RESK');
  ['gold', 'ms', 'gem', 'soul', 'relic', 'exp'].forEach(k => {
    ok(kinds.includes(k), 'kind ' + k);
    ok(g.eval(`resIcon('${k}')`) === `<i class="ri ri-${k}" aria-hidden="true"></i>`, 'resIcon ' + k);
    ok(/^data:image\/svg\+xml,/.test(g.eval(`RESICON.URI['${k}']`)), 'SVG ' + k);
    ok(g.eval(`resIconCanvas(bc,'${k}',0,0,10)`) === true, 'canvas ' + k);
    ok(g.eval(`RESICON.M['${k}'].length===12&&RESICON.M['${k}'].every(r=>r.length===12)`), '12x12 ' + k);
  });
  ok(g.eval("resIcon('魔石')") === g.eval("resIcon('ms')") && g.eval("resIcon('G')") === g.eval("resIcon('gold')") && g.eval("resIcon('nope')") === '', '別名/不明');
  ok(/ra-gem/.test(g.eval("resAmt('gem','+3')")) && /\+3<\/span>$/.test(g.eval("resAmt('gem','+3')")), 'resAmt');
  { const fs = require('fs'), d = require('path').join(__dirname, '../dist/pachi-senki.html');
    if (fs.existsSync(d)) { const t = fs.readFileSync(d, 'utf8'); ok(t.includes('.ri{') && t.includes('.altsoul') && t.includes('#hud .coin.ri'), 'アイコン/祭壇の CSS が成果物に無い') } }
  const has = (html, k, tag) => ok(html.indexOf('ri-' + k) >= 0, tag + ' に ' + k + ' のアイコンが無い');
  const tab = n => g.eval(`(FM.find(m=>m.n==='${n}')||{r:(UPG.list.find(x=>x[0]==='${n}')||[0,()=>''])[1]}).r()`);   // くじ等は強化画面(UPG)へ移動済み
  has(g.eval("UPG.list[1][1]()"), 'ms', '鍛冶屋'); has(g.eval("UPG.list[1][1]()"), 'gem', '鍛冶屋');
  has(alt(g), 'soul', '魂の祭壇');
  has(tab('くじ'), 'ms', 'くじ'); has(tab('くじ'), 'gem', 'くじ'); has(tab('くじ'), 'gold', 'くじ');
  has(tab('ミッション'), 'gem', 'ミッション'); has(tab('遠征'), 'ms', '遠征'); has(tab('実績'), 'gold', '実績');
  // 育成タブは外した(98k)ので、その分のアイコン確認は魂の祭壇(UPG)で行う
  has(g.eval("UPG.list.find(x=>x[0]==='魂の祭壇')[1]()"), 'soul', '魂の祭壇');
  // 強化シートの価格は「G 」の文字を出さない(アイコンは CSS)
  g.eval('refresh()'); ok(!/^G /.test(g.eval("$('c0').textContent")), '価格: ' + g.eval("$('c0').textContent"));
  // 戦闘画面の右下(96s resDraw)が例外なく描ける
  g.eval('drawB(T)'); ok(g.eval('RES.pop.length>=0') && g.eval('FERR') === 0, 'drawB');
}
if (bad) { console.error(bad + ' altar failure(s)'); process.exit(1) }
console.log('ALTAR OK');
