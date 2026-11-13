/* ---------- 英雄の体力と敵の攻撃 (feature) ----------
   3人それぞれに体力(剣士は硬い・魔法使いは打たれ弱い)。敵が一定間隔で攻撃してくる(剣士が狙われやすい=かばう)。
   ・雑魚戦: 倒れても HVR 秒で起き上がる(体力40%)。全滅は無い(作り手の方針「ボス戦だけ厳しく」)。中盤からは倒れている時間が増えて進みが鈍る。
   ・ボス戦(STAGE HVB 以降のボスと、無限の塔): 攻撃が強く、倒れた英雄はその戦いが終わるまで起きない(攻撃に参加しない)。
     3人とも倒れたら「全滅」→ 少し間をおいて 1つ前のステージへ戻る + リベンジ(攻撃 +10%/回、最大3回、そのボスを倒すまで)。
   ・STAGE 30 からボスに装甲(受けるダメージ ÷hvBossK)=ボス戦が長くなり、守りが弱いと倒しきる前に全滅する。元気ボーナス(体力が多いほど攻撃+最大30%)。
     無限の塔では全滅で挑戦終了。
   ・ダメージは「基準体力 HB に対する割合」で決める(ステージで強くならない)→ ボス戦が長引くほど危ない = 攻撃か守り(英雄ごとの 体力/防御/回復 = HUP)を強化する理由。
   ・体力はセーブしない(読み込み時は全快)。ボスの登場/撃破・転生で全快。
   フック: なし(spawn/heroAtk/drawHeroes/drawB をラップ、SB.a にリベンジ、FU で更新)。テスト: tests/herohp.js */
/* 英雄ごとの強化(強化画面の「英雄」グループ=98m-heroup が表示)。ゴールドで買い、転生でリセット(通常強化と同じ)。
   [体力 +15%/Lv MAX25, 防御 ダメージ÷(1+7%/Lv) MAX20, 回復 +20%/Lv MAX15]。解放 STAGE 10/15/20。セーブ localStorage['pachi2_hero']={lv:[[h,d,r]x3]} */
// [名前,説明,基本コスト,解放STAGE,MAX,1Lvの効果,掛け算か]。体力/防御は上限なし・掛け算で伸びる(敵の強さ hvThr に追いつくための ゴールドの使い道)、回復は割合なので上限あり
const HUPD=[['体力','最大体力 +18%',35,10,Infinity,1.18,1],['防御','受けるダメージ -11%',60,15,Infinity,1.12,1],['回復','自然回復 +20%',80,20,15,.2,0]];
const HUPCG=1.9;   // 体力/防御のコストの伸び(ゴールドの伸び 1.32/STAGE に合わせ、育て続けるとずっと一定の割合を使う)
const HUP={lv:[[1,1,1],[1,1,1],[1,1,1]]};
try{const d=JSON.parse(localStorage.getItem('pachi2_hero')||'{}');if(Array.isArray(d.lv))for(let i=0;i<3;i++)for(let k=0;k<3;k++){const v=Math.floor(+((d.lv[i]||[])[k]));if(Number.isFinite(v)&&v>=1)HUP.lv[i][k]=Math.min(v,HUPD[k][4])}}catch(e){}
function hupSave(){try{localStorage.setItem('pachi2_hero',JSON.stringify({lv:HUP.lv}))}catch(e){}}
const hupL=(i,k)=>Math.min(HUP.lv[i][k],HUPD[k][4]);
const hupM=(i,k)=>HUPD[k][6]?Math.pow(HUPD[k][5],hupL(i,k)-1):1+HUPD[k][5]*(hupL(i,k)-1);
const hupCost=(i,k)=>HUP.lv[i][k]>=HUPD[k][4]?Infinity:Math.floor(HUPD[k][2]*BAL.costk*Math.pow(HUPD[k][4]===Infinity?HUPCG:BAL.costgCap,HUP.lv[i][k]-1));
const hupOpen=k=>Math.max(G.stage,X.best||0)>=HUPD[k][3];
function hupBuy(i,k){i|=0;k|=0;if(!HUP.lv[i]||!HUPD[k]||!hupOpen(k))return false;const c=hupCost(i,k);if(!(G.gold>=c))return false;
  const r0=HV.hp[i]/hvMax(i);G.gold-=c;HUP.lv[i][k]++;hupSave();if(k==0&&!HV.dn[i])HV.hp[i]=hvMax(i)*r0;
  try{beep(1000,.1,'triangle');refresh()}catch(e){}return true}
