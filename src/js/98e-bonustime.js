/* ---------- ボーナスタイム (feature) ----------
   プレイ中、6〜9分ごとに40秒間のボーナスタイムが発生(3種から抽選)。5秒前に予告。
     黄金タイム    ゴールド x2      (SB.g をラップ)
     魔石フィーバー 魔石 x3         (resMs をラップ)
     討伐タイム    ダメージ x2      (SB.a をラップ)
   毎日 12時台・20〜21時台(端末の時計)は「ゴールデンタイム」: 発生間隔が半分。
   演出: 予告バナー → 開始バナー+キュイン+ジングル → 戦闘画面の下中央に残り時間の帯 + 枠がゆっくり光る(点滅はしない)。
   ミニゲーム/ルーレット/カットイン中は開始を待つ。当否・確率には一切触れない。
   セーブ: localStorage['pachi2_bt'] = {left:次までの秒, k:実行中の種類, rem:残り秒, n:累計}。転生しても残る(タイマーなので)。 */
const BTK=[
 {id:'gold',n:'黄金タイム',d:'ゴールド x2',c:'#ffd400'},
 {id:'ms',n:'魔石フィーバー',d:'魔石 x3',c:'#c8a0ff'},
 {id:'atk',n:'討伐タイム',d:'ダメージ x2',c:'#ff5a5a'}];
const BT={left:240,cur:null,pre:0,n:0,dur:40,sv:0};
try{const j=JSON.parse(localStorage.getItem('pachi2_bt')||'null');if(j&&typeof j=='object'){const l=+j.left,k=Math.floor(+j.k),r=+j.rem,n=Math.floor(+j.n);
  if(Number.isFinite(l)&&l>=0)BT.left=Math.min(l,600);if(Number.isFinite(n)&&n>0)BT.n=Math.min(n,1e9);
  if(k>=0&&k<BTK.length&&Number.isFinite(r)&&r>0)BT.cur={k,rem:Math.min(r,BT.dur),t0:-9}}}catch(e){}
function btSave(){try{localStorage.setItem('pachi2_bt',JSON.stringify({left:Math.round(BT.left),k:BT.cur?BT.cur.k:-1,rem:BT.cur?Math.round(BT.cur.rem):0,n:BT.n}))}catch(e){}}
/* ゴールデンタイム(端末の現地時刻) */
function btGolden(d){try{const h=(d||new Date()).getHours();return h===12||h===20||h===21}catch(e){return false}}
const btGap=()=>(360+Math.random()*180)*(btGolden()?.5:1);
const btOn=id=>!!(BT.cur&&BTK[BT.cur.k].id===id);
// 効果
{const oa=SB.a,og=SB.g;SB.a=()=>oa()*(btOn('atk')?2:1);SB.g=()=>og()*(btOn('gold')?2:1)}
if(typeof resMs==='function'){const o=resMs;resMs=function(n){return o.call(this,btOn('ms')?n*3:n)}}
const btBusy=()=>!!(G.roul||G.jp>0||cut||MG||(typeof MG2!=='undefined'&&MG2)||(typeof HL!=='undefined'&&HL));
function btStart(k){if(k==null)k=Math.floor(Math.random()*BTK.length);const K=BTK[k];BT.cur={k,rem:BT.dur,t0:T};BT.pre=0;BT.n++;btSave();
  try{banner(K.n+'!! '+K.d,K.c);kyuin(7,K.c);fan();if(sOK()){const t=sNow();[523,659,784,1047,784,1047,1319,1568].forEach((f,i)=>tone(f,t+.75+i*.09,.12,'square',.035))}}catch(e){}
  fxToast(K.n+' 開始! '+BT.dur+'秒間 '+K.d,K.c)}
function btEnd(){const K=BTK[BT.cur.k];BT.cur=null;BT.left=btGap();btSave();showMsg(K.n+' 終了','#aaa')}
function btUpd(dt){if(!run)return;
  if(BT.cur){if(BT.cur.t0<0)BT.cur.t0=T;BT.cur.rem-=dt;if(BT.cur.rem<=0)btEnd()}
  else{BT.left-=dt;
    if(BT.left<=5&&!BT.pre){BT.pre=1;showMsg('まもなく ボーナスタイム!','#ffd400');try{if(sOK()){const t=sNow();for(let i=0;i<3;i++)tone(1319,t+i*.3,.1,'p25',.03,1760)}}catch(e){}}
    if(BT.left<=0){if(btBusy())BT.left=0;else btStart()}}
  BT.sv+=dt;if(BT.sv>5){BT.sv=0;btSave()}}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{btUpd(dt)}catch(e){BT.cur=null;BT.left=btGap()}return r}}
try{if(window.addEventListener)window.addEventListener('pagehide',()=>{try{btSave()}catch(e){}})}catch(e){}
// 描画: 戦闘画面の下端中央に帯(名前+残り秒+ゲージ)、枠がゆっくり脈動(約0.8Hz、点滅ではない)
function btDraw(t){const C=BT.cur;if(!C)return;const K=BTK[C.k],p=Math.max(0,C.rem/BT.dur),a=Math.min(1,(T-C.t0)*3);
  bc.save();bc.globalAlpha=.35+.25*Math.sin(t*5);bc.strokeStyle=K.c;bc.lineWidth=3;bc.strokeRect(1.5,1.5,357,147);
  bc.globalAlpha=a;const w=144,x=108,y=126;bc.fillStyle='rgba(8,4,24,.82)';bc.fillRect(x,y,w,20);bc.fillStyle='#000';bc.fillRect(x+4,y+15,w-8,4);
  bc.fillStyle=K.c;bc.fillRect(x+5,y+16,Math.round((w-10)*p),2);bc.fillStyle='rgba(255,255,255,.5)';bc.fillRect(x,y,w,1);
  bc.textAlign='center';if(typeof thickTxt==='function')thickTxt(bc,K.n+' '+Math.ceil(C.rem)+'s',x+w/2,y+12,10,K.c);bc.restore()}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{btDraw(t)}catch(e){}return r}}
function btMenu(){const C=BT.cur,g=btGolden();
  return '<div class="fxh">ボーナスタイム</div><div class="fxs">遊んでいると数分ごとに40秒間のボーナスタイムが来る。<br>毎日 12時台・20〜21時台はゴールデンタイム(発生2倍)。</div>'+
   (C?'<div class="fxn" style="font-size:20px;color:'+BTK[C.k].c+'">'+BTK[C.k].n+' 残り'+Math.ceil(C.rem)+'秒</div>':'<div class="fxn" style="font-size:20px">次まで 約'+Math.max(1,Math.ceil(BT.left/60))+'分</div>')+
   (g?'<div class="fxp btgold">ただいま ゴールデンタイム!!</div>':'')+
   '<div class="fxl">'+BTK.map((K,i)=>'<div class="ok"><span style="color:'+K.c+'">'+K.n+'</span><span>'+K.d+'</span></div>').join('')+
   '<div class="ok"><span>ゴールデンタイム</span><span>12時台 / 20〜21時台</span></div></div><div class="fxs" style="margin-top:6px">累計 '+BT.n+'回</div>'}
FM.push({n:'イベント',r:btMenu});
if(typeof AC_!=='undefined')AC_.push(['bt10','ボーナスハンター','ボーナスタイム10回',2,()=>BT.n>=10,[()=>BT.n,10]]);
