/* ---------- loop ---------- */
let run=false,T=0,last=0,eacc=0,ui=0,sv=0;
function update(dt){eacc+=rate()*dt*(G.rush>0?1.5:1)*(G.fv>0?2.5:1);while(eacc>=1){eacc--;if(balls.length<70)balls.push(bk(332+Math.random()*10,18,-(.8+Math.random()*3.6),0))}
stepBalls(dt);updSpin(dt);updRoul(dt);updMG(dt);if(G.jp>0){G.jp-=dt;if(G.jp<=0){G.jp=0;G.roul=0;startSpin()}}
cmbT-=dt;if(cmbT<=0)cmb=0;if(G.aw>0)G.aw-=dt;if(G.fv>0)G.fv-=dt;else if(G.rush<=0&&Math.random()<dt*fevRate()){G.fv=8;banner('FEVER TIME!!','#22e0ff');kyuin(6,'#22e0ff');fan()}if(Math.random()<dt*goldRate()&&balls.length<70)balls.push(bk(332,18,-(1+Math.random()*3),0,2));
for(let i=PR.length-1;i>=0;i--){const p=PR[i];p.t+=dt;if(p.t>=.22){hurt(p.d,['#ffa070','#9ff','#bfa'][p.i],0,p.cr);burst(255,85,5,['#ff7a45','#6fe3ff','#9bff6b'][p.i]);PR.splice(i,1)}}
G.at+=dt;if(G.at>.55/(G.rush>0?2:1)){G.at=0;G.ai=(G.ai+1)%3;heroAtk(G.ai,.8*(G.rush>0?2:1));spAdd(BAL.spHero*spm())}
if(G.sp>=100&&!cut&&!G.roul&&ultReady())ult();
if(G.rush>0){if(!PUSH)G.rush-=dt;if(G.rush<=0){G.rush=0;G.combo=0;showMsg('RUSH終了','#aaa')}}
ui+=dt;if(ui>.1){ui=0;refresh()}sv+=dt;if(sv>4){sv=0;try{localStorage.setItem('pachi2',JSON.stringify({v:2,gold:G.gold,stage:G.stage,lv:G.lv}))}catch(e){}}featUpdate(dt)}
function loop(ts){requestAnimationFrame(loop);const dt=Math.max(0,Math.min(.05,(ts-last)/1000||0));last=ts;T+=dt;DT=dt;if(HS>0)HS-=dt;if(run)update(HS>0?dt*.12:dt);drawP(T);drawB(T);drawMq(T)}
spawn();refresh();requestAnimationFrame(loop);
$('go').onclick=()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)()}catch(e){}if(typeof ttGo==='function')try{ttGo()}catch(e){}$('ov').style.display='none';run=true;featStart();beep(660,.1);bgm()};
