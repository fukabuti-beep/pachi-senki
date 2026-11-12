/* ---------- 衣装(スキン) (feature) ----------
   英雄のドット絵の色を着せ替える(性能は変わらない)。強化画面「英雄」グループの下に「衣装」。
   ・仕組み: 英雄のコマ(h0〜 の 待機/待機B/構え/攻撃)を、元の色の一覧(PXL)から「色の置きかえ表」で **同じキャンバスに** 塗り直す。
     キャンバスは差し替えないので、戦闘・物語の顔・タイトルなど SPR['h0'] を使う所は全部そのまま変わる。白シルエット等のキャッシュは消す。
     (作り手提供のカットイン用イラスト PIMG は変わらない)
   ・手に入れ方(docs/DESIGN.md: 目標とごほうび・進み具合が見える): 宝石で買う / 条件を満たす(進み具合 7/10 を表示)。
   ・完全版だけの衣装や4人目の衣装は、@full のファイルが SKD に足す(skAdd)。
   セーブ: localStorage['pachi2_skin'] = {own:{'英雄:衣装':1}, cur:[衣装id,...]}。転生で残る。 */
const SKGEM=400;   // 宝石で買う衣装の値段。やり込み要素なので かなり高め(作り手の方針「やり込んでやっと手に入る達成感」)。条件つきも長く遊んで届く数に
const SKD={
 0:[{id:'d',n:'いつもの'},
    {id:'blue',n:'蒼炎の剣士',gem:SKGEM,m:{'#e0443a':'#3a8cff','#a8262e':'#1f56b8','#d1303c':'#3a8cff'}},
    {id:'gold',n:'黄金の鎧',lb:'JACKPOT 50回',pr:()=>[X.st.jp||0,50],m:{'#d5dae6':'#ffd24d','#7c859b':'#b98300'}}],
 1:[{id:'d',n:'いつもの'},
    {id:'red',n:'紅の魔女',gem:SKGEM,m:{'#7a4dff':'#e0443a','#4d2fb8':'#a8262e','#5b6cff':'#c8324a','#3a45b8':'#8a1c30','#c8b8ff':'#ffc0c8'}},
    {id:'white',n:'白の賢者',lb:'転生 20回',pr:()=>[X.pres||0,20],m:{'#7a4dff':'#cfd6ff','#4d2fb8':'#8f98c8','#5b6cff':'#eef1ff','#3a45b8':'#a8b0d8'}}],
 2:[{id:'d',n:'いつもの'},
    {id:'sun',n:'夕焼けの狩人',gem:SKGEM,m:{'#3dd27f':'#ff9a3d','#1b7a47':'#b8621a','#2fb36b':'#e07a2a','#caffb0':'#ffe0b0'}},
    {id:'night',n:'夜の狩人',lb:'大当たり 3000回',pr:()=>[X.st.hit||0,3000],m:{'#3dd27f':'#4a5a9a','#1b7a47':'#27306a','#2fb36b':'#343c78','#caffb0':'#b8c4ff'}}]};
const SK={own:{},cur:[]};
try{const d=JSON.parse(localStorage.getItem('pachi2_skin')||'{}');if(d.own&&typeof d.own==='object')for(const k in d.own)if(d.own[k]&&/^\d:[a-z0-9]{1,10}$/.test(k))SK.own[k]=1;
  if(Array.isArray(d.cur))d.cur.slice(0,8).forEach((v,i)=>{if(typeof v==='string'&&/^[a-z0-9]{1,10}$/.test(v))SK.cur[i]=v})}catch(e){}
function skSave(){try{localStorage.setItem('pachi2_skin',JSON.stringify({own:SK.own,cur:SK.cur}))}catch(e){}}
const SKFR=['','b','w','s'],SKO={};   // SKO[コマ名]=元の色の一覧(初回に控える)
const skOf=(i,id)=>(SKD[i]||[]).find(s=>s.id===id);
const skCur=i=>{const s=skOf(i,SK.cur[i]||'d');return s&&skHas(i,s)?s:skOf(i,'d')};
function skHas(i,s){if(!s)return false;if(s.id==='d'||SK.own[i+':'+s.id])return true;if(s.pr){try{const p=s.pr();return p[0]>=p[1]}catch(e){return false}}return false}
/* 色のまとまり(10-sprites の HGRP: [基本色,[輪郭・影・光の色…]])を使って、基本色の置きかえから 影や輪郭の色も同じだけ動かす。
   表に直接書いてある色はそちらを優先(作り手が色を指定できる) */
