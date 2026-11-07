/* ---------- battle: rendering (drawB) ---------- */
function drawB(t){const hue=(G.stage*37)%360,g=bc.createLinearGradient(0,0,0,150);g.addColorStop(0,`hsl(${hue},60%,12%)`);g.addColorStop(1,`hsl(${hue},70%,26%)`);bc.fillStyle=g;bc.fillRect(0,0,360,150);
bc.fillStyle='#ffffff55';for(let i=0;i<14;i++)bc.fillRect((i*83+Math.floor(t*6))%360,(i*37)%80,2,2);
bc.fillStyle='rgba(0,0,0,.4)';bc.fillRect(0,118,360,32);bc.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<360;i+=24)bc.fillRect(i,118,12,2);
if(G.rush>0){const r=bc.createLinearGradient(0,150,0,40);r.addColorStop(0,'rgba(255,60,0,.6)');r.addColorStop(1,'rgba(255,60,0,0)');bc.fillStyle=r;bc.fillRect(0,0,360,150);aur(t)}if(G.fv>0)aur(t);
const ds=(n,x,y,s)=>bc.drawImage(SPR[n],x,y,12*s,12*s);
for(let i=0;i<3;i++){const d=t-HA[i],lg=d<.2?Math.sin(d/.2*Math.PI)*(i==0?50:i==1?10:-10):0;bc.fillStyle='rgba(0,0,0,.4)';bc.fillRect(18+i*44+lg,116,40,4);if(G.aw>0){bc.fillStyle=`hsla(${t*500%360},100%,60%,.35)`;bc.beginPath();bc.arc(42+i*44+lg,90,30+Math.sin(t*20)*3,0,TAU);bc.fill()}ds('h'+i,18+i*44+lg,66+Math.sin(t*4+i)*2,4)}
const bs=isBoss()?8:6,sh=G.hit*5,ex=262-bs*6+(Math.random()-.5)*sh,ey=118-bs*12+(isBoss()?6:0)-Math.abs(Math.sin(t*2))*4+(Math.random()-.5)*sh;
bc.fillStyle='rgba(0,0,0,.4)';bc.fillRect(262-bs*5,116,bs*10,5);ds(G.en,ex,ey,bs);
if(G.hit>.6){bc.globalCompositeOperation='lighter';bc.globalAlpha=Math.min(1,G.hit-.4);ds(G.en,ex,ey,bs);bc.globalAlpha=1;bc.globalCompositeOperation='source-over'}
G.hit=Math.max(0,G.hit-.05);drawFX(t);if(sp&&sp.type==2&&sp.t>1.9){lines('#ff3050',t,18);bc.fillStyle='rgba(255,0,40,'+(.12+.1*Math.sin(t*14))+')';bc.fillRect(0,0,360,150)}
PR.forEach(p=>{const e=p.t/.22,x=60+p.i*44+(255-60-p.i*44)*e,y=95-Math.sin(e*Math.PI)*20-e*8;bc.fillStyle=['#ff7a45','#6fe3ff','#9bff6b'][p.i];for(let k=0;k<4;k++){bc.globalAlpha=1-k*.22;bc.fillRect(x-k*7,y+k*2,8-k,8-k)}bc.globalAlpha=1});
bc.fillStyle='#000';bc.fillRect(148,6,196,14);bc.fillStyle=isBoss()?'#ff2d7a':'#3dff7a';bc.fillRect(151,9,190*Math.max(0,G.hp/G.mx),8);bc.fillStyle='#fff';bc.font='11px '+FN;bc.textAlign='center';bc.fillText(fmt(Math.max(0,G.hp)),246,30);
PT.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.15;p.l-=.025;bc.globalAlpha=Math.max(0,p.l);bc.fillStyle=p.c;bc.fillRect(p.x,p.y,4,4)});bc.globalAlpha=1;
for(let i=PT.length-1;i>=0;i--)if(PT[i].l<=0)PT.splice(i,1);
F.forEach(f=>{f.t+=.02;f.y-=.6;bc.globalAlpha=Math.max(0,1-f.t);bc.font=(f.b?'26px ':'16px ')+FN;bc.fillStyle=f.c;bc.strokeStyle='#000';bc.lineWidth=4;bc.strokeText(f.s,f.x,f.y);bc.fillText(f.s,f.x,f.y)});bc.globalAlpha=1;
for(let i=F.length-1;i>=0;i--)if(F[i].t>=1)F.splice(i,1);
if(cmb>=3){bc.textAlign='left';bc.font=(22+Math.min(cmb,30)*.4)+'px '+FN;bc.fillStyle=cmb>=20?'#ff2d7a':'#ffd400';bc.strokeStyle='#000';bc.lineWidth=4;bc.strokeText(cmb+' HIT',8,24);bc.fillText(cmb+' HIT',8,24);bc.textAlign='center'}
if(cut){const p=t-cut.t0;if(p>.95){cut=null}else{if(p>.6&&!cut.f){cut.f=1;cut.cb()}bc.fillStyle='rgba(0,0,0,.78)';bc.fillRect(0,32,360,88);bc.fillStyle=cut.c;bc.globalAlpha=.3;for(let i=-2;i<14;i++){const o=i*30+(p*240)%30;bc.beginPath();bc.moveTo(o,32);bc.lineTo(o+15,32);bc.lineTo(o-15,120);bc.lineTo(o-30,120);bc.fill()}bc.globalAlpha=1;
const e=Math.min(1,p/.2);ds('h'+cut.h,30-(1-e)*160,26,8);bc.font='34px '+FN;bc.textAlign='right';bc.strokeStyle='#000';bc.lineWidth=6;bc.fillStyle='#fff';bc.strokeText(cut.txt,350-(1-e)*200,88);bc.fillText(cut.txt,350-(1-e)*200,88);bc.textAlign='center'}}jpShow(t);drawRes(t)}
