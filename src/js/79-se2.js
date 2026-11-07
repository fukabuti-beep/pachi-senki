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
      while(t<end-.05&&i<30){
        const f=mf(sRise(3+i)),acc=i%4===0;
        sTb(bus,f,t,acc?.14:.09,'p25',acc?.055:.04);
        sTb(bus,f/2,t,.09,'triangle',.035);
        if(acc)sTb(bus,f*2,t+.01,.08,'p12',.02);
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
      noise(t,.07,.03,'h');tone(3200,t,.025,'p12',.05,900);
      tone(150,t,.18,'sine',.2,45);
      tone(mf(r+12),t+.02,.09,'p25',.06);tone(mf(r+19),t+.1,small?.2:.3,'p25',.06);tone(mf(r+7),t+.1,.3,'triangle',.05);
      if(!small){noise(t+.02,.08,.35,'m');tone(mf(r+24),t+.14,.5,'sine',.03);tone(mf(r+16),t+.2,.4,'p25',.035)}
    });sDuck(.3,.5);
  }catch(e){}
}
/* ピポピポ: 高低2音の交互。n=往復数, hi=高い方の半音(MIDI) */
function sePipo(n,hi,t0){
  if(!sOK())return;
  try{const t=t0||sNow();for(let i=0;i<n;i++){tone(mf(hi),t+i*.16,.07,'p25',.035);tone(mf(hi-5),t+i*.16+.08,.07,'p25',.035)}}catch(e){}
}
/* リーチ発展: k=1,2,3 と進むごとに音程が上がる(三和音の駆け上がり+鼓動)。sup=SUPERは上のオクターブも */
function seReachStage(k,sup){
  if(!sOK())return;
  try{
    const t=sNow(),b=sRise(5+k*3);
    sBig(()=>{
      tone(mf(b),t,.1,'p25',.05);tone(mf(b+4),t+.06,.1,'p25',.05);tone(mf(b+7),t+.12,.1,'p25',.05);tone(mf(b+12),t+.18,.3+.05*k,'p25',.055);
      tone(mf(b-12),t,.4,'triangle',.06);
      tone(65+8*k,t,.14,'sine',.17,38);tone(65+8*k,t+.2,.14,'sine',.17,38);
      if(sup){tone(mf(b+19),t+.24,.3,'sawtooth',.02,mf(b+24));noise(t+.18,.03,.3,'h')}
    });sDuck(.2,.6);
  }catch(e){}
}
/* リーチ中の3列目が減速していく「カ…カ…カ」: prog 0→1 で音程が上がる(期待感)。呼び出し側で間引く */
function seReelTick(prog){
  if(!sOK())return;
  try{const t=AC.currentTime,i=Math.round(Math.min(1,Math.max(0,prog))*8);
    tone(mf(sRise(5+i)),t,.05,'p50',.035);noise(t,.02,.015,'h');if(prog>.7)tone(mf(sRise(5+i))*2,t,.04,'triangle',.02)}catch(e){}
}
/* ボス撃破: 爆発 → 勝利ファンファーレ(タタタターン タタターン) → 長い和音とキラキラ */
function seBossDown(){
  if(!sOK())return;
  try{
    const t=sNow(),r=fanRoot(),f0=t+.4;
    SND.fs=AC.currentTime+.25; // 同時に呼ばれる fan() を抑止
    sBig(()=>{
      noise(t,.14,.8,'w');noise(t+.03,.07,.6,'m');tone(150,t,.6,'sawtooth',.13,28);tone(90,t,.5,'sine',.2,30);
      [[0,0,.09],[0,.11,.09],[0,.22,.09],[4,.33,.2],[7,.57,.12],[12,.7,.15],[7,.88,.1],[12,1,.9]].forEach(([s,o,d])=>{
        tone(mf(r+s),f0+o,d,'p25',.055);tone(mf(r+s-12),f0+o,d,'triangle',.05);if(o>.6)tone(mf(r+s+12),f0+o,d,'p12',.025)});
      [0,4,7,12].forEach(s=>tone(mf(r+s+12),f0+1,.9,'square',.025));
      for(let i=0;i<8;i++)tone(2400+Math.random()*1800,f0+1+i*.1,.05,'square',.016);
    });sDuck(.45,2.2);
  }catch(e){}
}
/* ダブルアップ当落 */
function seDoubleWin(){
  if(!sOK())return;
  try{
    const t=sNow(),r=fanRoot();
    sBig(()=>{
      for(let i=0;i<7;i++){tone(mf(r+[0,4,7,12,16,19,24][i]),t+i*.06,.12,'p25',.05);tone(mf(r+[0,4,7,12,16,19,24][i]-12),t+i*.06,.1,'triangle',.04)}
      tone(110,t,.5,'sine',.18,35);noise(t,.06,.3,'w');[0,4,7,12].forEach(s=>tone(mf(r+12+s),t+.45,.6,'square',.03));
    });seJaraStream(t+.2,1,16);sDuck(.35,1.1);
  }catch(e){}
}
function seDoubleLose(){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();sBig(()=>{[7,3,0,-5].forEach((s,i)=>{tone(mf(r+s-12),t+i*.13,.16,'sawtooth',.045,mf(r+s-12)*.94);tone(mf(r+s-24),t+i*.13,.16,'triangle',.05)});noise(t+.4,.03,.4,'w')});sDuck(.2,.8)}catch(e){}
}
/* ルーレット: 針が仕切りを通る「カッ」(p=進行度で少し高く) と 停止時の結果音(倍率で派手さが変わる) */
let sRT=-1;
function seRoulTick(p){
  if(!sOK())return;
  try{const t=AC.currentTime;if(t-sRT<.07)return;sRT=t;tone(900+700*p,t,.03,'p50',.04,500+300*p);noise(t,.02,.012,'h')}catch(e){}
}
function seRoulResult(m){
  if(!sOK())return;
  try{
    const t=sNow(),r=fanRoot();
    sBig(()=>{
      if(m<5){tone(mf(r+12),t,.1,'p25',.05);tone(mf(r+19),t+.08,.25,'p25',.05)}
      else{
        [0,4,7,12].forEach((s,i)=>{tone(mf(r+s+(m>=10?12:0)),t+i*.07,.15,'p25',.055);tone(mf(r+s-12),t+i*.07,.15,'triangle',.045)});
        tone(110,t,.5,'sine',.18,35);if(m>=10){noise(t,.08,.6,'w');[0,4,7,12,16].forEach(s=>tone(mf(r+s+12),t+.35,.7,'square',.028))}
        if(m>=50)for(let i=0;i<8;i++)tone(mf(sRise(10+i*2)),t+.5+i*.07,.14,'p25',.045);
      }
    });if(m>=5)seJaraStream(t+.15,m>=10?1.4:.7,m>=10?18:12);sDuck(.3,1);
  }catch(e){}
}
/* ジャラジャラ(玉/メダルが排出される連続音)。t0 から dur 秒、毎秒 dens 個。上限は dur*dens<=40 */
function seJaraStream(t0,dur,dens){
  if(!sOK())return;
  try{
    const n=Math.min(40,Math.round(dur*dens));
    for(let i=0;i<n;i++){
      const o=t0+(i+Math.random()*.7)/dens,f=2200+Math.random()*1400;
      tone(f,o,.035,'square',.017);if(i%2)tone(f*1.5,o+.01,.05,'triangle',.014);if(i%3===0)noise(o,.012,.025,'m');
    }
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
      if(kind==='start'){[0,4,7,12].forEach((s,i)=>tone(mf(r+s+12),t+i*.07,.1,'p25',.045));tone(mf(r),t,.3,'triangle',.05)}
      else if(kind==='tick'){tone(mf(sRise(4+Math.round((x||0)*8))),t,.04,'p50',.035)}
      else if(kind==='coin'){tone(988,t,.05,'square',.03);tone(1319,t+.05,.18,'square',.03);if(Math.random()<.4)noise(t,.01,.02,'m')}
      else if(kind==='ok'){tone(mf(r+12),t,.09,'p25',.05);tone(mf(r+16),t+.08,.2,'p25',.05)}
      else if(kind==='good'){[0,4,7,12].forEach((s,i)=>tone(mf(r+s+12),t+i*.07,.12,'p25',.055));tone(mf(r),t,.4,'triangle',.05);noise(t,.02,.2,'h')}
      else if(kind==='great'){
        [0,4,7,12,16,19,24].forEach((s,i)=>{tone(mf(r+s+12),t+i*.06,.13,'p25',.055);tone(mf(r+s),t+i*.06,.13,'triangle',.04)});
        tone(110,t,.5,'sine',.18,35);[0,4,7,12].forEach(s=>tone(mf(r+s+12),t+.5,.7,'square',.028))}
      else if(kind==='bad'){tone(mf(r+7),t,.12,'sawtooth',.04,mf(r+4));tone(mf(r),t+.14,.25,'sawtooth',.04,mf(r-3))}
    });
    if(kind==='great'){seJaraStream(t+.2,1,16);sDuck(.3,1)}
  }catch(e){}
}
