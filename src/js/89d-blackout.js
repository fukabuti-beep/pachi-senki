/* ---------- 暗転予告 (fx) + 激アツ演出の共通オーバーレイ ----------
   HY: #app の上に重ねる透明キャンバス(#hyc, 384x786=筐体の座標, pointer-events:none, z-index:4=強化シートより下)。
       暗転(89d)・スロット破砕/巨大スロット(89e)が使う。何も出ていない時は display:none(描画コストなし)。
   暗転: 回転開始時に、当否から決まる確率で「暗転」を仕込む(信頼度つきの予告。当否・図柄・停止時間は変えない)。
       擬似連(86)が終わって 0.45 秒後に、戦闘画面と盤面がゆっくり暗くなる(スロットだけ明るいまま)→
       リーチ発生で明ける: SUPER=「発展!!」/リーチ=「リーチ!」/ハズレ=ゆっくり戻る(ガセ)。点滅はしない(不透明度を毎秒1.3程度で上下するだけ)。
       RUSH 中はテンポ優先で出さない。強化シートが開いている間は描かない。転生(PGEN が変わる)や回転の打ち切りで即消える。
   BK.force = 1 で次の回転に必ず暗転(テスト用)。 */
const HY={cv:null,c:null,on:0,lay:null,layT:-9};
function hyCtx(){if(HY.cv!==null)return HY.c;HY.cv=0;try{const a=$('app'),cv=document.createElement('canvas');cv.width=384;cv.height=786;cv.id='hyc';if(cv.style)cv.style.display='none';a.appendChild(cv);HY.cv=cv;HY.c=cv.getContext('2d')}catch(e){HY.c=null}return HY.c}
function hyRect(id,fb){try{let e=$(id);const w=e.offsetWidth,h=e.offsetHeight;if(!(h>0&&w>1))return fb;let x=0,y=0,k=0;while(e&&e.id!=='app'&&k++<6){x+=e.offsetLeft||0;y+=e.offsetTop||0;e=e.offsetParent}return{x,y,w,h}}catch(e){return fb}}
function hyLay(){if(HY.lay&&T-HY.layT<1&&T>=HY.layT)return HY.lay;HY.layT=T;return HY.lay={b:hyRect('bw',{x:12,y:82,w:360,h:158}),s:hyRect('slot',{x:12,y:245,w:360,h:66}),p:hyRect('pw',{x:12,y:317,w:360,h:400})}}
function hySheet(){try{const a=$('app');return !!(a&&a.classList&&a.classList.contains('upo'))}catch(e){return false}}
function hyLite(){return (typeof UX!=='undefined'&&UX.S&&UX.S.fl<=0)||(typeof FXRM!=='undefined'&&FXRM)}
// 各演出の描画関数(順に呼ぶ)。fn(c,t,L) が true を返したら「まだ描いている」
const HYD=[];
function hyFrame(t){if(!HYD.length)return;let any=0;for(const d of HYD)if(d.act())any=1;
  if(!any){if(HY.on){HY.on=0;try{HY.c&&HY.c.clearRect(0,0,384,786);if(HY.cv&&HY.cv.style)HY.cv.style.display='none'}catch(e){}}return}
  const c=hyCtx();if(!c)return;if(!HY.on){HY.on=1;try{if(HY.cv.style)HY.cv.style.display='block'}catch(e){}}
  c.clearRect(0,0,384,786);if(hySheet())return;const L=hyLay();c.imageSmoothingEnabled=false;
  for(const d of HYD)if(d.act()){c.save();try{d.draw(c,t,L)}catch(e){}c.restore()}}
function hyTxt(c,t,x,y,px,fill){if(typeof thickTxt==='function')thickTxt(c,t,x,y,px,fill,{d:px>=24?3:2,lw:px>=24?7:4});else{c.font=px+'px '+FN;c.lineWidth=5;c.strokeStyle='#000';c.strokeText(t,x,y);c.fillStyle=fill;c.fillText(t,x,y)}}

