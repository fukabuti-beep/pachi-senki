/* ---------- 開発者を応援する(BOOTH 配布向け) (feature / 収益化) ----------
   配布: BOOTH で無料配布。応援の方法は2つ。お礼は演出とタイトルの★、パトロン(コード登録)にはお礼に宝石30個(1回だけ)。
   ・BOOST: BOOTH の無料商品はダウンロード時に「BOOST(任意の上乗せ)」で応援できる → 商品ページへのボタンを表示(BOOTH_URL)
   ・サポーターコード: 有料の「応援版」に同梱したコードを入力するとパトロン登録(宝石30個・メニューにパトロン証・タイトルの★。判定は簡易ハッシュ)
   ストア版の課金(PachiNative.iap.purchaseTip)の受け口は将来用に残す。?mon=mock で擬似購入を確認できる。
   セーブ: localStorage['pachi2_sup'] = {n, code} */
const BOOTH_URL='';            // ← BOOTH の商品ページURL(例: 'https://xxxx.booth.pm/items/1234567')。空ならボタンは出さない
const SUPPORT_URL=BOOTH_URL;   // 旧名(互換)
const SUP_CODE_HASH=['2c97a8a1'];   // サポーターコードの FNV-1a ハッシュ(コード本体はソースに置かない)
const TIPS=[['tip_s','缶コーヒー','¥120'],['tip_m','ランチ','¥500'],['tip_l','ディナー','¥1,200']];
let SUP={n:0,code:0,at:'',busy:0};const SUP_GEM=30;   // パトロン特典: 登録時に宝石30個(1回だけ)
try{const j=JSON.parse(localStorage.getItem('pachi2_sup')||'null');if(j){SUP.n=Math.max(0,Math.floor(+j.n)||0);SUP.code=j.code?1:0;SUP.at=typeof j.at=='string'&&/^\d{4}-\d\d-\d\d$/.test(j.at)?j.at:''}}catch(e){}
function supSave(){try{localStorage.setItem('pachi2_sup',JSON.stringify({n:SUP.n,code:SUP.code,at:SUP.at}))}catch(e){}}
const supFan=()=>SUP.n>0||SUP.code>0;
function supNative(){try{const n=typeof monNative==='function'?monNative():null;if(n&&n.iap&&typeof n.iap.purchaseTip==='function')return n.iap;if(n&&MON&&MON.mock)return SUP_MOCK}catch(e){}return null}
const SUP_MOCK={purchaseTip:()=>new Promise(r=>setTimeout(()=>r(true),500)),tipPrice:id=>({tip_s:'¥120',tip_m:'¥500',tip_l:'¥1,200'}[id]||'')+'(テスト)'};
function supMark(){try{if(typeof MQP!=='undefined'&&MQP.n&&supFan()&&!/★/.test(MQP.n[0]))MQP.n[0]='★ CR パチ戦記 ★'}catch(e){}}
supMark();
function supCelebrate(msg){supMark();banner('THANK YOU!!','#ffd400');try{kyuin(6,'#ffd400');jara()}catch(e){}
  try{if(typeof CF!=='undefined')for(let i=0;i<70&&CF.length<80;i++)CF.push({x:Math.random()*360,y:-10-Math.random()*60,vx:(Math.random()-.5)*40,vy:40+Math.random()*60,r:Math.random()*6,h:Math.floor(Math.random()*360),t0:T})}catch(e){}
  try{chJumpAll(2);for(let i=0;i<3;i++)setTimeout(()=>chSay(i,['ありがとう!','うれしい!','感謝!!'][i],2.2),i*200)}catch(e){}
  fxToast(msg||'応援ありがとうございます!','#ffd400')}
