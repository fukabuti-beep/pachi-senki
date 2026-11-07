/* ---------- audio core (sound担当): 音声グラフ / 発音プリミティブ / ミキサーAPI ----------
   構成: 75=コア(このファイル) 76=BGM 77=SE 78=他ファイルの関数へのSEフック
   AC は 99-main.js が「開始」ボタンで生成する(ユーザー操作後)。AC が無い/壊れても例外は出さない。
   公開API: beep tone noise kyuin jara fan bgm / setVol(bgm,se) getVol() setMute(m) isMuted()
   マスター: bg/se -> mx -> コンプ -> リミッタ -> ソフトクリップ(|y|<=.92) -> destination。BGMは曲ごとのバス(BG.bus)を通し、切替時にクロスフェード */
let AC,SGR=null,SNB,SNBH,SNBM;
let BG={nx:0,st:0,on:1,iv:0,s:'n',bus:null};
const mf=n=>440*Math.pow(2,(n-69)/12);
const SND={b:.7,s:.9,m:0,sup:0,supUntil:0,mv:26,pc:9,min:1,pcs:[9,11,0,2,4,5,7],mg:1,bk:1,sk:1};
const SND_KEY='pachi2snd';
const sClamp=(v,d)=>{v=+v;return isFinite(v)?Math.max(0,Math.min(1,v)):d};
try{const o=JSON.parse(localStorage.getItem(SND_KEY)||'null');if(o){SND.b=sClamp(o.b,SND.b);SND.s=sClamp(o.s,SND.s);SND.m=o.m?1:0;BG.on=SND.m?0:1}}catch(e){}
try{$('mu').style.opacity=SND.m?.4:1}catch(e){}
function sndSave(){try{localStorage.setItem(SND_KEY,JSON.stringify({b:SND.b,s:SND.s,m:SND.m}))}catch(e){}}

/* --- 音声グラフ: bg/se/ld(リード) -> mx(マスター) -> compressor -> destination。lead は dotted-8th ディレイにも送る --- */
function sGr(){
  if(!AC)return null;
  if(SGR&&SGR.ac===AC)return SGR.bad?null:SGR;
  SGR={ac:AC,bad:1};
  try{
    const mx=AC.createGain(),bg=AC.createGain(),se=AC.createGain(),ld=AC.createGain();
    // マスター: mx -> compressor -> limiter -> soft clip -> destination。どれかが作れない環境でも残りで繋ぐ(最悪 mx -> destination)
    let last=mx;
    try{const cp=AC.createDynamicsCompressor();cp.threshold.value=-14;cp.knee.value=14;cp.ratio.value=4;cp.attack.value=.004;cp.release.value=.2;last.connect(cp);last=cp}catch(e){}
    try{const lm=AC.createDynamicsCompressor();lm.threshold.value=-4;lm.knee.value=0;lm.ratio.value=20;lm.attack.value=.001;lm.release.value=.08;last.connect(lm);last=lm}catch(e){}
    try{const sh=AC.createWaveShaper(),N=2049,cv=new Float32Array(N);for(let i=0;i<N;i++){const x=i/(N-1)*2-1,a=Math.abs(x);cv[i]=(a<.7?a:.7+.28*Math.tanh((a-.7)/.28))*(x<0?-1:1)}sh.curve=cv;last.connect(sh);last=sh}catch(e){}
    last.connect(AC.destination);
    bg.connect(mx);se.connect(mx);ld.connect(bg);
    let dl=null;
    try{dl=AC.createDelay(1);const wet=AC.createGain(),fb=AC.createGain();wet.gain.value=.28;fb.gain.value=.3;dl.delayTime.value=.35;ld.connect(dl);dl.connect(wet);wet.connect(bg);dl.connect(fb);fb.connect(dl)}catch(e){dl=null}
    const sr=AC.sampleRate||44100,n=sr,w=new Float32Array(n),h=new Float32Array(n),m=new Float32Array(n);
    for(let i=0;i<n;i++)w[i]=Math.random()*2-1;
    for(let i=0;i<n;i++)h[i]=(w[i]-(i?w[i-1]:0))*.6;
    const lf=[];for(let i=0;i<93;i++)lf.push(Math.random()<.5?-1:1);
    for(let i=0;i<n;i++)m[i]=lf[Math.floor(i/3)%93];
    const mk=a=>{const b=AC.createBuffer(1,n,sr);try{b.getChannelData(0).set(a)}catch(e){}return b};
    SNB=mk(w);SNBH=mk(h);SNBM=mk(m);
    SGR={ac:AC,mx,bg,se,ld,dl};
    applyMix();
  }catch(e){SGR={ac:AC,bad:1}}
  return SGR.bad?null:SGR;
}
const bgGain=()=>SND.b*SND.b*SND.bk, seGain=()=>SND.s*SND.s*SND.sk;
function sSetP(p,v){try{p.cancelScheduledValues&&p.cancelScheduledValues(0)}catch(e){}p.value=v}
function applyMix(){const g=SGR&&!SGR.bad?SGR:null;if(!g)return;try{sSetP(g.mx.gain,SND.m?0:SND.mg);sSetP(g.bg.gain,bgGain());sSetP(g.se.gain,seGain())}catch(e){}}
/* ミキサーAPI(ui担当が設定画面から使う): 0〜1。null/undefined の引数は変更しない */
function setVol(bgm,se){if(bgm!=null)SND.b=sClamp(bgm,SND.b);if(se!=null)SND.s=sClamp(se,SND.s);applyMix();sndSave()}
function getVol(){return{bgm:SND.b,se:SND.s,mute:!!SND.m}}
function isMuted(){return !!SND.m}
function setMute(m){SND.m=m?1:0;BG.on=SND.m?0:1;try{$('mu').style.opacity=SND.m?.4:1}catch(e){}if(AC&&!SND.m){BG.nx=AC.currentTime+.1;sndResume()}applyMix();sndSave()}
$('mu').onclick=()=>setMute(!SND.m);

