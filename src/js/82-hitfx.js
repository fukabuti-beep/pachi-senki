/* ---------- 被弾スパーク / 撃破の爆散 / コイン噴出 / 衝撃波リング ----------
   hurt と kill は同一スコープのグローバル関数なので、ここで「ラップ」して演出だけ足す(本体は変更しない) */
const HF=[],DK=[],CN=[],RG=[];let ENT=-9,DKT=-9,DKB=0;const EXX=262;
function hitFx(col,big,crit){if(HF.length>=26)return;HF.push({x:EXX+(Math.random()-.5)*52,y:84+(Math.random()-.5)*50,t0:T,c:col||'#fff',cr:crit?1:0,b:big?1:0})}
function ringFx(x,y,r1,c,w,life,delay,fill){if(RG.length>=24)return;RG.push({x,y,t0:T+(delay||0),r1,c,w,life:life||.45,fill:fill||0})}
function deathFx(spr,boss){const s=boss?4:5,sw=SPR[spr],L=PXL[spr];if(!sw||!L)return;const ox=EXX-sw.width*s/2,oy=118-sw.height*s,cx=sw.width/2;
for(let i=0;i<L.length&&DK.length<260;i++){const q=L[i];if(q[0]%2||q[1]%2)continue;DK.push({x:ox+q[0]*s,y:oy+q[1]*s,vx:(q[0]-cx+.5)*(boss?16:22)+(Math.random()-.5)*60,vy:-60-Math.random()*200-(sw.height-q[1])*3,c:q[2],z:s*2,t0:T,l:.9+Math.random()*.5,r:Math.random()*2})}
DKT=T;DKB=boss?1:0;ringFx(EXX,84,boss?260:150,'#fff',boss?9:6,boss?.6:.4);ringFx(EXX,84,boss?200:110,'#ffd400',4,.5,.07);ringFx(EXX,84,boss?44:26,'#fff',0,.14,0,1);
if(boss){for(let i=0;i<6;i++)ringFx(EXX+(Math.random()-.5)*80,60+Math.random()*50,34+Math.random()*30,i%2?'#ff9a2a':'#ffe14d',4,.35,.12+i*.13);try{flash('#fff')}catch(e){}}
const n=boss?26:10;for(let i=0;i<n&&CN.length<90;i++)CN.push({x:EXX+(Math.random()-.5)*30,y:92,vx:(Math.random()-.5)*230,vy:-170-Math.random()*190,t0:T,l:1.5+Math.random()*.5,b:0})}
{const _k=kill;kill=function(){const sn=enSpr(G.stage),bs=isBoss();const r=_k.apply(this,arguments);try{deathFx(sn,bs);ENT=T}catch(e){}return r}}
{const _h=hurt;hurt=function(x,col,big,crit){try{hitFx(col,big,crit)}catch(e){}return _h.apply(this,arguments)}}
function drawHitFx(t){for(let i=HF.length-1;i>=0;i--){const f=HF[i],a=t-f.t0,life=f.cr?.34:.2;if(a>life||a<0){if(a>life)HF.splice(i,1);continue}const q=a/life,L=Math.round((f.cr?22:f.b?14:9)*(.4+Math.sin(q*1.57)*.8)),th=f.cr?4:2,x=Math.round(f.x),y=Math.round(f.y);bc.globalAlpha=1-q*q;bc.fillStyle=f.c;bc.fillRect(x-L,y-th/2,L*2,th);bc.fillRect(x-th/2,y-L,th,L*2);
const d=L*.6|0;bc.fillRect(x-d,y-d,2,2);bc.fillRect(x+d,y-d,2,2);bc.fillRect(x-d,y+d,2,2);bc.fillRect(x+d,y+d,2,2);bc.fillStyle='#fff';const c=f.cr?8:5;bc.fillRect(x-c/2,y-c/2,c,c);if(f.cr){bc.fillRect(x-L,y-1,L*2,2);bc.fillRect(x-1,y-L,2,L*2)}}bc.globalAlpha=1}
function drawDeath(t){
for(let i=RG.length-1;i>=0;i--){const g=RG[i],a=t-g.t0;if(a>g.life){RG.splice(i,1);continue}if(a<0)continue;const q=a/g.life,e=1-(1-q)*(1-q);bc.globalAlpha=1-q;if(g.fill){bc.fillStyle=g.c;bc.beginPath();bc.arc(g.x,g.y,g.r1*(.4+e*.6),0,TAU);bc.fill()}else{bc.strokeStyle=g.c;bc.lineWidth=Math.max(1,g.w*(1-q*.7));bc.beginPath();bc.arc(g.x,g.y,3+g.r1*e,0,TAU);bc.stroke()}}bc.globalAlpha=1;
for(let i=DK.length-1;i>=0;i--){const p=DK[i],a=t-p.t0;if(a>p.l){DK.splice(i,1);continue}const x=p.x+p.vx*a,y0=p.y+p.vy*a+420*a*a,y=Math.min(y0,126),q=a/p.l;bc.globalAlpha=q<.6?1:1-(q-.6)/.4;bc.fillStyle=a<.07?'#fff':p.c;const z=p.z*(1-q*.4);bc.fillRect(Math.round(x),Math.round(y),Math.ceil(z),Math.ceil(z))}bc.globalAlpha=1;
for(let i=CN.length-1;i>=0;i--){const c=CN[i],a=t-c.t0;if(a>c.l){CN.splice(i,1);continue}let y=c.y+c.vy*a+520*a*a;const gy=122;if(y>gy){const k=Math.min(.7,(y-gy)/80);y=gy-Math.abs(Math.sin((a-.55)*5))*22*Math.max(0,1-a/c.l)}
const w=Math.max(2,Math.round(8*Math.abs(Math.cos(a*11)))),x=c.x+c.vx*a;bc.globalAlpha=a>c.l-.3?(c.l-a)/.3:1;bc.drawImage(COINI,Math.round(x-w/2),Math.round(y-4),w,8)}bc.globalAlpha=1}
