/* ---------- 攻撃エフェクト (fx) ----------
   作り手の指摘「攻撃するモーションに対してのエフェクト」: 今までは3人とも同じ四角い光の弾だった → 英雄ごとの形に。見た目だけ(ダメージ・当たるタイミングは不変)。
   ① 振る瞬間 `atkSwing(i,x,y,d)`(35 の drawHeroes の1行フック): 剣=三日月の斬撃(白→橙→赤の3層が尾を引いて振り下ろされる)/ 杖=先端で回る魔法陣の粒と十字の光 / 弓=弦のしなりと放つ光
   ② 飛んでいく `atkProj(p,e,x,y)`(35 の PR 描画の1行フック): 剣=飛ぶ斬撃波(三日月)/ 杖=尾を引いてゆれる魔法の玉+回る粒 / 弓=矢(矢じり・軸・羽根)と風の筋
   ③ 当たった瞬間 `afxHit(i,crit)`(hurt をラップして色から英雄を見分ける): 剣=X字の斬り跡 / 杖=広がる輪と星 / 弓=つらぬく線と飛び散る破片 / 槍(98yb が呼ぶ)=氷の結晶。会心は大きく・白い十字の光
   作り方の決まり(エフェクトの考え方の要約。docs/DESIGN.md「エフェクトの考え方」):
     予兆(武器の先がキラッと光る 0.08秒)→ 発生(1〜2コマで一気に最大。白い大きな光)→ 余韻(破片が重力で落ちる・輪が広がって消える)。
     同じ瞬間に重ねる(白い光+形+破片+輪+音)。中心は白・外は濃い色(明るさの差で目を引く)。形で誰の攻撃か分かる(剣=弧と線/魔法=輪と星/矢=直線/槍=ひし形)。
     重い一撃ほど大きく(会心 x1.5、RUSH 中 x1.2)。ゲームの乱数 Math.random は使わない(当たりの出方を変えないため。ばらつきは時刻から作る)。
   すべて fillRect のドット(小さい四角)で描く。配列 AFX は上限 14。 */
const AFX=[];
const AFC=[['#ffffff','#ffb070','#ff5a3a'],['#ffffff','#7ff3ff','#b48cff'],['#ffffff','#caffb0','#3dd27f'],['#ffffff','#d8f4ff','#6ab0ff']];
function afxDot(x,y,s,c){bc.fillStyle=c;bc.fillRect(Math.round(x-s/2),Math.round(y-s/2),s,s)}
function afxStar(x,y,l,c){bc.fillStyle=c;l=Math.round(l);bc.fillRect(Math.round(x)-l,Math.round(y)-1,l*2+1,3);bc.fillRect(Math.round(x)-1,Math.round(y)-l,3,l*2+1);const m=Math.round(l*.5);bc.fillRect(Math.round(x)-m,Math.round(y)-m,m*2+1,m*2+1)}
const AFW=[[62,16],[84,36],[64,38]];   // 予兆の光る位置(武器の先。英雄の絵の左上から)
function atkSwing(i,x,y,d){if(d<0||d>=.3)return;const C=AFC[i],K=G.rush>0?1.2:1;
  if(d<.08){const q=d/.08,w=AFW[i];bc.globalAlpha=.9;afxStar(x+w[0],y+w[1],2+q*7,'#fff');bc.globalAlpha=.6;afxStar(x+w[0],y+w[1],1+q*4,C[1]);bc.globalAlpha=1;return}   // 予兆
  const q=(d-.08)/.22,e=1-Math.pow(1-q,3);
  if(i===0){const cx=x+54,cy=y+42,lead=-1.7+e*2.5;   // 大きな三日月: 5層が尾を引いて振り下ろされる
    for(let L=0;L<5;L++){const r=(54-L*5)*K,col=L<1?C[0]:L<3?C[1]:C[2];for(let k=0;k<22;k++){const a=lead-k*.085;if(a<-1.8)break;bc.globalAlpha=(1-k/22)*(1-q*.8);afxDot(cx+Math.cos(a)*r,cy+Math.sin(a)*r,L<2?5:4,col)}}
    bc.globalAlpha=(1-q)*.9;for(let k=0;k<6;k++){afxDot(cx+Math.cos(lead)*(20+k*7)*K,cy+Math.sin(lead)*(20+k*7)*K,4,'#fff')}
    for(let k=0;k<5;k++){const a=lead-.4-k*.3;bc.globalAlpha=(1-q)*.7;bc.fillStyle=C[1];bc.fillRect(Math.round(cx+Math.cos(a)*62*K),Math.round(cy+Math.sin(a)*62*K),Math.round(6+e*10),2)}}
  else if(i===1){const cx=x+84,cy=y+36;bc.globalAlpha=1-q*.7;   // 二重の魔法陣+十字の光
    for(let R=0;R<2;R++)for(let k=0;k<10;k++){const a=k*.628+(R?-1:1)*e*5,r=(8+R*8+e*10)*K;afxDot(cx+Math.cos(a)*r,cy+Math.sin(a)*r,R?3:4,C[1+(k+R)%2])}
    afxStar(cx,cy,(8+e*14)*K,'#fff');afxStar(cx,cy,(4+e*7)*K,C[1])}
  else if(i===2){const cx=x+94,cy=y+38;bc.globalAlpha=1-q;   // 放つ光・風の筋・弦のしなり
    afxStar(cx,cy,(10-q*6)*K,'#fff');for(let k=0;k<6;k++){bc.fillStyle=k%2?C[1]:C[0];bc.fillRect(Math.round(cx+4+e*30),Math.round(cy-10+k*4),Math.round((26-Math.abs(k-2.5)*6)*K),2)}
    for(let k=0;k<4;k++){afxDot(cx-6-k*5*e,cy-8+k*5,3,C[2])}}
  bc.globalAlpha=1}
