/* ---------- キャラクター演出パック (fx) ----------
   1) 英雄のジャンプ/喜びポーズ: heroDY(i,t) を 35-battle-draw の drawHeroes が y に足す(1行フック)
   2) 吹き出しセリフ: リーチ/当たり/ハズレ/ボス出現・撃破/JACKPOT/遺物 などで英雄がしゃべる
   3) カットインのバリエーション: 1人 / 3人そろい踏み / ドアップ。キャラはカットインだけ等身イラスト(83b-portrait)、文字は従来の描き方
   どれも見た目だけ(当否・進行は変えない)。 */
const CHR={j:[null,null,null],sb:[],lastRs:null,lastHit:0};
/* 吹き出しの台詞は英雄ごと(docs/STORY.md の口調: ホムラ=熱血「俺/だぜ」・シズク=落ち着いた「わ/ね」・コハク=素直な観察役「僕/よ」)。
   HLC[場面][英雄] から選ぶ。HLINE は3人分を合わせた一覧(旧名、互換のため残す) */
const HLC={
  hit:[['よっしゃ!!','きたぜ!!','いくぞ!!','燃えてきた!!'],['当たったわ!','いい流れね','計算どおり!','きたわね!'],['当たった!','見えてたよ!','やった!','きたきた!']],
  reach:[['来い!!','いけぇっ!','熱いぜ!!'],['お願い…!','止まって!','魔力をこめて…!'],['頼む…!','いけっ!','狙いどおり…!']],
  miss:[['くっ…!','次だ次!','まだまだ!'],['惜しいわね','次は来るわ','落ち着いて'],['惜しい!','次こそ!','あとちょっと…']],
  warn:[['でかいな!','燃えてきた!','相手にとって不足なし!'],['強い魔力…気をつけて','大物よ!','油断しないで'],['強敵だ!','すごい気配…','足音が重い…']],
  win:[['見たか!!','楽勝だぜ!','勝った!!'],['お見事ね','片づいたわ','やったわね!'],['やったー!','勝ったね!','ナイス!']],
  jp:[['777!!!','大勝利だぜ!!','伝説だ!!'],['伝説の777…!','すごすぎるわ!','運の光ね!'],['777だ!!','信じられない!','見えてたよ!!']],
  relic:[['お宝だ!','いい物ゲット!'],['魔力を感じる…','古い遺物ね'],['光ってる!','お宝みっけ!']],
  rush:[['止まらねえ!','連チャンだ!'],['まだ続くわ!','連チャンね!'],['止まらない!','まだ続くよ!']]};
const HLINE={};for(const k in HLC)HLINE[k]=[].concat(...HLC[k]);
const chLine=(i,k)=>{const a=(HLC[k]||{})[i]||HLINE[k]||[''];return a[Math.floor(Math.random()*a.length)]};
const chPick=a=>a[Math.floor(Math.random()*a.length)];
// 1) ジャンプ: kind 0=1回ホップ 1=喜び(3回) 2=大喜び(高く4回)
function chJump(i,kind,delay){CHR.j[i]={t0:T+(delay||0),k:kind}}
function chJumpAll(kind){for(let i=0;i<3;i++)chJump(i,kind,i*.08)}
function heroDY(i,t){let dy=0;const J=CHR.j[i];
  if(J){const p=t-J.t0,n=[1,3,4][J.k],per=[.32,.3,.34][J.k],hgt=[8,12,18][J.k];if(p>=0){if(p>n*per)CHR.j[i]=null;else{const q=(p%per)/per;dy=-Math.round(Math.sin(q*Math.PI)*hgt*(1-p/(n*per)*.3))}}}
  else if(G.rush>0)dy=-Math.round(Math.max(0,Math.sin(t*7+i*1.3))*3);
  return dy}
