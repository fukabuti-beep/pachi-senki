/* ---------- 宝石ショップ (feature) ----------
   宝石(ゲーム内で手に入る通貨。お金では買えない品だけを並べる。確率で中身が変わる商品は無い)の使い道を増やす。
   メニュー「育てる」グループの「宝石ショップ」。中は4つの棚:
     ブースト  時間制の一時効果(ゲーム時間で減る。魔石の加護=魔石x2 / 幸運の香=大当たりしやすく / ボーナスタイム招来 / 遠征の早馬)
     勲章      宝石で少しずつ伸びる永続強化(上限あり・値段は Lv ごとに上がる。転生で残る)
     便利      ミッション入れ替え(1日1回)・自動強化ターボ(魂の祭壇の自動強化を4倍速に)
     見た目    玉の色 / 図柄の色 / 筐体テーマ / 称号。性能は変わらない“自慢”要素
   セーブ: localStorage['pachi2_gemshop'] = {lv:{勲章}, own:{ball:[],reel:[],cab:[],title:[],turbo}, sel:{ball,reel,cab,title}, bf:{ms,luck}, sw:'入れ替えた日', tb:ターボON/OFF, spent}
   すべて転生しても残る(宝石そのものが 96s の pachi2_res で転生後も残るのと同じ扱い)。
   他ファイルは無編集: SB.a / SB.g / resMs / hitRoll / expGo / drawB / pxText / update をラップ、BT.dur・BALL_ の中身・MS を実行時に書き換える。 */
const GS_KEY='pachi2_gemshop';
const GSM=[   // 勲章(永続)。c(l)=Lv l→l+1 の値段
  {k:'atk',n:'戦神の勲章',d:l=>'ダメージ +'+(4*l)+'%',max:10,c:l=>10+5*l,col:'#ff7a7a'},
  {k:'gold',n:'黄金の勲章',d:l=>'ゴールド +'+(4*l)+'%',max:10,c:l=>10+5*l,col:'#ffd400'},
  {k:'ms',n:'魔石の勲章',d:l=>'魔石 +'+(10*l)+'%',max:10,c:l=>8+4*l,col:'#c8a0ff'},
  {k:'exp',n:'遠征の羅針盤',d:l=>'遠征の時間 -'+(6*l)+'%',max:5,c:l=>12+6*l,col:'#7ff3ff'},
  {k:'bt',n:'祭りの太鼓',d:l=>'ボーナスタイム +'+(4*l)+'秒',max:5,c:l=>10+5*l,col:'#ffa04a'}];
const GSB=[   // ブースト(一時)。sec=1回で足す秒数(上限 cap 秒まで重ねがけ)
  {k:'ms',n:'魔石の加護',d:'5分間 魔石 x2',c:3,sec:300,cap:1800,col:'#c8a0ff'},
  {k:'luck',n:'幸運の香',d:'3分間 大当たりしやすい(確率 約1.5倍)',c:4,sec:180,cap:900,col:'#ff7ab0'}];
const GSC={   // 見た目(買い切り。0番は最初から持っている)
  ball:{n:'玉の色',L:[['銀玉',0,['#8a93b8','#e9eef8','#fff','#aab2d0']],['紅玉',6,['#7a1020','#ff4a5a','#ffd0d4','#c02030']],['翠玉',6,['#0c5a2a','#3ddc7a','#d8ffe4','#1e9a4a']],
    ['紫水晶',8,['#3a1470','#a066ff','#ecdcff','#6a3ac8']],['桜玉',10,['#a03a6a','#ffb0d0','#fff0f6','#e07aa8']],['黒鉄',10,['#000000','#3a3a4a','#c8c8e0','#1a1a24']]]},
  reel:{n:'図柄の色',L:[['標準',0],['七色',12],['氷結',10],['業火',10]]},
  cab:{n:'筐体テーマ',L:[['標準',0],['桜吹雪',15],['深海',15],['漆黒',20],['黄金郷',25]]},
  title:{n:'称号',L:[['駆け出し',5],['釘読み名人',15],['確変の申し子',30],['777の使い手',50],['激アツ王',80],['伝説の打ち手',150],['宝石王',300]]}};
