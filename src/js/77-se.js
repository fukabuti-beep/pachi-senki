/* ---------- SEライブラリ (sound担当) ----------
   すべて AC が無い/ミュート中は何もしない。音程は「今鳴っているBGMのキー」から作るので BGM と不協和にならない。
   重要音は sPri++ で同時発音上限の枠を広げ、鳴らす間 sDuck() でBGMを少し下げる。 */
const sOK=()=>AC&&!SND.m;
const sNow=()=>AC.currentTime+.005;
// 主和音ルート(minorなら平行長調): C5付近(66〜77)
const fanRoot=()=>{const pc=SND.min?(SND.pc+3)%12:SND.pc;return 72+((pc+6)%12)-6};
// ペンタトニックの階段(minorキーはマイナーペンタ): i=0 が C4付近
function sLad(i){const sc=SND.min?[0,3,5,7,10]:[0,2,4,7,9],b=60+((SND.pc+6)%12)-6;i=Math.max(0,i|0);let m=b+12*Math.floor(i/5)+sc[i%5];while(m>93)m-=12;return m}
const sBig=f=>{sPri++;try{f()}finally{sPri--}};
function sFlash(c){try{if(typeof flash==='function')flash(c)}catch(e){}}

/* キュイン: n段の上昇スイープ。段ごとに(ノコギリ+1オクターブ上の矩形+微ディチューン)を重ね、最後は余韻とキラキラ
   耳の疲れ対策(音だけ。フラッシュは従来どおり): キュインごとに専用バス(sKB)を通し、
   ・鳴っている途中に次のキュインが来たら前のを30msで消して差し替える(重ねて濁らせない)。ただし大きい(段数の多い)キュインの途中に来た小さいキュインは鳴らさない
   ・直近8秒のキュイン回数 c に応じて小さめに: 音量 x max(.6, 1-.08*(c-1))。7段以上(大当たり級)は常にフル音量 */
