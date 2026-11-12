/* ---------- 軽いストーリー(会話シーン) (feature) ----------
   3人の英雄(剣士ホムラ/魔法使いシズク/弓使いコハク。すべてオリジナル)が、世界の「運」を吸い込む虚無の王(魔王)ニヒラを目指して旅をする。
   ・エリア(98h-area)に入った時/エリアの主を倒した時/初めての JACKPOT/初めての転生 に 2〜4行の会話を戦闘画面の上に出す。
   ・操作は止めない(盤面・強化・メニューはそのまま触れる)。パネルをタップで早送り(文字送り→次の行)、放置なら1行約3秒で自動で進んで閉じる。「とばす」で即終了。
   ・演出中は待つ(89c-layer の交通整理に合わせる): JACKPOT/押せ!!/全画面ルーレット/ミニゲーム/カットイン/エリアのタイトル帯・大爆発/メニュー表示中は出さない。
     出ている途中でそれらが始まったら隠して時間を止め、終わったら続きから。
   ・シーンはその場で見るだけ(読み返しのタブは作り手の希望で出さない)。
   ・進行は localStorage['pachi2_tut'](98t-tutorial と共用: s=見たシーン / g=見たガイド / skip=序盤ガイドを飛ばした / off=新機能ガイドOFF)。
     キーが無く、すでに進んでいるセーブ(STAGE/最高記録/転生/強化)は「旧セーブ」として、通過済みのシーンを既読(読み返せる)にして出さない。
   ・Math.random は使わない(sim/テストの乱数列を変えない)。ロード時は 98h の AREAS / 91 の X・FM / 29c の FMGRP にだけ依存。
   フック: 他ファイルの編集なし(kill/update をラップ、読み返しタブは出さない)。 */
const TS_KEY='pachi2_tut';
const TS={v:1,s:{},g:{},skip:0,off:0,old:0};
let TS_NEW=false;   // このロードで初めて作った(98t が旧セーブ判定に使う)
try{const j=JSON.parse(localStorage.getItem(TS_KEY)||'null');
  if(j&&typeof j==='object'){for(const k of ['s','g'])if(j[k]&&typeof j[k]==='object')for(const q in j[k])if(j[k][q]&&/^[a-z0-9_]{1,12}$/.test(q))TS[k][q]=1;
    TS.skip=j.skip?1:0;TS.off=j.off?1:0;TS.old=j.old?1:0}
  else TS_NEW=true}catch(e){TS_NEW=true}
function tsSave(){try{localStorage.setItem(TS_KEY,JSON.stringify(TS))}catch(e){}}
const tsOldSave=()=>{try{return G.stage>1||X.best>1||X.pres>0||(G.lv||[]).some(v=>v>1)}catch(e){return false}};

