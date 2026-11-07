/* ---------- feature 95: ミニゲーム追加 ----------
   ボス撃破で既存の mini()(BONUS STOP) が呼ばれる → mini をラップして種類をローテーション(進行度で解放)。
     stop  : BONUS STOP (既存 / 常時)         5秒で自動ストップ
     chest : 宝箱くじ    (STAGE10〜)         タップで選ぶ / 6秒で自動で選ぶ
     tap   : コインラッシュ (STAGE20〜)        5秒連打 / 放置は自動で叩く(3回/秒)
   どれも一定時間で自動決着するので放置でも詰まらない。 */
const MGT=[['stop','BONUS STOP',0],['chest','宝箱くじ',10],['tap','コインラッシュ',20]];
let MG2=null;
mk('fchest','k#14101f,l#d19a4a,b#8a5a2b,d#5a3a14,g#ffd400',["......","..kkkk",".kllll","kllllb","kddddd","kkkkkk","kbbbgg","kbbbgk","kbbbbb","kbbbbb","kdddkk","......"]);
mk('fchest2','k#14101f,l#d19a4a,b#8a5a2b,d#5a3a14,g#ffd400,y#fff2a0',["...g.y","..gy.g",".kkkkk","kllllb","kddddd","kgyygg","kgyyyy","kbgggg","kbbbbb","kbbbbb","kdddkk","......"]);
mk('fcoin','k#14101f,g#ffd400,y#fff2a0,o#b88a00',["......","......","..kkkk",".kggyy",".kgyyy","kgyyoo","kgyyoo",".kgooo",".kggoo","..kkkk","......","......"]);
const mg2e=fxEl('div','fxg','','<div class="rb"><div class="fxh" id="fxgt"></div><canvas id="fxgc" width="240" height="90" style="margin:6px 0;width:240px;height:90px"></canvas><div class="fxn" id="fxgr" style="height:40px;font-size:26px"></div><div class="fxs" id="fxgh"></div></div>');
const mg2c=$('fxgc').getContext('2d');
/* 既存 mini() をラップ: 種類を選んで開始。stop は元の mini をそのまま呼ぶ(+タップが効くよう pointer-events を補正) */
if(typeof mini==='function'){const o=mini;mini=function(){if(MG||MG2)return;X.st.mg++;const ty=mgPick();if(ty=='stop'){$('mg').style.pointerEvents='auto';return o.apply(this,arguments)}mg2Start(ty)}}
if(typeof stopMG==='function'){const o=stopMG;stopMG=function(){const was=!!MG&&!MG.s,d=MG?Math.abs(MG.x-.5):1;const r=o.apply(this,arguments);if(was&&d<.06)X.st.mgp++;return r}}
function mgPick(){const av=MGT.filter(m=>G.stage>=m[2]);return av[(X.mgi++)%av.length][0]}
function mg2Start(ty){
  const sh=[2,5,12].sort(()=>Math.random()-.5);
  MG2={ty,t:0,s:0,ch:sh,pk:-1,n:0,hum:0,ac:0,co:[],res:''};
  $('fxgt').textContent=ty=='chest'?'宝箱くじ!':'コインラッシュ!';
  $('fxgr').textContent=ty=='chest'?'':'0';
  $('fxgh').textContent=ty=='chest'?'タップで選ぶ(6秒で自動)':'連打!! 放置でも自動で叩くよ(5秒)';
  mg2e.style.display='flex';beep(900,.15,'square',.05)}
function mg2End(){mg2e.style.display='none';MG2=null}
function mg2Tap(e){
  const m=MG2;if(!m)return;
  if(m.ty=='chest'){if(m.s)return;let i=1;if(e&&e.clientX!=null){const r=$('fxgc').getBoundingClientRect();i=Math.max(0,Math.min(2,Math.floor((e.clientX-r.left)/(r.width||240)*3)))}mg2Pick(i,0)}
  else if(!m.s&&m.n<80){m.hum=1;mg2Coin();beep(700+m.n*8,.03,'square',.03)}}
function mg2Coin(){const m=MG2;m.n++;if(m.co.length<30)m.co.push({x:10+Math.random()*200,y:-14,v:2+Math.random()*3});$('fxgr').textContent=m.n+(m.hum?'':' AUTO')}
function mg2Pick(i,auto){
  const m=MG2;if(!m||m.s)return;m.s=1;m.t=0;m.pk=i;const x=m.ch[i],g=addGold(G.stage*50*x*mul()*sbg());
  m.res='x'+x+' +G'+fmt(g);$('fxgr').textContent=m.res;$('fxgh').textContent=auto?'(自動で選んだ)':'';
  beep(x>=12?1600:900,.4,'sawtooth',.07);flash(x>=12?'#ffd400':'#fff');if(x>=12){X.st.mgp++;kyuin(8,'#ffd400')}}
function mg2Fin(){const m=MG2,n=Math.min(m.n,80),g=addGold(n*G.stage*12*mul()*(1+n/40)*sbg());m.s=1;m.t=0;m.res='+G'+fmt(g);$('fxgr').textContent=n+'枚 '+m.res;$('fxgh').textContent=n>=40?'GREAT!!':'';beep(n>=40?1600:1000,.4,'sawtooth',.07);if(n>=40){X.st.mgp++;flash('#ffd400');kyuin(8,'#ffd400')}}
mg2e.onpointerdown=mg2Tap;
FU.push(dt=>{
  const m=MG2;if(!m)return;m.t+=dt;
  if(m.s){if(m.t>2)mg2End()}
  else if(m.ty=='chest'){if(m.t>6)mg2Pick(Math.floor(Math.random()*3),1)}
  else{if(!m.hum&&m.t>1.5){m.ac+=dt*3;while(m.ac>=1){m.ac--;if(m.n<80)mg2Coin()}}if(m.t>=5)mg2Fin()}
  if(!MG2)return;const c=mg2c;c.fillStyle='#120a34';c.fillRect(0,0,240,90);
  if(m.ty=='chest'){for(let i=0;i<3;i++){const op=m.s,x=15+i*75,y=12+(m.s&&i==m.pk?-3:0)+Math.sin(m.t*4+i)*(m.s?0:2);c.globalAlpha=m.s&&i!=m.pk?.45:1;c.drawImage(SPR[op?'fchest2':'fchest'],x,y,60,60);if(op){c.fillStyle='#ffd400';c.font='16px '+FN;c.textAlign='center';c.fillText('x'+m.ch[i],x+30,84)}}c.globalAlpha=1}
  else{for(let i=m.co.length-1;i>=0;i--){const k=m.co[i];k.y+=k.v;if(k.y>90)m.co.splice(i,1);else c.drawImage(SPR.fcoin,k.x,k.y,24,24)}
    c.fillStyle='#000';c.fillRect(10,80,220,6);c.fillStyle='#ffd400';c.fillRect(10,80,220*Math.min(1,m.t/5),6)}});
FM.push({n:'遊戯',r:()=>'<div class="fxh">ミニゲーム</div><div class="fxs">ボスを倒すと発生。進行で種類が増える。<br>放置でも自動で決着。</div><div class="fxl">'+MGT.map(m=>'<div class="'+(G.stage>=m[2]?'ok':'no')+'"><span>'+m[1]+'</span><span>'+(G.stage>=m[2]?'解放済':'STAGE '+m[2]+'〜')+'</span></div>').join('')+'</div><div class="fxs" style="margin-top:6px">累計 '+X.st.mg+'回 / 大成功 '+X.st.mgp+'回</div>'});
