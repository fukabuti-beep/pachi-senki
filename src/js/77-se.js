/* ---------- SEライブラリ (sound担当) ----------
   すべて AC が無い/ミュート中は何もしない。音程は「今鳴っているBGMのキー」から作るので BGM と不協和にならない。
   重要音は sPri++ で同時発音上限の枠を広げ、鳴らす間 sDuck() でBGMを少し下げる。
   音作りの方針(作り手の指摘「もっと重厚に・聴いて気持ちいい音に」。参考=パチンコ店の実機音+8bit のオリジナル):
     ・大事な瞬間は「ドン(重低音)+ 形のある音 + きらめき + 響き」を同じ瞬間に重ねる(sBoom / sFat / sBell)
     ・機械の手応え: リール停止や役物は「ガコン」(sClunk)、玉と払い出しは金属の「チャリ」(sMetal)、押せ!!は振動「ブルッ」(sBuzz)
     ・金管のスタブは 2本のノコギリを少しずらして厚く(sFat)、暖かい経路(wm)で耳に痛い高域を丸める
     ・ふだんの音(命中・コンボ等)は短く控えめ=大事な瞬間との差で気持ちよさを作る。乱数は sR(ゲームの乱数は使わない) */
const sOK=()=>AC&&!SND.m;
const sNow=()=>AC.currentTime+.005;
// 主和音ルート(minorなら平行長調): C5付近(66〜77)
const fanRoot=()=>{const pc=SND.min?(SND.pc+3)%12:SND.pc;return 72+((pc+6)%12)-6};
// ペンタトニックの階段(minorキーはマイナーペンタ): i=0 が C4付近
function sLad(i){const sc=SND.min?[0,3,5,7,10]:[0,2,4,7,9],b=60+((SND.pc+6)%12)-6;i=Math.max(0,i|0);let m=b+12*Math.floor(i/5)+sc[i%5];while(m>93)m-=12;return m}
const sBig=f=>{sPri++;try{f()}finally{sPri--}};
function sFlash(c){try{if(typeof flash==='function')flash(c)}catch(e){}}