function atkProj(p,e,x,y){const i=p.i,C=AFC[i]||AFC[0],t=p.t;
  if(i===0){for(let g=2;g>=0;g--){const gx=x-g*16;bc.globalAlpha=1-g*.33;   // 飛ぶ斬撃波(右にふくらむ三日月)
      for(let k=-8;k<=8;k++){const a=k*.17,r=20,px=gx+Math.cos(a)*r-12,py=y+Math.sin(a)*r*1.4,th=Math.max(1,7-Math.abs(k)*.75);bc.fillStyle=g?C[2]:C[1];bc.fillRect(Math.round(px-th),Math.round(py-1),Math.round(th+2),3);if(!g){bc.fillStyle=C[0];bc.fillRect(Math.round(px),Math.round(py-1),2,2)}}}}
  else if(i===1){const wy=y+Math.sin(t*40)*3;   // ゆれる魔法の玉
    for(let k=6;k>=1;k--){bc.globalAlpha=.75-k*.11;afxDot(x-k*9,wy+Math.sin(t*40-k*.7)*4,13-k*1.5,C[2])}
    bc.globalAlpha=1;afxDot(x,wy,16,C[2]);afxDot(x,wy,12,C[1]);afxDot(x-1,wy-1,6,C[0]);
    for(let k=0;k<3;k++){const a=t*26+k*2.09;afxDot(x+Math.cos(a)*14,wy+Math.sin(a)*14,3,'#fff')}}
  else{const ay=y+10*(1-e)-6;   // 矢: 弧を小さく、まっすぐ速く見せる
    bc.globalAlpha=.35;bc.fillStyle=C[1];bc.fillRect(Math.round(x-70),Math.round(ay-1),54,2);bc.fillRect(Math.round(x-52),Math.round(ay-5),30,2);bc.fillRect(Math.round(x-46),Math.round(ay+4),26,2);
    bc.globalAlpha=1;bc.fillStyle='#e8e0c0';bc.fillRect(Math.round(x-22),Math.round(ay-1),24,3);
    bc.fillStyle='#fff';bc.fillRect(Math.round(x+2),Math.round(ay-3),4,7);bc.fillRect(Math.round(x+6),Math.round(ay-1),3,3);
    bc.fillStyle=C[2];bc.fillRect(Math.round(x-27),Math.round(ay-4),7,3);bc.fillRect(Math.round(x-27),Math.round(ay+3),7,3)}
  bc.globalAlpha=1}
