/* ---------- 保留変化 (fx/feature) ----------
   熱い保留(色 c>=1)の一部は、入った時は低い色で表示し、待っている間に1段ずつ / 消化直前に本来の色へ変化させる。
   QL の要素 {h,c} に t(本来の色) を足すだけ。startSpin で消化される直前に必ず c=t に戻すので、予告(sp.yk)や当否は変わらない。 */
const HRY={last:-9};
const HGC=['#ffffff','#44aaff','#33dd66','#ff2244','#ffd400'],HNM=['','青','緑','赤','金'];
function hryUp(q,i,to){q.c=to;const col=HGC[to],x=129+i*34,y=288;HRY.last=T;
  try{if(typeof pRing==='function'){pRing(x,y,col,26);if(to>=3)pRing(x,y,'#fff',40)}}catch(e){}
  showMsg('保留変化!! '+HNM[to],col);
  try{if(typeof sePipo==='function')sePipo(to>=3?3:2,72+to*3);else beep(900+to*200,.12,'square',.05)}catch(e){}
  if(to>=3)kyuin(to,col);if(to>=4){banner('金保留!!','#ffd400');shake()}}
// 入賞時: 熱い保留の半分を低い色で隠す
{const _c=onChucker;onChucker=function(){const n0=QL.length,r=_c.apply(this,arguments);try{
  if(QL.length>n0){const q=QL[QL.length-1];if(q.c>=1&&Math.random()<.5){q.t=q.c;q.c=Math.random()<.6?0:Math.max(0,q.c-2)}}}catch(e){}return r}}
// 消化直前: 先頭が隠れていたら本来の色へ(演出つき)
{const _s=startSpin;startSpin=function(){try{const q=QL[0];if(!sp&&G.q>0&&!G.roul&&q&&q.t!=null&&q.c<q.t){hryUp(q,0,q.t)}}catch(e){}return _s.apply(this,arguments)}}
// 待機中: ときどき1段ずつ上がる(同時多発しないよう間隔をあける)
function hryTick(dt){if(T-HRY.last<1.2)return;for(let i=1;i<QL.length;i++){const q=QL[i];if(q.t!=null&&q.c<q.t){if(Math.random()<dt*.35)hryUp(q,i,q.c+1);break}}}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{hryTick(dt)}catch(e){}return r}}
