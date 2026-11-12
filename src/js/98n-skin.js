/* ---------- 衣装(スキン) (feature) ----------
   英雄のドット絵を着せ替える(色だけでなく髪・帽子・飾りの形も変わる。性能は変わらない)。強化画面「英雄」グループの下に「衣装」。
   ・仕組み: 英雄のコマ(h0〜 の 待機/待機B/構え/攻撃)を、衣装の絵(SKART)から作り直して **同じキャンバスに** 塗り直す。
     キャンバスは差し替えないので、戦闘・物語の顔・タイトルなど SPR['h0'] を使う所は全部そのまま変わる。白シルエット等のキャッシュは消す。
     (作り手提供のカットイン用イラスト PIMG は変わらない)
   ・手に入れ方(docs/DESIGN.md: 目標とごほうび・進み具合が見える): 宝石で買う / 条件を満たす(進み具合 7/10 を表示)。
   ・完全版だけの衣装や4人目の衣装は、@full のファイルが SKD に足す(skAdd)。
   セーブ: localStorage['pachi2_skin'] = {own:{'英雄:衣装':1}, cur:[衣装id,...]}。転生で残る。 */
const SKGEM=400;   // 宝石で買う衣装の値段。やり込み要素なので かなり高め(作り手の方針「やり込んでやっと手に入る達成感」)。条件つきも長く遊んで届く数に
/* 衣装の絵(SKART): 元の絵からの「色の上書き pal」と「行の差し替え head/body/legs/legsS」。10-sprites の hBuild(i,art) が4コマを作る。
   作り手の方針: 色ちがいではなく、衣装ごとにコンセプトがあり、形と飾りが一目で分かること。
   蒼炎の剣士=燃え上がる蒼い髪・黒い鎧・なびく蒼いマフラー / 黄金の鎧=額の金の輪と紅玉・大きな肩当て・白いマント /
   紅の魔女=先の折れた紅い帽子・黒い帯と金の留め具・黒い服に紅の飾り / 白の賢者=金の輪と宝玉のついた白いフード・白い法衣 /
   夕焼けの狩人=フードを下ろして赤い鉢巻きと羽根飾り・橙の服 / 夜の狩人=三日月の印の紺のフード・紫の覆面と なびくマフラー */