const GSRC=[null,['#ff5a5a','#ffa04a','#ffd400','#7aff6a','#22e0ff','#5a8aff','#c87aff','#ff7ab0','#ffffff','#ffe14d'],['#e8fbff','#3aa0ff'],['#fff0a0','#ff3a1a']];
const GS={lv:{},own:{ball:[0],reel:[0],cab:[0],title:[],turbo:0},sel:{ball:0,reel:0,cab:0,title:-1},bf:{ms:0,luck:0},sw:'',tb:1,spent:0,tab:0,msf:0};
function gsLoad(){try{const j=JSON.parse(localStorage.getItem(GS_KEY)||'null');if(!j||typeof j!='object')return;const n=(v,hi)=>{v=Math.floor(+v);return Number.isFinite(v)&&v>0?Math.min(v,hi):0};
  GSM.forEach(m=>{const v=n((j.lv||{})[m.k],m.max);if(v)GS.lv[m.k]=v});
  for(const k in GSC){const L=GSC[k].L,a=((j.own||{})[k]);GS.own[k]=k==='title'?[]:[0];if(Array.isArray(a))a.forEach(i=>{i=Math.floor(+i);if(i>=0&&i<L.length&&GS.own[k].indexOf(i)<0)GS.own[k].push(i)})
    const s=Math.floor(+((j.sel||{})[k]));GS.sel[k]=GS.own[k].indexOf(s)>=0?s:(k==='title'?-1:0)}
  GS.own.turbo=(j.own||{}).turbo?1:0;GS.tb=j.tb===0?0:1;
  GSB.forEach(b=>{GS.bf[b.k]=Math.min(b.cap,n((j.bf||{})[b.k],b.cap))});
  GS.sw=typeof j.sw=='string'?j.sw.slice(0,10):'';GS.spent=n(j.spent,1e9)}catch(e){}}
gsLoad();
function gsSave(){try{localStorage.setItem(GS_KEY,JSON.stringify({lv:GS.lv,own:GS.own,sel:GS.sel,bf:{ms:Math.ceil(GS.bf.ms),luck:Math.ceil(GS.bf.luck)},sw:GS.sw,tb:GS.tb,spent:GS.spent}))}catch(e){}}
const gsLv=k=>GS.lv[k]||0;
const gsIcon=()=>typeof resIcon==='function'?resIcon('gem'):'宝石';
const gsGem=()=>typeof RES!=='undefined'?RES.gem:0;
/* 支払い(足りなければ false) */
function gsPay(c){if(typeof RES==='undefined')return false;if(RES.gem<c){fxToast('宝石が足りない(あと '+(c-RES.gem)+')','#aaa');return false}
  RES.gem-=c;GS.spent+=c;try{resSave()}catch(e){}return true}
function gsRe(){gsSave();try{if(typeof fxOpen!=='undefined'&&fxOpen)fxMenu()}catch(e){}}
function gsSe(big){try{kyuin(big?5:2,'#7ff3ff')}catch(e){}}
/* ---- 勲章 ---- */
function gsBuyM(k){const m=GSM.find(x=>x.k===k);if(!m)return false;const l=gsLv(k);if(l>=m.max){fxToast(m.n+' は MAX','#aaa');return false}
  if(!gsPay(m.c(l)))return false;GS.lv[k]=l+1;gsApply();fxToast(m.n+' Lv'+(l+1)+'! '+m.d(l+1),m.col);gsSe(l+1>=m.max);gsRe();return true}
/* ---- ブースト ---- */
function gsBuyB(k){const b=GSB.find(x=>x.k===k);if(!b)return false;if(GS.bf[k]+b.sec>b.cap){fxToast('これ以上は重ねられない(最大 '+Math.round(b.cap/60)+'分)','#aaa');return false}
  if(!gsPay(b.c))return false;GS.bf[k]+=b.sec;try{banner(b.n+'!! '+b.d.replace(/^\S+ /,''),b.col)}catch(e){}gsSe(1);gsRe();return true}
