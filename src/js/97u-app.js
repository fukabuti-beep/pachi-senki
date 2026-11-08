/* ---------- app: Unity アプリ(WebView で包んだストア版)との橋渡し ----------
   Unity 側(unity/PachiSenki/Assets/Scripts/Web/WebShell.cs)がページ読み込み後に window.PachiApp を注入する。
   1) 振動: 大当たり/JACKPOT/ボス撃破でスマホを震わせる(アプリ=Unity の Handheld.Vibrate、ブラウザ=navigator.vibrate がある端末だけ)。設定で ON/OFF。
   2) セーブの控え: localStorage の pachi2* を定期的にアプリ側(PlayerPrefs)へ送る。WebView のデータが消えた時はアプリが書き戻して再読込する。
   どちらも失敗しても無視(ゲームは止めない)。広告/課金は 97-monet の window.PachiNative(SDK を入れた時だけ)。 */
const UAPP={vib:1,lastV:-9,row:0,bak:''};
try{UAPP.vib=localStorage.getItem('pachi2_vib')!=='0'}catch(e){}
function appIn(){try{return typeof window!=='undefined'&&!!window.PachiApp}catch(e){return false}}
function appSend(m){try{if(appIn()&&window.Unity&&window.Unity.call)window.Unity.call(m)}catch(e){}}
function appCanVib(){try{return appIn()||(typeof navigator!=='undefined'&&typeof navigator.vibrate==='function')}catch(e){return false}}
/* kind: big=大当たり jp=JACKPOT boss=ボス撃破 */
function appVib(kind){try{if(!UAPP.vib)return;const now=typeof T==='number'?T:0;if(now-UAPP.lastV<.8)return;UAPP.lastV=now;
 if(appIn()){appSend('vib:'+kind);return}
 if(typeof navigator!=='undefined'&&navigator.vibrate)navigator.vibrate(kind==='jp'?[90,60,90,60,240]:kind==='boss'?[50,40,120]:70)}catch(e){}}
{const _b=bigHit;bigHit=function(jp){const r=_b.apply(this,arguments);appVib(jp?'jp':'big');return r}}
{const _j=jackpot;jackpot=function(){const r=_j.apply(this,arguments);UAPP.lastV=-9;appVib('jp');return r}}
{const _k=kill;kill=function(){let boss=false;try{boss=isBoss()}catch(e){}const r=_k.apply(this,arguments);if(boss)appVib('boss');return r}}
/* 設定パネルに「振動」の行(振動できる環境だけ) */
function appRow(){try{if(UAPP.row||!appCanVib()||typeof document==='undefined')return;const rst=$('cfgRst')&&$('cfgRst').parentNode,host=rst&&rst.parentNode;if(!host||!host.insertBefore)return;
 const r=document.createElement('div');r.className='row';r.innerHTML='<span>振動</span><button id="appV" class="bv tg" type="button"></button>';host.insertBefore(r,rst);UAPP.row=1;
 const b=$('appV'),ui=()=>{b.textContent=UAPP.vib?'ON':'OFF'};ui();
 b.onclick=()=>{UAPP.vib=UAPP.vib?0:1;try{localStorage.setItem('pachi2_vib',UAPP.vib?'1':'0')}catch(e){}ui();if(UAPP.vib){UAPP.lastV=-9;appVib('big')}}}catch(e){}}
/* セーブの控え: 変わった時だけ送る */
function appBackup(){try{if(!appIn()||typeof localStorage==='undefined')return;const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf('pachi2')===0)o[k]=localStorage.getItem(k)}
 const s=JSON.stringify(o);if(s===UAPP.bak||s==='{}')return;UAPP.bak=s;appSend('save:'+s)}catch(e){}}
/* アプリから呼ばれる: 控えを書き戻す(WebView 側にセーブが無い時だけ)→ 再読込 */
function appRestore(s){try{if(localStorage.getItem('pachi2'))return false;const o=JSON.parse(s);let n=0;for(const k in o)if(k.indexOf('pachi2')===0&&typeof o[k]==='string'){localStorage.setItem(k,o[k]);n++}
 if(n&&typeof location!=='undefined')location.reload();return n>0}catch(e){return false}}
try{setInterval(()=>{appRow();appBackup()},1000*5);setTimeout(appRow,500);
 if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('visibilitychange',()=>{if(document.hidden)appBackup()})}catch(e){}
