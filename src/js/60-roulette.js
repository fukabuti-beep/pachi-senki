/* ---------- roulette ---------- */
const WS=[2,3,2,5,2,3,10,2,3,5,2,50],WC=['#2a6df4','#e23b6e','#2a6df4','#17a673','#2a6df4','#e23b6e','#ff8a00','#2a6df4','#e23b6e','#17a673','#2a6df4','#ffd400'],wc=$('w').getContext('2d'),SG=TAU/12;let RL=null;
function drawW(a,kick){const c=wc,cx=120,cy=128,sp=RL&&RL.ph==0,win=RL&&RL.ph==1;c.clearRect(0,0,240,240);
// 外枠(金属リング) + LED電球
c.beginPath();c.arc(cx,cy,112,0,TAU);c.fillStyle='#000';c.fill();
const g=c.createLinearGradient(0,cy-112,0,cy+112);g.addColorStop(0,'#fff6b0');g.addColorStop(.5,'#c89a10');g.addColorStop(1,'#5a3f00');
c.beginPath();c.arc(cx,cy,109,0,TAU);c.fillStyle=g;c.fill();c.beginPath();c.arc(cx,cy,97,0,TAU);c.fillStyle='#000';c.fill();
for(let i=0;i<24;i++){const an=i/24*TAU-1.5708,on=(win&&((T*10)|0)%2==0)||((i+Math.floor(T*(sp?18:6)))%3==0);c.beginPath();c.arc(cx+Math.cos(an)*103,cy+Math.sin(an)*103,3.2,0,TAU);c.fillStyle=on?(i%2?'#fff':'#ff2d7a'):'#4a2a00';c.fill()}
// 盤(回転)
c.save();c.translate(cx,cy);c.rotate(a);
WS.forEach((m,i)=>{const a0=i*SG,a1=(i+1)*SG;
 c.beginPath();c.moveTo(0,0);c.arc(0,0,94,a0,a1);c.closePath();c.fillStyle=WC[i];c.fill();
 c.beginPath();c.arc(0,0,94,a0,a1);c.arc(0,0,80,a1,a0,true);c.closePath();c.fillStyle='rgba(255,255,255,.2)';c.fill();
 if(win&&RL.k==i&&((T*12)|0)%2==0){c.beginPath();c.moveTo(0,0);c.arc(0,0,94,a0,a1);c.closePath();c.fillStyle='rgba(255,255,255,.8)';c.fill()}
 c.save();c.rotate((i+.5)*SG);c.textAlign='right';c.lineJoin='round';c.font=(m>=10?'22px ':'17px ')+FN;c.lineWidth=4;c.strokeStyle='#000';c.fillStyle=m==50?'#fff36a':'#fff';const s='x'+m;c.strokeText(s,88,7);c.fillText(s,88,7);c.restore();
 c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a0)*94,Math.sin(a0)*94);c.strokeStyle='#ffe56a';c.lineWidth=2;c.stroke()});
c.restore();
// 中央ハブ
c.beginPath();c.arc(cx,cy,26,0,TAU);c.fillStyle='#000';c.fill();const hg=c.createRadialGradient(cx-6,cy-6,2,cx,cy,23);hg.addColorStop(0,'#fff6b0');hg.addColorStop(1,'#b88a00');c.beginPath();c.arc(cx,cy,23,0,TAU);c.fillStyle=hg;c.fill();
c.fillStyle='#ff2d7a';c.beginPath();c.arc(cx,cy,9,0,TAU);c.fill();c.fillStyle='#fff';c.fillRect(cx-5,cy-6,3,3);
// 針(キックで跳ねる)
c.save();c.translate(cx,16);c.rotate(kick);c.beginPath();c.moveTo(-13,-12);c.lineTo(13,-12);c.lineTo(13,0);c.lineTo(0,30);c.lineTo(-13,0);c.closePath();c.fillStyle='#ff2d7a';c.fill();c.lineWidth=3;c.strokeStyle='#000';c.stroke();c.fillStyle='#fff';c.fillRect(-7,-8,5,5);c.restore()}
function startRoul(base){$('rl').style.display='flex';$('rr').textContent='';const w=WS.map(m=>({2:30,3:22,5:14,10:6,50:1}[m]*(m>=5?luck():1)));let r=Math.random()*w.reduce((a,b)=>a+b),k=0;while(r>w[k]){r-=w[k];k++}
const tg=-1.5708-(k+.2+Math.random()*.6)*SG;RL={a1:((tg%TAU)+TAU)%TAU+TAU*6,t:0,k,m:WS[k],last:-1,base,kick:0,ph:0,a:0};showMsg('ROULETTE!!','#ffd400')}
function updRoul(dt){if(!RL)return;RL.t+=dt;RL.kick*=.85;
if(RL.ph==0){const p=Math.min(1,RL.t/4.6),e=1-Math.pow(1-p,4);RL.a=RL.a1*e;const idx=Math.floor((((-1.5708-RL.a)%TAU)+TAU)%TAU/SG);if(idx!=RL.last){RL.last=idx;RL.kick=.55;beep(300+(1-p)*500,.04,'square',.04)}
if(p>=1){RL.ph=1;RL.t=0;const m=RL.m;$('rr').textContent='x'+m+(m==50?' JACKPOT!!':m>=10?' BIG!!':'');hurt(RL.base*m,'#ffd400',1,m>=5);G.gold+=Math.floor(G.stage*40*m*mul());flash(m>=10?'#ffd400':'#fff');shake();burst(262,80,m>=10?80:30,'#ffd400');beep(m>=10?1600:1000,.5,'sawtooth',.07);if(m>=3&&m<50&&Math.random()<.4){const b0=RL.base,R0=RL;R0.hold=1;$('rr').textContent='DOUBLE UP?';pushPrompt(()=>{R0.hold=0;R0.t=0;if(Math.random()<.55){$('rr').textContent='DOUBLE!! x'+m*2;hurt(b0*m,'#ffd400',1,1);kyuin(6,'#ffd400');shake()}else $('rr').textContent='残念… x'+m},{small:1,txt:'押せ!',ms:2400})}kyuin(m>=10?8:4,m>=10?'#ffd400':'#4af');if(m>=10)G.rush=Math.min(15,G.rush+3)}}
else if(RL.t>1.8&&!RL.hold){$('rl').style.display='none';RL=null;G.roul=0;startSpin()}
if(RL)drawW(RL.a,RL.kick)}
