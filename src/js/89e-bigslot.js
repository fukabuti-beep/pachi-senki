/* ---------- スロット破砕 → 巨大スロット (fx) ----------
   SUPER リーチ(sp.type==2)の発生時に、当否から決まる確率で発展: 通常の3リール(#slot)にヒビ → 砕け散る(破片が飛ぶ)→
   盤面の中央に巨大リール(16x16 の図柄を6倍)が落ちてきて、本物のリールの動きをそのまま大きく映す(reelShow を記録するだけ。
   停止時間・図柄・擬似連/復活(86)は本体のまま)→ 揃えば「大当たり!!」/外れれば色が抜けて消える → 小さいスロットが組み直る。
   発生率: JACKPOT 75% / 当たり 40% / ハズレ 10%(SUPER リーチ中・RUSH 外のみ)。期待度の色(背景の光線)は 赤/金/青/虹。
   描画は 89d の共通オーバーレイ(#hyc)。破片は最大48個。光の演出 OFF / prefers-reduced-motion では破片を減らし揺れ・回転を止める。
   BS.force = 1 で次の SUPER リーチに必ず発展(テスト用)。 */
const BS={s:null,force:0,n:0},HYR=[{d:7,sp:0,ph:0},{d:7,sp:0,ph:0},{d:7,sp:0,ph:0}];
{const o=reelShow;reelShow=function(i,d,spin,ph){try{const R=HYR[i];if(R){R.d=d;R.sp=spin?1:0;R.ph=ph||0}}catch(e){}return o.apply(this,arguments)}}
function bsProb(s){return s.jp?.75:s.hit?.4:.1}
function bsSlot(on){try{const e=$('slot');if(!e)return;const c=String(e.className||'').replace(/\s*hy(bs|rb)/g,'');e.className=on?c+' hybs':c+' hyrb';if(!on)presLater(()=>{try{e.className=String(e.className).replace(/\s*hyrb/g,'')}catch(_){}},500)}catch(e){}}
function bsStart(s){const r=Math.random();BS.n++;
  const col=s.jp?'rb':s.hit?(r<.55?'#ff2244':'#ffd400'):(r<.7?'#3a8aff':'#ff2244');
  BS.s={sp:s,t0:T,g:PGEN,ph:0,col,sh:[],last:[HYR[0].sp,HYR[1].sp,HYR[2].sp],kick:[0,0,0],res:null,tr:0};seHy('crack');try{showMsg('!?','#fff')}catch(e){}}
function bsShards(B,L){const S=L.s,lite=hyLite(),n=lite?12:44;
  for(let i=0;i<n&&B.sh.length<48;i++){const k=i%3,rx=S.x+10+k*59+Math.random()*52,ry=S.y+8+Math.random()*50,a=Math.random()*TAU,v=120+Math.random()*260,z=4+Math.random()*9;
    const pts=[];for(let j=0;j<3;j++){const an=j/3*TAU+Math.random()*.9;pts.push(Math.cos(an)*z,Math.sin(an)*z)}
    B.sh.push({x:rx,y:ry,vx:Math.cos(a)*v,vy:Math.sin(a)*v-180,r:0,vr:(Math.random()-.5)*14,pts,c:['#f2ead2','#ffd400','#3a2398','#b8bce0','#fff'][i%5],l:1.3+Math.random()*.4})}}
function bsUpd(dt){const B=BS.s;if(!B){const s=sp;if(s&&s.type==2&&s.rs&&!s.bs0){s.bs0=1;if(G.rush<=0&&(BS.force||Math.random()<bsProb(s))){BS.force=0;s.bigs=1;bsStart(s)}}return}
  if(B.g!==PGEN){BS.s=null;bsSlot(0);return}
  const p=T-B.t0,L=hyLay();
  if(B.ph==0&&p>=.18&&!B.c2){B.c2=1;seHy('crack')}
  if(B.ph==0&&p>=.38){B.ph=1;bsSlot(1);bsShards(B,L);seHy('shatter');if(!hyLite())shake()}
  if(B.ph==1&&p>=.6){B.ph=2;B.tin=T;seHy('bigin');if(!hyLite())shake()}
  for(let i=B.sh.length-1;i>=0;i--){const q=B.sh[i];q.vy+=900*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.r+=q.vr*dt;q.l-=dt;if(q.l<=0||q.y>800)B.sh.splice(i,1)}
  if(B.ph>=2&&!B.res){for(let i=0;i<3;i++){const now=HYR[i].sp;if(B.last[i]&&!now){B.kick[i]=1;const hot=i==2&&HYR[0].d==HYR[1].d&&HYR[1].d==HYR[2].d;seHy('bigstop',hot?1:0)}B.last[i]=now}
    if(sp!==B.sp){const win=!!B.sp.hit;B.res=win?'win':'lose';B.tr=T;bsSlot(0);if(win)seHy('bigwin')}}
  for(let i=0;i<3;i++)B.kick[i]=Math.max(0,B.kick[i]-dt*4);
  if(B.res&&T-B.tr>1.1)BS.s=null;
  // 盤面に出る前に回転が終わった(打ち切り等)
  if(B.ph<2&&sp!==B.sp&&!B.res){B.res='lose';B.tr=T;bsSlot(0)}}
