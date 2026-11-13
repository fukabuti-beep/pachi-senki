/* ---------- SEライブラリ2 (sound担当): 押せ!!の煽り/決定音・リーチ発展・ボス撃破・ダブルアップ・ルーレット・ミニゲーム・ジャラジャラ ----------
   77-se.js の続き。呼び出しは 78-sehooks.js のフックから。すべて AC無し/ミュート時は何もしない。音程は BGM のキー(fanRoot/sLad)から作る。 */
const sRise=i=>{const sc=SND.min?[0,3,5,7,10]:[0,2,4,7,9],b=60+((SND.pc+6)%12)-6;i=Math.max(0,i|0);return Math.min(96,b+12*Math.floor(i/5)+sc[i%5])}; // 上昇専用(折り返さない)
function sTb(bus,f,t,d,ty,v,f2){if(!AC||SND.m)return;try{if(!sVok(t,d))return;sVo(f,t,d,ty,v,{f2,dest:bus})}catch(e){}}

/* 「押せ!!」煽り: 上昇アルペジオ(間隔が 150ms→70ms と詰まる)。専用バスを通すので、押した瞬間に seAoriCut() で止められる */
let sAB=null;
function seAoriCut(){
  if(!sAB)return;
  try{const b=sAB;sAB=null;if(b.ac===AC){const n=AC.currentTime;b.bus.gain.cancelScheduledValues(n);b.bus.gain.setValueAtTime(1,n);b.bus.gain.linearRampToValueAtTime(0,n+.03);setTimeout(()=>{try{b.bus.disconnect()}catch(e){}},400)}}catch(e){}
}
function seAori(ms,small){
  if(!sOK())return;
  try{
    const g=sGr();if(!g)return;
    seAoriCut();
    const bus=AC.createGain();bus.gain.setValueAtTime(1,AC.currentTime);bus.connect(g.se);sAB={bus,ac:AC};
    const t0=sNow(),end=t0+(ms||2400)/1000;
    let t=t0+.1,i=0;
    sBig(()=>{
      sTb(bus,55,t0,Math.min(2.4,end-t0),'sawtooth',.03,110);   // 下で地鳴りが上がっていく(緊張)
      while(t<end-.05&&i<30){
        const f=mf(sRise(3+i)),acc=i%4===0;
        sTb(bus,f,t,acc?.14:.09,'p25',acc?.05:.036);
        sTb(bus,f/2,t,.09,'triangle',.035);
        if(acc){sTb(bus,f*2,t+.01,.08,'p12',.018);sTb(bus,90,t,.12,'sine',.1,45)}   // 拍の頭に低い「ドッ」
        t+=Math.max(.07,.15-.004*i)*(small?1.15:1);i++;
      }
    });
  }catch(e){}
}
/* 押下の決定音: 「ポチッ」(クリック)+ 低い着弾 + 「ピポッ」(5度上行)。大きいPUSHは金属のガシャン + 余韻 */
function seDecide(small){
  if(!sOK())return;
  try{
    seAoriCut();
    const t=sNow(),r=fanRoot();
    sBig(()=>{
      noise(t,.07,.03,'h');tone(3200,t,.025,'p12',.045,900);       // ポチッ
      sBoom(t,small?1.3:2.2);sBuzz(t+.01,small?.18:.32,small?.05:.07); // ドン!+ ボタンの振動「ブルッ」
      tone(mf(r+12),t+.02,.09,'p25',.055);tone(mf(r+19),t+.1,small?.2:.3,'p25',.055);tone(mf(r+7),t+.1,.3,'triangle',.05);
      if(!small){sCrash(t+.02,.07,.5);noise(t+.02,.06,.35,'m');[0,4,7].forEach((s2,j)=>sFat(mf(r+s2+12),t+.14,.5,.026,0,j>0));sBell(mf(r+24),t+.18,.03,.7)}
    });sDuck(.3,.6);
  }catch(e){}
}
/* ピポピポ: 高低2音の交互。n=往復数, hi=高い方の半音(MIDI) */
function sePipo(n,hi,t0){
  if(!sOK())return;
  try{const t=t0||sNow();for(let i=0;i<n;i++){tone(mf(hi),t+i*.16,.07,'p25',.033);tone(mf(hi-12),t+i*.16,.06,'triangle',.02);tone(mf(hi-5),t+i*.16+.08,.07,'p25',.033)}}catch(e){}
}
/* リーチ発展: k=1,2,3 と進むごとに音程が上がる(三和音の駆け上がり+鼓動)。sup=SUPERは上のオクターブも */
function seReachStage(k,sup){
  if(!sOK())return;
  try{
    const t=sNow(),b=sRise(5+k*3);
    sBig(()=>{
      tone(mf(b),t,.1,'p25',.045);tone(mf(b+4),t+.06,.1,'p25',.045);tone(mf(b+7),t+.12,.1,'p25',.045);tone(mf(b+12),t+.18,.3+.05*k,'p25',.05);
      tone(mf(b-12),t,.4,'triangle',.06);
      {const hv=sup&&k<3?.1:.14;tone(65+8*k,t,.14,'sine',hv,38);tone(65+8*k,t+.2,.14,'sine',hv,38);noise(t,.03,.12,'l');noise(t+.2,.03,.12,'l')}
      if(k>=3||sup)sBoom(t+.18,.5+.25*k);
      if(sup){tone(mf(b+19),t+.24,.3,'sawtooth',.02,mf(b+24));noise(t+.18,.03,.3,'h')}
    });sDuck(.2,.7);
  }catch(e){}
}
/* リーチ中の3列目が減速していく「カ…カ…カ」: prog 0→1 で音程が上がる(期待感)。呼び出し側で間引く */
function seReelTick(prog){
  if(!sOK())return;
  try{const t=AC.currentTime,i=Math.round(Math.min(1,Math.max(0,prog))*8);
    tone(mf(sRise(5+i)),t,.05,'p50',.033);noise(t,.02,.015,'h');noise(t,.02,.03,'l');if(prog>.7)tone(mf(sRise(5+i))*2,t,.04,'triangle',.02)}catch(e){}
}
/* ボス撃破: 爆発 → 勝利ファンファーレ(タタタターン タタターン) → 長い和音とキラキラ */
function seBossDown(){
  if(!sOK())return;
  try{
    const t=sNow(),r=fanRoot(),f0=t+.45;
    SND.fs=AC.currentTime+.25; // 同時に呼ばれる fan() を抑止
    sBig(()=>{
      sBoom(t,2.5);noise(t,.13,1,'l');noise(t,.1,.7,'w');noise(t+.03,.06,.6,'m');tone(150,t,.6,'sawtooth',.1,28);   // 大爆発
      [[0,0,.09],[0,.11,.09],[0,.22,.09],[4,.33,.2],[7,.57,.12],[12,.7,.15],[7,.88,.1],[12,1,1]].forEach(([s2,o,d])=>{
        tone(mf(r+s2),f0+o,d,'p25',.05);sW(mf(r+s2-12),f0+o,d,'sawtooth',.03);tone(mf(r+s2-24),f0+o,d,'triangle',.04);if(o>.6)tone(mf(r+s2+12),f0+o,d,'p12',.022)});
      sBoom(f0+1,1.6);sCrash(f0+1,.06,1.2);[0,4,7,12].forEach((s2,j)=>sFat(mf(r+s2+12),f0+1,1,.024,0,j>0));
      for(let i=0;i<8;i++)sMetal(2300+sR()*1600,f0+1+i*.1,.016,.06,2);sBell(mf(r+24),f0+1.05,.03,1.2);
    });sDuck(.45,2.4);
  }catch(e){}
}
/* ダブルアップ当落 */
function seDoubleWin(){
  if(!sOK())return;
  try{
    const t=sNow(),r=fanRoot();
    sBig(()=>{
      for(let i=0;i<7;i++){const f=mf(r+[0,4,7,12,16,19,24][i]);tone(f,t+i*.06,.12,'p25',.045);tone(f/2,t+i*.06,.1,'triangle',.04)}
      sBoom(t,1.8);sCrash(t,.06,.4);[0,4,7,12].forEach((s2,j)=>sFat(mf(r+12+s2),t+.45,.7,.026,0,j>0));sBell(mf(r+24),t+.5,.03,.8);
    });seJaraStream(t+.2,1,16);sDuck(.35,1.2);
  }catch(e){}
}
function seDoubleLose(){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();sBig(()=>{[7,3,0,-5].forEach((s2,i)=>{sFat(mf(r+s2-12),t+i*.13,.16,.04,mf(r+s2-12)*.94,1);tone(mf(r+s2-24),t+i*.13,.16,'triangle',.05)});noise(t+.4,.05,.6,'l');tone(60,t+.4,.5,'sine',.1,35)});sDuck(.2,.9)}catch(e){}
}
/* ルーレット: 針が仕切りを通る「カッ」(p=進行度で少し高く) と 停止時の結果音(倍率で派手さが変わる) */
let sRT=-1;
function seRoulTick(p){
  if(!sOK())return;
  try{const t=AC.currentTime;if(t-sRT<.07)return;sRT=t;tone(900+700*p,t,.03,'p50',.035,500+300*p);noise(t,.02,.012,'h');noise(t,.02,.025,'l')}catch(e){}
}
function seRoulResult(m){
  if(!sOK())return;
  try{
    const t=sNow(),r=fanRoot();
    sBig(()=>{
      sClunk(t,1);   // 針が止まる「ガコン」
      if(m<5){tone(mf(r+12),t,.1,'p25',.045);sBell(mf(r+19),t+.08,.03,.35)}
      else{
        [0,4,7,12].forEach((s2,i)=>{tone(mf(r+s2+(m>=10?12:0)),t+i*.07,.15,'p25',.05);tone(mf(r+s2-12),t+i*.07,.15,'triangle',.045)});
        sBoom(t,m>=50?2.2:m>=10?1.5:.9);
        if(m>=10){sCrash(t,.07,.7);[0,4,7,12].forEach((s2,j)=>sFat(mf(r+s2+12),t+.35,.8,.024,0,j>0));sBell(mf(r+24),t+.4,.03,.9)}
        if(m>=50)for(let i=0;i<8;i++)sBell(mf(sRise(10+i*2)),t+.5+i*.07,.025,.3);
      }
    });if(m>=5)seJaraStream(t+.15,m>=10?1.4:.7,m>=10?18:12);sDuck(.3,1.1);
  }catch(e){}
}
/* ジャラジャラ(玉/メダルが排出される連続音)。t0 から dur 秒、毎秒 dens 個。上限は dur*dens<=40 */
function seJaraStream(t0,dur,dens){
  if(!sOK())return;
  try{
    const n=Math.min(40,Math.round(dur*dens));
    for(let i=0;i<n;i++){
      const o=t0+(i+sR()*.7)/dens,f=2000+sR()*1300;
      sMetal(f,o,.017,.045,2);if(i%3===0)noise(o,.012,.03,'m');   // 金属の「チャラチャラ」
    }
    noise(t0,.025,Math.min(1.6,dur),'m');   // 払い出し口の下でずっと鳴るザーッという金属音
  }catch(e){}
}
/* ミニゲーム汎用SE: start / tick(x=0..1の高さ) / coin / ok / good / great / bad */
let sGT={};
function seGen(kind,x){
  if(!sOK())return;
  try{
    const t=sNow(),r=fanRoot(),L=sGT[kind]||-1;
    if(kind==='coin'||kind==='tick'){if(t-L<(kind==='coin'?.05:.06))return;sGT[kind]=t}
    sBig(()=>{
      if(kind==='start'){sClunk(t,.8);[0,4,7,12].forEach((s2,i)=>tone(mf(r+s2+12),t+i*.07,.1,'p25',.04));tone(mf(r),t,.3,'triangle',.05);sBell(mf(r+24),t+.28,.025,.4)}
      else if(kind==='tick'){tone(mf(sRise(4+Math.round((x||0)*8))),t,.04,'p50',.033);tone(150,t,.03,'triangle',.03,90)}
      else if(kind==='coin'){sMetal(988,t,.03,.05,2);sMetal(1319,t+.05,.03,.16,2);if(sR()<.4)noise(t,.01,.02,'m')}
      else if(kind==='ok'){tone(mf(r+12),t,.09,'p25',.045);sBell(mf(r+16),t+.08,.03,.3)}
      else if(kind==='good'){sBoom(t,.6);[0,4,7,12].forEach((s2,i)=>tone(mf(r+s2+12),t+i*.07,.12,'p25',.05));tone(mf(r),t,.4,'triangle',.05);sBell(mf(r+24),t+.28,.03,.4)}
      else if(kind==='great'){
        sBoom(t,1.6);sCrash(t,.05,.4);
        [0,4,7,12,16,19,24].forEach((s2,i)=>{tone(mf(r+s2+12),t+i*.06,.13,'p25',.05);tone(mf(r+s2),t+i*.06,.13,'triangle',.04)});
        [0,4,7,12].forEach((s2,j)=>sFat(mf(r+s2+12),t+.5,.7,.024,0,j>0));sBell(mf(r+24),t+.55,.03,.8)}
      else if(kind==='bad'){sFat(mf(r+7),t,.12,.035,mf(r+4),1);sFat(mf(r),t+.14,.25,.035,mf(r-3),1);noise(t+.14,.03,.3,'l')}
    });
    if(kind==='great'){seJaraStream(t+.2,1,16);sDuck(.3,1.1)}
  }catch(e){}
}
