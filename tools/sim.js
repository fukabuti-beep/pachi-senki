// バランス計測: 「放置+自動購入」プレイを仮想時間でシミュレートし、指標を表示する。
// 実行: node tools/sim.js [--minutes=30] [--seeds=5] [--tap=0] [--buy=1] [--win=0] [--set='BAL.hpg=1.3']
//   --tap=1 で毎秒1回タップ(玉追加)する能動プレイも測れる。
//   --buy=0 で強化を一切買わない(初期Lvのまま)。 --win=N で N分ごとの経過表(seed1)を出す。
//   --set は ゲーム開始前に評価されるJS(チューニング用)。
// 出力: ステージ到達時間 / 大当たり回数と間隔 / JACKPOT / RUSH・FEVER稼働率 / 必殺技間隔 / ハマり最大 / 演出頻度 / 購入した強化
const { createGame } = require('../tools/harness');
const sarg = (k, d) => { const a = process.argv.find(s => s.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const arg = (k, d) => +sarg(k, d);
const MIN = arg('minutes', 30), SEEDS = arg('seeds', 5), TAP = arg('tap', 0), BUY = arg('buy', 1), WIN = arg('win', 0), SET = sarg('set', '');
const STAGES = [5, 10, 15, 20, 30, 50, 75, 100];
const med = a => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const rows = [], wins = [];
for (let seed = 1; seed <= SEEDS; seed++) {
  const g = createGame({ seed });
  if (SET) g.eval(SET);
  g.start();
  // 計測用に主要関数をラップ(同一スクリプト内のグローバルなので上書き可能)
  g.eval(`var __m={hit:0,jp:0,aw:0,kills:0,buys:0,ult:0,ultN:[],ultR:[],lastUlt:-1,lastUltR:0,golden:0,mini:0,banner:0,cutin:0,ch:0,dry:0,dryMax:0,hits:[],pity:0,spinHit:0};
  (function(){const w=(n,f)=>{const o=globalThis[n];if(typeof o!=='function')return;globalThis[n]=function(...a){f(...a);return o.apply(this,a)}};
  w('bigHit',jp=>{__m.hit++;if(jp)__m.jp++;__m.hits.push(T);__m.dry=0});w('kill',()=>__m.kills++);w('awaken',()=>__m.aw++);
  w('ult',()=>{__m.ult++;if(__m.lastUlt>=0&&!(G.rush>0)&&!__m.lastUltR)__m.ultN.push(T-__m.lastUlt);__m.lastUlt=T;__m.lastUltR=G.rush>0?1:0});
  w('mini',()=>__m.mini++);w('golden',()=>__m.golden++);w('buy',()=>__m.buys++);w('banner',()=>__m.banner++);w('cutin',()=>__m.cutin++);
  w('onChucker',()=>{__m.ch++;if(!(G.rush>0)){__m.dry++;if(__m.dry>__m.dryMax)__m.dryMax=__m.dry}})})()`);
  // 自動購入: 一番安い強化を買う(解放済み・未MAXのものだけ)
  const buyer = `(function(){let b=-1,c=1e300;for(let i=0;i<UP.length;i++){if(G.stage>=(UP[i][4]||0)&&cost(i)<c){c=cost(i);b=i}}if(b>=0&&G.gold>=c)buy(b)})()`;
  const stageAt = {}; let rushT = 0, feverT = 0, rushW = 0, feverW = 0, lastHit = 0, hitW = 0, ultW = 0, goldW = 0;
  const hist = [];
  for (let s = 1; s <= MIN * 60; s++) {
    g.advance(1, 0.05);
    if (BUY) g.eval(buyer);
    if (TAP && s % 1 === 0) g.eval("P._ev&&P._ev.pointerdown&&P._ev.pointerdown({clientX:60+Math.random()*240,clientY:50})");
    const st = g.eval('({stage:G.stage,rush:G.rush>0,fv:G.fv>0})');
    if (st.rush) { rushT++; rushW++; } if (st.fv) { feverT++; feverW++; }
    for (const m of STAGES) if (st.stage >= m && !(m in stageAt)) stageAt[m] = s;
    if (WIN && s % (WIN * 60) === 0) {
      const m = g.eval('({hit:__m.hit,ult:__m.ult,golden:__m.golden,jp:__m.jp,aw:__m.aw,banner:__m.banner,stage:G.stage})');
      hist.push({ min: s / 60, stage: st.stage, hit: m.hit - hitW, jp: m.jp, rush: +(100 * rushW / (WIN * 60)).toFixed(0), fever: +(100 * feverW / (WIN * 60)).toFixed(0), ult: m.ult - ultW, golden: m.golden - goldW, aw: m.aw, bn: m.banner });
      rushW = feverW = 0; hitW = m.hit; ultW = m.ult; goldW = m.golden;
    }
  }
  const m = g.eval('__m'), end = g.eval('({stage:G.stage,gold:G.gold,lv:G.lv.slice(),dry:typeof DRYMAX==="number"?DRYMAX:-1})');
  const gaps = []; let pv = 0; for (const t of m.hits) { gaps.push(t - pv); pv = t; }
  const hit5 = m.hits.filter(t => t <= 300).length / Math.min(5, MIN);
  rows.push({ seed, stage: end.stage, hit: m.hit, 'hit/min(0-5)': +hit5.toFixed(2), 'gapMax(s)': Math.round(Math.max(0, ...gaps)), 'gapMed(s)': Math.round(med(gaps)), jp: m.jp, rushPct: +(100 * rushT / (MIN * 60)).toFixed(1), feverPct: +(100 * feverT / (MIN * 60)).toFixed(1), ult: m.ult, 'ultInt(s)': +med(m.ultN).toFixed(1), golden: m.golden, 'gold/min': +(m.golden / MIN).toFixed(2), awaken: m.aw, dryMax: end.dry >= 0 ? end.dry : m.dryMax, 'banner/min': +(m.banner / MIN).toFixed(1), buys: m.buys, stageAt, lv: end.lv.join(',') });
  if (WIN && seed === 1) wins.push(...hist);
}
const avg = k => (rows.reduce((a, r) => a + r[k], 0) / rows.length).toFixed(1);
console.log(`== ${MIN}分 x ${SEEDS}シード (tap=${TAP} buy=${BUY}) ${SET ? '[' + SET + ']' : ''} ==`);
console.table(rows.map(({ stageAt, lv, ...r }) => r));
console.log('平均: stage', avg('stage'), '/ 大当たり', avg('hit'), `(${(avg('hit') / MIN).toFixed(2)}回/分)`, '/ JP', avg('jp'), `(${(avg('jp') / MIN * 60).toFixed(1)}回/h)`, '/ RUSH稼働', avg('rushPct') + '%', '/ FEVER', avg('feverPct') + '%', '/ 必殺間隔(通常時,中央値)', avg('ultInt(s)') + 's', '/ ハマり最大', avg('dryMax') + '回転', '/ 演出(banner)', avg('banner/min') + '/分');
console.log('ステージ到達(秒):', JSON.stringify(rows[0].stageAt), ' Lv(seed1):', rows[0].lv);
if (WIN) { console.log(`-- seed1 ${WIN}分ごと --`); console.table(wins); }
