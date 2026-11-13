/* ---------- 次の目標 と 今日のおみくじ (feature) ----------
   docs/DESIGN.md「また遊びたくなる」: ① やりかけが見える(次の目標 = もうすぐ届く物を進み具合つきで並べる)、
   ② 毎日の小さな儀式(おみくじ = 自分で引く → 何が出るか分からない → その日1日つづく小さなごほうび)。
   ・メニュー「遊ぶ」→「目標」。おみくじは1日1回(日付は 92b の dailyToday)。引くまでは何も起きない(テスト/sim は引かないので不変)。
     大吉 +30% / 中吉 +20% / 小吉 +10% を、ゴールド・ダメージ・魔石・SP のどれかに。翌日に消える(引かなくても損はしない=あおらない)。
   ・目標の一覧は 他の機能の値を読むだけ(仲間/エリアの主/転生/ツララ/塔/衣装/実績)。無い機能(完全版のみ等)は typeof で確かめて飛ばす。
   ラップ: SB.a / SB.g / resMs / spAdd(おみくじの効果)。セーブ: localStorage['pachi2_omi'] = {d:日付,k:種類,r:ランク,n:引いた回数}。転生で残る。 */
const OMK=[['a','闘志','ダメージ'],['g','金運','ゴールド'],['ms','魔石運','魔石'],['sp','必殺運','SP のたまり']],OMR=[['小吉',.1,'#cfd3ff'],['中吉',.2,'#ffd400'],['大吉',.3,'#ff7ac0']];
const OMI={d:'',k:0,r:0,n:0,told:0};
try{const j=JSON.parse(localStorage.getItem('pachi2_omi')||'{}');if(typeof j.d==='string'&&/^[\d-]{8,10}$/.test(j.d))OMI.d=j.d;OMI.k=Math.max(0,Math.min(OMK.length-1,Math.floor(+j.k)||0));OMI.r=Math.max(0,Math.min(2,Math.floor(+j.r)||0));OMI.n=Math.max(0,Math.floor(+j.n)||0)}catch(e){}
function omSave(){try{localStorage.setItem('pachi2_omi',JSON.stringify({d:OMI.d,k:OMI.k,r:OMI.r,n:OMI.n}))}catch(e){}}
const omToday=()=>{try{return dailyToday()}catch(e){return ''}};
const omHas=()=>!!OMI.d&&OMI.d===omToday();
const omB=k=>omHas()&&OMK[OMI.k][0]===k?OMR[OMI.r][1]:0;
function omDraw(){if(omHas()||!run)return false;const x=Math.random();OMI.r=x<.2?2:x<.6?1:0;OMI.k=Math.floor(Math.random()*OMK.length);OMI.d=omToday();OMI.n++;omSave();
  const R=OMR[OMI.r],K=OMK[OMI.k];
  try{fxToast('おみくじ '+R[0]+'! 今日は '+K[1]+'の日('+K[2]+' +'+Math.round(R[1]*100)+'%)',R[2]);banner(R[0]+'!! '+K[1]+'の日',R[2]);if(OMI.r===2){kyuin(4,R[2]);if(typeof chJumpAll==='function')chJumpAll(2)}else fan()}catch(e){}
  try{if(fxOpen)fxMenu()}catch(e){}return true}
{const oa=SB.a,og=SB.g;SB.a=()=>oa()*(1+omB('a'));SB.g=()=>og()*(1+omB('g'))}
{const o=resMs;resMs=function(n){return o.call(this,n*(1+omB('ms')))}}
{const o=spAdd;spAdd=function(x){return o.call(this,x*(1+omB('sp')))}}
/* 起動して少ししたら「引けます」と1回だけ知らせる(きっかけ) */
FU.push(dt=>{if(OMI.told||!run)return;OMI.t=(OMI.t||0)+dt;if(OMI.t<12)return;OMI.told=1;if(!omHas()&&X.best>=5)try{fxToast('今日のおみくじが引けます(☰ → 遊ぶ → 目標)','#ffd400')}catch(e){}});
/* 次の目標: [名前, 今, 目標, 説明] を集めて、近い順に */
function glList(){const L=[],b=Math.max(X.best||0,G.stage||0),add=(n,c,g,d)=>{if(g>0&&c<g)L.push([n,Math.max(0,c),g,d||''])};
  try{if(typeof ALY!=='undefined'){const a=ALY.find(a=>a.st>b);if(a)add('仲間が増える',b,a.st,'STAGE '+a.st)}}catch(e){}
  try{const nx=Math.ceil((b+.5)/25)*25;if(typeof AREAS!=='undefined'&&nx<=200)add('エリアの主 '+(AREAS[nx/25-1]?AREAS[nx/25-1].g:''),b,nx+1,'STAGE '+nx+' を倒す')}catch(e){}
  if(b<30)add('転生ができるようになる',b,30,'STAGE 30');
  try{if(typeof lnOn==='function'&&!lnOn())add('4人目の英雄が仲間に',b,76,'氷原の主を倒す')}catch(e){}
  try{if(typeof TW!=='undefined'&&b>=30){const g=Math.floor(TW.best/10+1)*10;add('無限の塔 塔の加護',TW.best,g,g+'階')}}catch(e){}
  try{if(typeof END!=='undefined'&&!END.n&&b>150)add('エンディング',b,201,'虚無の王を倒す')}catch(e){}
  try{if(typeof SKD!=='undefined')for(const k of Object.keys(SKD)){const i=+k;if(i>2&&!(typeof lnOn==='function'&&lnOn()))continue;for(const s of SKD[i]){if(!s.pr||skHas(i,s))continue;const p=s.pr();add('衣装 '+skName(i)+'「'+s.n+'」',p[0],p[1],s.lb)}}}catch(e){}
  try{if(typeof AC_!=='undefined')for(const a of AC_){if(X.ach[a[0]]||!a[5])continue;add('実績 '+a[1],+a[5][0]()||0,a[5][1],a[2])}}catch(e){}
  const seen={};   // 同じ中身(例: 「4人目の英雄」と その実績)は先に入れた方だけ
  return L.filter(g=>{const k=Math.floor(g[1])+'/'+g[2];if(seen[k]&&/^実績/.test(g[0]))return false;seen[k]=1;return true}).sort((p,q)=>q[1]/q[2]-p[1]/p[2])}