const SKART={
'0:blue':{pal:'h#3a8cff,H#1f56b8,i#7fd8ff,I#d8f8ff,D#102a70,u#7ff3ff,U#1a9ac0,a#4a5578,b#2a3050,c#7fd8ff,F#101424,r#7ff3ff,R#2a9ac8,J#10506a,t#2a3050,T#181c30,K#0a0c18,g#7ff3ff,N#1a7a9a,l#d8f8ff,m#7fd8ff,M#1f56b8,o#181c30,L#0a0c18',
 head:[
  "..............kk",
  ".............kIik..k",
  ".......k....kIiihkkik",
  "......kik..kiiihhhkihk..k",
  "...k.kiihkkiihhhhhhhhhkkhk",
  "...khkihhhhhhhhhhhhhhhhhHhk",
  "....khihhhhhhhhhhhhhhhhHHk",
  "....khhhhhhhhhhhhhhhhhhHHk",
  "...khhhhHhhhhHhhhhHhhhhHHHk",
  "....khhHzhhhHzhhhHzhhhHHHk",
  "....khHzsszHzsssHzssszHHk",
  "....kHHseeessssseeeszHHk",
  ".....kHswUUsssSswUUsskk",
  ".....kkswuussSSswuusSk",
  "......ksssssssssssssSk",
  ".......kssssxxxsssSSk"],
 body:[
  "........kkrrrrrrrrrRkk",
  "..krrkkkcakrrrrrrRRkabkk",
  ".krRkkcaabkarrgrRRakbabbk",
  "krRk.kaabkkcgggggbbkkbabk",
  "kRk..kssk.kcacgcabbk.kssk",
  "......kk..koooggoook..kk",
  "..........krraaaabrRk",
  "..........krrkttTkRRk"]},
'0:gold':{pal:'a#ffd24d,b#b98300,c#fff6c0,F#6a4a00,r#f4f4ff,R#b8c0e0,J#6a70a8,t#8a1c28,T#5a1020,K#2a0810,g#ffffff,N#b98300,j#ff3050,l#fffbe0,m#ffd24d,M#8a5a00',
 head:[
  "..............k",
  ".........k...kIk...k",
  "........kik.kiihk.kik",
  "....k..kiihkiihhhkkihhk..k",
  "...khkkiihhhhhhhhhhhhhhkkhk",
  "...khhiihhhhhhhhhhhhhhhhHhk",
  "....khihhhhhhahhhhhhhhhHHk",
  "....khhhhhhhhkakhhhhhhhHHk",
  "...khaaaaaaaajaaaaaaaabHHHk",
  "....khhHzhhhHzhhhHzhhhHHHk",
  "....khHzsszHzsssHzssszHHk",
  "....kHHseeessssseeeszHHk",
  ".....kHswUUsssSswUUsskk",
  ".....kkswuussSSswuusSk",
  "......ksssssssssssssSk",
  ".......kssssxxxsssSSk"],
 body:[
  "......kkkkrrrrrrrrrRkkkk",
  "....kkccakrrrrrrrRRkaabkk",
  "...kccaabkarrrrRRakbaabbk",
  "...kcaabkkcaajaabbkkbaabk",
  ".....kssk.kcaaaaabbk.kssk",
  "......kk..koooggoook..kk",
  "........kRrkrraaaabrRkrRk",
  "........kRrkrrkttTkRRkRRk"]},
'1:red':{pal:'h#c8203a,H#8a1028,j#ff5a6a,D#4a0818,p#3a2c44,P#221a2c,c#5a4a68,G#0c0810,u#ff5a6a,U#b01838,q#ff4a6a,Q#8a1028,B#18121e,r#e0443a,o#3a2c44,L#0c0810',
 head:[
  ".................kkkk",
  "...............kkjhhHk",
  ".............kkjhhHkkHk",
  "...........kkjjhhHHk.kk",
  "..........kjjhhhhHHk",
  ".........kjjhhhhhhHHk",
  "........kBBBByyyBBBBBk",
  "..kkkkkkjjhhhhhhhhhHHkkkkkk",
  "..kjjjhhhhhhhhhhhhhhhhHHHHHk",
  "...kkkkVVVVVVVVVVVVVVVkkkk",
  "......kvvvvsvvvvsvvvvVk",
  "......kvseeessseeesvVVk",
  "......kvswUUssswUUsvVVk",
  "......kvswuusSswuusvVVk",
  "......kvvsssssssssSvVVk",
  "......kvvkssxxssSkvVVVk"],
 body:[
  "......kvvkPyyqyyPkvVVk",
  ".....kkvkppprrrpPPkVVkk",
  "....kpckcpppppppPPPkVkPk",
  "....kppkprppppppprPkkPPk",
  "....kssk.kpppppPPPk.kssk",
  ".....kk..krrppppPrrk..kk",
  ".........kpppppPPPPk",
  "........kppprpppPrPPk"],
 legs:[
  "........kpppppppPPPPk",
  ".......kpppppppPPPPPPk",
  ".......kppprpppPPPrPPk",
  ".......krrpppppPPPPrrk",
  "........kkrrrrrrrrrkk",
  ".........koook.koook",
  "........kooook.kooook",
  "........kkkkkk.kkkkkk"],
 legsS:[
  "........kpppppppPPPPk",
  ".......kpppppppPPPPPPk",
  "......kpppprpppPPPrPPPk",
  ".....krrppppppPPPPPPrrk",
  "......kkrrrrrrrrrrrkk",
  "........koook...koook",
  ".......kooook..kooook",
  ".......kkkkkk..kkkkkk"]},
'1:white':{pal:'p#f2f4ff,P#b8c0e0,c#ffffff,G#6a70a8,v#fff0c8,V#e0c890,F#9a7a40,u#7fb0ff,U#3a60c0,q#7fb0ff,Q#2a4a9a,o#e0c060,L#8a6a10',
 head:[
  "",
  "...........kkkkkkkk",
  ".........kkccccpppPkk",
  "........kccpppppppppPk",
  ".......kcpppppppppppPPk",
  "......kcppppppppppppPPPk",
  ".....kyyyyyyyyqyyyyyyYYYk",
  ".....kppkVVVVVVVVVVVVVkPPk",
  ".....kpkvvvvvvvvvvvvvvVkPk",
  ".....kpkvvVvvvvVvvvvVvVkPk",
  ".....kpvvvvsvvvvsvvvvVPk",
  ".....kpvseeessseeesvVVPk",
  ".....kpvswUUssswUUsvVVPk",
  ".....kpvswuusSswuusvVVPk",
  ".....kpvvsssssssssSvVVPk",
  "......kvvkssxxssSkvVVVk"],
 body:[
  "......kvvkPyyqyyPkvVVk",
  ".....kkvkpppyyypPPkVVkk",
  "....kpckcpppyqypPPPkVkPk",
  "....kppkpypppypppyPkkPPk",
  "....kssk.kpppppPPPk.kssk",
  ".....kk..kyyppppPyyk..kk",
  ".........kpppppPPPPk",
  "........kpppypppPyPPk"]},
'2:sun':{pal:'g#ff9a3d,d#b8621a,h#ff9a3d,H#b8621a,c#ffd0a0,D#6a3008,r#e0443a,R#a8262e,J#701030,u#ffb040,U#c06a10',
 head:[
  "",
  "....................kk",
  "..........kkkkkkkkk.kxxk",
  "........kknnnnnnnnnkkxrk",
  ".......knnnnnnnnnnnnNkrk",
  "......knnnnnnnnnnnnnnNNk",
  "......krrrrrrrrrrrrrrRRkk",
  "......kRrrrrrrrrrrrrRRRkrk",
  "......knnnnNnnnNnnnNnNNkRrk",
  "......knnnnnznnnznnnNNNk.kRk",
  "......knnNzeeesszeeesNNk..k",
  "......knnNswUUssswUUsNk",
  ".......kNkswuusSswuuSk",
  ".......kkkggggggggggdk",
  "..........kgggggggddk",
  "...........kkgggddkk"]},
'2:night':{pal:'h#3a4488,H#27306a,c#6a7ac8,D#10143a,g#4a5a9a,d#2c3470,u#7ff3ff,U#2a9ac8,b#4a4a6a,B#2a2a44,L#101020,p#a060e0,P#6a30a8,n#3a3a4a,N#22222e,F#0c0c14',
 head:[
  "............kkkkkkk",
  "..........kkcchhhhhkk",
  ".........kcchhhhhhhhHk",
  "........kcchhhyyhhhhhHk",
  ".......kchhhhyhhhhhhhHHk",
  ".......khhhhhhyyhhhhhHHk",
  "......khhhHkkkkkkkkkHHHHk",
  "......khhHknnnnnnnnNkHHHk",
  "......khhHknnNnnnNnnNkHHk",
  "......khHknnznnnznnnNkHHk",
  "......khHkzeeesszeeeskHHk",
  "......khHkswUUssswUUskHHk",
  "......khHkswuusSswuuSkHHk",
  "......khHkppppppppppPkHHk",
  ".......kHHkpppppppPPkHHk",
  "........kHHkkpppPPkkHHk"],
 body:[
  ".......kkhhppppkkhhhHHkk",
  "..kpk.kgkhhhhhhhhhhHHkgdk",
  ".kpPkkggkkbgggggggddkkgdk",
  "kpPk.kggk.kgbgggggdk.kgdk",
  "kPk..kssk.kggbggyddk.kssk",
  "......kk..kbbbbbBBBk..kk",
  "..........kgggggdddk",
  "..........kggkkkkddk"]}};
