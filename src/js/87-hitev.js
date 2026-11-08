/* ---------- 大当たり後のイベント分岐 (feature/fx) ----------
   bigHit → カットイン → hitEvent(jp)
     777        : 押せ!! → 激しめアニメ(7が3つ叩きつけ+光線+JACKPOT) → jackpot()
     確率 evP   : 押せ!! → 従来の全画面ルーレット。押した時に supP で「超倍率」を抽選(止まった後に x100/x300/x777 へ化ける)
     それ以外   : 戦闘画面の左上でミニルーレットが勝手に回る(スロットは止めない/画面を塞がない)
   HEV.force = 'jp' | 'roul' | 'mini' でテストから分岐を固定できる。 */
BAL.evP=.15;BAL.supP=.3;BAL.supG=.25;
const HEV={force:null,mq:[],mr:null,jr:null};
function hitBase(){return atk()*40*(1+G.combo*.5)}
function hitEvent(jp){const f=HEV.force,base=hitBase();
  if(f?f==='jp':jp){pushPrompt(()=>jpRush(),{jp:1,ms:2400});return}
  if(f?f==='roul':Math.random()<UPX.evP()){pushPrompt(()=>{startRoul(base);if(RL)RL.sup=Math.random()<UPX.supP()},{ms:2400});return}
  miniRoul(base);G.roul=0;startSpin()}

/* --- ミニルーレット(非ブロッキング) --- */
function miniRoul(base){if(HEV.mq.length>=3)HEV.mq.shift();HEV.mq.push(base);if(!HEV.mr)mrNext()}
function mrNext(){const base=HEV.mq.shift();if(base==null){HEV.mr=null;return}
  const w=WS.map(m=>({2:30,3:22,5:14,10:6,50:1}[m]*(m>=5?luck():1)));let r=Math.random()*w.reduce((a,b)=>a+b),k=0;while(k<w.length-1&&r>w[k]){r-=w[k];k++}
  const tg=-1.5708-(k+.2+Math.random()*.6)*SG;HEV.mr={a:0,a1:((tg%TAU)+TAU)%TAU+TAU*4,t:0,k,m:WS[k],base,ph:0,last:-1,kick:0}}
function mrUpd(dt){const M=HEV.mr;if(!M)return;M.t+=dt;M.kick*=.82;
  if(M.ph==0){const D=2.2,p=Math.min(1,M.t/D),e=1-Math.pow(1-p,3);M.a=M.a1*e;
    const idx=Math.floor((((-1.5708-M.a)%TAU)+TAU)%TAU/SG);if(idx!=M.last){M.last=idx;M.kick=.5;if(p>.55)try{if(sOK())tone(700+p*500,sNow(),.025,'square',.012)}catch(e){}}
    if(p>=1){M.ph=1;M.t=0;const m=M.m;hurt(M.base*m,'#ffd400',1,m>=5);G.gold+=Math.floor(G.stage*40*m*mul());burst(112,29,m>=10?40:12,'#ffd400');
      if(m>=10){banner('ROULETTE x'+m+'!!','#ffd400');kyuin(m>=50?8:5,'#ffd400');if(G.rush>0)G.rush=Math.min(15,G.rush+3);try{seRoulResult(m)}catch(e){}}
      else try{if(sOK()){const t=sNow();tone(1320,t,.08,'square',.025);tone(1760,t+.07,.12,'square',.025)}}catch(e){}}}
  else if(M.t>(M.m>=10?1.6:1.0))mrNext()}
function mrDraw(t){const M=HEV.mr;if(!M)return;const cx=112,cy=29,R=22,W=WCH||wBuild();
  const a=Math.min(1,M.ph==0?M.t*6:(M.m>=10?1.6:1)-M.t>.25?1:((M.m>=10?1.6:1)-M.t)*4);
  bc.save();bc.globalAlpha=Math.max(0,a);bc.imageSmoothingEnabled=true;
  bc.fillStyle='#000';bc.beginPath();bc.arc(cx,cy,R+4,0,TAU);bc.fill();bc.fillStyle='#c89a10';bc.beginPath();bc.arc(cx,cy,R+2.5,0,TAU);bc.fill();
  bc.save();bc.translate(cx,cy);bc.rotate(M.a);bc.drawImage(W.disc,-R,-R,R*2,R*2);bc.restore();
  bc.fillStyle='#000';bc.beginPath();bc.arc(cx,cy,5,0,TAU);bc.fill();bc.fillStyle='#ffd400';bc.beginPath();bc.arc(cx,cy,3.5,0,TAU);bc.fill();
  bc.save();bc.translate(cx,cy-R-3);bc.rotate(M.kick);bc.fillStyle='#ff2d7a';bc.strokeStyle='#000';bc.lineWidth=1.5;bc.beginPath();bc.moveTo(-5,-4);bc.lineTo(5,-4);bc.lineTo(0,8);bc.closePath();bc.fill();bc.stroke();bc.restore();
  bc.imageSmoothingEnabled=false;
  if(M.ph==1){const p=M.t,s=p<.12?2-p/.12:1,big=M.m>=10;bc.save();bc.translate(cx,cy+8);bc.scale(s,s);bc.textAlign='center';thickTxt(bc,'x'+M.m,0,0,big?24:19,big?'hsl('+Math.floor(t*200)%360+',100%,65%)':'#ffd400');bc.restore()}
  bc.restore()}

