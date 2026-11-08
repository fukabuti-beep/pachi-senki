/* ---------- 強化項目の追加 (balance) ----------
   UP/UPMAX/G.lv の末尾に追加(既存の添字は変えない)。00-core のセーブ読込は先頭10個だけなので、追加分はここで読み直す。
   10 タップ攻撃 / 11 お宝運 / 12 ルーレット招待 / 13 超倍率 。効果は 98b-active / 87-hitev から UPX.* で参照する。 */
UP.push(['撃','タップ攻撃','タップ威力+30%',45,5],['宝','お宝運','出現/報酬UP MAX10',70,10],['招','ルーレット招待','押せ!!発生+2% MAX10',90,15],['超','超倍率','化ける率+3% MAX10',120,20]);
UPMAX.push(Infinity,10,10,10);
while(G.lv.length<UP.length)G.lv.push(1);
try{const s=JSON.parse(localStorage.getItem('pachi2')||'null');if(s&&Array.isArray(s.lv))for(let i=10;i<UP.length;i++){const v=Math.floor(+s.lv[i]);if(Number.isFinite(v)&&v>=1)G.lv[i]=Math.min(v,1e6)}}catch(e){}
// 遺物(96r-relic)のボーナスは RLB(key) で受け取る(未ロード時は0)
const RLB=k=>{try{return typeof relicBonus==='function'?relicBonus(k):0}catch(e){return 0}};
const UPX={
  tap:()=>(1+.3*(G.lv[10]-1))*(1+RLB('tap')),                    // タップ攻撃の倍率
  trsRate:()=>(1+.1*(lvE(11)-1))*(1+RLB('trs')),                // お宝の出現頻度
  trsGain:()=>1+.2*(lvE(11)-1),                                  // お宝の報酬
  evP:()=>BAL.evP+Math.min(.25,.02*(lvE(12)-1)+RLB('ev')),         // 押せ!!(ルーレットイベント)の発生率
  supP:()=>BAL.supP+Math.min(.35,.03*(lvE(13)-1)+RLB('sup'))};    // 超倍率チャンス
