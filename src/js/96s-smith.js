/* ---------- リソース: 魔石・宝石 と 鍛冶屋 (feature) ----------
   魔石: 敵を倒すと入手(雑魚 1+STAGE/20、ボス 10+STAGE/2)。
   宝石: JACKPOT +5 / RUSHリザルトのランク A+ +1・S +2・S+ +3 / 図鑑の★アップ +1 / 宝袋・流れ星の捕獲 +1。
   使い道(メニュー「鍛冶屋」):
     武器強化  剣・杖・弓を魔石で Lv アップ → そのキャラの通常攻撃 +12%/Lv。10Lv ごとの限界突破は宝石が必要。
     宝石の護符 宝石3個で3分間 ゴールド2倍 / ダメージ2倍(残り時間はセーブされ、ゲーム時間で減る)。
   転生しても残る。セーブ: localStorage['pachi2_res'] = {ms, gem, w:[3], bg, ba}。 */
const RES={ms:0,gem:0,w:[0,0,0],bg:0,ba:0,pop:[]};
try{const j=JSON.parse(localStorage.getItem('pachi2_res')||'null');if(j&&typeof j=='object'){const n=(v,hi)=>{v=Math.floor(+v);return Number.isFinite(v)&&v>0?Math.min(v,hi):0};
  RES.ms=n(j.ms,1e12);RES.gem=n(j.gem,1e9);RES.w=[0,1,2].map(i=>n((j.w||[])[i],999));RES.bg=n(j.bg,3600);RES.ba=n(j.ba,3600)}}catch(e){}
let RESD=0;function resSave(){try{localStorage.setItem('pachi2_res',JSON.stringify({ms:RES.ms,gem:RES.gem,w:RES.w,bg:Math.ceil(RES.bg),ba:Math.ceil(RES.ba)}))}catch(e){}}
const WPN=[['剣','剣士'],['杖','魔法使い'],['弓','弓使い']];
const wMul=i=>1+.12*(RES.w[i]||0);
const wCost=l=>Math.floor(20*Math.pow(1.18,l));
const wGem=l=>(l>0&&l%10==0)?l/5:0;   // Lv10→11 で宝石2、Lv20→21 で4 ...
function resGem(n,why){if(n<=0)return;RES.gem+=n;resSave();if(RES.pop.length<6)RES.pop.push({t0:T,s:'宝石 +'+n,c:'#7ff3ff'});if(why)fxToast('宝石 +'+n+'('+why+')','#7ff3ff')}
function resMs(n){RES.ms+=n;RESD+=n;if(RESD>=50){RESD=0;resSave()}}
// 武器: そのキャラの通常攻撃の弾(PR)にだけ倍率を掛ける
{const o=heroAtk;heroAtk=function(i){const n0=PR.length,r=o.apply(this,arguments);try{if(PR.length>n0){const p=PR[PR.length-1];p.d*=wMul(p.i!=null?p.i:i)}}catch(e){}return r}}
// 護符
{const oa=SB.a,og=SB.g;SB.a=()=>oa()*(RES.ba>0?2:1);SB.g=()=>og()*(RES.bg>0?2:1)}
// 入手
{const o=kill;kill=function(){const wb=isBoss(),st=G.stage;const r=o.apply(this,arguments);try{if(run){const n=wb?10+Math.floor(st/2):1+Math.floor(st/20);resMs(n);if(wb&&RES.pop.length<6)RES.pop.push({t0:T,s:'魔石 +'+n,c:'#c8a0ff'})}}catch(e){}return r}}
{const o=jackpot;jackpot=function(){const r=o.apply(this,arguments);try{resGem(5,'JACKPOT')}catch(e){}return r}}
if(typeof actCatch==='function'){const o=actCatch;actCatch=function(){const r=o.apply(this,arguments);try{resGem(1)}catch(e){}return r}}
if(typeof zkStar==='function'&&typeof ZK!=='undefined'){const o=kill;kill=function(){let k=null,s0=0;try{k=enSpr(G.stage);s0=zkStar(k)}catch(e){}const r=o.apply(this,arguments);try{if(k&&zkStar(k)>s0)resGem(1,'図鑑★')}catch(e){}return r}}
let RESRR=null;
function resUpd(dt){if(RES.bg>0)RES.bg=Math.max(0,RES.bg-dt);if(RES.ba>0)RES.ba=Math.max(0,RES.ba-dt);
  const R=typeof GK!=='undefined'?GK.rr:null;if(R&&R!==RESRR){RESRR=R;const n={'A+':1,'S':2,'S+':3}[R.gr]||0;if(n)setTimeout(()=>{try{resGem(n,'RANK '+R.gr)}catch(e){}},1500)}
  for(let i=RES.pop.length-1;i>=0;i--)if(T-RES.pop[i].t0>1.6)RES.pop.splice(i,1)}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{resUpd(dt)}catch(e){}return r}}
