/* ---------- push: 「押せ!!」ボタン演出 ----------
   大当たり: カットイン → PUSH(巨大ドットボタン。タップ or 放置で自動) → キュイン連打+フラッシュ → ルーレット/JACKPOT
   ルーレット後半の DOUBLE UP? も小さなPUSHで見せる。DOM: #push #pkT #pkB(#pkC0 通常 / #pkC1 押下) .pkbar .pksub
   pushPrompt(cb,{small,jp,txt,ms}) : 押された(または ms 経過で自動)あと cb を呼ぶ。PUSH 中は RUSH の残り時間を減らさない。 */
let PUSH=null;
function pkDraw(cv,down){if(!cv||!cv.getContext)return;const N=55,c=cv.getContext('2d'),m=N/2-.5;c.clearRect(0,0,N,N);
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const dx=x-m,dy=y-m,r=Math.hypot(dx,dy);let col=null;
  if(r<=27){
   if(r>26)col='#000';
   else if(r>21){const k=(-dx-dy)/(r||1);col=k>.55?'#ffffff':k>.1?'#d8dcff':k>-.4?'#8a90c8':'#4a5090'}
   else if(r>19.5)col='#000';
   else{const hl=Math.hypot(x-(m-6),y-(m-7)),t=hl/22+(((x+y)&1)?.05:-.05);
    if(!down&&hl<4.2)col='#fff0f0';
    else if(t<.35)col=down?'#d01830':'#ff7a7a';
    else if(t<.62)col=down?'#a30f24':'#f0223c';
    else if(t<.85)col=down?'#7a0818':'#c40f2a';
    else col=down?'#520010':'#8a0018'}}
  if(col){c.fillStyle=col;c.fillRect(x,y,1,1)}}}
try{pkDraw($('pkC0'),0);pkDraw($('pkC1'),1)}catch(e){}
function pkSnd(){if(typeof AC==='undefined'||!AC||typeof tone!=='function')return;try{const t=AC.currentTime;[784,988,1175,1568].forEach((f,i)=>tone(f,t+i*.08,.12,'square',.05))}catch(e){}}
function pushPrompt(cb,o){o=o||{};const el=$('push');if(!el||PUSH){cb();return}
 const ms=o.ms||2400;PUSH={cb,done:0,small:!!o.small,tm:[]};
 el.className='';void el.offsetWidth;
 el.className='on go'+(o.small?' small':'')+(o.jp?' jp':'');
 if(el.style&&el.style.setProperty)el.style.setProperty('--pkms',ms+'ms');
 $('pkT').textContent=o.txt||(o.jp?'777 押せ!!':'押せ!!');
 pkSnd();
 for(let k=1;k*900<ms;k++)PUSH.tm.push(setTimeout(()=>{if(typeof beep==='function')beep(1568+k*120,.09,'square',.04)},k*900));
 PUSH.tm.push(setTimeout(()=>pushPress(1),ms))}
function pushPress(auto){const P0=PUSH;if(!P0||P0.done)return;P0.done=1;P0.tm.forEach(clearTimeout);
 const el=$('push');el.className+=' hit';$('pkT').textContent='GO!!';
 flash('#fff');shake();kyuin(P0.small?5:9,'#ffd400');
 setTimeout(()=>{if(PUSH!==P0)return;el.className='';PUSH=null;P0.cb()},P0.small?420:700)}
$('push').onpointerdown=()=>pushPress(0);
