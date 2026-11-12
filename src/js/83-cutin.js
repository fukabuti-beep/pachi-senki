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
 if(spr){for(let k=3;k>=1;k--){bc.globalAlpha=.18*(4-k)*(1-ex*.7);bc.drawImage(spr,Math.round(hx-k*14*(1-ex)),y0-4,spr.width*3,96)}bc.globalAlpha=1;bc.drawImage(spr,hx,y0-4+Math.round(Math.sin(t*14)),spr.width*3,96)}
 const tx=Math.round(350-(1-ex)*220+(p>.45?Math.sin(t*60)*1.5:0)),ty=y0+60;
 bc.font='40px '+FN;bc.textAlign='right';bc.lineJoin='round';bc.lineWidth=9;bc.strokeStyle='#000';
 bc.strokeText(cut.txt,tx+3,ty+3);bc.fillStyle=col;bc.fillText(cut.txt,tx+3,ty+3);
 bc.strokeText(cut.txt,tx,ty);bc.fillStyle='#fff';bc.fillText(cut.txt,tx,ty);
 bc.font='12px '+FN;bc.fillStyle=col;bc.fillText('★ CHANCE ★',tx,y0+24);
 bc.restore();
 bc.fillStyle=col;bc.fillRect(0,y0-3,360,3);bc.fillRect(0,y0+h,360,3);
 bc.fillStyle='#fff';for(let i=0;i<24;i++)if((i+Math.floor(t*14))%2==0){bc.fillRect(i*15+4,y0-3,5,3);bc.fillRect(i*15+4,y0+h,5,3)}
 if(p>.6&&p<.72){bc.fillStyle='rgba(255,255,255,'+(.8-(p-.6)*6)+')';bc.fillRect(0,y0,360,h)}}
