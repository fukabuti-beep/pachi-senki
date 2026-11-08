/* ---------- JACKPOT 演出の強化 (fx) ----------
   1) JP POOL: スロット横の情報パネルの「JACKPOT G」(既存表示)。盤面の下へこぼれた玉の価値が貯まり、JACKPOT でまとめて獲得できる。
   2) JACKPOT パネル: 盤面の上に「777 揃い!! JACKPOT」→ 内訳(ためた玉 POOL / ステージボーナス / 合計)を順にカウントアップ。
      虹色の光線・コインの雨・キャラ大喜び。JACKPOT 状態(G.jp)を 5秒→7秒に延長。
   既存の jackpot() と戦闘画面の JACKPOT 表示(80 jpShow)はそのまま。報酬額も変えない(見せ方だけ)。 */
const JPX={p:null,coins:[],poolShown:0};
{const o=jackpot;jackpot=function(){const pool=G.pool,base=G.stage*500*mul(),gold0=G.gold;const r=o.apply(this,arguments);
  try{const got=G.gold-gold0;G.jp=Math.max(G.jp,7);JPX.p={t0:T,pool:Math.floor(pool),base:Math.floor(base),tot:Math.max(0,Math.floor(got)),tk:0,st:0};
    for(let i=0;i<60&&JPX.coins.length<90;i++)JPX.coins.push({x:Math.random()*360,y:-20-Math.random()*300,v:80+Math.random()*120,r:Math.random()*6});
    try{chJumpAll(2);chSayAll('jp')}catch(e){}}catch(e){}return r}}
function jpxUpd(dt){const P=JPX.p;
  for(let i=JPX.coins.length-1;i>=0;i--){const c=JPX.coins[i];c.y+=c.v*dt;c.r+=dt*8;if(c.y>410){if(P&&T-P.t0<5)c.y=-10-Math.random()*40;else JPX.coins.splice(i,1)}}
  if(!P)return;const p=T-P.t0;
  // 段階ごとの音: 0.6 POOL / 1.6 ステージボーナス / 2.6 合計
  const stg=p<.6?0:p<1.6?1:p<2.6?2:3;if(stg>P.st){P.st=stg;try{if(sOK()){const t=sNow();[880,1175,1568,2093].slice(0,stg+1).forEach((f,i)=>tone(f,t+i*.06,.12,'square',.035));if(stg==3)jara()}}catch(e){}if(stg==3){shake();kyuin(6,'#ffd400')}}
  if(p<3.4&&T-P.tk>.06){P.tk=T;try{if(sOK())tone(1400+Math.sin(p*20)*300,sNow(),.025,'square',.015)}catch(e){}}
  if(p>7)JPX.p=null}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{jpxUpd(dt)}catch(e){JPX.p=null;JPX.coins.length=0}return r}}
// ---- 描画(盤面キャンバス pc) ----
function jpxTxt(t,x,y,px,fill){if(typeof thickTxt==='function')thickTxt(pc,t,x,y,px,fill,{d:px>=20?4:2,lw:px>=20?7:4});else{pc.font=px+'px '+FN;pc.lineWidth=4;pc.strokeStyle='#000';pc.strokeText(t,x,y);pc.fillStyle=fill;pc.fillText(t,x,y)}}
function jpxDraw(t){
  if(JPX.coins.length){pc.save();for(const c of JPX.coins){const w=Math.abs(Math.cos(c.r))*7+1;pc.fillStyle='#b07800';pc.fillRect(Math.round(c.x-w/2)-1,Math.round(c.y)-1,Math.round(w)+2,9);pc.fillStyle='#ffd400';pc.fillRect(Math.round(c.x-w/2),Math.round(c.y),Math.round(w),7);pc.fillStyle='#fff3a0';pc.fillRect(Math.round(c.x-w/2),Math.round(c.y),Math.max(1,Math.round(w/3)),3)}pc.restore()}
  const P=JPX.p;if(!P)return;const p=t-P.t0,a=Math.min(1,p*4,(7-p)*2);if(a<=0)return;
  pc.save();pc.globalAlpha=a;
  // 虹色の光線
  pc.save();pc.translate(180,170);pc.rotate(p*.9);for(let i=0;i<18;i++){pc.rotate(TAU/18);pc.fillStyle='hsla('+Math.floor(t*120+i*20)%360+',100%,55%,'+(i%2?.35:.18)+')';pc.beginPath();pc.moveTo(0,0);pc.lineTo(320,-30);pc.lineTo(320,30);pc.closePath();pc.fill()}pc.restore();
  // パネル
  pc.fillStyle='rgba(10,4,30,.86)';pc.fillRect(20,70,320,210);pc.fillStyle='#ffd400';pc.fillRect(20,70,320,3);pc.fillRect(20,277,320,3);pc.fillRect(20,70,3,210);pc.fillRect(337,70,3,210);
  pc.textAlign='center';
  const s=p<.25?2.2-p/.25*1.2:1+Math.sin(p*6)*.03;pc.save();pc.translate(180,112);pc.scale(s,s);jpxTxt('7 7 7',0,0,34,'hsl('+Math.floor(t*200)%360+',100%,62%)');pc.restore();
  jpxTxt('揃い!! JACKPOT!!',180,140,18,'#ffd400');
  const row=(i,lab,val,c)=>{const show=p>.6+i;if(!show)return;const q=Math.min(1,(p-.6-i)/.8),e=1-Math.pow(1-q,3);pc.textAlign='left';jpxTxt(lab,40,172+i*30,13,'#c8c0ff');pc.textAlign='right';jpxTxt('+'+fmt(Math.floor(val*e))+' G',320,172+i*30,i==2?18:15,c)};
  row(0,'ためた玉(POOL)',P.pool,'#fff');row(1,'ステージボーナス',P.base,'#fff');
  if(p>2.4){pc.fillStyle='#ffd400';pc.fillRect(40,218,280,2)}row(2,'合計',P.tot,'hsl('+Math.floor(t*160)%360+',100%,66%)');
  pc.textAlign='center';if(p>3.2){pc.font='10px '+FN;pc.fillStyle='#c8c0ff';pc.fillText('こぼれた玉は JACKPOT POOL に貯まり、777 でまとめて獲得!',180,268)}
  pc.restore()}
{const _d=drawP;drawP=function(t){const r=_d.apply(this,arguments);try{jpxDraw(t)}catch(e){JPX.p=null}return r}}
