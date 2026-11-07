/* ---------- slot ---------- */
let sp=null;
function startSpin(){if(sp||G.q<=0||G.roul)return;G.q--;const rush=G.rush>0,Q0=QL.shift()||{h:0,c:0},hit=Q0.h,dg=()=>Math.floor(Math.random()*10);let type=0,f;
if(hit){var jp=Math.random()<BAL.jpP;let d=jp?7:dg();if(!jp&&d==7)d=3;f=[d,d,d];type=jp?2:Math.random()<.6?2:1}
else if(Math.random()<.3){const d=dg();let e=dg();while(e==d)e=dg();f=[d,d,e];type=Math.random()<.25?2:1}
else{f=[dg(),dg(),dg()];if(f[0]==f[1])f[1]=(f[1]+1)%10}
sp={t:0,f,type,hit,jp,yk:Q0.c,stop:[1,1.9,type==2?7.5:type==1?4.8:2.8],ph:[0,0,0],sc:rush?2.2:1};showMsg('回転中…')}
function updSpin(dt){if(!sp)return;sp.t+=dt*sp.sc;const t=sp.t;let done=true;
for(let i=0;i<3;i++){const el=$('r'+i);if(t>=sp.stop[i]){el.textContent=sp.f[i];el.className='r'}else{done=false;const spd=(i==2&&sp.type&&t>1.9)?14*Math.max(.1,(sp.stop[2]-t)/(sp.stop[2]-1.9)):14;sp.ph[i]+=dt*sp.sc*spd;el.textContent=Math.floor(sp.ph[i])%10;el.className='r s'}}
if(sp.type&&!sp.rs&&t>1.9){sp.rs=1;showMsg(sp.type==2?'SUPER BATTLE REACH!!':'リーチ!','#ff2d7a');beep(500,.3,'sawtooth');kyuin(sp.type==2?6:3,sp.type==2?'#f24':'#4af');if(sp.type==2){flash('#f00');shake();banner('SUPER REACH','#ff2d7a')}}
if(sp.yk&&!sp.ys&&t>1){sp.ys=1;const L=sp.yk,c=['','#4af','#3d6','#f24','#ffd400'][L];banner(['','チャンス','チャンス!!','激アツ!!','激アツ確定!!'][L],c);kyuin(L+1,c);if(L>=3)shake()}if(sp.type==2&&sp.t>1.9)G.hit=Math.max(G.hit,.5);
if(done){const h=sp.hit,j=sp.jp;sp=null;if(h)bigHit(j);else{showMsg('はずれ','#aaa');if(G.rush<=0)res('MISS...','#9aa0c8',0)}startSpin()}}
