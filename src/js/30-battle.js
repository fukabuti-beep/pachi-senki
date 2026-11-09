/* ---------- battle: logic (spawn/hurt/kill/ult) ---------- */
const isBoss=()=>G.stage%5==0;
function spawn(){G.mx=G.hp=hpOf(G.stage);G.en=isBoss()?'b'+((G.stage/5-1)%2):'m'+(G.stage*3%4);G.hit=0;if(isBoss()){showMsg('BOSS出現!','#ff2d7a');flash('#f00')}}
const F=[],PT=[],PR=[],FX=[],HA=[-9,-9,-9];let cmb=0,cmbT=0,cut=null,DT=.016;
const cm=()=>1+Math.min(cmb,50)*.03;
function burst(x,y,n,c){for(let i=0;i<n;i++){const a=Math.random()*TAU,s=1+Math.random()*4;PT.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,l:1,c})}}
function hurt(x,col,big,crit){if(crit)x*=3*UPX.critD();F.push({x:215+Math.random()*80,y:60+Math.random()*25,t:0,s:(crit?'★':'')+fmt(x),c:crit?'#ffe14d':col||'#fff',b:big||crit});G.hit=crit?1.4:.8;if(crit){burst(262,80,8,'#ffe14d');zoom();HS=.07}G.hp-=x;if(G.hp<=0)kill()}
function kill(){const rr=Math.random()<.12,g=Math.floor(G.mx*.35*mul()*(isBoss()?2:1)*(rr?5:1));if(rr){banner('RARE DROP!!','#ffd400');kyuin(5,'#ffd400')}G.gold+=g;for(let i=0;i<30;i++)PT.push({x:262,y:90,vx:(Math.random()-.5)*7,vy:-2-Math.random()*4,l:1.4,c:'#ffd400'});F.push({x:150,y:35,t:0,s:'+'+fmt(g),c:'#ffd400',b:1});beep(880,.15,'square',.05);if(isBoss()){setTimeout(mini,1200);fan()}G.stage++;if([3,5,8].includes(G.stage))banner('NEW 強化解放!','#22e0ff');spawn()}
function heroAtk(i,m){HA[i]=T;PR.push({i,t:0,d:atk()*m*cm(),cr:Math.random()<critP()})}
function cutin(h,txt,c,cb){cut={t0:T,h,txt,c,cb,f:0};flash('#fff');beep(300,.3,'sawtooth',.06)}
function ult(){LU=T;const h=Math.floor(Math.random()*3);G.sp=0;cutin(h,['烈火斬','雷撃陣','千矢雨'][h],'#22e0ff',()=>{FX.push({k:h,t0:T});burst(262,80,50,'#22e0ff');shake();hurt(atk()*BAL.ultK*cm(),'#22e0ff',1,1);beep(220,.4,'sawtooth',.08)})}
