/* ---------- ルーレットと押せ!! の音の整理 (sound) ----------
   作り手の指摘「ルーレット周りの音(押せ!!ボタン)が未着手」。点検で分かったこと:
     ・押せ!!が出た瞬間に 4つの音(29 の登場音 / 78 の煽り / 89g のポップ / 89h の熱さの和音)が重なり、29 と 89h の和音は調が固定で BGM とぶつかることがあった
     ・押した瞬間も 4つ(キュイン / 決定音 / 89g の衝撃波 / 89h の和音)が重なって濁っていた
     ・カウントダウンは細い電子音1つ、ルーレットは回り始めの音が無く、超倍率の溜めはキュインだけ、戦闘画面のミニルーレットはほぼ聞こえない
   整理: 押せ!!の登場=89h の熱さの音(調に合わせた)+78 の煽り / 押下=キュイン+決定音(79 seDecide)+89h は熱さの上乗せだけ。
   ここで足す音: seCount(押せ!!のカウント)/ seRoulStart(回り始め)/ seRoulTame(超倍率の「…!?」の溜め)/ seRoulSup(超倍率の解放)/ seMiniTick・seMiniRes(ミニルーレット)。
   部品は 77 の sBoom / sClunk / sMetal / sBell / sFat。音の乱数は sR(ゲームの乱数は使わない)。 */
/* 押せ!!のカウント(0.9秒ごと、29 から呼ぶ): 「ガコッ」と音程が1段ずつ上がる(調に合わせる) */
function seCount(k){if(!sOK())return;try{const t=sNow(),r=fanRoot(),s=[0,2,4,7,9,12][Math.min(5,Math.max(0,k-1))];
  sClunk(t,.55);tone(mf(r+12+s),t,.1,'p25',.042);tone(mf(r+s),t,.1,'triangle',.035);noise(t,.04,.08,'l')}catch(e){}}
/* 押せ!!が出た瞬間の「キュインキュイン!!」(作り手の指摘「出てきた時の音が薄い、キュインキュイン!!という迫力が欲しい」):
   鋭く駆け上がる「キュイン」を 熱さで 2/3/4 回(赤/金/虹)。1回ごとに3半音ずつ高く、少しずつ速く。各回は ノコギリ2本(ずらして厚く)+上の倍音+下の胴。
   1回目に重低音、最後は長く伸ばして鐘。専用の通り道を使うので、同時に鳴る kyuin に途中で消されない。戻り値=鳴り終わるまでの秒数 */
function seKyuKyu(h){if(!sOK())return 0;try{const g=sGr();if(!g)return 0;h=Math.max(1,Math.min(3,h|0));
  const bus=AC.createGain(),t0=sNow(),n=h+1;bus.gain.setValueAtTime(1,t0);bus.connect(g.se);let t=t0,end=t0;
  sBig(()=>{sBoom(t0,.9+h*.45);
    for(let i=0;i<n;i++){const f=760*Math.pow(2,(i*3+(h-1)*2)/12),d=i===n-1?.34:.2,up=.13;
      sTb(bus,f,t,up,'sawtooth',.05,f*3.2);sTb(bus,f*1.01,t+.008,up,'sawtooth',.026,f*3.2*1.01);sTb(bus,f*2,t,up*.9,'p25',.016,f*6);sTb(bus,f/2,t,up,'triangle',.03,f*1.6);
      sTb(bus,f*3.2,t+up,d-up,'sawtooth',.03,f*3.05);sTb(bus,f*1.6,t+up,d-up,'p25',.018);   // 「イン」と頂上で鳴る
      noise(t,.03,.06,'h');end=t+d;t+=d+Math.max(.03,.07-.012*i)}
    sBell(mf(fanRoot()+24),end-.05,.035,.7);if(h>=3)sBell(mf(fanRoot()+31),end+.02,.03,.8)});
  try{if(typeof sAB!=='undefined'&&sAB&&sAB.ac===AC){const p=sAB.bus.gain;p.cancelScheduledValues(t0);p.setValueAtTime(.22,t0);p.setValueAtTime(.22,end-.05);p.linearRampToValueAtTime(1,end+.15)}}catch(e){}   // 煽り(78)はキュインの間は小さく、鳴り終わってから前へ
  setTimeout(()=>{try{bus.disconnect()}catch(e){}},(end-t0+1.5)*1000);sDuck(.3,end-t0+.4);return end-t0}catch(e){return 0}}
/* ルーレットが回り始める: 「ガコン」+ うなりが上がる + 玉がジャラッと走る */
function seRoulStart(){if(!sOK())return;try{const t=sNow();sBig(()=>{sClunk(t,1.3);sBoom(t,.8);sFat(110,t,.7,.03,440,1);noise(t,.04,.6,'l');
  for(let i=0;i<7;i++)sMetal(1700+sR()*900,t+.06+i*.055,.016,.04,2)});sDuck(.2,.8)}catch(e){}}
/* 超倍率の溜め「…!?」(約1.1秒): 小太鼓のロールが詰まっていき、地鳴りが上がり、鼓動が2つ */
function seRoulTame(){if(!sOK())return;try{const t=sNow();sBig(()=>{let o=0;for(let i=0;i<16;i++){noise(t+o,.025+.003*i,.04,'h');noise(t+o,.03,.05,'l');o+=Math.max(.035,.11-.006*i)}
  sFat(55,t,1.1,.035,220,1);tone(70,t+.2,.18,'sine',.14,40);tone(70,t+.6,.18,'sine',.16,40);noise(t+.2,.05,.15,'l');noise(t+.6,.05,.15,'l')});sDuck(.35,1.3)}catch(e){}}
/* 超倍率の解放: 「ギュイーン」と駆け上がる鐘(大きな重低音は 79 の seRoulResult(50) が鳴らす)。x777 は鐘をもう一段 */
function seRoulSup(m){if(!sOK())return;try{const t=sNow(),r=fanRoot();sBig(()=>{sFat(300,t,.6,.04,2400,1);tone(150,t,.6,'sawtooth',.03,1200);
  [12,16,19,24,28,31].forEach((s,i)=>sBell(mf(r+s),t+.15+i*.06,.03,.5));if(m>=777){sePipo(4,r+31,t+.6);sBoom(t+.55,1.2);sBell(mf(r+36),t+.6,.035,1.2)}})}catch(e){}}
/* ミニルーレット(87、戦闘画面の小さいもの): 仕切りの金属音と、小さな当たりの鐘(x10 以上は 79 の seRoulResult) */
let sMT=-1;
function seMiniTick(p){if(!sOK())return;try{const t=AC.currentTime;if(t-sMT<.06)return;sMT=t;tone(900+p*600,t,.03,'p50',.022);noise(t,.02,.03,'m')}catch(e){}}
function seMiniRes(){if(!sOK())return;try{const t=sNow(),r=fanRoot();sClunk(t,.6);tone(mf(r+12),t,.08,'p25',.035);sBell(mf(r+19),t+.07,.03,.35)}catch(e){}}
/* ルーレット本体(60)につなぐ: 回り始め / 溜め / 解放 は RL の状態の変化で鳴らす(60 は触らない) */
sndHook('startRoul',null,()=>{try{if(typeof RL!=='undefined'&&RL)seRoulStart()}catch(e){}});
{const o=updRoul;updRoul=function(dt){const R=typeof RL!=='undefined'?RL:null,sq=R&&R.sq,sx=R&&R.sx;const r=o.apply(this,arguments);
  try{if(R&&R===RL){if(R.sq&&!sq)seRoulTame();if(R.sx&&!sx)seRoulSup(R.m2||100)}}catch(e){}return r}}
