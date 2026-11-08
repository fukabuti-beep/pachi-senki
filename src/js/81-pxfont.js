/* ---------- ドットフォント(5x7ビットマップ) + ダメージ数字/コンボ表示 ----------
   pxText(ctx,文字列,x,y(上端),倍率,上段色,下段色,'l'|'c'|'r') : 黒縁つき。グリフは色ごとにキャッシュ(drawImage)。 */
const PXG={};
(function(){('0:01110 10001 10011 10101 11001 10001 01110|1:00100 01100 00100 00100 00100 00100 01110|2:01110 10001 00001 00010 00100 01000 11111|3:11110 00001 00001 01110 00001 00001 11110|4:00010 00110 01010 10010 11111 00010 00010|5:11111 10000 11110 00001 00001 10001 01110|6:00110 01000 10000 11110 10001 10001 01110|7:11111 00001 00010 00100 01000 01000 01000|8:01110 10001 10001 01110 10001 10001 01110|9:01110 10001 10001 01111 00001 00010 01100|'
+'A:01110 10001 10001 11111 10001 10001 10001|B:11110 10001 10001 11110 10001 10001 11110|C:01110 10001 10000 10000 10000 10001 01110|D:11110 10001 10001 10001 10001 10001 11110|E:11111 10000 10000 11110 10000 10000 11111|F:11111 10000 10000 11110 10000 10000 10000|G:01110 10001 10000 10111 10001 10001 01111|H:10001 10001 10001 11111 10001 10001 10001|I:01110 00100 00100 00100 00100 00100 01110|J:00111 00010 00010 00010 00010 10010 01100|K:10001 10010 10100 11000 10100 10010 10001|L:10000 10000 10000 10000 10000 10000 11111|M:10001 11011 10101 10101 10001 10001 10001|N:10001 11001 10101 10011 10001 10001 10001|O:01110 10001 10001 10001 10001 10001 01110|P:11110 10001 10001 11110 10000 10000 10000|Q:01110 10001 10001 10001 10101 10010 01101|R:11110 10001 10001 11110 10100 10010 10001|S:01111 10000 10000 01110 00001 00001 11110|T:11111 00100 00100 00100 00100 00100 00100|U:10001 10001 10001 10001 10001 10001 01110|V:10001 10001 10001 10001 10001 01010 00100|W:10001 10001 10001 10101 10101 11011 10001|X:10001 10001 01010 00100 01010 10001 10001|Y:10001 10001 01010 00100 00100 00100 00100|Z:11111 00001 00010 00100 01000 10000 11111|'
+'.:00000 00000 00000 00000 00000 01100 01100|+:00000 00100 00100 11111 00100 00100 00000|x:00000 00000 10001 01010 00100 01010 10001|-:00000 00000 00000 11111 00000 00000 00000|!:00100 00100 00100 00100 00100 00000 00100|/:00001 00010 00010 00100 01000 01000 10000|?:01110 10001 00010 00100 00100 00000 00100|*:00100 00100 01110 11111 01110 01010 10001').split('|').forEach(s=>{PXG[s[0]]=s.slice(2).split(' ')});PXG['★']=PXG['*'];PXG[' ']=['00000','00000','00000','00000','00000','00000','00000']})();
const PXC={},PXS={};
function pxShade(c){if(PXS[c])return PXS[c];let r=0,g=0,b=0;if(c[0]=='#'&&c.length==7){r=parseInt(c.slice(1,3),16);g=parseInt(c.slice(3,5),16);b=parseInt(c.slice(5,7),16)}else if(c[0]=='#'&&c.length==4){r=parseInt(c[1]+c[1],16);g=parseInt(c[2]+c[2],16);b=parseInt(c[3]+c[3],16)}else return PXS[c]=c;return PXS[c]='rgb('+(r*.62|0)+','+(g*.55|0)+','+(b*.7|0)+')'}
function pxGlyph(ch,c1,c2,ol){const k=ch+c1+c2+ol,h=PXC[k];if(h)return h;const g=PXG[ch]||PXG['?'],cv=document.createElement('canvas');cv.width=7;cv.height=9;const x=cv.getContext('2d');
x.fillStyle=ol;for(let r=0;r<7;r++)for(let c=0;c<5;c++)if(g[r][c]=='1')for(let a=-1;a<2;a++)for(let b=-1;b<2;b++)x.fillRect(c+1+a,r+1+b,1,1);
for(let r=0;r<7;r++)for(let c=0;c<5;c++)if(g[r][c]=='1'){x.fillStyle=r<4?c1:c2;x.fillRect(c+1,r+1,1,1)}return PXC[k]=cv}
const pxW=(s,sc)=>(String(s).length*6-1)*sc;
function pxText(c,s,x,y,sc,c1,c2,al,ol){s=String(s);const w=pxW(s,sc),o=ol||'#000';x=Math.round(al=='c'?x-w/2:al=='r'?x-w:x);y=Math.round(y);for(let i=0;i<s.length;i++){const ch=s[i];if(ch==' ')continue;c.drawImage(pxGlyph(ch.toUpperCase(),c1,c2||pxShade(c1),o),x+i*6*sc-sc,y-sc,7*sc,9*sc)}}
/* ダメージ数字(F[]): 太いドット文字。会心('★'始まり)は金+大型+星バースト+CRITタグ。+n はコイン取得表示 */
const COINI=document.createElement('canvas');COINI.width=7;COINI.height=7;(function(){const x=COINI.getContext('2d');[['#000',0,0,7,7],['#b07800',1,0,5,7],['#b07800',0,1,7,5],['#ffd400',1,1,5,5],['#fff3a0',1,1,2,3],['#e6a800',4,3,1,3]].forEach(a=>{x.fillStyle=a[0];x.fillRect(a[1],a[2],a[3],a[4])})})();
function drawF(){const fs=F.length;for(let i=fs-1;i>=0;i--){const f=F[i];if(f.sx===undefined){f.sx=f.x;f.ph=Math.random()*6}f.t+=DT*1.25;f.y-=(f.t<.25?70:28)*DT;f.x=f.sx+Math.sin(f.t*7+f.ph)*(f.s[0]=='★'?0:2);
if(f.t>=1){F.splice(i,1);continue}const cr=f.s[0]=='★',gold=f.s[0]=='+',txt=cr?f.s.slice(1):f.s,pop=Math.max(0,1-f.t*7),base=cr?5:f.b?4:2,sc=Math.max(1,Math.round(base*(1+pop*.7)));
const a=Math.min(1,(1-f.t)*3.2);bc.globalAlpha=a;
if(cr&&f.t<.4){const q=f.t/.4;bc.fillStyle='#fff3a0';for(let k=0;k<8;k++){const an=k*.7854+.2,r0=10+q*26,r1=r0+8*(1-q);bc.fillRect(Math.round(f.x+Math.cos(an)*r0)-2,Math.round(f.y-10+Math.sin(an)*r0*.7)-2,4,4)}}
if(cr){pxText(bc,'CRIT',f.x,f.y-sc*9-2,2,'#fff','#ff9a2a','c');pxText(bc,txt,f.x,f.y-sc*3,sc,'#fff3a0','#ff8a00','c')}
else if(gold){bc.drawImage(COINI,Math.round(f.x+6-pxW(txt,sc)/2)-16,Math.round(f.y-sc*3+(7*sc-14)/2),14,14);pxText(bc,txt,f.x+6,f.y-sc*3,sc,'#ffe14d','#ff9a2a','c')}
else pxText(bc,txt,f.x,f.y-sc*3,sc,f.c,pxShade(f.c),'c')}
bc.globalAlpha=1}
/* コンボ表示: 数字はドット大文字、ティアで色/大きさ変化、増加時にポップ、残り時間ゲージ */
let cbLast=0,cbPop=0;
function drawCmb(t){if(cmb!=cbLast){if(cmb>cbLast)cbPop=1;cbLast=cmb}cbPop=Math.max(0,cbPop-DT*6);if(cmb<3)return;const tier=cmb>=50?3:cmb>=20?2:cmb>=10?1:0,sc=[3,4,4,5][tier]+(cbPop>.5?1:0),c1=['#ffe14d','#ffb03a','#ff6a9a','#fff'][tier],c2=['#ff9a2a','#ff5a1a','#c01060',(Math.floor(t*6)%2?'#ffd400':'#22e0ff')][tier],sx=tier>=2?Math.round((Math.random()-.5)*2):0;
let s2=sc;while(s2>2&&pxW(cmb,s2)>96)s2--;   // 桁が増えても戦闘画面の左 1/3 程度に収める(5桁で英雄/ボス名を覆っていた)
pxText(bc,cmb,6+sx,30,s2,c1,c2,'l');const w=pxW(cmb,s2);pxText(bc,'HIT',8+w+sx,30+s2*7-7*2,2,'#fff',c2,'l');
const bw=Math.round(Math.min(1,cmbT/1.6)*(w+30));bc.fillStyle='#000';bc.fillRect(5,30+s2*7+3,w+34,5);bc.fillStyle=c1;bc.fillRect(6,30+s2*7+4,bw,3)}

var PXRDY=1;if(typeof buildBg==="function")buildBg();