function glMenu(){const R=OMR[OMI.r],K=OMK[OMI.k];
  let h='<div class="fxh">今日のおみくじ</div>';
  if(omHas())h+='<div class="glo" style="--oc:'+R[2]+'"><b>'+R[0]+'</b><span>'+K[1]+'の日<br><small>'+K[2]+' +'+Math.round(R[1]*100)+'%(今日いっぱい)</small></span></div>';
  else h+='<div class="fxs">1日1回。何が出るかは引いてのお楽しみ(今日いっぱい つづく)</div><button type="button" class="fxb" onclick="omDraw()">おみくじを引く</button>';
  const L=glList().slice(0,6);
  h+='<div class="fxh" style="margin-top:12px">次の目標</div>'+(L.length?'<div class="fxs">もうすぐ届くものから順に</div>':'<div class="fxs">いまは全部達成! すごい!</div>')+'<div class="gll">';
  for(const g of L){const r=Math.max(0,Math.min(1,g[1]/g[2]));h+='<div class="glr"><div class="glt"><b>'+g[0]+'</b><i>'+fmt(Math.floor(g[1]))+' / '+fmt(g[2])+'</i></div><div class="glb"><u style="width:'+Math.round(r*100)+'%"></u></div><small>'+g[3]+'</small></div>'}
  return h+'</div>'+glPlanHtml()}
/* 作戦(作り手の方針「資源の使い方を、遊びながら自然に考えられるように」): いま手持ちの資源で出来ることを 資源ごとに並べる。
   どれを選ぶかは遊び手の自由(おすすめは決めつけない)。押すとその強化画面が開く。他機能は typeof で確かめて読むだけ */
