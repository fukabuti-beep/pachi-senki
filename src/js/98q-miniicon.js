/* ---------- ミニゲームは小さな札で知らせる (feature) ----------
   作り手の指摘「ミニゲームは確定で時間を取られる」→ ボス撃破でいきなり全画面を出さず、盤面の左上に小さな札 #mib を MIT 秒だけ出す。
   ・札をタップ → いつものミニゲーム(95/98f/98yc のローテーション)が始まる。
   ・放っておく → 時間切れで「おまかせ受け取り」(倍率 x3 ぶんのゴールドを静かに受け取る。放置でも損をしない)。ゲームは止まらない。
   ・札が出ている間に次のボスを倒したら、前の分は おまかせ受け取りにして新しい札に。転生したら消える。
   mini をラップ(89c の「演出が終わってから」の待ち行列より内側、95 のローテーションより外側)。 */
const MIT=25;
const MI={on:0,t:0,go:0,g:0};
const mibE=(()=>{try{const e=document.createElement('button');e.id='mib';e.type='button';e.innerHTML='<b>ミニゲーム</b><small>タップで遊ぶ</small><i><u></u></i>';e.style.display='none';
  ($('pw')||document.body).appendChild(e);e.onclick=ev=>{try{ev.stopPropagation()}catch(x){}miPlay()};e.onpointerdown=ev=>{try{ev.stopPropagation()}catch(x){}};return e}catch(e){return null}})();
function miHide(){MI.on=0;if(mibE)mibE.style.display='none'}
function miAuto(){if(!MI.on)return;miHide();try{X.st.mg++;const g=addGold(G.stage*50*3*mul()*sbg());fxToast('ミニゲームは おまかせ受け取り +G'+fmt(g),'#ffd400')}catch(e){}}
function miPlay(){if(!MI.on)return;miHide();MI.go=1;try{mini()}catch(e){MI.go=0}}
{const o=mini;mini=function(){if(MI.go){MI.go=0;return o.apply(this,arguments)}
  if(MI.on)miAuto();MI.on=1;MI.t=MIT;MI.g=typeof PGEN!=='undefined'?PGEN:0;
  if(mibE){mibE.style.display='block';try{mibE.querySelector('u').style.width='100%'}catch(e){}}
  try{beep(900,.12,'square',.04)}catch(e){}}}
FU.push(dt=>{if(!MI.on)return;if(typeof PGEN!=='undefined'&&PGEN!==MI.g){miHide();return}
  MI.t-=dt;if(MI.t<=0){miAuto();return}
  try{if(mibE)mibE.querySelector('u').style.width=Math.max(0,MI.t/MIT*100).toFixed(0)+'%'}catch(e){}});
