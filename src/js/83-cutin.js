/* ---------- cutin: 大当たり/必殺技のカットイン描画 (battle canvas 360x150) ----------
   cutin(h,txt,c,cb) は 30-battle.js。ここは描画のみ: 帯が開く→英雄がスライドイン(残像)→巨大文字→白フラッシュ→cb→帯が閉じる */
function drawCut(t){if(!cut)return;const p=t-cut.t0,D=1.0;if(p>D){cut=null;return}
 if(p>.65&&!cut.f){cut.f=1;cut.cb()}
 const open=Math.min(1,p/.1),close=p>D-.12?Math.max(0,(D-p)/.12):1,h=Math.round(88*open*close),y0=76-(h>>1),col=cut.c;
 bc.save();
 let g=cut.g;if(!g){g=cut.g=bc.createLinearGradient(0,0,360,0);g.addColorStop(0,'#05030f');g.addColorStop(.45,'#1a0b3a');g.addColorStop(1,col)}
 bc.globalAlpha=.94;bc.fillStyle=g;bc.fillRect(0,y0,360,h);bc.globalAlpha=1;
 bc.beginPath();bc.rect(0,y0,360,h);bc.clip();
 bc.fillStyle='rgba(255,255,255,.07)';for(let yy=0;yy<150;yy+=8)for(let xx=((yy/8)%2)*4;xx<360;xx+=8)bc.fillRect(xx,yy,2,2);
 bc.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<14;i++){const x=360-((t*(500+(i%4)*160)+i*97)%520);bc.fillRect(x,y0+((i*29)%88),70+(i%3)*40,2)}
 const e=Math.min(1,p/.22),ex=1-Math.pow(1-e,3),hx=Math.round(26-(1-ex)*180),spr=SPR['h'+cut.h+'s'];
 if(spr){for(let k=3;k>=1;k--){bc.globalAlpha=.18*(4-k)*(1-ex*.7);bc.drawImage(spr,Math.round(hx-k*14*(1-ex)),y0-4,96,96)}bc.globalAlpha=1;bc.drawImage(spr,hx,y0-4+Math.round(Math.sin(t*14)),96,96)}
 const tx=Math.round(350-(1-ex)*220+(p>.45?Math.sin(t*60)*1.5:0)),ty=y0+60;
 cutTxt(t,p,ex,tx,ty,y0,col);
 bc.restore();
 bc.fillStyle=col;bc.fillRect(0,y0-3,360,3);bc.fillRect(0,y0+h,360,3);
 bc.fillStyle='#fff';for(let i=0;i<24;i++)if((i+Math.floor(t*14))%2==0){bc.fillRect(i*15+4,y0-3,5,3);bc.fillRect(i*15+4,y0+h,5,3)}
 if(p>.6&&p<.72){bc.fillStyle='rgba(255,255,255,'+(.8-(p-.6)*6)+')';bc.fillRect(0,y0,360,h)}}
/* カットイン文字: 斜体+叩きつけ(拡大→着地のバウンド) / 上白・下色のツートン金属塗り / 押し出し+太縁(thickTxt) / 光の筋 / キラキラ。
   JACKPOT は虹色の外縁(色相が滑らかに回るだけ。明暗の点滅なし) */
function cutTxt(t,p,ex,tx,ty,y0,col){const txt=cut.txt,jp=/JACKPOT/.test(txt),px=44;
 const sl=p<.22?1+(1-ex)*1.3:1+(p<.32?Math.sin((p-.22)/.1*Math.PI)*.09:0);
 bc.save();bc.translate(tx-16,ty);if(bc.transform)bc.transform(1,0,-.2,1,0,0);bc.scale(sl,sl);bc.textAlign='right';bc.font=px+'px '+FN;bc.lineJoin='round';
 if(jp||p>.22){bc.lineWidth=17;bc.strokeStyle=jp?'hsl('+Math.floor(t*300)%360+',100%,60%)':col;bc.globalAlpha=jp?.95:.55;bc.strokeText(txt,0,0);bc.globalAlpha=1}
 let tg=cut.tg;if(!tg){tg=cut.tg=bc.createLinearGradient(0,-px*.8,0,px*.1);tg.addColorStop(0,'#ffffff');tg.addColorStop(.46,'#fffbe6');tg.addColorStop(.5,col);tg.addColorStop(1,col)}
 if(typeof thickTxt==='function')thickTxt(bc,txt,0,0,px,tg,{lw:11,ex:'#12021f',d:5});else{bc.lineWidth=9;bc.strokeStyle='#000';bc.strokeText(txt,0,0);bc.fillStyle=tg;bc.fillText(txt,0,0)}
 // 光の筋(文字の上だけを斜めに通過)
 if(p>.26&&p<.62){const sx=-330+(p-.26)/.36*380;bc.save();bc.beginPath();bc.moveTo(sx,-px);bc.lineTo(sx+26,-px);bc.lineTo(sx+10,px*.3);bc.lineTo(sx-16,px*.3);bc.closePath();bc.clip();bc.fillStyle='rgba(255,255,255,.9)';bc.fillText(txt,0,0);bc.restore()}
 bc.restore();
 // キラキラ(十字の星)
 if(p>.22){bc.fillStyle='#fff';for(let i=0;i<3;i++){const q=(t*3+i*.37)%1,s2=Math.round(6*Math.sin(q*Math.PI)),x=tx-20-i*85+(i%2)*30,y=ty-36+(i%2)*40;if(s2>0){bc.fillRect(x-s2,y,s2*2+1,1);bc.fillRect(x,y-s2,1,s2*2+1);bc.fillRect(x-1,y-1,3,3)}}}
 bc.textAlign='right';if(typeof thickTxt==='function')thickTxt(bc,'★ CHANCE ★',tx,y0+24,13,col,{d:2,lw:4});else{bc.font='12px '+FN;bc.fillStyle=col;bc.fillText('★ CHANCE ★',tx,y0+24)}}