/* --- iOS Safari: ユーザー操作で resume / 無音バッファ再生でアンロック --- */
function sndResume(){try{if(AC&&AC.state&&AC.state!=='running'&&AC.resume){const p=AC.resume();p&&p.catch&&p.catch(()=>{})}}catch(e){}}
function sndUnlock(){try{const s=AC.createBufferSource();s.buffer=AC.createBuffer(1,1,22050);s.connect(AC.destination);s.start(0)}catch(e){}}
try{if(document.addEventListener){['pointerdown','touchend','keydown'].forEach(e=>document.addEventListener(e,sndResume,{passive:true}));document.addEventListener('visibilitychange',()=>{if(!document.hidden)sndResume()})}}catch(e){}

/* --- 同時発音上限(SEのみ): 発音時刻 t に重なっている声が mv を超えたら捨てる。sPri>0 の重要音は +14 --- */
let sVq=[],sPri=0;
function sVok(t,d){const n=AC.currentTime;sVq=sVq.filter(v=>v[1]>n);let c=0;for(let i=0;i<sVq.length;i++)if(sVq[i][0]<=t&&sVq[i][1]>t)c++;if(c>=SND.mv+(sPri?14:0))return false;sVq.push([t,t+d]);return true}

/* --- PeriodicWave パルス波(デューティ比): p12=12.5% p25=25% p75=75%。未対応環境は square にフォールバック --- */
const PWD={p12:.125,p25:.25,p75:.75};let PWC={ac:null};
function sPwave(ty){
  const d=PWD[ty];if(!d)return null;
  if(PWC.ac!==AC)PWC={ac:AC};
  if(PWC[ty]===undefined){PWC[ty]=null;try{const N=24,re=new Float32Array(N),im=new Float32Array(N);for(let n=1;n<N;n++)re[n]=2/(n*Math.PI)*Math.sin(n*Math.PI*d);PWC[ty]=AC.createPeriodicWave(re,im)}catch(e){}}
  return PWC[ty];
}
const sDst=k=>{const g=sGr();if(g&&BG.bus&&BG.bus.ac===AC&&(k==='bg'||k==='ld'))return BG.bus[k];return g?g[k]:AC.destination};
/* BGMの曲バス: 切替ごとに新しい gain を作り、旧バスは xf 秒でフェードアウト(クロスフェード)。tr=曲ごとの音量補正 */
function bgNewBus(t,xf,tr){
  const g=sGr();if(!g){BG.bus=null;return}
  try{
    const old=BG.bus&&BG.bus.ac===AC?BG.bus:null;tr=tr||1;
    const nb={ac:AC,bg:AC.createGain(),ld:AC.createGain(),tr};
    nb.bg.gain.setValueAtTime(tr,t);nb.ld.gain.setValueAtTime(tr,t);nb.bg.connect(g.bg);nb.ld.connect(g.ld);
    if(old){
      [old.bg,old.ld].forEach(n=>{try{n.gain.cancelScheduledValues(t);n.gain.setValueAtTime(old.tr,t);n.gain.linearRampToValueAtTime(0,t+xf)}catch(e){}});
      setTimeout(()=>{try{old.bg.disconnect();old.ld.disconnect()}catch(e){}},Math.max(0,(t+xf-AC.currentTime))*1000+2500);
    }
    BG.bus=nb;
  }catch(e){BG.bus=null}
}