/* ボス戦で持ちこたえる目安(秒)。英雄 i に飛んでくる平均ダメージ/秒 と自然回復から。Infinity=倒れない */
function hvSurv(i,s){s=s==null?G.stage:s;const w=i==0?.5:.25,m=hvMax(i),dps=(1/HVK.bI)*w*HB*HVK.bP*hvThr(s)/hupM(i,1),rg=m*HVK.reg*hupM(i,2);return dps<=rg?Infinity:m/(dps-rg)}
const HVSAFE=40;   // この秒数より短い英雄がいたら 守りを買う(自動強化・sim)
/* 必要な時だけ買う: 一番もろい英雄の 体力/防御/回復 のうち 安いもの [i,k,cost]。みんな HVSAFE 秒以上もつなら null */
function hupNeed(s){let wi=-1,ws=HVSAFE;for(let i=0;i<3;i++){const v=hvSurv(i,s);if(v<ws){ws=v;wi=i}}if(wi<0)return null;let b=null;
  for(let k=0;k<3;k++){if(!hupOpen(k))continue;const c=hupCost(wi,k);if(c<Infinity&&(!b||c<b[2]))b=[wi,k,c]}return b}
const HB=100,HVROLE=[1.4,.8,1],HVB=15,HVR=6,HVWIPE=2.6;
const HVK={nI:3.2,nP:.07,bI:1.8,bP:.2,aP:.24,rage:1.3,reg:.003,regOut:.03,t0:.25,tg:1.08};
const HV={hp:[HB*1.4,HB*.8,HB],dn:[0,0,0],rt:[0,0,0],at:1.5,sh:null,wipe:0,rev:0,revSt:0,num:[],fl:[-9,-9,-9],told:0,wasB:0,twOn:0};
try{HV.told=+(JSON.parse(localStorage.getItem('pachi2_hp')||'{}').told)||0}catch(e){}
/* 敵の強さ(ダメージの倍率): STAGE 15 までは 0.25(序盤は順当に進める)→ 以降 1ステージごとに x1.08。
   STAGE 30 で約0.8 / 50 で約3.7 / 75 で約25 / 100 で約170。雑魚の攻撃も同じ倍率なので、中盤からは守りを育てないと倒れている時間が増えて進みが鈍る。英雄の体力/防御を ゴールドで育て続けると追いつける(放っておくと中盤のボスで全滅=育成を促す)。塔は 2x階 のステージ相当 */
const hvThr=s=>{s=s|0;return HVK.t0*Math.pow(HVK.tg,Math.max(0,s-HVB))*(s<30?Math.max(.3,.3+.7*(s-HVB)/15):1)};   // STAGE 30 まではさらに弱く(15 で 30% → 30 で 100%)=序盤のエリアの主でも全滅しにくい
const hvMax=i=>HB*HVROLE[i]*hupM(i,0);
const hvTower=()=>typeof TW!=='undefined'&&!!TW.on;
const hvBoss=()=>hvTower()||(isBoss()&&G.stage>=HVB);
function hvHeal(){for(let i=0;i<3;i++){HV.hp[i]=hvMax(i);HV.dn[i]=0;HV.rt[i]=0}HV.sh=null;HV.at=1.5}
{const oa=SB.a;SB.a=()=>oa()*(1+.1*HV.rev)}   // リベンジ: 全滅ごとに攻撃+10%(最大3回)。全滅が近道にならない程度
/* 倒れている英雄は攻撃しない */
/* 元気ボーナス: 体力が多い英雄ほど通常攻撃が強い(満タンで +HVGK)。守りを育てるとボス戦でも体力が残る=攻撃も伸びる */
const HVGK=.3;
const hvGenki=i=>HV.dn[i]?0:1+HVGK*Math.max(0,Math.min(1,HV.hp[i]/hvMax(i)));
{const _h=heroAtk;heroAtk=function(i,m){if(HV.dn[i])return;return _h.call(this,i,(m==null?1:m)*hvGenki(i))}}
/* ボス戦を長くする: STAGE 30 からボスに「装甲」(受けるダメージ ÷k、50 で ÷3、80 で ÷6、100〜 ÷8)。体力と倒した時のゴールドは そのまま(経済は変えない) */
const hvBossK=s=>s<30?1:Math.min(8,1+(s-30)*.1);
/* 後半の敵の守り(作り手の方針「後半の敵を固くする」): STAGE BAL.lateS から 1ステージごとに 受けるダメージ ÷BAL.lateK(雑魚もボスも。体力とゴールドは不変、塔は対象外)。
   体力を増やすとゴールドも増えて打ち消し合うので、守り(ダメージの割り算)で固くする */
