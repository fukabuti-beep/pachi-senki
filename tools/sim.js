// バランス計測: 「放置+自動購入」プレイを仮想時間でシミュレートし、指標を表示する。
// 実行: node tools/sim.js [--minutes=30] [--seeds=5] [--tap=0]
//   --tap=1 で毎秒1回タップ(玉追加)する能動プレイも測れる。
// 出力: ステージ到達時間 / 大当たり回数 / JACKPOT / RUSH稼働率 / 金/分 / 購入した強化
const { createGame } = require('../tools/harness');
const arg = (k, d) => { const a = process.argv.find(s => s.startsWith('--' + k + '=')); return a ? +a.split('=')[1] : d; };
const MIN = arg('minutes', 30), SEEDS = arg('seeds', 5), TAP = arg('tap', 0);
const rows = [];
for (let seed = 1; seed <= SEEDS; seed++) {
  const g = createGame({ seed });
  g.start();
  // 計測用に主要関数をラップ(同一スクリプト内のグローバルなので上書き可能)
  g.eval(`var __m={hit:0,jp:0,rush:0,fever:0,aw:0,kills:0,spins:0,buys:0,ult:0,rare:0,miss:0};
  (function(){const w=(n,f)=>{const o=globalThis[n];globalThis[n]=function(...a){f(...a);return o.apply(this,a)}};
  w('bigHit',jp=>{__m.hit++;if(jp)__m.jp++});w('kill',()=>__m.kills++);w('startSpin',()=>{});w('awaken',()=>__m.aw++);w('ult',()=>__m.ult++);
  w('mini',()=>{__m.mini=(__m.mini||0)+1});w('golden',()=>{__m.golden=(__m.golden||0)+1});w('buy',()=>__m.buys++)})()`);
  const stageAt = {}; let rushT = 0, feverT = 0;
  for (let s = 1; s <= MIN * 60; s++) {
    g.advance(1, 0.05);
    // 自動購入: 一番安い強化を買う(解放済みのものだけ)
    g.eval(`(function(){let b=-1,c=1e300;for(let i=0;i<UP.length;i++){if(G.stage>=(UP[i][4]||0)&&cost(i)<c){c=cost(i);b=i}}if(b>=0&&G.gold>=c)buy(b)})()`);
    if (TAP && s % 1 === 0) g.eval("P._ev&&P._ev.pointerdown&&P._ev.pointerdown({clientX:60+Math.random()*240,clientY:50})");
    const st = g.eval('({stage:G.stage,rush:G.rush>0,fv:G.fv>0})');
    if (st.rush) rushT++; if (st.fv) feverT++;
    for (const m of [5, 10, 15, 20, 30, 50]) if (st.stage >= m && !(m in stageAt)) stageAt[m] = s;
  }
  const m = g.eval('__m'), end = g.eval('({stage:G.stage,gold:G.gold,lv:G.lv.slice()})');
  rows.push({ seed, stage: end.stage, hit: m.hit, jp: m.jp, rushPct: +(100 * rushT / (MIN * 60)).toFixed(1), feverPct: +(100 * feverT / (MIN * 60)).toFixed(1), awaken: m.aw, ult: m.ult, mini: m.mini || 0, golden: m.golden || 0, buys: m.buys, stageAt, lv: end.lv.join(',') });
}
const avg = k => (rows.reduce((a, r) => a + r[k], 0) / rows.length).toFixed(1);
console.log(`== ${MIN}分 x ${SEEDS}シード (tap=${TAP}) ==`);
console.table(rows.map(({ stageAt, lv, ...r }) => r));
console.log('平均: stage', avg('stage'), '/ 大当たり', avg('hit'), `(${(avg('hit') / MIN).toFixed(2)}回/分)`, '/ JP', avg('jp'), '/ RUSH稼働', avg('rushPct') + '%', '/ FEVER', avg('feverPct') + '%');
console.log('ステージ到達(秒):', JSON.stringify(rows[0].stageAt), ' Lv(seed1):', rows[0].lv);