function bsCol(B,t,k){return B.col==='rb'?'hsl('+Math.floor(t*160+(k||0))%360+',100%,60%)':B.col}
function bsDraw(c,t,L){const B=BS.s;if(!B)return;const p=T-B.t0,S=L.s,lite=hyLite();
  // ヒビ(スロットの上)
  if(B.ph==0){c.strokeStyle='#fff';c.lineWidth=2;const n=B.c2?3:1;for(let k=0;k<3;k++){const cx=S.x+36+k*59,cy=S.y+33;c.beginPath();for(let j=0;j<n+2;j++){const an=j*2.1+k,len=10+j*7;c.moveTo(cx,cy);c.lineTo(cx+Math.cos(an)*len*.6,cy+Math.sin(an)*len*.5);c.lineTo(cx+Math.cos(an+.3)*len,cy+Math.sin(an+.3)*len*.8)}c.stroke()}}
  // 破片
  for(const q of B.sh){c.save();c.globalAlpha=Math.min(1,q.l*2);c.translate(q.x,q.y);c.rotate(lite?0:q.r);c.fillStyle=q.c;c.beginPath();c.moveTo(q.pts[0],q.pts[1]);c.lineTo(q.pts[2],q.pts[3]);c.lineTo(q.pts[4],q.pts[5]);c.closePath();c.fill();c.strokeStyle='#000';c.lineWidth=1;c.stroke();c.restore()}
  if(B.ph<2)return;
  const P=L.p,cx=P.x+P.w/2,cy=P.y+P.h*.46,pin=T-B.tin,fo=B.res?Math.max(0,1-(T-B.tr-.75)/.35):1;if(fo<=0)return;
  let sc=pin<.25?.2+pin/.25*.95:pin<.4?1.15-(pin-.25)/.15*.15:1;if(lite)sc=Math.min(1,sc);
  c.globalAlpha=Math.min(1,pin*5)*fo;
  // 盤面を暗く+期待度の色の光線
  c.fillStyle='rgba(6,2,22,.72)';c.fillRect(P.x,P.y,P.w,P.h);
  c.save();c.beginPath();c.rect(P.x,P.y,P.w,P.h);c.clip();c.translate(cx,cy);if(!lite)c.rotate(t*.6);for(let i=0;i<12;i++){c.rotate(TAU/12);c.fillStyle=bsCol(B,t,i*30);c.globalAlpha=(i%2?.22:.12)*fo;c.beginPath();c.moveTo(0,0);c.lineTo(300,-34);c.lineTo(300,34);c.closePath();c.fill()}c.restore();
  c.globalAlpha=Math.min(1,pin*5)*fo;
  c.translate(cx,cy);c.scale(sc,sc);
  const RW=96,GP=10,W=RW*3+GP*2+28,H=RW+28,x0=-W/2,y0=-H/2;
  // 筐体(金ベゼル)
  c.fillStyle='#000';c.fillRect(x0-6,y0-6,W+12,H+12);c.fillStyle='#ffd400';c.fillRect(x0-4,y0-4,W+8,H+8);c.fillStyle='#b88a00';c.fillRect(x0-1,y0-1,W+2,H+2);c.fillStyle='#000';c.fillRect(x0,y0,W,H);c.fillStyle='#2a1878';c.fillRect(x0+2,y0+2,W-4,H-4);
  // LED(枠をゆっくり流れる)
  const ph=Math.floor(t*(lite?3:10));for(let k=0;k<40;k++){const on=(k+ph)%4<2,fx=x0-4+k*(W+8)/40;c.fillStyle=on?bsCol(B,t,k*9):'#3a2a70';c.fillRect(Math.round(fx),y0-4,3,3);c.fillRect(Math.round(fx),y0+H+1,3,3)}
  // 題字
  c.textAlign='center';hyTxt(c,B.res==='win'?'大当たり!!':'SUPER BIG REACH',0,y0-14,B.res==='win'?24:16,B.res==='win'?'hsl('+Math.floor(t*200)%360+',100%,64%)':bsCol(B,t));
  // 巨大リール
  const hit3=HYR[0].d==HYR[1].d&&HYR[1].d==HYR[2].d&&!HYR[2].sp,reach=!HYR[0].sp&&!HYR[1].sp&&HYR[0].d==HYR[1].d;
  for(let i=0;i<3;i++){const R=HYR[i],rx=x0+14+i*(RW+GP),ry=y0+14+Math.round(B.kick[i]*-8);
    c.fillStyle='#000';c.fillRect(rx-4,ry-4,RW+8,RW+8);c.fillStyle=(i==2&&R.sp&&reach)?bsCol(B,t):'#b8bce0';c.fillRect(rx-2,ry-2,RW+4,RW+4);
    c.save();c.translate(rx,ry);c.scale(6,6);try{UX.drawReel(c,R.d,!!R.sp,R.ph,0,0,-1)}catch(e){}c.restore();
    if(B.res==='lose'){c.fillStyle='rgba(20,20,40,.55)';c.fillRect(rx,ry,RW,RW)}
    c.fillStyle='rgba(255,255,255,.18)';c.fillRect(rx+4,ry+4,10,RW-8)}
  // リーチライン/揃いライン
  if(reach&&!B.res){c.globalAlpha*=.5+.3*Math.sin(t*4);c.fillStyle=bsCol(B,t);c.fillRect(x0+6,-2,W-12,4)}
  if(B.res==='win'||hit3&&B.sp.hit){const q=Math.min(1,(T-(B.tr||T))*4);c.globalAlpha=fo;c.strokeStyle='hsl('+Math.floor(t*240)%360+',100%,60%)';c.lineWidth=4;c.strokeRect(x0-8-q*6,y0-8-q*6,W+16+q*12,H+16+q*12)}}
HYD.push({act:()=>!!BS.s,draw:bsDraw});
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{bsUpd(dt)}catch(e){if(BS.s){BS.s=null;bsSlot(0)}}return r}}
