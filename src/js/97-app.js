/* ---------- app: アプリ化(PWA)まわり ----------
   常時点灯(Wake Lock) / ホーム画面に追加の案内(iOS: 共有→ホーム画面に追加, Android: インストールプロンプト) / standalone 判定。
   Service Worker 登録は PWA ビルド(dist/pwa/index.html)側のインラインscriptが行う。ここはDOMがあれば動き、無くても落ちない。 */
const APPK='pachi2app';
const APP={wake:1,standalone:false,deferred:null,lock:null};
try{const j=JSON.parse(localStorage.getItem(APPK)||'null');if(j&&typeof j.wake=='number')APP.wake=j.wake?1:0}catch(e){}
try{APP.standalone=!!((window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||(navigator&&navigator.standalone))}catch(e){}
function appSave(){try{localStorage.setItem(APPK,JSON.stringify({wake:APP.wake}))}catch(e){}}
async function wakeAcquire(){try{if(!APP.wake||APP.lock||!navigator.wakeLock||document.hidden)return;
 const l=await navigator.wakeLock.request('screen');APP.lock=l;l.addEventListener&&l.addEventListener('release',()=>{if(APP.lock===l)APP.lock=null})}catch(e){APP.lock=null}}
function wakeRelease(){try{const l=APP.lock;APP.lock=null;l&&l.release&&l.release()}catch(e){}}
function appWakeUI(){const b=$('cfgWake');if(!b)return;b.textContent=APP.wake?'ON':'OFF';b.className='bv tg'+(APP.wake?' on':'');}
function appIsIOS(){try{return /iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}catch(e){return false}}
function appInstallNote(){if(APP.standalone)return'すでにアプリとして起動しています。';
 if(appIsIOS())return'Safariの共有ボタン(□↑)→「ホーム画面に追加」で、全画面のアプリとして遊べます。(Chrome等ではなくSafariで開いてください)';
 return APP.deferred?'下のボタンでインストールできます。':'ブラウザのメニュー →「ホーム画面に追加」または「アプリをインストール」を選んでください。'}
try{
 const w=$('cfgWake'),i=$('cfgInst'),n=$('cfgInstNote'),t=$('ttInst');
 appWakeUI();
 if(w)w.onclick=()=>{APP.wake=APP.wake?0:1;appSave();appWakeUI();APP.wake?wakeAcquire():wakeRelease()};
 if(i){if(APP.standalone){i.textContent='導入済み';i.disabled=true}
  else i.onclick=async()=>{if(APP.deferred){try{APP.deferred.prompt();await APP.deferred.userChoice}catch(e){}APP.deferred=null;return}
   if(n){n.textContent=appInstallNote();n.style.display=n.style.display=='none'?'block':'none'}}}
 if(t&&!APP.standalone)t.style.display='block';
 if(window.addEventListener){
  window.addEventListener('beforeinstallprompt',e=>{try{e.preventDefault()}catch(x){}APP.deferred=e});
  window.addEventListener('appinstalled',()=>{APP.standalone=true;APP.deferred=null});
 }
 if(document.addEventListener){
  document.addEventListener('visibilitychange',()=>{if(document.hidden)APP.lock=null;else wakeAcquire()});
  ['pointerdown','touchend'].forEach(e=>document.addEventListener(e,()=>wakeAcquire(),{passive:true}));
 }
}catch(e){}
