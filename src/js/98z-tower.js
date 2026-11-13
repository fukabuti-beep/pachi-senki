// @full  (完全版だけ。体験版のビルドには入らない=01-edition/tools/build.js)
// FULL_FEAT: 無限の塔
/* ---------- 無限の塔 (feature, 完全版) ----------
   ボスと次々に戦う連続バトル。メニュー「遊ぶ」→「無限の塔」(X.best>=TWU で解放)。
   ・挑戦中は今の敵をしまって、戦闘画面に塔のボスを出す(英雄/タップ/必殺/盤面の当たり=いつものダメージがそのまま当たる)。
   ・1階ごとに制限時間 TWT 秒。倒すと次の階(間に TWW 秒の「n階 突破!!」)、時間切れで挑戦終了 → 結果画面 → 元の敵に戻る。
   ・HP は twHp(f)=hp0·hpg^(2f-1)·boss·TWK(STAGE 2f のボスの TWK 倍)。到達できる階は だいたい 最高STAGE/2 前後。
   ・初めて越えた階だけ報酬: 魔石 4f、5階ごと宝石1(10階ごとは宝石3)、10階ごとに「塔の加護」ダメージ +3%(永続、SB.a)。
   ・見た目: 描画中だけ G.stage を「その階のボスの STAGE」に差し替えて drawEnemy/drawHP/drawBgB を呼ぶ(ロジックの G.stage は不変)。
     5階ごとはエリアの主、エリアは階ごとに巡る。
   ・kill/spawn は一番外側でラップ(このファイルは 98 の最後): 挑戦中の kill は塔の処理だけ(ステージは進まない・他のラップは動かない)。
     挑戦中に spawn が呼ばれたら(転生など)黙って挑戦を打ち切る。
   セーブ: localStorage['pachi2_tower'] = {best:最高到達階, runs:挑戦回数, clr:撃破数}。転生で残る。 */
const TWU=30,TWT=20,TWW=.9,TWK=1.5,TWMAX=400;
const TW={best:0,runs:0,clr:0,on:0,f:0,f0:1,t:TWT,w:0,sv:null,pop:null,got:{ms:0,gem:0,bless:0},inner:0};
(function(){try{const d=JSON.parse(localStorage.getItem('pachi2_tower')||'{}');const n=v=>{v=Math.floor(+v||0);return Number.isFinite(v)&&v>0?Math.min(v,1e6):0};
  TW.best=Math.min(n(d.best),TWMAX);TW.runs=n(d.runs);TW.clr=n(d.clr)}catch(e){}})();
function twSave(){try{localStorage.setItem('pachi2_tower',JSON.stringify({best:TW.best,runs:TW.runs,clr:TW.clr}))}catch(e){}}
const twOpen=()=>X.best>=TWU;
function twHp(f){const v=BAL.hp0*Math.pow(BAL.hpg,2*f-1)*BAL.boss*TWK;return Number.isFinite(v)?Math.floor(v):1e300}
const twBless=()=>Math.floor(TW.best/10)*.03;
/* その階の見た目に使う STAGE(5階ごとはエリアの主=25の倍数、他は普通のボス=5の倍数)。エリアは 1〜8 を巡る */
function twVs(f){const a=(f-1)%8;if(f%5==0)return 25*(a+1);return 25*a+5*(((f-1)%4)+1)}
function twMs(f){return 4*f}
function twGem(f){return f%10==0?3:f%5==0?1:0}
{const oa=SB.a;SB.a=()=>oa()*(1+twBless())}

function twBusy(){try{if(typeof lyBusyB==='function'&&lyBusyB())return '演出が終わりしだい始まる';if(G.roul||(typeof PUSH!=='undefined'&&PUSH))return '演出が終わりしだい始まる'}catch(e){}return ''}
/* 予約した挑戦: 演出が終わったら始める。30秒たっても終わらなければ取り消し。転生したら取り消し */
FU.push(()=>{const q=TW.q;if(!q||!run)return;if(typeof PGEN!=='undefined'&&PGEN!==q.g){TW.q=null;return}
  if(!twBusy())twGo(q.f);else if(T-q.t>30){TW.q=null;fxToast('塔の予約を取り消した(演出が長引いた)','#aaa')}});
function twStart(f){f=Math.max(1,Math.min(Math.floor(+f||1),TW.best+1,TWMAX));if(TW.on||!run)return;if(!twOpen()){fxToast('STAGE '+TWU+' で解放','#aaa');return}
  try{if(fxOpen)fxClose()}catch(e){}
  /* 演出中(カットイン/JACKPOT/ルーレット/押せ!!)でも受け付ける(作り手の指摘: 育成が進むと演出が途切れず入れない)。演出が終わりしだい自動で始まる */
  if(twBusy()){TW.q={f,t:T,g:typeof PGEN!=='undefined'?PGEN:0};fxToast('演出が終わりしだい 塔へ向かう','#b48cff');return}
  twGo(f)}
