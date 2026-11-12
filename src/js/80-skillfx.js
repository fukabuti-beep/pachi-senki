/* ---------- skill fx: 烈火斬(fire) / 雷撃陣(bolt) / 千矢雨(arrow) + カメラ(ズーム/揺れ) + JACKPOT ----------
   FX[]={k,t0}。p = 発動からの秒数。draw は戦闘キャンバス(bc)のワールド空間(カメラ変換の内側) */
const fxRn=a=>Math.abs(Math.sin(a*127.1)*43758.5%1),fxBmp=(p,a,b,c)=>p<a?0:p<b?(p-a)/(b-a):p<c?1-(p-b)/(c-b):0,fxEo=q=>1-(1-Math.min(1,Math.max(0,q)))*(1-Math.min(1,Math.max(0,q)));
const FXRM=typeof matchMedia=='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;/* 視覚過敏配慮: reduce 時はズーム/揺れ/白フラッシュを弱める */
/* カメラ: [ズーム倍率, 揺れ振幅px] を FX と撃破演出から算出 */
function camB(t){let z=1,sh=0;for(let i=0;i<FX.length;i++){const f=FX[i],p=t-f.t0,sk=a=>p>=a?1-(p-a):0;
if(f.k==0){z=Math.max(z,1+.16*fxBmp(p,.3,.45,1));if(p>.4)sh=Math.max(sh,6*Math.max(0,1-(p-.4)/.55))}
else if(f.k==1){[.3,.45,.6,.75].forEach(a=>{if(p>=a)sh=Math.max(sh,3*Math.max(0,1-(p-a)/.14))});if(p>=.9)sh=Math.max(sh,9*Math.max(0,1-(p-.9)/.5));z=Math.max(z,1+.14*fxBmp(p,.8,.95,1.4))}
else{if(p>=.8)sh=Math.max(sh,7*Math.max(0,1-(p-.8)/.5));z=Math.max(z,1+.12*fxBmp(p,.74,.88,1.3))}}
const a=T-DKT;if(a>=0&&a<.6)sh=Math.max(sh,(DKB?9:3)*(1-a/.6));return FXRM?[1+(z-1)*.3,sh*.3]:[z,sh]}
/* ギザギザの稲妻(太さ違いを重ね描き。shadowBlur不使用) */
function fxZap(x0,y0,x1,y1,n,amp,sd,ws,cs){const pt=[[x0,y0]];for(let k=1;k<n;k++){const u=k/n;pt.push([x0+(x1-x0)*u+(fxRn(sd*7+k*13)-.5)*amp,y0+(y1-y0)*u+(fxRn(sd*3+k*5)-.5)*amp*.4])}pt.push([x1,y1]);bc.lineJoin='miter';for(let j=0;j<ws.length;j++){bc.strokeStyle=cs[j];bc.lineWidth=ws[j];bc.beginPath();pt.forEach((q,i)=>i?bc.lineTo(q[0],q[1]):bc.moveTo(q[0],q[1]));bc.stroke()}}
function fxSlash(x0,y0,x1,y1,w,c){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy),nx=-dy/L*w,ny=dx/L*w;bc.fillStyle=c;bc.beginPath();bc.moveTo(x0,y0);bc.lineTo((x0+x1)/2+nx,(y0+y1)/2+ny);bc.lineTo(x1,y1);bc.lineTo((x0+x1)/2-nx,(y0+y1)/2-ny);bc.fill()}
function fxWave(x,y,q,c,w){if(q<0||q>1)return;bc.globalAlpha=1-q;bc.strokeStyle=c;bc.lineWidth=Math.max(1,w*(1-q*.6));bc.beginPath();bc.arc(x,y,6+fxEo(q)*420,0,TAU);bc.stroke();bc.globalAlpha=1}
function fxFlash(a,c){if(a<=0)return;bc.globalAlpha=Math.min(.6,a)*(FXRM?.35:1);bc.fillStyle=c||'#fff';bc.fillRect(-24,-24,408,198);bc.globalAlpha=1}
/* 烈火斬: 三日月の炎刃が残像を引いて飛び、X字斬撃 + 全画面の衝撃波 + 火柱 */
function fire(p){bc.lineCap='butt';if(p<.55)lines('#ffb040',T,9);
if(p<.2){for(let i=0;i<10;i++){const a=i*.63+p*22,r=28*(1-p/.2)+4;bc.fillStyle=i%2?'#ffd400':'#ff5a1a';bc.fillRect(Math.round(64+Math.cos(a)*r),Math.round(84+Math.sin(a)*r*.8),4,4)}}
const u=(p-.06)/.34;if(u>0&&u<1.02){for(let k=6;k>=0;k--){const uu=u-k*.05;if(uu<0||uu>1)continue;const x=70+fxEo(uu*.9+.1*uu)*190,r=36-k*1.5;bc.globalAlpha=k?(1-k/7)*.55:1;if(k){bc.strokeStyle='#ff7a1f';bc.lineWidth=11-k;bc.beginPath();bc.arc(x-24,84,r,-1.1,1.1);bc.stroke()}else{[['#ff3a10',13],['#ffd400',8],['#fff',3]].forEach(a=>{bc.strokeStyle=a[0];bc.lineWidth=a[1];bc.beginPath();bc.arc(x-24,84,r,-1.1,1.1);bc.stroke()})}}bc.globalAlpha=1;
if(Math.random()<.8)PT.push({x:70+u*190,y:84+(Math.random()-.5)*50,vx:-2-Math.random()*2,vy:(Math.random()-.5)*2,l:.7,c:Math.random()<.5?'#ff7a1f':'#ffd400'})}
const q=p-.4;if(q>=0){if(q<.36){const k=Math.sin(q/.36*Math.PI),w=11*k;fxSlash(EXX-72,36,EXX+72,128,w*1.5,'#ff6a1a');fxSlash(EXX-72,36,EXX+72,128,w*.8,'#fff');if(q>.05){const k2=Math.sin(Math.min(1,(q-.05)/.31)*Math.PI),w2=11*k2;fxSlash(EXX+72,36,EXX-72,128,w2*1.5,'#ff6a1a');fxSlash(EXX+72,36,EXX-72,128,w2*.8,'#fff')}}
fxWave(EXX,84,q/.55,'#ffb040',10);fxWave(EXX,84,(q-.08)/.55,'#fff',5);
for(let i=0;i<7;i++){const hgt=(38+(i%3)*16)*fxBmp(q,0,.14,.62);for(let y=0;y<hgt;y+=5){bc.fillStyle=y>hgt*.7?'#ffe14d':y>hgt*.35?'#ff8a1f':'#e0301a';const j=Math.round((fxRn(i*9+y+Math.floor(T*14))-.5)*6);bc.fillRect(EXX-56+i*18+j,121-y,6,5)}}
fxFlash(.55*(1-q/.12))}}
/* 雷撃陣: 魔法陣が広がり、4連の落雷 → 最後に極太の雷柱と画面端までのチェーンライトニング */
function bolt(p){bc.lineCap='butt';const g=Math.min(1,p/.28),rx=72*fxEo(g),ry=rx*.26,fa=Math.min(1,p*5)*(p>1.3?Math.max(0,1-(p-1.3)/.3):1);
if(p>.15&&p<1.5){bc.fillStyle='rgba(0,12,50,'+Math.min(.4,(p-.15))+')';bc.fillRect(-24,-24,408,198)}
bc.globalAlpha=fa;bc.strokeStyle='#22e0ff';bc.lineWidth=3;bc.setLineDash([9,6]);bc.lineDashOffset=-p*110;bc.beginPath();bc.ellipse(EXX,116,rx,ry,0,0,TAU);bc.stroke();bc.beginPath();bc.ellipse(EXX,116,rx*.6,ry*.6,0,0,TAU);bc.stroke();bc.setLineDash([]);
bc.strokeStyle='#bff';bc.lineWidth=2;bc.beginPath();for(let i=0;i<=5;i++){const a=(i*2%5)*1.2566+p*3;const x=EXX+Math.cos(a)*rx*.95,y=116+Math.sin(a)*ry*.95;i?bc.lineTo(x,y):bc.moveTo(x,y)}bc.stroke();
bc.fillStyle='rgba(120,240,255,.18)';bc.fillRect(EXX-rx*.5,30,rx,86);bc.globalAlpha=1;
const ts=[.3,.45,.6,.75],xs=[EXX-46,EXX+42,EXX-16,EXX+24];for(let i=0;i<4;i++){const a=p-ts[i];if(a<0||a>.2)continue;const sd=Math.floor(a*16)+i*9;fxZap(xs[i],-8,xs[i]+(fxRn(sd)-.5)*10,116,8,26,sd,[10,5,2],['rgba(34,224,255,.35)','#9ef','#fff']);bc.globalAlpha=1-a/.2;bc.strokeStyle='#9ef';bc.lineWidth=3;bc.beginPath();bc.ellipse(xs[i],116,6+a*190,3+a*50,0,0,TAU);bc.stroke();bc.globalAlpha=1;
if(a<.04)for(let k=0;k<4;k++)PT.push({x:xs[i],y:112,vx:(Math.random()-.5)*7,vy:-2-Math.random()*4,l:.6,c:k%2?'#fff':'#7ff3ff'})}
const a=p-.9;if(a>=0&&a<.55){const sd=Math.floor(a*14);fxZap(EXX,-10,EXX,118,9,16,sd,[34,20,9,4],['rgba(34,224,255,.3)','#22e0ff','#cff','#fff']);if(a<.3){bc.fillStyle='rgba(180,250,255,'+(.6*(1-a/.3))+')';bc.fillRect(EXX-26,0,52,125)}
for(let i=0;i<6;i++){const ex=i%2?362:-2,ey=14+i*25;fxZap(EXX,80,ex,ey,12,24,sd*3+i,[5,2],['#22e0ff','#fff'])}fxWave(EXX,84,a/.5,'#7ff3ff',9);fxWave(EXX,84,(a-.07)/.5,'#fff',4);fxFlash(.5*(1-a/.12))}}
/* 千矢雨: ロックオン → 35本の矢の雨(残像つき) → 画面を貫く巨大な矢と波動 */
function arrow(p){bc.lineCap='round';
if(p<.85){const r0=fxEo(p/.3),r=60-34*r0,al=Math.min(1,p*6)*(p>.7?(.85-p)/.15:1);bc.globalAlpha=al;bc.strokeStyle='#9bff6b';bc.lineWidth=2;bc.setLineDash([6,5]);bc.lineDashOffset=-p*70;bc.beginPath();bc.arc(EXX,84,r,0,TAU);bc.stroke();bc.setLineDash([]);bc.beginPath();bc.arc(EXX,84,r*.5,0,TAU);bc.stroke();bc.fillStyle='#caffb0';[[0,-1],[1,0],[0,1],[-1,0]].forEach(d=>bc.fillRect(Math.round(EXX+d[0]*(r+8))-1,Math.round(84+d[1]*(r+8))-1,3,3));bc.globalAlpha=1}
for(let i=0;i<35;i++){const q=(p-.1-i*.017)/.17;if(q<0||q>1.5)continue;const ex=EXX+((i*7)%9-4)*8,ey=70+((i*5)%7)*8,sx=ex-150-(i%5)*14,sy=-14,dx=ex-sx,dy=ey-sy,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;
if(q<=1){for(let k=2;k>=0;k--){const u=Math.max(0,q-k*.1),x=sx+dx*u,y=sy+dy*u;bc.globalAlpha=k?.4-k*.15:1;bc.strokeStyle='#9bff6b';bc.lineWidth=3;bc.beginPath();bc.moveTo(x-ux*30,y-uy*30);bc.lineTo(x,y);bc.stroke();if(!k){bc.strokeStyle='#fff';bc.lineWidth=1.5;bc.beginPath();bc.moveTo(x-ux*10,y-uy*10);bc.lineTo(x,y);bc.stroke();bc.fillStyle='#fff';bc.fillRect(Math.round(x)-2,Math.round(y)-2,4,4)}}bc.globalAlpha=1}
else{const a=q-1;bc.globalAlpha=1-a/.5;bc.fillStyle='#caffb0';const r=4+a*26;bc.fillRect(Math.round(ex-r),Math.round(ey)-1,Math.round(r*2),2);bc.fillRect(Math.round(ex)-1,Math.round(ey-r),2,Math.round(r*2));bc.strokeStyle='#9bff6b';bc.lineWidth=2;bc.beginPath();bc.arc(ex,ey,2+a*40,0,TAU);bc.stroke();bc.globalAlpha=1}}
const u=(p-.8)/.12;if(u>0){if(u<1){const x=-90+fxEo(u*.7+u*.3)*(EXX+110);bc.fillStyle='rgba(202,255,176,.3)';bc.fillRect(0,72,x,20);bc.fillStyle='#9bff6b';bc.fillRect(x-70,79,70,6);bc.fillStyle='#fff';bc.fillRect(x-70,81,70,2);bc.fillStyle='#9bff6b';bc.beginPath();bc.moveTo(x,70);bc.lineTo(x+26,82);bc.lineTo(x,94);bc.fill();bc.fillStyle='#fff';bc.beginPath();bc.moveTo(x,76);bc.lineTo(x+14,82);bc.lineTo(x,88);bc.fill();lines('#9bff6b',T,12)}
else{const a=(u-1)*.12;bc.globalAlpha=Math.max(0,1-a/.3);bc.fillStyle='#caffb0';bc.fillRect(EXX-14,0,28,125);bc.globalAlpha=1;fxWave(EXX,82,a/.5,'#9bff6b',9);fxWave(EXX,82,(a-.07)/.5,'#fff',4);fxFlash(.5*(1-a/.1),'#eaffdc')}}}
function drawFX(t){for(let i=FX.length-1;i>=0;i--){const f=FX[i],p=t-f.t0;if(p>1.6){FX.splice(i,1);continue}[fire,bolt,arrow][f.k](p)}}
function lines(c,t,n){bc.fillStyle=c;bc.globalAlpha=.55;for(let i=0;i<n;i++){bc.fillRect(Math.round(360-((t*700+i*131)%460)),(i*53+7)%150,60+(i%3)*30,2)}bc.globalAlpha=1}
/* JACKPOT: 金のコイン雨 + ドット極太ロゴ(虹色・波打ち) */
function jpShow(t){if(G.jp<=0)return;for(let i=0;i<5;i++)if(PT.length<1200)PT.push({x:Math.random()*360,y:-4,vx:0,vy:2+Math.random()*3,l:1.5,c:Math.random()<.5?'#ffd400':'#fff3a0'});
const s='JACKPOT',sc=7,x0=180-pxW(s,sc)/2,pop=Math.max(0,1-(5-G.jp)*3);for(let i=0;i<s.length;i++){const h=(Math.floor((t*4+i*1.2))%12)*30,c1='hsl('+h+',100%,66%)',c2='hsl('+h+',100%,46%)';pxText(bc,s[i],x0+i*6*sc,50+Math.round(Math.sin(t*6+i*.8)*5)-Math.round(pop*14),sc,c1,c2,'l')}
pxText(bc,'MAX BONUS',180,100,2,'#fff','#ffd400','c')}
