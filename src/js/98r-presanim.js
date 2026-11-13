/* ---------- 転生の演出 (fx) ----------
   作り手の指摘「転生するボタンを押したら間が無く即開始」「静止画みたいでワクワクしない」→ 確認画面の「転生する!」で、約3.6秒のアニメーションを流してから転生する。
   キャンバス(3px=1ドット)に毎フレーム描く(CSS アニメーションに頼らない=端末の設定で止まらない):
   ① 0〜1.7秒 暗転して、魂の粒が画面の外からうずを巻いて中央の光の玉へ吸い込まれる。英雄3人が白い光になって昇っていく。魂の数がカウントアップ(音も上がっていく)
   ② 1.7秒   光の玉がはじけて画面いっぱいに広がる(1回だけ。点滅はしない)。この瞬間に presDo
   ③ 〜3.6秒  光が引いて新しい周回の画面が見える。「転生!!」がドンと落ちてはずみ、光の粒が四方に飛ぶ。衝撃の輪が2つ広がる
   設定「演出の動き: ひかえめ」(98v)では暗転と文字だけ。テスト/sim(harness の PACHI_NOPAUSE)では待たずに転生する。
   94-prestige の presAsk のボタンが presAnim を呼ぶ(1行フック)。presDo を直接呼ぶ所(自動テストなど)は今までどおり即時。 */
const PRA={on:0,t0:0,gn:0,done:0,P:[],S:[],raf:0,st:1};
const PRT=[1.7,3.6];
const praE=(()=>{try{const e=fxEl('div','prx','','<canvas id="prxc"></canvas><div id="prxt"><small></small><b></b></div><div id="prxk"><b>転生!!</b><small></small></div>');return e}catch(e){return null}})();
function praNow(){try{return performance.now()/1000}catch(e){return Date.now()/1000}}
function presAnim(){
  let off=false;try{off=!!window.PACHI_NOPAUSE}catch(e){}
  if(off||!praE||PRA.on)return presDo();
  if(soulGain(G.stage)<1)return presDo();
  let gn=0;try{gn=presGainShow(G.stage)}catch(e){}
  try{fxClose()}catch(e){}
  PRA.on=1;PRA.t0=praNow();PRA.gn=gn;PRA.done=0;PRA.P=[];PRA.S=[];PRA.low=typeof moLow==='function'&&moLow();
  for(let i=0;i<90;i++)PRA.P.push({a:Math.random()*6.283,r:.75+Math.random()*.5,d:Math.random()*1.15,w:1.6+Math.random()*1.6,c:i%4});
  try{document.body.classList.add('pra')}catch(e){}
  praE.className='on';try{$('prxk').className='';$('prxt').style.opacity=1}catch(e){}
  try{if(typeof sOK==='function'&&sOK()){const t=sNow();for(let i=0;i<14;i++)tone(196*Math.pow(1.1,i),t+i*.115,.13,'triangle',.035);tone(55,t,1.7,'sawtooth',.03,165);
    tone(1568,t+PRT[0],.5,'square',.05);tone(2093,t+PRT[0]+.08,.6,'square',.045);tone(65,t+PRT[0],.9,'sawtooth',.07,33);[523,659,784,1047].forEach((q,i)=>tone(q,t+PRT[0]+.35+i*.09,.3,'square',.04))}}catch(e){}
  /* 転生そのものは、描画が止まっていても(タブが裏など)必ず行う */
  setTimeout(()=>{praDo()},PRT[0]*1000);setTimeout(()=>{praEnd()},PRT[1]*1000+80);
  praFrame()}
function praDo(){if(PRA.done||!PRA.on)return;PRA.done=1;try{presDo()}catch(e){}try{PRA.st=G.stage}catch(e){}
  try{$('prxt').style.opacity=0;$('prxk').querySelector('small').textContent='魂 +'+fmt(PRA.gn)+' / STAGE '+PRA.st+' から 新しい旅へ';$('prxk').className='on'}catch(e){}
  for(let i=0;i<70;i++){const a=Math.random()*6.283,v=.25+Math.random()*.9;PRA.S.push({a,v,c:i%4,l:.7+Math.random()*.9})}}
function praEnd(){if(!PRA.on)return;PRA.on=0;try{document.body.classList.remove('pra')}catch(e){}try{praE.className='';$('prxk').className=''}catch(e){}try{cancelAnimationFrame(PRA.raf)}catch(e){}}
function praFrame(){if(!PRA.on)return;try{PRA.raf=requestAnimationFrame(praFrame)}catch(e){return}
  const t=praNow()-PRA.t0;try{praDraw(t)}catch(e){}}