/* 低レベル発声(制限なし・BGM用): o={f2:終了周波数, sus:音を保つ割合0〜1, dest:'se'|'bg'|'ld', vib:ビブラート} */
function sVo(f,t,d,ty,v,o){
  o=o||{};
  const osc=AC.createOscillator(),g=AC.createGain(),w=sPwave(ty);
  if(w)osc.setPeriodicWave(w);else osc.type=(ty==='p50'||PWD[ty])?'square':ty;
  v=Math.max(v,.0002);
  osc.frequency.setValueAtTime(f,t);
  if(o.f2)osc.frequency.exponentialRampToValueAtTime(o.f2,t+d);
  else if(o.vib&&d>.2){for(let k=1,x=t+.12;x<t+d;k++,x+=.07)osc.frequency.linearRampToValueAtTime(f*(1+(k%2?.007:-.005)),x)}
  g.gain.setValueAtTime(v,t);
  if(o.sus)g.gain.setValueAtTime(v,t+d*o.sus);
  g.gain.exponentialRampToValueAtTime(.0001,t+d);
  osc.connect(g);g.connect(typeof o.dest==='object'&&o.dest?o.dest:sDst(o.dest||'se'));
  osc.start(t);osc.stop(t+d+.02);
}
/* ノイズ: k='w' 白色 / 'h' 高域(ハット) / 'm' 金属質(NES風周期ノイズ) */
function sNs(t,v,d,k,dest){
  const s=AC.createBufferSource(),g=AC.createGain();
  sGr();s.buffer=k==='h'?SNBH:k==='m'?SNBM:SNB;
  v=Math.max(v,.0002);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  s.connect(g);g.connect(typeof dest==='object'&&dest?dest:sDst(dest||'se'));
  s.start(t,Math.random()*.4,d+.02);
}

/* --- 既存API(シグネチャ維持) --- */
function tone(f,t,d,ty,v,f2){if(!AC||SND.m)return;try{if(!sVok(t,d))return;sVo(f,t,d,ty,v,{f2})}catch(e){}}
function noise(t,v,d,k){if(!AC||SND.m)return;try{if(!sVok(t,d))return;sNs(t,v,d,k)}catch(e){}}
// beep は現在のBGMのキーの音階に丸める(どのSEもBGMと不協和にならない)
function sSnap(f){
  if(!(f>180&&f<3300))return f;
  const m=69+12*Math.log2(f/440);let b=f,bd=9;
  for(let k=Math.floor(m)-2;k<=Math.ceil(m)+2;k++){if(SND.pcs.indexOf(((k%12)+12)%12)<0)continue;const dd=Math.abs(k-m);if(dd<bd){bd=dd;b=k}}
  return bd<9?mf(b):f;
}
function beep(f,d=.08,t='square',v=.04){
  if(!AC||SND.m||SND.sup>0)return;
  try{if(SND.supUntil&&AC.currentTime<SND.supUntil)return;tone(sSnap(f),AC.currentTime,d,t,v)}catch(e){}
}
/* BGMを一瞬下げる(ファンファーレ等を聞かせる) */
function sDuck(a,d){const g=SGR&&!SGR.bad?SGR:null;if(!g||SND.m)return;try{const p=g.bg.gain,n=AC.currentTime,b=bgGain();p.cancelScheduledValues(n);p.setValueAtTime(b*(1-a),n);p.linearRampToValueAtTime(b,n+d)}catch(e){}}
