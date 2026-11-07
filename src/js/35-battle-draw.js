/* ---------- battle: rendering (drawB) ----------
   構成: 背景(36) → 状態オーバーレイ(36) → 英雄 → 敵 → スキルFX(80) → 弾 → 被弾/撃破(82) → 粒子 → [カメラ終了] → ビネット/枠/チップ(36) → HP/数字(81)/カットイン */
let eLag=1,hFl=-9,hFlD=.09,pHit=0;const hx=i=>6+i*46,FLT=['m1','m2','m5','m7','m8'],HCOL=['#ff7a45','#6fe3ff','#9bff6b'];
function drawHeroes(t){for(let i=0;i<3;i++){const d=t-HA[i],at=d>=0&&d<.3,lgA=[40,10,-6][i],lg=at?Math.sin(d/.3*Math.PI)*lgA:0,fr=at?(d<.14?'s':'w'):(Math.floor(t*2.6+i*.7)%2?'b':''),x=hx(i)+Math.round(lg),y=52+(at?0:Math.round(Math.sin(t*3+i)*1.2)),n='h'+i+fr;
bc.fillStyle='rgba(0,0,0,.4)';bc.fillRect(hx(i)+10,114,44,4);bc.fillRect(hx(i)+14,112,36,2);
if(G.aw>0){const r=34+Math.sin(t*9+i)*3;bc.fillStyle='rgba(181,123,255,.28)';bc.beginPath();bc.arc(x+32,y+38,r,0,TAU);bc.fill();bc.fillStyle='rgba(255,225,77,.22)';bc.beginPath();bc.arc(x+32,y+38,r*.7,0,TAU);bc.fill();for(let k=0;k<5;k++){bc.fillStyle=k%2?'#ffe14d':'#e0c8ff';bc.fillRect(Math.round(x+10+k*11+Math.sin(t*4+k)*3),Math.round(y+62-((t*40+k*17)%64)),3,3)}}
if(at&&lgA>8)for(let k=1;k<3;k++){const l2=Math.sin(Math.max(0,d-k*.045)/.3*Math.PI)*lgA;bc.globalAlpha=.34/k;bc.drawImage(SPR[n],hx(i)+Math.round(l2),y,64,64)}bc.globalAlpha=1;
bc.drawImage(SPR[n],x,y,64,64);
if(d>=0&&d<.16){const q=d/.16;bc.globalAlpha=1-q;if(i==0){bc.strokeStyle='#fff';bc.lineWidth=5;bc.beginPath();bc.arc(x+34,y+32,26+q*10,-1.2,1.2);bc.stroke();bc.strokeStyle='#ff9a3d';bc.lineWidth=3;bc.beginPath();bc.arc(x+34,y+32,32+q*10,-1.1,1.1);bc.stroke()}
else if(i==1){bc.fillStyle='#fff';bc.fillRect(x+56,y+28,12,2);bc.fillRect(x+61,y+23,2,12);bc.fillStyle='#7ff3ff';bc.fillRect(x+53,y+25,4,4);bc.fillRect(x+66,y+35,4,4)}
else{bc.fillStyle='#caffb0';bc.fillRect(x+58,y+34,28*(1-q*.5),2);bc.fillStyle='#fff';bc.fillRect(x+58,y+34,10,2)}bc.globalAlpha=1}}}
function drawEnemy(t){const sn=enSpr(),boss=isBoss(),S=SPR[sn],sc=boss?4:5,age=t-ENT,dl=boss?.35:.18;if(age>=0&&age<dl)return;const ia=age-dl,iw=boss?.5:.32;
const fl=!boss&&FLT.includes(sn),ph=Math.sin(t*3.1),sx=1+(boss?.015:.035)*ph*(fl?.4:1),sy=1-(boss?.015:.04)*ph*(fl?.4:1),dw=Math.round(S.width*sc*sx),dh=Math.round(S.height*sc*sy);
const hov=fl?Math.round(10+Math.sin(t*3)*4):0,drop=ia>=0&&ia<iw?-Math.round((1-fxEo(ia/iw))*(boss?110:80)):0,sh=G.hit*3,jx=Math.round((Math.random()-.5)*sh),jy=Math.round((Math.random()-.5)*sh);
const dx=EXX-(dw>>1)+jx+Math.round(Math.min(G.hit,1)*4),dy=118-hov-dh+drop+jy+(boss?6:0);
bc.fillStyle='rgba(0,0,0,.4)';const sw2=Math.round(dw*(.8-hov*.01));bc.fillRect(EXX-(sw2>>1),116,sw2,5);bc.fillRect(EXX-(sw2>>1)+6,114,sw2-12,2);
if(boss){for(let i=0;i<14;i++){const x=EXX-56+((i*37)%112),y=122-((t*34+i*23)%110);bc.globalAlpha=.7;bc.fillStyle=i%3?'#ff2030':'#ff8a1f';bc.fillRect(Math.round(x+Math.sin(t*3+i)*4),Math.round(y),i%2?4:2,i%2?4:2)}bc.globalAlpha=1}
bc.drawImage(S,dx,dy,dw,dh);if(t-hFl<hFlD){bc.globalAlpha=.85;bc.drawImage(spw(sn),dx,dy,dw,dh);bc.globalAlpha=1}
if(ia>=iw&&ia<iw+.2&&boss)fxWave(EXX,118,(ia-iw)/.2,'#ff8a1f',6)}
function drawHP(t){const r=Math.max(0,Math.min(1,G.hp/G.mx||0));if(r>eLag)eLag=r;else eLag+=(r-eLag)*Math.min(1,DT*3.5);const boss=isBoss(),c=boss?'#ff2d7a':'#3dff7a',c2=boss?'#ff9ab8':'#c0ffd0';
bc.fillStyle='#000';bc.fillRect(147,7,198,15);bc.fillStyle='#2a2040';bc.fillRect(149,9,194,11);
bc.fillStyle='#fff';bc.fillRect(149,9,Math.round(194*eLag),11);bc.fillStyle=c;bc.fillRect(149,9,Math.round(194*r),11);bc.fillStyle=c2;bc.fillRect(149,9,Math.round(194*r),3);bc.fillStyle='rgba(0,0,0,.35)';for(let i=1;i<10;i++)bc.fillRect(149+Math.round(i*19.4),9,1,11);
pxText(bc,fmt(Math.max(0,G.hp)),340,11,1,'#fff','#cfd6ff','r');
if(boss){bc.textAlign='left';bc.font='11px '+FN;bc.strokeStyle='#000';bc.lineWidth=4;bc.fillStyle='#ff9ab8';const nm=BOSSN[(G.stage/5-1)%4];bc.strokeText(nm,10,19);bc.fillText(nm,10,19);bc.textAlign='center'}}
function drawWarn(t){const a=t-ENT;if(!isBoss()||a<0||a>1.5)return;const k=a<.2?a/.2:a>1.3?(1.5-a)/.2:1;bc.globalAlpha=.9*k;bc.fillStyle='#1a0008';bc.fillRect(0,56,360,26);bc.fillStyle='#ff2030';const o=(t*60)%24;for(let i=-1;i<16;i++){bc.beginPath();bc.moveTo(i*24+o,56);bc.lineTo(i*24+o+10,56);bc.lineTo(i*24+o-2,60);bc.lineTo(i*24+o-12,60);bc.fill();bc.beginPath();bc.moveTo(i*24-o+24,82);bc.lineTo(i*24-o+34,82);bc.lineTo(i*24-o+22,78);bc.lineTo(i*24-o+12,78);bc.fill()}
pxText(bc,'WARNING',180,62,2,Math.floor(t*3)%2?'#fff':'#ff6a7a','#ff2030','c');bc.globalAlpha=1}
function drawB(t){bc.imageSmoothingEnabled=false;const cz=camB(t),z=cz[0],shk=Math.min(7,cz[1]);bc.save();
if(z>1||shk>0){const sx=shk?Math.round((Math.random()-.5)*2*shk):0,sy=shk?Math.round((Math.random()-.5)*2*shk*.6):0;bc.translate(EXX+sx,84+sy);bc.scale(z,z);bc.translate(-EXX,-84)}
drawBgB(t);modeBack(t);
if(G.hit>pHit+.05&&t-hFl>(G.hit>1.2?.1:.22)){hFl=t;hFlD=G.hit>1.2?.17:.07}pHit=G.hit;
drawHeroes(t);drawEnemy(t);G.hit=Math.max(0,G.hit-3*DT);
drawFX(t);
PR.forEach(p=>{const e=Math.min(1,p.t/.22),x=hx(p.i)+60+(EXX-8-hx(p.i)-60)*e,y=78+p.i*4-Math.sin(e*Math.PI)*18+e*6,c=HCOL[p.i];for(let k=4;k>=0;k--){bc.globalAlpha=1-k*.2;bc.fillStyle=k?c:'#fff';const s=k?9-k:6;bc.fillRect(Math.round(x-k*8*(1-e*.3)-s/2),Math.round(y+k*1.5-s/2),s,s)}
if(p.i==2){bc.globalAlpha=1;bc.fillStyle='#fff';bc.fillRect(Math.round(x),Math.round(y)-1,10,3)}bc.globalAlpha=1});
drawHitFx(t);drawDeath(t);
for(let i=PT.length-1;i>=0;i--){const p=PT[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.15;p.l-=.025;if(p.l<=0){PT.splice(i,1);continue}bc.globalAlpha=Math.min(1,p.l);bc.fillStyle=p.c;const s=p.l>.5?4:2;bc.fillRect(Math.round(p.x),Math.round(p.y),s,s)}bc.globalAlpha=1;
bc.restore();
modeFront(t);drawHP(t);drawWarn(t);drawF();drawCmb(t);
drawCut(t);jpShow(t);drawRes(t)}
