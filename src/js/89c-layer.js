/* ---------- 演出の交通整理 (fx) ----------
   演出どうしが同時に起きた時に重なって読めなくなるのを防ぐ。当否・確率・報酬・タイミングの判定は変えない(見せ方の順番/位置だけ)。
   表示の優先順位(上ほど優先):
     1) 押せ!! / 全画面ルーレット / JACKPOT(前置きアニメ・パネル)   … 画面の主役。ほかは待つか退く
     2) カットイン                                                    … 1秒。RUSHリザルト・ボーナスタイムの帯はその間かくす
     3) RUSHリザルト / 擬似連の NEXT                                 … NEXT は今の回転なのでリザルトより上に描く
     4) ボーナスタイムの帯 / ミニルーレット / コンボ                   … 常駐系。主役の間は引っ込む・位置をずらす
   ・バナー(#bn): 全画面パネル(ルーレット/ミニゲーム)や強化シートが開いている時は戦闘画面の上へ小さめに移す(パネルの題字に重ねない)。
     熱いバナー(激アツ/擬似連/大当たり/JACKPOT 等)が出た直後(1.0秒)の普通のバナーは、消える頃まで待たせる(上書きで消さない)。
   ・ミニゲーム(mini): JACKPOT 演出・押せ!!・全画面ルーレット中に呼ばれたら、終わってから始める(遊べる回数・報酬は同じ)。
   ・ミニルーレット(戦闘画面): 左上の敵名/コンボと重なっていたので左上角へ。回っている間はコンボと敵名を右へずらす。
   ・ピークの手応え: JACKPOT の合計確定・RUSHリザルトの金額確定/ランク・超倍率の瞬間に、その場所だけの衝撃リング(全画面の点滅ではない)と
     ごく短いヒットストップ。光の演出設定 OFF / prefers-reduced-motion では線を減らす。
   ほかのファイルの関数は「名前で呼ばれている所」を包むだけ(本体は変更しない)。ラップの一部は起動後の最初の update で入れる(後のファイルより外側にするため)。 */
const LY={init:0,bnQ:[],bnHot:-9,bnLast:-9,miniQ:0,miniG:0,ox:0,imp:[],rrHide:0,jpSt:0,rrSt:0,up:0};
const LY_HOT=/激アツ|擬似連|復活|JACKPOT|超倍率|確定|確変|連チャン|大当たり|LEGEND|RECORD|777|EXCELLENT|PREMIUM/;
function lyDisp(id){try{const e=$(id);return !!(e&&e.style&&e.style.display==='flex')}catch(e){return false}}
// 全画面パネル(ルーレット/ミニゲーム)か強化シートが開いているか
function lyPanel(){try{if(lyDisp('rl')||lyDisp('mg')||lyDisp('fxg'))return true;const a=$('app');return !!(a&&a.classList&&a.classList.contains('upo'))}catch(e){return false}}
// 画面の主役が出ているか(ミニゲームを待たせる条件)
function lyBig(){return !!(G.jp>0||(typeof JPX!=='undefined'&&JPX.p)||(typeof HEV!=='undefined'&&HEV.jr)||(typeof RL!=='undefined'&&RL)||(typeof PUSH!=='undefined'&&PUSH))}
// 戦闘画面を占有する演出(常駐系の表示を引っ込める条件)
function lyBusyB(){return !!((typeof cut!=='undefined'&&cut)||(typeof HEV!=='undefined'&&HEV.jr)||G.jp>0)}
function lyFl(){return typeof UX!=='undefined'&&UX.S?UX.S.fl:2}
function lyRM(){return typeof FXRM!=='undefined'&&FXRM}
// 敵名(35 drawHP)の x オフセット(ミニルーレット中)
function lyNameX(){return Math.round(LY.ox)}

/* --- バナーの位置と優先度 --- */
// 位置(文字の中心 c): 戦闘画面の下寄り。34px の時 文字(押し出し込み)は top+2〜top+52 に出るので top=c-24。パネルの枠(外側の影 約8px)にかからないよう c はパネル上端-38 まで(戦闘画面の上半分は擬似連の NEXT 等のキャンバス文字があるので避ける)。
function lyPanelTop(){let y=1e9;try{const q=document.querySelector;if(!q)return y;for(const s of ['#rl .rb','#mg .rb','#fxg .rb','#sheet']){const e=document.querySelector(s);if(!e)continue;const id=s.slice(1,s.indexOf(' ')>0?s.indexOf(' '):s.length);
  const vis=id==='sheet'?lyPanel():lyDisp(id);if(!vis)continue;const r=e.getBoundingClientRect();if(r&&r.height>0)y=Math.min(y,r.top)}}catch(e){}return y}
