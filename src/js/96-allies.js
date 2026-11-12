/* ---------- feature 96: 仲間(サポートユニット) ----------
   最高到達ステージ X.best で解放(転生しても残る)。英雄3人とは別枠で、一定間隔に自動で援護攻撃する。
   戦闘描画は drawB をラップして足元に小さく表示(既存の英雄/弾の配列 HA/PR には触れない)。 */
const ALY=[
{id:'dog',n:'ポチ',sp:'fa0',st:12,ev:3,d:'3秒ごとに追撃',col:'#ffcf8a',go:()=>{hurt(atk()*2*cm(),'#ffcf8a',0,Math.random()<critP())}},
{id:'mage',n:'魔導士',sp:'fa1',st:30,ev:6,d:'6秒ごとに魔法+SP充電',col:'#c8b8ff',go:()=>{hurt(atk()*10*cm(),'#c8b8ff',1,1);G.sp=Math.min(100,G.sp+10);burst(262,80,14,'#c8b8ff')}},
{id:'dragon',n:'竜',sp:'fa2',st:60,ev:10,d:'10秒ごとにブレス+金貨',col:'#7dffa6',go:()=>{hurt(atk()*35*cm(),'#7dffa6',1,1);addGold(G.stage*30*mul()*sbg());burst(262,80,30,'#7dffa6');shake()}},
/* 役割のちがう仲間(docs/DESIGN.md: 同じ「ダメージ」ばかり増やさない)。妖精=守り(英雄の体力 94c と組む)、雷鳥=大技+敵の手を止める */
{id:'fairy',n:'癒しの妖精 ルル',sp:'fa5',st:90,ev:8,d:'8秒ごとに英雄を回復(体力+15%)',col:'#ff9ad0',go:()=>{try{if(typeof HV!=='undefined')for(let i=0;i<3;i++)if(!HV.dn[i])HV.hp[i]=Math.min(hvMax(i),HV.hp[i]+hvMax(i)*.15)}catch(e){}for(let i=0;i<3;i++)burst(38+i*46,84,5,'#ff9ad0')}},
{id:'bird',n:'雷鳥 ライデン',sp:'fa6',st:140,ev:12,d:'12秒ごとに落雷+敵をしびれさせる',col:'#ffe14d',go:()=>{hurt(atk()*60*cm(),'#ffe14d',1,1);try{if(typeof HV!=='undefined')HV.at+=2.5}catch(e){}burst(262,60,26,'#ffe14d');shake()}}];
mk('fa0','k#14101f,b#c98a4a,d#8a5a2b,w#fff,e#14101f,n#3a2a1a',["......",".k....","kdk...","kdbkkk",".kbbbb",".kbbbw",".kbbbe",".kbbbn","..kbbb","..kbbb","..kdkd","..kkkk"]);
mk('fa1','k#14101f,p#6a4cff,s#ffd2a6,e#14101f,c#ffd400',[".....k","....kp","...kpp","..kppp","kkkkkk",".kssss",".ksess","..kppp",".kpppc",".kpppp",".kpppp",".kkkkk"]);
mk('fa2','k#14101f,g#2fb36b,d#1b7a47,w#fff,e#ff4d6a',["......","..k.k.",".kgkgg","kggggg","kggwwe","kgggdd",".kggdd","kgggdd","kkgggd",".kdgdd","..kkkk","......"]);
mk('fa5','k#14101f,w#ffe3f3,p#ff9ad0,s#ffd2a6,e#14101f,y#ffd24d',["......","....ky","...kpp","w..kpp","ww.kss","wwwkse",".wwkpp","..wkpp","...kpp","....kp","....ks","......"]);
mk('fa6','k#14101f,y#ffe14d,o#e0a800,w#fff,e#14101f,b#ff8a1f',["......","....kk","...kyy","k..kyy","yk.kye","yykkyy","yyyyyb","kyyyyy",".kooyy","..kkoo","....ko","....kb"]);
ALY.forEach(a=>{a.t=0;a.h=-9});
let alyAnn=X.best;
const alyOn=a=>X.best>=a.st;
AC_.push(['al','全員集合','仲間が全員そろう',3,()=>X.best>=ALY[ALY.length-1].st,[()=>X.best,ALY[ALY.length-1].st]]);
FU.push(dt=>{
  for(const a of ALY){if(!alyOn(a))continue;if(cut||RL)continue;a.t+=dt;if(a.t>=a.ev){a.t=0;a.h=T;a.go();if(AC)beep(900,.05,'triangle',.03)}}
  if(X.best>alyAnn){for(const a of ALY)if(a.st>alyAnn&&a.st<=X.best){fxToast('仲間加入! '+a.n+'  '+a.d,a.col);banner('仲間 '+a.n,a.col);fan()}alyAnn=X.best}});
if(typeof drawB==='function'){const o=drawB;drawB=function(t){o.apply(this,arguments);let k=0;for(const a of ALY){if(!alyOn(a))continue;const d=t-a.h,hop=d>=0&&d<.25?Math.sin(d/.25*Math.PI)*10:0;bc.fillStyle='rgba(0,0,0,.4)';bc.fillRect(8+k*30,144,24,4);bc.drawImage(SPR[a.sp],8+k*30,120-hop+Math.sin(t*5+k)*1.5,24,24);k++}}}
FM.push({n:'仲間',r:()=>'<div class="fxh">仲間</div><div class="fxs">最高 STAGE で仲間が加わる(今 STAGE '+X.best+'・転生しても残る)</div><div class="fxl">'+ALY.map(a=>'<div class="'+(alyOn(a)?'ok':'no')+'"><span>'+(alyOn(a)?a.n:'???')+'<br><small>'+(alyOn(a)?a.d:'STAGE '+a.st+' で加入')+'</small></span><span>'+(alyOn(a)?'加入済':'STAGE '+a.st)+'</span></div>').join('')+'</div>'});
