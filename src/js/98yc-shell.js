// @full  (完全版だけ。体験版のビルドには入らない)
// FULL_FEAT: ミニゲーム「宝玉かくし」
/* ---------- ミニゲーム「宝玉かくし」 (feature, 完全版) ----------
   STAGE 45〜、ボス撃破のミニゲームのローテーション(95 の MGT)に加わる。パネルは 95 と同じ #fxg。
   3つの杯のどれかに宝玉を隠して かき混ぜる → どの杯か当てる。当たり x6 / はずれでも x1 はもらえる(損はしない)。
   今あるミニゲーム(タイミング/くじ/連打/度胸)と ちがう力=「目で追う」(docs/DESIGN.md: 役割のちがい)。進むほど混ぜる回数が増えて速くなる。
   4秒触らなければ自動で選ぶ(当てずっぽう=3分の1)ので放置でも詰まらない。当否は「選んだ杯に宝玉があるか」だけ。
   転生(PGEN の変化)で打ち切る。ラップ: mg2Start / mini(98f と同じ形)。 */
let SHG=null;
MGT.push(['shell','宝玉かくし',45]);
const SHB=()=>G.stage*60*mul()*sbg(),SHX=[50,120,190];
function shStart(){const n=Math.min(9,5+Math.floor(G.stage/50)),sw=[];let last=-1;
  for(let i=0;i<n;i++){let a=Math.floor(Math.random()*3),b=(a+1+Math.floor(Math.random()*2))%3,k=a*3+b;if(k===last){b=3-a-b}last=a*3+b;sw.push([a,b])}
  SHG={t:0,ph:0,slot:[0,1,2],ball:Math.floor(Math.random()*3),sw,si:0,d:Math.max(.26,.44-G.stage*.0009),pick:-1,auto:0,win:0,gen:PGEN,res:''};
  $('fxgt').textContent='宝玉かくし!';$('fxgr').textContent='';$('fxgh').textContent='宝玉の入った杯を よく見て!';
  mg2e.style.display='flex';try{seHl('start')}catch(e){}}
{const o=mg2Start;mg2Start=function(ty){if(ty==='shell')return shStart();return o.apply(this,arguments)}}
{const o=mini;mini=function(){if(SHG)return;return o.apply(this,arguments)}}
function shEnd(){mg2e.style.display='none';SHG=null}
/* 杯 c が今いる場所(0〜2)。slot[場所]=杯 */
const shAt=c=>SHG.slot.indexOf(c);
function shChoose(pos,auto){const h=SHG;if(!h||h.ph!==2)return;h.pick=pos;h.auto=auto?1:0;h.win=h.slot[pos]===h.ball?1:0;h.ph=3;h.t=0;try{seHl('flip')}catch(e){}}
function shFin(){const h=SHG,m=h.win?6:1,g=addGold(SHB()*m);h.ph=4;h.t=0;h.res='x'+m+' +G'+fmt(g);$('fxgr').textContent=h.res;
  $('fxgh').textContent=(h.win?'おみごと!! 大当たり':'残念…でも x1 はもらえる')+(h.auto?'(自動)':'');
  try{if(h.win){X.st.mgp++;kyuin(6,'#ffd400');banner('宝玉かくし 的中!!','#ffd400');seHl('perfect')}else seHl('lose')}catch(e){}}
function shTap(e){const h=SHG;if(!h||h.ph!==2)return;let p=1;try{const r=$('fxgc').getBoundingClientRect();if(e&&e.clientX!=null)p=Math.max(0,Math.min(2,Math.floor((e.clientX-r.left)/(r.width||240)*3)))}catch(x){}shChoose(p,0)}
if(mg2e.addEventListener)mg2e.addEventListener('pointerdown',shTap);
FU.push(dt=>{const h=SHG;if(!h)return;if(h.gen!==PGEN){shEnd();return}h.t+=dt;
  if(h.ph===0&&h.t>1.3){h.ph=1;h.t=0;$('fxgh').textContent='かき混ぜ中…'}
  else if(h.ph===1&&h.t>=h.d){const s=h.sw[h.si],a=h.slot[s[0]];h.slot[s[0]]=h.slot[s[1]];h.slot[s[1]]=a;h.si++;h.t=0;try{beep(500+h.si*40,.03,'square',.02)}catch(e){}
    if(h.si>=h.sw.length){h.ph=2;$('fxgh').textContent='どれだ!? 杯をタップ(自動あり)'}}
  else if(h.ph===2&&h.t>4)shChoose(Math.floor(Math.random()*3),1);
  else if(h.ph===3&&h.t>1.1)shFin();
  else if(h.ph===4&&h.t>2.2){shEnd();return}
  shDraw(T)});
