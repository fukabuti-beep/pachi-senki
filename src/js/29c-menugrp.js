/* ---------- 三本線メニューのグループ分け (ui) ----------
   FM(91-meta、各機能が FM.push({n,r}) で登録)のタブを「遊ぶ/集める/育てる/その他」の大分類にまとめ、
   上段=大分類、下段=その中のタブ の2段で表示する。FM の中身・r() には触らない。
   - タブ名(先頭一致)で振り分け。どこにも当てはまらないタブ(後から FM.push されたもの)は「その他」へ自動で入る。
   - 最後に開いたタブを localStorage['pachi2_menu'] に名前で覚え、次に開いた時に復元する。
   - 91-meta の fxMenu() 先頭の1行フックから fmgMenu() が呼ばれる(false を返したら従来の表示)。
   ロード時は何も参照しない(FM/fxShow は 91-meta で宣言、呼ばれるのは実行時のみ)。 */
const FMGRP=[
  {n:'遊ぶ',  c:'#ff7ab0',t:['遊戯','くじ','遠征','イベント']},
  {n:'集める',c:'#7ff3ff',t:['実績','図鑑','遺物','仲間']},
  {n:'育てる',c:'#8dff7a',t:['育成','転生','鍛冶屋','魂の祭壇']},   // 転生は強化シートの魂の祭壇へ統合(98i)。ここには案内の「育成」タブだけ
  {n:'ミッション',c:'#ffa04a',t:['ミッション']},   // 毎日やるものなので独立(作り手の希望)。中のタブが1つのグループは下段を出さない
  {n:'その他',c:'#ffd400',t:['ランキング','応援']}];
const FMG_OTHER=FMGRP.length-1,FMG_KEY='pachi2_menu';
let fmgG=-1,fmgLast={};
try{const s=JSON.parse(localStorage.getItem(FMG_KEY)||'null');if(s&&typeof s==='object'){if(typeof s.t==='string')fmgLast.t=s.t;if(s.g&&typeof s.g==='object')fmgLast.g=s.g}}catch(e){}
if(!fmgLast.g)fmgLast.g={};
function fmgSave(){try{localStorage.setItem(FMG_KEY,JSON.stringify(fmgLast))}catch(e){}}
/* タブ名 → グループ番号(「応援★」のような飾り付きも先頭一致で拾う) */
function fmgOf(name){name=String(name||'');for(let g=0;g<FMGRP.length;g++)if(FMGRP[g].t.some(t=>name.indexOf(t)===0))return g;return FMG_OTHER}
/* グループごとの FM 添字一覧(定義順。未定義の名前は FM の登録順で後ろに) */
function fmgList(){const L=FMGRP.map(()=>[]);
  FM.forEach((m,i)=>L[fmgOf(m.n)].push(i));
  L.forEach((a,g)=>a.sort((x,y)=>{const t=FMGRP[g].t,k=n=>{const j=t.findIndex(s=>String(n).indexOf(s)===0);return j<0?99:j};return k(FM[x].n)-k(FM[y].n)||x-y}));
  return L}
function fmgFind(name){if(!name)return -1;return FM.findIndex(m=>m.n===name||String(m.n).replace(/★/g,'')===String(name).replace(/★/g,''))}
/* 大分類ボタン: そのグループで最後に開いたタブ(無ければ先頭)へ */
function fmgPick(g){const L=fmgList();if(!L[g]||!L[g].length)return;
  const j=fmgFind(fmgLast.g[g]);fxTab=L[g].indexOf(j)>=0?j:L[g][0];fxMenu()}
function fmgTab(i){fxTab=i;fxMenu()}
let fmgInit=false;
function fmgMenu(){try{
  if(!FM.length)return false;
  /* 初回だけ前回のタブを復元 */
  if(!fmgInit){fmgInit=true;const j=fmgFind(fmgLast.t);if(j>=0)fxTab=j}
  fxTab=Math.max(0,Math.min(fxTab|0,FM.length-1));
  const L=fmgList(),g=fmgOf(FM[fxTab].n);fmgG=g;
  fmgLast.t=FM[fxTab].n;fmgLast.g[g]=FM[fxTab].n;fmgSave();
  const gs='<div class="fxt mgG mgC'+L.filter(a=>a.length).length+'" role="tablist">'+FMGRP.map((G_,k)=>{const n=L[k].length;
    return n?'<button type="button" class="'+(k===g?'on':'')+'" style="--mgc:'+G_.c+'" onclick="fmgPick('+k+')">'+G_.n+(n>1?'<small>'+n+'</small>':'')+(typeof fmgMark==='function'?fmgMark(G_.n,1):'')+'</button>':''}).join('')+'</div>';
  const cur=L[g],ts=cur.length<=1?'':'<div class="fxt mgT mgN'+Math.min(cur.length,5)+'" style="--mgc:'+FMGRP[g].c+'">'+cur.map(i=>
    '<button type="button" class="'+(i===fxTab?'on':'')+'" data-n="'+String(FM[i].n).replace(/"/g,'&quot;')+'" onclick="fmgTab('+i+')">'+FM[i].n+(typeof fmgMark==='function'?fmgMark(FM[i].n,0):'')+'</button>').join('')+'</div>';
  fxShow('<div class="mgW">'+gs+ts+'</div>'+FM[fxTab].r(),[['閉じる',null,'g']]);
  return true}catch(e){if(typeof FERR!=='undefined')FERR++;try{console.error('[menu]',e)}catch(_){}return false}}
