/* ---------- ui: 筐体まわり (画面フィット/強化シート/ハンドル/電飾tick/タイトル演出) ---------- */
(function(){
const DW=384,DH=786;
const on=(id,ev,fn)=>{const e=$(id);if(e&&e.addEventListener)e.addEventListener(ev,fn)};
/* --- 画面フィット: 設計サイズ(384x786)を安全領域内に収まるよう拡縮 --- */
function fit(){try{const w=window.innerWidth,h=window.innerHeight;if(!w||!h)return;let t=0,b=0,l=0,r=0;
if(typeof getComputedStyle=='function'){const cs=getComputedStyle($('sa'));t=parseFloat(cs.paddingTop)||0;b=parseFloat(cs.paddingBottom)||0;l=parseFloat(cs.paddingLeft)||0;r=parseFloat(cs.paddingRight)||0}
let k=Math.min((w-l-r)/DW,(h-t-b)/DH);if(!(k>0))return;k=Math.min(k,2);if(k>.97&&k<1.03)k=1;
$('scl').style.transform='scale('+k.toFixed(4)+')'}catch(e){}}
if(window.addEventListener){window.addEventListener('resize',fit);window.addEventListener('orientationchange',fit);if(window.visualViewport&&window.visualViewport.addEventListener)window.visualViewport.addEventListener('resize',fit)}
fit();setTimeout(fit,50);
/* --- 小アイコン --- */
UX.icons();UX.putIcon('ubi','up');UX.putIcon('cfi','gear');UX.putIcon('mui','note');
/* --- 強化シート --- */
function sheet(v){const a=$('app');if(a&&a.classList)a.classList[v?'add':'remove']('upo')}
let so=false;on('ubt','click',()=>{so=!so;sheet(so)});on('shx','click',()=>{so=false;sheet(false)});
/* --- ハンドル: タップで玉を1発追加(長押しで連射) --- */
let hAng=0,hFast=0,hTm=0,hFrame=-1;
function fireBall(){if(typeof run=='undefined'||!run||balls.length>90)return;balls.push(bk(332+Math.random()*10,14,-(1+Math.random()*3.2),0,1));hFast=6;try{if(AC&&typeof tone=='function')tone(900,AC.currentTime,.04,'square',.02,1300)}catch(e){}}
function hStop(){if(hTm){clearInterval(hTm);hTm=0}}
on('hd','pointerdown',e=>{try{e.preventDefault&&e.preventDefault()}catch(x){}fireBall();hStop();hTm=setInterval(fireBall,170)});
['pointerup','pointercancel','pointerleave'].forEach(n=>on('hd',n,hStop));
function hDraw(){const f=((Math.floor(hAng)%12)+12)%12;if(f===hFrame)return;hFrame=f;const c=$('hdc');if(!c||!c.getContext)return;const x=c.getContext('2d');x.clearRect(0,0,28,28);x.drawImage(UX.HF[f],0,0)}
/* --- 電飾tick(80ms): クラス切替/ハンドル回転/7の光沢/リーチ枠 --- */
let lr=-1,lf=-1,lreach=-1,gl=0,tt=0;
function tick(){try{
const rush=G.rush>0?1:0,fev=G.fv>0?1:0,s=(typeof sp!=='undefined'&&sp&&sp.rs)?1:0;
if(rush!==lr||fev!==lf){lr=rush;lf=fev;const a=$('app').classList;a[rush?'add':'remove']('rush');a[fev&&!rush?'add':'remove']('fev')}
if(s!==lreach){lreach=s;$('slot').classList[s?'add':'remove']('reach')}
hAng+=hFast>0?1.5:(rush?.7:.12);if(hFast>0)hFast--;hDraw();
if(!UX.rm){gl=(gl+1)%44;UX.glint(gl<30?gl-4:-1)}
if(titleOn())title(tt+=.08)}catch(e){}}
/* --- タイトル: 3リールが回って 7-7-7 で止まる + 光沢 --- */
const tcv=$('tc');let tOn=true;
function titleOn(){if(!tOn)return false;if($('ov').style.display==='none'){tOn=false;return false}return true}
function title(t){if(!tcv||!tcv.getContext)return;const x=tcv.getContext('2d');x.fillStyle='#0a0620';x.fillRect(0,0,104,24);
const cyc=t%7,stops=[1.6,2.2,2.8];
for(let i=0;i<3;i++){const ox=4+i*24,oy=4;x.fillStyle='#000';x.fillRect(ox-2,oy-2,20,20);x.fillStyle=i==2&&cyc>2.8&&cyc<4.4&&Math.floor(cyc*8)%2?'#ff2d7a':'#b8bce0';x.fillRect(ox-1,oy-1,18,18);
if(cyc>=stops[i]||UX.rm)UX.drawReel(x,7,0,0,ox,oy,cyc>3?Math.floor((cyc-3)*18)%40-4:-1);else UX.drawReel(x,Math.floor(t*14+i*3)%10,1,t*14+i*3,ox,oy,-1)}
const hf=Math.floor(t*(cyc<2.8?10:2))%12;x.fillStyle='#0a0620';x.fillRect(72,0,32,24);x.drawImage(UX.HF[hf],74,-2,28,28)}
setInterval(tick,80);
on('go','click',()=>{tOn=false;fit()});
})();
