/* ---------- ランキング(自己ベスト + オンライン接続口) (feature) ----------
   自己ベスト: 最高到達ステージ / 最高連チャン / 最高RUSHスコア(ランク) / 大当たり累計 を記録・表示。
   共有: navigator.share(使えない時はクリップボードにコピー)で記録をテキスト共有。
   オンライン: 接続先が設定された時だけ有効(既定はオフ=通信しない)。
     1) ストア版: window.PachiNative.rank = { submit(board,score,name):Promise<bool>, top(board):Promise<[{name,score}]> }(Game Center/Play Games 等)
     2) 自前サーバー: RANK_API にURLを設定(server/ranking-worker.js = Cloudflare Workers の見本。手順は ONLINE.md)
   自己ベストが更新されたら送信待ちにし、最短60秒おきにまとめて送信する。セーブ: localStorage['pachi2_rank'] */
const RANK_API='';   // ← 自前ランキングサーバーのURL(例: 'https://pachi-rank.xxxx.workers.dev')。空なら通信しない
const RKB=[['stage','最高到達ステージ','STAGE '],['chain','最高連チャン',''],['score','最高RUSHスコア',''],['hits','大当たり累計','']];
let RK={name:'',id:'',best:{stage:0,chain:0,score:0,hits:0},pend:{},last:0,top:{},board:'stage',err:''};
try{const j=JSON.parse(localStorage.getItem('pachi2_rank')||'null');if(j&&typeof j=='object'){RK.name=rkName(j.name||'');RK.id=typeof j.id=='string'&&/^[a-z0-9]{8,32}$/.test(j.id)?j.id:'';
  RKB.forEach(b=>{const v=Math.floor(+(j.best||{})[b[0]]);if(Number.isFinite(v)&&v>0)RK.best[b[0]]=Math.min(v,1e12)})}}catch(e){}
if(!RK.id)RK.id=Array.from({length:16},()=>'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*36)]).join('');
function rkName(s){s=String(s).replace(/[<>&"'`\\\u0000-\u001f]/g,'').trim().slice(0,10);return s}
function rkSave(){try{localStorage.setItem('pachi2_rank',JSON.stringify({name:RK.name,id:RK.id,best:RK.best}))}catch(e){}}
function rkProvider(){try{if(typeof window!=='undefined'&&window.PachiNative&&window.PachiNative.rank&&typeof window.PachiNative.rank.submit==='function')return 'native'}catch(e){}return RANK_API?'api':''}
function rkVal(b){try{if(b=='stage')return Math.max(X.best,G.stage);if(b=='chain')return typeof GK!=='undefined'?GK.best:0;if(b=='hits')return X.st.hit||0}catch(e){}return RK.best[b]||0}
function rkCheck(){let ch=0;for(const b of RKB){const k=b[0];if(k=='score')continue;const v=rkVal(k);if(v>RK.best[k]){RK.best[k]=v;RK.pend[k]=v;ch=1}}if(ch)rkSave()}
let RKRR=null;
function rkUpd(){const R=typeof GK!=='undefined'?GK.rr:null;if(R&&R!==RKRR){RKRR=R;if(R.sc>RK.best.score){RK.best.score=R.sc;RK.pend.score=R.sc;rkSave();if(R.sc>=40)fxToast('自己ベスト更新! RUSHスコア '+R.sc,'#7ff3ff')}}
  if(T-RK.last>60&&Object.keys(RK.pend).length&&rkProvider()&&RK.name){RK.last=T;rkFlush()}}
async function rkFlush(){const p=rkProvider(),items=Object.entries(RK.pend);RK.pend={};
  for(const [b,v] of items){try{if(p=='native')await window.PachiNative.rank.submit(b,v,RK.name);
    else if(p=='api')await fetch(RANK_API.replace(/\/$/,'')+'/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({board:b,score:v,name:RK.name,id:RK.id})});RK.err=''}catch(e){RK.pend[b]=Math.max(RK.pend[b]||0,v);RK.err='送信に失敗(あとで再送)'}}}
async function rkFetch(b){const p=rkProvider();RK.board=b;if(!p)return;try{let rows=[];if(p=='native')rows=await window.PachiNative.rank.top(b);
    else{const r=await fetch(RANK_API.replace(/\/$/,'')+'/top?board='+encodeURIComponent(b));rows=await r.json()}
    RK.top[b]=(Array.isArray(rows)?rows:[]).slice(0,20).map(x=>({name:rkName(x&&x.name||'???')||'???',score:Math.floor(+(x&&x.score))||0}));RK.err=''}catch(e){RK.err='取得に失敗しました'}try{fxMenu()}catch(e){}}
function rkSetName(){try{const el=document.getElementById('rkname');const v=rkName(el?el.value:'');if(!v){fxToast('名前を入力してね(10文字まで)','#aaa');return}RK.name=v;rkSave();fxToast('名前を '+v+' にしました','#7ff3ff');for(const b of RKB)if(RK.best[b[0]])RK.pend[b[0]]=RK.best[b[0]];RK.last=-99}catch(e){}}
function rkShareText(){return 'パチ戦記 自己ベスト\n'+RKB.map(b=>b[1]+': '+b[2]+fmt(RK.best[b[0]]||0)).join('\n')+'\n#パチ戦記'}
async function rkShare(){const t=rkShareText();try{if(navigator.share){await navigator.share({text:t});return}}catch(e){}
  try{await navigator.clipboard.writeText(t);fxToast('記録をコピーしました','#7ff3ff')}catch(e){fxToast('共有できませんでした','#aaa')}}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{if(Math.floor(T)!==Math.floor(T-dt))rkCheck();rkUpd()}catch(e){}return r}}
FM.push({n:'ランキング',r:()=>{rkCheck();const p=rkProvider();
  let h='<div class="fxh">ランキング</div><div class="fxl">'+RKB.map(b=>'<div class="ok"><span>'+b[1]+'</span><span>'+b[2]+fmt(RK.best[b[0]]||0)+'</span></div>').join('')+'</div>'+
   '<button class="fxb g" onclick="rkShare()">記録を共有</button>'+
   '<div class="fxs" style="margin-top:10px">プレイヤー名(10文字まで)</div><input id="rkname" maxlength="10" value="'+RK.name+'" style="font:inherit;font-size:14px;width:60%;padding:4px;background:#0b0624;color:#fff;border:2px solid #6a5ad0"> <button class="fxb" style="margin:0;padding:4px 10px" onclick="rkSetName()">決定</button>';
  if(!p)h+='<div class="fxs" style="margin-top:10px">オンラインランキングは未接続です(接続先を設定すると自動で参加します)。</div>';
  else{h+='<div class="fxt" style="margin-top:10px">'+RKB.map(b=>'<button class="'+(RK.board==b[0]?'on':'')+'" onclick="rkFetch(\''+b[0]+'\')">'+b[1].replace('最高','').replace('累計','')+'</button>').join('')+'</div>';
    const rows=RK.top[RK.board];h+=rows?'<div class="fxl">'+(rows.length?rows.map((r,i)=>'<div class="'+(r.name==RK.name?'ok':'')+'"><span>'+(i+1)+'位 '+r.name+'</span><span>'+fmt(r.score)+'</span></div>').join(''):'<div><span>まだ記録がありません</span></div>')+'</div>':'<div class="fxs">ボタンを押すと上位20位を表示</div>';
    if(!RK.name)h+='<div class="fxs">名前を決めると記録を送信します</div>'}
  if(RK.err)h+='<div class="fxs" style="color:#ff8a8a">'+RK.err+'</div>';return h}});
