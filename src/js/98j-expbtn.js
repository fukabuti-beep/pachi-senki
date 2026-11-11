/* ---------- 遠征ボタン(操作パネル) (feature) ----------
   作り手の指摘「遠征の導線が無い」: これまで遠征は ☰ → 遊ぶ → 遠征 の奥にしか入口が無かった。
   操作パネル(#ctl)の設定ボタンの前に「遠征」ボタン #expb を JS で足し、押すとメニューの遠征タブを直接開く。
   ボタンの右上に状態を出す: 出発できる=GO(黄)/遠征中=残り時間(水色 例 25m・3h)/帰還=!(赤、ゆっくり脈動)。
   98d の EXP/expOpen/expDone/expLeft を読むだけ(遠征のロジックは変えない)。 */
const ICN_FLAG=['.k........','.krrrrk...','.krrwrrk..','.krrrrrrk.','.krrrrrk..','.kkkkkk...','.k........','.k........','.k........','kkk.......'];
const EXB={el:null,lb:null,last:'',t:0};
(function(){try{
  if(typeof document==='undefined'||!document.createElement)return;const ctl=$('ctl'),ref=$('cfgb');
  const b=document.createElement('button');b.id='expb';b.className='bv sq';b.type='button';if(b.setAttribute)b.setAttribute('aria-label','遠征');
  const cv=document.createElement('canvas');cv.id='expi';cv.width=10;cv.height=10;b.appendChild(cv);
  const s=document.createElement('em');s.id='expbd';b.appendChild(s);
  EXB.el=b;EXB.lb=s;try{if(ctl&&ref&&ctl.insertBefore)ctl.insertBefore(b,ref)}catch(e){}
  try{if(!UX.ICNC.flag)UX.ICNC.flag=UX.fromMap(ICN_FLAG);UX.putIcon('expi','flag')}catch(e){}
  b.onclick=expBtnOpen;
}catch(e){}})();
/* メニューの「遠征」タブを直接開く */
function expBtnOpen(){try{const i=FM.findIndex(m=>m.n==='遠征');if(i<0)return;fxTab=i;fxMenu()}catch(e){}}
function expBtnUpd(){try{const el=EXB.lb;if(!el||typeof EXP==='undefined')return;let t='',c='';
  if(EXP.d<0){if(expOpen(0)){t='GO';c='go'}}
  else if(expDone()){t='!';c='ret'}
  else{const s=Math.ceil(expLeft());t=s>=3600?Math.floor(s/3600)+'h':Math.max(1,Math.ceil(s/60))+'m';c='away'}
  const k=t+c;if(k===EXB.last)return;EXB.last=k;el.textContent=t;EXB.el.className='bv sq'+(c?' x'+c:'')}catch(e){}}
FU.push(dt=>{EXB.t+=dt;if(EXB.t<.5)return;EXB.t=0;expBtnUpd()});
try{expBtnUpd()}catch(e){}
