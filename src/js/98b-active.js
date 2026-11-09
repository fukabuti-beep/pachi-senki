/* ---------- アクティブ要素 + 演出パック (feature/fx) ----------
   1) タップ攻撃: 戦闘画面(#b)をタップで追撃。クリティカル/タップコンボ/30コンボごとに「ラッシュ斬り」
   2) お宝ターゲット: 30〜50秒ごとに宝袋/流れ星が戦闘画面を横切る。タップで捕獲→ゴールド/SP/FEVER。逃すと消える
   3) ボス演出: 出現時 WARNING(警告ストライプ+サイレン) / 撃破時 FINISH!!(スロー+大文字)
   4) SUPERリーチ中のチャンスボタン: 押すと期待度の色(青/緑/赤/金)と文言。当否は変えない(押さなければ消える)
   5) 10ステージごとの節目演出(STAGE n 突破!! + 紙吹雪)
   放置でも進行は従来どおり(どれもボーナス。放置で損をする仕組みは入れない)。 */
mk('tbag','k#14101f,b#b8742a,d#7a4a14,g#ffd400,y#fff2a0',["......","....kk","...kgk","....kk","..kbbb",".kbbbb","kbbgyb","kbbggb","kbbbbb","kdbbbb",".kdddd","..kkkk"]);
mk('tstar','k#14101f,y#fff2a0,g#ffd400,o#ff9a3d',["......",".....k","....ky","...kyg","kkkygg","kyyggo",".kgggo","..kgoo","..kgok",".kgok.",".kok..","..k..."]);
const ACT={tc:0,tt:-9,lt:-9,sp:[],tg:null,next:30,warn:null,fin:null,cb:null};
function actXY(e){const r=$('b').getBoundingClientRect();return [(e.clientX-r.left)/(r.width||360)*360,(e.clientY-r.top)/(r.height||150)*150]}
function actSnd(f,d,ty,v,f2){try{if(sOK())tone(f,sNow(),d,ty||'square',v||.03,f2)}catch(e){}}

/* --- 1) タップ攻撃 --- */
function actTap(e){if(!run)return;const [x,y]=e&&e.clientX!=null?actXY(e):[260,80];
  if(ACT.tg&&!ACT.tg.got&&Math.hypot(x-ACT.tg.x,y-ACT.tg.y)<26){actCatch();return}
  if(T-ACT.lt<.07)return;ACT.lt=T;
  ACT.tc=T-ACT.tt<1.2?ACT.tc+1:1;ACT.tt=T;
  const cr=Math.random()<.1+Math.min(.15,ACT.tc*.005),d=atk()*(.45+Math.min(.5,ACT.tc*.01))*UPX.tap();
  hurt(d,'#9ff',0,cr);spAdd(.6);
  if(ACT.sp.length<16)ACT.sp.push({x:Math.max(200,Math.min(330,x)),y:Math.max(40,Math.min(120,y)),t0:T,c:cr?'#ffe14d':'#9ff'});
  actSnd(cr?1500:900+Math.min(600,ACT.tc*12),.04,'square',.025);
  if(ACT.tc%30==0){actRush()}}
function actRush(){banner('ラッシュ斬り!!','#22e0ff');kyuin(4,'#22e0ff');shake();for(let i=0;i<6;i++)presLater(()=>{try{hurt(atk()*1.5,'#22e0ff',1,i==5);burst(262,80,10,'#22e0ff')}catch(e){}},i*90)}
{const b=$('b');if(b&&b.addEventListener){b.addEventListener('pointerdown',actTap);if(b.style)b.style.touchAction='manipulation'}}

/* --- 2) お宝ターゲット --- */
const TGK=[{s:'tbag',n:'宝袋',w:5},{s:'tstar',n:'流れ星',w:3}];
function actSpawnTg(){const k=TGK[gkPick([.6,.4])],l2r=Math.random()<.5;ACT.tg={k,x:l2r?-14:374,y:22+Math.random()*30,vx:(l2r?1:-1)*(70+Math.random()*30),t0:T,got:0,ph:Math.random()*6};
  actSnd(1760,.08,'p25',.03);actSnd(2093,.1,'p25',.03)}
