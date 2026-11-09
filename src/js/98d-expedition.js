/* ---------- 遠征 (feature) ----------
   メニュー「遠征」から遠征隊を送り出すと、実時間(アプリを閉じていても進む)で 30分/2時間/8時間後に帰ってくる。
   報酬は魔石・宝石(竜の巣は遺物のチャンスも)。15%で「大成功」(報酬2倍)。英雄は戦闘を続けるので放置の損は無い。
   行き先は最高到達ステージ X.best で解放。帰ってきたら メニューボタンに「!」+トースト。受け取りはメニューから。
   セーブ: localStorage['pachi2_exp'] = {d:行き先(-1=待機), t0:出発時刻ms, n:累計帰還回数, big:大成功回数}。転生しても残る。
   報酬は「受け取った時」の X.best で決まる(進めてから受け取るほど多い)。
   98g-party.js: 遠征隊の編成(仲間の相性/Lv で報酬・大成功率アップ、お土産)と後半の行き先(魔王城/天空の神殿)。下の typeof フックで呼ぶ。 */
const EXD=[
 {n:'はじまりの森',sec:1800,st:1,k:1,gp:.25,g:[1,1],rp:0,c:'#43e060'},
 {n:'古代遺跡',sec:7200,st:20,k:4,gp:1,g:[1,2],rp:0,c:'#d19a4a'},
 {n:'竜の巣',sec:28800,st:50,k:12,gp:1,g:[3,5],rp:.4,c:'#ff5a5a'},
 /* 後半向け(98g): lo=遺物は未発見/低Lvを優先して選ぶ */
 {n:'魔王城',sec:43200,st:100,k:18,gp:1,g:[4,7],rp:.55,lo:1,c:'#a066ff'},
 {n:'天空の神殿',sec:57600,st:150,k:24,gp:1,g:[6,9],rp:.7,lo:1,c:'#7ff3ff'}];
const EXP={d:-1,t0:0,n:0,big:0,ntf:0};
try{const j=JSON.parse(localStorage.getItem('pachi2_exp')||'null');if(j&&typeof j=='object'){const d=Math.floor(+j.d),t0=+j.t0;
  if(d>=0&&d<EXD.length&&Number.isFinite(t0)&&t0>0){EXP.d=d;EXP.t0=t0}
  const n=v=>{v=Math.floor(+v);return Number.isFinite(v)&&v>0?Math.min(v,1e9):0};EXP.n=n(j.n);EXP.big=n(j.big)}}catch(e){}
function expSave(){try{localStorage.setItem('pachi2_exp',JSON.stringify({d:EXP.d,t0:EXP.t0,n:EXP.n,big:EXP.big}))}catch(e){}}
const expOpen=i=>X.best>=EXD[i].st;
/* 残り秒(時計が巻き戻っていたら出発時刻を今に直す) */
function expLeft(now){if(EXP.d<0)return 0;now=now||nowMs();if(EXP.t0>now){EXP.t0=now;expSave()}return Math.max(0,EXD[EXP.d].sec-(now-EXP.t0)/1000)}
const expDone=()=>EXP.d>=0&&expLeft()<=0;
const expMs=i=>Math.floor((30+X.best*3)*EXD[i].k);
function expGo(i){if(EXP.d>=0||!expOpen(i))return false;EXP.d=i;EXP.t0=nowMs();EXP.ntf=0;expSave();
  try{if(typeof ptDepart==='function')ptDepart(i)}catch(e){}/* 98g: 編成を記録 */
  fxToast('遠征隊が '+EXD[i].n+' へ出発!','#7ff3ff');seExp('go');
  if(fxOpen)fxMenu();return true}
function expCancel(){if(EXP.d<0)return;EXP.d=-1;EXP.t0=0;expSave();try{if(typeof ptDepart==='function')ptDepart(-1)}catch(e){}fxToast('遠征隊を呼び戻した','#aaa');expBadge();if(fxOpen)fxMenu()}
/* 報酬を決めて付与(テストからも呼ぶ)。戻り値 {ms,gem,relic,big} */
function expClaim(){if(!expDone())return null;const i=EXP.d,D=EXD[i];
  /* 98g: 遠征隊(仲間)の相性/Lv ボーナス pb={m:報酬倍率, b:大成功率の加算} */
  let pb={m:1,b:0};try{if(typeof ptBonus==='function')pb=ptBonus(i,1)}catch(e){}
  const big=Math.random()<.15+pb.b,m=big?2:1;
  const ms=Math.floor(expMs(i)*pb.m)*m;let gem=Math.random()<D.gp?D.g[0]+Math.floor(Math.random()*(D.g[1]-D.g[0]+1)):0;gem=Math.floor(gem*pb.m+Math.random())*m;
  let relic=null;try{if(D.rp&&typeof relicRoll==='function'&&Math.random()<Math.min(.95,D.rp*m*(1+(pb.m-1)/2)))relic=D.lo&&typeof ptRelicLow==='function'?ptRelicLow():relicRoll()}catch(e){}
  if(typeof RES!=='undefined'){RES.ms+=ms;RES.gem+=gem;try{resSave()}catch(e){}}
  EXP.n++;if(big)EXP.big++;EXP.d=-1;EXP.t0=0;expSave();
  const r={i,ms,gem,relic,big,pm:pb.m};try{if(typeof ptReturn==='function')r.pt=ptReturn(i,r)}catch(e){}/* 98g: 経験値とお土産 */
  expBadge();return r}
