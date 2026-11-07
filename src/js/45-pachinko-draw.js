/* ---------- pachinko: board rendering (bg cache, drawP) ----------
   静的な盤(釘/役物枠/入賞口)は bg にキャッシュ。動的要素(玉/ランプ/窓/発光)は 46-board-fx.js */
const bg=document.createElement('canvas');bg.width=PW;bg.height=PH;
/* ドット円スプライト: cols=[縁,基本,ハイライト,影] */
function discSpr(r,cols){const d=Math.ceil(r)*2+2,c=document.createElement('canvas');c.width=d;c.height=d;const x=c.getContext('2d'),m=d/2;for(let j=0;j<d;j++)for(let i=0;i<d;i++){const dx=i+.5-m,dy=j+.5-m,q=Math.sqrt(dx*dx+dy*dy);if(q>r+.4)continue;x.fillStyle=q>r-1.1?cols[0]:dx+dy<-r*.55&&q<r*.8?cols[2]:dx+dy>r*.7?cols[3]:cols[1];x.fillRect(i,j,1,1)}return c}
const PEGS_=discSpr(3.5,['#6670b8','#c8d4ff','#fff','#8a94d0']),BUMP_=discSpr(9,['#7a0a3a','#ff2d7a','#ffd0e0','#c01058']),BUMPL_=discSpr(9,['#ff9a3d','#ffe14d','#fff','#ffb030']);
function buildBg(){const c=bg.getContext('2d');c.imageSmoothingEnabled=false;
const BC=['#0e0830','#130a3a','#180c42','#1e0e4a','#240f50','#2a0d4a'];for(let i=0;i<6;i++){c.fillStyle=BC[i];c.fillRect(0,i*67,PW,67);if(i){c.fillStyle=BC[i-1];for(let x=0;x<PW;x+=4)for(let y=0;y<4;y+=2)c.fillRect(x+((y>>1)%2)*2,i*67+y,2,2)}}
c.fillStyle='rgba(120,100,255,.10)';for(let y=12;y<PH;y+=24)for(let x=12+((y/24)%2)*12;x<PW;x+=24){c.fillRect(x,y,2,2);c.fillRect(x-2,y,6,0)}
c.fillStyle='rgba(255,255,255,.035)';c.fillRect(326,0,24,PH);
/* 側レール */
[[0,1],[356,-1]].forEach(a=>{c.fillStyle='#2a2a58';c.fillRect(a[0],0,4,PH);c.fillStyle='#7a80b8';c.fillRect(a[0]+(a[1]>0?0:2),0,2,PH);c.fillStyle='#b8c0f0';for(let y=6;y<PH;y+=40)c.fillRect(a[0]+(a[1]>0?0:1),y,2,3)});
/* センター窓(役物): 外枠→金縁→紫→画面。内容は動的 */
c.fillStyle='#000';c.fillRect(94,220,172,82);c.fillStyle='#ffd400';c.fillRect(96,222,168,78);c.fillStyle='#b88a00';c.fillRect(96,222,168,2);c.fillRect(96,298,168,2);c.fillStyle='#3a1a8a';c.fillRect(99,225,162,72);c.fillStyle='#000';c.fillRect(101,227,158,68);c.fillStyle='#07041c';c.fillRect(102,228,156,66);
c.fillStyle='#ffd400';[[94,220],[258,220],[94,294],[258,294]].forEach(q=>c.fillRect(q[0],q[1],8,8));c.fillStyle='#fff';[[96,222],[260,222],[96,296],[260,296]].forEach(q=>c.fillRect(q[0],q[1],3,3));
c.fillStyle='rgba(255,255,255,.04)';for(let y=228;y<294;y+=3)c.fillRect(102,y,156,1);
/* 釘/バンパー */
pegs.forEach(p=>{const s=p[4]?BUMP_:PEGS_;c.drawImage(s,Math.round(p[0]-s.width/2),Math.round(p[1]-s.height/2))});
c.fillStyle='#fff';[[90,140],[270,140],[180,205]].forEach(b=>{c.fillRect(b[0]-1,b[1]-1,3,3);c.fillRect(b[0]-5,b[1],2,1);c.fillRect(b[0]+4,b[1],2,1)});
/* 入賞口の筐体: START / ATTACKER / サイド */
const hs=(x,y,w,h,e,i)=>{c.fillStyle='#000';c.fillRect(x-2,y-2,w+4,h+4);c.fillStyle=e;c.fillRect(x,y,w,h);c.fillStyle=i;c.fillRect(x+2,y+2,w-4,h-4)};
hs(154,364,52,16,'#ffd400','#120a34');hs(130,384,100,14,'#6a6a98','#120a34');hs(4,384,38,14,'#22e0ff','#07202a');hs(318,384,38,14,'#22e0ff','#07202a');
c.fillStyle='#ffd400';c.fillRect(158,361,44,2);c.fillStyle='#fff';c.fillRect(158,361,6,2);c.fillRect(196,361,6,2);
if(typeof PXRDY!=='undefined'&&PXRDY){pxText(c,'START',180,368,1,'#ffe14d','#ff9a2a','c');pxText(c,'PACHI SENKI',180,10,2,'#e8ecff','#8a94d0','c');pxText(c,'SIDE',23,387,1,'#7ff3ff','#2aa0d0','c');pxText(c,'SIDE',337,387,1,'#7ff3ff','#2aa0d0','c')}}
buildBg();if(document.fonts)document.fonts.ready.then(buildBg);
function drawP(t){pc.imageSmoothingEnabled=false;pc.drawImage(bg,0,0);boardBack(t);centerWin(t);pegFx(t);pocketFx(t);ballsFx(t);boardFront(t)}