// 2) 吹き出し
function chSay(i,txt,dur){for(let k=CHR.sb.length-1;k>=0;k--)if(CHR.sb[k].i===i)CHR.sb.splice(k,1);if(CHR.sb.length<4)CHR.sb.push({i,txt,t0:T,d:dur||1.6})}
function chSayAll(key){for(let i=0;i<3;i++){const s=chLine(i,key);setTimeout(()=>{try{chSay(i,s)}catch(e){}},i*180)}}
function chDrawSB(t){for(let k=CHR.sb.length-1;k>=0;k--){const b=CHR.sb[k],p=t-b.t0;if(p>b.d){CHR.sb.splice(k,1);continue}
  const s=p<.1?.5+p*5:1,a=Math.min(1,(b.d-p)*4),cy=[22,42,22][b.i];bc.font='11px '+FN;const w=Math.max(34,b.txt.length*11+10),h=18,cx=Math.max(w/2+3,Math.min(357-w/2,hx(b.i)+32+(b.i==0?6:b.i==2?-6:0)));bc.save();bc.globalAlpha=a;bc.translate(cx,cy);bc.scale(s,s);
  bc.fillStyle='#000';bc.fillRect(-w/2-1,-h/2-1,w+2,h+2);bc.fillStyle='#fff';bc.fillRect(-w/2,-h/2,w,h);bc.fillStyle='#000';bc.fillRect(-3,h/2,6,2);bc.fillRect(-2,h/2+2,4,2);bc.fillRect(-1,h/2+4,2,2);bc.fillStyle='#fff';bc.fillRect(-2,h/2,4,1);bc.fillRect(-1,h/2+2,2,1);
  bc.fillStyle='#d8dcff';bc.fillRect(-w/2,h/2-3,w,3);bc.textAlign='center';bc.fillStyle='#14021f';bc.fillText(b.txt,0,4);bc.restore()}}
// イベントのフック(本体は変更しない)
{const o=bigHit;bigHit=function(jp){const r=o.apply(this,arguments);try{chJumpAll(jp?2:1);if(jp)chSayAll('jp');else if(G.combo>=2&&Math.random()<.6)(i=>chSay(i,chLine(i,'rush')))(Math.floor(Math.random()*3));else (i=>chSay(i,chLine(i,'hit')))(Math.floor(Math.random()*3))}catch(e){}return r}}
{const o=kill;kill=function(){const wb=isBoss();const r=o.apply(this,arguments);try{if(wb&&run){chJumpAll(2);setTimeout(()=>{try{chSayAll('win')}catch(e){}},500)}else if(run&&Math.random()<.08)chJump(Math.floor(Math.random()*3),0)}catch(e){}return r}}
{const o=spawn;spawn=function(){const r=o.apply(this,arguments);try{if(isBoss()&&run)setTimeout(()=>{try{chSay(1,chLine(1,'warn'),1.8)}catch(e){}},900)}catch(e){}return r}}
function chUpd(){const s=sp;
  if(s&&s.type&&s.t>1.9&&CHR.lastRs!==s){CHR.lastRs=s;if(s.type==2||Math.random()<.5){(i=>chSay(i,chLine(i,'reach')))(Math.floor(Math.random()*3));chJump(Math.floor(Math.random()*3),0)}}
  if(CHR.lastRs&&CHR.lastRs!==s){const was=CHR.lastRs;CHR.lastRs=null;if(!was.hit&&was.type==2&&Math.random()<.7)(i=>chSay(i,chLine(i,'miss')))(Math.floor(Math.random()*3))}
  if(typeof RDR!=='undefined'&&RDR.show&&RDR.show.t0>CHR.lastRelic){CHR.lastRelic=RDR.show.t0;chJumpAll(1);chSay(0,chLine(0,'relic'))}}
CHR.lastRelic=-1;
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{chUpd()}catch(e){}return r}}
// 3) カットインのバリエーション(従来=0 / そろい踏み=1 / ドアップ=2)。cb と終了タイミングは従来と同じ(.65秒で cb、1.0秒で終了)
// 大当たりのカットイン文字は「キャラのキメ台詞」に差し替え(上の小文字で大当たりを示す)。JACKPOT はそのまま
const CUTL=[['斬り開け!!','燃えろ!!','一刀両断!!'],['魔力解放!!','焼き尽くせ!','禁呪発動!!'],['狙い撃つ!!','逃さない!!','一矢必中!!']],CUTT=['総攻撃!!','全員集合!!','いくぞ!!'];
function cutLine(){if(cut.dt)return;const t=String(cut.txt);if(/JACKPOT/.test(t)){cut.dt=t;cut.sub='★ 777 ★';return}
  if(/大当たり/.test(t)){cut.dt=cut.v==1?chPick(CUTT):chPick(CUTL[cut.h]||CUTT);cut.sub='★ 大当たり ★';return}cut.dt=t;cut.sub='★ CHANCE ★'}
function cutTxtOld(p,ex,t,y0,col){cutLine();const tx=Math.round(350-(1-ex)*220+(p>.45?Math.sin(t*60)*1.5:0)),ty=y0+60;
  bc.font='40px '+FN;bc.textAlign='right';bc.lineJoin='round';bc.lineWidth=9;bc.strokeStyle='#000';
  const D=cut.dt;bc.strokeText(D,tx+3,ty+3);bc.fillStyle=col;bc.fillText(D,tx+3,ty+3);bc.strokeText(D,tx,ty);bc.fillStyle='#fff';bc.fillText(D,tx,ty);
  bc.font='13px '+FN;bc.lineWidth=4;bc.strokeText(cut.sub,tx,y0+24);bc.fillStyle=col==='#ff2d7a'?'#ffd400':col;bc.fillText(cut.sub,tx,y0+24)}