function afxHit(i,crit){if(AFX.length>=14)AFX.shift();AFX.push({i,t0:T,c:crit?1:0,s:(T*7.3)%6.28,k:(crit?1.5:1)*(G.rush>0?1.2:1)})}
{const HC={'#ffa070':0,'#9ff':1,'#bfa':2};const o=hurt;hurt=function(x,col,big,crit){try{if(col in HC)afxHit(HC[col],crit)}catch(e){}return o.apply(this,arguments)}}
function afxDraw(t){for(let n=AFX.length-1;n>=0;n--){const f=AFX[n],D=f.c?.5:.4,q=(T-f.t0)/D;if(q>=1||q<0){AFX.splice(n,1);continue}
    const C=AFC[f.i],ex=(typeof EXX!=='undefined'?EXX:262)-4,ey=84,k=f.k||1,a1=1-q,e=1-Math.pow(1-q,3),tt=(T-f.t0);
    // 発生: 最初の 0.07 秒は大きな白い光(一気に最大→すぐ引く)
    if(tt<.07){bc.globalAlpha=1;afxStar(ex,ey,(26-tt*200)*k,'#fff');afxStar(ex,ey,(14-tt*100)*k,C[1])}
    // 放射の線(発生の勢い)
    if(q<.5){bc.globalAlpha=1-q*2;for(let s=0;s<8;s++){const a=f.s+s*.785,r0=(12+e*30)*k,r1=r0+(10+e*8)*k;for(let r=r0;r<r1;r+=4)afxDot(ex+Math.cos(a)*r,ey+Math.sin(a)*r,3,s%2?C[0]:C[1])}}
    // 形(誰の攻撃か)
    if(f.i===0){for(let d=0;d<2;d++){const L=Math.min(1,q*4)*38*k,dx=d?1:-1;for(let s=-L;s<=L;s+=3){const w=(1-Math.abs(s)/(L+1));bc.globalAlpha=a1;afxDot(ex+s*dx*.8,ey+s*.9,Math.max(2,Math.round((q<.35?9:5)*w)),q<.25?C[0]:C[1])}}}
    else if(f.i===1){for(let R=0;R<2;R++){const r=(8+e*(40+R*-16))*k;for(let s=0;s<18;s++){const a=s*.349+f.s*(R?-1:1);bc.globalAlpha=a1;afxDot(ex+Math.cos(a)*r,ey+Math.sin(a)*r,q<.4?5:3,(s+R)%2?C[1]:C[2])}}
      for(let s=0;s<6;s++){const a=f.s+s*1.047+e,rr=(14+e*20)*k;bc.globalAlpha=a1;afxStar(ex+Math.cos(a)*rr,ey+Math.sin(a)*rr,(2+a1*5),s%2?'#fff':C[1])}}
    else if(f.i===2){bc.globalAlpha=a1;bc.fillStyle='#fff';bc.fillRect(Math.round(ex-44*k+e*20),ey-2,Math.round(88*k),5);bc.fillStyle=C[1];bc.fillRect(Math.round(ex-30*k+e*30),ey-5,Math.round(60*k),2);bc.fillRect(Math.round(ex-30*k+e*30),ey+4,Math.round(60*k),2)}
    else{for(let s=0;s<6;s++){const a=f.s+s*1.047,r=(10+e*40)*k,px=ex+Math.cos(a)*r,py=ey+Math.sin(a)*r,z=q<.4?4:3;bc.globalAlpha=a1;afxDot(px,py,z*2+1,C[2]);afxDot(px,py,z,C[0]);afxDot(px,py-z-2,z,C[1]);afxDot(px,py+z+2,z,C[1]);afxDot(px-z-2,py,z,C[1]);afxDot(px+z+2,py,z,C[1])}}
    // 余韻: 破片が飛んで重力で落ちる(英雄の色)
    for(let s=0;s<10;s++){const a=f.s*1.7+s*.63+(f.i===2?2.2:0),v=(26+((s*37)%23))*k,px=ex+Math.cos(a)*v*e,py=ey+Math.sin(a)*v*e*.8+q*q*46;bc.globalAlpha=a1;afxDot(px,py,q<.5?4:2,s%3?C[2]:C[1])}
    // 会心: 白い大きな十字+外の輪
    if(f.c){const l=Math.round(16+e*56);bc.globalAlpha=a1*.95;bc.fillStyle='#fff';bc.fillRect(ex-l,ey-2,l*2,5);bc.fillRect(ex-2,ey-l,5,l*2);bc.fillStyle='#ffd24d';bc.fillRect(ex-Math.round(l*.6),ey-1,Math.round(l*1.2),2);
      const r=20+e*50;for(let s=0;s<20;s++){const a=s*.314;afxDot(ex+Math.cos(a)*r,ey+Math.sin(a)*r*.8,3,'#ffd24d')}}}
  bc.globalAlpha=1}
{const o=drawB;drawB=function(t){const r=o.apply(this,arguments);try{afxDraw(t)}catch(e){AFX.length=0;bc.globalAlpha=1}return r}}