/* --- 音の部品 --- */
function sTo(dest,f,t,d,ty,v,f2){if(!AC||SND.m)return;try{if(!sVok(t,d))return;sVo(f,t,d,ty,v,{f2,dest})}catch(e){}}
const sW=(f,t,d,ty,v,f2)=>sTo('wm',f,t,d,ty,v,f2);   // 暖かい経路(高域を丸める)
// 厚い金管: 少しずらした2本のノコギリ+1オクターブ下の三角波(胴)
function sFat(f,t,d,v,f2,nb){sW(f*1.006,t,d,'sawtooth',v*.55,f2&&f2*1.006);sW(f*.994,t,d,'sawtooth',v*.55,f2&&f2*.994);if(!nb)tone(f/2,t,d,'triangle',v*.6,f2&&f2/2)}
// 重低音ドン(s=強さ 0.3〜2.5): 下がる正弦+三角の芯+低い地鳴り+一瞬の打撃
function sBoom(t,s){s=s||1;tone(140,t,.2+.32*s,'sine',Math.min(.24,.12*s),33);tone(70,t+.004,.14+.24*s,'triangle',Math.min(.13,.065*s),31);noise(t,Math.min(.15,.055*s),.1+.3*s,'l');noise(t,Math.min(.06,.03*s),.025,'h')}
// ガコン(役物・リール停止): 胴の低い打撃+金属の短い鳴り+高い爪の音
function sClunk(t,s){s=s||1;tone(200,t,.1,'triangle',.075*s,72);noise(t,.045*s,.05,'m');tone(2400,t,.016,'p12',.03*s,900);noise(t+.004,.05*s,.09,'l')}
// チャリ(金属): 整数倍でない倍音で 玉やメダルの金属っぽさ
function sMetal(f,t,v,d,k){d=d||.1;tone(f,t,d,'square',v*.5);tone(f*2.76,t,d*.7,'sine',v*.55);if(k!==2)tone(f*5.4,t,d*.45,'sine',v*.3)}
// 鐘の余韻(きらめき)
function sBell(f,t,v,d){d=d||.6;tone(f,t,d,'sine',v);tone(f*2.005,t,d*.6,'sine',v*.45);tone(f*3.01,t,d*.35,'triangle',v*.22)}
// ブルッ(ボタンの振動): とても低いノコギリ
function sBuzz(t,d,v){tone(44,t,d,'sawtooth',v,36);tone(88,t,d*.7,'square',v*.3,72)}
// 衝撃のシンバル(クラッシュ): 白い雑音+高い雑音
function sCrash(t,v,d){d=d||.9;noise(t,v,d,'w');noise(t,v*.8,d*.7,'h')}

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
    const t0=sNow(),st=n>6?2:3,B=sKyBus(n,t0,n*.105+.6);
    if(B!==0){const tk=(f,t,d,ty,v,f2)=>B?sTb(B.bus,f,t,d,ty,v,f2):tone(f,t,d,ty,v,f2);
    sBig(()=>{
      if(n>=4)sBoom(t0,Math.min(2,.6+n*.12));   // 入りの重低音
      for(let i=0;i<n;i++){
        const f=900*Math.pow(2,i*st/12),t=t0+i*.105,last=i===n-1;
        tk(f,t,.1,'sawtooth',.045,f*1.9);              // キュッと上がる本体
        tk(f*1.008,t+.01,.1,'sawtooth',.022,f*1.9*1.008); // 少しずらして厚く
        if(i%2===0||last)tk(f*2,t,.09,'p25',.016,f*3.6);   // 上の倍音(1段おき=発音数を抑える)
        tk(f/2,t,.1,'triangle',.03,f*.95);             // 下の胴
        if(last){tk(f*1.9,t+.1,.5,'sine',.03);tk(f*2.85,t+.12,.4,'sine',.014);noise(t+.02,.025,.25,'h')}
      }
      if(n>=7){const te=t0+n*.105;tk(600,te,.55,'sawtooth',.03,2400);tk(1200,te+.05,.5,'p25',.012,4800);sBell(mf(fanRoot()+24),te+.1,.03,.9)}   // 大当たり級は「ギュイーン」と鐘
    });
    if(n>=3)sDuck(.25,n*.105+.3);}
  }catch(e){}
  // 画面フラッシュは約3Hzに間引く(光過敏性への配慮)。AC有無に依存しない
  for(let i=0;i<n;i++)if(i%3===0||i===n-1)setTimeout(()=>sFlash(((i/3)|0)%2?c:'#fff'),i*105);
}
/* ジャラジャラ(玉が払い出される音): 金属の「チャリ」。呼び出し頻度が高いので60msで間引く */
let sJT=-1;
function jara(){
  if(!sOK())return;
  try{const n=AC.currentTime;if(n-sJT<.06)return;sJT=n;
    const f=1900+sR()*900;sMetal(f,n,.022,.05,2);
    if(sR()<.4)tone(f*1.5,n+.012,.05,'triangle',.014);
    if(sR()<.3)noise(n,.01,.02,'m')}catch(e){}
}
/* ファンファーレ: 厚い金管の駆け上がり → 重低音つきの長い和音 + 鐘 */
function fan(){
  if(!sOK())return;
  try{if(SND.fs&&AC.currentTime<SND.fs)return; // ボス撃破の専用ファンファーレ(seBossDown)と重ねない
    const n=sNow(),r=fanRoot();
    sBig(()=>{
      [0,4,7,12,16].forEach((s,i)=>{tone(mf(r+s),n+i*.07,.14,'p25',.045);sW(mf(r+s-12),n+i*.07,.14,'sawtooth',.03)});
      sBoom(n+.37,1);[0,4,7,12].forEach(s=>sFat(mf(r+s),n+.37,.6,.034,0,s>0));tone(mf(r-12),n+.37,.7,'triangle',.06);
      sBell(mf(r+24),n+.4,.025,.8);
    });sDuck(.35,1)}catch(e){}
}
/* コンボ音階: コンボ数に応じてペンタトニックを上昇(最大13段)。ふだんの音なので短く小さく、高い段だけ金属のきらめき */
let sCT=-1;
function seCombo(n){
  if(!sOK())return;
  try{const t=AC.currentTime;if(t-sCT<.05)return;sCT=t;const i=Math.min(Math.max(n-1,0),12),f=mf(sLad(i));
    tone(f,t,.07,'triangle',.045);if(i>=8)tone(f*2.76,t,.05,'sine',.014)}catch(e){}   // 頻繁に鳴るので1〜2音だけ
}
function seMile(n){ // 10/25/50/100 コンボ到達
  if(!sOK())return;
  try{const t=sNow(),b=n>=50?9:6;sBig(()=>{sBoom(t,n>=50?.9:.5);for(let i=0;i<4;i++)tone(mf(sLad(b+i*2)),t+i*.06,.18,'p25',.045);sBell(mf(sLad(b+8)),t+.24,.03,.6)});sDuck(.2,.6)}catch(e){}
}
/* 保留増加「ポコン」: 胴の低い音+保留数が増えるほど高い金属音 */
function sePend(q){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot(),k=[0,4,7,12][Math.min(Math.max(q-1,0),3)];
    tone(mf(r+k-12),t,.08,'triangle',.05,mf(r+k-12)*.7);tone(mf(r+k),t,.07,'triangle',.035);sMetal(mf(r+7+k),t+.05,.022,.12,2)}catch(e){}
}
/* 回転開始: レバーを引く「ガチャ」+ リールが回り出す音 */
function seSpin(){if(!sOK())return;try{const t=sNow();sClunk(t,.6);tone(320,t+.02,.12,'sawtooth',.018,820);noise(t+.02,.012,.08,'h')}catch(e){}}
/* リール停止「ガコッ」: 機械が止まる手応え。左→中→右で 根音/長3度/5度 の「ポン」、右は少し重い */
function seReelStop(i){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot()-12;
    sClunk(t,i%3===2?1.2:.9);tone(mf(r+12+[0,4,7][i%3]),t+.01,.11,'p50',.032)}catch(e){}
}
/* 予告音(段階別) 1=チャンス 2=チャンス!! 3=激アツ 4=激アツ確定。kyuin と同時に鳴るので「アクセント」に徹する */
function seYk(L){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot()+12;
    sBig(()=>{
      if(L===1){sBell(mf(r+7),t,.035,.5)}
      else if(L===2){sBell(mf(r+4),t,.03,.4);sBell(mf(r+12),t+.1,.035,.5);sePipo(2,r+19,t+.2)}
      else if(L===3){sBoom(t+.2,1.4);sePipo(3,r+19,t+.3);tone(70,t,.6,'sawtooth',.05,150);sFat(mf(r-12),t+.25,.45,.045);sFat(mf(r-5),t+.25,.45,.035,0,1);noise(t+.25,.04,.3,'l')}
      else{sBoom(t+.2,2.2);sePipo(4,r+24,t+.3);tone(60,t,.8,'sawtooth',.06,180);sCrash(t+.2,.07,1);[0,4,7,12].forEach((s,k)=>sFat(mf(r+s-12),t+.2,.7,.03,0,k>0));sBell(mf(r+24),t+.35,.03,1)}
    });if(L>=3)sDuck(.3,1)}catch(e){}
}
/* リーチ: 心臓の鼓動「ドクン、ドクン」+ 上昇する「テロテロ」。SUPER は 厚いサイレン+地鳴り */
function seReach(sup){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();
    sBig(()=>{
      [0,.24].forEach(o=>{tone(72,t+o,.18,'sine',.16,40);noise(t+o,.04,.12,'l')});
      for(let i=0;i<6;i++)tone(mf(sRise(5+i)),t+.1+i*.05,.05,'p25',.03);
      tone(300,t+.1,.6,'sawtooth',.022,900);
      if(sup){for(let i=0;i<6;i++){const f=i%2?740:1046;sFat(f,t+.48+i*.14,.14,.03,0,1)}tone(55,t+.4,1,'sawtooth',.05,45);noise(t+.4,.05,1,'l');sBoom(t+.45,1)}
    });sDuck(.25,1.1)}catch(e){}
}
/* 当たり確定「ドン!! ジャ・ジャ・ジャーン」: 重低音+クラッシュ+厚い金管の主和音スタブ。JPは鐘の駆け上がりも */
function seWin(jp){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();
    sBig(()=>{
      sBoom(t,2.2);sCrash(t,.09,1);
      [0,.14,.28].forEach((o,k)=>{const L=k===2?.8:.12;sBoom(t+o,k===2?1.2:.5);[0,4,7].forEach((s,j)=>sFat(mf(r+s),t+o,L,.03,0,j>0));tone(mf(r-12),t+o,L,'triangle',.05)});
      if(jp)for(let i=0;i<8;i++)sBell(mf(sLad(5+i*2)),t+.5+i*.07,.03,.35);
    });seJaraStream(t+.8,1.4,jp?20:14);sDuck(.4,1.3)}catch(e){}
}
/* JACKPOT: 0.6秒ごとに重低音つきの上昇スタブ(画面フラッシュと同期)x6 + 約3秒の金属の雨 + 最後の大きな和音 */
function seJackpot(){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();
    SND.supUntil=AC.currentTime+4; // 70-show.js 側の上昇ビープは抑止(こちらで鳴らす)
    sBig(()=>{
      for(let i=0;i<6;i++){const f=r+[0,2,4,7,9,12][i],ti=t+i*.6;sBoom(ti,.7+i*.15);[0,4,7].forEach((s,j)=>{sFat(mf(f+s),ti,.42,.03,0,j>0);tone(mf(f+s+12),ti,.3,'p25',.022)});noise(ti,.05,.15,'h')}
      for(let i=0;i<30;i++){const o=sR()*3.2,f=2100+sR()*1400;sMetal(f,t+o,.02,.05,2)}
      sBoom(t+3.6,2.4);sCrash(t+3.6,.08,1.2);[0,4,7,12].forEach((s,j)=>sFat(mf(r+s+12),t+3.6,1,.03,0,j>0));sBell(mf(r+24),t+3.65,.035,1.2);
    });sDuck(.45,4.4)}catch(e){}
}
/* 会心ヒット「ザシュイーン」: 打撃+切り裂く上昇+高い鐘 と 通常ヒット(英雄ごと)。通常は 90ms で間引く */
let sHT=-1,sXT=-1;
function seCrit(){
  if(!sOK())return;
  try{const t=AC.currentTime;if(t-sXT<.06)return;sXT=t;
    sBig(()=>{tone(130,t,.16,'sine',.1,40);noise(t,.07,.06,'w');noise(t,.03,.1,'l');tone(1400,t,.09,'sawtooth',.045,3200);tone(2637,t+.05,.35,'sine',.035)})}catch(e){}
}
/* col=当てた英雄の色(30 の PR): 剣=ザシュ / 杖=キラン / 弓=トスッ。どれにも小さな胴の「ドッ」を足す */
function seHit(b,col){
  if(!sOK())return;
  try{const t=AC.currentTime;if(t-sHT<.09)return;sHT=t;
    noise(t,.07,.06,'l');   // 小さな胴の「ドッ」(雑音なので発音数に数えない)
    if(col==='#ffa070'){noise(t,.04,.05,'w');tone(420,t,.06,'sawtooth',.026,110)}
    else if(col==='#9ff'){tone(1175,t,.05,'sine',.03);tone(1760,t+.03,.08,'sine',.025);noise(t,.012,.03,'w')}
    else if(col==='#bfa'){tone(520,t,.04,'triangle',.045,200);noise(t,.02,.02,'w')}
    else{noise(t,.03,.04,'w');tone(220,t,.05,'triangle',.04,90)}
    if(b)sBoom(t,.6)}catch(e){}
}
/* ボス登場「ブォォン」: 地鳴り+重低音+低い金管の不穏な和音(短2度のぶつかり)+警告の2音 */
function seBoss(){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();sBig(()=>{sBoom(t,1.8);noise(t,.07,1.2,'l');tone(55,t,1.1,'sawtooth',.05,40);
    sFat(mf(r-24),t+.05,1,.04);sFat(mf(r-23),t+.05,1,.025,0,1);sFat(mf(r-17),t+.05,1,.03,0,1);
    [0,.35,.7].forEach(o=>tone(o?494:370,t+o,.28,'square',.03));tone(220,t+.1,.5,'sawtooth',.03,208)});sDuck(.35,1.4)}catch(e){}
}
/* 敵撃破: 小さな「ドッ」+ 金属の「チャリン」+ 上がる音階。ボスは音数が多い */
function seKill(boss){
  if(!sOK())return;
  try{const t=sNow(),n=boss?5:3;tone(130,t,.1,'sine',.08,45);noise(t,.07,.08,'l');
    for(let i=0;i<n;i++)tone(mf(sLad(5+i*2)),t+i*.055,.1,'p25',.035);sMetal(mf(sLad(5+n*2)),t+n*.055,.03,.22);noise(t,.02,.05,'h')}catch(e){}
}
/* ゴールド(黄金玉): 鐘の駆け上がり+金属のきらめき */
function seGold(){
  if(!sOK())return;
  try{const t=sNow();sBig(()=>{sBoom(t,.5);[0,1,2,3,4,5].forEach(i=>sBell(mf(sLad(3+i*2)),t+i*.05,.03,.3));sBell(2093,t+.3,.035,.6);sMetal(3136,t+.34,.025,.4);noise(t,.03,.4,'m')})}catch(e){}
}
function seRare(){
  if(!sOK())return;
  try{const t=sNow();sBig(()=>{sBoom(t,.6);for(let i=0;i<12;i++)sMetal(2100+sR()*1400,t+sR()*1.0,.018,.06,2);sBell(mf(fanRoot()+24),t+.1,.03,.7)})}catch(e){}
}
/* 覚醒: 厚い上昇 → 頂点で重低音と和音 */
function seAwaken(){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();sBig(()=>{sFat(180,t,.6,.05,1400,1);tone(90,t,.6,'square',.03,700);noise(t,.04,.5,'h');noise(t,.04,.6,'l');
    sBoom(t+.6,1.4);[0,7,12].forEach((s,j)=>sFat(mf(r+s),t+.6,.6,.03,0,j>0))});sDuck(.3,1.2)}catch(e){}
}
/* カットイン(必殺/大当たり): 風を切る溜め+上昇 → 着弾の重低音とクラッシュ */
function seCut(){
  if(!sOK())return;
  try{const t=sNow();sBig(()=>{noise(t,.05,.35,'h');noise(t,.04,.35,'l');sFat(160,t,.35,.05,1100,1);sBoom(t+.35,1.8);sCrash(t+.35,.07,.5)});sDuck(.3,.8)}catch(e){}
}
function seUnlock(){
  if(!sOK())return;
  try{const t=sNow();for(let i=0;i<4;i++)sBell(mf(sLad(5+i*2)),t+i*.07,.035,.35);tone(mf(sLad(3)),t,.4,'triangle',.04)}catch(e){}
}
function seRushEnd(){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();[7,4,0].forEach((s,i)=>sBell(mf(r+s),t+i*.12,.035,.4));tone(mf(r-12),t+.24,.5,'triangle',.05);sBoom(t+.24,.4)}catch(e){}
}
