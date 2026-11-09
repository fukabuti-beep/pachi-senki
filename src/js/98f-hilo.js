/* ---------- ミニゲーム「ハイ&ロー」 (feature) ----------
   STAGE 30〜、ボス撃破のミニゲームのローテーション(95 の MGT)に加わる。パネルは 95 と同じ #fxg を使う。
   表のカード(1〜13)に対して、次のカードが HIGH か LOW かを選ぶ。最大3回、当たるたびに倍率 x2→x4→x8。
   同じ数字は当たり扱い。外れても それまでの倍率で必ず受け取れる(損はしない)。
   4秒触らなければ有利な方を自動で選ぶので放置でも詰まらない。3連勝は「大成功」(X.st.mgp)。
   当否は乱数だけで決まり、選び方以外の操作で変わらない。 */
let HL=null;
mk('hlcard','k#14101f,w#fff8e8,s#d8ccb0,r#ff2d55',["kkkkkk","kwwwww","kwrwww","kwwwww","kwwwww","kwwwww","kwwwww","kwwwww","kwwwww","kwwwww","kwwwww","kwwwww"]);
mk('hlback','k#14101f,b#3a2a8a,p#ff2d7a,y#ffd400',["kkkkkk","kyyyyy","kybbbb","kybpbb","kybbpb","kybbbp","kybpbb","kybbpb","kybbbp","kybpbb","kybbpb","kybbbp"]);
MGT.push(['hilo','ハイ&ロー',30]);
const HLB=()=>G.stage*60*mul()*sbg();
const hlCard=()=>1+Math.floor(Math.random()*13);
const hlName=n=>n===1?'A':n===11?'J':n===12?'Q':n===13?'K':String(n);
function hlStart(){HL={t:0,ph:0,a:hlCard(),b:0,w:0,pick:0,auto:0,res:'',fl:0};
  $('fxgt').textContent='ハイ&ロー!';$('fxgr').textContent='x1';$('fxgh').textContent='左=HIGH / 右=LOW をタップ(自動あり)';
  mg2e.style.display='flex';seHl('start')}
/* 95 の mg2Start をラップ(ローテーションで hilo が来たらこちらで開始) */
{const o=mg2Start;mg2Start=function(ty){if(ty==='hilo')return hlStart();return o.apply(this,arguments)}}
{const o=mini;mini=function(){if(HL)return;return o.apply(this,arguments)}}
/* 遺物のドロップ演出はハイ&ローの後に出す */
if(typeof relicUpd==='function'){const o=relicUpd;relicUpd=function(){if(HL&&RDR.q&&!RDR.show)return;return o.apply(this,arguments)}}
/* 選ぶ: up=1 HIGH / 0 LOW */
function hlChoose(up,auto){const h=HL;if(!h||h.ph!==0)return;h.pick=up;h.auto=auto?1:0;h.b=hlCard();h.ph=1;h.t=0;
  seHl('flip')}
function hlJudge(){const h=HL,ok=h.pick?h.b>=h.a:h.b<=h.a;h.ph=2;h.t=0;
  if(ok){h.w++;$('fxgr').textContent='x'+(1<<h.w);h.fl=1;
    seHl('win',h.w);
    if(h.w>=3){kyuin(8,'#ffd400');flash('#ffd400')}else kyuin(2+h.w,'#ffd400')}
  else{h.fl=0;seHl('lose')}
  $('fxgh').textContent=(ok?'当たり!':'はずれ…')+(h.auto?'(自動)':'')}
function hlFin(){const h=HL,m=1<<h.w,g=addGold(HLB()*m);h.ph=3;h.t=0;h.res='x'+m+' +G'+fmt(g);$('fxgr').textContent=h.res;
  $('fxgh').textContent=h.w>=3?'パーフェクト!! 3連勝':h.w?h.w+'連勝!':'残念…でも x1 はもらえる';
  if(h.w>=3){X.st.mgp++;banner('ハイ&ロー 3連勝!!','#ffd400');try{fan()}catch(e){}seHl('perfect')}else if(h.w)seHl('cash')}
