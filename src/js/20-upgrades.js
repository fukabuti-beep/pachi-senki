/* ---------- upgrades: data + stat formulas + buy ---------- */
const UP=[['攻','英雄強化','ダメージ+25%',15],['速','発射速度','玉の数UP',20],['当','当たり確率','大当たりUP',30],['金','ゴールド','獲得+20%',25],['会','会心率','CRIT UP',22],['運','ルーレット運','高倍率UP',40],['溜','SPチャージ','ゲージ増加',35,3],['延','RUSH延長','継続+0.5秒',50,8],['黄','黄金玉率','黄金玉UP',60,12],['祭','FEVER率','発生率UP',80,16]];
const cost=i=>Math.floor(UP[i][3]*Math.pow(1.45,G.lv[i]-1));
const atk=()=>5*Math.pow(1.25,G.lv[0]-1)*(G.aw>0?2:1)*(G.fv>0?1.5:1),mul=()=>Math.pow(1.2,G.lv[3]-1),critP=()=>Math.min(.6,.1+.03*(G.lv[4]-1));
const rate=()=>Math.min(12,2+.6*(G.lv[1]-1)),hitP=()=>Math.min(.5,(1/25)*(1+.2*(G.lv[2]-1)));
function buy(i){const c=cost(i);if(G.gold>=c){G.gold-=c;G.lv[i]++;beep(1000,.1,'triangle');refresh()}}