const SKD={
 0:[{id:'d',n:'いつもの'},
    {id:'blue',n:'蒼炎の剣士',gem:SKGEM,art:SKART['0:blue']},
    {id:'gold',n:'黄金の鎧',lb:'JACKPOT 50回',pr:()=>[X.st.jp||0,50],art:SKART['0:gold']}],
 1:[{id:'d',n:'いつもの'},
    {id:'red',n:'紅の魔女',gem:SKGEM,art:SKART['1:red']},
    {id:'white',n:'白の賢者',lb:'転生 20回',pr:()=>[X.pres||0,20],art:SKART['1:white']}],
 2:[{id:'d',n:'いつもの'},
    {id:'sun',n:'夕焼けの狩人',gem:SKGEM,art:SKART['2:sun']},
    {id:'night',n:'夜の狩人',lb:'大当たり 3000回',pr:()=>[X.st.hit||0,3000],art:SKART['2:night']}]};
const SK={own:{},cur:[]};
try{const d=JSON.parse(localStorage.getItem('pachi2_skin')||'{}');if(d.own&&typeof d.own==='object')for(const k in d.own)if(d.own[k]&&/^\d:[a-z0-9]{1,10}$/.test(k))SK.own[k]=1;
  if(Array.isArray(d.cur))d.cur.slice(0,8).forEach((v,i)=>{if(typeof v==='string'&&/^[a-z0-9]{1,10}$/.test(v))SK.cur[i]=v})}catch(e){}
