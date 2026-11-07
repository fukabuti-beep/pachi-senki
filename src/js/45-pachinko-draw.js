/* ---------- pachinko: board rendering (bg cache, drawP) ---------- */
const bg=document.createElement('canvas');bg.width=PW;bg.height=PH;
function buildBg(){const c=bg.getContext('2d');const g=c.createLinearGradient(0,0,0,PH);g.addColorStop(0,'#130a3a');g.addColorStop(1,'#2a0d4a');c.fillStyle=g;c.fillRect(0,0,PW,PH);
c.strokeStyle='#241a5c';c.lineWidth=1;for(let i=0;i<PW;i+=24){c.beginPath();c.moveTo(i,0);c.lineTo(i,PH);c.stroke()}
c.fillStyle='rgba(255,255,255,.05)';c.font='110px '+FN;c.textAlign='center';c.fillText('戦記',180,265);
pegs.forEach(p=>{c.beginPath();c.arc(p[0],p[1],p[2],0,TAU);if(p[4]){c.fillStyle='#ff2d7a';c.shadowColor='#ff2d7a';c.shadowBlur=14}else{c.fillStyle='#d8e4ff';c.shadowBlur=3;c.shadowColor='#8cf'}c.fill()});c.shadowBlur=0;
c.fillStyle='#22e0ff';c.fillRect(8,392,28,4);c.fillRect(324,392,28,4);c.fillStyle='#ffd400';c.fillRect(158,372,44,5)}
buildBg();if(document.fonts)document.fonts.ready.then(buildBg);
function drawP(t){pc.drawImage(bg,0,0);
if(G.rush>0){pc.fillStyle=`rgba(255,45,122,${.1+.07*Math.sin(t*10)})`;pc.fillRect(0,0,PW,PH);for(let i=0;i<8;i++){pc.fillStyle=`hsla(${(t*200+i*45)%360},100%,60%,.10)`;const x=((t*120+i*60)%520)-80;pc.beginPath();pc.moveTo(x,0);pc.lineTo(x+30,0);pc.lineTo(x-90,PH);pc.lineTo(x-120,PH);pc.fill()}}
const op=G.rush>0;pc.fillStyle=op?`hsl(${t*400%360},100%,60%)`:'#4a4470';pc.fillRect(134,386,92,6);
pc.textAlign='center';if(op){pc.fillStyle='#ffd400';pc.font='12px '+FN;pc.fillText('ATTACKER OPEN',180,381)}
pc.fillStyle='#ffd400';pc.font='11px '+FN;pc.fillText('START',180,364);
balls.forEach(b=>{if(b.tx===undefined){b.tx=b.x;b.ty=b.y}if(G.rush>0){pc.strokeStyle='rgba(255,212,0,.55)';pc.lineWidth=5;pc.beginPath();pc.moveTo(b.tx,b.ty);pc.lineTo(b.x,b.y);pc.stroke()}b.tx+=(b.x-b.tx)*.3;b.ty+=(b.y-b.ty)*.3;pc.beginPath();pc.arc(b.x,b.y,b.g==2?7:4,0,TAU);pc.fillStyle=b.g||G.rush>0?'#ffd400':'#e9eef8';pc.shadowColor=b.g||G.rush>0?'#ffd400':'#fff';pc.shadowBlur=6;pc.fill()});pc.shadowBlur=0;for(let i=0;i<36;i++){const on=(i+Math.floor(t*(G.rush>0?20:6)))%3==0;pc.fillStyle=on?`hsl(${i*10+t*200},100%,60%)`:'#2a2060';pc.fillRect(i*10,0,6,4);pc.fillRect(i*10,PH-4,6,4)}}
