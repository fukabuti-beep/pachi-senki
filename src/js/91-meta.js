/* ---------- feature 91: メタ進行の基盤 (保存 / モーダル / トースト / メニュー / フック) ----------
   担当: feature。セーブは新キー 'pachi2x'(既存 'pachi2' の {gold,stage,lv} は一切変更しない)。
   他担当のファイルへは 99-main.js に featStart()/featUpdate(dt) の2行フックのみ。
   既存関数(hurt/kill/bigHit/startRoul/mini/stopMG/drawB)は「ラップ」して使う(元ファイルは無編集)。 */
const FKEY='pachi2x',MAXAWAY=8*3600;
const fnum=(v,d=0)=>{v=+v;return Number.isFinite(v)&&v>=0?v:d};
const nowMs=()=>Date.now();
/* X: 永続メタ状態。t=最終プレイ時刻(ms) souls=魂 pres=転生回数 best=最高到達ステージ ach=実績 st=統計 gps=平均ゴールド毎秒 */
function normX(s){
  s=s&&typeof s==='object'?s:{};const st=s.st&&typeof s.st==='object'?s.st:{},ach={};
  if(s.ach&&typeof s.ach==='object')for(const k in s.ach)if(s.ach[k])ach[k]=1;
  const o={t:fnum(s.t),souls:Math.floor(fnum(s.souls)),pres:Math.floor(fnum(s.pres)),best:Math.max(1,Math.floor(fnum(s.best,1))),gps:fnum(s.gps),mgi:Math.floor(fnum(s.mgi)),ach,st:{}};
  ['hit','jp','boss','r50','mg','mgp','cmb','rc'].forEach(k=>o.st[k]=Math.floor(fnum(st[k])));
  return o}
let X=normX(null);
try{X=normX(JSON.parse(localStorage.getItem(FKEY)||'null'))}catch(e){}
X.best=Math.max(X.best,G.stage);
function saveX(){X.t=nowMs();try{localStorage.setItem(FKEY,JSON.stringify(X))}catch(e){}}
/* 更新フック登録: FU.push(dt=>{}) 。例外はゲームを止めず FERR に数える(テストで0を確認) */
const FU=[],FM=[];let FERR=0,fg=0,fsv=0,fgb=0,fgt=0;
function featUpdate(dt){
  for(let i=0;i<FU.length;i++){try{FU[i](dt)}catch(e){FERR++;if(FERR<4)console.error('[feature]',e)}}
  /* 魂ボーナス(ゴールド): 今フレームの純増に (SB.g()-1) を上乗せ。購入などの減少は無視 */
  const d=G.gold-fg;if(d>0){fgb+=d;const k=typeof SB!=='undefined'?SB.g():1;if(k>1&&Number.isFinite(k)){G.gold+=d*(k-1)}}
  fg=G.gold;
  /* 収入の移動平均(オフライン計算の基準): 5秒ごとに更新 */
  fgt+=dt;if(fgt>=5){const inst=fgb/fgt;X.gps=X.gps>0?X.gps*.95+inst*.05:inst;fgb=0;fgt=0}
  if(X.best<G.stage)X.best=G.stage;
  fsv+=dt;if(fsv>4){fsv=0;saveX()}}
