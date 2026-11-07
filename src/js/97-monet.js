/* ---------- monet: 広告(リワード)と「広告削除」課金の受け口 ----------
   方針: Web版(ブラウザ/PWA/単一HTML)では広告も課金も出さない。ストア版(Capacitor等で包んだネイティブ版)が
   window.PachiNative を注入した時だけ UI が現れる。ゲーム側は「結果(true/false)」だけを受け取り、SDK(AdMob/RevenueCat等)には依存しない。
   契約(ネイティブ側が実装): PachiNative = {
     ads:{ ready():bool, showRewarded(placement):Promise<bool>, setBanner(show:bool):void },
     iap:{ price():string(例 '¥480'), purchaseRemoveAds():Promise<bool>, restore():Promise<bool>, owned():bool }
   }
   原則: 強制広告・画面を遮るインタースティシャルは出さない(放置ゲームと光過敏への配慮)。広告は必ず「見たい人だけが押す」リワード型。
   課金は「広告削除」の1点のみ(ランダム性のある有料ガチャ/確率課金は作らない)。ブースト効果は 金×2 (monMul) で、91-meta の金加算フックから掛かる。
   テスト用: URLに ?mon=mock を付けると擬似プロバイダ(実課金なし)が有効になる。 */
const MONK='pachi2mon',BOOST_MS=300000,BOOST_CD=1200000;
const MON={noAds:0,boostUntil:0,cdUntil:0,busy:0,mock:0};
try{const j=JSON.parse(localStorage.getItem(MONK)||'null');if(j){MON.noAds=j.noAds?1:0;
 const f=v=>(typeof v=='number'&&isFinite(v)&&v>0)?v:0;MON.boostUntil=f(j.boostUntil);MON.cdUntil=f(j.cdUntil)}}catch(e){}
function monSave(){try{localStorage.setItem(MONK,JSON.stringify({noAds:MON.noAds,boostUntil:MON.boostUntil,cdUntil:MON.cdUntil}))}catch(e){}}
const monNow=()=>Date.now();
function monNative(){try{if(typeof window!=='undefined'&&window.PachiNative&&window.PachiNative.ads&&window.PachiNative.iap)return window.PachiNative;
 if(MON.mock)return MON_MOCK}catch(e){}return null}
const MON_MOCK={ads:{ready:()=>true,showRewarded:()=>new Promise(r=>setTimeout(()=>r(true),600)),setBanner(){}},
 iap:{price:()=>'¥480(テスト)',purchaseRemoveAds:()=>new Promise(r=>setTimeout(()=>r(true),600)),restore:()=>Promise.resolve(false),owned:()=>false}};
try{if(typeof location!=='undefined'&&/[?&]mon=mock\b/.test(location.search||''))MON.mock=1}catch(e){}
function monEnabled(){return !!monNative()}
function monBoostLeft(){return Math.max(0,Math.ceil((MON.boostUntil-monNow())/1000))}
function monCdLeft(){return Math.max(0,Math.ceil((MON.cdUntil-monNow())/1000))}
function monMul(){return monBoostLeft()>0?2:1}
function monFmt(s){return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2)}
function monBoostStart(){const n=monNow();MON.boostUntil=n+BOOST_MS;MON.cdUntil=n+BOOST_CD;monSave();monUI()}
/* リワード広告: 見終わったら cb(true)。広告が無い/失敗/閉じた時は cb(false)。広告削除済みなら広告なしで即成功(同じクールダウン)。 */
async function monWatch(placement,cb){const n=monNative();if(!n||MON.busy){cb&&cb(false);return false}
 if(MON.noAds){cb&&cb(true);return true}
 MON.busy=1;let ok=false;try{ok=!!(n.ads.ready&&n.ads.ready()===false?false:await n.ads.showRewarded(placement))}catch(e){ok=false}
 MON.busy=0;cb&&cb(ok);return ok}
function monBoost(){if(!monEnabled()||monBoostLeft()>0||monCdLeft()>0||MON.busy)return Promise.resolve(false);
 return monWatch('boost',ok=>{if(ok){monBoostStart();try{showMsg('金 x2 ブースト開始!','#ffd400');banner&&banner('GOLD x2 BOOST!','#ffd400')}catch(e){}}})}
async function monBuy(){const n=monNative();if(!n||MON.noAds||MON.busy)return false;MON.busy=1;let ok=false;try{ok=!!await n.iap.purchaseRemoveAds()}catch(e){ok=false}MON.busy=0;
 if(ok){monOwned()}monUI();return ok}
async function monRestore(){const n=monNative();if(!n||MON.busy)return false;MON.busy=1;let ok=false;try{ok=!!await n.iap.restore()}catch(e){ok=false}MON.busy=0;
 if(ok){monOwned()}monUI();return ok}
function monOwned(){MON.noAds=1;monSave();try{const n=monNative();n&&n.ads.setBanner&&n.ads.setBanner(false)}catch(e){}}
/* --- 設定パネルへの行の差し込み(ネイティブ/モック時のみ) --- */
let monRows=null;
function monInit(){try{if(!monEnabled()||monRows||typeof document==='undefined')return;const rst=$('cfgRst')&&$('cfgRst').parentNode,host=rst&&rst.parentNode;if(!host||!host.insertBefore)return;
 const n=monNative();try{if(n.iap.owned&&n.iap.owned())monOwned()}catch(e){}
 const mk=(label,id,note)=>{const r=document.createElement('div');r.className='row';r.innerHTML='<span>'+label+'</span><button id="'+id+'" class="bv tg" type="button"></button>';host.insertBefore(r,rst);
  if(note){const t=document.createElement('div');t.className='note';t.textContent=note;host.insertBefore(t,rst)}return r};
 mk('ブースト','monB','広告を見ると5分間、ゴールド獲得が2倍になります(見たい時だけ。20分に1回)。');
 mk('広告削除','monA','1回の購入でずっと有効。広告なしでブーストも使えます。');
 mk('購入復元','monR');
 monRows=1;$('monB').onclick=()=>monBoost();$('monA').onclick=()=>monBuy();$('monR').onclick=()=>monRestore();
 if(n.ads.setBanner)n.ads.setBanner(!MON.noAds);monUI()}catch(e){}}
function monUI(){try{if(!monRows)return;const b=$('monB'),a=$('monA'),r=$('monR'),n=monNative();
 const bl=monBoostLeft(),cl=monCdLeft();
 b.textContent=bl>0?'x2 '+monFmt(bl):cl>0?'待機 '+monFmt(cl):MON.noAds?'使う':'広告を見る';b.disabled=!!(bl>0||cl>0||MON.busy);
 a.textContent=MON.noAds?'導入済み':(n&&n.iap.price?n.iap.price():'購入');a.disabled=!!(MON.noAds||MON.busy);
 r.textContent='復元';r.disabled=!!(MON.busy||MON.noAds)}catch(e){}}
try{monInit();setInterval(()=>{monInit();monUI()},1000)}catch(e){}
