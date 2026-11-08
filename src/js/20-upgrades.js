/* ---------- upgrades: data + stat formulas + buy ---------- */
// UP: [記号,名前,説明,基本コスト,解放ステージ]  ※並び(=G.lv[]の添字)は既存セーブ互換のため変更しない
const UP=[['攻','英雄強化','ダメージ+25%',15],['速','発射速度','玉+0.5/秒 MAX11',20],['当','当たり確率','大当たり+7% MAX12',30],['金','ゴールド','獲得+20%',25],['会','会心率','CRIT+3% MAX15',22],['運','ルーレット運','高倍率UP MAX15',40],['溜','SPチャージ','ゲージ+6% MAX8',35,3],['延','RUSH延長','継続+0.5秒 MAX5',50,8],['黄','黄金玉率','黄金玉+12% MAX10',60,12],['祭','FEVER率','発生率+10% MAX10',80,16]];
// 最大Lv(Infinity=無制限)。特別感を保つため「演出の発生頻度」系は必ず上限を持つ。攻/金だけが無限に伸びる。
const UPMAX=[Infinity,11,12,Infinity,15,15,8,5,10,10];
// チューニング用の係数(sim から BAL.xxx=... で上書き可能)
const BAL={atk0:5,atkg:1.25,mulg:1.2,hp0:1500,hpg:1.32,boss:4,costg:1.63,costgCap:1.45,costk:50,
 hit0:.15,hitStep:.01,rushP:.12,jpP:.04,
 spBall:.14,spHero:2.7,spStep:.06,ultMin:9,
 goldBase:45,goldStep:.12,fevBase:60,fevStep:.1,
 pityStart:24,pityEnd:60};
const lvE=i=>Math.min(G.lv[i],UPMAX[i]);   // 旧セーブでMAX超過のLvも上限で頭打ち
const cost=i=>G.lv[i]>=UPMAX[i]?Infinity:Math.floor(UP[i][3]*BAL.costk*Math.pow(UPMAX[i]===Infinity?BAL.costg:BAL.costgCap,G.lv[i]-1));
const hpOf=s=>Math.floor(BAL.hp0*Math.pow(BAL.hpg,s-1)*(s%5==0?BAL.boss:1));
const atk=()=>BAL.atk0*Math.pow(BAL.atkg,G.lv[0]-1)*(G.aw>0?2:1)*(G.fv>0?1.5:1),mul=()=>Math.pow(BAL.mulg,G.lv[3]-1),critP=()=>Math.min(.5,.1+.03*(lvE(4)-1));
const rate=()=>2+.5*(lvE(1)-1),hitP=()=>BAL.hit0*(1+BAL.hitStep*(lvE(2)-1));
const spm=()=>1+BAL.spStep*(lvE(6)-1);                 // SPチャージ倍率
const luck=()=>1+.2*(lvE(5)-1);                         // ルーレットの高倍率(x5以上)の重み
const rushExt=()=>.5*(lvE(7)-1);                        // 大当たり1回のRUSH加算秒
const goldRate=()=>(1+BAL.goldStep*(lvE(8)-1))/BAL.goldBase;   // 黄金玉の発生率(/秒)
const fevRate=()=>(1+BAL.fevStep*(lvE(9)-1))/BAL.fevBase;      // FEVERの発生率(/秒, RUSH外)
function buy(i){const c=cost(i);if(G.gold>=c){G.gold-=c;G.lv[i]++;beep(1000,.1,'triangle');refresh()}}
