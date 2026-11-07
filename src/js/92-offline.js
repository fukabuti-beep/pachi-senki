/* ---------- feature 92: おかえりボーナス(オフライン進行) ----------
   最終プレイ時刻 X.t からの経過(上限8時間)に応じてゴールド。基準は「オンライン中の平均収入 X.gps」(自己校正)。
   最初の2時間は等倍、以降は半分の効率。さらに全体に OFFL.eff を掛ける。 */
const OFFL={minS:60,half:7200,eff:.5};
let OFFD=null;
/* 離れていた秒数(0〜MAXAWAY にクランプ。時計が未来/壊れていたら0) */
function awaySec(now){const t=fnum(X.t);if(!t)return 0;const s=(fnum(now,nowMs())-t)/1000;return Number.isFinite(s)&&s>0?Math.min(s,MAXAWAY):0}
/* 収入の基準(ゴールド/秒): 実測が無ければ敵HPから概算 */
function offRate(){const r=X.gps>0?X.gps:G.mx*.35*mul()/8;return Number.isFinite(r)&&r>0?r:0}
function offlineGold(sec){sec=Math.min(Math.max(fnum(sec),0),MAXAWAY);const e=Math.min(sec,OFFL.half)+Math.max(0,sec-OFFL.half)*.5;const g=Math.floor(e*offRate()*OFFL.eff*(typeof SB!=='undefined'?SB.g():1));return Number.isFinite(g)?g:0}
function fmtAway(s){const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h>0?h+'時間'+m+'分':m+'分'}
function offlineCheck(){
  const s=awaySec(nowMs());X.t=nowMs();
  if(s<OFFL.minS||fxOpen)return 0;
  const g=addGold(offlineGold(s));saveX();
  OFFD={t:0,g,tk:0,done:0};
  fxShow('<div class="fxh">おかえりなさい!</div><div class="fxs">放置 '+fmtAway(s)+(s>=MAXAWAY?' (上限)':'')+' のあいだに</div><div class="fxn" id="fxon">G 0</div><div class="fxs">ゴールドを獲得した!</div>',[['受け取る!',fxClose]]);
  return g}
FU.push(dt=>{const d=OFFD;if(!d)return;d.t+=dt;const p=Math.min(1,d.t/2.4),v=Math.floor(d.g*(1-Math.pow(1-p,3)));
  fxSet('fxon','G '+fmt(p>=1?d.g:v));
  d.tk-=dt;if(p<1&&d.tk<=0){d.tk=.05;beep(400+p*900,.03,'square',.03)}
  if(p>=1&&!d.done){d.done=1;fan();flash('#ffd400');kyuin(4,'#ffd400')}
  if(d.t>7)fxClose()});