const hvLateK=s=>s>BAL.lateS?Math.pow(BAL.lateK,s-BAL.lateS):1;
{const _hu=hurt;hurt=function(x){if(!hvTower()){const k=(isBoss()?hvBossK(G.stage):1)*hvLateK(G.stage);if(k>1){const a=Array.prototype.slice.call(arguments);a[0]=x/k;return _hu.apply(this,a)}}return _hu.apply(this,arguments)}}
{const _s=spawn;spawn=function(){const r=_s.apply(this,arguments);try{
    // リベンジは そのボスと、全滅で1つ戻った手前のステージの間だけ続く
    if(G.stage>HV.revSt||G.stage<HV.revSt-1){HV.rev=0;HV.revSt=G.stage}if(isBoss()||HV.dn.some(d=>d))hvHeal();HV.wipe=0}catch(e){}return r}}
function hvSnd(k){try{if(typeof sOK!=='function'||!sOK())return;const t=sNow();
  /* 音の部品(77 の sBoom 等)で 被弾は鈍い打撃、ダウンは崩れ落ちる音、全滅は重い下降、復活は鐘(96 の作り手の指摘「もっと重厚に」) */
  if(k=='hit'){tone(150,t,.07,'square',.025,90);tone(110,t,.08,'sine',.06,50);noise(t,.02,.05,'l')}
  else if(k=='bhit'){sBoom(t,.5);tone(110,t,.1,'sawtooth',.035,60);noise(t,.03,.06,'w')}
  else if(k=='down'){[523,392,262].forEach((f,i)=>tone(f,t+i*.08,.1,'square',.026));sBoom(t+.24,.6)}
  else if(k=='wipe'){sBoom(t,1.4);[392,330,262,196].forEach((f,i)=>sFat(f,t+i*.16,.2,.03,f*.97,1));tone(98,t+.5,.6,'triangle',.06)}
  else if(k=='up'){[392,523,659,784].forEach((f,i)=>sBell(f,t+i*.06,.03,.3))}}catch(e){}}
/* 敵の攻撃: 生きている英雄から選ぶ(剣士は2倍狙われる) */
function hvPick(){let w=0;const c=[];for(let i=0;i<3;i++)if(!HV.dn[i]){const k=i==0?2:1;w+=k;c.push([i,k])}if(!c.length)return -1;let r=Math.random()*w;for(const q of c){r-=q[1];if(r<0)return q[0]}return c[c.length-1][0]}
function hvHit(i,d,boss){if(HV.dn[i])return;HV.hp[i]=Math.max(0,HV.hp[i]-d);HV.fl[i]=T;if(HV.num.length<10)HV.num.push({i,t0:T,s:'-'+Math.max(1,Math.round(d)),c:boss?'#ff4a5a':'#ff9a9a'});hvSnd(boss?'bhit':'hit');
  if(HV.hp[i]<=0){HV.dn[i]=1;HV.rt[i]=boss?0:HVR;hvSnd('down');try{if(typeof ringFx==='function')ringFx(hx(i)+32,84,30,'#ff4a5a',3,.4)}catch(e){}
    if(boss&&HV.dn.every(x=>x))hvWipe(boss)}}
function hvWipe(boss){if(boss===undefined)boss=hvBoss();HV.wipe=HVWIPE;HV.sh=null;
  if(hvTower()){try{if(typeof twEnd==='function')twEnd(0)}catch(e){}HV.wipe=1.2}
  else if(boss){HV.rev=Math.min(3,HV.rev+1);HV.revSt=G.stage}
  hvSnd('wipe');try{banner(hvTower()||!boss?'全滅…':'全滅…!! 1つ戻る','#ff4a5a')}catch(e){}
  if(!HV.told){HV.told=1;try{localStorage.setItem('pachi2_hp',JSON.stringify({told:1}))}catch(e){}try{fxToast('ボス戦で全滅すると1つ前のステージへ。強化の「英雄」で 体力・防御・回復 を上げよう','#ff9a9a')}catch(e){}}}
