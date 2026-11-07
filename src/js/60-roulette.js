/* ---------- roulette ---------- */
const WS=[2,3,2,5,2,3,10,2,3,5,2,50],WC=['#2a6df4','#e23b6e','#2a6df4','#17a673','#2a6df4','#e23b6e','#ff8a00','#2a6df4','#e23b6e','#17a673','#2a6df4','#ffd400'],wc=$('w').getContext('2d'),SG=TAU/12;let RL=null;
function drawW(a,kick){const c=wc;c.clearRect(0,0,240,240);c.save();c.translate(120,128);c.rotate(a);
WS.forEach((m,i)=>{c.beginPath();c.moveTo(0,0);c.arc(0,0,104,i*SG,(i+1)*SG);c.fillStyle=WC[i];c.fill();c.strokeStyle='#000';c.lineWidth=3;c.stroke();c.save();c.rotate((i+.5)*SG);c.fillStyle=m==50?'#000':'#fff';c.font=(m>=10?20:16)+'px '+FN;c.textAlign='right';c.fillText('x'+m,94,6);c.restore()});c.restore();
c.beginPath();c.arc(120,128,16,0,TAU);c.fillStyle='#ffd400';c.fill();c.strokeStyle='#000';c.lineWidth=3;c.stroke();
c.save();c.translate(120,18);c.rotate(kick);c.beginPath();c.moveTo(-12,-10);c.lineTo(12,-10);c.lineTo(0,28);c.closePath();c.fillStyle='#ff2d7a';c.fill();c.stroke();c.restore()}
function startRoul(base){$('rl').style.display='flex';$('rr').textContent='';const w=WS.map(m=>({2:30,3:22,5:14,10:6,50:1}[m]*(m>=5?1+.2*(G.lv[5]-1):1)));let r=Math.random()*w.reduce((a,b)=>a+b),k=0;while(r>w[k]){r-=w[k];k++}
const tg=-1.5708-(k+.2+Math.random()*.6)*SG;RL={a1:((tg%TAU)+TAU)%TAU+TAU*6,t:0,k,m:WS[k],last:-1,base,kick:0,ph:0,a:0};showMsg('ROULETTE!!','#ffd400')}
function updRoul(dt){if(!RL)return;RL.t+=dt;RL.kick*=.85;
if(RL.ph==0){const p=Math.min(1,RL.t/4.6),e=1-Math.pow(1-p,4);RL.a=RL.a1*e;const idx=Math.floor((((-1.5708-RL.a)%TAU)+TAU)%TAU/SG);if(idx!=RL.last){RL.last=idx;RL.kick=.55;beep(300+(1-p)*500,.04,'square',.04)}
if(p>=1){RL.ph=1;RL.t=0;const m=RL.m;$('rr').textContent='x'+m+(m==50?' JACKPOT!!':m>=10?' BIG!!':'');hurt(RL.base*m,'#ffd400',1,m>=5);G.gold+=Math.floor(G.stage*40*m*mul());flash(m>=10?'#ffd400':'#fff');shake();burst(262,80,m>=10?80:30,'#ffd400');beep(m>=10?1600:1000,.5,'sawtooth',.07);if(m>=3&&m<50&&Math.random()<.4){const b0=RL.base;$('rr').textContent='DOUBLE UP?';setTimeout(()=>{if(Math.random()<.55){$('rr').textContent='DOUBLE!! x'+m*2;hurt(b0*m,'#ffd400',1,1);kyuin(6,'#ffd400');shake()}else $('rr').textContent='残念… x'+m},900)}kyuin(m>=10?8:4,m>=10?'#ffd400':'#4af');if(m>=10)G.rush=Math.min(15,G.rush+3)}}
else if(RL.t>1.8){$('rl').style.display='none';RL=null;G.roul=0;startSpin()}
if(RL)drawW(RL.a,RL.kick)}