/* ===== 登場人物 ===== */
/* 性格・口調・色は docs/STORY.md が正(口調は tests/story.js が確かめる) */
const STH=[{n:'ホムラ',r:'剣士',c:'#ff7a5a'},{n:'シズク',r:'魔法使い',c:'#d29aff'},{n:'コハク',r:'弓使い',c:'#7dff9a'}];
/* ===== シーン: who 0/1/2=英雄 8=敵(シーンの e=スプライト en=名前) 9=ナレーション ===== */
const STA=n=>(typeof AREAS!=='undefined'&&AREAS[n])?AREAS[n].g:'';
const SCN=[
{id:'a0',t:'旅立ち',h:'はじめから',L:[[9,'世界から「運」が、少しずつ消えている――'],[0,'虚無の王ニヒラのしわざだって? だったら殴りに行くまでだ!'],[1,'まずはこの草原を抜けないとね。運の玉、ちゃんと集めてよ'],[2,'玉が光るほど僕らは強くなる。さあ、出発だ!']]},
{id:'b0',t:'森の主',h:'STAGE 25',e:'b4',ei:0,L:[[8,'森が…静かに…なる…'],[2,'森の主も操られてたんだ。黒いもやが抜けていく'],[0,'よし、次は砂漠だ!']]},
{id:'a1',t:'灼熱の砂漠',h:'STAGE 26',L:[[0,'あっつ…! 鎧の中が鉄板焼きだ'],[2,'砂の下に何かいる。足音が大きすぎる'],[1,'砂塵の大蠍…この砂漠の主ね。油断しないで']]},
{id:'b1',t:'大蠍の毒',h:'STAGE 50',e:'b5',ei:1,L:[[8,'ギ…ギギ…'],[1,'毒はぎりぎりで解呪できたわ'],[0,'助かった。…え、俺、刺されてたの?']]},
{id:'a2',t:'白銀の氷原',h:'STAGE 51',L:[[1,'息が白い。魔力まで凍りそう'],[0,'動けば温まる! 片っ端から倒すぞ!'],[2,'…砂漠では「暑い」って、ずっと文句言ってたのにね']]},
{id:'b2',t:'氷の中の花',h:'STAGE 75',e:'b6',ei:2,L:[[2,'氷が溶けて…中から花が出てきた'],[1,'呪いが解けた証ね。この先はもっと熱いわよ']]},
{id:'a3',t:'紅蓮の火山',h:'STAGE 76',L:[[2,'地面が赤く光ってる。矢じりが溶けそうだ'],[1,'溶岩魔人ヴォルガン。ニヒラに力を与えられた魔物よ'],[0,'熱いのは大当たりだけで十分だぜ!']]},
{id:'b3',t:'奪われた光',h:'STAGE 100',e:'b7',ei:3,L:[[8,'ニヒラ様…の…光が…'],[0,'光? あいつは運を消してるんじゃないのか?'],[1,'消したんじゃなくて…奪った運の光を、ため込んでいるのかも']]},
{id:'a4',t:'冥府の魔界',h:'STAGE 101',e:'b8',ei:4,L:[[9,'空が裏返り、星が消えた'],[8,'人間ども…ニヒラ様の元へは行かせぬ'],[1,'ここから先は魔王の領地。運の光がほとんど無い'],[0,'なら俺たちが光らせればいい。777でな!']]},
{id:'b4',t:'魔将の最期',h:'STAGE 125',e:'b8',ei:4,L:[[8,'見事…だが王は、我より遥かに深い闇…'],[2,'魔将を倒した。いよいよ空の上だ']]},
{id:'a5',t:'天空の聖域',h:'STAGE 126',L:[[2,'雲の上に神殿が…! 空気がおいしい'],[1,'天翼の守護神セレスティア。昔は人の味方だったはず'],[0,'目を覚まさせてやろうぜ。手加減してな']]},
{id:'b5',t:'守護神の羽根',h:'STAGE 150',e:'b9',ei:5,L:[[8,'ありがとう、小さき勇者たち。光を…取り戻して'],[1,'守護神の羽根をもらったわ。これで星の海へ行ける!']]},
{id:'a6',t:'星降る宙域',h:'STAGE 151',L:[[1,'足場が無いのに立ててる…魔法? いいえ、運の力ね'],[2,'星を食べる騎士がいるって。星が減ってるのはそのせいか'],[0,'星の騎士でも何でも来い! あと少しだ!']]},
{id:'b6',t:'星の返還',h:'STAGE 175',e:'b10',ei:6,L:[[8,'食べた星々は返そう…王を、止めてくれ'],[0,'任せとけ。次で最後だ!']]},
{id:'a7',t:'終焉の虚空',h:'STAGE 176',e:'b11',ei:7,L:[[9,'音も色もない、終わりの場所'],[8,'運など幻。すべては無に還る'],[0,'幻かどうか、この一撃で確かめな!'],[2,'3人で行くよ!']]},
{id:'b7',t:'虚無の王、倒れる',h:'STAGE 200',e:'b11',ei:7,L:[[8,'なぜだ…なぜ運は尽きぬ…'],[1,'あなたがため込んだ分、私たちは当て続けたのよ'],[0,'大当たりは、何度でも来るんだぜ!'],[8,'ため込んだ光が…あふれる…!']]},   /* 続きは完全版の最終章(98y-finale の f1 とエンディング) */
{id:'jp',t:'伝説の777',h:'はじめての JACKPOT',L:[[2,'いま…777がそろった!?'],[1,'伝説の大当たり…運の光があふれてる!'],[0,'この調子で魔王まで一直線だ!']]},
{id:'p1',t:'時の魔法',h:'はじめての転生',L:[[1,'時の魔法で、旅の始まりに戻ったわ'],[2,'でも魂の力は残ってる。前より体が軽い!'],[0,'何度でもやり直して、もっと先へ行こうぜ!']]}];
const scnOf=id=>SCN.find(s=>s.id===id);