let sKB=null,sKH=[];
function sKyBus(n,t0,dur){
  const g=sGr();if(!g)return null;
  const now=AC.currentTime;sKH=sKH.filter(x=>x>now-8);const c=sKH.length;sKH.push(now);
  const old=sKB&&sKB.ac===AC&&sKB.end>now?sKB:null;
  if(old&&old.n>n&&n<7)return 0; // 大きいキュインの途中: 小さい方は鳴らさない
  if(old){try{old.bus.gain.cancelScheduledValues(now);old.bus.gain.setValueAtTime(old.v,now);old.bus.gain.linearRampToValueAtTime(0,now+.03);const b=old.bus;setTimeout(()=>{try{b.disconnect()}catch(e){}},500)}catch(e){}}
  const v=n>=7?1:Math.max(.6,1-.08*Math.max(0,c-1)),bus=AC.createGain();
  bus.gain.setValueAtTime(v,now);bus.connect(g.se);
  sKB={ac:AC,bus,n,v,end:t0+dur};
  setTimeout(()=>{try{if(sKB&&sKB.bus===bus)sKB=null;bus.disconnect()}catch(e){}},(dur+1.5)*1000);
  return sKB;
}
function kyuin(n,c){
  n=Math.max(1,n|0);
  if(sOK())try{
    const t0=sNow(),st=n>6?2:3,B=sKyBus(n,t0,n*.105+.45);
    if(B!==0){const tk=(f,t,d,ty,v,f2)=>B?sTb(B.bus,f,t,d,ty,v,f2):tone(f,t,d,ty,v,f2);
    sBig(()=>{
      for(let i=0;i<n;i++){
        const f=900*Math.pow(2,i*st/12),t=t0+i*.105,last=i===n-1;
        tk(f,t,.1,'sawtooth',.05,f*1.9);
        tk(f*2,t,.1,'p25',.018,f*3.6);
        tk(f*1.007,t+.012,.1,'sawtooth',.02,f*1.9*1.007);
        if(i===0&&n>=4)tk(140,t,.14,'sine',.13,45);
        if(last){tk(f*1.9,t+.1,.32,'sine',.03);noise(t+.02,.025,.2,'h')}
      }
    });
    if(n>=3)sDuck(.25,n*.105+.2);}
  }catch(e){}
  // 画面フラッシュは約3Hzに間引く(光過敏性への配慮)。AC有無に依存しない
  for(let i=0;i<n;i++)if(i%3===0||i===n-1)setTimeout(()=>sFlash(((i/3)|0)%2?c:'#fff'),i*105);
}
/* ジャラジャラ(玉が払い出される音)。呼び出し頻度が高いので40msで間引く */
let sJT=-1;
function jara(){
  if(!sOK())return;
  try{const n=AC.currentTime;if(n-sJT<.06)return;sJT=n;
    const f=2000+Math.random()*1000;tone(f,n,.03,'square',.02);
    if(Math.random()<.5)tone(f*1.5,n+.012,.05,'triangle',.018);
    if(Math.random()<.35)noise(n,.01,.02,'h')}catch(e){}
}
/* ファンファーレ: 主和音のアルペジオ(+1オクターブ下を重ねる)→最後に和音をロングで */
function fan(){
  if(!sOK())return;
  try{if(SND.fs&&AC.currentTime<SND.fs)return; // ボス撃破の専用ファンファーレ(seBossDown)と重ねない
    const n=sNow(),r=fanRoot();
    sBig(()=>{
      [0,4,7,12,16].forEach((s,i)=>{tone(mf(r+s),n+i*.07,.14,'p25',.05);tone(mf(r+s-12),n+i*.07,.14,'triangle',.04)});
      [0,4,7,12].forEach(s=>{tone(mf(r+s),n+.37,.5,'square',.032);tone(mf(r+s-12),n+.37,.5,'triangle',.035)});
    });sDuck(.35,.9)}catch(e){}
}
/* コンボ音階: コンボ数に応じてペンタトニックを上昇(最大13段)。30ms間引き */
let sCT=-1;
function seCombo(n){
  if(!sOK())return;
  try{const t=AC.currentTime;if(t-sCT<.05)return;sCT=t;const i=Math.min(Math.max(n-1,0),12),f=mf(sLad(i));
    tone(f,t,.07,'triangle',.04);if(i>=8)tone(f*2,t,.05,'sine',.02)}catch(e){}
}
function seMile(n){ // 10/25/50/100 コンボ到達
  if(!sOK())return;
  try{const t=sNow(),b=n>=50?9:6;sBig(()=>{for(let i=0;i<4;i++)tone(mf(sLad(b+i*2)),t+i*.06,.18,'p25',.045)});sDuck(.2,.5)}catch(e){}
}
/* 保留増加: 保留数が増えるほど高い2音 */
function sePend(q){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();tone(mf(r+[0,4,7,12][Math.min(Math.max(q-1,0),3)]),t,.07,'triangle',.04);tone(mf(r+7+[0,4,7,12][Math.min(Math.max(q-1,0),3)]),t+.06,.1,'p25',.03)}catch(e){}
}
function seSpin(){if(!sOK())return;try{const t=sNow();tone(400,t,.09,'sawtooth',.02,800);noise(t,.012,.06,'h')}catch(e){}}
/* リール停止「カチッ」: 高域ノイズの一瞬 + 矩形の短い下降 + 胴鳴り(三角波)。左→中→右で 根音/長3度/5度 の小さな「ポン」を添える */
function seReelStop(i){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot()-12;
    noise(t,.05,.012,'h');tone(2600,t,.02,'p12',.04,1100);tone(190,t+.004,.05,'triangle',.07,95);
    tone(mf(r+12+[0,4,7][i%3]),t+.01,.09,'p50',.03)}catch(e){}
}
/* 予告音(段階別) 1=チャンス 2=チャンス!! 3=激アツ 4=激アツ確定。kyuin と同時に鳴るので「アクセント」に徹する */
function seYk(L){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot()+12;
    sBig(()=>{
      if(L===1)tone(mf(r+7),t,.3,'sine',.05);
      else if(L===2){tone(mf(r+4),t,.25,'sine',.05);tone(mf(r+12),t+.1,.3,'sine',.05);sePipo(2,r+19,t+.2)}
      else if(L===3){sePipo(3,r+19,t+.3);tone(70,t,.6,'sawtooth',.07,150);tone(mf(r-12),t+.25,.4,'p25',.05);tone(mf(r-5),t+.25,.4,'p25',.04);noise(t+.25,.05,.2,'w')}
      else{sePipo(4,r+24,t+.3);tone(60,t,.8,'sawtooth',.08,180);noise(t+.2,.1,.9,'w');[0,4,7,12].forEach(s=>{tone(mf(r+s-12),t+.2,.6,'square',.035);tone(mf(r+s-24),t+.2,.6,'sawtooth',.025)})}
    });if(L>=3)sDuck(.3,.9)}catch(e){}
}
/* リーチ: 鼓動 + 上昇音。SUPER は サイレン(2音交互) */
function seReach(sup){
  if(!sOK())return;
  try{const t=sNow();
    sBig(()=>{
      tone(70,t,.16,'sine',.15,40);tone(70,t+.22,.16,'sine',.15,40);
      tone(300,t+.1,.6,'sawtooth',.03,900);
      if(sup){for(let i=0;i<6;i++)tone(i%2?740:1046,t+.45+i*.14,.14,'square',.035);tone(55,t+.4,1,'sawtooth',.06,45)}
    });sDuck(.25,1)}catch(e){}
}
/* 当たり確定: 重低音+クラッシュ+「ジャ・ジャ・ジャーン」の主和音スタブ(JPは上のオクターブも) */
function seWin(jp){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();
    sBig(()=>{
      tone(110,t,.7,'sine',.2,32);noise(t,.12,.9,'w');
      [0,.14,.28].forEach((o,k)=>[0,4,7].forEach(s=>{tone(mf(r-12+s+(k?k*0:0)),t+o,k===2?.7:.12,'square',.035);tone(mf(r+s),t+o,k===2?.7:.12,'sawtooth',.025)}));
      if(jp)for(let i=0;i<8;i++)tone(mf(sLad(5+i*2)),t+.5+i*.07,.14,'p25',.045);
    });seJaraStream(t+.8,1.4,jp?20:14);sDuck(.4,1.2)}catch(e){}
}
/* JACKPOT: 0.6秒ごとの上昇スタブ(画面フラッシュと同期)x6 + 約3秒のコイン雨 */
function seJackpot(){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();
    SND.supUntil=AC.currentTime+4; // 70-show.js 側の上昇ビープは抑止(こちらで鳴らす)
    sBig(()=>{
      for(let i=0;i<6;i++){const f=r+[0,2,4,7,9,12][i];[0,4,7].forEach(s=>{tone(mf(f+s),t+i*.6,.4,'p25',.04);tone(mf(f+s-12),t+i*.6,.4,'triangle',.04)});noise(t+i*.6,.05,.15,'h')}
      for(let i=0;i<34;i++){const o=Math.random()*3.2,f=2300+Math.random()*1500;tone(f,t+o,.04,'square',.018);if(i%2)tone(f*1.5,t+o+.012,.05,'triangle',.014)}
      tone(mf(r+12),t+3.6,.8,'p25',.05);tone(mf(r+16),t+3.6,.8,'p25',.04);tone(mf(r+19),t+3.6,.8,'p25',.04);
    });sDuck(.45,4)}catch(e){}
}
/* 会心ヒット(チャキーン) と 通常ヒット(ポスッ)。通常は 70ms で間引く */
let sHT=-1,sXT=-1;
function seCrit(){
  if(!sOK())return;
  try{const t=AC.currentTime;if(t-sXT<.06)return;sXT=t;
    sBig(()=>{tone(1500,t,.09,'sawtooth',.05,3000);tone(2637,t+.05,.25,'sine',.04);tone(3136,t+.07,.2,'p25',.02);noise(t,.06,.05,'w')})}catch(e){}
}
function seHit(b){
  if(!sOK())return;
  try{const t=AC.currentTime;if(t-sHT<.09)return;sHT=t;noise(t,.03,.04,'w');tone(220,t,.05,'triangle',.04,90);if(b)tone(100,t,.12,'sine',.1,40)}catch(e){}
}
/* ボス登場 */
function seBoss(){
  if(!sOK())return;
  try{const t=sNow();sBig(()=>{tone(65,t,.9,'sawtooth',.08,40);[0,.35,.7].forEach(o=>tone(o?494:370,t+o,.28,'square',.035));tone(220,t+.1,.5,'sawtooth',.04,208);noise(t,.04,.7,'w')});sDuck(.3,1.2)}catch(e){}
}
/* 敵撃破(コイン) ボスは音数が多い */
function seKill(boss){
  if(!sOK())return;
  try{const t=sNow(),n=boss?5:3;for(let i=0;i<n;i++)tone(mf(sLad(5+i*2)),t+i*.055,.1,'p25',.04);tone(mf(sLad(5+n*2)),t+n*.055,.22,'triangle',.035);noise(t,.02,.05,'h')}catch(e){}
}
/* ゴールド(黄金玉) */
function seGold(){
  if(!sOK())return;
  try{const t=sNow();sBig(()=>{[0,1,2,3,4,5].forEach(i=>tone(mf(sLad(3+i*2)),t+i*.05,.12,'triangle',.04));tone(2093,t+.3,.35,'sine',.04);tone(3136,t+.34,.35,'sine',.03);noise(t,.03,.4,'m')})}catch(e){}
}
function seRare(){
  if(!sOK())return;
  try{const t=sNow();sBig(()=>{for(let i=0;i<12;i++)tone(2300+Math.random()*1500,t+Math.random()*1.0,.04,'square',.016)})}catch(e){}
}
/* 覚醒 */
function seAwaken(){
  if(!sOK())return;
  try{const t=sNow();sBig(()=>{tone(180,t,.6,'sawtooth',.06,1400);tone(90,t,.6,'square',.04,700);noise(t,.04,.5,'h')})}catch(e){}
}
/* カットイン(必殺/大当たり): チャージのノイズと上昇 → 着弾の重低音 */
function seCut(){
  if(!sOK())return;
  try{const t=sNow();sBig(()=>{noise(t,.05,.35,'h');tone(160,t,.35,'sawtooth',.05,1100);tone(90,t+.35,.3,'sine',.2,35);noise(t+.35,.1,.3,'w')})}catch(e){}
}
function seUnlock(){
  if(!sOK())return;
  try{const t=sNow();for(let i=0;i<4;i++)tone(mf(sLad(5+i*2)),t+i*.07,.14,'p25',.045)}catch(e){}
}
function seRushEnd(){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();[7,4,0].forEach((s,i)=>tone(mf(r+s),t+i*.12,.25,'triangle',.04))}catch(e){}
}