function twGo(f){TW.q=null;if(TW.on||!run)return;
  TW.sv={mx:G.mx,hp:G.hp};TW.on=1;TW.f0=f;TW.got={ms:0,gem:0,bless:0};TW.runs++;twSave();twFloor(f,1);
  try{banner('無限の塔 '+f+'階','#b48cff')}catch(e){}
  try{if(typeof sOK==='function'&&sOK()){const t=sNow();[392,523,659,784].forEach((q,i)=>tone(q,t+i*.08,.14,'square',.035));tone(98,t,.6,'sawtooth',.05,49)}}catch(e){}}
function twFloor(f,first){TW.f=f;TW.t=TWT;G.mx=G.hp=twHp(f);G.hit=0;try{ENT=T}catch(e){}if(!first)TW.w=TWW}
/* 倒した: 記録更新なら報酬 → 次の階 */
function twClear(){const f=TW.f;TW.clr++;let nw=0;
  try{deathFx(enSpr(twVs(f)),1)}catch(e){}
  if(f>TW.best){nw=1;TW.best=f;const ms=twMs(f),gm=twGem(f);try{resMs(ms)}catch(e){}TW.got.ms+=ms;
    if(gm>0){try{resGem(gm)}catch(e){}TW.got.gem+=gm}
    if(f%10==0){TW.got.bless++;try{banner('塔の加護!! ダメージ +3%','#b48cff');kyuin(4,'#b48cff')}catch(e){}}}
  twSave();
  TW.pop={t0:T,f,nw,big:f%5==0};
  try{if(typeof ringFx==='function'){ringFx(EXX,84,90,f%5==0?'#ffd400':'#b48cff',4,.45);if(f%5==0)ringFx(EXX,84,140,'#fff',3,.5,.12)}}catch(e){}
  try{if(typeof sOK==='function'&&sOK()){const t=sNow();const base=f%5==0?[784,988,1175,1568]:[659,880,1047];base.forEach((q,i)=>tone(q,t+i*.06,.12,'square',.03))}}catch(e){}
  if(f%5==0&&!nw){try{kyuin(2,'#ffd400')}catch(e){}}
  if(f>=TWMAX){twEnd(1);return}
  twFloor(f+1)}
/* 終了(時間切れ/上限/打ち切り)。quiet=結果画面を出さない */
function twEnd(top,quiet){if(!TW.on)return;TW.on=0;TW.w=0;const sv=TW.sv;TW.sv=null;
  if(sv&&Number.isFinite(sv.mx)&&sv.mx>0){G.mx=sv.mx;G.hp=Math.min(sv.hp,sv.mx);if(!(G.hp>0))G.hp=G.mx}else{try{spawn()}catch(e){}}
  try{ENT=T}catch(e){}
  if(quiet)return;
  const reach=top?TW.f:TW.f-1,g=TW.got;
  try{if(typeof sOK==='function'&&sOK()){const t=sNow();tone(330,t,.18,'square',.04);tone(247,t+.18,.3,'square',.04)}}catch(e){}
  let h='<div class="fxh">無限の塔 結果</div><div class="fxs">'+(top?'最上階まで登りきった!!':TW.f+'階で 時間切れ')+'</div>'+
    '<div class="fxn">'+(reach>=TW.f0?reach+'階 突破':'突破ならず')+'</div>'+
    '<div class="fxs">最高記録 <b>'+TW.best+'階</b>'+(reach>=TW.best&&reach>0&&(g.ms>0)?' (記録更新!!)':'')+'</div>';
  if(g.ms>0||g.gem>0)h+='<div class="fxs">獲得: '+RI('ms')+fmt(g.ms)+(g.gem>0?'  '+RI('gem')+g.gem:'')+(g.bless>0?'  塔の加護 +'+(g.bless*3)+'%':'')+'</div>';
  else h+='<div class="fxs">記録を越えた階だけ 報酬がもらえる</div>';
  const nf=Math.max(1,TW.best-9);
  fxShow(h,[['もう一度('+nf+'階から)',()=>twStart(nf)],['閉じる',null,'g']])}

/* 一番外側のラップ */
{const _k=kill;kill=function(){if(TW.on){try{twClear()}catch(e){TW.on=0}return}return _k.apply(this,arguments)}}
{const _s=spawn;spawn=function(){if(TW.on&&!TW.inner){TW.on=0;TW.sv=null;TW.w=0}return _s.apply(this,arguments)}}
FU.push(dt=>{if(!TW.on)return;if(!run){twEnd(0,1);return}
  if(TW.w>0){TW.w=Math.max(0,TW.w-dt);return}
  TW.t-=dt;if(TW.t<=0){TW.t=0;twEnd(0)}});
