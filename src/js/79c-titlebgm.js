/* ---------- タイトル曲 (sound担当): 「パチ戦記 序曲」 D major 136 / 16小節ループ(約28秒) + スタートのジングル ----------
   76-bgm.js のエンジンで鳴らす(SONGS.tt。形式は 76 の SONGS と同じ)。タイトル表示中は bgmState が 'tt' を返す。
   鳴り始めの流れ(89d-title.js が呼ぶ):
     1) 画面のどこか(スタートボタン以外)を最初にタップ → ttBgmStart(): AC を作って bgm() → タイトル曲(ブラウザは操作前に音を出せないので、それまでは無音)
     2) スタートボタン → ttBgmGo(): 次の16分でタイトル曲を切り、上昇3音+主和音のジングル(約1.3秒)で締めて、続けてゲームの曲へ(bgSwitch の盛り上がりスタブ付き)
        いきなりスタートを押した人も同じ: AC を作ってすぐジングル → ゲーム曲。
   AC が無い/壊れていても例外を出さない(全部 try)。ミュート中はジングルも鳴らさない。 */
const TTB={on:1,go:0};          // on=タイトル表示中(=bgmState が 'tt') go=スタート済み
SONGS.tt={bpm:136,pc:2,minor:0,sc:SCJ,tr:.9,
  // A: D - G - Em - A  /  B: Bm - G - D - A(→Dへ戻る)
  ch:[[[0,'M'],[3,'M'],[1,'m'],[4,'M']],[[5,'m'],[3,'M'],[0,'M'],[4,'M']]],
  // 0=ファンファーレ(3連打→オクターブ跳躍) 1=下降の応答 2=B の天へ昇る旋律
  mt:['3.33a---7-a-c---a-----9-7-------','e---c-a-c---a-7-9-----7-a-------','a-c-e-g-e---c---e-c-a-c-a---7---'],
  lm:[[0,1,0,1],[2,1,2,0]],ls:[0,0],lw:['p50','p25','p50','p25'],
  ar:['0.1.2.3.4.3.2.1.','0.2.4.5.4.2.4.5.'],bs:['r...r.f.r...o.f.','r.rrr.rrr.rro.rr'],
  dk:['k.......k.k.....','k...k.k.k...k.kk'],ds:['....s.......s...','....s.......s.ss'],dh:['x.x.x.x.x.x.x.xX','x.X.x.X.x.X.x.XX'],
  bw:'triangle',aw:'p12',pd:'triangle',hr:[0,1],vol:{ld:.05,ar:.02,bs:.085,k:.19,sn:.085,h:.022,pd:.014}};
bgPrep(SONGS.tt);
SRANK.tt=-1;                    // タイトル曲より上位=どの曲にも即切り替わる(実際の切り替えは ttBgmGo が行う)
/* 序曲の飾り: 標準パートに ティンパニ(4小節目末のロール) と B の鐘(高い和音の粒) を足す */
const TT_BASE=Object.assign({},SONGS.tt);
SONGS.tt.cs=function(S,st,t,sd){
  bgStep(TT_BASE,st,t,sd);
  try{
    const bar=(st>>4)&15,k=st&15,sec=bar>>3,ch=S.ch[sec][(bar&7)>>1],rc=(S.pc+S.sc[ch[0]])%12,tn=CTY[ch[1]];
    if((bar&3)===3&&k>=8&&k%2===0)sVo(mf(38+rc),t,.18,'triangle',.05+.012*(k-8),{f2:mf(31+rc),dest:'bg'});   // ティンパニ
    if(st===0)sVo(mf(26+rc),t,1.2,'triangle',.09,{dest:'bg',sus:.3});                                          // 曲頭の低いドーン
    if(sec===1&&k%4===2)sVo(mf(84+rc+tn[(k>>2)%3]),t,sd*3,'p12',.012,{dest:'ld'});                            // 鐘
  }catch(e){}
};
/* bgmState を包む(79b より外側): タイトル表示中は常に 'tt' */
{const o=bgmState;bgmState=function(){if(TTB.on)return'tt';return o.apply(this,arguments)}}
/* ジングル(スタートの締め): t から 上昇3音(16分) → 主和音を4声で鳴らす + クラッシュ/キック/ティンパニ。長さ(秒)を返す */
const TT_JLEN=1.3;
function ttJingle(t){
  const g=sGr();if(!g||SND.m)return 0;
  const sd=60/SONGS.tt.bpm/4,dB=g.bg,dL=g.ld,h=t+sd*3;     // 曲バスではなくマスターへ直接(タイトル曲のフェードに巻き込まれない)
  [62,66,69].forEach((n,i)=>{sVo(mf(n+12),t+i*sd,sd*.95,'p25',.05,{dest:dL});sVo(mf(n),t+i*sd,sd*.95,'p12',.03,{dest:dB})});
  [74,78,81,86].forEach((n,i)=>sVo(mf(n),h,.95,i%2?'p25':'p50',.034,{dest:i?dB:dL,sus:.55,vib:1}));
  sVo(mf(38),h,1,'triangle',.11,{dest:dB,sus:.4});sVo(mf(26),h,.6,'sine',.12,{f2:mf(22),dest:dB});
  for(let i=0;i<4;i++)sVo(mf(38),t+i*sd*.5,.12,'triangle',.04+.012*i,{f2:mf(31),dest:dB});                     // ロール
  try{sNs(h,.11,1.1,'w',dB);sNs(h,.06,.8,'m',dB);sVo(165,h,.16,'sine',.24,{f2:42,dest:dB})}catch(e){}
  for(let i=0;i<6;i++)sVo(mf(86+[0,4,7,12,7,16][i]),h+.08+i*.06,.14,'p12',.014,{dest:dL});                    // キラキラ
  return TT_JLEN;
}
/* 1) 最初のタップ: AC を作ってタイトル曲 */
function ttBgmStart(){
  if(TTB.go)return false;
  try{if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}
  if(!AC)return false;
  try{sndResume();bgm()}catch(e){}
  return true;
}
/* 2) スタート: タイトル曲を切ってジングル → ゲーム曲。何度呼ばれても1回だけ */
function ttBgmGo(){
  if(TTB.go)return;TTB.go=1;
  try{
    if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();
  }catch(e){}
  try{if(AC&&!BG.iv)bgm()}catch(e){}       // まだ鳴っていなければ(=いきなりスタート)ここで開始(BG.s='tt')
  TTB.on=0;
  if(!AC)return;
  try{
    const now=AC.currentTime,sd=60/SONGS.tt.bpm/4;
    let t0=Math.max(now+.03,Math.min(BG.nx||now,now+.25));        // 次の16分(先読み済みの分は曲バスごとフェードで消す)
    if(!(t0>=now))t0=now+.03;
    bgNewBus(t0,.12,1);                                             // タイトル曲をフェードアウト(以降の曲は bgSwitch で新しいバス)
    const L=(BG.on&&!SND.m)?ttJingle(t0):0;
    BG.s='tt';BG.st=0;BG.nx=t0+(L||sd*2);                          // ジングルの後、bgTick が bgmState(=ゲーム曲) へ bgSwitch する
  }catch(e){}
}