/* --- 777: 押せ!! → (バリエーション) → 従来の jackpot() ---
   v0 従来: そのまま jackpot() / v1 777叩きつけ / v2 カウントダウン。v1/v2 は前置きアニメだけで、jackpot() 本体と従来の演出は変えない。
   色は虹色(ゲーミング)。色相が滑らかに回るだけで明暗の点滅はしない。HEV.jv で固定可(テスト用) */
const JRD=[0,2.6,2.8];
function jpRush(){const v=HEV.jv!=null?HEV.jv:gkPick([.34,.33,.33]);if(!v){jackpot();return}HEV.jr={t0:T,k:0,v};showMsg(v==2?'JACKPOT COUNTDOWN!!':'777!!!','#ffd400')}
function jrHue(t,o){const fl=typeof UX!=='undefined'&&UX.S?UX.S.fl:2;return Math.floor(t*(fl>0?260:60)+(o||0))%360}
function jrBoom(k){shake();kyuin(3+k*2,'hsl('+jrHue(T,k*120)+',100%,60%)');burst(90+(k-1)*90,75,30,'hsl('+jrHue(T,k*90)+',100%,60%)');try{if(sOK())tone(220*k,sNow(),.25,'sawtooth',.05,110)}catch(e){}}
function jrUpd(){const J=HEV.jr;if(!J)return;const p=T-J.t0;
  if(J.v==1){while(J.k<3&&p>.35+J.k*.38){J.k++;jrBoom(J.k);if(J.k==3)flash('#ffd400')}if(p>1.6&&!J.b){J.b=1;banner('JACKPOT!!!','#ffd400');try{fan()}catch(e){}}}
  else{while(J.k<3&&p>.2+J.k*.62){J.k++;jrBoom(J.k);try{if(sOK())tone(660*Math.pow(1.5,J.k-1),sNow(),.18,'square',.04)}catch(e){}}if(p>2.1&&!J.b){J.b=1;flash('#fff');shake();banner('JACKPOT!!!','#ffd400');try{fan();jara()}catch(e){}}}
  if(p>=JRD[J.v]){HEV.jr=null;jackpot()}}
function jrTxt(t,x,y,px,fill,lw){thickTxt(bc,t,x,y,px,fill,{lw:lw?lw*1.2:0,ex:'#1a0430'})}
function jrDraw(t){const J=HEV.jr;if(!J)return;const p=t-J.t0,D=JRD[J.v],fl=typeof UX!=='undefined'&&UX.S?UX.S.fl:2;
  bc.save();bc.globalAlpha=Math.min(1,p*4,(D-p)*5+.3);bc.fillStyle='rgba(8,2,18,.88)';bc.fillRect(0,0,360,150);
  // 虹色の回転光線
  bc.translate(180,J.v==2?72:75);bc.rotate(p*(fl>0?1.8:.4)*(J.v==2?-1:1));for(let i=0;i<16;i++){bc.rotate(TAU/16);bc.fillStyle='hsla('+jrHue(t,i*22.5)+',100%,55%,'+(i%2?.42:.26)+')';bc.beginPath();bc.moveTo(0,0);bc.lineTo(260,-26);bc.lineTo(260,26);bc.closePath();bc.fill()}
  if(bc.setTransform)bc.setTransform(1,0,0,1,0,0);
  // 上下の虹色ライン(ゲーミング枠)
  for(let x=0;x<360;x+=12){bc.fillStyle='hsl('+jrHue(t,x*2)+',100%,58%)';bc.fillRect(x,0,12,4);bc.fillRect(x,146,12,4)}
  bc.textAlign='center';bc.imageSmoothingEnabled=false;
  if(J.v==1){for(let i=0;i<J.k;i++){const q=p-(.35+i*.38),s=q<.12?3.2-q/.12*2.2:1;bc.save();bc.translate(110+i*70,96);bc.scale(s,s);jrTxt('7',0,0,70,'hsl('+jrHue(t,i*120)+',100%,62%)',10);bc.restore()}
    if(p>1.6){const q=p-1.6,s=q<.15?2.4-q/.15*1.4:1+Math.sin(q*8)*.04;bc.save();bc.translate(180,138);bc.scale(s,s);jrTxt('JACKPOT!!!',0,0,26,'hsl('+jrHue(t,200)+',100%,66%)',7);bc.restore()}}
  else{if(p<2.1&&J.k>0){const q=p-(.2+(J.k-1)*.62),s=q<.14?3-q/.14*2:1+Math.max(0,.5-q)*.2;bc.save();bc.translate(180,104);bc.scale(s,s);jrTxt(String(4-J.k),0,0,86,'hsl('+jrHue(t,J.k*120)+',100%,62%)',11);bc.restore();
      bc.font='12px '+FN;bc.fillStyle='#fff';bc.fillText('JACKPOT まで',180,22)}
    if(p>=2.1){const q=p-2.1,s=q<.15?2.8-q/.15*1.8:1+Math.sin(q*9)*.05;bc.save();bc.translate(180,96);bc.scale(s,s);jrTxt('JACKPOT!!!',0,0,40,'hsl('+jrHue(t)+',100%,64%)',9);bc.restore()}}
  bc.restore()}

{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{mrUpd(dt);jrUpd()}catch(e){HEV.mr=null;if(HEV.jr){HEV.jr=null;jackpot()}}return r}}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{mrDraw(t);jrDraw(t)}catch(e){}return r}}
