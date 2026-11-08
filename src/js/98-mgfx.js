/* ---------- ミニゲームの見た目強化 (fx) ----------
   ルール・報酬・自動決着は 85-pachifx(BONUS STOP) / 95-minigames(宝箱くじ・コインラッシュ) のまま。
   それぞれの描画の「後」に同じキャンバスへ描き直すだけ(updMG をラップ / FU の後ろに追加)。 */
const MGX={g:{}};
function mgTxt(c,t,x,y,px,fill){if(typeof thickTxt==='function')thickTxt(c,t,x,y,px,fill,{d:px>=16?3:2,lw:px>=16?5:4});else{c.font=px+'px '+FN;c.lineWidth=4;c.strokeStyle='#000';c.strokeText(t,x,y);c.fillStyle=fill;c.fillText(t,x,y)}}
function mgFl(){return typeof UX!=='undefined'&&UX.S?UX.S.fl:2}
function mgHue(t,o){return Math.floor(t*(mgFl()>0?220:50)+(o||0))%360}

/* --- BONUS STOP (240x60): ゾーンは本体と同じ判定幅(x10: 中央±6% / x4: ±20% / 他 x1.5) --- */
function mgStopDraw(){const M=MG;if(!M)return;const c=mgc,t=T;
  c.imageSmoothingEnabled=false;c.fillStyle='#0d0826';c.fillRect(0,0,240,60);
  c.fillStyle='#1c1248';for(let y=2;y<60;y+=4)for(let x=(y>>2)%2*2;x<240;x+=4)c.fillRect(x,y,1,1);
  // ゾーン
  c.fillStyle='#2a1a5a';c.fillRect(0,12,72,36);c.fillRect(168,12,72,36);
  c.fillStyle='#17a673';c.fillRect(72,12,96,36);c.fillStyle='#3fe0a0';c.fillRect(72,12,96,4);c.fillStyle='#0c6a48';c.fillRect(72,44,96,4);
  c.fillStyle='hsl('+mgHue(t)+',100%,58%)';c.fillRect(106,12,28,36);c.fillStyle='rgba(255,255,255,.55)';c.fillRect(106,12,28,4);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(106,44,28,4);
  c.fillStyle='#000';c.fillRect(0,10,240,2);c.fillRect(0,48,240,2);c.fillRect(71,12,1,36);c.fillRect(168,12,1,36);c.fillRect(105,12,1,36);c.fillRect(134,12,1,36);
  // 目盛り
  c.fillStyle='#5a4a9a';for(let x=0;x<240;x+=12)c.fillRect(x,50,1,x%60==0?6:3);
  c.textAlign='center';mgTxt(c,'x1.5',36,36,11,'#b8a8ff');mgTxt(c,'x1.5',204,36,11,'#b8a8ff');mgTxt(c,'x4',89,36,13,'#fff');mgTxt(c,'x4',151,36,13,'#fff');mgTxt(c,'10',120,36,13,'#fff');
  // 上の電飾
  for(let i=0;i<24;i++){const on=(i+Math.floor(t*(M.s?14:8)))%3==0;c.fillStyle=on?(i%2?'#fff':'#ff2d7a'):'#3a2a70';c.fillRect(i*10+3,2,4,4)}
  // 針(残像つき)
  const x=Math.round(M.x*234)+3;M.tr=M.tr||[];if(!M.s){M.tr.push(x);if(M.tr.length>6)M.tr.shift()}
  for(let i=0;i<M.tr.length;i++){c.globalAlpha=(i+1)/M.tr.length*.35;c.fillStyle='#fff';c.fillRect(M.tr[i]-1,12,3,36)}c.globalAlpha=1;
  c.fillStyle='#000';c.fillRect(x-3,8,7,44);c.fillStyle='#fff';c.fillRect(x-2,9,5,42);c.fillStyle='#ff2d7a';c.fillRect(x-1,9,3,42);
  c.fillStyle='#fff';c.beginPath();c.moveTo(x-6,4);c.lineTo(x+7,4);c.lineTo(x+.5,11);c.closePath();c.fill();
  // 止めた後: 当たったゾーンを強調 + STOP!
  if(M.s){const d=Math.abs(M.x-.5),z=d<.06?[106,28]:d<.2?(M.x<.5?[72,34]:[134,34]):(M.x<.5?[0,72]:[168,72]);
    c.globalAlpha=.25+.2*Math.sin(t*6);c.fillStyle='#fff';c.fillRect(z[0],12,z[1],36);c.globalAlpha=1;
    const s=Math.max(1,1.8-M.t*5);c.save();c.translate(120,32);c.scale(s,s);mgTxt(c,d<.06?'PERFECT!!':'STOP!',0,6,d<.06?20:18,d<.06?'hsl('+mgHue(t,90)+',100%,64%)':'#ffd400');c.restore()}}
{const _m=updMG;updMG=function(dt){const r=_m.apply(this,arguments);try{if(MG)mgStopDraw()}catch(e){}return r}}