function actCatch(){const g=ACT.tg;g.got=T;const r=Math.random();let msg;
  if(g.k.s=='tstar'&&r<.35&&G.rush<=0&&!(G.fv>0)){G.fv=8;msg='FEVER!!';banner('FEVER TIME!!','#22e0ff');try{fan()}catch(e){}}
  else if(r<.6){const v=Math.floor(G.stage*60*g.k.w*mul()*(.8+Math.random()*.6)*UPX.trsGain());G.gold+=v;msg='+'+fmt(v)+' G'}
  else{spAdd(35);msg='SP +35'}
  g.msg=msg;kyuin(3,'#ffd400');burst(Math.max(20,Math.min(340,g.x)),g.y,24,'#ffd400');
  try{if(sOK()){const t=sNow();[1047,1319,1568,2093].forEach((f,i)=>tone(f,t+i*.06,.1,'square',.03))}}catch(e){}}
function actTgUpd(dt){
  if(!ACT.tg){if(run&&!G.roul&&T>ACT.next){actSpawnTg();ACT.next=T+(30+Math.random()*20)/UPX.trsRate()}return}
  const g=ACT.tg;if(g.got){if(T-g.got>1.2)ACT.tg=null;return}
  g.x+=g.vx*dt;g.y+=Math.sin((T-g.t0)*3+g.ph)*.4;if(g.x<-30||g.x>390){ACT.tg=null;showMsg(g.k.n+'は逃げた…','#9aa0c8')}}

/* --- 3) ボス演出 --- */
{const _sp=spawn;spawn=function(){const r=_sp.apply(this,arguments);try{if(isBoss()&&run){ACT.warn={t0:T};try{if(sOK()){const t=sNow();for(let i=0;i<4;i++){tone(880,t+i*.4,.18,'sawtooth',.035,660);tone(660,t+i*.4+.2,.18,'sawtooth',.035,880)}}}catch(e){}}}catch(e){}return r}}
{const _k=kill;kill=function(){const wb=isBoss(),s0=G.stage;const r=_k.apply(this,arguments);try{if(wb&&run){ACT.fin={t0:T};HS=Math.max(HS,.5);shake()}
  if(run&&G.stage>s0&&s0%10==0)actMile(s0)}catch(e){}return r}}
/* --- 5) 10ステージごとの節目: 「STAGE n 突破!!」+ 紙吹雪 --- */
const CF=[];
function actMile(n){ACT.mile={t0:T+1.4,n};presLater(()=>{try{banner('STAGE '+n+' 突破!!','#ffd400');kyuin(6,'#ffd400');try{jara()}catch(e){}
  for(let i=0;i<60&&CF.length<80;i++)CF.push({x:Math.random()*360,y:-10-Math.random()*60,vx:(Math.random()-.5)*40,vy:40+Math.random()*60,r:Math.random()*6,h:Math.floor(Math.random()*360),t0:T})}catch(e){}},1400)}

/* --- 4) SUPERリーチ中のチャンスボタン --- */
const cbtn=fxEl('div','gkcb','','<b>CHANCE</b><i>PUSH</i>');cbtn.style.display='none';
function cbShow(s){ACT.cb={s,t0:T,done:0};const sl=$('slot').getBoundingClientRect();cbtn.style.left=Math.round(sl.left+sl.width/2-46)+'px';cbtn.style.top=Math.round(sl.bottom+6)+'px';cbtn.style.display='flex';cbtn.className='on';actSnd(1319,.08,'square',.03)}
function cbHide(){cbtn.style.display='none';cbtn.className=''}
function cbPress(){const C=ACT.cb;if(!C||C.done||!sp||sp!==C.s)return;C.done=1;cbHide();
  const h=sp.hit,r=Math.random(),L=h?(r<.35?4:r<.85?3:2):(r<.55?1:r<.9?2:3),col=['','#44aaff','#33dd66','#ff2244','#ffd400'][L],tx=['','チャンス!','チャンス!!','激アツ!!','確定!?'][L];
  banner(tx,col);kyuin(L+1,col);flash(col);if(L>=3)shake();showMsg('ボタン演出 '+tx,col)}
cbtn.onpointerdown=cbPress;
function actCbUpd(){const s=sp;if(s&&s.type==2&&!s.pzN&&s.t>2.2&&s.t<s.stop[2]-1.2&&G.rush<=0){if(!ACT.cb||ACT.cb.s!==s){cbShow(s)}}
  if(ACT.cb&&!ACT.cb.done&&(ACT.cb.s!==sp||!sp||sp.t>=sp.stop[2]-1.2)){ACT.cb.done=1;cbHide()}}

{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{actTgUpd(dt);actCbUpd()}catch(e){ACT.tg=null}return r}}