function glPlan(){const L=[];const tr=f=>{try{f()}catch(e){}};
  tr(()=>{let n=0;for(let i=0;i<UP.length;i++)if(G.stage>=(UP[i][4]||0)&&G.gold>=cost(i))n++;if(n)L.push(['gold','ゴールド','通常強化が '+n+' 種類 買える(攻撃・ゴールド・当たりやすさ…)','通常強化'])});
  tr(()=>{if(typeof hupNeed!=='function')return;const h=hupNeed();if(!h)return;const v=hvSurv(h[0]);L.push(['gold','ゴールド','次のボス戦で '+STH[h[0]].n+' が 約'+Math.max(1,Math.round(v))+'秒で倒れそう → 守りを育てる','英雄'])});
  tr(()=>{if(typeof RES==='undefined')return;let n=0;for(let i=0;i<3;i++)if(RES.ms>=wCost(RES.w[i])&&RES.gem>=wGem(RES.w[i]))n++;if(n)L.push(['ms','魔石','武器を '+n+' 本 きたえられる(その英雄の攻撃 +12%)','鍛冶屋'])});
  tr(()=>{if(typeof GSM==='undefined')return;let n=0;for(const m of GSM){const l=gsLv(m.k);if(l<m.max&&RES.gem>=m.c(l))n++}if(n)L.push(['gem','宝石','勲章が '+n+' 種類 買える(ずっと続く強化)。衣装のために貯めるのも手','宝石屋'])});
  tr(()=>{if(typeof SOULD==='undefined')return;let n=0;for(const d of SOULD){const l=soulLv(d.k);if(l<d.max&&soulFree()>=d.c(l))n++}if(n)L.push(['soul','魂','祭壇の強化が '+n+' 種類 できる(転生しても残る)','魂の祭壇'])});
  tr(()=>{const gn=presGainShow(G.stage);if(gn>=1)L.push(['soul','転生','いま転生すると 魂 +'+fmt(gn)+'(STAGE 1 からやり直し。魂は攻撃とゴールドを底上げ)','魂の祭壇'])});
  return L}
function glPlanHtml(){const L=glPlan();let k=1;try{if(typeof hvLateK==='function')k=hvLateK(G.stage)}catch(e){}
  let h='<div class="fxh" style="margin-top:12px">作戦</div><div class="fxs">'+(k>1.01?'この先の敵は守りが固い(いま 受けるダメージ ÷'+(k<10?k.toFixed(1):fmt(Math.round(k)))+'・STAGE が進むほど固くなる)。<br>':'')+(L.length?'いま出来ること。どれに使うかは自由':'いまは使える資源が無い。敵を倒して貯めよう')+'</div><div class="gll">';
  for(const p of L)h+='<button type="button" class="glp" onclick="fxClose();upOpen(\''+p[3]+'\')">'+(typeof resIcon==='function'?resIcon(p[0]):'')+'<span><b>'+p[1]+'</b><small>'+p[2]+'</small></span><i>'+p[3]+' ▶</i></button>';
  return h+'</div>'}
/* 進みが止まった時に1回だけ知らせる(90秒 同じ STAGE のまま+出来ることがある時。5分に1回まで) */
const GLS={st:0,t:0,n:-999};
FU.push(dt=>{if(!run)return;if(G.stage!==GLS.st){GLS.st=G.stage;GLS.t=0;return}GLS.t+=dt;
  if(GLS.t>90&&T-GLS.n>300){GLS.t=0;try{if(glPlan().length){GLS.n=T;fxToast('進みが止まったら メニュー「目標」の 作戦 を見てみよう','#7dffa6')}}catch(e){}}});
FM.push({n:'目標',r:glMenu});
try{if(typeof FMGRP!=='undefined'){const g=FMGRP.find(x=>x.n==='遊ぶ');if(g&&g.t.indexOf('目標')<0)g.t.unshift('目標')}}catch(e){}
