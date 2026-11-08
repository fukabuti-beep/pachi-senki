/* ---------- feature: iPhone(WKWebView / Safari / ホーム画面追加)でアプリっぽく動かすための調整 ----------
   見た目・演出・バランスは変えない。CSS は css/37-ios.css。
   1) 筐体が指で引っぱられて揺れる(ラバーバンド)/ピンチ拡大 → touchmove を止める(中身がスクロールできる所と入力欄は除く)
   2) 長押しの選択・コールアウト → contextmenu / selectstart を止める(入力欄は除く)
   3) WebAudio: iOS はバックグラウンドや着信で AudioContext が suspended/interrupted になる。
      戻った(pageshow/focus/表示)・触った(touchstart/click)時に resume を試す。裏に回った時に止めるのは iOS 自身と
      Unity(WebShell の OnApplicationPause)に任せる(PC ブラウザではタブ裏でも BGM を鳴らす 76-bgm の仕様を変えない)。
      AC はこれまでどおり「スタート」のタップで作る(ここでは作らない)
   4) Google Font(DotGothic16)は index.html で読み込みを待たない形にした → 届いたらキャッシュ済みの盤面/ルーレットの文字を描き直す */
const IOS={fontDone:0,lastTry:0,fk:0};
function iosEditable(el){try{const t=el&&el.tagName;return t==='INPUT'||t==='TEXTAREA'||t==='SELECT'||!!(el&&el.isContentEditable)}catch(e){return false}}
/* el から上にたどって、実際にスクロールできる要素があるか(あればそこは指で動かしてよい) */
function iosScrollable(el){
  try{if(typeof getComputedStyle!=='function')return false;
    for(let n=el,k=0;n&&n.nodeType===1&&k<40;n=n.parentNode,k++){
      if(n===document.body||n===document.documentElement)return false;
      const cs=getComputedStyle(n);
      if(/(auto|scroll)/.test(cs.overflowY||'')&&n.scrollHeight>n.clientHeight+1)return true;
      if(/(auto|scroll)/.test(cs.overflowX||'')&&n.scrollWidth>n.clientWidth+1)return true}
  }catch(e){}return false}
function iosTouchMove(e){try{
  if(!e||!e.cancelable||!e.preventDefault)return;
  if(e.touches&&e.touches.length>1){e.preventDefault();return}   // ピンチ拡大
  const t=e.target;if(iosEditable(t)||iosScrollable(t))return;
  e.preventDefault()   // 筐体全体のバウンス(WKWebView の scrollView / Safari のラバーバンド)を止める
}catch(x){}}
function iosNoMenu(e){try{if(e&&e.preventDefault&&!iosEditable(e.target))e.preventDefault()}catch(x){}}
/* --- 音: 再開を試みる(ユーザー操作の中なら確実、それ以外は失敗しても無害) --- */
function iosAudioWake(){try{
  if(typeof AC==='undefined'||!AC||(typeof document!=='undefined'&&document.hidden))return;
  if(AC.state&&AC.state!=='running'){IOS.lastTry=Date.now();if(typeof sndResume==='function')sndResume()}
}catch(e){}}
/* --- フォント: DotGothic16 が読めたらキャッシュを作り直す(1回だけ) --- */
function iosFontReady(){try{
  if(IOS.fontDone||typeof document==='undefined'||!document.fonts||!document.fonts.forEach)return false;
  let ok=false;document.fonts.forEach(f=>{if(f&&/DotGothic16/.test(f.family||'')&&f.status==='loaded')ok=true});
  if(!ok)return false;IOS.fontDone=1;
  try{if(typeof buildBg==='function')buildBg()}catch(e){}
  try{if(typeof WCH!=='undefined')WCH=null}catch(e){}
  return true}catch(e){return false}}
try{if(typeof document!=='undefined'&&document.addEventListener){
  document.addEventListener('touchmove',iosTouchMove,{passive:false});
  ['gesturestart','gesturechange','gestureend'].forEach(n=>document.addEventListener(n,iosNoMenu,{passive:false}));   // Safari のピンチ
  document.addEventListener('contextmenu',iosNoMenu);
  document.addEventListener('selectstart',iosNoMenu);
  /* 75-audio の pointerdown/touchend/keydown に加えて、iOS で確実に「ユーザー操作」と扱われる touchstart/click でも再開 */
  ['touchstart','click'].forEach(n=>document.addEventListener(n,iosAudioWake,{passive:true}));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)iosAudioWake()});
  if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',iosFontReady);
  const gf=document.getElementById&&document.getElementById('gf');
  if(gf&&gf.addEventListener)gf.addEventListener('load',()=>{try{document.fonts&&document.fonts.load&&document.fonts.load('16px "DotGothic16"').then(iosFontReady,()=>{})}catch(e){}});
}}catch(e){}
try{if(typeof window!=='undefined'&&window.addEventListener){
  window.addEventListener('pageshow',iosAudioWake);   // 戻る/進むキャッシュから復帰
  window.addEventListener('focus',iosAudioWake);
}}catch(e){}
/* 着信やSiriで interrupted のまま戻らない時の保険: 表示中で止まっていれば 2 秒おきに再開を試す(処理は状態確認のみで軽い) */
setInterval(()=>{iosAudioWake();if(!IOS.fontDone&&IOS.fk++<30)iosFontReady()},2000);   // フォント確認は最初の1分だけ
