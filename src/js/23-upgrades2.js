/* ---------- 強化項目の追加 (balance) ----------
   UP/UPMAX/G.lv の末尾に追加(既存の添字は変えない)。00-core のセーブ読込は先頭10個だけなので、追加分はここで読み直す。
   10 タップ攻撃 / 11 お宝運 / 12 ルーレット招待 / 13 超倍率 / 14 会心ダメージ(STAGE 25 解放、無制限)。効果は 98b-active / 87-hitev から UPX.* で参照する。
   15 ボス特効(STAGE 30、無制限: ボス戦のダメージ x1.15/Lv = 20-upgrades の bossD) / 16 魂の収穫(STAGE 40、MAX10: 転生で得る魂 +6%/Lv = 94-prestige の soulGain)。
   中盤以降「攻/金/撃 しか買う物が無い」を解消するための2つ(第2弾 balance)。 */
UP.push(['撃','タップ攻撃','タップ +30%',45,5],['宝','お宝運','お宝 出現+10% 報酬+20% MAX10',70,10],['招','ルーレット招待','押せ!! +2% MAX10',90,15],['超','超倍率','超倍率 +3% MAX10',120,20],['極','会心ダメージ','会心ダメージ +8%',1500,25],['討','ボス特効','ボスへ攻撃 +15%',6000,30],['収','魂の収穫','転生の魂 +6% MAX10',40000,40]);
UPMAX.push(Infinity,10,10,10,Infinity,Infinity,10);
while(G.lv.length<UP.length)G.lv.push(1);
try{const s=JSON.parse(localStorage.getItem('pachi2')||'null');if(s&&Array.isArray(s.lv))for(let i=10;i<UP.length;i++){const v=Math.floor(+s.lv[i]);if(Number.isFinite(v)&&v>=1)G.lv[i]=Math.min(v,1e6)}}catch(e){}
// 遺物(96r-relic)のボーナスは RLB(key) で受け取る(未ロード時は0)
const RLB=k=>{try{return typeof relicBonus==='function'?relicBonus(k):0}catch(e){return 0}};
const UPX={
  tap:()=>(1+.3*(G.lv[10]-1))*(1+RLB('tap')),                    // タップ攻撃の倍率
  trsRate:()=>(1+.1*(lvE(11)-1))*(1+RLB('trs')),                // お宝の出現頻度
  trsGain:()=>1+.2*(lvE(11)-1),                                  // お宝の報酬
  evP:()=>BAL.evP+Math.min(.25,.02*(lvE(12)-1)+RLB('ev')),         // 押せ!!(ルーレットイベント)の発生率
  critD:()=>1+.08*((G.lv[14]||1)-1),                               // 会心(★)ダメージの倍率。必殺/黄金玉/JACKPOT などの大技も会心扱いなので乗る
  supP:()=>BAL.supP+Math.min(.35,.03*(lvE(13)-1)+RLB('sup'))};    // 超倍率チャンス
/* 上限の解放(第2弾 balance): 転生するたびに一部の強化の MAX が +1(最大 +5)。演出の頻度系(黄金玉/FEVER/SP/RUSH延長)は特別感のため伸ばさない。
   UPMAX の値をその場で書き換える(cost/lvE/refresh はそのまま UPMAX を見る)。94-prestige が起動時と転生時に upCapSet(X.pres) を呼ぶ */
const UPMAX0=UPMAX.slice(),UPCAPX=[2,5,11,12,13],UPCAPMAX=5;
const upCapExt=p=>Math.max(0,Math.min(UPCAPMAX,Math.floor(+p)||0));
function upCapSet(p){const e=upCapExt(p);UPCAPX.forEach(i=>UPMAX[i]=UPMAX0[i]+e);return e}
const soulHarv=()=>1+.06*(lvE(16)-1);   // 魂の収穫
