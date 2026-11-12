// バランス計測: 「放置+自動購入」プレイを仮想時間でシミュレートし、指標を表示する。
// 実行: node tools/sim.js [--minutes=30] [--seeds=5] [--tap=0] [--buy=1] [--win=0] [--set='BAL.hpg=1.3']
//   --tap=1 で毎秒1回タップ(玉追加)する能動プレイも測れる。
//   --buy=0 で強化を一切買わない(初期Lvのまま)。 --win=N で N分ごとの経過表(seed1)を出す。
//   --set は ゲーム開始前に評価されるJS(チューニング用)。
//   --pres=auto|N|recN  転生する(auto=STAGE が --stall 秒(既定240)進まず魂を得られる時 / N=STAGE N 到達で /
//                 recN=前回までの最高記録+N 到達で(届かず --stall 秒止まったら auto と同じく転生))。0=しない(既定)
//   --gs=1    宝石ショップ(98i)の勲章を安い順に自動で買う(宝石が足りる時だけ)。
//   --meta=1  魂の祭壇(安い順)と鍛冶屋の武器(安い順)を自動で買う。転生/メタ指標を最後に1行出す。
// 出力: ステージ到達時間 / 大当たり回数と間隔 / JACKPOT / RUSH・FEVER稼働率 / 必殺技間隔 / ハマり最大 / 演出頻度 / 購入した強化
const { createGame } = require('../tools/harness');
const sarg = (k, d) => { const a = process.argv.find(s => s.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const arg = (k, d) => +sarg(k, d);
const MIN = arg('minutes', 30), SEEDS = arg('seeds', 5), TAP = arg('tap', 0), BUY = arg('buy', 1), WIN = arg('win', 0), SET = sarg('set', '');
const SEED0 = arg('seed0', 1);   // --seed0=K でシード K から(並列実行用)
const PRES = sarg('pres', '0'), STALL = arg('stall', 240), META = arg('meta', 0), GSHOP = arg('gs', 0);
const metas = [];
const STAGES = [5, 10, 15, 20, 30, 50, 75, 100];
const pct = (a, q) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * q))]; };
const med = a => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const rows = [], wins = [];
for (let seed = SEED0; seed < SEED0 + SEEDS; seed++) {
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
  const buyer = `(function(){let b=-1,c=1e300;for(let i=0;i<UP.length;i++){if(G.stage>=(UP[i][4]||0)&&cost(i)<c){c=cost(i);b=i}}const h=typeof hupCheapest==='function'?hupCheapest():null;if(h&&h[2]<c){if(G.gold>=h[2])hupBuy(h[0],h[1]);return}if(b>=0&&G.gold>=c)buy(b)})()`;   // 英雄ごとの強化(94c)も安い順に
  const stageAt = {}; let rushN = 0, prevR = false, rushT = 0, feverT = 0, rushW = 0, feverW = 0, lastHit = 0, hitW = 0, ultW = 0, goldW = 0;
  const hist = [];
  const pres = []; let lastUp = 0, lastSt = 1, best = 1, recov = [];
  for (let s = 1; s <= MIN * 60; s++) {
    g.advance(1, 0.05);
    if (BUY) g.eval(buyer);
    if (META) g.eval(`(function(){if(typeof SOULD!=='undefined'){let b=null,c=1e300;for(const d of SOULD){const l=soulLv(d.k);if(l<d.max&&d.c(l)<c){c=d.c(l);b=d.k}}if(b&&soulFree()>=c)soulBuy(b)}
      if(typeof RES!=='undefined'){let b=-1,c=1e300;for(let i=0;i<3;i++){const l=RES.w[i];if(wCost(l)<c&&RES.gem>=wGem(l)){c=wCost(l);b=i}}if(b>=0&&RES.ms>=c)smithUp(b)}})()`);
    if (GSHOP) g.eval(`typeof gsAutoBuy==='function'&&gsAutoBuy()`);
    if (PRES !== '0') {
      const cur = g.eval('G.stage');
      if (cur > lastSt) { lastSt = cur; lastUp = s; }
      if (pres.length && !recov[pres.length - 1] && cur >= pres[pres.length - 1].stage) recov[pres.length - 1] = s - pres[pres.length - 1].t;
      const want = PRES === 'auto' ? (s - lastUp >= STALL) : PRES.startsWith('rec') ? (cur >= Math.max(30, (pres.length ? best : 0) + +PRES.slice(3)) || s - lastUp >= STALL) : cur >= +PRES;
      if (want && g.eval('soulGain(G.stage)') >= 1) {
        // presDo は進行中の演出を presAbort で打ち切ってから転生する(演出中でも即転生)
        const gn = g.eval('presDo()');
        if (gn > 0) { pres.push({ t: s, stage: cur, gn }); best = Math.max(best, cur); lastSt = g.eval('G.stage'); lastUp = s; }
      }
    }
    if (TAP && s % 1 === 0) g.eval("P._ev&&P._ev.pointerdown&&P._ev.pointerdown({clientX:60+Math.random()*240,clientY:50})");
    const st = g.eval('({stage:G.stage,rush:G.rush>0,fv:G.fv>0})');
    if (st.rush) { rushT++; rushW++; if (!prevR) rushN++; } prevR = st.rush; if (st.fv) { feverT++; feverW++; }
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
  rows.push({ seed, stage: end.stage, hit: m.hit, 'hit/min(0-5)': +hit5.toFixed(2), 'gapMax(s)': Math.round(Math.max(0, ...gaps)), 'gapMed(s)': Math.round(med(gaps)), jp: m.jp, rushPct: +(100 * rushT / (MIN * 60)).toFixed(1), 'rushLen(s)': +(rushT / Math.max(1, rushN)).toFixed(1), feverPct: +(100 * feverT / (MIN * 60)).toFixed(1), ult: m.ult, 'ultInt(s)': +med(m.ultN).toFixed(1), 'ult p10-p90': pct(m.ultN, .1).toFixed(0) + '-' + pct(m.ultN, .9).toFixed(0), golden: m.golden, 'gold/min': +(m.golden / MIN).toFixed(2), awaken: m.aw, dryMax: end.dry >= 0 ? end.dry : m.dryMax, 'banner/min': +(m.banner / MIN).toFixed(1), buys: m.buys, stageAt, lv: end.lv.join(',') });
  if (WIN && seed === 1) wins.push(...hist);
  if (META || GSHOP || PRES !== '0') metas.push(Object.assign({ seed }, g.eval(`({best:Math.max(X.best,G.stage),souls:X.souls,pres:X.pres,soulLv:typeof SOUL!=='undefined'?JSON.stringify(SOUL.lv):'',w:typeof RES!=='undefined'?RES.w.join('/'):'',gem:typeof RES!=='undefined'?RES.gem:0,relic:typeof relicCount==='function'?relicCount():0,zk:typeof zkStars==='function'?zkStars():0,gs:typeof GS!=='undefined'?Object.values(GS.lv).join('/')+' spent'+GS.spent:'',sbA:+SB.a().toFixed(2),sbG:+SB.g().toFixed(2)})`), { 'soul/min': +(g.eval('X.souls') / MIN).toFixed(2), presAt: pres.map(p => Math.round(p.t / 60) + 'm:S' + p.stage + '+' + p.gn).join(' '), 'recover(s)': recov.map(x => x || '-').join(',') }));
}
const avg = k => (rows.reduce((a, r) => a + r[k], 0) / rows.length).toFixed(1);
console.log(`== ${MIN}分 x ${SEEDS}シード (tap=${TAP} buy=${BUY}) ${SET ? '[' + SET + ']' : ''} ==`);
console.table(rows.map(({ stageAt, lv, ...r }) => r));
console.log('平均: stage', avg('stage'), '/ 大当たり', avg('hit'), `(${(avg('hit') / MIN).toFixed(2)}回/分)`, '/ JP', avg('jp'), `(${(avg('jp') / MIN * 60).toFixed(1)}回/h)`, '/ RUSH稼働', avg('rushPct') + '%', '(1回', avg('rushLen(s)') + 's)', '/ FEVER', avg('feverPct') + '%', '/ 必殺間隔(通常時,中央値)', avg('ultInt(s)') + 's', '/ ハマり最大', avg('dryMax') + '回転', '/ 演出(banner)', avg('banner/min') + '/分');
console.log('ステージ到達(秒):', JSON.stringify(rows[0].stageAt), ' Lv(seed1):', rows[0].lv);
if (metas.length) { console.log('-- 転生/メタ --'); console.table(metas); }
if (WIN) { console.log(`-- seed1 ${WIN}分ごと --`); console.table(wins); }
