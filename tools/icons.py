#!/usr/bin/env python3
"""ゲーム内のドット絵スプライトからアプリアイコン(PNG)を生成する → src/pwa/icon-*.png
使い方: node tools/build.js && python3 tools/icons.py   (Playwright + Chrome が必要。生成物はコミット済みなので通常は不要)"""
import os, base64
from playwright.sync_api import sync_playwright
root = os.path.join(os.path.dirname(__file__), '..')
html = 'file://' + os.path.abspath(os.path.join(root, 'dist', 'pachi-senki.html'))
JS = """(size)=>{const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
const u=size/32;
// 背景: 放射状の筐体カラー+ドット格子
const g=x.createRadialGradient(size/2,size*.55,size*.05,size/2,size/2,size*.75);g.addColorStop(0,'#5a1f9e');g.addColorStop(.6,'#1b1356');g.addColorStop(1,'#0a0720');x.fillStyle=g;x.fillRect(0,0,size,size);
x.fillStyle='rgba(255,45,122,.22)';for(let i=0;i<16;i++){const a=i*Math.PI/8;x.beginPath();x.moveTo(size/2,size*.56);x.lineTo(size/2+Math.cos(a)*size,size*.56+Math.sin(a)*size);x.lineTo(size/2+Math.cos(a+Math.PI/16)*size,size*.56+Math.sin(a+Math.PI/16)*size);x.fill()}
// 電飾の縁(ドット)
for(let i=0;i<32;i++){x.fillStyle=i%2?'#ffd400':'#ff2d7a';[[i,0],[i,31],[0,i],[31,i]].forEach(p=>x.fillRect(p[0]*u,p[1]*u,u,u))}
// 赤い玉(中央下)+ 英雄
const r=u*8.5;const bx=size/2,by=size*.62;
const bg=x.createRadialGradient(bx-r*.35,by-r*.4,r*.1,bx,by,r);bg.addColorStop(0,'#fff0f0');bg.addColorStop(.25,'#ff6a7a');bg.addColorStop(.7,'#d0102c');bg.addColorStop(1,'#6a0018');
x.fillStyle='#000';x.beginPath();x.arc(bx,by,r+u,0,7);x.fill();x.fillStyle='#ffe56a';x.beginPath();x.arc(bx,by,r,0,7);x.fill();x.fillStyle=bg;x.beginPath();x.arc(bx,by,r-u*.8,0,7);x.fill();
const s=SPR.h0s,w=u*15;x.drawImage(s,size/2-w/2,size*.1,w,w);
// 文字
x.font=(u*5.2)+'px DotGothic16,monospace';x.textAlign='center';x.lineJoin='round';x.lineWidth=u*1.6;x.strokeStyle='#000';x.fillStyle='#ffd400';
x.strokeText('PACHI',size/2,size*.93);x.fillText('PACHI',size/2,size*.93);
return c.toDataURL('image/png')}"""
out = os.path.join(root, 'src', 'pwa'); os.makedirs(out, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(); pg.goto(html); pg.wait_for_timeout(800)
    for name, sz in [('icon-512', 512), ('icon-192', 192), ('apple-touch-icon', 180)]:
        d = pg.evaluate(JS, sz).split(',')[1]
        open(os.path.join(out, name + '.png'), 'wb').write(base64.b64decode(d)); print(name, sz)
    b.close()
