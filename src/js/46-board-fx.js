/* ---------- 盤面の動的演出: 状態別オーバーレイ / 電飾 / センター窓 / 保留ランプ / 釘のきらめき / 玉の軌跡 / 入賞口の発光 ----------
   onChucker/onAtk/onSide/bigHit は同一スコープのグローバル関数なので、ここでラップして発光イベントだけ拾う(本体は変更しない) */
const GLOW=document.createElement('canvas');GLOW.width=40;GLOW.height=40;(function(){const x=GLOW.getContext('2d'),g=x.createRadialGradient(20,20,0,20,20,20);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,40,40)})();
const BALL_=discSpr(4,['#8a93b8','#e9eef8','#fff','#aab2d0']),BALLG_=discSpr(4,['#b07800','#ffd400','#fff3a0','#e6a800']),BALLM_=discSpr(7,['#b07800','#ffd400','#fff3a0','#e6a800']);
const pegLit=new Float32Array(pegs.length).fill(-9),pk={s:-9,a:-9,l:-9,r:-9},PRG=[];let LAMP=null;
const PER=[];for(let i=0;i<36;i++)PER.push([i*10,0,6,4]);for(let y=8;y<390;y+=12)PER.push([356,y,4,7]);for(let i=35;i>=0;i--)PER.push([i*10,396,6,4]);for(let y=386;y>6;y-=12)PER.push([0,y,4,7]);
function pRing(x,y,c,r){if(PRG.length<10)PRG.push({x,y,c,r,t0:T})}
{const _c=onChucker;onChucker=function(){pk.s=T;try{pRing(180,371,'#ffe14d',40)}catch(e){}return _c.apply(this,arguments)}}
{const _a=onAtk;onAtk=function(){pk.a=T;try{pRing(180,391,'#ff9a3d',50)}catch(e){}return _a.apply(this,arguments)}}
{const _s=onSide;onSide=function(){const l=CB&&CB.x<180;if(l)pk.l=T;else pk.r=T;try{pRing(l?22:338,391,'#7ff3ff',34)}catch(e){}return _s.apply(this,arguments)}}
{const _b=bigHit;bigHit=function(jp){LAMP={t0:T,jp:jp?1:0};return _b.apply(this,arguments)}}
function modeP(){const q=sp&&sp.type&&sp.t>1.9?(sp.type==2?'rc':'rd'):0;return LAMP&&T-LAMP.t0<(LAMP.jp?6:3.6)?'jp':G.jp>0?'jp':G.rush>0?'rush':G.fv>0?'fv':q||(G.aw>0?'aw':'n')}
const PVG={},PVS={rush:'rgba(255,45,122,.55)',fv:'rgba(0,160,255,.5)',jp:'rgba(255,200,0,.5)',rc:'rgba(255,0,40,.6)',rd:'rgba(60,120,255,.4)',aw:'rgba(150,60,255,.4)'};
function vigP(k){if(PVG[k])return PVG[k];const c=document.createElement('canvas');c.width=PW;c.height=PH;const x=c.getContext('2d'),g=x.createRadialGradient(180,200,90,180,200,300);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,PVS[k]);x.fillStyle=g;x.fillRect(0,0,PW,PH);return PVG[k]=c}
/* 背面: 光条 / 走査 / ビネット */
function boardBack(t){const m=modeP();
if(m=='jp'){const a0=t*.3;pc.fillStyle=LAMP&&LAMP.jp||G.jp>0?'rgba(255,212,0,.15)':'rgba(255,45,122,.14)';for(let i=0;i<12;i++){const a=a0+i*.5236;pc.beginPath();pc.moveTo(180,260);pc.lineTo(180+Math.cos(a)*520,260+Math.sin(a)*520);pc.lineTo(180+Math.cos(a+.2618)*520,260+Math.sin(a+.2618)*520);pc.fill()}}
if(m=='rush'){for(let i=0;i<8;i++){pc.fillStyle='hsla('+((t*120+i*45)%360|0)+',100%,60%,.09)';const x=((t*90+i*60)%520)-80;pc.beginPath();pc.moveTo(x,0);pc.lineTo(x+30,0);pc.lineTo(x-90,PH);pc.lineTo(x-120,PH);pc.fill()}}
if(m=='fv'){pc.fillStyle='rgba(120,230,255,.10)';const y=(t*110)%520-60;pc.fillRect(0,y,PW,26);pc.fillStyle='rgba(120,230,255,.16)';pc.fillRect(0,y+10,PW,3)}
if(m!='n'){pc.globalAlpha=.6+.25*Math.sin(t*(m=='rush'?3.2:2.2));pc.drawImage(vigP(m=='jp'?'jp':m),0,0);pc.globalAlpha=1}}
/* センター窓の中身 */
function centerWin(t){const m=modeP(),sx=102,sy=228;
let ti=null,c1='#ffe14d',c2='#ff9a2a',sc=3;
if(G.jp>0||(LAMP&&LAMP.jp&&T-LAMP.t0<6)){ti='JACKPOT';const h=(Math.floor(t*4)%12)*30;c1='hsl('+h+',100%,66%)';c2='hsl('+h+',100%,46%)';sc=4}
else if(G.roul){ti='ROULETTE';c1='#fff';c2='#ffd400'}
else if(sp){const d=[0,1,2].map(i=>sp.t>=sp.stop[i]?sp.f[i]:Math.floor(sp.ph[i])%10);pxText(pc,d.join(' '),180,242,5,sp.type?'#ff8a8a':'#ffe14d',sp.type?'#ff2d3a':'#ff9a2a','c');
if(sp.type&&sp.t>1.9)pxText(pc,sp.type==2?'SUPER REACH':'REACH',180,278,2,Math.floor(t*3)%2?'#fff':'#ff6a7a','#ff2d3a','c');else pxText(pc,'SPIN',180,278,1,'#7a6ad8','#4a3aa8','c')}
else if(G.rush>0){ti='RUSH';c1='#ff9ab8';c2='#ff2d7a';sc=5}
else if(G.fv>0){ti='FEVER';c1='#d8f8ff';c2='#22e0ff';sc=5}
else{pc.fillStyle='#ffd400';pc.font='34px '+FN;pc.textAlign='center';pc.fillStyle='rgba(255,212,0,.9)';pc.strokeStyle='#000';pc.lineWidth=4;pc.strokeText('戦記',180,266);pc.fillText('戦記',180,266);
for(let i=0;i<5;i++){const a=t*.8+i*1.2566;pc.fillStyle=i%2?'#fff':'#7ff3ff';pc.fillRect(Math.round(180+Math.cos(a)*62),Math.round(250+Math.sin(a)*14),3,3)}}
if(ti){pxText(pc,ti,180,242+(sc>4?0:6),sc,c1,c2,'c');if(G.rush>0&&!sp&&!G.roul&&G.jp<=0){pxText(pc,'x'+G.combo,180,278,2,'#fff','#ffd400','c');pc.fillStyle='#000';pc.fillRect(110,270,40,4);pc.fillStyle='#ff2d7a';pc.fillRect(111,271,Math.round(38*Math.min(1,G.rush/15)),2)}}
/* 保留ランプ(ドット宝石) */
const GC=['#ffffff','#44aaff','#33dd66','#ff2244','#ffd400'];for(let i=0;i<4;i++){const q=QL[i],x=129+i*34-6,y=282;pc.fillStyle='#000';pc.fillRect(x-1,y-1,13,13);if(q){const c=GC[q.c];pc.fillStyle=c;pc.fillRect(x+3,y,6,12);pc.fillRect(x,y+3,12,6);pc.fillRect(x+1,y+1,10,10);pc.fillStyle='#fff';pc.fillRect(x+2,y+2,3,3);if(q.c>=3&&Math.floor(t*3+i)%2){pc.globalAlpha=.6;pc.drawImage(GLOW,x-14,y-14,40,40);pc.globalAlpha=1}}else{pc.fillStyle='#241a5c';pc.fillRect(x+3,y+1,6,10);pc.fillRect(x+1,y+3,10,6)}}}
/* 釘のきらめき(波) + 玉接触での点灯 */
function pegFx(t){for(let j=0;j<pegs.length;j++){const p=pegs[j];const a=t-pegLit[j];if(a<.28){const k=1-a/.28;if(p[4]){pc.drawImage(BUMPL_,Math.round(p[0]-10),Math.round(p[1]-10));pc.globalAlpha=k*.8;pc.drawImage(GLOW,Math.round(p[0]-30),Math.round(p[1]-30),60,60);pc.globalAlpha=1;pc.strokeStyle='#fff';pc.lineWidth=2;pc.globalAlpha=k;pc.beginPath();pc.arc(p[0],p[1],10+(1-k)*14,0,TAU);pc.stroke();pc.globalAlpha=1}else{pc.globalAlpha=k;pc.drawImage(GLOW,Math.round(p[0]-10),Math.round(p[1]-10),20,20);pc.globalAlpha=1;pc.fillStyle='#fff';pc.fillRect(Math.round(p[0])-1,Math.round(p[1])-1,3,3)}}
else{const ph=((p[0]+p[1]*.7)/110-t*.55)%1;if(ph<.03&&!p[4]){pc.fillStyle='#fff';pc.fillRect(Math.round(p[0])-2,Math.round(p[1])-3,2,2)}}}}
/* 入賞口の発光 */
function pocketFx(t){const m=modeP(),rush=G.rush>0;
const as=T-pk.s;pc.globalAlpha=as<.45?1-as/.45:0;if(as<.45){pc.drawImage(GLOW,140,350,80,50)}pc.globalAlpha=1;
const pulse=(.5+.5*Math.sin(t*5))*(sp?1:.4);pc.fillStyle='rgba(255,224,77,'+(.25+.35*pulse)+')';pc.fillRect(157,367,46,10);
if(sp){pc.fillStyle='#ffe14d';const k=Math.floor(t*10)%8;for(let i=0;i<8;i++)if((i+k)%3==0){const a=i/8,x=i<4?157+i*12:203-(i-4)*12;pc.fillRect(x,363,4,2);pc.fillRect(x,380,4,2)}}
[[22,pk.l,4,40],[338,pk.r,318,40]].forEach(o=>{const a=T-o[1];if(a<.45){pc.globalAlpha=1-a/.45;pc.drawImage(GLOW,o[0]-30,376,60,36);pc.globalAlpha=1}});
if(rush){const hu=(t*300)%360|0;pc.fillStyle='hsl('+hu+',100%,60%)';pc.fillRect(134,388,92,6);pc.fillStyle='rgba(255,255,255,.7)';pc.fillRect(134+((t*160)%92|0),388,8,6);
for(let i=0;i<3;i++){const y=368+((t*60+i*12)%30)|0;pc.fillStyle='#ffd400';pc.fillRect(170,y,20,2);pc.fillRect(174,y+2,12,2);pc.fillRect(178,y+4,4,2)}
const aa=T-pk.a;if(aa<.4){pc.globalAlpha=1-aa/.4;pc.drawImage(GLOW,120,370,120,50);pc.globalAlpha=1}}
else{pc.fillStyle='#4a4470';pc.fillRect(134,388,92,6);pc.fillStyle='#6a6a98';pc.fillRect(134,388,92,2)}
for(let i=PRG.length-1;i>=0;i--){const r=PRG[i],a=T-r.t0;if(a>.4){PRG.splice(i,1);continue}pc.globalAlpha=1-a/.4;pc.strokeStyle=r.c;pc.lineWidth=3;pc.beginPath();pc.ellipse(r.x,r.y,6+a/.4*r.r,3+a/.4*r.r*.4,0,0,TAU);pc.stroke();pc.globalAlpha=1}}
/* 玉: ドット球 + 軌跡(確変/黄金は金色の長い尾) */
function ballsFx(t){const rush=G.rush>0;for(let k=0;k<balls.length;k++){const b=balls[k],gold=b.g||rush,mega=b.g==2;
for(let j=0;j<pegs.length;j++){const p=pegs[j],R=p[2]+6,dx=b.x-p[0],dy=b.y-p[1];if(dx>R||dx<-R||dy>R||dy<-R)continue;if(dx*dx+dy*dy<R*R)pegLit[j]=t}
let h=b.h;if(!h)h=b.h=[];const l=h.length;if(!l||Math.abs(h[l-1][0]-b.x)+Math.abs(h[l-1][1]-b.y)>1.5){h.push([b.x,b.y]);if(h.length>(gold?9:4))h.shift()}
for(let i=0;i<h.length-1;i++){const q=(i+1)/h.length,s=Math.round((mega?9:5)*q);pc.globalAlpha=q*.55;pc.fillStyle=gold?(i%2?'#ffd400':'#ff9a2a'):'#aab4ff';pc.fillRect(Math.round(h[i][0]-s/2),Math.round(h[i][1]-s/2),s,s)}pc.globalAlpha=1;
if(gold){pc.globalAlpha=mega?.7:.45;const s=mega?36:20;pc.drawImage(GLOW,Math.round(b.x-s/2),Math.round(b.y-s/2),s,s);pc.globalAlpha=1}
const sp2=mega?BALLM_:gold?BALLG_:BALL_;pc.drawImage(sp2,Math.round(b.x-sp2.width/2),Math.round(b.y-sp2.height/2));
if(mega){for(let i=0;i<4;i++){const a=t*6+i*1.57;pc.fillStyle='#fff';pc.fillRect(Math.round(b.x+Math.cos(a)*11)-1,Math.round(b.y+Math.sin(a)*11)-1,3,3)}}}}
/* 前面: 電飾(状態で色/速さが変わる) / 当たりランプ演出(紙吹雪) / 枠 */
function boardFront(t){const m=modeP(),big=LAMP&&T-LAMP.t0<(LAMP.jp?6:3.6),spd={n:4,rc:10,rd:7,rush:11,fv:10,jp:12,aw:7}[m]||4,ph=Math.floor(t*spd),pal={n:['#6a5aff','#9a8aff'],rc:['#ff3a2a','#ffb03a'],rd:['#4a8aff','#9ad0ff'],rush:['#ff2d7a','#ffd400'],fv:['#22e0ff','#fff'],aw:['#b57bff','#ffe14d']}[m];
for(let i=0;i<PER.length;i++){const q=PER[i],on=m=='jp'||big?true:(i+ph)%4<2;pc.fillStyle=on?(m=='jp'||big?'hsl('+((i*8+t*150)%360|0)+',100%,60%)':pal[(i>>1)%2]):'#2a2060';pc.fillRect(q[0],q[1],q[2],q[3])}
if(big){const a=T-LAMP.t0;for(let i=0;i<34;i++){const x=(i*47)%360+Math.sin(t*3+i)*10,y=((a*(70+i%5*25)+i*31)%440)-20;pc.fillStyle=['#ff2d7a','#ffd400','#22e0ff','#3dff7a','#fff'][i%5];pc.fillRect(Math.round(x),Math.round(y),i%3?4:6,i%3?4:3)}
if(a<2.4){const k=Math.min(1,a/.3);pxText(pc,LAMP.jp?'JACKPOT!!':'BIG BONUS',180,166-(1-k)*30,LAMP.jp?5:4,'#fff3a0','#ff9a2a','c')}}
if(m!='n'&&m!='aw'){const c=m=='jp'?'#ffd400':pal[0],th=3;pc.fillStyle=c;pc.fillRect(0,0,th,PH);pc.fillRect(PW-th,0,th,PH)}}
