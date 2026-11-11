// 押せ!!ボタンの熱さ(89h): 色の段階・777は虹・押下の文字・超倍率は先に抽選しても確率と結果が一致
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
(async () => {
  const g = createGame({ seed: 3 }); g.start(); g.advance(1);
  const cls = () => g.eval("$('push').className");
  for (const h of [1, 2, 3]) { g.eval(`PUSH=null;$('push').className='';pushPrompt(()=>{},{heat:${h},ms:60000})`); ok(new RegExp('\\bph' + h + '\\b').test(cls()), 'heat ' + h + ' の色: ' + cls()); }
  g.eval(`PUSH=null;$('push').className='';pushPrompt(()=>{},{jp:1,ms:60000})`); ok(/\bph3\b/.test(cls()), '777 は虹');
  g.eval('pushPress(0)'); ok(g.eval("$('pkT').textContent") === '確定!!', '虹の押下は 確定!!: ' + g.eval("$('pkT').textContent"));
  g.advance(1.5);
  // ルーレット行き: 超倍率の当否と RL.sup が一致し、当たりなら色は 金か虹
  let hits = 0, n = 0;
  for (let i = 0; i < 300; i++) { g.eval('PUSH=null;RL=null;sp=null;G.roul=0;$("push").className="";HEV.force="roul";hitEvent(false);HEV.force=null'); if (!g.eval('!!PUSH')) continue; n++;
    const h = g.eval('PUSH.heat'); g.eval('pushPress(0)'); g.advance(.8); const sup = g.eval('RL?!!RL.sup:null'); if (sup === null) continue;
    if (sup) { hits++; ok(h >= 2, '超倍率なのに赤'); } g.eval('RL=null;$("rl").style.display="none";G.roul=0'); }
  ok(n > 200, 'ルーレット行きが少ない: ' + n);
  const p = g.eval('UPX.supP()'); ok(Math.abs(hits / n - p) < .08, '超倍率の確率が変わった: ' + (hits / n).toFixed(3) + ' vs ' + p.toFixed(3));
  if (fails) { console.error(fails + ' pushhype failure(s)'); process.exit(1); }
  console.log('PUSHHYPE OK');
})();
