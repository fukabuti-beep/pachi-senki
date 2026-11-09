/* ---------- 動くタイトル画面 (fx担当) ----------
   #ov(index.html)はそのまま使い、JS で飾りを足す(DOM の id は変えない。#go のクリックで開始も従来どおり)。
   - 背景キャンバス #ttbg(3px=1ドットの低解像度): 回る光の筋 / 釘と風車の盤面を銀玉が転がり落ちる / 左右の電飾がゆっくり流れる /
     下の地面で英雄3人が行進して、右から来る敵を殴って倒す(ドット爆散+ダメージ数字)/ ロゴのまわりのきらめき
   - ロゴ「パチ戦記」は1文字ずつ落ちてきて弾む → 光が文字を走る(CSS 41-title.css)。スタートボタンは脈打つ
   - 最初のタップ(スタートボタン以外)でタイトル曲(79c: ttBgmStart)。右上の ♪ でサウンド切替。続きの人には STAGE/最高記録を小さく
   - スタート: 99-main の #go.onclick から ttGo() → ジングル(79c: ttBgmGo)+ 扉が上下に開くトランジション(玉が弾け飛ぶ)
   prefers-reduced-motion では: ロゴ落下/脈動/光の回転/電飾の流れ/扉なし(玉はゆっくり少なめ、英雄は立ち止まる)。
   フラッシュ(全画面点滅)は使わない。キャンバスは低解像度でshadowBlur/グラデ無し。タイトルが消えたらループも止まる。 */
const TTL={cv:null,x:null,W:0,H:0,S:3,t:0,on:1,rm:false,balls:[],pins:null,P:[],wm:[],box:null,lg:null,
  en:null,enT:1.2,ht:[0,0,0],hi:0,F:[],tw:[],sp:0,last:0,bt:0,went:0,ok:0};