/* --- 宝箱くじ / コインラッシュ (240x90) --- */
function mgGrad(c,k,mk){return MGX.g[k]||(MGX.g[k]=mk(c))}
function mgChest(m,c,t){
  c.fillStyle=mgGrad(c,'ch',x=>{const g=x.createRadialGradient(120,30,4,120,40,140);g.addColorStop(0,'#3a2a8a');g.addColorStop(1,'#0b0624');return g});c.fillRect(0,0,240,90);
  for(let i=0;i<3;i++){const cx=45+i*75,pk=m.s&&i==m.pk,dim=m.s&&!pk;
    // 当たり箱の後ろに回転光線
    if(pk){c.save();c.translate(cx,50);c.rotate(t*1.5);for(let k=0;k<10;k++){c.rotate(TAU/10);c.fillStyle='hsla('+mgHue(t,k*36)+',100%,60%,.35)';c.beginPath();c.moveTo(0,0);c.lineTo(60,-8);c.lineTo(60,8);c.closePath();c.fill()}c.restore()}
    // 台座
    c.fillStyle='#000';c.fillRect(cx-26,79,52,8);c.fillStyle=dim?'#3a2a60':'#8a6a20';c.fillRect(cx-25,80,50,3);c.fillStyle=dim?'#241a40':'#5a4410';c.fillRect(cx-25,83,50,3);
    // 箱
    const by=24+(m.s?(pk?-4-Math.max(0,.3-m.t)*20:0):Math.round(Math.sin(t*4+i*1.3)*2));
    c.globalAlpha=dim?.4:1;c.drawImage(SPR[m.s?'fchest2':'fchest'],cx-28,by,56,56);c.globalAlpha=1;
    c.textAlign='center';
    if(!m.s){const q=Math.sin(t*5+i)*1.5;mgTxt(c,'?',cx,20+q,18,'hsl('+mgHue(t,i*120)+',100%,66%)')}
    else{const x=m.ch[i],big=x>=12;mgTxt(c,'x'+x,cx,20,pk?(big?22:18):13,pk?(big?'hsl('+mgHue(t)+',100%,64%)':'#ffd400'):'#8a80b0')}}}
function mgCoin(m,c,t){
  c.fillStyle=mgGrad(c,'co',x=>{const g=x.createLinearGradient(0,0,0,90);g.addColorStop(0,'#1a0f4a');g.addColorStop(1,'#3a1a10');return g});c.fillRect(0,0,240,90);
  c.fillStyle='rgba(255,212,0,.08)';for(let i=0;i<6;i++)c.fillRect(i*44+((t*30)%44),0,10,90);
  for(const k of m.co)c.drawImage(SPR.fcoin,k.x,k.y,24,24);
  c.textAlign='center';const n=Math.min(m.n,80);mgTxt(c,n+'枚',120,48,n>=40?30:26,n>=40?'hsl('+mgHue(t)+',100%,64%)':'#ffd400');
  if(!m.s&&m.t<5&&Math.floor(t*3)%2==0)mgTxt(c,m.hum?'連打!!':'TAP!!',120,68,13,'#fff');
  // タイマー(10区切り)
  const p=m.s?1:Math.min(1,m.t/5);c.fillStyle='#000';c.fillRect(8,76,224,10);
  for(let i=0;i<10;i++){const on=(i+1)/10>p;c.fillStyle=on?(i<3?'#ff2d55':i<6?'#ffd400':'#3fe0a0'):'#2a2050';c.fillRect(10+i*22,78,20,6)}}
FU.push(dt=>{try{const m=MG2;if(!m)return;const c=mg2c;c.imageSmoothingEnabled=false;if(m.ty=='chest')mgChest(m,c,T);else mgCoin(m,c,T)}catch(e){}});