FU.push(dt=>{if(!run)return;const boss=hvBoss();
  // 塔の開始/ボス戦の開始で全快
  const tw=hvTower();if(tw&&!HV.twOn)hvHeal();HV.twOn=tw;
  if(HV.wipe>0){HV.wipe-=dt;if(HV.wipe<=0){HV.wipe=0;hvHeal();if(!tw&&isBoss()){/* 全滅で1つ前のステージへ(ボス戦だけ) */HV.revSt=G.stage;G.stage=Math.max(1,G.stage-1);try{spawn();ENT=T}catch(e){}}hvSnd('up');if(!tw&&HV.rev>0){try{showMsg('リベンジ!! 攻撃 +'+(10*HV.rev)+'%','#ffd400')}catch(e){}}}return}
  // 自然回復・起き上がり
  for(let i=0;i<3;i++){const m=hvMax(i);if(HV.dn[i]){if(!boss&&HV.rt[i]>0){HV.rt[i]-=dt;if(HV.rt[i]<=0){HV.dn[i]=0;HV.hp[i]=m*.4;hvSnd('up')}}else if(!boss&&HV.rt[i]<=0){HV.dn[i]=0;HV.hp[i]=m*.4}continue}
    HV.hp[i]=Math.min(m,HV.hp[i]+m*(boss?HVK.reg:HVK.regOut)*hupM(i,2)*dt)}
  // 飛んでいる攻撃が届く
  if(HV.sh&&T-HV.sh.t0>=.18){const s=HV.sh;HV.sh=null;hvHit(s.i,s.d,s.b)}
  // 攻撃の間隔(登場直後・カットイン・JACKPOT・ルーレット中は撃たない)
  let calm=false;try{calm=(typeof ENT!=='undefined'&&T-ENT<1.6)||(typeof cut!=='undefined'&&cut)||G.jp>0||G.roul}catch(e){}
  if(calm)return;
  HV.at-=dt;if(HV.at>0)return;HV.at=(boss?HVK.bI:HVK.nI)*(.85+Math.random()*.3);
  const i=hvPick();if(i<0)return;
  let p=boss?((!tw&&G.stage%25==0)?HVK.aP:HVK.bP):HVK.nP;if(boss&&G.hp<G.mx*.5)p*=HVK.rage;p*=hvThr(tw&&typeof TW!=='undefined'?2*TW.f:G.stage);
  HV.sh={t0:T,i,d:HB*p/hupM(i,1),b:boss}});
/* 描画: 体力バー・被弾の白光り・ダウン表示・飛んでくる攻撃・ダメージ数字 */
const HVDK={};
function hvDark(n){if(HVDK[n])return HVDK[n];const s=SPR[n];if(!s)return null;const c=document.createElement('canvas');c.width=s.width;c.height=s.height;const x=c.getContext('2d');x.drawImage(s,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(30,20,50,.72)';x.fillRect(0,0,s.width,s.height);return HVDK[n]=c}
{const _dh=drawHeroes;drawHeroes=function(t){const r=_dh.apply(this,arguments);try{hvDrawH(t)}catch(e){}return r}}
function hvDrawH(t){const boss=hvBoss();
  for(let i=0;i<3;i++){const x=hx(i)+(typeof heroDX==='function'?heroDX(i,t):0),y=52+Math.round(Math.sin(t*3+i)*1.2)+(typeof heroDY==='function'?heroDY(i,t):0);
    const fr=Math.floor(t*2.6+i*.7)%2?'b':'',n='h'+i+fr;
    if(HV.dn[i]){const d=hvDark(n);if(d)bc.drawImage(d,x,y,64,64);
      bc.font='9px '+FN;bc.textAlign='center';bc.strokeStyle='#000';bc.lineWidth=3;bc.fillStyle='#ff9a9a';const s=boss||HV.wipe>0?'ダウン':'ダウン '+Math.ceil(HV.rt[i]);bc.strokeText(s,x+32,y+40);bc.fillText(s,x+32,y+40);
      for(let k=0;k<3;k++){const a=t*4+k*2.1;bc.fillStyle=k%2?'#ffe14d':'#fff';bc.fillRect(Math.round(x+32+Math.cos(a)*12),Math.round(y+12+Math.sin(a)*4),2,2)}}
    else{const fd=t-HV.fl[i];if(fd>=0&&fd<.12){bc.globalAlpha=.8*(1-fd/.12);bc.drawImage(spw(n),x,y,64,64);bc.globalAlpha=1}}
    const m=hvMax(i),r=Math.max(0,Math.min(1,HV.hp[i]/m));
    if(boss||r<.999||HV.dn[i]){const bx=hx(i)+14,by=48;bc.fillStyle='#000';bc.fillRect(bx-1,by-1,38,5);bc.fillStyle='#2a2040';bc.fillRect(bx,by,36,3);
      bc.fillStyle=r>.5?'#3dff7a':r>.25?'#ffd400':'#ff2d55';bc.fillRect(bx,by,Math.round(36*r),3);bc.fillStyle='rgba(255,255,255,.35)';bc.fillRect(bx,by,Math.round(36*r),1)}}
  bc.textAlign='center'}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{hvDraw(t)}catch(e){HV.num.length=0}return r}}