function lyBnPlace(){try{const b=$('bn');if(!b||!b.style)return;
  if(lyPanel()){let top=null;try{const r=$('b').getBoundingClientRect();if(r&&r.height>0){const c=Math.min(r.top+r.height*.74,lyPanelTop()-38);top=Math.max(4,Math.round(c-24))}}catch(e){}
    b.style.top=top!=null?top+'px':'14%';if(b.className.indexOf('bup')<0)b.className+=' bup'}
  else{b.style.top='';b.className=b.className.replace(/\s*bup/g,'')}}catch(e){}}
function lyBanner(o,t,c){const hot=LY_HOT.test(String(t));
  if(!hot&&T-LY.bnHot<1.0&&LY.bnQ.length<2){LY.bnQ.push({t,c,q:T,g:typeof PGEN!=='undefined'?PGEN:0});return}
  if(hot)LY.bnHot=T;LY.bnLast=T;const r=o(t,c);lyBnPlace();return r}
function lyBnUpd(){if(!LY.bnQ.length)return;if(T-LY.bnHot<1.0)return;const b=LY.bnQ.shift();if(T-b.q>4||(typeof PGEN!=='undefined'&&PGEN!==b.g))return;LY.bnLast=T;try{banner(b.t,b.c)}catch(e){}}

/* --- 衝撃リング(局所。全画面の点滅はしない) --- */
function lyImpact(cv,x,y,c,big){if(LY.imp.length>=6)LY.imp.shift();LY.imp.push({cv,x,y,c:c||'#ffd400',big:!!big,t0:T})}
function lyImpDraw(cv,t){const ctx=cv=='p'?(typeof pc!=='undefined'?pc:null):bc;if(!ctx)return;const lite=lyFl()<=0||lyRM();
  for(let i=LY.imp.length-1;i>=0;i--){const I=LY.imp[i];if(I.cv!==cv)continue;const p=(t-I.t0)/(I.big?.42:.32);if(p>=1||p<0){if(p>=1)LY.imp.splice(i,1);continue}
    const e=1-Math.pow(1-p,3),R=(I.big?14:10)+e*(I.big?58:38),a=(1-p)*(lite?.5:.9);ctx.save();ctx.globalAlpha=a;ctx.fillStyle=I.c;
    // ドット調のリング(16点の四角)
    const n=I.big?20:16,s=I.big?4:3;for(let k=0;k<n;k++){const an=k/n*TAU;ctx.fillRect(Math.round(I.x+Math.cos(an)*R-s/2),Math.round(I.y+Math.sin(an)*R*.8-s/2),s,s)}
    // 集中線(外へ伸びる細い線)
    if(!lite){ctx.fillStyle='#fff';const m=I.big?12:8;for(let k=0;k<m;k++){const an=k/m*TAU+.2,r0=R*.55,r1=R*.55+(I.big?22:14)*(1-p);for(let q=r0;q<r1;q+=3)ctx.fillRect(Math.round(I.x+Math.cos(an)*q),Math.round(I.y+Math.sin(an)*q*.8),2,2)}}
    ctx.restore()}}
function lyStop(s){try{if(typeof HS!=='undefined')HS=Math.max(HS,s)}catch(e){}}

/* --- 毎フレームの監視(update の後) --- */
function lyUpd(dt){
  // バナー: パネルの開閉に追従
  LY.up+=dt;if(LY.up>.1){LY.up=0;try{const b=$('bn');if(b&&b.className&&b.className.indexOf('on')>=0){const want=lyPanel(),has=b.className.indexOf('bup')>=0;if(want!==has)lyBnPlace()}}catch(e){}}
  lyBnUpd();
  // 待たせたミニゲームを開始
  if(LY.miniQ&&!lyBig()){if(typeof PGEN!=='undefined'&&PGEN!==LY.miniG)LY.miniQ=0;else if(run){LY.miniQ=0;try{mini()}catch(e){}}}
  // ミニルーレット中はコンボ/敵名を右へ
  const tgt=typeof HEV!=='undefined'&&HEV.mr?52:0;LY.ox+=(tgt-LY.ox)*Math.min(1,dt*10);if(Math.abs(tgt-LY.ox)<.5)LY.ox=tgt;
  // RUSHリザルト: カットイン/JACKPOT前置きが出たら、数え終わり前ならかくすだけ、数え終わっていたら下げる
  if(typeof GK!=='undefined'&&GK.rr){const R=GK.rr,p=T-R.t0,cov=(typeof cut!=='undefined'&&cut)||(typeof HEV!=='undefined'&&HEV.jr);
    if(cov){if(p>1.3&&!R.lyK){GK.rr=null;LY.rrHide=0}else{LY.rrHide=1;R.lyK=1}}else LY.rrHide=0;
    const R2=GK.rr;if(R2){if(R2!==LY.rrR){LY.rrR=R2;LY.rrSt=0}
      if(p>=1.2&&LY.rrSt<1){LY.rrSt=1;if(!LY.rrHide)lyImpact('b',140,110,'#fff3a0',0)}
      if(p>=1.25&&LY.rrSt<2){LY.rrSt=2;if(!LY.rrHide&&R2.gr&&(R2.gr[0]=='S'||R2.gr=='A+')){lyImpact('b',306,90,'#ffd400',1);lyStop(.08)}}}}else LY.rrHide=0;
  // JACKPOT パネル: 合計が確定した瞬間
  if(typeof JPX!=='undefined'&&JPX.p){const P=JPX.p;if(P!==LY.jpP){LY.jpP=P;LY.jpSt=0}if(T-P.t0>=3.4&&!LY.jpSt){LY.jpSt=1;lyImpact('p',262,232,'#ffd400',1);lyStop(.12)}}}

