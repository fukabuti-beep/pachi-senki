// @full  (完全版だけ。体験版のビルドには入らない)
// FULL_FEAT: 物語の最終章
/* ---------- 物語の最終章とエンディング (feature/fx, 完全版) ----------
   流れ(docs/STORY.md): STAGE 200 で虚無の王を倒す(98s の b7「ため込んだ光が…あふれる…!」)
     → 最終章 f1「解き放たれる光」(ため込まれていた運の光が8つの土地へ帰る=火山の主から張った伏線の回収)
     → エンディング(全画面のスタッフロール: 光が8方向へ飛ぶ・3人の行進・取り戻した土地・完)→「2周目へ」。
   ・はじめて見た時だけ 宝石10 と実績「虚無を払う者」。見た回数は localStorage['pachi2_end'] = {n}。
   ・会話は 98s の仕組み(SCN/styQueue)にシーンを1つ足すだけ。エンディングは会話が全部終わって演出が落ち着いてから出す(FU で見張る)。
   ・ゲームは裏で動き続ける(放置の進行は止めない)。タップで早送り、最後に「2周目へ」で閉じる(放っておいても約45秒で閉じる)。
   ・全画面の点滅はしない。reduced-motion では光の粒を減らす。 */
SCN.push({id:'f1',t:'最終章 解き放たれる光',h:'STAGE 200',e:'b11',ei:7,L:[
  [9,'虚無の王の体から、ため込まれていた運の光が いっせいにあふれ出した――'],
  [2,'見て! 光が空に…8つの方向へ飛んでいく!'],
  [1,'奪われた運が、元の場所へ帰っていくのね。草原にも、砂漠にも、星の海にも'],
  [8,'運など…幻だと…思っていた…。だが…温かい…'],
  [0,'幻じゃねえよ。俺たちが当ててきた、本物の光だ'],
  [1,'虚無は、またどこかで芽吹くかもしれない。でも光がある限り、また当てればいいの'],
  [2,'うん。3人でなら、何度でも!']]});
const END={n:0,on:null,pend:0};
try{END.n=Math.max(0,Math.floor(+(JSON.parse(localStorage.getItem('pachi2_end')||'{}').n)||0))}catch(e){}
function endSave(){try{localStorage.setItem('pachi2_end',JSON.stringify({n:END.n}))}catch(e){}}
/* 見張り: b7 を見た → f1 を待ち行列へ。f1 を見終わった → エンディング */
let ENDT=0;
FU.push(dt=>{ENDT+=dt;if(ENDT<.5||!run)return;ENDT=0;
  if(END.on)return;
  if(TS.s.b7&&!TS.s.f1)styQueue('f1');
  if(TS.s.f1&&!END.n&&!STY.cur&&!STY.q.length&&!styBusy()&&T-STY.lastClose>1.2)endOpen()});

/* ===== エンディング ===== */
const ENDL=[   // スタッフロール(上から流れる)。[文字, 種類] 種類: h=見出し t=タイトル n=名前 s=小さい
  ['パチ戦記','t'],['― 完 ―','h'],['',''],
  ['3人の英雄','h'],['剣士 ホムラ','n'],['魔法使い シズク','n'],['弓使い コハク','n'],['',''],
  ['光を取り戻した土地','h']];
function endAreas(){const A=typeof AREAS!=='undefined'?AREAS:[];return A.slice(0,8).map(a=>[a.n,'n',a.ac])}
const ENDL2=[['',''],['正気を取り戻した者たち','h'],['天翼の守護神 セレスティア','n'],['星喰いの騎士 ノヴァゼル','n'],['',''],
  ['ドット絵・音楽・効果音','h'],['すべてプログラムで生成','s'],['',''],
  ['遊んでくれたあなたに','h'],['ありがとう!','t'],['',''],
  ['虚無は、またどこかで芽吹く','s'],['旅はまだ続く――','s']];
