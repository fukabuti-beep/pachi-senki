/* ---------- JACKPOT の超必殺技 (fx) ----------
   777 の押せ!! の後(87 jpRush)、UJ.p=20% で前置きアニメの代わりに「超必殺技」: 溜め → 暗転 → カットイン(提供イラスト PIMGI / なければ 83b の PORT / SPR)
   → 画面を横切る大技(剣士=巨大な斬撃 / 魔法使い=極太ビーム / 弓使い=巨大な矢と矢の雨)→ 着弾の瞬間に jackpot()。
   UJ.fail=30% で不発: 撃とうとして「プスン…」→「不発!?」→「…でも JACKPOT!!」で jackpot()。どちらも jackpot() を1回呼ぶだけなので報酬は同じ。
   従来の前置き(そのまま/777叩きつけ/カウントダウン)は残り80%でそのまま出る(置き換えではなくバリエーション)。
   89c の交通整理: 主役の演出として lyBig/lyBusyB に参加(ミニゲームは待つ・ボーナス帯は引っ込む)。
   全画面の点滅はしない(暗転は不透明度を上げ下げするだけ、着弾は局所の衝撃リング)。転生(PGEN)で即消える(jackpot は呼ばない)。
   UJ.force = 0(成功) / 1(不発) で次の JACKPOT を固定、UJ.hero で英雄を固定(テスト用)。 */
const UJ={s:null,p:.2,fail:.3,force:null,hero:null,pp:[],n:0,nf:0};
const UJN=[['真・天地一閃','剣士'],['極大魔法 星墜とし','魔法使い'],['神弓 千ノ流星','弓使い']],UJC=['#ff7a45','#b57bff','#4dff8a'];
function ujStart(){const f=UJ.force,h=UJ.hero!=null?UJ.hero:Math.floor(Math.random()*3),fail=f!=null?f===1:Math.random()<UJ.fail;UJ.force=null;UJ.n++;if(fail)UJ.nf++;
  UJ.s={t0:T,h,fail,g:PGEN,st:0,jp:0};UJ.pp.length=0;seHy('charge',1.1);try{showMsg('超必殺技!?','#ffd400')}catch(e){}}
{const o=jpRush;jpRush=function(){try{if(!UJ.s&&(UJ.force!=null||(HEV.jv==null&&Math.random()<UJ.p))){ujStart();return}}catch(e){}return o.apply(this,arguments)}}
// 89c(交通整理)に「主役の演出」として参加
try{const o=lyBig;lyBig=function(){return !!UJ.s||o.apply(this,arguments)}}catch(e){}
try{const o=lyBusyB;lyBusyB=function(){return !!UJ.s||o.apply(this,arguments)}}catch(e){}
function ujJP(){const U=UJ.s;if(!U||U.jp)return;U.jp=1;jackpot()}
function ujUpd(dt){const U=UJ.s;if(!U)return;if(U.g!==PGEN){UJ.s=null;UJ.pp.length=0;return}const p=T-U.t0,ex=262,ey=80;
  // 溜めの粒(画面の端から英雄へ集まる)
  if(p<1.1&&UJ.pp.length<40&&Math.random()<dt*40){const a=Math.random()*TAU;UJ.pp.push({a,r:150+Math.random()*60,v:180+Math.random()*120})}
  for(let i=UJ.pp.length-1;i>=0;i--){const q=UJ.pp[i];q.r-=q.v*dt;if(q.r<6)UJ.pp.splice(i,1)}
  const st=p<1.1?0:p<1.35?1:p<2.25?2:3;
  if(st>U.st){U.st=st;if(st==2)seHy('cut');if(st==3){if(U.fail){seHy('fail');try{showMsg('不発!?','#9aa0c8')}catch(e){}}else seHy('fire',U.h)}}
  if(!U.fail){if(p>=2.95&&!U.jp){ujJP();seHy('hit');try{lyImpact('b',ex,ey,'#ffd400',1);lyImpact('b',ex,ey,UJC[U.h],0);lyStop(.15)}catch(e){}burst(ex,ey,hyLite()?12:40,UJC[U.h]);if(!hyLite())shake()}
    if(p>=3.75)UJ.s=null}
  else{if(p>=3.25&&!U.jp){ujJP();seHy('bigwin');try{lyImpact('b',180,80,'#ffd400',1)}catch(e){}}if(p>=3.7)UJ.s=null}}