// カットインのキャラ: 等身イラスト(83b-portrait)。生成できない環境では従来のデフォルメ SPR
// 提供イラストを「コード描画の胸像と同じ顔位置」に合わせて描く(顔=胸像の(32,31))
function cutImg(k,x,y,sc,fx,size){const im=typeof PIMGI!=='undefined'?PIMGI[k]:null;if(!im)return false;const f=PIMGF[k],S=size||64*sc*1.75,w=S*(im.width/im.height),h=S,X=Math.round(x+32*sc-f[0]*w),Y=Math.round(y+31*sc-f[1]*h),col=cut&&cut.c||'#ffd400',t=T;
  if(fx){bc.save();bc.globalAlpha*=.5;for(let k2=0;k2<9;k2++){const ax=X+w*(.1+k2*.1),fh=h*(.3+.2*Math.abs(Math.sin(t*9+k2*1.7))),ay=Y+h*.6;bc.fillStyle=k2%2?col:'#fff';bc.beginPath();bc.moveTo(ax-w*.06,ay);bc.lineTo(ax+Math.sin(t*12+k2)*w*.04,ay-fh);bc.lineTo(ax+w*.06,ay);bc.closePath();bc.fill()}bc.restore();
    const R=PIMGRim(k,col);if(R){const d=Math.max(2,Math.round(sc*1.1));for(const [ox,oy] of [[-d,0],[d,0],[0,-d],[0,d]])bc.drawImage(R,X+ox,Y+oy,w,h)}}
  const sm=bc.imageSmoothingEnabled;bc.imageSmoothingEnabled=true;bc.drawImage(im,X,Y,w,h);bc.imageSmoothingEnabled=sm;return true}
function cutChar(i,x,y,sc,fx){if(cutImg('hero'+i,x,y,sc,fx))return;const P=typeof PORT==='function'?PORT(i):null;if(P){const w=Math.round(64*sc),h=Math.round(72*sc),X=Math.round(x),Y=Math.round(y),col=cut&&cut.c||'#ffd400',t=T;
  if(fx){// オーラの炎(キャラの後ろ)
    bc.save();bc.globalAlpha*=.55;for(let k=0;k<9;k++){const ax=X+w*(.1+k*.1),fh=h*(.35+.25*Math.abs(Math.sin(t*9+k*1.7))),ay=Y+h*.55;bc.fillStyle=k%2?col:'#fff';bc.beginPath();bc.moveTo(ax-w*.07,ay);bc.lineTo(ax+Math.sin(t*12+k)*w*.04,ay-fh);bc.lineTo(ax+w*.07,ay);bc.closePath();bc.fill()}bc.restore();
    // リムライト(色付きシルエットを左右にずらして重ねる)
    const R=typeof PORTRim==='function'?PORTRim(i,col):null;if(R){const d=Math.max(2,Math.round(sc*1.1));for(const [ox,oy] of [[-d,0],[d,0],[0,-d],[0,d]])bc.drawImage(R,X+ox,Y+oy,w,h)}}
  bc.drawImage(P,X,Y,w,h);
  if(fx){// 目の光(フレア)
    const p=cut?t-cut.t0:1,a=p>.22&&p<.62?Math.sin((p-.22)/.4*Math.PI):0;if(a>0){bc.save();bc.globalAlpha*=a;bc.fillStyle='#fff';for(const ex of [27,37]){const fx2=X+ex*sc,fy=Y+31.5*sc,L=sc*9;bc.fillRect(Math.round(fx2-L),Math.round(fy),Math.round(L*2),Math.max(1,Math.round(sc*.6)));bc.fillRect(Math.round(fx2),Math.round(fy-L*.5),Math.max(1,Math.round(sc*.6)),Math.round(L))}bc.restore()}}
  return}const spr=SPR['h'+i+'s'];if(spr)bc.drawImage(spr,Math.round(x),Math.round(y+20*sc),Math.round(64*sc),Math.round(64*sc))}
