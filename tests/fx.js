// 演出(fx)用テスト: スプライト網羅 / 演出配列の上限 / 各スキル・状態の描画で例外が出ないこと
// 実行: node tests/fx.js
const { createGame } = require('../tools/harness');
let bad = 0; const fail = m => { bad++; console.error('FAIL ' + m); };
const g = createGame({ seed: 7 }); g.start();
const miss = g.eval(`(function(){const m=[];for(let s=1;s<=400;s++){const n=enSpr(s);if(!SPR[n]||!PXL[n])m.push(s+':'+n)}['h0','h0b','h0w','h0s','h1','h1b','h1w','h1s','h2','h2b','h2w','h2s'].forEach(n=>{if(!SPR[n])m.push(n)});return m})()`);
if (miss.length) fail('missing sprites ' + miss.join(','));
const kinds = g.eval(`(function(){const a=new Set();for(let s=1;s<=60;s++)a.add(enSpr(s));return [...a].length})()`);
if (kinds < 14) fail('enemy variety too small: ' + kinds);
const ev = ['FX.push({k:0,t0:T})', 'FX.push({k:1,t0:T})', 'FX.push({k:2,t0:T})', 'G.stage=4;kill()', 'bigHit(false)', 'bigHit(true)', 'G.rush=9', 'G.fv=8', 'awaken()', 'G.stage=9;G.hp=1;hurt(5,"#fff",1,1)', 'golden()', 'for(let i=0;i<100;i++)hurt(1,"#fff",0,i%3==0)'];
for (let s = 0; s < 240; s++) {
  g.advance(0.5, 0.05);
  if (s % 4 == 0) g.eval(ev[(s / 4) % ev.length | 0]);
  const c = g.eval('({HF:HF.length,DK:DK.length,CN:CN.length,RG:RG.length,PRG:PRG.length,F:F.length,PT:PT.length,FX:FX.length})');
  if (c.HF > 26 || c.DK > 260 || c.CN > 90 || c.RG > 24 || c.PRG > 10 || c.F > 150 || c.PT > 1500 || c.FX > 20) fail('array cap ' + JSON.stringify(c) + ' at ' + s);
  if (bad) break;
}
if (bad) process.exit(1);
console.log('FX OK');
