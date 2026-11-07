/* ---------- BGM (sound担当): 5曲 x 16小節(A8小節 + B8小節)のループ。全パートをコードで生成 ----------
   曲  n=通常(Am 128) b=ボス(Dm 150) f=FEVER(G 160) r=RUSH(Cm 172) j=JACKPOT(E 180)
   構成: 各セクション8小節 = コード4つ x 2小節。リードは「コード根音からの音階ステップ」で書いたモチーフ(2小節)を
        コードごとに移調して鳴らす。ベース/アルペジオ/ドラムは16文字(16分音符)パターン。 */
const SCM=[0,2,3,5,7,8,10],SCJ=[0,2,4,5,7,9,11],SCH=[0,2,3,5,7,8,11];
const CTY={m:[0,3,7],M:[0,4,7]};
// コード = [根音の音階度数(0〜6), 種類, ハーモニックマイナーフラグ]
const SONGS={
  n:{bpm:128,pc:9,minor:1,sc:SCM,
    ch:[[[0,'m'],[5,'M'],[2,'M'],[6,'M']],[[0,'m'],[5,'M'],[3,'m'],[4,'M',1]]],
    mt:['3.....5.....7...a-----9---7-5---','5---7---a--9-7-54---5---7-----5.','7--8--a-9--7--5-3---5-4-3-------'],
    lm:[[0,0,0,1],[1,2,1,2]],ls:[4,0],lw:['p25','p12','p25'],
    ar:['0.1.2.3.2.1.2.4.','0.2.4.5.4.2.3.1.'],bs:['r..r..r.r..r.o..','r.r.o.r.r.r.f.o.'],
    dk:['k.....k.k.k.....','k.....k.k.....k.'],ds:['....s.......s...','....s.......s...'],dh:['x.x.x.x.x.x.x.xX','x.x.x.X.x.x.x.xX'],
    bw:'triangle',aw:'p12',vol:{ld:.05,ar:.022,bs:.085,k:.2,sn:.09,h:.026}},
  b:{bpm:150,pc:2,minor:1,sc:SCM,
    ch:[[[0,'m'],[5,'M'],[6,'M'],[4,'M',1]],[[0,'m'],[3,'m'],[5,'M'],[4,'M',1]]],
    mt:['3.3.3.5.3.3.7.5.3.3.3.5.3.9.8.7.','7.7.7.8.7.7.a.9.8.8.8.9.8.7.5.3.','3-4-5-6-7-8-9-a-a.9.8.7.6.5.4.3.'],
    lm:[[0,0,0,2],[1,1,0,2]],ls:[0,0],lw:['p25','p12'],
    ar:['0.2.0.2.4.2.0.2.','0.2.4.2.0.2.5.4.'],bs:['r.r.rrr.r.r.rrr.','r.rrr.rrr.rrrofo'],
    dk:['k.k...k.k.k...k.','k.k.k.k.k.k...kk'],ds:['....s.......s...','....s.......s.s.'],dh:['XxxxXxxxXxxxXxxx','XxxxXxxxXxxxXxXx'],
    bw:'sawtooth',aw:'p12',vol:{ld:.05,ar:.02,bs:.06,k:.22,sn:.1,h:.022}},
  f:{bpm:160,pc:7,minor:0,sc:SCJ,
    ch:[[[0,'M'],[5,'m'],[3,'M'],[4,'M']],[[0,'M'],[2,'m'],[5,'m'],[4,'M']]],
    mt:['7.a.c.a.7.a.c.e.c.a.7.5.7.a.c...','a-a-a-9-a-c-e-c-a-9-7-9-a-----7.','5.7.a.7.5.7.a.c.e.c.a.c.e.g.e.c.'],
    lm:[[2,0,2,0],[1,0,1,2]],ls:[0,0],lw:['p50','p25'],
    ar:['0.2.4.5.4.2.5.4.','0245024502450245'],bs:['r.o.r.o.r.o.r.f.','r.rrr.o.r.rrr.f.'],
    dk:['k...k...k...k...','k...k...k..kk...'],ds:['....s.......s.s.','....s.......s.s.'],dh:['x.x.x.x.x.x.x.xx','xxx.x.xxx.x.x.xx'],
    bw:'triangle',aw:'p25',vol:{ld:.048,ar:.024,bs:.085,k:.2,sn:.09,h:.026}},
  r:{bpm:172,pc:0,minor:1,sc:SCM,
    ch:[[[0,'m'],[5,'M'],[6,'M'],[4,'M',1]],[[0,'m'],[5,'M'],[2,'M'],[6,'M']]],
    mt:['7-7a-9-7-5-7-a-ca-9-7-5-7-9-a-7-','a-a-c-a-9-7-9-a-c-a-9-7-5-7-9-a-','3.5.7.a.7.5.7.a.c.a.7.a.c.e.c.a.'],
    lm:[[2,0,2,0],[1,1,0,2]],ls:[0,0],lw:['p25','p12','p50'],
    ar:['0245425402454254','0123210301232105'],bs:['r.o.r.o.r.o.r.o.','r.orr.orr.orr.of'],
    dk:['k...k...k...k...','k...k...k...k.kk'],ds:['....s.......s...','....s.......s.ss'],dh:['x.X.x.X.x.X.x.X.','xxX.xxX.xxX.xxXx'],
    bw:'p50',aw:'p12',vol:{ld:.05,ar:.022,bs:.06,k:.22,sn:.1,h:.024}},
  j:{bpm:180,pc:4,minor:0,sc:SCJ,
    ch:[[[0,'M'],[5,'m'],[3,'M'],[4,'M']],[[0,'M'],[2,'m'],[3,'M'],[4,'M']]],
    mt:['7--7a--c--e--c-ac--a--7--a--c-e-','e-e-e-c-a-c-e-g-g-e-c-a-c-e-g-e-','7.a.c.e.c.a.7.a.c.e.g.e.c.a.c.e.'],
    lm:[[0,1,0,1],[2,1,2,1]],ls:[0,0],lw:['p25','p50','p12'],
    ar:['0123432101234321','0245425402454254'],bs:['rorororororororo','rorororororororo'],
    dk:['k...k...k...k.k.','k..kk..kk..kk.kk'],ds:['....s.......s.s.','..s...s...s...ss'],dh:['xxxxxxxxxxxxxxxx','XxXxXxXxXxXxXxXx'],
    bw:'square',aw:'p25',vol:{ld:.052,ar:.026,bs:.065,k:.22,sn:.1,h:.026}}
};
const SRANK={n:0,b:1,f:2,r:3,j:4};
/* モチーフ前処理: 各16分位置の「音の長さ(ステップ)」と「音階ステップ値(根音=0)」 */
for(const k in SONGS){
  const S=SONGS[k];S.lt=55+(((S.pc-55)%12)+12)%12;
  S.mv=S.mt.map(m=>{const len=new Array(m.length).fill(0),val=new Array(m.length).fill(0);let last=-1;
    for(let i=0;i<m.length;i++){const c=m[i];if(c==='.'){last=-1}else if(c==='-'){if(last>=0)len[last]++}else{last=i;len[i]=1;val[i]=parseInt(c,36)-3}}
    return{len,val}});
  S.pcs=S.sc.map(x=>(S.pc+x)%12);
}
const dpitch=(S,idx,hm)=>{const sc=hm?SCH:S.sc,o=Math.floor(idx/7),k=((idx%7)+7)%7;return S.lt+12*o+sc[k]};