const gsBtCost=()=>3;
function gsCallBt(){if(typeof BT==='undefined'||typeof btStart!=='function')return false;if(BT.cur){fxToast('ボーナスタイム中です','#aaa');return false}
  if(typeof btBusy==='function'&&btBusy()){fxToast('演出が終わってから呼べます','#aaa');return false}
  if(!gsPay(gsBtCost()))return false;btStart();gsRe();return true}
/* 遠征の早馬: 残り時間を1時間短縮(宝石2)/ 今すぐ帰還(30分ごとに宝石1) */
const gsExpLeft=()=>typeof EXP!=='undefined'&&EXP.d>=0&&typeof expLeft==='function'?expLeft():0;
const gsNowCost=()=>Math.max(1,Math.ceil(gsExpLeft()/1800));
function gsExpRush(all){const l=gsExpLeft();if(l<=0){fxToast('遠征中の隊がいない','#aaa');return false}
  const c=all?gsNowCost():2;if(!gsPay(c))return false;EXP.t0-=(all?l+1:Math.min(l+1,3600))*1000;try{expSave()}catch(e){}
  fxToast(all||l<=3600?'早馬で遠征隊が帰ってきた!':'遠征の残りを1時間短縮!','#7ff3ff');gsSe(0);gsRe();return true}
/* ---- 便利 ---- */
const gsToday=()=>{try{return typeof msToday==='function'?msToday():''}catch(e){return ''}};
function gsSwapOk(j){return typeof MS!=='undefined'&&MS&&!MS.c[j]&&MS.p[j]<msGoal(j)&&GS.sw!==gsToday()}
function gsSwap(j){try{msCheckDay()}catch(e){}if(typeof MS==='undefined'||!MS)return false;if(GS.sw===gsToday()){fxToast('入れ替えは1日1回まで','#aaa');return false}
  if(MS.c[j]||MS.p[j]>=msGoal(j)){fxToast('達成済みのミッションは入れ替えできない','#aaa');return false}
  const cand=[];MSD.forEach((m,i)=>{if(MS.ids.indexOf(i)<0&&m.k!=='stage')cand.push(i)});if(!cand.length)return false;
  if(!gsPay(3))return false;const i=cand[Math.floor(Math.random()*cand.length)];MS.ids[j]=i;MS.lv[j]=0;MS.p[j]=0;MS.c[j]=0;try{msSave()}catch(e){}
  GS.sw=gsToday();fxToast('ミッションを「'+MSD[i].n+'」に入れ替えた','#ffa04a');gsSe(0);gsRe();return true}
function gsBuyTurbo(){if(GS.own.turbo)return false;if(!gsPay(20))return false;GS.own.turbo=1;GS.tb=1;fxToast('自動強化ターボ! 自動強化が4倍速に','#8dff7a');gsSe(1);gsRe();return true}
function gsTurboToggle(){GS.tb=GS.tb?0:1;gsRe()}
/* ---- 見た目 ---- */
function gsBuyC(kind,i){const C=GSC[kind];if(!C||!C.L[i])return false;const own=GS.own[kind].indexOf(i)>=0;
  if(!own){if(!gsPay(C.L[i][1]))return false;GS.own[kind].push(i);fxToast(C.n+'「'+C.L[i][0]+'」を手に入れた!','#7ff3ff');gsSe(1)}
  GS.sel[kind]=(kind==='title'&&own&&GS.sel.title===i)?-1:i;gsApply();gsRe();return true}
/* ---- 効果の反映 ---- */
let GS_BALL0=null;
function gsApply(){
  try{if(typeof BT!=='undefined')BT.dur=40+4*gsLv('bt')}catch(e){}
  try{if(typeof BALL_!=='undefined'&&BALL_.getContext){const x=BALL_.getContext('2d'),p=GSC.ball.L[GS.sel.ball]||GSC.ball.L[0];x.clearRect(0,0,BALL_.width,BALL_.height);x.drawImage(discSpr(4,p[2]),0,0)}}catch(e){}
  try{const b=document.body;if(b&&b.classList){for(let i=1;i<GSC.cab.L.length;i++)b.classList.remove('gsc'+i);if(GS.sel.cab>0)b.classList.add('gsc'+GS.sel.cab)}}catch(e){}}