function hlEnd(){mg2e.style.display='none';HL=null}
function hlTap(e){const h=HL;if(!h||h.ph!==0)return;let up=1;try{const r=$('fxgc').getBoundingClientRect();if(e&&e.clientX!=null)up=(e.clientX-r.left)<(r.width||240)/2?1:0}catch(x){}hlChoose(up,0)}
if(mg2e.addEventListener)mg2e.addEventListener('pointerdown',hlTap);
FU.push(dt=>{const h=HL;if(!h)return;h.t+=dt;
  if(h.ph===0&&h.t>(h.w?3:4))hlChoose(h.a<=7?1:0,1);
  else if(h.ph===1&&h.t>.9)hlJudge();
  else if(h.ph===2&&h.t>1.1){if(h.fl&&h.w<3){h.a=h.b;h.b=0;h.ph=0;h.t=0;$('fxgh').textContent='次は? 左=HIGH / 右=LOW'}else hlFin()}
  else if(h.ph===3&&h.t>2.2)hlEnd();
  if(HL)hlDraw(T)});
/* 描画 (240x90): 左に表のカード、右に伏せ札→めくり。下に HIGH/LOW ボタンと勝ち数ランプ */
function hlCardDraw(c,x,y,n,w,hgt,red){c.drawImage(SPR.hlcard,x,y,w,hgt);c.textAlign='center';
  if(w>24&&typeof mgTxt==='function')mgTxt(c,hlName(n),x+w/2,y+hgt/2+8,22,red?'#ff2d55':'#14101f');}
function hlDraw(t){const h=HL,c=mg2c;c.imageSmoothingEnabled=false;
  c.fillStyle='#0d0826';c.fillRect(0,0,240,90);c.fillStyle='#1c1248';for(let y=2;y<90;y+=4)for(let x=(y>>2)%2*2;x<240;x+=4)c.fillRect(x,y,1,1);
  // 表のカード
  hlCardDraw(c,30,6,h.a,40,56,h.a%2===0);
  // 右: 伏せ札 / めくり(横に縮んで開く)
  const bx=170,by=6;
  if(h.ph===0){c.drawImage(SPR.hlback,bx,by+Math.round(Math.sin(t*4)*2),40,56);if(typeof mgTxt==='function'){c.textAlign='center';mgTxt(c,'?',bx+20,by+36,20,'hsl('+(typeof mgHue==='function'?mgHue(t):0)+',100%,66%)')}}
  else{const p=h.ph===1?Math.min(1,h.t/.9):1,sx=Math.abs(Math.cos(p*Math.PI)),showF=p>.5,w=Math.max(2,Math.round(40*sx));
    if(showF)hlCardDraw(c,bx+20-w/2,by,h.b,w,56,h.b%2===0);else c.drawImage(SPR.hlback,bx+20-w/2,by,w,56);
    if(h.ph>=2){const ok=h.fl||h.ph===3&&h.w>0;c.textAlign='center';if(typeof mgTxt==='function')mgTxt(c,h.ph===2?(h.fl?'WIN!':'LOSE'):(h.w>=3?'PERFECT':'x'+(1<<h.w)),120,40,h.ph===2&&h.fl||h.w>=3?18:14,ok?'#ffd400':'#8a80b0')}}
  // 選択ボタン
  const sel=h.ph>0?h.pick:-1;
  [['HIGH',1,6],['LOW',0,124]].forEach(([s,u,x])=>{const on=sel===u,dim=sel>=0&&!on;c.fillStyle='#000';c.fillRect(x,66,110,20);
    c.fillStyle=dim?'#2a2050':u?'#d0105a':'#1060d0';c.fillRect(x+1,67,108,18);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(x+1,67,108,3);
    if(on){c.strokeStyle='#ffd400';c.lineWidth=2;c.strokeRect(x,66,110,20)}c.textAlign='center';if(typeof mgTxt==='function')mgTxt(c,(u?'▲ ':'▼ ')+s,x+55,81,12,dim?'#6a6090':'#fff')});
  // 勝ち数ランプ(3つ)
  for(let i=0;i<3;i++){c.fillStyle='#000';c.fillRect(103+i*12,8,10,10);c.fillStyle=i<h.w?'#ffd400':'#3a2a70';c.fillRect(104+i*12,9,8,8)}
  // 制限時間
  if(h.ph===0){const p=Math.max(0,1-h.t/(h.w?3:4));c.fillStyle='#000';c.fillRect(84,56,72,5);c.fillStyle=p<.3?'#ff2d55':'#3fe0a0';c.fillRect(85,57,Math.round(70*p),3)}}
