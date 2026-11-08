/* ---------- roulette ---------- */
const WS=[2,3,2,5,2,3,10,2,3,5,2,50],WC=['#2a6df4','#e23b6e','#2a6df4','#17a673','#2a6df4','#e23b6e','#ff8a00','#2a6df4','#e23b6e','#17a673','#2a6df4','#ffd400'],wc=$('w').getContext('2d'),SG=TAU/12;let RL=null;
/* 性能: 静的な部分(外枠リング/盤面/ハブ)は一度だけオフスクリーンに描いて、毎フレームは回転 drawImage のみ。見た目は従来と同じ。
   フォント読込完了(document.fonts.ready)でキャッシュを作り直す。 */
let WCH=null;
function wText(c,i){const m=WS[i];c.save();c.rotate((i+.5)*SG);c.textAlign='right';c.lineJoin='round';c.font=(m>=10?'22px ':'17px ')+FN;c.lineWidth=4;c.strokeStyle='#000';c.fillStyle=m==50?'#fff36a':'#fff';const s='x'+m;c.strokeText(s,88,7);c.fillText(s,88,7);c.restore()}
/* 軸: 盤/リング/LED/ハブはすべてキャンバス中央(120,120)を中心に描く(以前は cy=128 で枠内で下にずれて見えていた) */
const WCX=120,WCY=120;
function wBuild(){const mk=(w,h)=>{const e=document.createElement('canvas');e.width=w;e.height=h;return e},cx=WCX,cy=WCY;
// 外枠(金属リング)
const ring=mk(240,240),r=ring.getContext('2d');
r.beginPath();r.arc(cx,cy,112,0,TAU);r.fillStyle='#000';r.fill();
const g=r.createLinearGradient(0,cy-112,0,cy+112);g.addColorStop(0,'#fff6b0');g.addColorStop(.5,'#c89a10');g.addColorStop(1,'#5a3f00');
r.beginPath();r.arc(cx,cy,109,0,TAU);r.fillStyle=g;r.fill();r.beginPath();r.arc(cx,cy,97,0,TAU);r.fillStyle='#000';r.fill();
// 盤(2倍解像度で保持して回転描画)
const disc=mk(376,376),d=disc.getContext('2d');d.translate(188,188);d.scale(2,2);
WS.forEach((m,i)=>{const a0=i*SG,a1=(i+1)*SG;
 d.beginPath();d.moveTo(0,0);d.arc(0,0,94,a0,a1);d.closePath();d.fillStyle=WC[i];d.fill();
 d.beginPath();d.arc(0,0,94,a0,a1);d.arc(0,0,80,a1,a0,true);d.closePath();d.fillStyle='rgba(255,255,255,.2)';d.fill();
 wText(d,i);
 d.beginPath();d.moveTo(0,0);d.lineTo(Math.cos(a0)*94,Math.sin(a0)*94);d.strokeStyle='#ffe56a';d.lineWidth=2;d.stroke()});
// 中央ハブ
const hub=mk(60,60),h=hub.getContext('2d'),hx0=30,hy0=30;
h.beginPath();h.arc(hx0,hy0,26,0,TAU);h.fillStyle='#000';h.fill();const hg=h.createRadialGradient(hx0-6,hy0-6,2,hx0,hy0,23);hg.addColorStop(0,'#fff6b0');hg.addColorStop(1,'#b88a00');h.beginPath();h.arc(hx0,hy0,23,0,TAU);h.fillStyle=hg;h.fill();
h.fillStyle='#ff2d7a';h.beginPath();h.arc(hx0,hy0,9,0,TAU);h.fill();h.fillStyle='#fff';h.fillRect(hx0-5,hy0-6,3,3);
return WCH={ring,disc,hub}}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{WCH=null});
function drawW(a,kick){const c=wc,cx=WCX,cy=WCY,sp=RL&&RL.ph==0,win=RL&&RL.ph==1,W=WCH||wBuild();c.clearRect(0,0,240,240);
c.drawImage(W.ring,0,0);
// LED電球
for(let i=0;i<24;i++){const an=i/24*TAU-1.5708,on=(win&&((T*10)|0)%2==0)||((i+Math.floor(T*(sp?18:6)))%3==0);c.beginPath();c.arc(cx+Math.cos(an)*103,cy+Math.sin(an)*103,3.2,0,TAU);c.fillStyle=on?(i%2?'#fff':'#ff2d7a'):'#4a2a00';c.fill()}
// 盤(回転)
c.save();c.translate(cx,cy);c.rotate(a);c.drawImage(W.disc,-94,-94,188,188);
if(win&&((T*12)|0)%2==0){const i=RL.k,a0=i*SG,a1=(i+1)*SG;c.beginPath();c.moveTo(0,0);c.arc(0,0,94,a0,a1);c.closePath();c.fillStyle='rgba(255,255,255,.8)';c.fill();wText(c,i);c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a0)*94,Math.sin(a0)*94);c.strokeStyle='#ffe56a';c.lineWidth=2;c.stroke()}
c.restore();
c.drawImage(W.hub,cx-30,cy-30);
// 超倍率: 虹色の外周リング + 中央に巨大倍率
if(RL&&RL.sx){const h=Math.floor(T*240)%360;c.lineWidth=7;c.strokeStyle='hsl('+h+',100%,60%)';c.beginPath();c.arc(cx,cy,100,0,TAU);c.stroke();c.lineWidth=3;c.strokeStyle='hsl('+((h+180)%360)+',100%,70%)';c.beginPath();c.arc(cx,cy,92,0,TAU);c.stroke();
 const z=Math.max(1,2.6-(T-RL.sx)*6),s2='x'+RL.m2;c.save();c.translate(cx,cy+14);c.scale(z,z);c.textAlign='center';thickTxt(c,s2,0,0,RL.m2>=500?46:50,'hsl('+h+',100%,66%)',{lw:11,ex:'#1a0430'});c.restore()}
