/* ---------- カットイン用の等身イラスト (fx) ----------
   戦闘画面のデフォルメ(12x12)とは別に、カットインの時だけ使う 64x72 の胸像を3人分コードで描く(画像ファイルなし・オリジナル)。
   低解像度に図形で描いてから、半透明の縁を2値化し1pxの黒い輪郭を足して「ドット絵」に揃える。
   PORT(i) で取得(初回に生成してキャッシュ)。生成に失敗する環境では null を返し、呼び出し側は従来の SPR にフォールバックする。 */
const PORTC=[];
const PORTD=[
  // 0: 剣士(赤髪ツンツン/銀の肩当て/赤マフラー)
  {skin:'#ffd2a8',skinS:'#e8a878',hair:'#e8402a',hairS:'#9a1e14',hairH:'#ff8a5a',iris:'#ffb020',cloth:'#5a6aa8',clothS:'#36407a',acc:'#e83040',metal:'#d8e0f4',metalS:'#7880a8',k:0},
  // 1: 魔法使い(紫のとんがり帽子/銀の長髪/青いローブ)
  {skin:'#ffd8b8',skinS:'#e8b08a',hair:'#e0e4f8',hairS:'#9aa0c8',hairH:'#ffffff',iris:'#b070ff',cloth:'#3a58c8',clothS:'#22348a',acc:'#ffd400',hat:'#7a3cc8',hatS:'#4a1c88',k:1},
  // 2: 弓使い(緑のフード/茶髪/矢筒)
  {skin:'#ffd0a0',skinS:'#e0a070',hair:'#8a5a2b',hairS:'#5a3510',hairH:'#c08a50',iris:'#40d070',cloth:'#2f9a48',clothS:'#1c6a30',acc:'#8a5a2b',hood:'#37b058',hoodS:'#1c6a30',k:2}];
function portPoly(c,pts,col){c.fillStyle=col;c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.closePath();c.fill()}
function portEll(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill()}
function portBuild(i){const D=PORTD[i],cv=document.createElement('canvas');cv.width=64;cv.height=72;const c=cv.getContext('2d');if(!c||!c.ellipse)return null;
  // 後ろ髪/帽子・フードの奥
  if(D.k==0)portPoly(c,[14,30,12,18,18,10,16,2,26,8,32,0,38,7,48,2,46,10,53,16,50,30],D.hairS);
  if(D.k==1){portPoly(c,[15,20,49,20,52,58,12,58],D.hairS);portPoly(c,[17,22,47,22,49,54,15,54],D.hair)}
  if(D.k==2){portEll(c,32,26,19,21,D.hoodS);portPoly(c,[13,30,51,30,56,60,8,60],D.hoodS)}
  // 胴体
  portPoly(c,[4,72,8,60,20,53,44,53,56,60,60,72],D.cloth);portPoly(c,[40,54,44,53,56,60,60,72,46,72],D.clothS);
  if(D.k==0){portEll(c,12,61,10,7,D.metal);portEll(c,52,61,10,7,D.metal);portEll(c,14,63,7,4,D.metalS);portEll(c,54,63,7,4,D.metalS);portPoly(c,[22,49,42,49,44,56,20,56],D.acc);portPoly(c,[38,55,44,55,46,68,40,66],D.acc)}
  if(D.k==1){portPoly(c,[24,53,32,64,40,53,37,53,32,59,27,53],D.acc);portEll(c,58,58,4,4,'#9ff');portEll(c,58,58,2,2,'#fff')}
  if(D.k==2){portPoly(c,[18,54,22,52,48,70,44,72],D.acc);for(let k=0;k<3;k++){portPoly(c,[50+k*3,56,52+k*3,56,54+k*3,44,52+k*3,44],'#e8e0c0');portPoly(c,[51+k*3,44,55+k*3,40,53+k*3,44],'#ff5a5a')}}
  // 首・頭
  c.fillStyle=D.skinS;c.fillRect(27,43,10,11);
  portEll(c,32,28,13,15,D.skin);portPoly(c,[20,32,32,47,44,32],D.skin);portPoly(c,[40,30,45,30,33,47,32,47],D.skinS);
  // 目(つり眉・強い目)
  for(const [ex,dir] of [[23,1],[35,-1]]){c.fillStyle='#fff';c.fillRect(ex,30,6,4);c.fillStyle=D.iris;c.fillRect(dir>0?ex+3:ex,30,3,4);c.fillStyle='#14101f';c.fillRect(dir>0?ex+4:ex+1,31,1,2);c.fillRect(ex-1,29,8,1);c.fillStyle='#fff';c.fillRect(dir>0?ex+3:ex,30,1,1)}
  c.fillStyle='#14101f';portPoly(c,[21,24,29,26,29,28,21,26],'#3a1a10');portPoly(c,[43,24,35,26,35,28,43,26],'#3a1a10');
  // 鼻・口(叫ぶ)
  c.fillStyle=D.skinS;c.fillRect(32,35,2,2);portPoly(c,[27,40,37,40,36,44,28,44],'#8a1a20');c.fillStyle='#fff';c.fillRect(28,40,8,1);c.fillStyle='#ff6a7a';c.fillRect(30,43,4,1);
  // 前髪/帽子/フード
  if(D.k==0){portPoly(c,[17,28,18,14,22,20,24,10,28,18,31,8,34,17,38,9,40,18,44,12,46,20,47,28,44,22,40,26,36,21,32,26,28,21,24,26,20,22],D.hair);portPoly(c,[24,12,27,16,30,10],D.hairH);portPoly(c,[18,21,47,21,47,23,18,23],'#f4f4ff')}
  if(D.k==1){portPoly(c,[18,26,19,16,46,16,46,26,42,20,37,24,32,19,27,24,22,20],D.hair);portEll(c,32,16,26,5,D.hatS);portPoly(c,[14,15,50,15,44,6,56,0,36,2],D.hat);portPoly(c,[44,6,56,0,46,10],D.hatS);c.fillStyle=D.acc;c.fillRect(16,12,32,3)}
  if(D.k==2){portPoly(c,[18,27,20,17,44,17,46,27,41,21,36,25,31,20,26,25,22,21],D.hair);c.strokeStyle=D.hood;c.lineWidth=4;c.beginPath();c.ellipse(32,26,16,18,0,Math.PI*1.03,Math.PI*1.97);c.stroke()}
  // 2値化 + 輪郭
  try{const im=c.getImageData(0,0,64,72),d=im.data,W=64,H=72,op=new Uint8Array(W*H);
    for(let p=0;p<W*H;p++){if(d[p*4+3]>=110){op[p]=1;d[p*4+3]=255}else d[p*4+3]=0}
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;if(op[p])continue;if((x>0&&op[p-1])||(x<W-1&&op[p+1])||(y>0&&op[p-W])||(y<H-1&&op[p+W])){d[p*4]=20;d[p*4+1]=16;d[p*4+2]=31;d[p*4+3]=255}}
    c.putImageData(im,0,0)}catch(e){}
  return cv}
function PORT(i){if(PORTC[i]===undefined){try{PORTC[i]=portBuild(i)}catch(e){PORTC[i]=null}}return PORTC[i]}