/* --- ドラム(BGMバスへ直接) --- */
const dKick=(t,v)=>{sVo(165,t,.14,'sine',v,{f2:42,dest:'bg'});sVo(1400,t,.02,'triangle',v*.25,{f2:200,dest:'bg'})};
const dSnare=(t,v)=>{sNs(t,v,.13,'w','bg');sVo(230,t,.08,'triangle',v*.6,{f2:130,dest:'bg'})};
const dHat=(t,v,o)=>sNs(t,v,o?.1:.035,'h','bg');
const dCrash=(t,v)=>{sNs(t,v,1.1,'w','bg');sNs(t,v*.6,.8,'m','bg')};

/* --- 1ステップ(16分音符)ぶんの全パート --- */
function bgStep(S,st,t,sd){
  const bar=(st>>4)&15,k=st&15,sec=bar>>3,bi=bar&7,ci=bi>>1,bb=bi&1,V=S.vol,ch=S.ch[sec][ci];
  const fill=(bar&3)==3&&k>=12;
  if(S.dk[sec][k]==='k')dKick(t,V.k);
  if(fill)dSnare(t,V.sn*(.5+.17*(k-12)));
  else{
    if(S.ds[sec][k]==='s')dSnare(t,V.sn);
    const h=S.dh[sec][k];if(h==='x')dHat(t,V.h);else if(h==='X')dHat(t,V.h*1.5,1);
  }
  if(k===0&&(bar===0||bar===8))dCrash(t,V.k*(bar?.3:.45));
  const rs=S.sc[ch[0]],rc=(S.pc+rs)%12,tn=CTY[ch[1]],tones=[tn[0],tn[1],tn[2],12,12+tn[1],12+tn[2]];
  // ベース
  const bc=S.bs[sec][k];
  if(bc!=='.'){let n=1;while(k+n<16&&n<4&&S.bs[sec][k+n]==='.')n++;
    sVo(mf(36+rc+(bc==='o'?12:bc==='f'?7:0)),t,Math.max(.06,n*sd*.9),S.bw,V.bs,{dest:'bg',sus:.5})}
  // アルペジオ
  const ac=S.ar[sec][k];
  if(ac!=='.')sVo(mf(48+rc+tones[+ac]+(S.aw==='p25'?12:0)),t,sd*1.5,S.aw,V.ar,{dest:'bg'});
  // リード(コード根音を基準にモチーフを移調)
  if(bi>=S.ls[sec]){
    const m=S.mv[S.mt.length>1?S.lm[sec][ci]:0],ix=bb*16+k,len=m.len[ix];
    if(len>0){let p=dpitch(S,ch[0]+m.val[ix],ch[2]);while(p>88)p-=12;while(p<50)p+=12;
      sVo(mf(p),t,Math.max(.05,len*sd*.96),S.lw[(bar>>1)%S.lw.length],V.ld*(k%4?1:1.12),{dest:'ld',sus:.6,vib:len>=3})}
  }
}