function praDraw(t){const c=$('prxc');if(!c)return;const W=Math.max(60,Math.ceil((praE.clientWidth||390)/3)),H=Math.max(100,Math.ceil((praE.clientHeight||844)/3));
  if(c.width!==W||c.height!==H){c.width=W;c.height=H}const x=c.getContext('2d');if(!x)return;x.imageSmoothingEnabled=false;
  const cx=W/2,cy=H*.42,R=Math.hypot(W,H)/2,A=PRT[0],COL=['#c8b8ff','#7ff3ff','#ffd24d','#ffffff'],low=PRA.low;
  x.clearRect(0,0,W,H);
  if(t<A){const k=t/A,e=k*k;
    x.fillStyle='rgba(8,4,30,'+Math.min(.93,t*4).toFixed(2)+')';x.fillRect(0,0,W,H);
    if(!low){
      // うずを巻く光の筋(背景)
      for(let i=0;i<6;i++){const a=i*1.047+t*(1.2+e*5);x.fillStyle='rgba(122,77,255,'+(.10+.12*k).toFixed(2)+')';for(let r=8;r<R;r+=3){const aa=a+r*.045;x.fillRect(Math.round(cx+Math.cos(aa)*r),Math.round(cy+Math.sin(aa)*r*.9),2,2)}}
      // 魂の粒: 外から中央へ、回りながら吸い込まれる(尾を引く)
      for(const p of PRA.P){const q=(t-p.d)/(A-p.d-.05);if(q<=0||q>=1)continue;const rr=R*p.r*Math.pow(1-q,1.7);
        for(let s=0;s<4;s++){const qa=p.a+p.w*q*q*4-s*.07,r2=rr+s*3;x.globalAlpha=(1-s*.24)*Math.min(1,q*5);x.fillStyle=COL[p.c];const sz=s?1:2;x.fillRect(Math.round(cx+Math.cos(qa)*r2),Math.round(cy+Math.sin(qa)*r2*.9),sz,sz)}}
      x.globalAlpha=1;
      // 英雄が光になって昇る
      for(let i=0;i<3;i++){const s=typeof SPR!=='undefined'&&SPR['h'+i];if(!s)continue;const hk=Math.max(0,(t-.25-i*.12)/(A-.4)),hx=cx+(i-1)*26*(1-hk*hk)-16,hy=H*.72-(H*.72-cy)*hk*hk-16;
        if(hk<1){x.globalAlpha=1-hk*.5;x.drawImage(s,Math.round(hx),Math.round(hy));if(typeof spw==='function'){x.globalAlpha=Math.min(1,hk*1.6);x.drawImage(spw('h'+i),Math.round(hx),Math.round(hy))}x.globalAlpha=1}}
      // 中央の光の玉(脈を打ちながら育つ)
      const or=4+e*20+Math.sin(t*22)*1.5*k;for(let r=or+8;r>0;r-=2){x.fillStyle=r>or?'rgba(200,184,255,.18)':r>or*.55?'#c8b8ff':'#ffffff';x.beginPath();x.arc(cx,cy,r,0,6.283);x.fill()}
      for(let i=0;i<8;i++){const a=i*.785+t*3,l=or+6+Math.sin(t*14+i)*4+e*14;x.fillStyle='#fff';x.fillRect(Math.round(cx+Math.cos(a)*l),Math.round(cy+Math.sin(a)*l),2,2)}}
    try{const n=Math.floor(PRA.gn*Math.min(1,e*1.15)),tx=$('prxt');tx.querySelector('small').textContent='魂が 集まっていく…';tx.querySelector('b').textContent='魂 +'+fmt(n);tx.style.transform='scale('+(1+.06*Math.sin(t*20)*k).toFixed(3)+')'}catch(e2){}
  }else{const u=t-A,D=PRT[1]-A,k=Math.min(1,u/D);
    // 光がはじけて広がり(0.25秒)、そのあと引いていく
    const fill=u<.25?u/.25:Math.max(0,1-(u-.25)/.9);
    if(low){x.fillStyle='rgba(8,4,30,'+(.9*(1-k)).toFixed(2)+')';x.fillRect(0,0,W,H)}
    else{x.fillStyle='rgba(8,4,30,'+Math.max(0,.9-u*4).toFixed(2)+')';x.fillRect(0,0,W,H);
      x.fillStyle='rgba(240,232,255,'+(fill*.96).toFixed(2)+')';if(u<.25){x.beginPath();x.arc(cx,cy,24+R*1.1*fill,0,6.283);x.fill()}else x.fillRect(0,0,W,H);
      // 衝撃の輪
      for(let i=0;i<2;i++){const rk=(u-.05-i*.22)/.9;if(rk>0&&rk<1){x.strokeStyle=i?'#7ff3ff':'#ffd24d';x.globalAlpha=1-rk;x.lineWidth=3;x.beginPath();x.arc(cx,cy,10+R*rk,0,6.283);x.stroke();x.globalAlpha=1}}
      // 四方に飛ぶ光の粒
      for(const s of PRA.S){const q=u/s.l;if(q>=1)continue;const r=R*s.v*(1-Math.pow(1-q,2.2));x.globalAlpha=1-q;x.fillStyle=u<.5?'#7a4dff':COL[s.c];x.fillRect(Math.round(cx+Math.cos(s.a)*r),Math.round(cy+Math.sin(s.a)*r+q*q*18),2,2)}
      x.globalAlpha=1}
    // 「転生!!」: 上から落ちて はずむ → 最後に消える
    try{const e=$('prxk'),b=Math.min(1,u/.42),bo=b<1?1-Math.pow(1-b,3):1,sc=low?1:(u<.42?2.4-1.4*bo:1+.12*Math.exp(-(u-.42)*7)*Math.cos((u-.42)*26)),y=low?0:-(1-bo)*120;
      e.style.transform='translateY('+y.toFixed(1)+'px) scale('+sc.toFixed(3)+')';e.style.opacity=(u>D-.45?Math.max(0,(D-u)/.45):Math.min(1,u*8)).toFixed(2)}catch(e2){}
    if(!low&&u<.35){try{praE.style.transform='translate('+Math.round((Math.random()-.5)*10*(1-u/.35))+'px,'+Math.round((Math.random()-.5)*10*(1-u/.35))+'px)'}catch(e2){}}else{try{praE.style.transform=''}catch(e2){}}}}