function expCollect(){const r=expClaim();if(!r){if(fxOpen)fxMenu();return}const D=EXD[r.i];
  fxShow('<div class="fxh">遠征隊が帰還!</div><div class="fxs">'+D.n+' から戻ってきた</div>'+(r.big?'<div class="fxh exbig">大成功!! 報酬2倍</div>':'')+
   '<div class="fxl"><div class="ok"><span>魔石</span><span style="color:#c8a0ff">+'+fmt(r.ms)+'</span></div>'+
   (r.gem?'<div class="ok"><span>宝石</span><span style="color:#7ff3ff">+'+r.gem+'</span></div>':'')+
   (r.relic?'<div class="ok"><span>遺物 '+r.relic.r.n+'</span><span style="color:'+r.relic.r.c+'">'+(r.relic.nw?'NEW!':'Lv '+r.relic.lv)+'</span></div>':'')+
   '</div>'+(typeof ptHtml==='function'?ptHtml(r):'')+'<div class="fxs" style="margin-top:6px">遠征 累計 '+EXP.n+'回(大成功 '+EXP.big+'回)</div>',[['もう一度 出発!',()=>{expGo(r.i);fxMenu()}],['閉じる',null,'g']]);
  try{banner(r.big?'遠征 大成功!!':'遠征隊 帰還!',r.big?'#ffd400':D.c);kyuin(r.big?8:4,r.big?'#ffd400':D.c);fan();seExp(r.big?'big':'back');if(r.big){shake();flash('#ffd400')}}catch(e){}}
/* メニューボタンの「!」 */
function expBadge(){try{const b=$('fxmbi');if(!b)return;const on=expDone();b.style.display=on?'block':'none';b.textContent=on?'!':'';b.style.fontSize='11px';b.style.lineHeight='14px'}catch(e){}}
function expFmt(s){s=Math.ceil(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),c=s%60;return h+':'+String(m).padStart(2,'0')+':'+String(c).padStart(2,'0')}
let expTk=0;
FU.push(dt=>{expTk+=dt;if(expTk<1)return;expTk=0;
  if(expDone()&&!EXP.ntf){EXP.ntf=1;expBadge();fxToast('遠征隊が帰ってきた! メニューで受け取ろう','#7ff3ff');seExp('ret');}
  if(fxOpen&&EXP.d>=0){const e=$('exrem');if(e){const l=expLeft();if(l<=0)fxMenu();else{e.textContent=expFmt(l);const b=$('exbar');if(b)b.style.width=Math.round(100*(1-l/EXD[EXP.d].sec))+'%'}}}});
try{if(document.addEventListener)document.addEventListener('visibilitychange',()=>{if(!document.hidden){EXP.ntf=0;expTk=1}})}catch(e){}
function expMenu(){let h='<div class="fxh">遠征</div><div class="fxs">遠征隊は アプリを閉じていても時間で帰ってくる。<br>英雄は戦い続けるので放置の損は無し。転生しても残る。</div>';
  if(EXP.d>=0){const D=EXD[EXP.d],l=expLeft();
    h+='<div class="exbox"><div class="fxp" style="color:'+D.c+'">'+D.n+'</div>'+(l>0?'<div class="fxn" id="exrem">'+expFmt(l)+'</div><div class="exgauge"><i id="exbar" style="width:'+Math.round(100*(1-l/D.sec))+'%"></i></div><div class="fxs">報酬は受け取る時の最高到達ステージで決まる</div><div><button class="fxb g" onclick="expCancel()">呼び戻す(報酬なし)</button></div>':
     '<div class="fxn">帰還!!</div><div><button class="fxb exgo" onclick="expCollect()">受け取る!</button></div>')+'</div>'}
  if(typeof ptMenu==='function')h+=ptMenu();/* 98g: 遠征隊の編成 */
  h+='<div class="fxl exl">'+EXD.map((D,i)=>{const op=expOpen(i),busy=EXP.d>=0;return '<div class="'+(op?'ok':'no')+'"><span>'+(op?D.n:'??? ')+'<br><small>'+(op?Math.round(D.sec/3600*10)/10+'時間 / 魔石 '+fmt(expMs(i))+(D.gp>=1?' 宝石 '+D.g[0]+'〜'+D.g[1]:' 宝石 '+Math.round(D.gp*100)+'%')+(D.rp?' 遺物 '+Math.round(D.rp*100)+'%'+(D.lo?'(未発見優先)':''):'')+(typeof ptAffTag==='function'?ptAffTag(i):''):'最高 STAGE '+D.st+' で解放')+'</small></span><span>'+
    (op?'<button class="fxb'+(busy?' d':'')+'" style="margin:0;padding:4px 8px" onclick="expGo('+i+')">出発</button>':'')+'</span></div>'}).join('')+'</div>'+
   '<div class="fxs" style="margin-top:6px">15%で大成功(報酬2倍。仲間の相性で上がる)。累計 '+EXP.n+'回 / 大成功 '+EXP.big+'回</div>';return h}
FM.push({n:'遠征',r:expMenu});
if(typeof AC_!=='undefined'){AC_.push(['ex1','はじめての遠征','遠征から帰還',1,()=>EXP.n>=1,[()=>EXP.n,1]]);AC_.push(['ex20','遠征の達人','遠征20回',3,()=>EXP.n>=20,[()=>EXP.n,20]])}
expBadge();