/* 旧セーブ: 通過済みのシーンを既読に(出さない) */
if(TS_NEW&&tsOldSave()){TS.old=1;TS.skip=1;try{const b=Math.max(X.best,G.stage),ai=Math.floor((b-1)/25);
  for(let a=0;a<8;a++){if(a<=ai)TS.s['a'+a]=1;if(b>25*(a+1))TS.s['b'+a]=1}
  if(X.pres>0)TS.s.p1=1;if(X.st&&X.st.jp>0)TS.s.jp=1}catch(e){}tsSave()}

/* ===== 状態 ===== */
const STY={q:[],cur:null,el:null,hold:0,gen:0,view:null,area:-1,lastClose:-9};
function styQueue(id){if(!id||TS.s[id]||STY.q.indexOf(id)>=0||(STY.cur&&STY.cur.id===id)||STY.q.length>=6||!scnOf(id))return false;STY.q.push(id);return true}
const styDisp=id=>{try{const e=$(id);return !!(e&&e.style&&e.style.display==='flex')}catch(e){return false}};
/* 演出中かどうか(89c-layer と同じ基準 + エリアのタイトル帯/大爆発 + メニュー) */
function styBusy(){try{
  if(!run)return true;if(typeof fxOpen!=='undefined'&&fxOpen)return true;
  if(typeof lyBig==='function'?lyBig():(G.jp>0||(typeof PUSH!=='undefined'&&PUSH)||(typeof RL!=='undefined'&&RL)))return true;
  if(typeof lyBusyB==='function'?lyBusyB():(typeof cut!=='undefined'&&cut))return true;
  if(styDisp('rl')||styDisp('mg')||styDisp('fxg'))return true;
  if(typeof MG!=='undefined'&&MG)return true;
  if(typeof AR!=='undefined'&&(AR.title||AR.pend||AR.boom))return true;
  return false}catch(e){return true}}

/* ===== 見た目 ===== */
(function(){try{const s=document.createElement('style');s.textContent=
'#sty{position:fixed;left:0;top:0;width:360px;z-index:8;display:none;transform-origin:0 0;pointer-events:auto;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}'+
'#sty .sb{position:relative;margin:0;min-height:74px;background:rgba(8,5,26,.93);box-shadow:0 0 0 2px #000,inset 0 0 0 2px #b88a00,inset 0 0 0 3px #000,0 4px 0 #000;padding:7px 8px 7px 72px;display:flex;flex-direction:column;justify-content:center;animation:styIn .22s ease-out}'+
'#sty.nar .sb{padding-left:14px;text-align:center}#sty.nar .sbN{display:none}#sty.nar canvas{display:none}'+
'#sty canvas{position:absolute;left:8px;top:50%;margin-top:-28px;width:56px;height:56px;image-rendering:pixelated;background:#140e3a;box-shadow:0 0 0 2px #000,inset 0 0 0 1px #4a3aa8}'+
'#sty .sbN{font-size:12px;letter-spacing:1px;margin-bottom:3px;text-shadow:1px 1px 0 #000}#sty .sbN small{font-size:10px;opacity:.75;margin-left:5px;color:#fff}'+
'#sty .sbT{font-size:14px;line-height:1.45;color:#fff;text-shadow:1px 1px 0 #000;min-height:20px;word-break:break-all}#sty.nar .sbT{color:#ffe9a0;font-size:14px}'+
'#sty .sbX{position:absolute;right:4px;top:3px;font:inherit;font-size:10px;color:#cfd3ff;background:#1b1348;border:2px solid #4a3aa8;padding:1px 6px;line-height:14px}'+
'#sty .sbP{position:absolute;right:8px;bottom:4px;font-size:10px;color:#ffd400;opacity:.85}'+
'#sty .sbH{position:absolute;right:10px;top:-14px;font-size:10px;color:#ffd400;background:#000;padding:0 6px;letter-spacing:1px;line-height:14px}'+
'@keyframes styIn{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:none}}'+
'@media (prefers-reduced-motion:reduce){#sty .sb{animation:none}}'+
'.styL{text-align:left;font-size:12px;line-height:1.5}.styL .r{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:6px 2px;border-bottom:1px dotted #4a3aa8}'+
'.styL .styR b{color:#ffd400;font-weight:normal}.styL .styR.no{opacity:.5}.styL .styR button{font:inherit;font-size:11px;background:#1b1348;color:#fff;border:2px solid #4a3aa8;padding:3px 8px}'+
'.styL .tx{padding:4px 6px 8px;background:#0b0a24;border-bottom:1px dotted #4a3aa8}.styL .tx p{margin:3px 0}.styL .tx i{font-style:normal;margin-right:4px}';
(document.head||document.body).appendChild(s)}catch(e){}})();
function styEl(){if(STY.el)return STY.el;const e=document.createElement('div');e.id='sty';
  e.innerHTML='<div class="sb"><i class="sbH" id="styH"></i><canvas id="styC" width="56" height="56"></canvas><div class="sbN" id="styN"></div><div class="sbT" id="styT"></div><button type="button" class="sbX" id="styX">とばす</button><i class="sbP" id="styP"></i></div>';
  document.body.appendChild(e);STY.el=e;
  try{e.addEventListener('click',ev=>{try{if(ev&&ev.target&&ev.target.id==='styX'){styClose();return}styTap()}catch(x){}})}catch(x){}
  return e}