else if(RL&&RL.sq){const k=Math.floor(T*6)%2;c.textAlign='center';thickTxt(c,'!?',cx,cy+16,46,k?'#ffd400':'#ff2d7a')}
// 針(キックで跳ねる)
c.save();c.translate(cx,13);c.rotate(kick);c.beginPath();c.moveTo(-13,-12);c.lineTo(13,-12);c.lineTo(13,0);c.lineTo(0,30);c.lineTo(-13,0);c.closePath();c.fillStyle='#ff2d7a';c.fill();c.lineWidth=3;c.strokeStyle='#000';c.stroke();c.fillStyle='#fff';c.fillRect(-7,-8,5,5);c.restore()}
function startRoul(base){$('rl').style.display='flex';$('rr').textContent='';const w=WS.map(m=>({2:30,3:22,5:14,10:6,50:1}[m]*(m>=5?luck():1)));let r=Math.random()*w.reduce((a,b)=>a+b),k=0;while(r>w[k]){r-=w[k];k++}
const tg=-1.5708-(k+.2+Math.random()*.6)*SG;RL={a1:((tg%TAU)+TAU)%TAU+TAU*6,t:0,k,m:WS[k],last:-1,base,kick:0,ph:0,a:0};showMsg('ROULETTE!!','#ffd400')}
function updRoul(dt){if(!RL)return;RL.t+=dt;RL.kick*=.85;
if(RL.ph==0){const p=Math.min(1,RL.t/4.6),e=1-Math.pow(1-p,4);RL.a=RL.a1*e;const idx=Math.floor((((-1.5708-RL.a)%TAU)+TAU)%TAU/SG);if(idx!=RL.last){RL.last=idx;RL.kick=.55;beep(300+(1-p)*500,.04,'square',.04)}
if(p>=1){RL.ph=1;RL.t=0;const m=RL.m;$('rr').textContent='x'+m+(m==50?' JACKPOT!!':m>=10?' BIG!!':'');hurt(RL.base*m,'#ffd400',1,m>=5);G.gold+=Math.floor(G.stage*40*m*mul());flash(m>=10?'#ffd400':'#fff');shake();burst(262,80,m>=10?80:30,'#ffd400');beep(m>=10?1600:1000,.5,'sawtooth',.07);if(RL.sup){RL.hold=1;RL.st=0}kyuin(m>=10?8:4,m>=10?'#ffd400':'#4af');if(m>=10)G.rush=Math.min(15,G.rush+3)}}
else if(RL.hold&&RL.sup){RL.st+=dt;const st=RL.st;
 if(st>.8&&!RL.sq){RL.sq=1;$('rr').textContent='…!?';showMsg('!?','#ff2d7a');kyuin(4,'#ff2d7a');shake();RL.kick=.9}
 if(st>.8&&st<1.9&&!RL.sx)RL.kick=Math.max(RL.kick,.35*Math.sin(st*40));
 if(st>1.9&&!RL.sx){roulSuper()}
 if(st>4.4){RL.hold=0;RL.t=0}}
else if(RL.t>1.8&&!RL.hold){$('rl').style.display='none';RL=null;G.roul=0;startSpin()}
if(RL)drawW(RL.a,RL.kick)}
// 超倍率: 押せ!!で始まったルーレットだけが確率で抽選(RL.sup)。結果の倍率に追加で 超倍率ぶんのダメージ/ゴールド
const SUPM=[100,100,100,100,100,100,300,300,300,777];
function roulSuper(){const m2=SUPM[Math.floor(Math.random()*SUPM.length)];RL.m2=m2;RL.sx=T;RL.sq=0;
 $('rr').textContent='x'+m2+' 超倍率!!';showMsg('超倍率 x'+m2+'!!','#ffd400');banner('超倍率 x'+m2+'!!','#ffd400');
 hurt(RL.base*m2,'#ffd400',1,1);const g=Math.floor(G.stage*40*m2*mul()*BAL.supG);G.gold+=g;F.push({x:150,y:120,t:0,s:'+'+fmt(g),c:'#ffd400',b:1});
 flash('#ffd400');shake();burst(262,80,90,'#ffd400');kyuin(10,'#ffd400');try{seRoulResult(50);jara()}catch(e){}G.rush=Math.min(15,G.rush+3)}
