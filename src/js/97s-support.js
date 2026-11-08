/* ---------- 開発者を応援する(feature / 収益化) ----------
   方針(MONETIZE.md): Web版で勝手に課金UIは出さない。応援はゲームを有利にしない(見た目のお礼だけ)。
   ・ストア版: window.PachiNative.iap に purchaseTip(id):Promise<bool> / tipPrice(id):string があれば「応援(チップ)」3種を表示。
   ・Web版: SUPPORT_URL(応援ページ: Ko-fi/FANBOX 等)を設定した時だけ外部リンクのボタンを表示。未設定なら「準備中」。
   ・?mon=mock(97-monet の擬似プロバイダ)では実課金なしで流れを確認できる。
   お礼: THANK YOU!! 演出 + 紙吹雪 + キャラが喜ぶ + 筐体タイトルに★(サポーター)。セーブ: localStorage['pachi2_sup'] = {n} */
const SUPPORT_URL='';   // ← 応援ページのURLをここに設定(例: 'https://ko-fi.com/xxxx')。空なら Web版では出さない
const TIPS=[['tip_s','缶コーヒー','¥120'],['tip_m','ランチ','¥500'],['tip_l','ディナー','¥1,200']];
let SUP={n:0,busy:0};
try{const j=JSON.parse(localStorage.getItem('pachi2_sup')||'null');if(j)SUP.n=Math.max(0,Math.floor(+j.n)||0)}catch(e){}
function supSave(){try{localStorage.setItem('pachi2_sup',JSON.stringify({n:SUP.n}))}catch(e){}}
function supNative(){try{const n=typeof monNative==='function'?monNative():null;if(n&&n.iap&&typeof n.iap.purchaseTip==='function')return n.iap;if(n&&MON&&MON.mock)return SUP_MOCK}catch(e){}return null}
const SUP_MOCK={purchaseTip:()=>new Promise(r=>setTimeout(()=>r(true),500)),tipPrice:id=>({tip_s:'¥120',tip_m:'¥500',tip_l:'¥1,200'}[id]||'')+'(テスト)'};
function supMark(){try{if(typeof MQP!=='undefined'&&MQP.n&&SUP.n>0&&!/★/.test(MQP.n[0]))MQP.n[0]='★ CR パチ戦記 ★'}catch(e){}}
supMark();
function supThanks(){SUP.n++;supSave();supMark();banner('THANK YOU!!','#ffd400');try{kyuin(6,'#ffd400');jara()}catch(e){}
  try{if(typeof CF!=='undefined')for(let i=0;i<70&&CF.length<80;i++)CF.push({x:Math.random()*360,y:-10-Math.random()*60,vx:(Math.random()-.5)*40,vy:40+Math.random()*60,r:Math.random()*6,h:Math.floor(Math.random()*360),t0:T})}catch(e){}
  try{chJumpAll(2);for(let i=0;i<3;i++)setTimeout(()=>chSay(i,['ありがとう!','うれしい!','感謝!!'][i],2.2),i*200)}catch(e){}
  fxToast('応援ありがとうございます!','#ffd400')}
async function supBuy(id){const n=supNative();if(!n||SUP.busy)return;SUP.busy=1;try{const ok=await n.purchaseTip(id);if(ok){fxClose&&fxClose();supThanks()}else fxToast('購入は完了しませんでした','#aaa')}catch(e){fxToast('購入に失敗しました','#aaa')}SUP.busy=0}
FM.push({n:'応援',r:()=>{const n=supNative();let body;
  if(n)body='<div class="fxl">'+TIPS.map(t=>{let pr='';try{pr=n.tipPrice?n.tipPrice(t[0]):t[2]}catch(e){pr=t[2]}return '<div class="ok"><span>'+t[1]+'で応援<br><small>開発者にごちそうする</small></span><span><button class="fxb" style="margin:0;padding:4px 10px" onclick="supBuy(\''+t[0]+'\')">'+(pr||t[2])+'</button></span></div>'}).join('')+'</div>';
  else if(SUPPORT_URL)body='<a class="fxb" style="display:inline-block;text-decoration:none" href="'+SUPPORT_URL.replace(/"/g,'')+'" target="_blank" rel="noopener">応援ページを開く</a><div class="fxs" style="margin-top:6px">外部サイト(ブラウザ)が開きます</div>';
  else body='<div class="fxs">応援の受付は準備中です。遊んでくれるだけで十分うれしいです!</div>';
  return '<div class="fxh">開発者を応援</div><div class="fxs">応援してもゲームが有利になることはありません(お礼の演出とタイトルの★だけ)。</div>'+(SUP.n?'<div class="fxn" style="font-size:18px">★ サポーター ×'+SUP.n+' ★</div>':'')+body}});
