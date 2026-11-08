/* ---------- キャラクター演出パック (fx) ----------
   1) 英雄のジャンプ/喜びポーズ: heroDY(i,t) を 35-battle-draw の drawHeroes が y に足す(1行フック)
   2) 吹き出しセリフ: リーチ/当たり/ハズレ/ボス出現・撃破/JACKPOT/遺物 などで英雄がしゃべる
   3) カットインのバリエーション: 1人 / 3人そろい踏み / ドアップ。キャラはカットインだけ等身イラスト(83b-portrait)、文字は従来の描き方
   どれも見た目だけ(当否・進行は変えない)。 */
const CHR={j:[null,null,null],sb:[],lastRs:null,lastHit:0};
const HLINE={
  hit:['よっしゃ!!','きたー!!','いくぞ!!','当たった!','最高!!'],
  reach:['来い!!','頼む…!','熱い!!','いけっ!','止まれ!'],
  miss:['くっ…','次こそ!','惜しい!','まだまだ!'],
  warn:['強敵だ!','気を付けろ!','燃えてきた!','でかいぞ!'],
  win:['勝った!!','楽勝!','見たか!','やったー!'],
  jp:['777!!!','大勝利!!','すごすぎ!','伝説だ!'],
  relic:['お宝だ!','いい物だ!','光ってる!'],
  rush:['連チャン!','止まらない!','まだ続く!']};
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
function chSayAll(key){const used=new Set();for(let i=0;i<3;i++){let s=chPick(HLINE[key]);for(let k=0;k<3&&used.has(s);k++)s=chPick(HLINE[key]);used.add(s);setTimeout(()=>{try{chSay(i,s)}catch(e){}},i*180)}}
function chDrawSB(t){for(let k=CHR.sb.length-1;k>=0;k--){const b=CHR.sb[k],p=t-b.t0;if(p>b.d){CHR.sb.splice(k,1);continue}
  const s=p<.1?.5+p*5:1,a=Math.min(1,(b.d-p)*4),cy=[22,42,22][b.i];bc.font='11px '+FN;const w=Math.max(34,b.txt.length*11+10),h=18,cx=Math.max(w/2+3,Math.min(357-w/2,hx(b.i)+32+(b.i==0?6:b.i==2?-6:0)));bc.save();bc.globalAlpha=a;bc.translate(cx,cy);bc.scale(s,s);
  bc.fillStyle='#000';bc.fillRect(-w/2-1,-h/2-1,w+2,h+2);bc.fillStyle='#fff';bc.fillRect(-w/2,-h/2,w,h);bc.fillStyle='#000';bc.fillRect(-3,h/2,6,2);bc.fillRect(-2,h/2+2,4,2);bc.fillRect(-1,h/2+4,2,2);bc.fillStyle='#fff';bc.fillRect(-2,h/2,4,1);bc.fillRect(-1,h/2+2,2,1);
  bc.fillStyle='#d8dcff';bc.fillRect(-w/2,h/2-3,w,3);bc.textAlign='center';bc.fillStyle='#14021f';bc.fillText(b.txt,0,4);bc.restore()}}
// イベントのフック(本体は変更しない)
{const o=bigHit;bigHit=function(jp){const r=o.apply(this,arguments);try{chJumpAll(jp?2:1);if(jp)chSayAll('jp');else if(G.combo>=2&&Math.random()<.6)chSay(Math.floor(Math.random()*3),chPick(HLINE.rush));else chSay(Math.floor(Math.random()*3),chPick(HLINE.hit))}catch(e){}return r}}
{const o=kill;kill=function(){const wb=isBoss();const r=o.apply(this,arguments);try{if(wb&&run){chJumpAll(2);setTimeout(()=>{try{chSayAll('win')}catch(e){}},500)}else if(run&&Math.random()<.08)chJump(Math.floor(Math.random()*3),0)}catch(e){}return r}}
{const o=spawn;spawn=function(){const r=o.apply(this,arguments);try{if(isBoss()&&run)setTimeout(()=>{try{chSay(1,chPick(HLINE.warn),1.8)}catch(e){}},900)}catch(e){}return r}}
function chUpd(){const s=sp;
  if(s&&s.type&&s.t>1.9&&CHR.lastRs!==s){CHR.lastRs=s;if(s.type==2||Math.random()<.5){chSay(Math.floor(Math.random()*3),chPick(HLINE.reach));chJump(Math.floor(Math.random()*3),0)}}
  if(CHR.lastRs&&CHR.lastRs!==s){const was=CHR.lastRs;CHR.lastRs=null;if(!was.hit&&was.type==2&&Math.random()<.7)chSay(Math.floor(Math.random()*3),chPick(HLINE.miss))}
  if(typeof RDR!=='undefined'&&RDR.show&&RDR.show.t0>CHR.lastRelic){CHR.lastRelic=RDR.show.t0;chJumpAll(1);chSay(0,chPick(HLINE.relic))}}