function ujHue(t,o){return 'hsl('+Math.floor(t*(hyLite()?60:220)+(o||0))%360+',100%,62%)'}
function ujDraw(t){const U=UJ.s;if(!U)return;const p=t-U.t0,h=U.h,col=UJC[h],hxp=6+h*46+32,hyp=52+36,lite=hyLite();
  // 暗さ(ゆっくり上下するだけ)
  const dk=p<1.1?p/1.1*.6:p<1.35?.6+(p-1.1)/.25*.32:U.fail?(p<2.25?.92:p<3.25?Math.max(.55,.92-(p-2.25)*.6):Math.max(0,.55-(p-3.25)*1.3)):(p<2.95?.92:Math.max(0,.92-(p-2.95)*1.3));
  bc.save();bc.fillStyle='rgba(0,0,8,'+Math.max(0,Math.min(.95,dk)).toFixed(3)+')';bc.fillRect(0,0,360,150);bc.imageSmoothingEnabled=false;
  // 溜め: 英雄を明るく描き直し+オーラ+集まる粒+ゲージ
  if(p<1.35||(U.fail&&p>=2.25&&p<3.25)){const spr=SPR['h'+h+(U.fail&&p>=2.25?'b':'s')]||SPR['h'+h];const r=22+Math.min(1,p/1.1)*16+Math.sin(t*5)*2;
    bc.globalAlpha=.35;bc.fillStyle=col;bc.beginPath();bc.arc(hxp,hyp,r,0,TAU);bc.fill();bc.globalAlpha=.25;bc.fillStyle='#fff';bc.beginPath();bc.arc(hxp,hyp,r*.6,0,TAU);bc.fill();bc.globalAlpha=1;
    if(spr)bc.drawImage(spr,hxp-32,52+(p<1.35?Math.round(Math.sin(t*30)*(p/1.35)):0),64,64);
    for(const q of UJ.pp){bc.fillStyle=col;bc.fillRect(Math.round(hxp+Math.cos(q.a)*q.r),Math.round(hyp+Math.sin(q.a)*q.r*.6),3,3)}
    if(p<1.35){const g=Math.min(1,p/1.1);bc.fillStyle='#000';bc.fillRect(130,118,200,10);bc.fillStyle=col;bc.fillRect(132,120,Math.round(196*g),6);bc.textAlign='left';hyTxtB('超必殺技 CHARGE',132,112,12,'#fff')}}
  // カットイン
  if(p>=1.35&&p<2.25){const q=p-1.35,open=Math.min(1,q/.12),close=q>.78?Math.max(0,(.9-q)/.12):1,H=Math.round(104*open*close),y0=75-(H>>1);
    bc.fillStyle='#120630';bc.fillRect(0,y0,360,H);bc.save();bc.beginPath();bc.rect(0,y0,360,H);bc.clip();
    bc.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<16;i++){const x=360-((t*(640+(i%4)*170)+i*91)%560);bc.fillRect(x,y0+((i*31)%104),80+(i%3)*40,2)}
    bc.globalAlpha=.35;bc.fillStyle=col;bc.fillRect(0,y0+H-26,360,26);bc.globalAlpha=1;
    const e=Math.min(1,q/.2),ee=1-Math.pow(1-e,3),sc=2.6;try{if(typeof cutChar==='function')cutChar(h,-10-(1-ee)*160,y0+52-31*sc,sc,1)}catch(e2){}
    const tx=Math.round(352-(1-ee)*200);bc.textAlign='right';hyTxtB('★ 超必殺技 ★',tx,y0+24,13,'#ffd400');hyTxtB(UJN[h][0],tx,y0+64,UJN[h][0].length>7?22:28,'#fff');bc.restore();
    bc.fillStyle=col;bc.fillRect(0,y0-3,360,3);bc.fillRect(0,y0+H,360,3)}
  // 大技(成功)
  if(!U.fail&&p>=2.25&&p<3.1){const q=(p-2.25)/.7;
    if(h==0){const x=-120+q*600;for(let k=4;k>=0;k--){bc.globalAlpha=k?.18:1;bc.strokeStyle=k?col:'#fff';bc.lineWidth=k?14:8;bc.beginPath();bc.arc(x-k*26,75,62,-1.25,1.25);bc.stroke()}bc.globalAlpha=1;bc.strokeStyle='#ffd400';bc.lineWidth=3;bc.beginPath();bc.arc(x+6,75,68,-1.1,1.1);bc.stroke()}
    else if(h==1){const len=Math.min(1,q*2.2)*400,y=75;bc.fillStyle=col;bc.fillRect(0,y-22,len,44);bc.fillStyle='#e8d8ff';bc.fillRect(0,y-12,len,24);bc.fillStyle='#fff';bc.fillRect(0,y-5,len,10);
      bc.fillStyle='#fff';for(let i=0;i<14;i++){const xx=(i*37+t*900)%Math.max(1,len);bc.fillRect(Math.round(xx),y-22+((i*13)%44),6,2)}}
    else{const x=-80+q*560;bc.globalAlpha=.35;bc.fillStyle=col;bc.fillRect(x-220,66,200,18);bc.globalAlpha=1;bc.fillStyle='#fff';bc.fillRect(x-130,71,130,8);bc.fillStyle='#000';bc.beginPath();bc.moveTo(x-4,54);bc.lineTo(x+46,75);bc.lineTo(x-4,96);bc.closePath();bc.fill();bc.fillStyle=col;bc.beginPath();bc.moveTo(x,58);bc.lineTo(x+40,75);bc.lineTo(x,92);bc.closePath();bc.fill();bc.fillStyle='#fff';bc.fillRect(x-150,64,20,4);bc.fillRect(x-150,82,20,4);
      for(let i=0;i<12;i++){const ax=-60+((q*700+i*53)%480),ay=18+((i*29)%110);bc.fillStyle=i%2?col:'#fff';bc.fillRect(Math.round(ax-34),ay,34,3);bc.fillRect(Math.round(ax),ay-3,6,9)}}}
  // 不発
  if(U.fail&&p>=2.25){const q=p-2.25;
    if(q<1.0){for(let k=0;k<5;k++){const r=4+q*14+k*3;bc.globalAlpha=Math.max(0,.6-q*.4);bc.fillStyle='#8a8aa0';bc.beginPath();bc.arc(hxp+20+k*4,hyp-6-q*20-k*3,r,0,TAU);bc.fill()}bc.globalAlpha=1;
      const s=q<.15?2-q/.15:1,wob=lite?0:Math.sin(q*14)*.06;bc.save();bc.translate(220,70);bc.rotate(wob);bc.scale(s,s);bc.textAlign='center';hyTxtB('不発!?',0,0,36,'#9ab0d0');bc.restore();
      if(q>.6){bc.textAlign='center';hyTxtB('…でも',220,104,16,'#fff')}}
}
  // 着弾後は従来の JACKPOT 表示(80 jpShow)が主役。技名だけ下に残す
  if(!U.fail&&p>=2.95){bc.globalAlpha=Math.max(0,Math.min(1,(3.75-p)*3));bc.textAlign='center';hyTxtB('― '+UJN[h][0]+' ―',180,142,12,col)}
  bc.restore()}
function hyTxtB(s,x,y,px,fill){if(typeof thickTxt==='function')thickTxt(bc,s,x,y,px,fill,{d:px>=24?3:2,lw:px>=24?7:4});else{bc.font=px+'px '+FN;bc.fillStyle=fill;bc.fillText(s,x,y)}}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{ujUpd(dt)}catch(e){if(UJ.s){const U=UJ.s;UJ.s=null;if(!U.jp&&U.g===PGEN)jackpot()}}return r}}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{ujDraw(t)}catch(e){}return r}}