/* --- 起動後に1回: 後のファイルより外側でラップする --- */
function lyInit(){if(LY.init)return;LY.init=1;
  try{const o=banner;banner=function(t,c){try{return lyBanner(o,t,c)}catch(e){return o.apply(this,arguments)}}}catch(e){}
  try{const o=mini;mini=function(){try{if(lyBig()){LY.miniQ=1;LY.miniG=typeof PGEN!=='undefined'?PGEN:0;return}}catch(e){}return o.apply(this,arguments)}}catch(e){}
  try{const o=drawB;drawB=function(t){const r=o.apply(this,arguments);try{if(LY.cmbD){LY.cmbD=0;if(LY.dc)LY.dc(t)}lyImpDraw('b',t)}catch(e){LY.imp.length=0}return r}}catch(e){}
  try{const o=drawP;drawP=function(t){const r=o.apply(this,arguments);try{lyImpDraw('p',t)}catch(e){LY.imp.length=0}return r}}catch(e){}
  // 超倍率: ルーレットの後ろに光の筋(CSS 39-layer.css)
  try{if(typeof roulSuper==='function'){const o=roulSuper;roulSuper=function(){const r=o.apply(this,arguments);try{const e=$('rl');if(e&&e.classList){e.classList.remove('lysup');void e.offsetWidth;e.classList.add('lysup');setTimeout(()=>{try{e.classList.remove('lysup')}catch(_){}},2600)}}catch(e){}return r}}}catch(e){}
  // ボーナスタイムの帯: 主役の演出中は下へ引っ込める(戻る時は下からスライド)
  try{if(typeof btDraw==='function'){const o=btDraw;let k=1;btDraw=function(t){const busy=lyBusyB();k+=((busy?0:1)-k)*Math.min(1,(DT||.016)*12);if(busy&&k<.03)return;if(k>.97&&!busy)return o.apply(this,arguments);
    bc.save();bc.translate(0,Math.round((1-k)*30));try{return o.apply(this,arguments)}finally{bc.restore()}}}}catch(e){}
  // RUSHリザルト: カットイン中はかくす / 擬似連の NEXT はリザルトより上に描く
  try{if(typeof gkDraw==='function'){const o=gkDraw;gkDraw=function(t){const P=GK.pop,R=GK.rr;if(!R||!P){if(R&&LY.rrHide){GK.rr=null;try{o(t)}finally{if(GK.rr===null)GK.rr=R}return}return o(t)}
    GK.pop=null;if(!LY.rrHide)o(t);const R2=GK.rr;GK.rr=null;GK.pop=P;try{o(t)}finally{GK.rr=R2}}}}catch(e){}
  // ミニルーレット: 左上角へ(コンボ/敵名と重ねない)
  try{if(typeof mrDraw==='function'){const o=mrDraw;mrDraw=function(t){bc.save();bc.translate(-82,2);try{return o(t)}finally{bc.restore()}}}}catch(e){}
  // コンボ: 吹き出し(84)の下に隠れていたので、主役の演出が無い時は吹き出しの後に描く(カットイン/JACKPOT/リザルト中は従来どおり下)
  try{if(typeof drawCmb==='function'){const o=drawCmb,dc=t=>{if(LY.ox<.5)return o(t);bc.save();bc.translate(Math.round(LY.ox),0);try{return o(t)}finally{bc.restore()}};LY.dc=dc;
    drawCmb=function(t){if(!lyBusyB()&&!(typeof GK!=='undefined'&&GK.rr)&&typeof chDrawSB==='function'){LY.cmbD=1;return}return dc(t)};
    if(typeof chDrawSB==='function'){const s0=chDrawSB;chDrawSB=function(t){const r=s0.apply(this,arguments);if(LY.cmbD){LY.cmbD=0;try{dc(t)}catch(e){}}return r}}}}catch(e){}}
{const _u=update;update=function(dt){if(!LY.init)lyInit();const r=_u.apply(this,arguments);try{lyUpd(dt)}catch(e){LY.bnQ.length=0;LY.miniQ=0}return r}}