CHR.lastRelic=-1;
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{chUpd()}catch(e){}return r}}
// 3) カットインのバリエーション(従来=0 / そろい踏み=1 / ドアップ=2)。cb と終了タイミングは従来と同じ(.65秒で cb、1.0秒で終了)
function cutTxtOld(p,ex,t,y0,col){const tx=Math.round(350-(1-ex)*220+(p>.45?Math.sin(t*60)*1.5:0)),ty=y0+60;
  bc.font='40px '+FN;bc.textAlign='right';bc.lineJoin='round';bc.lineWidth=9;bc.strokeStyle='#000';
  bc.strokeText(cut.txt,tx+3,ty+3);bc.fillStyle=col;bc.fillText(cut.txt,tx+3,ty+3);bc.strokeText(cut.txt,tx,ty);bc.fillStyle='#fff';bc.fillText(cut.txt,tx,ty);
  bc.font='12px '+FN;bc.fillStyle=col;bc.fillText('★ CHANCE ★',tx,y0+24)}
// カットインのキャラ: 等身イラスト(83b-portrait)。生成できない環境では従来のデフォルメ SPR
function cutChar(i,x,y,sc){const P=typeof PORT==='function'?PORT(i):null;if(P){bc.drawImage(P,Math.round(x),Math.round(y),Math.round(64*sc),Math.round(72*sc));return}const spr=SPR['h'+i+'s'];if(spr)bc.drawImage(spr,Math.round(x),Math.round(y+20*sc),Math.round(64*sc),Math.round(64*sc))}
function drawCutV(t){const p=t-cut.t0,D=1.0;if(p>D){cut=null;return}
  if(p>.65&&!cut.f){cut.f=1;cut.cb()}
  const open=Math.min(1,p/.1),close=p>D-.12?Math.max(0,(D-p)/.12):1,h=Math.round(88*open*close),y0=76-(h>>1),col=cut.c;
  bc.save();let g=cut.g;if(!g){g=cut.g=bc.createLinearGradient(0,0,360,0);g.addColorStop(0,'#05030f');g.addColorStop(.45,'#1a0b3a');g.addColorStop(1,col)}
  bc.globalAlpha=.94;bc.fillStyle=g;bc.fillRect(0,y0,360,h);bc.globalAlpha=1;bc.beginPath();bc.rect(0,y0,360,h);bc.clip();
  const e=Math.min(1,p/.22),ex=1-Math.pow(1-e,3);bc.imageSmoothingEnabled=false;
  if(cut.v==1){bc.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<14;i++){const x=360-((t*(520+(i%4)*150)+i*97)%520);bc.fillRect(x,y0+((i*29)%88),60+(i%3)*40,2)}
    for(let i=0;i<3;i++){const q=Math.max(0,Math.min(1,(p-i*.07)/.2)),qe=1-Math.pow(1-q,3),sc=1.6,x=-110+qe*(110+i*60),y=y0+44-31*sc+Math.sin(t*14+i)*1.5;
      for(let k=2;k>=1;k--){bc.globalAlpha=.2*(1-qe);cutChar(i,x-k*16,y,sc)}bc.globalAlpha=1;cutChar(i,x,y,sc)}}
  else if(cut.v==2){bc.fillStyle='rgba(255,255,255,.45)';for(let i=0;i<18;i++){const y=((t*(600+(i%3)*200)+i*53)%(88+60))-30+y0;bc.fillRect(8+i*13,y,2,30+(i%4)*10)}
    const sc=3.6+Math.max(0,.2-p)*3;cutChar(cut.h,-30-(1-ex)*120,y0+44-34*sc,sc);bc.fillStyle='rgba(0,0,0,.22)';bc.fillRect(0,y0,360,h)}
  else{bc.fillStyle='rgba(255,255,255,.07)';for(let yy=0;yy<150;yy+=8)for(let xx=((yy/8)%2)*4;xx<360;xx+=8)bc.fillRect(xx,yy,2,2);
    bc.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<14;i++){const x=360-((t*(500+(i%4)*160)+i*97)%520);bc.fillRect(x,y0+((i*29)%88),70+(i%3)*40,2)}
    const sc=2.3,x=8-(1-ex)*190,y=y0+44-31*sc+(p>.22?Math.sin(t*14):0);
    for(let k=3;k>=1;k--){bc.globalAlpha=.18*(4-k)*(1-ex*.7);cutChar(cut.h,x-k*14*(1-ex),y,sc)}bc.globalAlpha=1;cutChar(cut.h,x,y,sc)}
  cutTxtOld(p,ex,t,y0,col);bc.restore();
  bc.fillStyle=col;bc.fillRect(0,y0-3,360,3);bc.fillRect(0,y0+h,360,3);
  bc.fillStyle='#fff';for(let i=0;i<24;i++)if((i+Math.floor(t*14))%2==0){bc.fillRect(i*15+4,y0-3,5,3);bc.fillRect(i*15+4,y0+h,5,3)}
  if(p>.6&&p<.72){bc.fillStyle='rgba(255,255,255,'+(.8-(p-.6)*6)+')';bc.fillRect(0,y0,360,h)}}
{const o=drawCut;drawCut=function(t){if(!cut)return;if(cut.v==null)cut.v=gkPick([.4,.3,.3]);if(cut.v<0)return o.apply(this,arguments);try{return drawCutV(t)}catch(e){cut.v=-1;return o.apply(this,arguments)}}}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{chDrawSB(t)}catch(e){CHR.sb.length=0}return r}}
