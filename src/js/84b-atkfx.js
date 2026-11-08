/* ---------- 攻撃モーションのバリエーション (fx) ----------
   heroAtk をラップし、一定確率で各キャラ固有の特殊モーションに差し替えて見せる(ダメージは従来どおり。見た目だけ)。
   剣士: ジャンプ斬り / 回転斬り / 二段斬り   魔法使い: 魔法陣詠唱 / 魔力爆発   弓使い: バックステップ三連射 / 矢の雨
   位置は heroDX/heroDY(35-battle-draw の drawHeroes に1行フック)で動かし、エフェクトは drawB の後に重ねる。 */
const AMV={m:[null,null,null],fx:[]};
const AMK=[['jump','spin','double'],['cast','nova'],['back','rain']];
const AMD={jump:.5,spin:.45,double:.5,cast:.6,nova:.5,back:.5,rain:.65};
{const o=heroAtk;heroAtk=function(i){const r=o.apply(this,arguments);try{if(!AMV.m[i]&&Math.random()<(G.rush>0?.45:.3)){const k=AMK[i][Math.floor(Math.random()*AMK[i].length)];AMV.m[i]={k,t0:T}}}catch(e){}return r}}
function amP(i,t){const M=AMV.m[i];if(!M)return -1;const p=(t-M.t0)/AMD[M.k];if(p>=1){AMV.m[i]=null;return -1}return p}
function heroDX(i,t){const p=amP(i,t);if(p<0)return 0;const k=AMV.m[i].k,s=Math.sin(p*Math.PI);
  return Math.round(k=='jump'?s*70:k=='spin'?s*90:k=='double'?(p<.5?Math.sin(p*2*Math.PI)*60:Math.sin((p-.5)*2*Math.PI)*80):k=='nova'?s*10:k=='back'?-s*18:0)}
// 84-charfx の heroDY(ジャンプ)に特殊モーションの上下動を足す
{const o=heroDY;heroDY=function(i,t){let d=o(i,t);const p=amP(i,t);if(p>=0){const k=AMV.m[i].k,s=Math.sin(p*Math.PI);d+=Math.round(k=='jump'?-s*34:k=='cast'?-s*12:k=='nova'?-s*8:k=='back'?-s*10:k=='rain'?-s*16:0)}return d}}
function amSnd(f,d,ty,v,f2){try{if(sOK())tone(f,sNow(),d,ty,v,f2)}catch(e){}}
function amDraw(t){
  for(let i=0;i<3;i++){const M=AMV.m[i];if(!M)continue;const p=(t-M.t0)/AMD[M.k];if(p>=1)continue;const k=M.k,hx0=hx(i)+32+heroDX(i,t),hy0=84+heroDY(i,t);
    if(!M.snd&&p>.3){M.snd=1;amSnd(k=='nova'||k=='cast'?660:k=='rain'||k=='back'?1320:180,.12,k=='jump'||k=='spin'||k=='double'?'sawtooth':'square',.03,k=='nova'?1320:k=='jump'?90:undefined)}
    bc.save();
    if(k=='jump'&&p>.45){const q=(p-.45)/.55;bc.globalAlpha=1-q;bc.strokeStyle='#fff';bc.lineWidth=5;bc.beginPath();bc.arc(hx0+24,hy0-6,26+q*10,-1.2,1.6);bc.stroke();bc.strokeStyle='#ffa070';bc.lineWidth=2;bc.beginPath();bc.arc(hx0+24,hy0-6,20+q*10,-1.2,1.6);bc.stroke()}
    if(k=='spin'){bc.globalAlpha=.8*Math.sin(p*Math.PI);bc.strokeStyle='#fff';bc.lineWidth=4;bc.beginPath();bc.arc(hx0,hy0,34,p*12,p*12+4);bc.stroke();bc.strokeStyle='#ff7a45';bc.lineWidth=2;bc.beginPath();bc.arc(hx0,hy0,28,p*12+1,p*12+5);bc.stroke()}
    if(k=='double'){for(const c of [.25,.75]){const q=(p-c)/.2;if(q>0&&q<1){bc.globalAlpha=1-q;bc.strokeStyle='#fff';bc.lineWidth=4;bc.beginPath();bc.moveTo(hx0+10,hy0-30+q*10);bc.lineTo(hx0+50,hy0+20+q*10);bc.stroke()}}}
    if(k=='cast'){const r=26+Math.sin(p*Math.PI)*6;bc.globalAlpha=Math.sin(p*Math.PI);bc.strokeStyle='#6fe3ff';bc.lineWidth=2;bc.beginPath();bc.ellipse(hx0,116,r,r*.3,0,0,TAU);bc.stroke();bc.beginPath();bc.ellipse(hx0,116,r*.7,r*.21,0,0,TAU);bc.stroke();
      for(let s=0;s<6;s++){const a=p*8+s*TAU/6;bc.fillStyle=s%2?'#fff':'#b57bff';bc.fillRect(Math.round(hx0+Math.cos(a)*r)-1,Math.round(116+Math.sin(a)*r*.3)-1,3,3);bc.fillRect(Math.round(hx0+Math.cos(a)*14)-1,Math.round(hy0-40-p*20-s*3),2,2)}}
    if(k=='nova'&&p>.3){const q=(p-.3)/.7;bc.globalAlpha=1-q;bc.strokeStyle='#b57bff';bc.lineWidth=6*(1-q)+1;bc.beginPath();bc.arc(hx0+20,hy0-10,8+q*60,0,TAU);bc.stroke();bc.strokeStyle='#fff';bc.lineWidth=2;bc.beginPath();bc.arc(hx0+20,hy0-10,4+q*44,0,TAU);bc.stroke()}
    if(k=='back'){for(let a=0;a<3;a++){const q=(p-.3-a*.1)/.35;if(q>0&&q<1){const x=hx0+20+q*(240-hx0),y=hy0-8+(a-1)*8+Math.sin(q*Math.PI)*-6;bc.globalAlpha=1;bc.fillStyle='#e8e0c0';bc.fillRect(Math.round(x)-12,Math.round(y),12,2);bc.fillStyle='#9bff6b';bc.fillRect(Math.round(x),Math.round(y)-1,3,4)}}}
    if(k=='rain'&&p>.25){for(let a=0;a<7;a++){const q=Math.min(1,(p-.25-a*.04)/.35);if(q<=0)continue;const x=230+a*9,y=-10+q*90;bc.globalAlpha=q<1?1:Math.max(0,1-(p-.25-a*.04-.35)*5);bc.fillStyle='#e8e0c0';bc.fillRect(x,Math.round(y)-12,2,12);bc.fillStyle='#9bff6b';bc.fillRect(x-1,Math.round(y),4,3)}}
    bc.restore()}}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{amDraw(t)}catch(e){AMV.m=[null,null,null]}return r}}
