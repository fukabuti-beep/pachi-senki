/* ---------- 戦闘画面: 背景ワールド(5種, 5ステージごと) / 状態別オーバーレイ / 枠 / 状態チップ ----------
   背景はワールドごとに一度だけオフスクリーンへ描いて drawImage(毎フレームのグラデ生成なし) */
const WORLDS=[
{sky:['#1b1048','#3a1a6a','#7a2a7a','#c0484f','#e8844a','#f4b060'],mt:'#2e2060',mt2:'#4a2a78',gr:'#2c6a40',gr2:'#3e8a50',st:1,k:0},
{sky:['#06141c','#0a2430','#0e3640','#124850','#16585e','#1a6a6a'],mt:'#0a2a34',mt2:'#123e48',gr:'#2a3c46',gr2:'#3c5560',st:0,k:1},
{sky:['#1c0606','#340a0a','#58120c','#84200e','#b03a12','#e0701c'],mt:'#240a0a',mt2:'#401410',gr:'#3a1a12',gr2:'#e0501a',st:0,k:2},
{sky:['#0a1a3c','#143a6a','#2a68a0','#5a9ccc','#90c8e8','#c8ecff'],mt:'#6a9cc8',mt2:'#a0cce8',gr:'#4a78a0',gr2:'#8ab8dc',st:1,k:3},
{sky:['#05020f','#0e0624','#1c0a3c','#2c1058','#42187a','#5a2098'],mt:'#1a0c40',mt2:'#2a1260',gr:'#24104e',gr2:'#e03aff',st:1,k:4}];
const BGS=[],STAR=[];for(let i=0;i<18;i++)STAR.push([(i*97+13)%360,(i*41+7)%70]);
const wrI=Math.floor;
function mkBgW(w){const W=WORLDS[w],sky=document.createElement('canvas'),far=document.createElement('canvas'),nr=document.createElement('canvas');sky.width=376;sky.height=166;far.width=360;far.height=100;nr.width=360;nr.height=40;
const s=sky.getContext('2d'),f=far.getContext('2d'),n=nr.getContext('2d');
for(let i=0;i<6;i++){s.fillStyle=W.sky[i];s.fillRect(0,i*28,376,28);if(i){s.fillStyle=W.sky[i-1];for(let x=0;x<376;x+=4)for(let y=0;y<4;y+=2)s.fillRect(x+((y>>1)%2)*2,i*28+y,2,2)}}
const prof=(x,a,b,c,tri)=>{const u=x/360*6.2832;let v=a*Math.sin(u*2+1)+b*Math.sin(u*5+2)+c*Math.sin(u*9+.5);return tri?Math.abs(v)*1.3:v};
[[W.mt,56,14,10,6],[W.mt2,36,9,7,4]].forEach((L,li)=>{f.fillStyle=L[0];for(let x=0;x<360;x+=4){const h=(Math.round(L[1]+prof(x+li*70,L[2],L[3],L[4],W.k==3))>>2)<<2;f.fillRect(x,100-h,4,h)}});
if(W.k==2){f.fillStyle='#ff6a1a';for(let x=0;x<360;x+=4){const h=Math.round(56+prof(x,14,10,6,0))>>2<<2;if(x%24==0){f.fillRect(x,100-h,4,4);f.fillRect(x+4,100-h+4,4,4)}}}
if(W.k==1){f.fillStyle='#0a2a34';for(let x=0;x<360;x+=12){const l=8+(x*7%5)*6;f.fillRect(x,0,8,l);f.fillRect(x+2,l,4,6)}f.fillStyle='#7ff3ff';for(let i=0;i<9;i++)f.fillRect((i*47+10)%352,70+(i*13)%24,4,6)}
if(W.k==4){f.fillStyle='#8a4cff';f.beginPath();f.arc(80,30,14,0,6.2832);f.fill();f.fillStyle='#c9a6ff';f.fillRect(72,22,6,4);f.fillStyle='#ff5aa8';f.beginPath();f.arc(270,22,8,0,6.2832);f.fill();f.fillStyle='#7ff3ff';[[160,14],[200,40],[320,50]].forEach(q=>{f.fillRect(q[0],q[1],4,12);f.fillRect(q[0]-4,q[1]+4,12,4)})}
n.fillStyle=W.gr;n.fillRect(0,0,360,40);n.fillStyle=W.gr2;n.fillRect(0,0,360,2);n.fillStyle='rgba(0,0,0,.25)';n.fillRect(0,2,360,3);
for(let i=0;i<15;i++){n.fillStyle=W.gr2;n.globalAlpha=.55;n.fillRect(i*24,12+(i*7%3)*8,12,2);n.fillRect(i*24+6,26+(i*5%3)*4,8,2);n.globalAlpha=1}
if(W.k==2){n.fillStyle='#ff9a2a';for(let i=0;i<7;i++){n.fillRect(i*52+10,8+(i%3)*8,20,2);n.fillRect(i*52+26,10+(i%3)*8,2,8)}}
if(W.k==4){n.fillStyle='#e03aff';n.globalAlpha=.5;for(let x=0;x<360;x+=24)n.fillRect(x,4,1,36);for(let y=8;y<40;y+=10)n.fillRect(0,y,360,1);n.globalAlpha=1}
if(W.k==0){n.fillStyle='#58b868';for(let i=0;i<20;i++){n.fillRect(i*18+3,3,2,4);n.fillRect(i*18+5,1,2,6)}}
return BGS[w]={sky,far,nr,W}}
function bgWorld(){return wrI((G.stage-1)/5)%5}
function drawBgB(t){const w=bgWorld(),B0=BGS[w]||mkBgW(w),W=B0.W;bc.drawImage(B0.sky,-8,-8);
if(W.st){bc.fillStyle='#fff';for(let i=0;i<STAR.length;i++){bc.globalAlpha=.35+.4*Math.sin(t*1.6+i*1.7);bc.fillRect(STAR[i][0],STAR[i][1],2,2)}bc.globalAlpha=1}
const o1=-((t*3)%360),o2=-((t*8)%360);bc.drawImage(B0.far,o1-360,20);bc.drawImage(B0.far,o1,20);bc.drawImage(B0.far,o1+360,20);
bc.drawImage(B0.nr,o2-360,118);bc.drawImage(B0.nr,o2,118);bc.drawImage(B0.nr,o2+360,118)}
/* ---- 状態 ---- */
const MC={jp:['#ffd400','#fff3a0'],rush:['#ff2d7a','#ff9a3d'],fv:['#22e0ff','#d8f8ff'],aw:['#b57bff','#ffe14d'],boss:['#ff2030','#7a0a20'],n:['#4a3aa8','#7a6ad8']};
const modeB=()=>G.jp>0?'jp':G.rush>0?'rush':G.fv>0?'fv':G.aw>0?'aw':isBoss()?'boss':'n';
const VGC={},VGS={boss:'rgba(130,0,24,.8)',rush:'rgba(255,40,10,.6)',fv:'rgba(0,150,255,.55)',aw:'rgba(150,60,255,.5)',jp:'rgba(255,200,0,.5)',rc:'rgba(255,0,40,.7)'};
function vigB(k){if(VGC[k])return VGC[k];const c=document.createElement('canvas');c.width=360;c.height=150;const x=c.getContext('2d'),g=x.createRadialGradient(180,75,50,180,75,230);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,VGS[k]);x.fillStyle=g;x.fillRect(0,0,360,150);return VGC[k]=c}
/* ワールド空間(スプライトの背後): 粒子・光条など */
function modeBack(t){const m=modeB();
if(G.jp>0){bc.fillStyle='#ffd400';bc.globalAlpha=.13;const a0=t*.35;for(let i=0;i<14;i++){const a=a0+i*.4488;bc.beginPath();bc.moveTo(262,80);bc.lineTo(262+Math.cos(a)*380,80+Math.sin(a)*380);bc.lineTo(262+Math.cos(a+.2244)*380,80+Math.sin(a+.2244)*380);bc.fill()}bc.globalAlpha=1}
if(G.rush>0){for(let i=0;i<22;i++){const sp=26+(i%5)*9,x=(i*53)%360+Math.sin(t*2+i)*6,y=156-((t*sp+i*37)%170);bc.fillStyle=i%3?'#ff8a1f':'#ffe14d';bc.fillRect(Math.round(x),Math.round(y),i%4?2:4,i%4?2:4)}lines('#ff7a3a',t,7)}
if(G.fv>0){bc.fillStyle='rgba(120,230,255,.07)';for(let i=0;i<5;i++){const x=((t*40+i*90)%450)-60;bc.beginPath();bc.moveTo(x,0);bc.lineTo(x+36,0);bc.lineTo(x-24,150);bc.lineTo(x-60,150);bc.fill()}
const sd=wrI(t*8);bc.strokeStyle='#bff';bc.lineWidth=2;bc.beginPath();for(let x=0;x<=360;x+=24){const y=3+Math.abs(Math.sin((x+sd*37)*12.9898)*43758.5453%1)*8;x?bc.lineTo(x,y):bc.moveTo(x,y)}bc.stroke()}
if(G.aw>0||m=='aw'){for(let i=0;i<16;i++){const x=(i*61)%360+Math.sin(t*1.5+i)*8,y=150-((t*(14+i%4*6)+i*29)%160);bc.fillStyle=i%2?'#ffe14d':'#d8b8ff';bc.fillRect(Math.round(x),Math.round(y),2,2)}}
if(isBoss()){bc.globalAlpha=.35+.25*Math.sin(t*2);bc.fillStyle='#ff2030';[[20,4],[80,3],[150,5],[230,3],[300,4]].forEach(q=>{bc.fillRect(q[0],120,q[1],2);bc.fillRect(q[0]+q[1],123,q[1],2);bc.fillRect(q[0]+q[1]*2,127,q[1]+2,2)});bc.globalAlpha=1;
bc.fillStyle='rgba(30,10,20,.7)';for(let i=0;i<10;i++){bc.fillRect(Math.round((i*37+t*6)%360),Math.round((t*20+i*23)%130),2,2)}}}
/* 画面空間(最前面): ビネット / 枠 / 状態チップ */
function modeFront(t){const m=modeB();if(isBoss()){bc.globalAlpha=.65+.2*Math.sin(t*2);bc.drawImage(vigB('boss'),0,0);bc.globalAlpha=1}
if(m!='boss'&&m!='n'){bc.globalAlpha=.55+.25*Math.sin(t*(m=='rush'?3.2:m=='jp'?2.6:2));bc.drawImage(vigB(m),0,0);bc.globalAlpha=1}
if(sp&&sp.type&&sp.t>1.9){const k=sp.type==2?'rc':'fv';bc.globalAlpha=(sp.type==2?.5:.3)+.15*Math.sin(t*7);bc.drawImage(vigB(k),0,0);bc.globalAlpha=1;if(sp.type==2)lines('#ff3050',t,8)}
const c=MC[m],off=(t*36)%24;bc.fillStyle=c[0];const th=m=='n'?2:4;bc.fillRect(0,0,360,th);bc.fillRect(0,150-th,360,th);bc.fillRect(0,0,th,150);bc.fillRect(360-th,0,th,150);
if(m!='n'){bc.fillStyle=c[1];for(let i=-1;i<16;i++){const x=i*24+off;bc.fillRect(x,0,10,th);bc.fillRect(360-x-10,150-th,10,th)}for(let i=-1;i<7;i++){const y=i*24+off;bc.fillRect(0,y,th,10);bc.fillRect(360-th,150-y-10,th,10)}}
const L=[];if(G.jp>0)L.push(['JACKPOT','#ffd400']);if(G.rush>0)L.push(['RUSH','#ff2d7a']);if(G.fv>0)L.push(['FEVER','#22e0ff']);if(G.aw>0)L.push(['AWAKE','#b57bff']);if(isBoss())L.push(['BOSS','#ff2030']);
let x=7;for(const q of L){const w=pxW(q[0],1)+8;bc.fillStyle='#000';bc.fillRect(x,136,w,12);bc.fillStyle=q[1];bc.fillRect(x+1,137,w-2,10);bc.fillStyle='#000';bc.fillRect(x+2,138,w-4,8);pxText(bc,q[0],x+4,139,1,'#fff',q[1],'l');x+=w+3}}