/* フック越しでないゴールド加算(魂ボーナスの二重掛け・収入平均への混入を避ける) */
function addGold(n){n=Math.floor(fnum(n));if(!n)return 0;G.gold+=n;fg+=n;return n}
function featStart(){fg=G.gold;try{offlineCheck()}catch(e){FERR++;console.error('[feature]',e)}}
/* 既存の関数宣言をラップ(存在しなければ何もしない) */
const fxHooks=[];
/* ---------- UI: スタイル(JSで注入。style.css は ui 担当のため触らない) ---------- */
(function(){const s=document.createElement('style');s.textContent=
'#fxm,#fxg{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(5,3,20,.82);z-index:10;padding:14px}'+
'#fxg{z-index:6}#fxm .rb,#fxg .rb{width:100%;max-width:340px;max-height:86vh;overflow:auto}'+
'.fxh{font-size:20px;color:var(--ac);text-shadow:0 0 10px var(--pk),2px 2px 0 #000;margin-bottom:6px}'+
'.fxn{font-size:34px;color:var(--ac);text-shadow:0 0 14px var(--pk),3px 3px 0 #000;margin:8px 0}'+
'.fxs{font-size:12px;opacity:.75;line-height:1.6}.fxp{font-size:13px;line-height:1.7;margin:4px 0}'+
'.fxb{font:inherit;font-size:15px;background:var(--pk);color:#fff;border:3px solid #fff;box-shadow:0 4px 0 #7a0c3a;padding:8px 16px;margin:10px 4px 0}'+
'.fxb.g{background:var(--pn);border-color:var(--ln);box-shadow:0 4px 0 #000}.fxb.d{opacity:.4}.fxb:active{transform:translateY(3px)}'+
'.fxt{display:flex;gap:4px;justify-content:center;margin:4px 0 8px}.fxt button{flex:1;font:inherit;font-size:13px;background:var(--pn);color:#fff;border:3px solid var(--ln);padding:5px 2px}.fxt button.on{border-color:var(--ac);color:var(--ac)}'+
'.fxl{text-align:left;font-size:12px;line-height:1.5}.fxl div{display:flex;justify-content:space-between;gap:8px;padding:4px 2px;border-bottom:1px dotted #4a3aa8}.fxl .ok{color:var(--ac)}.fxl .no{opacity:.55}'+
'#fxt{position:fixed;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 46px);text-align:center;z-index:9;pointer-events:none;opacity:0}'+
'#fxt span{display:inline-block;background:var(--pn);border:3px solid var(--ac);box-shadow:0 3px 0 #000,0 0 18px var(--pk);padding:5px 12px;font-size:14px}'+
'#fxt.on{animation:fxt 2.6s}@keyframes fxt{0%{opacity:0;transform:translateY(-20px)}10%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0}}'+
'#fxmb{position:fixed;left:8px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:7;width:40px;height:40px;background:var(--pn);color:var(--ac);border:3px solid var(--ac);box-shadow:0 3px 0 #000;font:inherit;font-size:20px}'+
'#fxmb i{position:absolute;right:-6px;top:-8px;background:var(--pk);color:#fff;font:11px/14px inherit;font-style:normal;padding:0 4px;display:none}';
(document.head||document.body).appendChild(s)})();
function fxEl(tag,id,cls,html){const e=document.createElement(tag);if(id)e.id=id;if(cls)e.className=cls;if(html!=null)e.innerHTML=html;document.body.appendChild(e);return e}
const fxM=fxEl('div','fxm','','<div class="rb"><div id="fxmc"></div><div id="fxmbt"></div></div>');
const fxT=fxEl('div','fxt','','<span id="fxts"></span>');
const fxMB=fxEl('button','fxmb','','☰<i id="fxmbi"></i>');
let FB=[],fxOpen=false,fxTab=0;
/* モーダル表示。btns=[[ラベル,関数|null(=閉じる),'g'(灰色)]] */
function fxShow(html,btns){$('fxmc').innerHTML=html;FB=btns||[['OK',null]];$('fxmbt').innerHTML=FB.map((b,i)=>'<button class="fxb '+(b[2]||'')+'" onclick="fxBtn('+i+')">'+b[0]+'</button>').join('');fxM.style.display='flex';fxOpen=true}
function fxBtn(i){const b=FB[i];if(b&&b[1]){b[1]()}else fxClose()}
function fxClose(){fxM.style.display='none';fxOpen=false;if(typeof OFFD!=='undefined')OFFD=null}
function fxSet(id,t){$(id).textContent=t}
/* トースト(キュー。大当たりのバナーを潰さないよう別要素) */
const fxQ=[];let fxQt=0;
function fxToast(t,c){if(fxQ.length<6)fxQ.push([t,c||'#ffd400'])}
FU.push(dt=>{fxQt-=dt;if(fxQt<=0&&fxQ.length){const q=fxQ.shift();fxQt=2.7;$('fxts').textContent=q[0];$('fxts').style.color=q[1];fxT.className='';void fxT.offsetWidth;fxT.className='on'}});
/* メニュー: 各機能が FM.push({n:'名前',r:()=>html}) でタブを追加 */
function fxMenu(){if(!FM.length)return;if(typeof fmgMenu==='function'&&fmgMenu())return;/* 29c: グループ分け表示 */fxTab=Math.min(fxTab,FM.length-1);
  const tabs='<div class="fxt">'+FM.map((m,i)=>'<button class="'+(i==fxTab?'on':'')+'" onclick="fxTab='+i+';fxMenu()">'+m.n+'</button>').join('')+'</div>';
  fxShow(tabs+FM[fxTab].r(),[['閉じる',null,'g']])}
fxMB.onclick=()=>{if(fxOpen)fxClose();else fxMenu()};
/* 保存: 画面を離れる/隠す時にも最終プレイ時刻を残す。戻った時はおかえり判定 */
try{if(document.addEventListener)document.addEventListener('visibilitychange',()=>{if(document.hidden){if(run)saveX()}else if(run)featStart()})}catch(e){}
try{if(window.addEventListener)window.addEventListener('pagehide',()=>{if(run)saveX()})}catch(e){}