function skHsl(h){const n=parseInt(h.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;let H=0,S=0;
  if(d){S=d/(1-Math.abs(2*l-1));H=mx===r?((g-b)/d+6)%6:mx===g?(b-r)/d+2:(r-g)/d+4;H*=60}return [H,S,l]}
function skHex(H,S,L){H=((H%360)+360)%360;S=Math.max(0,Math.min(1,S));L=Math.max(0,Math.min(1,L));const c=(1-Math.abs(2*L-1))*S,x=c*(1-Math.abs(H/60%2-1)),m=L-c/2;
  const q=H<60?[c,x,0]:H<120?[x,c,0]:H<180?[0,c,x]:H<240?[0,x,c]:H<300?[x,0,c]:[c,0,x];return '#'+q.map(v=>('0'+Math.round((v+m)*255).toString(16)).slice(-2)).join('')}
function skMap(i,m){const o=Object.assign({},m||{});try{const G=(typeof HGRP!=='undefined'&&HGRP[i])||[];
  for(const g of G){const to=o[g[0]];if(!to)continue;const a=skHsl(g[0]),b=skHsl(to);
    for(const c of g[1]){if(o[c]||c===g[0])continue;const h=skHsl(c);o[c]=skHex(h[0]+(b[1]<.08?0:b[0]-a[0]),a[1]>.05?h[1]*b[1]/a[1]:b[1],a[2]>.02?h[2]*b[2]/a[2]:h[2])}}}catch(e){}return o}
/* 塗り直し */
function skApply(i){try{const s=skCur(i),m=skMap(i,s&&s.m);
  for(const f of SKFR){const n='h'+i+f,c=SPR[n];if(!c||!PXL[n])continue;if(!SKO[n])SKO[n]=PXL[n].map(q=>q.slice());
    const x=c.getContext('2d');if(!x)continue;x.clearRect(0,0,c.width,c.height);
    PXL[n]=SKO[n].map(q=>{const col=m[q[2]]||q[2];x.fillStyle=col;x.fillRect(q[0],q[1],1,1);return [q[0],q[1],col]});
    delete SPW[n];if(typeof HVDK!=='undefined')delete HVDK[n]}
  if(typeof HUPF!=='undefined')delete HUPF[i];delete SKSV[i]}catch(e){}}
function skAdd(i,list){SKD[i]=(SKD[i]||[{id:'d',n:'いつもの'}]).concat(list.filter(s=>!skOf(i,s.id)));skApply(i)}
function skSet(i,id){const s=skOf(i,id);if(!s)return false;
  if(!skHas(i,s)){if(!s.gem){fxToast(s.lb?s.lb+' で手に入る':'まだ手に入らない','#aaa');return false}
    if(RES.gem<s.gem){fxToast('宝石が '+s.gem+' 個必要','#aaa');return false}
    RES.gem-=s.gem;resSave();SK.own[i+':'+id]=1;try{fxToast('衣装を手に入れた! '+skName(i)+'「'+s.n+'」','#ff9ad0');banner('衣装 '+s.n,'#ff9ad0');fan();if(typeof chJumpAll==='function')chJumpAll(2)}catch(e){}}
  SK.cur[i]=id;skSave();skApply(i);try{grpRefresh()}catch(e){}return true}
/* 条件を満たした瞬間に知らせる(達成感: 黙って増えるのではなく、手に入った時に祝う)。2秒ごとに見る */
let SKT=0;
FU.push(dt=>{SKT+=dt;if(SKT<2||!run)return;SKT=0;let ch=0;
  for(const k of Object.keys(SKD)){const i=+k;for(const s of SKD[i]){if(!s.pr||SK.own[i+':'+s.id])continue;let p=[0,1];try{p=s.pr()}catch(e){}
    if(p[0]>=p[1]){SK.own[i+':'+s.id]=1;ch=1;try{fxToast('衣装を手に入れた! '+skName(i)+'「'+s.n+'」','#ff9ad0');banner('衣装 '+s.n,'#ff9ad0');fan();if(typeof chJumpAll==='function')chJumpAll(2)}catch(e){}}}}
  if(ch)skSave()});
/* 見本(16x16 のドット絵を SVG に。衣装ごとに1回作って覚える) */
const SKSV={};
function skSvg(i,s){const key=s.id;SKSV[i]=SKSV[i]||{};if(SKSV[i][key])return SKSV[i][key];const src=SKO['h'+i]||PXL['h'+i]||[],m=skMap(i,s.m);let r='';
  for(const q of src)r+='<rect x="'+q[0]+'" y="'+q[1]+'" width="1" height="1" fill="'+(m[q[2]]||q[2])+'"/>';
  const W=(SPR['h'+i]&&SPR['h'+i].width)||32;return SKSV[i][key]='<svg viewBox="0 0 '+W+' '+W+'" width="40" height="40" shape-rendering="crispEdges">'+r+'</svg>'}
function skName(i){return (typeof STH!=='undefined'&&STH[i])?STH[i].n:'英雄'+(i+1)}
function skMenu(){let h='<!--sk--><div class="skh">衣装 <small>見た目だけ変わる(転生しても残る)</small></div>';
  for(const k of Object.keys(SKD)){const i=+k;if(i>2&&!(typeof lnOn==='function'&&lnOn()))continue;
    h+='<div class="skr"><b style="color:'+((typeof STH!=='undefined'&&STH[i])?STH[i].c:'#fff')+'">'+skName(i)+'</b><div class="skl">';
    for(const s of SKD[i]){const has=skHas(i,s),on=skCur(i).id===s.id;let sub='';
      if(on)sub='着ている';else if(has)sub='着る';else if(s.gem)sub=(typeof resIcon==='function'?resIcon('gem'):'宝石')+s.gem;
      else if(s.pr){let p=[0,1];try{p=s.pr()}catch(e){}sub=s.lb+' <i>'+Math.min(p[0],p[1])+'/'+p[1]+'</i>'}
      h+='<button type="button" class="skb'+(on?' on':'')+(has?'':' lk')+'" onclick="skSet('+i+',\''+s.id+'\')">'+skSvg(i,s)+'<span>'+s.n+'</span><small>'+sub+'</small></button>'}
    h+='</div></div>'}
  return h}
/* 起動時: 元の色を控えて、選んでいる衣装を塗る。強化画面「英雄」の下に衣装を足す */
for(const k of Object.keys(SKD))skApply(+k);
try{const e=UPG.list.find(x=>x[0]==='英雄');if(e){const o=e[1];e[1]=()=>o()+skMenu()}}catch(e){}