/* 3x5 の数字フォント(ダメージ数字用) */
const TT_DG=['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001010010010','111101111101111','111101111001111'];
function ttRM(){try{return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){return false}}
function ttEl(tag,id,cls,html){const e=document.createElement(tag);if(id)e.id=id;if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
/* --- 飾りの組み立て --- */
function ttInit(){
  const ov=$('ov');if(!ov||!ov.querySelector||!ov.insertBefore)return false;
  TTL.rm=ttRM();ov.classList.add('ttv2');if(TTL.rm)ov.classList.add('ttrm');
  // ロゴを1文字ずつ <em> に(落下アニメ用)。span の色/影はそのまま継承
  try{let n=0;ov.querySelectorAll('h1>span').forEach(s=>{s.innerHTML=[...s.textContent].map(c=>'<em style="--i:'+(n++)+'">'+c+'</em>').join('')})}catch(e){}
  const cv=ttEl('canvas','ttbg');ov.insertBefore(cv,ov.firstChild);TTL.cv=cv;TTL.x=cv.getContext&&cv.getContext('2d');
  const go=$('go');
  const ct=ttEl('div','ttcont','tt-i');ct.style.display='none';
  const hn=ttEl('div','tthint','tt-i','画面をタップで <b>♪</b> BGM');
  try{go.parentNode.insertBefore(ct,go);go.parentNode.insertBefore(hn,go)}catch(e){}
  const sb=ttEl('button','ttsnd','','♪');sb.type='button';sb.setAttribute('aria-label','サウンド');ov.appendChild(sb);
  sb.addEventListener('click',e=>{e.stopPropagation();ttSnd()});
  const tap=e=>{try{if(e&&e.target&&e.target.closest&&e.target.closest('#go,#ttsnd'))return}catch(x){}ttTap()};
  ov.addEventListener('touchend',tap,{passive:true});ov.addEventListener('click',tap);
  try{window.addEventListener('resize',()=>{TTL.box=null;ttSize()})}catch(e){}
  ttSize();ttLabel();
  setTimeout(ttCont,0);
  TTL.ok=1;try{requestAnimationFrame(ttFrame)}catch(e){}
  return true;
}
/* 続きの情報(91-meta の X はこのファイルより後で宣言されるので遅らせて読む) */
function ttCont(){
  try{const c=$('ttcont');if(!c)return;const st=G.stage|0;let b=0,pr=0;try{b=X.best|0;pr=X.pres|0}catch(e){}
    if(st>1||b>1){c.innerHTML='つづきから <b>STAGE '+st+'</b>'+(b>st?' ・ 最高 '+b:'')+(pr>0?' ・ 転生 '+pr+'回':'');c.style.display=''}}catch(e){}
}
/* 最初のタップ: タイトル曲 */
function ttTap(){
  if(TTL.went)return false;
  const r=ttBgmStart();TTL.tapped=1;ttLabel();return r;
}
function ttSnd(){
  if(TTL.went)return;
  if(!AC||!BG.iv){if(SND.m)setMute(false);ttBgmStart()}else setMute(!SND.m);
  TTL.tapped=1;ttLabel();
}
function ttLabel(){
  try{const sb=$('ttsnd'),hn=$('tthint'),on=!!(AC&&BG.iv&&!SND.m);
    sb.className=on?'on':'';sb.innerHTML='♪<small>'+(on?'ON':'OFF')+'</small>';
    if(!TTL.tapped)hn.innerHTML='画面をタップで <b>♪</b> BGM';
    else hn.innerHTML=on?'<b>♪</b> パチ戦記 序曲':'サウンド OFF(右上の ♪ で切替)';
    hn.className='tt-i'+(TTL.tapped?' on':'')}catch(e){}
}
/* --- 寸法と盤面 --- */
function ttSize(){
  const cv=TTL.cv;if(!cv)return;
  const w=Math.max(1,window.innerWidth||360),h=Math.max(1,window.innerHeight||640),S=TTL.S;
  TTL.W=Math.ceil(w/S);TTL.H=Math.ceil(h/S);cv.width=TTL.W;cv.height=TTL.H;
  if(TTL.x)TTL.x.imageSmoothingEnabled=false;
  ttBox();ttPins();
}
function ttBox(){
  try{const ov=$('ov'),o=ov.getBoundingClientRect(),S=TTL.S;let l=1e9,t=1e9,r=-1e9,b=-1e9;
    ['.tt-s','#tc','#ov>p','#go','#ttcont','#tthint','.tt-c'].forEach(q=>{const e=ov.querySelector(q);if(!e||e.style.display==='none')return;const k=e.getBoundingClientRect();if(!k.width)return;l=Math.min(l,k.left);t=Math.min(t,k.top);r=Math.max(r,k.right);b=Math.max(b,k.bottom)});
    const h1=ov.querySelector('h1'),k=h1&&h1.getBoundingClientRect();
    if(k&&k.width){l=Math.min(l,k.left);r=Math.max(r,k.right);t=Math.min(t,k.top-8);TTL.lg={x:(k.left-o.left)/S,y:(k.top-o.top)/S,w:k.width/S,h:k.height/S}}
    if(r>l)TTL.box={l:(l-o.left)/S-3,t:(t-o.top)/S-3,r:(r-o.left)/S+3,b:(b-o.top)/S+3};
  }catch(e){}
  if(!TTL.box)TTL.box={l:TTL.W*.15,t:TTL.H*.3,r:TTL.W*.85,b:TTL.H*.75};
  if(!TTL.lg)TTL.lg={x:TTL.W*.2,y:TTL.box.t+4,w:TTL.W*.6,h:24};
}
const TT_D=9;  // 釘の間隔(ドット)
function ttPins(){
  const W=TTL.W,H=TTL.H,B=TTL.box,y0=14,rows=Math.max(0,Math.floor((H-34-y0)/TT_D)),cols=Math.ceil(W/TT_D)+1,g=[];
  for(let r=0;r<rows;r++){g[r]=[];for(let c=0;c<cols;c++){const x=c*TT_D+(r&1?TT_D/2:0)+2,y=y0+r*TT_D;
    g[r][c]=(x>5&&x<W-5&&!(x>B.l-4&&x<B.r+4&&y>B.t-6&&y<B.b+4)&&y<H-30)?1:0}}
  // 天釘の V 字: 盤面中央上の釘を1列あける(玉の通り道)
  TTL.pins={g,y0,rows,cols};
  TTL.wm=[];const wy=Math.min(B.t-14,y0+TT_D*4);if(wy>y0+10){TTL.wm.push({x:W*.22,y:wy,a:0},{x:W*.78,y:wy,a:1})}
  TTL.balls.length=0;
}
/* --- 1フレーム --- */
function ttFrame(ts){
  if(!TTL.on)return;
  const ov=$('ov');if(!ov||ov.style.display==='none'||TTL.went){TTL.on=0;return}
  try{requestAnimationFrame(ttFrame)}catch(e){}
  const dt=Math.max(0,Math.min(.05,(ts-TTL.last)/1000||0));TTL.last=ts;
  ttStep(dt);ttDraw();
}
function ttStep(dt){
  const L=TTL,rm=L.rm;L.t+=dt;L.bt+=dt;
  if(L.bt>1){L.bt=0;const o=L.box;ttBox();const n=L.box;if(o&&n&&Math.abs(o.t-n.t)+Math.abs(o.b-n.b)+Math.abs(o.l-n.l)>3)ttPins()}
  // 玉の発射(上端から)
  L.sp+=dt*(rm?1.6:6);
  while(L.sp>=1){L.sp--;if(L.balls.length<(rm?12:40))L.balls.push({x:6+Math.random()*(L.W-12),y:-2,vx:(Math.random()-.5)*10,vy:rm?8:20,g:Math.random()<.06})}
  const P=L.pins,G2=rm?45:120,B=L.box;
  for(let i=L.balls.length-1;i>=0;i--){const b=L.balls[i];
    b.vy+=G2*dt;const vm=rm?30:75;if(b.vy>vm)b.vy=vm;b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.x<4){b.x=4;b.vx=Math.abs(b.vx)*.6}if(b.x>L.W-4){b.x=L.W-4;b.vx=-Math.abs(b.vx)*.6}
    if(P){const r0=Math.round((b.y-P.y0)/TT_D);
      for(let r=r0-1;r<=r0+1;r++){if(r<0||r>=P.rows)continue;const off=(r&1?TT_D/2:0)+2,c0=Math.round((b.x-off)/TT_D);
        for(let c=c0-1;c<=c0+1;c++){if(c<0||c>=P.cols||!P.g[r][c])continue;const px=c*TT_D+off,py=P.y0+r*TT_D,dx=b.x-px,dy=b.y-py,d2=dx*dx+dy*dy;
          if(d2<5.3&&d2>1e-4){const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=1.5*vn*nx;b.vy-=1.5*vn*ny;b.vx+=(Math.random()-.5)*6}b.x=px+nx*2.31;b.y=py+ny*2.31}}}}
    for(const w of L.wm){const dx=b.x-w.x,dy=b.y-w.y;if(dx*dx+dy*dy<20){b.vx=(dx>=0?1:-1)*(14+Math.random()*16);b.vy=-6}}
    // 中央の看板(ロゴ/ボタン)に届いたら「入賞」のきらめきで消える
    if(b.x>B.l&&b.x<B.r&&b.y>B.t&&b.y<B.b){if(L.tw.length<24)L.tw.push({x:b.x,y:B.t,t:0,c:b.g?'#ffd400':'#ffffff'});
      if(B.b<L.H-40&&Math.random()<.7){b.x=B.l+8+Math.random()*Math.max(1,B.r-B.l-16);b.y=B.b+1;b.vy=rm?6:14;b.vx=(Math.random()-.5)*10;continue}   // 看板の下から出てきて下の盤面へ
      L.balls.splice(i,1);continue}
    if(b.y>L.H-26)L.balls.splice(i,1);
  }
  for(const w of L.wm)w.a+=dt*(rm?0:5);
  // ロゴのきらめき
  if(!rm&&L.t>1.2&&Math.random()<dt*5&&L.tw.length<24){const g=L.lg;L.tw.push({x:g.x+Math.random()*g.w,y:g.y+Math.random()*g.h,t:0,c:Math.random()<.5?'#ffffff':'#ffe14d'})}
  for(let i=L.tw.length-1;i>=0;i--){L.tw[i].t+=dt;if(L.tw[i].t>.6)L.tw.splice(i,1)}
  // ロゴ着地の火花(1回)
  if(!rm&&!L.land&&L.t>.95){L.land=1;const g=L.lg;for(let k=0;k<26;k++)ttPart(g.x+Math.random()*g.w,g.y+g.h,(Math.random()-.5)*60,-10-Math.random()*40,k%3?'#ffd400':'#ff2d7a',.9)}
  // 英雄の行進と敵
  if(!rm){L.enT-=dt;
    if(!L.en&&L.enT<=0){const n=Math.random()<.15?'b'+(Math.random()*4|0):'m'+(Math.random()*10|0);L.en={n,x:L.W+4,hp:3,fl:0}}
    const e=L.en;if(e){e.fl=Math.max(0,e.fl-dt);const fx=ttHX(2)+18;
      if(e.x>fx)e.x-=dt*(22+14);   // 地面と一緒に近づいてくる
      else{L.hi-=dt;if(L.hi<=0){L.hi=.28;const k=(3-e.hp)%3;L.ht[k]=L.t;e.hp--;e.fl=.1;
          ttNum(e.x+8,ttGY()-18,[12,34,77,128,256,777][Math.random()*6|0]*(e.hp?1:3));
          if(L.tw.length<24)L.tw.push({x:e.x+4,y:ttGY()-8,t:0,c:'#ffffff'});
          if(e.hp<=0){ttBoom(e);L.en=null;L.enT=1.4+Math.random()*1.6}}}}}
  for(let i=L.P.length-1;i>=0;i--){const p=L.P[i];p.t+=dt;if(p.t>p.l){L.P.splice(i,1);continue}p.vy+=80*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.gy&&p.y>p.gy){p.y=p.gy;p.vy*=-.4;p.vx*=.7}}
  for(let i=L.F.length-1;i>=0;i--){const f=L.F[i];f.t+=dt;f.y-=dt*12;if(f.t>.8)L.F.splice(i,1)}
}
const ttGY=()=>TTL.H-Math.max(10,Math.round(34/TTL.S)+4);   // 地面の高さ(下の電飾より上)
function ttHX(i){return Math.round(Math.min(TTL.W*.5,TTL.W*.16+40)-34+i*17)}
function ttPart(x,y,vx,vy,c,l,gy){if(TTL.P.length<220)TTL.P.push({x,y,vx,vy,c,l:l||.8,t:0,gy})}
function ttNum(x,y,v){if(TTL.F.length<8)TTL.F.push({x,y,v:String(v),t:0})}
function ttBoom(e){
  const L=PXL[e.n]||[],gy=ttGY();
  for(let k=0;k<L.length;k+=2){const q=L[k];ttPart(e.x+q[0],gy-16+q[1],(q[0]-8)*4+(Math.random()-.5)*16,-20-Math.random()*40,q[2],1.1,gy)}
  for(let k=0;k<6;k++)ttPart(e.x+8,gy-8,(Math.random()-.5)*40,-50-Math.random()*30,'#ffd400',1,gy);
}
/* --- 描画 --- */
const TT_LC=['#ff2d7a','#ffd400','#22e0ff','#3a2a66'];
function ttDraw(){
  const L=TTL,x=L.x;if(!x)return;const W=L.W,H=L.H,t=L.t,rm=L.rm,B=L.box,g=L.lg;
  x.clearRect(0,0,W,H);
  // 回る光の筋(ロゴの中心から)
  const cx=g.x+g.w/2,cy=g.y+g.h/2,R=Math.max(W,H)*1.2,a0=rm?0:t*.12,n=14;
  for(let i=0;i<n;i++){const a=a0+i*Math.PI*2/n;x.fillStyle=i&1?'rgba(255,45,122,.05)':'rgba(255,212,0,.06)';x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);x.lineTo(cx+Math.cos(a+.14)*R,cy+Math.sin(a+.14)*R);x.closePath();x.fill()}
  // 釘
  const P=L.pins;if(P){x.fillStyle='#8a90b8';for(let r=0;r<P.rows;r++){const off=(r&1?TT_D/2:0)+2,py=P.y0+r*TT_D;for(let c=0;c<P.cols;c++)if(P.g[r][c])x.fillRect(c*TT_D+off,py,1,1)}
    x.fillStyle='#d8dcf0';for(let r=0;r<P.rows;r+=2){const off=2,py=P.y0+r*TT_D;for(let c=0;c<P.cols;c+=3)if(P.g[r][c])x.fillRect(c*TT_D+off,py-1,1,1)}}
  // 風車
  for(const w of L.wm){for(let k=0;k<4;k++){const a=w.a+k*Math.PI/2;x.fillStyle=k&1?'#ff2d7a':'#ffd400';for(let s=1;s<=3;s++)x.fillRect(Math.round(w.x+Math.cos(a)*s),Math.round(w.y+Math.sin(a)*s),1,1)}x.fillStyle='#fff';x.fillRect(Math.round(w.x),Math.round(w.y),1,1)}
  // 銀玉(3x3)
  for(const b of L.balls){const bx=Math.round(b.x)-1,by=Math.round(b.y)-1;x.fillStyle=b.g?'#b88a10':'#7d84a6';x.fillRect(bx,by,3,3);x.fillStyle=b.g?'#ffd400':'#e6eaf8';x.fillRect(bx,by,2,2);x.fillStyle='#fff';x.fillRect(bx,by,1,1)}
  // 左右の電飾(ゆっくり流れる)
  const st=rm?0:Math.floor(t*2.5);
  for(let y=8,i=0;y<H-8;y+=6,i++){x.fillStyle=TT_LC[(i+st)%4];x.fillRect(1,y,2,2);x.fillStyle=TT_LC[(i+2+st)%4];x.fillRect(W-3,H-y-2,2,2)}
  // きらめき(+形)
  for(const s of L.tw){const k=s.t/.6,r=k<.5?Math.round(k*6):Math.round((1-k)*6);x.fillStyle=s.c;x.globalAlpha=1-k*.6;x.fillRect(Math.round(s.x)-r,Math.round(s.y),r*2+1,1);x.fillRect(Math.round(s.x),Math.round(s.y)-r,1,r*2+1);x.globalAlpha=1}
  // 地面と英雄
  const gy=ttGY(),sc=rm?0:Math.floor(t*22)%8;
  if(gy>B.b-2){
    x.fillStyle='#2a1c4a';x.fillRect(0,gy,W,2);x.fillStyle='#4a3478';for(let gx=-sc;gx<W;gx+=8)x.fillRect(gx,gy,4,1);
    x.fillStyle='rgba(0,0,0,.35)';for(let i=0;i<3;i++)x.fillRect(ttHX(i)+3,gy-1,10,1);
    for(let i=0;i<3;i++){const d=t-L.ht[i],at=d>=0&&d<.22,fr=at?'s':rm?'':(Math.floor(t*5+i)%2?'w':'b'),s=SPR['h'+i+fr]||SPR['h'+i];
      if(s)x.drawImage(s,ttHX(i)+(at?3:0),gy-16-(rm?0:(Math.floor(t*5+i)%2)),16,16)}
    const e=L.en;if(e&&SPR[e.n]){x.drawImage(SPR[e.n],Math.round(e.x),gy-16,16,16);if(e.fl>0&&typeof spw==='function'){x.globalAlpha=.8;x.drawImage(spw(e.n),Math.round(e.x),gy-16,16,16);x.globalAlpha=1}}
  }
  for(const p of L.P){x.fillStyle=p.c;x.globalAlpha=Math.max(0,1-p.t/p.l);x.fillRect(Math.round(p.x),Math.round(p.y),1,1)}x.globalAlpha=1;
  for(const f of L.F){let fx=Math.round(f.x-f.v.length*2),fy=Math.round(f.y);for(const ch of f.v){const m=TT_DG[+ch];for(let k=0;k<15;k++)if(m[k]==='1'){x.fillStyle='#000';x.fillRect(fx+k%3+1,fy+(k/3|0)+1,1,1)}for(let k=0;k<15;k++)if(m[k]==='1'){x.fillStyle=f.v.length>=4?'#ffd400':'#fff';x.fillRect(fx+k%3,fy+(k/3|0),1,1)}fx+=4}}
}
/* --- スタート: 99-main の #go.onclick から呼ばれる(何度呼ばれても1回) --- */
function ttGo(){
  if(TTL.went)return false;TTL.went=1;TTL.on=0;
  try{ttBgmGo()}catch(e){}
  try{ttTrans()}catch(e){}
  return true;
}
/* 扉が上下に開くトランジション(約1.2秒、ゲームは裏で始まっている) */
function ttTrans(){
  if(!TTL.ok||!document.body||!document.body.appendChild)return;
  const ov=$('ov'),h1=ov&&ov.querySelector&&ov.querySelector('h1');
  const tx=ttEl('div','ttx',TTL.rm?'rm':'');
  tx.innerHTML='<div class="ttxd a"></div><div class="ttxd b"></div><div class="ttxs"></div>';
  if(h1&&!TTL.rm){try{const k=h1.getBoundingClientRect(),c=h1.cloneNode(true);c.className='ttxl';c.style.left=k.left+'px';c.style.top=k.top+'px';c.style.width=k.width+'px';tx.appendChild(c)}catch(e){}}
  const cv=ttEl('canvas');tx.appendChild(cv);document.body.appendChild(tx);
  // 弾け飛ぶ玉とコイン(扉が開く瞬間に、つなぎ目から)
  const W=Math.ceil((window.innerWidth||360)/3),H=Math.ceil((window.innerHeight||640)/3);cv.width=W;cv.height=H;
  const x=cv.getContext&&cv.getContext('2d'),B=[];
  if(!TTL.rm)for(let i=0;i<70;i++)B.push({x:W/2+(Math.random()-.5)*W*.9,y:H/2,vx:(Math.random()-.5)*90,vy:(Math.random()-.5)*150-30,c:i%4?0:1});
  let t0=0,lt=0;
  const fr=ts=>{if(!t0)t0=lt=ts;const t=(ts-t0)/1000,dt=Math.min(.05,(ts-lt)/1000);lt=ts;
    if(x){x.clearRect(0,0,W,H);if(t>.3)for(const b of B){b.vy+=160*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;const bx=Math.round(b.x)-1,by=Math.round(b.y)-1;
      if(b.c){x.fillStyle='#b88a10';x.fillRect(bx,by,3,3);x.fillStyle='#ffd400';x.fillRect(bx,by,2,3)}else{x.fillStyle='#7d84a6';x.fillRect(bx,by,3,3);x.fillStyle='#e6eaf8';x.fillRect(bx,by,2,2);x.fillStyle='#fff';x.fillRect(bx,by,1,1)}}}
    if(t<1.5)requestAnimationFrame(fr)};
  try{requestAnimationFrame(fr)}catch(e){}
  setTimeout(()=>{try{tx.classList.add('op')}catch(e){}},TTL.rm?20:300);
  setTimeout(()=>{try{tx.remove()}catch(e){}},1500);
}
try{ttInit()}catch(e){}