/* 戦闘画面(#b)の下寄りに重ねる。#app の拡大率に合わせて 360px 基準の箱を scale する */
function styPlace(){const e=STY.el;if(!e)return;try{const r=$('b').getBoundingClientRect();if(!r||!(r.width>0))return;const k=r.width/360;
  e.style.transform='scale('+k.toFixed(4)+')';e.style.left=Math.round(r.left)+'px';e.style.top=Math.round(r.top+r.height-84*k)+'px'}catch(x){}}
/* 顔の絵: 作り手のイラスト(PIMG)→ コード描画の胸像(PORT)→ 戦闘のドット絵(SPR) の順に試す */
function styFace(cv,who,sc){try{const x=cv.getContext('2d');if(!x)return;x.clearRect(0,0,56,56);
  if(who===8){const s=SPR[sc&&sc.e];if(s){x.imageSmoothingEnabled=false;const m=Math.min(56/s.width,56/s.height);x.drawImage(s,(56-s.width*m)/2,(56-s.height*m)/2,s.width*m,s.height*m)}return}
  if(who<0||who>2)return;
  const im=typeof PIMGI!=='undefined'?PIMGI['hero'+who]:null;
  if(im&&im.width){const f=(typeof PIMGF!=='undefined'&&PIMGF['hero'+who])||[.5,.4],s=Math.min(im.width,im.height)*.42,cx=Math.max(s/2,Math.min(im.width-s/2,f[0]*im.width)),cy=Math.max(s/2,Math.min(im.height-s/2,f[1]*im.height));
    x.imageSmoothingEnabled=true;x.drawImage(im,cx-s/2,cy-s/2,s,s,0,0,56,56);x.imageSmoothingEnabled=false;return}
  const P=typeof PORT==='function'?PORT(who):null;x.imageSmoothingEnabled=false;
  if(P){x.drawImage(P,12,8,40,40,0,0,56,56);return}
  const s=SPR['h'+who];if(s)x.drawImage(s,4,4,48,48)}catch(e){}}

/* ===== 再生 ===== */
function styLineDur(t){return Math.min(4.2,Math.max(2.4,1.1+String(t).length*.075))}
function styStart(id){const sc=scnOf(id);if(!sc)return false;TS.s[id]=1;tsSave();STY.gen++;
  STY.cur={id,sc,i:-1,t:0,ch:0,dur:0,shown:false};styNext();return true}
function styNext(){const C=STY.cur;if(!C)return;C.i++;if(C.i>=C.sc.L.length){styClose();return}
  const L=C.sc.L[C.i];C.t=0;C.ch=0;C.dur=styLineDur(L[1]);C.drawn=-1;styRender(true)}
function styRender(full){const C=STY.cur;if(!C)return;const e=styEl(),L=C.sc.L[C.i],w=L[0];
  if(full){e.className=w===9?'nar':'';
    const nm=w===8?(C.sc.en||STA(C.sc.ei)||'???'):w===9?'':STH[w].n,role=w===8?'':w===9?'':STH[w].r,col=w===8?'#ff6a8a':w===9?'#ffe9a0':STH[w].c;
    try{const N=$('styN');N.innerHTML=nm+(role?'<small>'+role+'</small>':'');N.style.color=col;$('styH').textContent=C.sc.t;$('styP').textContent=(C.i+1)+'/'+C.sc.L.length+(C.i+1<C.sc.L.length?' ▼':'')}catch(x){}
    styFace($('styC'),w,C.sc)}
  const n=Math.min(L[1].length,Math.floor(C.ch));if(n!==C.drawn){C.drawn=n;try{$('styT').textContent=L[1].slice(0,n)}catch(x){}}}
