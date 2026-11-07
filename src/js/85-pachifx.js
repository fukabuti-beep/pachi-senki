/* ---------- pachi fx / minigame ---------- */
function ykLv(h){const w=h?[.15,.25,.3,.2,.1]:[.55,.25,.13,.06,.01];let r=Math.random(),i=0;while(i<4&&r>w[i]){r-=w[i];i++}return i}
let RS=null,MG=null;const mqc=$('mq').getContext('2d'),mgc=$('mc').getContext('2d');
function res(t,c,h){RS={t0:T,t,c,h}}
function drawRes(t){if(!RS)return;const p=t-RS.t0;if(p>1.1){RS=null;return}const s=p<.15?3-p/.15*2:1,y=RS.h?78:78+Math.max(0,p-.3)*40;bc.save();bc.translate(180,y);bc.scale(s,s);bc.globalAlpha=Math.min(1,(1.1-p)*3);bc.font='40px '+FN;bc.textAlign='center';bc.strokeStyle='#000';bc.lineWidth=8;bc.strokeText(RS.t,0,0);bc.fillStyle='rgba(0,0,0,.55)';bc.fillText(RS.t,2,3);bc.fillStyle=RS.c;bc.fillText(RS.t,0,0);if(RS.h){bc.globalCompositeOperation='lighter';bc.globalAlpha*=.35;bc.fillStyle='#fff';bc.fillText(RS.t,0,-2)}bc.restore();if(!RS.h){bc.fillStyle='rgba(60,60,90,'+Math.max(0,.3-p*.3)+')';bc.fillRect(0,0,360,150)}}
const MQP={n:['CR パチ戦記','#fff','#ffd400'],rush:['★ 確変中 ★','#fff','#ff2d7a'],fv:['FEVER TIME','#fff','#22e0ff'],aw:['覚醒 AWAKE','#fff','#b57bff'],boss:['BOSS BATTLE','#fff','#ff2030'],jp:['JACKPOT!!','#fff','#ffd400']};
let mqK='';
function drawMq(t){const m=modeB(),q=MQP[m]||MQP.n,rb=m=='n'||m=='jp';{const k=m+'|'+Math.floor(t*(m=='n'?8:m=='boss'?6:12))+(rb?'|'+Math.floor(t*100/4):'');if(k===mqK)return;mqK=k}mqc.fillStyle='#120a34';mqc.fillRect(0,0,120,14);const sp=m=='n'?8:m=='boss'?6:12,ph=Math.floor(t*sp);for(let i=0;i<30;i++){const on=(i+ph)%4<2;mqc.fillStyle=on?(rb?`hsl(${(i*12+t*100)%360},100%,60%)`:MC[m][i%2]):'#3a2a70';mqc.fillRect(i*4+1,0,2,2);mqc.fillRect(i*4+1,12,2,2)}
mqc.font='10px '+FN;mqc.textAlign='center';mqc.fillStyle='#000';mqc.fillText(q[0],61,12);mqc.fillStyle=q[2];mqc.fillText(q[0],60,11);}
function mini(){$('mg').style.display='flex';$('mr').textContent='';MG={t:0,s:0,x:0}}
function stopMG(){if(!MG||MG.s)return;MG.s=1;MG.t=0;const d=Math.abs(MG.x-.5),m=d<.06?10:d<.2?4:1.5,g=Math.floor(G.stage*60*m*mul());G.gold+=g;$('mr').textContent='x'+m+' +'+fmt(g);beep(m>=10?1600:900,.4,'sawtooth',.07);flash(m>=10?'#ffd400':'#fff');if(m>=10)kyuin(8,'#ffd400')}
function updMG(dt){if(!MG)return;MG.t+=dt;if(!MG.s){MG.x=(1+Math.sin(MG.t*(5+MG.t*1.5)))/2;if(MG.t>5)stopMG()}else if(MG.t>1.6){$('mg').style.display='none';MG=null;return}const c=mgc;c.fillStyle='#000';c.fillRect(0,0,240,60);c.fillStyle='#17a673';c.fillRect(72,0,96,60);c.fillStyle='#ffd400';c.fillRect(106,0,28,60);c.fillStyle='#fff';c.fillRect(MG.x*234,0,6,60)}
$('mg').onpointerdown=()=>{if(MG&&!MG.s)stopMG()};