gsApply();
{const oa=SB.a,og=SB.g;SB.a=()=>oa()*(1+.04*gsLv('atk'));SB.g=()=>og()*(1+.04*gsLv('gold'))}
if(typeof resMs==='function'){const o=resMs;resMs=function(n){let v=n*(1+.1*gsLv('ms'))*(GS.bf.ms>0?2:1)+GS.msf;const w=Math.floor(v);GS.msf=v-w;return o.call(this,w)}}
/* 幸運の香: 通常時のハズレを一部アタリに(元の確率 p → 約1.5p。RUSH 中・天井は元のまま) */
if(typeof hitRoll==='function'){const o=hitRoll;hitRoll=function(){const h=o.apply(this,arguments);try{if(!h&&GS.bf.luck>0&&!(G.rush>0)){const p=hitP(),q=Math.min(.5,p*.5/Math.max(.01,1-p));if(Math.random()<q){DRY=0;return true}}}catch(e){}return h}}
/* 遠征の羅針盤: 出発時刻を前にずらして所要時間を短く */
if(typeof expGo==='function'){const o=expGo;expGo=function(i){const r=o.apply(this,arguments);try{if(r&&gsLv('exp')>0){EXP.t0-=EXD[i].sec*.06*gsLv('exp')*1000;expSave()}}catch(e){}return r}}
/* 図柄の色: 中央の窓の数字(通常回転時)だけ色を差し替える。リーチ中の赤は情報なのでそのまま */
if(typeof pxText==='function'){const o=pxText;pxText=function(c,s,x,y,sc,c1,c2,al,ol){const R=GSRC[GS.sel.reel];
  if(R&&sc===5&&c1==='#ffe14d'&&typeof s==='string'&&/^\d \d \d$/.test(s)){try{const x0=x-pxW(s,sc)/2;for(let i=0;i<5;i+=2){const d=+s[i],a=R.length>2?R[d]:R[0],b=R.length>2?pxShade(R[d]):R[1];o.call(this,c,s[i],x0+i*6*sc,y,sc,d===7?'#ffd400':a,d===7?'#ff5a00':b,'l',ol)}return}catch(e){}}
  return o.apply(this,arguments)}}
/* ゲーム時間でブーストを減らす */
let GSSV=0;
function gsUpd(dt){let ch=0;for(const k in GS.bf)if(GS.bf[k]>0){GS.bf[k]=Math.max(0,GS.bf[k]-dt);if(GS.bf[k]<=0){ch=1;const b=GSB.find(x=>x.k===k);try{showMsg(b.n+' 終了','#aaa')}catch(e){}}}
  GSSV+=dt;if(ch||GSSV>5){GSSV=0;gsSave()}
  if(GS.own.turbo&&GS.tb&&typeof soulAutoTick==='function')soulAutoTick(dt*3)}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{if(run)gsUpd(dt)}catch(e){}return r}}
try{if(window.addEventListener)window.addEventListener('pagehide',()=>{try{gsSave()}catch(e){}})}catch(e){}
/* 戦闘画面: 左下に称号、右下(所持数の上)にブーストの残り */
function gsDraw(){const ti=GS.sel.title>=0?GSC.title.L[GS.sel.title]:null,bs=GSB.filter(b=>GS.bf[b.k]>0);if(!ti&&!bs.length)return;
  bc.save();bc.font='10px '+FN;
  if(bs.length){bc.textAlign='right';let x=354;bs.forEach(b=>{const s=(b.k==='ms'?'魔x2 ':'運 ')+resT(GS.bf[b.k]);bc.fillStyle='#000';bc.fillText(s,x+1,135);bc.fillStyle=b.col;bc.fillText(s,x,134);x-=s.length*7+8})}
  if(ti){const s='『'+ti[0]+'』',w=s.length*10+6;bc.textAlign='left';bc.fillStyle='rgba(8,4,24,.7)';bc.fillRect(3,3,w,13);bc.fillStyle='#000';bc.fillText(s,7,14);bc.fillStyle=GS.sel.title>=5?'#ffd400':'#7ff3ff';bc.fillText(s,6,13)}
  bc.restore()}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{gsDraw()}catch(e){}return r}}
