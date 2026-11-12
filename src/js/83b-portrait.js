/* ---------- カットイン用の等身イラスト (fx) ----------
   戦闘画面のデフォルメ(12x12)とは別に、カットインの時だけ使う 64x72 の胸像を3人分コードで描く(画像ファイルなし・オリジナル)。
   4倍の解像度に図形で描いてから最近傍で縮小(色の境目をくっきり)→ 半透明の縁を2値化 → 1pxの黒い輪郭、で「ドット絵」に揃える。
   セル塗り(片側の濃い影)・細いつり目と光るハイライト・シャープなあごで「かっこよさ」重視。
   PORT(i) で取得(初回に生成してキャッシュ)。生成できない環境では null を返し、呼び出し側は従来の SPR にフォールバックする。 */
const PORTC=[];
const PORTD=[
  {skin:'#ffd8b4',skinS:'#d9946a',hair:'#ff4a2a',hairS:'#a8180e',hairD:'#5a0a08',hairH:'#ffb070',iris:'#ffc020',cloth:'#2a3060',clothS:'#161a3a',acc:'#e82838',accS:'#8a0c1c',metal:'#e8eeff',metalS:'#8890b8',k:0},
  {skin:'#ffdcc0',skinS:'#c89070',hair:'#eef0ff',hairS:'#9aa0d0',hairD:'#5a609a',hairH:'#ffffff',iris:'#d080ff',cloth:'#1c2a7a',clothS:'#0e1440',acc:'#ffd400',accS:'#b08000',hat:'#7a34d0',hatS:'#3e1480',k:1},
  {skin:'#ffd4a8',skinS:'#c88a5a',hair:'#9a6230',hairS:'#5a3510',hairD:'#2a1808',hairH:'#d09a60',iris:'#50ff90',cloth:'#1f7a3a',clothS:'#0f4a22',acc:'#7a4a1a',accS:'#4a2a08',hood:'#2fa854',hoodS:'#14602c',k:2},
  /* 3=槍使いツララ(完全版の 98yb が使う。絵のデータはここに置く=体験版では呼ばれないだけ) */
  {skin:'#ffdcc4',skinS:'#d09878',hair:'#8fd8ff',hairS:'#5aa8e0',hairD:'#3a78b8',hairH:'#e4f8ff',iris:'#4a80d0',cloth:'#e8f4ff',clothS:'#9ab8d8',acc:'#3a5a9a',accS:'#27407a',metal:'#f4fbff',metalS:'#9ab8d8',k:3}];
function portPoly(c,pts,col){c.fillStyle=col;c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.closePath();c.fill()}
function portEll(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill()}
function portFace(c,D,mask){
  // 頭(シャープなあご)+ セル影
  portEll(c,32,24,12.5,13,D.skin);portPoly(c,[19.5,23,21,34,26,42,32,46.5,38,42,43,34,44.5,23],D.skin);
  portPoly(c,[35,14,44.5,22,43,34,38,42,32,46.5,35,40,37.5,31,37,22],D.skinS);
  portPoly(c,[26,42,32,46.5,38,42,36,44,32,45,28,44],D.skinS);
  // 眉(太く鋭く)
  portPoly(c,[19.5,26,30,28.4,30,30,20,27.8],'#2a0e08');portPoly(c,[44.5,26,34,28.4,34,30,44,27.8],'#2a0e08');
  // 目(細いつり目)
  for(const s of [1,-1]){const cx=s>0?25.5:38.5,o=s>0?1:-1;
    portPoly(c,[cx-4*o,31.6,cx+3.5*o,30.6,cx+3.5*o,33.4,cx-3*o,33.4],'#fff');
    c.fillStyle=D.iris;c.fillRect(s>0?cx:cx-3,30.8,3,2.8);c.fillStyle='#14101f';c.fillRect(s>0?cx+1:cx-2,31.4,1.2,1.8);
    c.fillStyle='#fff';c.fillRect(s>0?cx+.2:cx-2.8,30.9,1,1);
    portPoly(c,[cx-5*o,31.2,cx+4.2*o,29.6,cx+4.4*o,30.9,cx-4.6*o,32.2],'#14101f');
    c.fillStyle='rgba(20,16,31,.9)';c.fillRect(Math.min(cx-3*o,cx+3*o),33.3,6,.7)}
  if(!mask){
    c.fillStyle=D.skinS;c.fillRect(33.2,33.5,1.2,3.6);
    portPoly(c,[27,40.4,37.4,39.4,35.6,42.6,28.8,42.8],'#5a0c14');c.fillStyle='#fff';c.fillRect(28.2,40.2,8.6,.9);c.fillRect(28.6,40.8,.9,1.1);c.fillRect(35.4,40.6,.9,1.1);}}