function drawCutV(t){const p=t-cut.t0,D=1.0;if(p>D){cut=null;return}
  if(p>.65&&!cut.f){cut.f=1;cut.cb()}
  const open=Math.min(1,p/.1),close=p>D-.12?Math.max(0,(D-p)/.12):1,h=Math.round(88*open*close),y0=76-(h>>1),col=cut.c;
  bc.save();let g=cut.g;if(!g){g=cut.g=bc.createLinearGradient(0,0,360,0);g.addColorStop(0,'#05030f');g.addColorStop(.45,'#1a0b3a');g.addColorStop(1,col)}
  bc.globalAlpha=.94;bc.fillStyle=g;bc.fillRect(0,y0,360,h);bc.globalAlpha=1;bc.beginPath();bc.rect(0,y0,360,h);bc.clip();
  const e=Math.min(1,p/.22),ex=1-Math.pow(1-e,3);bc.imageSmoothingEnabled=false;
  if(cut.v==1){bc.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<14;i++){const x=360-((t*(520+(i%4)*150)+i*97)%520);bc.fillRect(x,y0+((i*29)%88),60+(i%3)*40,2)}
    const TI=typeof PIMGI!=='undefined'&&PIMGI.trio;if(TI){const q=Math.max(0,Math.min(1,p/.22)),qe=1-Math.pow(1-q,3),H=112,W=H*TI.width/TI.height,x=-W+qe*(W-4),y=y0+44-H*.43;
      for(let k=2;k>=1;k--){bc.globalAlpha=.2*(1-qe);bc.imageSmoothingEnabled=true;bc.drawImage(TI,x-k*20,y,W,H)}bc.globalAlpha=1;const R=PIMGRim('trio',col);if(R){for(const [ox,oy] of [[-2,0],[2,0],[0,-2],[0,2]])bc.drawImage(R,x+ox,y+oy,W,H)}bc.drawImage(TI,x,y,W,H);bc.imageSmoothingEnabled=false}
    else for(let i=0;i<3;i++){const q=Math.max(0,Math.min(1,(p-i*.07)/.2)),qe=1-Math.pow(1-q,3),sc=1.6,x=-110+qe*(110+i*60),y=y0+44-31*sc+Math.sin(t*14+i)*1.5;
      for(let k=2;k>=1;k--){bc.globalAlpha=.2*(1-qe);cutChar(i,x-k*16,y,sc)}bc.globalAlpha=1;cutChar(i,x,y,sc,1)}}
  else if(cut.v==2){bc.fillStyle='rgba(255,255,255,.45)';for(let i=0;i<18;i++){const y=((t*(600+(i%3)*200)+i*53)%(88+60))-30+y0;bc.fillRect(8+i*13,y,2,30+(i%4)*10)}
    const sc=3.6+Math.max(0,.2-p)*3;cutChar(cut.h,-30-(1-ex)*120,y0+44-34*sc,sc,1);bc.fillStyle='rgba(0,0,0,.22)';bc.fillRect(0,y0,360,h)}
  else{bc.fillStyle='rgba(255,255,255,.07)';for(let yy=0;yy<150;yy+=8)for(let xx=((yy/8)%2)*4;xx<360;xx+=8)bc.fillRect(xx,yy,2,2);
    bc.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<14;i++){const x=360-((t*(500+(i%4)*160)+i*97)%520);bc.fillRect(x,y0+((i*29)%88),70+(i%3)*40,2)}
    const sc=2.3,x=8-(1-ex)*190,y=y0+44-31*sc+(p>.22?Math.sin(t*14):0);
    for(let k=3;k>=1;k--){bc.globalAlpha=.18*(4-k)*(1-ex*.7);cutChar(cut.h,x-k*14*(1-ex),y,sc)}bc.globalAlpha=1;cutChar(cut.h,x,y,sc,1)}
  cutTxtOld(p,ex,t,y0,col);bc.restore();
  bc.fillStyle=col;bc.fillRect(0,y0-3,360,3);bc.fillRect(0,y0+h,360,3);
  bc.fillStyle='#fff';for(let i=0;i<24;i++)if((i+Math.floor(t*14))%2==0){bc.fillRect(i*15+4,y0-3,5,3);bc.fillRect(i*15+4,y0+h,5,3)}
  if(p>.6&&p<.72){bc.fillStyle='rgba(255,255,255,'+(.8-(p-.6)*6)+')';bc.fillRect(0,y0,360,h)}}
{const o=drawCut;drawCut=function(t){if(!cut)return;if(cut.v==null)cut.v=gkPick([.4,.3,.3]);if(cut.v<0)return o.apply(this,arguments);try{return drawCutV(t)}catch(e){cut.v=-1;return o.apply(this,arguments)}}}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{chDrawSB(t)}catch(e){CHR.sb.length=0}return r}}