/* --- 描画 --- */
function actDraw(t){
  for(let i=ACT.sp.length-1;i>=0;i--){const s=ACT.sp[i],p=t-s.t0;if(p>.25){ACT.sp.splice(i,1);continue}const r=6+p*80;bc.globalAlpha=1-p*4;bc.strokeStyle=s.c;bc.lineWidth=3;bc.beginPath();bc.moveTo(s.x-r,s.y-r*.4);bc.lineTo(s.x+r,s.y+r*.4);bc.stroke();bc.beginPath();bc.moveTo(s.x-r*.4,s.y+r);bc.lineTo(s.x+r*.4,s.y-r);bc.stroke();bc.globalAlpha=1}
  if(ACT.tc>=5&&t-ACT.tt<1.2){bc.textAlign='right';const s=t-ACT.tt<.08?1.3:1;bc.save();bc.translate(352,118);bc.scale(s,s);thickTxt(bc,ACT.tc+' TAP',0,0,14,ACT.tc>=30?'hsl('+Math.floor(t*200)%360+',100%,64%)':'#9ff');bc.restore()}
  const g=ACT.tg;if(g){bc.imageSmoothingEnabled=false;
    if(!g.got){if(g.k.s=='tstar'){for(let k=1;k<6;k++){bc.globalAlpha=.5-k*.08;bc.fillStyle='#fff2a0';bc.fillRect(g.x-Math.sign(g.vx)*k*7-2,g.y+12,4,4)}bc.globalAlpha=1}
      const b=Math.round(Math.sin(t*8)*2);bc.drawImage(SPR[g.k.s],Math.round(g.x-14),Math.round(g.y-14+b),28,28);
      if(Math.floor(t*4)%2==0){bc.textAlign='center';thickTxt(bc,'TAP!',g.x,g.y-16,10,'#fff')}}
    else{const p=t-g.got;bc.textAlign='center';bc.globalAlpha=Math.max(0,1-p);thickTxt(bc,g.msg||'',Math.max(50,Math.min(310,g.x)),g.y+4-p*20,16,'#ffd400');bc.globalAlpha=1}}
  const W=ACT.warn;if(W){const p=t-W.t0;if(p>2.2)ACT.warn=null;else{const a=Math.min(1,p*6,(2.2-p)*4);bc.save();bc.globalAlpha=a*.92;
    bc.fillStyle='rgba(60,0,0,.55)';bc.fillRect(0,48,360,54);
    for(const y of [44,102]){bc.fillStyle='#ffd400';bc.fillRect(0,y,360,8);bc.fillStyle='#000';for(let x=-16+((t*60)%16);x<360;x+=16){bc.beginPath();bc.moveTo(x,y);bc.lineTo(x+8,y);bc.lineTo(x+16,y+8);bc.lineTo(x+8,y+8);bc.closePath();bc.fill()}}
    bc.globalAlpha=a;bc.textAlign='center';const s=p<.15?2-p/.15:1;bc.translate(180,86);bc.scale(s,s);thickTxt(bc,'WARNING!!',0,0,30,'#ff2030');bc.restore();
    bc.textAlign='center';bc.globalAlpha=a;thickTxt(bc,'BOSS STAGE '+G.stage,180,64,11,'#ffd400');bc.globalAlpha=1}}
  for(let i=CF.length-1;i>=0;i--){const f=CF[i],p=t-f.t0;f.x+=f.vx*DT;f.y+=f.vy*DT;f.r+=DT*8;if(f.y>160||p>4){CF.splice(i,1);continue}bc.fillStyle='hsl('+f.h+',100%,60%)';const w=Math.abs(Math.cos(f.r))*5+1;bc.fillRect(Math.round(f.x),Math.round(f.y),Math.round(w),4)}
  const Fi=ACT.fin;if(Fi){const p=t-Fi.t0;if(p>1.6)ACT.fin=null;else{const a=Math.min(1,(1.6-p)*3),s=p<.12?3-p/.12*2:1+Math.max(0,.4-p)*.2;bc.save();bc.globalAlpha=a;bc.fillStyle='rgba(255,255,255,'+Math.max(0,.5-p*2)+')';bc.fillRect(0,0,360,150);
    bc.translate(180,88);bc.rotate(-.06);bc.scale(s,s);bc.textAlign='center';thickTxt(bc,'FINISH!!',0,0,40,'hsl('+Math.floor(t*240)%360+',100%,62%)');bc.restore()}}}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{actDraw(t)}catch(e){ACT.sp.length=0}return r}}