/* --- 状態判定: JACKPOT > RUSH > FEVER > ボス > 通常。上位への遷移は次の拍頭で即、下位へは次の小節頭で --- */
function bgmState(){try{if(G.jp>0)return'j';if(G.rush>0)return'r';if(G.fv>0)return'f';if(isBoss())return'b'}catch(e){}return'n'}
function sSetKey(S,t){SND.pc=S.pc;SND.min=S.minor;SND.pcs=S.pcs;try{if(SGR&&!SGR.bad&&SGR.dl)SGR.dl.delayTime.setValueAtTime(60/S.bpm*.75,t)}catch(e){}}
function bgSwitch(s,t){
  const up=SRANK[s]>SRANK[BG.s],S=SONGS[s];BG.s=s;BG.st=0;sSetKey(S,t);
  if(up){ // 盛り上がり: クラッシュ+キック+主和音のスタブ
    dCrash(t,.09);dKick(t,S.vol.k*1.2);
    const r=S.lt-12+(S.minor?0:0),tn=S.minor?CTY.m:CTY.M;
    tn.forEach(x=>sVo(mf(r+x+12),t,.3,'square',.03,{dest:'bg'}));
    if(s==='j'||s==='r')sVo(mf(r+36),t,.25,'p25',.04,{dest:'ld'});
  }else dCrash(t,.03);
}
function bgTick(){
  try{
    if(!AC||SND.m||!BG.on)return;
    if(AC.state&&AC.state!=='running'){sndResume();return}
    sGr();
    const now=AC.currentTime;
    if(BG.nx<now-.25)BG.nx=now+.05;
    const la=(typeof document!=='undefined'&&document.hidden)?1.6:.25;
    let guard=0;
    while(BG.nx<now+la&&guard++<64){
      if((BG.st&3)===0){const w=bgmState();if(w!==BG.s&&(SRANK[w]>SRANK[BG.s]||(BG.st&15)===0))bgSwitch(w,BG.nx)}
      const S=SONGS[BG.s],sd=60/S.bpm/4;
      bgStep(S,BG.st,BG.nx,sd);BG.st++;BG.nx+=sd;
    }
  }catch(e){}
}
function bgm(){
  if(!AC||BG.iv)return;
  sndUnlock();sndResume();sGr();
  BG.s=bgmState();BG.st=0;sSetKey(SONGS[BG.s],AC.currentTime);
  BG.nx=AC.currentTime+.1;
  BG.iv=setInterval(bgTick,60);
}
