/* ---------- pachinko: board layout + ball physics + hit handlers ---------- */
const pegs=[],bump=[[90,140],[270,140],[180,205]];
for(let r=0;r<10;r++){const y=40+r*29,o=r%2?15:0;for(let x=15+o;x<350;x+=30){if(!bump.some(b=>Math.hypot(b[0]-x,b[1]-y)<24))pegs.push([x,y,3.5,.55,0])}}
for(let i=0;i<10;i++){pegs.push([20+i*14,312+i*5,3.5,.45,0]);pegs.push([340-i*14,312+i*5,3.5,.45,0])}
bump.forEach(b=>pegs.push([b[0],b[1],9,1.15,1]));
const balls=[],bk=(x,y,vx,vy,g)=>({x,y,vx,vy,g});
function pkHit(s){cmb++;cmbT=1.6;if(cmb==30)awaken();if([10,25,50,100].includes(cmb)){banner(cmb+' COMBO!','#ffd400');kyuin(4,'#ffd400')}if(CB&&CB.g==2){CB.g=0;golden()}G.sp=Math.min(100,G.sp+s*(1+.15*(G.lv[6]-1)));beep(500+Math.min(cmb,24)*45,.06,'triangle',.035)}
function onSide(){pkHit(3);hurt(atk()*1.5*cm(),'#8ff')}
function onChucker(){if(AC)tone(1800,AC.currentTime,.06,'sawtooth',.03,2600);pkHit(6);if(G.q<4){G.q++;const h=Math.random()<(G.rush>0?.25:hitP());QL.push({h,c:ykLv(h)})}startSpin()}
function onAtk(){jara();pkHit(2);hurt(atk()*3*(1+G.combo*.2)*cm(),'#ffd400');G.gold+=Math.ceil(G.stage*mul())}
function stepBalls(dt){const h=dt*60/2;for(let k=balls.length-1;k>=0;k--){const b=balls[k];CB=b;let gone=0;
for(let s=0;s<2&&!gone;s++){b.vy=Math.min(6,b.vy+.09*h);b.x+=b.vx*h;b.y+=b.vy*h;
if(b.x<5){b.x=5;b.vx=Math.abs(b.vx)*.6}if(b.x>355){b.x=355;b.vx=-Math.abs(b.vx)*.6}
for(const p of pegs){const dx=b.x-p[0],dy=b.y-p[1],R=4+p[2];if(Math.abs(dx)>R||Math.abs(dy)>R)continue;const d2=dx*dx+dy*dy;if(d2<R*R){const d=Math.sqrt(d2)||.01,nx=dx/d,ny=dy/d;b.x=p[0]+nx*R;b.y=p[1]+ny*R;const dot=b.vx*nx+b.vy*ny;if(dot<0){b.vx-=(1+p[3])*dot*nx;b.vy-=(1+p[3])*dot*ny;b.vx+=(Math.random()-.5)*.5;const s2=Math.hypot(b.vx,b.vy);if(s2>5){b.vx*=5/s2;b.vy*=5/s2}}}}
if(b.y>364&&b.y<378&&Math.abs(b.x-180)<22){gone=1;onChucker()}
else if(b.y>385&&b.y<397){if(G.rush>0&&Math.abs(b.x-180)<46){gone=1;onAtk()}else if(Math.abs(b.x-22)<16||Math.abs(b.x-338)<16){gone=1;onSide()}}
if(b.y>PH){gone=1;G.pool+=G.stage*mul()*.6}}
if(gone)balls.splice(k,1)}}
P.addEventListener('pointerdown',e=>{if(!run||balls.length>90)return;const r=P.getBoundingClientRect();balls.push(bk((e.clientX-r.left)/r.width*PW,12,0,0,1))});