(function(){try{const s=document.createElement('style');s.textContent=
'#edg{position:fixed;inset:0;z-index:70;background:#05030f;display:none;overflow:hidden;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}'+
'#edg canvas{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated}'+
'#edg .ev{position:absolute;left:0;right:0;top:0;bottom:14%;overflow:hidden;-webkit-mask-image:linear-gradient(transparent,#000 8%,#000 88%,transparent);mask-image:linear-gradient(transparent,#000 8%,#000 88%,transparent)}'+
'#edg .er{position:absolute;left:0;right:0;top:0;text-align:center;will-change:transform}'+
'#edg .er p{margin:0;padding:0 16px;line-height:1.6;text-shadow:2px 2px 0 #000}'+
'#edg .er .t{font-size:34px;color:#ffd400;letter-spacing:4px;margin:6px 0}'+
'#edg .er .h{font-size:13px;color:#b8a8ff;letter-spacing:2px;margin-top:4px}'+
'#edg .er .n{font-size:18px;color:#fff}'+
'#edg .er .s{font-size:13px;color:#cfd3ff}'+
'#edg .eb{position:absolute;left:50%;bottom:calc(28px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);font:inherit;font-size:18px;color:#2a1000;background:linear-gradient(#ffe56a,#e0a800);border:0;padding:12px 28px;box-shadow:inset 2px 2px 0 #fff6b0,inset -2px -2px 0 #a87500,0 0 0 3px #000,0 4px 0 3px #000;display:none}'+
'#edg .ek{position:absolute;right:10px;top:calc(10px + env(safe-area-inset-top,0px));font:inherit;font-size:11px;color:#cfd3ff;background:#1b1348;border:2px solid #4a3aa8;padding:3px 10px}'+
'#edg .ew{position:absolute;left:0;right:0;bottom:calc(84px + env(safe-area-inset-bottom,0px));text-align:center;font-size:14px;color:#7ff3ff;text-shadow:2px 2px 0 #000;display:none}';
(document.head||document.body).appendChild(s)}catch(e){}})();
function endOpen(){if(END.on)return;
  const first=END.n===0;END.n++;endSave();
  let el=$('edg');if(!el){el=document.createElement('div');el.id='edg';
    el.innerHTML='<canvas id="edgc" width="180" height="320"></canvas><div class="ev" id="edgv"><div class="er" id="edgr"></div></div><div class="ew" id="edgw"></div><button type="button" class="ek" id="edgk">早送り</button><button type="button" class="eb" id="edgb">2周目へ</button>';
    document.body.appendChild(el);
    try{el.addEventListener('click',ev=>{try{const id=ev&&ev.target&&ev.target.id;if(id==='edgb'){endClose();return}if(END.on)END.on.fast=END.on.fast>1?1:4}catch(x){}})}catch(x){}}
  const rows=[...ENDL,...endAreas(),...ENDL2];
  $('edgr').innerHTML=rows.map(r=>r[0]?'<p class="'+r[1]+'"'+(r[2]?' style="color:'+r[2]+'"':'')+'>'+r[0]+'</p>':'<p>&nbsp;</p>').join('');
  $('edgb').style.display='none';$('edgw').style.display='none';
  let rm=false;try{rm=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){}
  END.on={t:0,fast:1,first,done:0,rm,orb:[...Array(8)].map((_,i)=>({a:i*Math.PI/4,c:(endAreas()[i]||[0,0,'#fff'])[2]}))};
  el.style.display='block';
  try{const c=$('edgc'),vw=el.clientWidth||393,vh=el.clientHeight||852;c.width=180;c.height=Math.max(240,Math.round(180*vh/vw))}catch(e){}   // 画面の縦横比に合わせる(ドットが伸びない)
  if(first){try{if(typeof resGem==='function')resGem(10)}catch(e){}}
  endSnd(0)}
function endClose(){if(!END.on)return;END.on=null;const el=$('edg');if(el)el.style.display='none';
  try{fxToast('2周目の旅へ! 虚無はまた芽吹く…','#ffd400')}catch(e){}}