/* --- 暗転 --- */
const BK={s:null,force:0,n:0};
function bkProb(s){if(s.jp)return .5;if(s.hit)return s.type==2?.3:.18;if(s.type==2)return .07;if(s.type==1)return .02;return s.yk>=3?.04:.005}
{const _st=startSpin;startSpin=function(){const was=sp,r=_st.apply(this,arguments);try{const s=sp;if(!was&&s&&!s.bk0){s.bk0=1;
  if(G.rush<=0&&(BK.force||Math.random()<bkProb(s))){BK.force=0;s.bko=1;BK.s={sp:s,ph:0,a:0,t0:T,g:PGEN,rel:-1,tx:null}}}}catch(e){}return r}}
function bkUpd(dt){const B=BK.s;if(!B)return;const s=B.sp;
  if(B.g!==PGEN){BK.s=null;hyDuck(0);return}
  if(B.ph<3&&sp!==s){B.ph=3;B.rel=0;hyDuck(0)}
  if(B.ph==0){if((!s.pzN||s.pzI>=s.pzN)&&s.t>=.45){B.ph=1;B.t0=T;BK.n++;seHy('bko');try{showMsg('……','#9aa0c8')}catch(e){}}}
  else if(B.ph==1){B.a=Math.min(.82,B.a+dt*1.3);
    if(s.rs||(!s.type&&s.t>=2.0)){B.ph=3;B.rel=s.type|0;B.tr=T;seHy('rel',B.rel);B.tx=B.rel==2?['発展!!','#ff2d7a']:B.rel==1?['リーチ!','#44aaff']:null}}
  if(B.ph==3){B.a-=dt*(B.rel>0?1.8:.9);if(B.a<=0){B.a=0;if(!B.tx||T-B.tr>.9)BK.s=null}}}
function bkDraw(c,t,L){const B=BK.s;if(!B)return;const a=Math.max(0,B.a),S=L.s;
  if(a>0){c.fillStyle='rgba(0,0,6,'+a.toFixed(3)+')';const y0=S.y-4,y1=S.y+S.h+4;c.fillRect(0,0,384,y0);c.fillRect(0,y1,384,786-y1);c.fillRect(0,y0,Math.max(0,S.x-4),y1-y0);c.fillRect(S.x+S.w+4,y0,384-(S.x+S.w+4),y1-y0);
    // スロットの縁だけ淡く光らせる(スポットライト)
    c.fillStyle='rgba(255,240,200,'+(a*.35).toFixed(3)+')';c.fillRect(S.x-4,y0-2,S.w+8,2);c.fillRect(S.x-4,y1,S.w+8,2);
    // 盤面の中央に細い光の線がのびる(溜め)
    if(B.ph==1){const q=Math.min(1,(T-B.t0)/1.4),w=Math.round(q*220);c.fillStyle='rgba(255,255,255,'+(.25+q*.35).toFixed(3)+')';c.fillRect(L.p.x+L.p.w/2-w/2,L.p.y+L.p.h*.42,w,2);
      c.fillStyle='rgba(200,190,255,'+(a*.6).toFixed(3)+')';c.font='12px '+FN;c.textAlign='center';c.fillText('・・・',L.p.x+L.p.w/2,L.p.y+L.p.h*.42-10)}}
  if(B.tx&&B.tr!=null){const p=T-B.tr;if(p<.9){const s=p<.14?2.2-p/.14*1.2:1;c.save();c.globalAlpha=Math.min(1,(.9-p)*4);c.translate(L.p.x+L.p.w/2,L.p.y+L.p.h*.42);c.scale(s,s);c.textAlign='center';hyTxt(c,B.tx[0],0,0,B.rel==2?40:30,B.tx[1]);c.restore()}}}
HYD.push({act:()=>!!BK.s,draw:bkDraw});
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{bkUpd(dt)}catch(e){BK.s=null;hyDuck(0)}return r}}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{hyFrame(t)}catch(e){}return r}}
