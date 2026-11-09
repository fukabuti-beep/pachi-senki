// QA(バランス第2弾/再出発の勢い/遠征隊 の組み合わせ)の再発防止
// (a) 転生の確認画面/転生タブの「魂 +N」は 魂の器(94b)込みの実際の獲得量と一致する
// (b) 再出発の勢い中も、メニューのダメージ倍率は勢いを含まない(以前は「ダメージ x240」などと出ていた)。戦闘の SB.a には勢いが乗ったまま
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const txt = g => g.eval("$('fxmc').innerHTML").replace(/<[^>]+>/g, ' ');
// (a)
{
  const g = createGame({ seed: 11 }); g.start(); g.advance(1);
  g.eval('if(fxOpen)fxClose();X.souls=40;X.pres=1;X.best=60;PREC=60;SOUL.lv.soul=5;SOUL.lv.start=0;G.stage=80;spawn()');
  const base = g.eval('soulGain(80)'), bonus = g.eval('soulBonusGain(soulGain(80))');
  ok(bonus > 0, '器の追加分がある: ' + bonus);
  g.eval('presAsk()'); const t = txt(g);
  ok(t.indexOf('魂 +' + (base + bonus)) >= 0, '確認画面の魂: ' + t.slice(0, 200));
  ok(t.indexOf('魂 40 → ' + (40 + base + bonus)) >= 0, '確認画面の所持数: ' + t);
  g.eval('fxClose()');
  const tab = g.eval("FM.find(m=>m.n==='転生').r()").replace(/<[^>]+>/g, ' ');
  ok(tab.indexOf('獲得予定 魂 +' + (base + bonus)) >= 0, '転生タブ: ' + tab.slice(0, 300));
  const s0 = g.eval('X.souls'); g.eval('presDo()');
  ok(g.eval('X.souls') - s0 === base + bonus, '実際の獲得 ' + (g.eval('X.souls') - s0) + ' / 表示 ' + (base + bonus));
}
// (b)
{
  const g = createGame({ seed: 12 }); g.start(); g.advance(1);
  g.eval('if(fxOpen)fxClose();X.best=110;G.stage=112;SOUL.lv.start=10;SOUL.lv.gold=0;SOUL.lv.auto=0');
  g.eval('presDo()'); g.advance(2);
  ok(!!g.eval('SOUL_RUN'), '勢い中');
  const fight = g.eval('SB.a()'), show = g.eval('sbShow()'), plain = g.eval('(()=>{const r=SOUL_RUN;SOUL_RUN=null;const v=SB.a();SOUL_RUN=r;return v})()');
  ok(fight > show * 5, '戦闘には勢いが乗る: ' + fight + ' / ' + show);
  ok(Math.abs(show - plain) < 1e-9, '表示は勢い抜き: ' + show + ' / ' + plain);
  ok(!!g.eval('SOUL_RUN'), 'sbShow で勢いが消えない');
  const re = new RegExp('ダメージ x' + show.toFixed(1).replace('.', '\\.'));
  ok(re.test(g.eval("UPG.list.find(m=>m[0]==='魂の祭壇')[1]()")), '魂の祭壇の表示');
  ok(re.test(g.eval("FM.find(m=>m.n==='転生').r()")), '転生タブの表示');
  g.eval('G.stage=40;spawn()'); g.eval('presAsk()'); ok(re.test(txt(g)) || /ダメージ x/.test(txt(g)) && !new RegExp('ダメージ x' + fight.toFixed(1)).test(txt(g)), '確認画面の表示: ' + txt(g));
}
if (bad) { console.error(bad + ' qa-combo2 failure(s)'); process.exit(1) }
console.log('QA-COMBO2 OK');