function portBuild(i){const D=PORTD[i],S=4,big=document.createElement('canvas');big.width=64*S;big.height=72*S;const c=big.getContext('2d');if(!c||!c.ellipse)return null;
  c.scale(S,S);c.translate(32,60);c.rotate(-.06);c.translate(-32,-60);
  // ---- 奥(後ろ髪/マント/フード) ----
  if(D.k==0)portPoly(c,[18,32,10,24,14,18,4,10,17,10,14,0,25,6,28,-4,34,5,42,-3,43,7,56,2,50,12,60,16,50,22,54,30,46,30],D.hairS);
  if(D.k==1){portPoly(c,[14,52,8,72,56,72,52,52,58,44,50,46,46,36,18,36,14,46,6,44],D.clothS);portPoly(c,[16,20,48,20,51,58,13,58],D.hairS);portPoly(c,[18,22,46,22,48,56,16,56],D.hair);for(let k=0;k<4;k++){c.fillStyle=D.hairD;c.fillRect(19+k*8,26,1,28)}}
  if(D.k==2){portEll(c,32,25,19,21,D.hoodS);portPoly(c,[12,32,52,32,58,62,6,62],D.hoodS)}
  if(D.k==3){portPoly(c,[13,16,51,16,58,72,6,72],D.hairS);portPoly(c,[16,18,48,18,53,68,11,68],D.hair);for(let k=0;k<5;k++){c.fillStyle=D.hairD;c.fillRect(15+k*8.5,32,1,34)}
    c.fillStyle=D.metalS;c.fillRect(55,2,2.4,70);portPoly(c,[56.2,-6,59.5,4,56.2,8,53,4],D.metal);portPoly(c,[56.2,-6,59.5,4,56.2,8],D.metalS)}
  // ---- 胴 ----
  portPoly(c,[2,72,6,60,20,53,44,53,58,60,62,72],D.cloth);portPoly(c,[34,53,44,53,58,60,62,72,40,72],D.clothS);
  if(D.k==0){portPoly(c,[2,60,10,52,22,55,20,66,6,68],D.metal);portPoly(c,[62,60,54,52,42,55,44,66,58,68],D.metalS);portPoly(c,[4,61,10,55,18,57,16,63,6,64],D.metalS);portPoly(c,[6,57,12,53,18,55,10,57],'#fff');
    portPoly(c,[22,58,42,58,40,70,24,70],D.metalS);portPoly(c,[29,60,35,60,32,66],D.acc);
    portPoly(c,[21,48,43,48,45,56,19,56],D.acc);portPoly(c,[34,52,45,52,46,56,36,56],D.accS);portPoly(c,[40,54,46,53,58,64,54,68,48,60],D.acc);portPoly(c,[50,60,58,64,54,68],D.accS)}
  if(D.k==1){portPoly(c,[16,56,22,44,28,52,32,60,36,52,42,44,48,56,42,62,32,66,22,62],D.cloth);portPoly(c,[18,54,22,46,27,53,22,58],D.acc);portPoly(c,[46,54,42,46,37,53,42,58],D.accS);
    portEll(c,32,60,3.4,3.4,D.acc);portEll(c,32,60,2.2,2.2,D.iris);c.fillStyle='#fff';c.fillRect(31,58.8,1,1)}
  if(D.k==2){portPoly(c,[16,55,20,53,50,72,44,72],D.acc);portPoly(c,[17,55,19,54,46,71,44,72],D.accS);
    for(let k=0;k<3;k++){portPoly(c,[49+k*3,58,51+k*3,58,53+k*3,44,51+k*3,44],'#e8e0c0');portPoly(c,[50+k*3,44,55+k*3,39,52.5+k*3,45],'#ff4a4a')}}
  if(D.k==3){portPoly(c,[2,60,10,52,22,55,20,66,6,68],D.metal);portPoly(c,[62,60,54,52,42,55,44,66,58,68],D.metalS);portPoly(c,[6,57,12,53,18,55,10,57],'#fff');
    portPoly(c,[22,56,42,56,40,70,24,70],D.clothS);portPoly(c,[28,58,36,58,32,66],D.acc);portEll(c,32,60,2,2,D.hair);c.fillStyle='#fff';c.fillRect(31.2,59,1,1)}
  // ---- 首・顔 ----
  c.fillStyle=D.skinS;c.fillRect(27,43,10,11);portPoly(c,[27,44,37,44,37,48,32,50,27,48],'#a86a4a');
  portFace(c,D,D.k==2);
  // ---- 前髪/帽子/フード ----
  if(D.k==0){portPoly(c,[18,30,17,16,21,22,22,9,27,19,30,7,33,18,37,8,40,19,44,11,45,22,47,30,43,23,40,27,36,21,32,27,28,21,24,27,21,23],D.hair);
    portPoly(c,[22,11,26,18,28,10],D.hairH);portPoly(c,[31,9,33,16,35,10],D.hairH);portPoly(c,[38,10,40,17,43,13],D.hairH);portPoly(c,[37,21,40,27,43,23,45,22,44,26],D.hairS);
    c.fillStyle='#b0502a';c.fillRect(39,36,4,.8);c.fillRect(40,35,.8,3)}
  if(D.k==1){portPoly(c,[18,27,19,17,46,17,46,27,42,21,37,25,32,19,27,25,22,21],D.hair);portPoly(c,[34,18,46,17,46,27,42,21,37,25],D.hairS);
    portEll(c,32,17,27,5.5,D.hatS);portPoly(c,[13,16,51,16,44,6,60,-2,34,1],D.hat);portPoly(c,[40,4,60,-2,46,10,44,16,36,16],D.hatS);c.fillStyle=D.acc;c.fillRect(15,12.5,34,3);c.fillStyle=D.accS;c.fillRect(36,12.5,13,3);
    c.fillStyle='rgba(20,8,40,.45)';c.fillRect(19,20,27,8)}
  if(D.k==2){portEll(c,32,18,14,8,D.hairS);portPoly(c,[18,28,19,14,45,14,46,28,41,22,36,26,31,21,26,26,22,22],D.hair);portPoly(c,[33,19,44,18,46,28,41,22,37,25],D.hairS);
    c.strokeStyle=D.hood;c.lineWidth=4.5;c.beginPath();c.ellipse(32,26,16.5,18.5,0,Math.PI*1.02,Math.PI*1.98);c.stroke();c.fillStyle='rgba(10,30,15,.35)';c.fillRect(18,19,28,6);
    portPoly(c,[19,35,45,35,44,46,38,50,26,50,20,46],D.hood);portPoly(c,[33,35,45,35,44,46,38,50,34,50],D.hoodS);c.fillStyle=D.hoodS;c.fillRect(21,39,22,.8);c.fillRect(22,43,20,.8)}
  if(D.k==3){portPoly(c,[17,31,17,15,23,10,41,10,47,15,47,31,44,22,40,28,36,21,32,28,28,21,24,28,20,22],D.hair);portPoly(c,[24,12,29,19,32,12],D.hairH);portPoly(c,[35,12,39,18,42,13],D.hairH);portPoly(c,[37,14,45,15,47,31,44,22,40,28],D.hairS);
    c.fillStyle=D.skin;c.fillRect(20,29.2,10.5,1.6);c.fillRect(33.5,29.2,10.5,1.6)}   /* 眠そうな目: 上まぶたを少しかぶせる */
  // ---- 縮小(最近傍)→ 2値化 → 輪郭 ----
  const cv=document.createElement('canvas');cv.width=64;cv.height=72;const o=cv.getContext('2d');o.imageSmoothingEnabled=false;o.drawImage(big,0,0,64,72);
  try{const im=o.getImageData(0,0,64,72),d=im.data,W=64,H=72,op=new Uint8Array(W*H);
    for(let p=0;p<W*H;p++){if(d[p*4+3]>=110){op[p]=1;d[p*4+3]=255}else d[p*4+3]=0}
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;if(op[p])continue;if((x>0&&op[p-1])||(x<W-1&&op[p+1])||(y>0&&op[p-W])||(y<H-1&&op[p+W])){d[p*4]=20;d[p*4+1]=16;d[p*4+2]=31;d[p*4+3]=255}}
    o.putImageData(im,0,0)}catch(e){}
  return cv}