function supThanks(){SUP.n++;supSave();supCelebrate()}
async function supBuy(id){const n=supNative();if(!n||SUP.busy)return;SUP.busy=1;try{const ok=await n.purchaseTip(id);if(ok){fxClose&&fxClose();supThanks()}else fxToast('購入は完了しませんでした','#aaa')}catch(e){fxToast('購入に失敗しました','#aaa')}SUP.busy=0}
function supToday(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function supHash(s){let h=0x811c9dc5;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,0x01000193)>>>0}return h.toString(16)}
function supNorm(s){return String(s||'').toUpperCase().replace(/[\s　]/g,'').replace(/[ー－―]/g,'-')}
function supCode(){try{const el=document.getElementById('supcode');const c=supNorm(el?el.value:'');if(!c){fxToast('コードを入力してね','#aaa');return false}
  if(SUP_CODE_HASH.includes(supHash(c))){const first=!SUP.code;SUP.code=1;if(first){SUP.at=supToday();SUPTAB.n='応援★';try{if(typeof RES!=='undefined'){RES.gem+=SUP_GEM;resSave()}}catch(e){}}supSave();try{fxClose()}catch(e){}supCelebrate(first?'パトロン登録ありがとうございます! 宝石 +'+SUP_GEM:'パトロン登録済みです');return true}
  fxToast('コードが違うみたい','#ff8a8a');return false}catch(e){return false}}
const SUPTAB={n:SUP.code?'応援★':'応援',r:()=>{const n=supNative();let h='<div class="fxh">開発者を応援</div><div class="fxs">このゲームは BOOTH で無料配布しています。気に入ったら応援してもらえるとうれしいです!(パトロンになってくれた方には、お礼に 宝石'+SUP_GEM+'個 と タイトルの★ を贈ります)</div>';
  if(SUP.code)h+='<div style="margin:8px auto 4px;max-width:260px;padding:10px 12px;background:linear-gradient(135deg,#3a2a00,#8a6a10 45%,#3a2a00);box-shadow:0 0 0 2px #000,0 0 0 4px #ffd400,0 0 0 6px #000,0 0 18px rgba(255,212,0,.5);text-align:left">'+
    '<div style="color:#fff3a0;font-size:16px;text-align:center;letter-spacing:2px;text-shadow:2px 2px 0 #000">★ パトロン証 ★</div>'+
    '<div style="color:#fff;font-size:12px;line-height:1.7;margin-top:4px;text-shadow:1px 1px 0 #000">'+(typeof RK!=='undefined'&&RK.name?'名前: '+RK.name+'<br>':'')+'登録日: '+(SUP.at||'-')+'<br>特典: 宝石 '+SUP_GEM+' 個 / タイトルの★ / お礼演出</div>'+
    '<div style="color:#ffe9a0;font-size:11px;margin-top:4px;text-align:center">応援ありがとうございます!</div></div>';
  else if(supFan())h+='<div class="fxn" style="font-size:18px">★ サポーター'+(SUP.n>1?' ×'+SUP.n:'')+' ★</div>';
  h+='<div class="fxl"><div class="ok"><span>BOOST で応援<br><small>BOOTH の商品ページで、ダウンロード時に好きな金額を上乗せできます</small></span></div></div>';
  if(BOOTH_URL)h+='<a class="fxb" style="display:inline-block;text-decoration:none" href="'+BOOTH_URL.replace(/"/g,'')+'" target="_blank" rel="noopener">BOOTH のページを開く</a><div class="fxs" style="margin-top:4px">ブラウザで BOOTH が開きます</div>';
  h+='<div class="fxl" style="margin-top:10px"><div class="ok"><span>サポーターコード<br><small>応援版のコードでパトロン登録(宝石 '+SUP_GEM+' 個+タイトルの★)</small></span></div></div>'+
    '<input id="supcode" maxlength="20" placeholder="PACHI-XXXX-XXXX" autocapitalize="characters" style="font:inherit;font-size:14px;width:62%;padding:4px;background:#0b0624;color:#fff;border:2px solid #6a5ad0;text-transform:uppercase"> <button class="fxb" style="margin:0;padding:4px 10px" onclick="supCode()">登録</button>';
  if(n)h+='<div class="fxl" style="margin-top:10px">'+TIPS.map(t=>{let pr='';try{pr=n.tipPrice?n.tipPrice(t[0]):t[2]}catch(e){pr=t[2]}return '<div class="ok"><span>'+t[1]+'で応援<br><small>アプリ内課金</small></span><span><button class="fxb" style="margin:0;padding:4px 10px" onclick="supBuy(\''+t[0]+'\')">'+(pr||t[2])+'</button></span></div>'}).join('')+'</div>';
  return h}};
FM.push(SUPTAB);