function hvDraw(t){bc.save();
  const s=HV.sh;if(s){const q=Math.min(1,(T-s.t0)/.18),x0=EXX-24,y0=82,x1=hx(s.i)+36,y1=80,x=x0+(x1-x0)*q,y=y0+(y1-y0)*q-Math.sin(q*Math.PI)*10;
    bc.fillStyle=s.b?'#ff2d55':'#ff9a3d';bc.fillRect(Math.round(x)-3,Math.round(y)-3,6,6);bc.fillStyle='#fff';bc.fillRect(Math.round(x)-1,Math.round(y)-1,2,2);
    bc.globalAlpha=.5;bc.fillStyle=s.b?'#ff2d55':'#ff9a3d';bc.fillRect(Math.round(x+(x0-x1)*.06)-2,Math.round(y)-2,4,4);bc.globalAlpha=1}
  for(let k=HV.num.length-1;k>=0;k--){const n=HV.num[k],a=T-n.t0;if(a>.9||a<0){HV.num.splice(k,1);continue}
    bc.globalAlpha=a>.6?(.9-a)/.3:1;bc.font='10px '+FN;bc.textAlign='center';bc.strokeStyle='#000';bc.lineWidth=3;const yy=Math.round(60-a*18);bc.strokeText(n.s,hx(n.i)+32,yy);bc.fillStyle=n.c;bc.fillText(n.s,hx(n.i)+32,yy)}
  bc.globalAlpha=1;
  if(HV.rev>0&&!hvTower()&&isBoss()){bc.font='9px '+FN;bc.textAlign='left';bc.strokeStyle='#000';bc.lineWidth=3;bc.fillStyle='#ffd400';const tx='リベンジ 攻撃+'+(10*HV.rev)+'%';bc.strokeText(tx,52,140);bc.fillText(tx,52,140)}
  bc.restore()}
/* 転生で英雄の強化もリセット(通常強化と同じ扱い)。自動強化(魂の祭壇)は英雄の強化も安い順に買う */
{const _p=presDo;presDo=function(){const r=_p.apply(this,arguments);try{HUP.lv=[[1,1,1],[1,1,1],[1,1,1]];hupSave();hvHeal()}catch(e){}return r}}
let HUPT=1;FU.push(dt=>{try{if(typeof soulLv!=='function'||!soulLv('auto')||!SOUL.auto||!run)return;HUPT-=dt;if(HUPT>0)return;HUPT=2;const b=hupNeed();if(b&&G.gold>=b[2])hupBuy(b[0],b[1])}catch(e){}});
/* 強化アイコン(英雄の強化画面で使う): 体力=ハート / 防御=盾 / 回復=十字 */
const ICN3={
  hp:['..........','.kk...kk..','krrk.krrk.','krwrkrrrk.','krrrrrrrk.','.krrrrrk..','..krrrk...','...krk....','....k.....','..........'],
  df:['..kkkkkk..','.kssssssk.','.kswwsssk.','.kswsssSk.','.ksssssSk.','.kssssSSk.','..ksssSk..','..kssSSk..','...kSSk...','....kk....'],
  rg:['...kkkk...','...kggk...','...kgwk...','kkkkggkkkk','kggwggggGk','kgggggggGk','kkkkggkkkk','...kggk...','...kGGk...','...kkkk...']};
/* 10x10 の文字マップ → インライン SVG(26-dots の PAL の色) */
const HUPIC={};
function hupIcon(k){if(HUPIC[k])return HUPIC[k];const m=ICN3[k],P=(typeof UX!=='undefined'&&UX.PAL)||{};let r='';
  for(let y=0;y<m.length;y++)for(let x=0;x<m[y].length;x++){const c=m[y][x];if(c!=='.'&&P[c])r+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+P[c]+'"/>'}
  return HUPIC[k]='<svg class="hupi" viewBox="0 0 10 10" width="20" height="20" shape-rendering="crispEdges">'+r+'</svg>'}