addEventListener('pagehide',()=>{try{resSave()}catch(e){}});
// 鍛冶屋
function smithUp(i){const l=RES.w[i],c=wCost(l),g=wGem(l);if(RES.ms<c||RES.gem<g){fxToast(RES.ms<c?'魔石が足りない(あと '+fmt(c-RES.ms)+')':'限界突破に宝石 '+g+' 個が必要','#aaa');return}
  RES.ms-=c;RES.gem-=g;RES.w[i]=l+1;resSave();fxToast(WPN[i][0]+' Lv'+(l+1)+(g?' 限界突破!!':'')+'  攻撃 x'+wMul(i).toFixed(2),g?'#7ff3ff':'#ffd400');try{kyuin(g?5:2,g?'#7ff3ff':'#ffd400');if(typeof chJump==='function')chJump(i,g?2:0)}catch(e){}try{grpRefresh()}catch(e){}}
function smithBuff(k){if(RES.gem<3){fxToast('宝石が3個必要','#aaa');return}RES.gem-=3;if(k=='g')RES.bg+=180;else RES.ba+=180;resSave();banner(k=='g'?'金運の護符!! G x2':'闘気の護符!! ダメージ x2',k=='g'?'#ffd400':'#ff5a5a');try{kyuin(5,'#ffd400')}catch(e){}try{grpRefresh()}catch(e){}}
const RI=k=>typeof resIcon==='function'?resIcon(k):(k==='ms'?'魔石':k==='gem'?'宝石':'');   // 29d のアイコン
const resT=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
FM.push({n:'鍛冶屋',r:()=>'<div class="fxh">鍛冶屋</div><div class="fxs">'+RI('ms')+'魔石: 敵を倒すと手に入る<br>'+RI('gem')+'宝石: JACKPOT・高ランク・図鑑★・お宝で手に入る<br>武器も素材も 転生しても残る</div><div class="fxn" style="font-size:20px"><span style="color:#c8a0ff">'+RI('ms')+fmt(RES.ms)+'</span>  <span style="color:#7ff3ff">'+RI('gem')+RES.gem+'</span></div><div class="fxl">'+
  WPN.map((w,i)=>{const l=RES.w[i],c=wCost(l),g=wGem(l),ok=RES.ms>=c&&RES.gem>=g;return '<div class="ok"><span>'+w[1]+'の'+w[0]+' Lv'+l+'<br><small>通常攻撃 x'+wMul(i).toFixed(2)+'(1Lvで +12%)'+(g?' 次は限界突破':'')+'</small></span><span><button class="fxb'+(ok?'':' d')+'" style="margin:0;padding:4px 8px" onclick="smithUp('+i+')">'+RI('ms')+fmt(c)+(g?' '+RI('gem')+g:'')+'</button></span></div>'}).join('')+
  '<div class="ok"><span>金運の護符<br><small>3分間 ゴールド x2'+(RES.bg>0?' (残り '+resT(RES.bg)+')':'')+'</small></span><span><button class="fxb'+(RES.gem>=3?'':' d')+'" style="margin:0;padding:4px 8px" onclick="smithBuff(\'g\')">'+RI('gem')+'3</button></span></div>'+
  '<div class="ok"><span>闘気の護符<br><small>3分間 攻撃 x2'+(RES.ba>0?' (残り '+resT(RES.ba)+')':'')+'</small></span><span><button class="fxb'+(RES.gem>=3?'':' d')+'" style="margin:0;padding:4px 8px" onclick="smithBuff(\'a\')">'+RI('gem')+'3</button></span></div></div>'});
// 戦闘画面右下: 所持数 / 護符の残り / 入手ポップ
function resDraw(t){bc.save();bc.textAlign='right';bc.font='10px '+FN;let x=354;const ch=(s,c,ic)=>{bc.fillStyle='#000';bc.fillText(s,x+1,147);bc.fillStyle=c;bc.fillText(s,x,146);const w=bc.measureText?bc.measureText(s).width||s.length*6:s.length*6;
    if(ic&&typeof resIconCanvas==='function'&&resIconCanvas(bc,ic,x-w-11,137,10)){x-=w+19}else x-=s.length*7+10};   // 29d のドット絵アイコン(無ければ従来の文字)
  if(typeof resIconCanvas==='function'){ch(''+RES.gem,'#7ff3ff','gem');ch(fmt(RES.ms),'#c8a0ff','ms')}else{ch('宝'+RES.gem,'#7ff3ff');ch('魔'+fmt(RES.ms),'#c8a0ff')}if(RES.ba>0)ch('闘'+resT(RES.ba),'#ff7a7a');if(RES.bg>0)ch('金'+resT(RES.bg),'#ffd400');
  RES.pop.forEach((p,k)=>{const q=t-p.t0;bc.globalAlpha=Math.max(0,1-q/1.6);bc.textAlign='right';if(typeof thickTxt==='function')thickTxt(bc,p.s,352,130-q*14-k*12,11,p.c);bc.globalAlpha=1});bc.restore()}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{resDraw(t)}catch(e){RES.pop.length=0}return r}}