/* ---- メニュー ---- */
const GST=['ブースト','勲章','便利','見た目'];
function gsTab(i){GS.tab=i;gsRe()}
const gsBtn=(lab,on,js)=>'<button class="fxb gsb'+(on?'':' d')+'" onclick="'+js+'">'+lab+'</button>';
const gsPrice=c=>'<i class="gsg"></i>'+c;
function gsRow(name,sub,right,cls){return '<div class="gsr '+(cls||'')+'"><span>'+name+'<br><small>'+sub+'</small></span><span>'+right+'</span></div>'}
function gsMenu(){const g=gsGem();let h='<div class="fxh">宝石ショップ</div><div class="gsw"><span class="gsi">'+gsIcon()+'</span><b class="gsn">'+fmt(g)+'</b><small>所持</small></div>'+
  '<div class="fxt gst">'+GST.map((t,i)=>'<button type="button" class="'+(i===GS.tab?'on':'')+'" onclick="gsTab('+i+')">'+t+'</button>').join('')+'</div><div class="fxl gsl">';
  if(GS.tab===0){
    h+=GSB.map(b=>{const r=GS.bf[b.k];return gsRow('<b style="color:'+b.col+'">'+b.n+'</b>',b.d+(r>0?' / 残り '+resT(r):''),gsBtn(gsPrice(b.c),g>=b.c&&r+b.sec<=b.cap,'gsBuyB(\''+b.k+'\')'),r>0?'on':'')}).join('');
    const bc_=typeof BT!=='undefined'&&BT.cur;h+=gsRow('<b style="color:#ffa04a">ボーナスタイム招来</b>',bc_?'ただいま ボーナスタイム中':'今すぐ ボーナスタイム('+(typeof BT!=='undefined'?BT.dur:40)+'秒)を呼ぶ',gsBtn(gsPrice(gsBtCost()),g>=gsBtCost()&&!bc_,'gsCallBt()'));
    const l=gsExpLeft();h+=gsRow('<b style="color:#7ff3ff">遠征の早馬</b>',l>0?'遠征の残り '+expFmt(l):'遠征中の隊がいる時に使える',l>0?gsBtn('-1時間 '+gsPrice(2),g>=2,'gsExpRush(0)')+gsBtn('今すぐ '+gsPrice(gsNowCost()),g>=gsNowCost(),'gsExpRush(1)'):'-');
    h+='</div><div class="fxs gsh">ブーストはゲーム時間で減る(閉じている間は止まる)。重ねがけで時間が延びる。</div>'}
  else if(GS.tab===1){
    h+=GSM.map(m=>{const l=gsLv(m.k),mx=l>=m.max,c=mx?0:m.c(l);return gsRow('<b style="color:'+m.col+'">'+m.n+'</b> Lv'+l+'/'+m.max,m.d(l)+(mx?'':' → '+m.d(l+1).replace(/^\S+ /,'')),mx?'<span class="gsmx">MAX</span>':gsBtn(gsPrice(c),g>=c,'gsBuyM(\''+m.k+'\')'),l?'on':'')}).join('');
    const tot=GSM.reduce((a,m)=>{for(let l=gsLv(m.k);l<m.max;l++)a+=m.c(l);return a},0);
    h+='</div><div class="fxs gsh">勲章は転生しても残る。全部 MAX まであと 宝石 '+fmt(tot)+'</div>'}
  else if(GS.tab===2){
    let ms='';try{msCheckDay();ms=MS.ids.map((id,j)=>gsRow(MSD[id].n+' '+msGoal(j)+MSD[id].u,MS.c[j]?'受取済':MS.p[j]>=msGoal(j)?'達成!':'進み '+Math.min(MS.p[j],msGoal(j))+'/'+msGoal(j),gsSwapOk(j)?gsBtn('入替 '+gsPrice(3),g>=3,'gsSwap('+j+')'):'-')).join('')}catch(e){}
    h+='<div class="gss">ミッション入れ替え(1日1回 / '+(GS.sw===gsToday()?'今日は入替済':'今日はまだ使える')+')</div>'+ms;
    const au=typeof soulLv==='function'&&soulLv('auto')>0;
    h+='<div class="gss">自動強化ターボ</div>'+gsRow('<b style="color:#8dff7a">自動強化ターボ</b>','魂の祭壇の自動強化を 2秒→0.5秒ごとに'+(au?'':'(先に祭壇で自動強化が必要)'),GS.own.turbo?gsBtn('ターボ: '+(GS.tb?'ON':'OFF'),1,'gsTurboToggle()'):gsBtn(gsPrice(20),g>=20&&au,'gsBuyTurbo()'),GS.own.turbo?'on':'');
    h+='</div>'}
  else{
    for(const k in GSC){const C=GSC[k];h+='<div class="gss">'+C.n+(k==='title'?'(戦闘画面の左上に出る。もう一度押すと外す)':'')+'</div><div class="gsc">'+C.L.map((it,i)=>{const own=GS.own[k].indexOf(i)>=0,sel=GS.sel[k]===i;
      return '<button type="button" class="gsk'+(sel?' on':'')+(own?' own':'')+(!own&&g<it[1]?' d':'')+'" onclick="gsBuyC(\''+k+'\','+i+')">'+gsSw(k,i)+'<span>'+it[0]+'</span><small>'+(sel?'使用中':own?'持っている':gsPrice(it[1]))+'</small></button>'}).join('')+'</div>'}
    h+='</div><div class="fxs gsh">見た目は性能に影響しない。買ったものはいつでも付け替えできる。</div>'}
  return h+'<div class="fxs gsh">宝石の入手: JACKPOT / RUSHの高ランク / 図鑑★ / お宝 / ミッション / ログボ / 遠征 / 魔石くじ。使った宝石 累計 '+fmt(GS.spent)+'</div>'}