function endSnd(k){try{if(typeof sOK!=='function'||!sOK())return;const t=sNow();
  if(k==0){[523,659,784,1047].forEach((f,i)=>tone(f,t+i*.18,.3,'square',.035));tone(131,t,1.2,'triangle',.05)}
  else{[784,988,1175,1568,1175,1568].forEach((f,i)=>tone(f,t+i*.12,.22,'square',.035));tone(196,t,1.4,'triangle',.05)}}catch(e){}}
FU.push(dt=>{const E=END.on;if(!E)return;E.t+=dt*E.fast;
  const el=$('edg'),r=$('edgr');if(!el||!r)return;
  const H=($('edgv')&&$('edgv').clientHeight)||el.clientHeight||640,RH=r.scrollHeight||900,SP=38;   // 1秒に38px 流れる
  const y=H-E.t*SP;r.style.transform='translateY('+Math.round(y)+'px)';
  if(y<-RH+H*.35&&!E.done){E.done=1;$('edgb').style.display='block';if(E.first){const w=$('edgw');w.style.display='block';w.innerHTML='はじめてのエンディング!  '+(typeof resIcon==='function'?resIcon('gem'):'宝石')+' 10 獲得';}endSnd(1)}
  if(E.t>Math.max(45,(RH+H)/SP+8))endClose();
  endDraw(E)});
/* 背景: 星空 + 光の玉が8方向へ飛んでいく + 地面を3人が歩く(180x320 のドット絵キャンバスを全画面に引き伸ばす) */
function endDraw(E){const cv=$('edgc');if(!cv||!cv.getContext)return;const x=cv.getContext('2d');if(!x)return;const W=180,Hh=cv.height||320,t=E.t,GY=Hh-38,CY=Math.round(GY*.45);
  x.fillStyle='#05030f';x.fillRect(0,0,W,Hh);
  for(let i=0;i<60;i++){const sx=(i*53)%W,sy=(i*97+Math.floor(t*(4+i%3)))%Hh;x.fillStyle=i%7?'#3a3470':'#cfd3ff';x.fillRect(sx,sy,1,1)}
  const n=E.rm?8:24;
  for(let i=0;i<E.orb.length;i++){const o=E.orb[i],p=Math.min(1,Math.max(0,(t-1-i*.4)/6));if(p<=0)continue;
    const cx=W/2,cy=CY,d=p*110,ox=cx+Math.cos(o.a)*d,oy=cy+Math.sin(o.a)*d*.8;
    for(let k=0;k<(E.rm?1:3);k++){const q=Math.max(0,p-k*.04);x.globalAlpha=(1-k*.3)*(1-p*.6);x.fillStyle=o.c;x.fillRect(Math.round(cx+Math.cos(o.a)*q*110)-2,Math.round(cy+Math.sin(o.a)*q*88)-2,5-k,5-k)}
    x.globalAlpha=1;x.fillStyle='#fff';x.fillRect(Math.round(ox)-1,Math.round(oy)-1,2,2)}
  if(!E.rm)for(let i=0;i<n;i++){const a=i*2.4+t*.3,rr=(t*12+i*9)%90;x.globalAlpha=Math.max(0,1-rr/90);x.fillStyle=i%2?'#ffd400':'#7ff3ff';x.fillRect(Math.round(W/2+Math.cos(a)*rr),Math.round(CY+Math.sin(a)*rr*.8),1,1)}
  x.globalAlpha=1;
  x.fillStyle='#14102e';x.fillRect(0,GY,W,38);x.fillStyle='#2a2060';x.fillRect(0,GY,W,2);
  for(let i=0;i<3;i++){const s=SPR['h'+i+(Math.floor(t*4+i)%2?'b':'')]||SPR['h'+i];if(!s)continue;x.imageSmoothingEnabled=false;
    const hx2=((t*14+i*26)%(W+40))-30;x.drawImage(s,Math.round(hx2),GY-20,24,24)}}
try{if(typeof AC_!=='undefined')AC_.push(['end1','虚無を払う者','エンディングを見る',6,()=>END.n>=1,[()=>END.n,1]])}catch(e){}