/* 描画 (240x90) */
function shCup(c,x,y,up){const yy=y-up;   // 伏せた杯: 上がすぼまった台形(4段)
  for(let i=0;i<4;i++){const w=26+i*4,h=i<3?8:10,ty=yy+i*8;c.fillStyle='#000';c.fillRect(x-w/2-2,ty-(i?0:2),w+4,h+(i?0:2)+(i===3?2:0));c.fillStyle=i===3?'#8a1c30':'#c8324a';c.fillRect(x-w/2,ty,w,h)}
  c.fillStyle='#ff6a80';c.fillRect(x-13,yy,26,3);c.fillStyle='#ffd400';c.fillRect(x-17,yy+14,34,3);c.fillStyle='#fff';c.fillRect(x-10,yy+3,3,9)}
function shBall(c,x,y){c.fillStyle='#000';c.fillRect(x-6,y-6,12,12);c.fillStyle='#7ff3ff';c.fillRect(x-5,y-5,10,10);c.fillStyle='#fff';c.fillRect(x-3,y-3,3,3);c.fillStyle='#22a0d0';c.fillRect(x+1,y+1,4,4)}
function shDraw(t){const h=SHG,c=mg2c;c.imageSmoothingEnabled=false;
  c.fillStyle='#0d0826';c.fillRect(0,0,240,90);c.fillStyle='#1c1248';for(let y=2;y<90;y+=4)for(let x=(y>>2)%2*2;x<240;x+=4)c.fillRect(x,y,1,1);
  c.fillStyle='#3a2a70';c.fillRect(10,72,220,4);
  const bx=SHX[shAt(h.ball)];
  // 宝玉が見える時: はじめ / 選んだ後
  if(h.ph===0||h.ph>=3)shBall(c,bx,64);
  for(let cup=0;cup<3;cup++){let pos=shAt(cup),x=SHX[pos],y=38,up=0;
    if(h.ph===1&&h.si<h.sw.length){const s=h.sw[h.si],q=Math.min(1,h.t/h.d);
      if(pos===s[0]||pos===s[1]){const to=pos===s[0]?s[1]:s[0];x=SHX[pos]+(SHX[to]-SHX[pos])*q;y=38+(pos===s[0]?-1:1)*Math.sin(q*Math.PI)*12}}
    if(h.ph===0&&cup===h.ball)up=Math.round(Math.max(0,Math.sin(Math.min(1,h.t/1.2)*Math.PI))*26);
    if(h.ph>=3&&(pos===h.pick||cup===h.ball))up=Math.round(Math.min(1,h.t/.4)*26);
    if(h.ph===4)up=cup===h.ball||pos===h.pick?26:0;
    shCup(c,Math.round(x),Math.round(y),up)}
  if(h.ph===2){const p=Math.max(0,1-h.t/4);c.fillStyle='#000';c.fillRect(84,80,72,5);c.fillStyle=p<.3?'#ff2d55':'#3fe0a0';c.fillRect(85,81,Math.round(70*p),3);
    for(let i=0;i<3;i++){c.fillStyle='hsl('+((t*120+i*90)%360|0)+',100%,66%)';c.fillRect(SHX[i]-3,14+Math.round(Math.sin(t*6+i)*2),6,6)}}
  if(h.ph>=3&&typeof mgTxt==='function'){c.textAlign='center';mgTxt(c,h.win?'WIN!':'MISS',120,16,14,h.win?'#ffd400':'#8a80b0')}}