/* 描画中だけ G.stage を塔のボスの STAGE に */
function twVis(fn){return function(){if(!TW.on)return fn.apply(this,arguments);const s0=G.stage;G.stage=twVs(TW.f);try{return fn.apply(this,arguments)}finally{G.stage=s0}}}
drawEnemy=twVis(drawEnemy);drawHP=twVis(drawHP);if(typeof drawBgB==='function')drawBgB=twVis(drawBgB);
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);if(TW.on||TW.pop){try{twDraw(t)}catch(e){TW.pop=null}}return r}}
function twDraw(t){bc.save();bc.textAlign='left';
  if(TW.on){// 左上: 塔の札と階、HPバーの下に時間バー
    bc.fillStyle='rgba(20,8,40,.85)';bc.fillRect(4,26,92,18);bc.fillStyle='#b48cff';bc.fillRect(4,26,92,2);
    bc.font='10px '+FN;bc.fillStyle='#e6d8ff';bc.fillText('無限の塔',8,39);pxText(bc,TW.f+'F',92,30,1,'#fff','#d6c2ff','r');
    const r=Math.max(0,Math.min(1,TW.t/TWT)),lo=TW.t<5;bc.fillStyle='#000';bc.fillRect(147,23,198,6);bc.fillStyle=lo?(Math.floor(t*4)%2?'#ff2d55':'#ff8a8a'):'#b48cff';bc.fillRect(148,24,Math.round(196*r),4);
    if(TW.w<=0&&TW.t<5){bc.textAlign='center';pxText(bc,String(Math.ceil(TW.t)),EXX,30,2,'#ff6a7a','#ff2030','c')}}
  const p=TW.pop;if(p){const a=t-p.t0;if(a>1.1||a<0)TW.pop=null;else{const k=a<.12?a/.12:a>.85?(1.1-a)/.25:1,sc=p.big?3:2,y=58-(a<.12?(1-k)*20:0);
      bc.globalAlpha=Math.max(0,k);pxText(bc,p.f+'F CLEAR',180,y,sc,p.big?'#ffe14d':'#fff',p.big?'#ff8a1f':'#b48cff','c');
      if(p.nw){bc.font='11px '+FN;bc.textAlign='center';bc.strokeStyle='#000';bc.lineWidth=3;bc.fillStyle='#7ff3ff';bc.strokeText('記録更新!',180,y+(sc*7)+14);bc.fillText('記録更新!',180,y+(sc*7)+14)}
      bc.globalAlpha=1}}
  bc.restore()}

/* メニュー */
function twMenu(){if(!twOpen())return '<div class="fxh">無限の塔</div><div class="fxs">STAGE '+TWU+' に到達すると 挑戦できる(いまの最高 STAGE '+X.best+')</div>';
  const nf=Math.max(1,TW.best-9),nb=Math.floor(TW.best/10+1)*10,b=twBusy();
  let h='<div class="fxh">無限の塔</div><div class="fxs">ボスと 次々に戦う 連続バトル。1階 '+TWT+'秒 以内に倒すと 次の階へ。<br>いつもの攻撃・タップ・必殺・大当たりが そのまま効く。挑戦中は 今のステージは お休み。</div>'+
    '<div class="fxl"><div class="ok"><span>最高記録</span><span>'+TW.best+'階</span></div>'+
    '<div class="ok"><span>塔の加護(10階ごと)</span><span>ダメージ +'+Math.round(twBless()*100)+'%</span></div>'+
    '<div class="ok"><span>次の加護</span><span>'+nb+'階</span></div>'+
    '<div class="ok"><span>挑戦 / 撃破</span><span>'+TW.runs+' / '+TW.clr+'</span></div></div>'+
    '<div class="fxs">記録を越えた階で: '+RI('ms')+'4x階 ・ 5階ごと '+RI('gem')+'1(10階ごと 3)</div>';
  h+='<div class="twbt"><button type="button" class="fxb" onclick="twStart(1)">1階から挑戦</button>'+(nf>1?'<button type="button" class="fxb" onclick="twStart('+nf+')">'+nf+'階から挑戦</button>':'')+'</div>';
  if(b)h+='<div class="fxs" style="color:#ff9ab8">'+b+'</div>';
  return h}
FM.push({n:'無限の塔',r:twMenu});
try{if(typeof FMGRP!=='undefined'){const g=FMGRP.find(x=>x.n==='遊ぶ');if(g&&g.t.indexOf('無限の塔')<0)g.t.push('無限の塔')}}catch(e){}
try{if(typeof AC_!=='undefined'){
  AC_.push(['tw10','塔の挑戦者','無限の塔 10階',2,()=>TW.best>=10,[()=>TW.best,10]]);
  AC_.push(['tw30','塔の覇者','無限の塔 30階',4,()=>TW.best>=30,[()=>TW.best,30]]);
  AC_.push(['tw60','天を衝く者','無限の塔 60階',6,()=>TW.best>=60,[()=>TW.best,60]])}}catch(e){}