function PORT(i){if(PORTC[i]===undefined){try{PORTC[i]=portBuild(i)}catch(e){PORTC[i]=null}}return PORTC[i]}
// カットイン用: 色付きシルエット(リムライト用)をキャッシュ
const PORTR={};
function PORTRim(i,col){const k=i+col;if(PORTR[k]!==undefined)return PORTR[k];let r=null;try{const P=PORT(i);if(P){r=document.createElement('canvas');r.width=64;r.height=72;const x=r.getContext('2d');x.drawImage(P,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,64,72)}}catch(e){r=null}return PORTR[k]=r}
/* ---------- 作り手提供のイラスト(src/img → build.js が PIMG に埋め込む) ----------
   読み込めたらカットインはこちらを優先。fx/fy = 画像内の顔の中心(0〜1)。テスト(ハーネス)では PIMG が無いので上のコード描画を使う。 */
const PIMGI={},PIMGF={hero0:[.39,.30],hero1:[.50,.43],hero2:[.37,.38],hero3:[.5,.28],trio:[.5,.43]};   // hero3=ツララ
try{if(typeof PIMG!=='undefined'&&typeof Image!=='undefined')for(const k in PIMG){const im=new Image();im.onload=()=>{PIMGI[k]=im};im.src=PIMG[k]}}catch(e){}
const PIMGR={};
function PIMGRim(k,col){const key=k+col;if(PIMGR[key]!==undefined)return PIMGR[key];let r=null;try{const im=PIMGI[k];if(im){r=document.createElement('canvas');r.width=im.width;r.height=im.height;const x=r.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,r.width,r.height)}}catch(e){r=null}return PIMGR[key]=r}