/* 見本(色見本の小さな四角) */
function gsSw(k,i){let c=[];if(k==='ball')c=[GSC.ball.L[i][2][1],GSC.ball.L[i][2][0]];else if(k==='reel')c=i?(GSRC[i].length>2?[GSRC[i][1],GSRC[i][6]]:GSRC[i]):['#ffe14d','#ff9a2a'];
  else if(k==='cab')c=[['#e4e9ff','#ff2d7a'],['#ffd0e4','#ff5aa0'],['#bff4ff','#1a8ad8'],['#9a9ab0','#ff3a3a'],['#fff0a0','#e6a800']][i];else c=[i>=5?'#ffd400':'#7ff3ff','#140a30'];
  return '<i class="gsv" style="background:'+c[0]+';box-shadow:inset -4px -4px 0 '+c[1]+',0 0 0 2px #000"></i>'}
FM.push({n:'宝石ショップ',r:gsMenu});
/* メニューのグループ分け(29c)に「宝石」を「育てる」へ入れる(29c は無編集。無ければ「その他」に入る) */
try{if(typeof FMGRP!=='undefined'){const g=FMGRP.find(x=>x.n==='育てる');if(g&&g.t.indexOf('宝石')<0)g.t.push('宝石')}}catch(e){}
/* sim/テスト用: 勲章を安い順に買う(買えたら true) */
function gsAutoBuy(){let b=null,c=Infinity;GSM.forEach(m=>{const l=gsLv(m.k);if(l<m.max&&m.c(l)<c){c=m.c(l);b=m.k}});return b&&gsGem()>=c?gsBuyM(b):false}
if(typeof AC_!=='undefined'){AC_.push(['gs1','はじめての買い物','宝石ショップで買い物',1,()=>GS.spent>0,[()=>Math.min(1,GS.spent),1]]);AC_.push(['gs300','宝石の大旦那','宝石を累計300個使う',3,()=>GS.spent>=300,[()=>GS.spent,300]])}