function styTap(){const C=STY.cur;if(!C)return;const L=C.sc.L[C.i];if(C.ch<L[1].length){C.ch=L[1].length;styRender(false);C.t=Math.max(C.t,C.dur-1.2)}else styNext()}
function styClose(){STY.cur=null;STY.lastClose=T;if(STY.el)STY.el.style.display='none'}
function styShow(v){const e=styEl();const d=v?'block':'none';if(e.style.display!==d){e.style.display=d;if(v)styPlace()}}
function styUpd(dt){
  /* エリアに入った(起動/到達/転生/祭壇の開始ステージ): その周回のエリアのシーン */
  try{if(run){const ai=Math.floor((G.stage-1)/25);if(ai!==STY.area){STY.area=ai;if(ai<8)styQueue('a'+ai)}
    if(X.st&&X.st.jp>0)styQueue('jp');if(X.pres>0)styQueue('p1')}}catch(e){}
  const C=STY.cur;
  if(C){if(styBusy()){styShow(false);return}
    styShow(true);STY.hold+=dt;if(STY.hold>.5){STY.hold=0;styPlace()}
    C.t+=dt;C.ch+=dt*26;styRender(false);if(C.t>=C.dur)styNext();return}
  if(!STY.q.length||styBusy()||T-STY.lastClose<.8)return;
  if(typeof TUT!=='undefined'&&TUT.cur)return;   // ガイドの吹き出しが出ている間は待つ(短い)
  styStart(STY.q.shift())}
/* エリアの主を倒した → そのエリアの「撃破」シーン(大爆発/AREA CLEAR!! のあと) */
{const _k=kill;kill=function(){let s0=0,g=false;try{s0=G.stage;g=isBoss()&&s0%25==0}catch(e){}const r=_k.apply(this,arguments);
  try{if(g&&run&&G.stage>s0){const a=Math.floor((s0-1)/25);if(a<8){styQueue('b'+a);/* 撃破シーンを次のエリアの登場より先に */const i=STY.q.indexOf('b'+a);if(i>0){STY.q.splice(i,1);STY.q.unshift('b'+a)}}}}catch(e){}return r}}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{styUpd(dt)}catch(e){if(typeof FERR!=='undefined')FERR++}return r}}

/* ===== 読み返し画面(現在は未使用) ===== */
function styView(id){STY.view=STY.view===id?null:id;try{fxMenu()}catch(e){}}
function styReplay(id){const sc=scnOf(id);if(!sc||!TS.s[id])return;try{fxClose()}catch(e){}STY.q=STY.q.filter(q=>q!==id);STY.cur=null;STY.gen++;STY.cur={id,sc,i:-1,t:0,ch:0,dur:0};styNext()}
function styMenu(){const n=SCN.filter(s=>TS.s[s.id]).length;
  const who=w=>w===9?'<i style="color:#ffe9a0">――</i>':w===8?'<i style="color:#ff6a8a">敵</i>':'<i style="color:'+STH[w].c+'">'+STH[w].n+'</i>';
  return '<div class="fxh">物語 '+n+'/'+SCN.length+'</div><div class="fxs">剣士ホムラ・魔法使いシズク・弓使いコハクの3人が、世界の運を吸い込む虚無の王ニヒラを目指す旅。見た場面をここで読み返せます。</div><div class="styL">'+
  SCN.map(s=>{const ok=!!TS.s[s.id];if(!ok)return '<div class="styR no"><span>??? <small>('+s.h+')</small></span></div>';
    const op=STY.view===s.id;return '<div class="styR"><span><b>'+s.t+'</b> <small style="opacity:.7">'+s.h+'</small></span><span><button type="button" onclick="styView(\''+s.id+'\')">'+(op?'とじる':'読む')+'</button> <button type="button" onclick="styReplay(\''+s.id+'\')">再生</button></span></div>'+
      (op?'<div class="tx">'+s.L.map(l=>'<p>'+(l[0]===8?'<i style="color:#ff6a8a">'+(s.en||STA(s.ei))+'</i>':who(l[0]))+l[1]+'</p>').join('')+'</div>':'')}).join('')+'</div>'}
// 読み返し画面(物語タブ)は作り手の希望で出さない。styMenu は残す(将来使う時用)