function skSave(){try{localStorage.setItem('pachi2_skin',JSON.stringify({own:SK.own,cur:SK.cur}))}catch(e){}}
const SKFR=['','b','w','s'],SKO={};   // SKO[コマ名]=元の色の一覧(初回に控える)
const skOf=(i,id)=>(SKD[i]||[]).find(s=>s.id===id);
const skCur=i=>{const s=skOf(i,SK.cur[i]||'d');return s&&skHas(i,s)?s:skOf(i,'d')};
function skHas(i,s){if(!s)return false;if(s.id==='d'||SK.own[i+':'+s.id])return true;if(s.pr){try{const p=s.pr();return p[0]>=p[1]}catch(e){return false}}return false}
/* 塗り直し: 衣装の絵(art)があれば hBuild で4コマを作り直し、無ければ元の絵。同じキャンバスに塗る(大きさは同じ) */
function skPix(i,s,f){if(s&&s.art&&typeof hBuild==='function'){try{return hBuild(i,s.art)[f]}catch(e){}}return SKO['h'+i+f]||PXL['h'+i+f]||[]}
function skApply(i){try{const s=skCur(i);
  for(const f of SKFR){const n='h'+i+f,c=SPR[n];if(!c||!PXL[n])continue;if(!SKO[n])SKO[n]=PXL[n].map(q=>q.slice());
    const x=c.getContext('2d');if(!x)continue;x.clearRect(0,0,c.width,c.height);
    PXL[n]=skPix(i,s,f).map(q=>{x.fillStyle=q[2];x.fillRect(q[0],q[1],1,1);return [q[0],q[1],q[2]]});
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
function skSvg(i,s){const key=s.id;SKSV[i]=SKSV[i]||{};if(SKSV[i][key])return SKSV[i][key];let r='';
  for(const q of skPix(i,s,''))r+='<rect x="'+q[0]+'" y="'+q[1]+'" width="1" height="1" fill="'+q[2]+'"/>';
  return SKSV[i][key]='<svg viewBox="0 0 32 32" width="48" height="48" shape-rendering="crispEdges">'+r+'</svg>'}
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
