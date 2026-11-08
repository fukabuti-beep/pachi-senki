import sys
from PIL import Image
from collections import deque
# 使い方: python3 tools/cutout.py <元画像フォルダ>  (1.webp=3人並び, 2/3/4.webp=剣士/魔法使い/弓使い)
# 背景(外周の色)を透明にして縮小し src/img/ に書き出す。build.js が data URI として埋め込む
import os
src=sys.argv[1].rstrip('/')+'/'
out=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','src','img')+'/'
def proc(fn,size,name,tol=26,holes=False):
    im=Image.open(src+fn).convert('RGB');im=im.resize(size,Image.LANCZOS);W,H=im.size;px=im.load()
    a=Image.new('L',(W,H),255);ap=a.load()
    # 背景の基準色 = 外周の中央値
    edge=[px[x,0] for x in range(W)]+[px[x,H-1] for x in range(W)]+[px[0,y] for y in range(H)]+[px[W-1,y] for y in range(H)]
    ref=tuple(sorted(c[i] for c in edge)[len(edge)//2] for i in range(3))
    near=lambda c:sum((c[i]-ref[i])**2 for i in range(3))<tol*tol
    seen=bytearray(W*H);q=deque()
    for x in range(W):
        for y in (0,H-1): q.append((x,y))
    for y in range(H):
        for x in (0,W-1): q.append((x,y))
    while q:
        x,y=q.popleft();i=y*W+x
        if seen[i]:continue
        seen[i]=1
        if not near(px[x,y]):continue
        ap[x,y]=0
        for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
            nx,ny=x+dx,y+dy
            if 0<=nx<W and 0<=ny<H and not seen[ny*W+nx]:q.append((nx,ny))
    # 外周とつながらない「囲まれた背景」(弓と弦の間など): 背景色に近い大きな連結領域も透明に
    lab=bytearray(W*H)
    for sy in range(H):
        for sx in range(W):
            i0=sy*W+sx
            if lab[i0] or ap[sx,sy]==0 or not near(px[sx,sy]):continue
            comp=[];q2=deque([(sx,sy)]);lab[i0]=1
            while q2:
                x,y=q2.popleft();comp.append((x,y))
                for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
                    nx,ny=x+dx,y+dy
                    if 0<=nx<W and 0<=ny<H and not lab[ny*W+nx] and ap[nx,ny] and near(px[nx,ny]):lab[ny*W+nx]=1;q2.append((nx,ny))
            if holes and len(comp)>300:
                for x,y in comp:ap[x,y]=0
    # 孤立した小さな粒(背景の装飾ドット)も消す: 不透明画素のうち周囲8近傍の不透明が2以下
    for y in range(1,H-1):
        for x in range(1,W-1):
            if ap[x,y] and sum(1 for dx in(-1,0,1) for dy in(-1,0,1) if (dx or dy) and ap[x+dx,y+dy])<=2: ap[x,y]=0
    im.putalpha(a);im.save(out+name+'.webp','WEBP',quality=82,method=6)
    print(name,ref,im.size,'transparent%',round(100*sum(1 for v in a.getdata() if v==0)/(W*H)))
proc('2.webp',(320,320),'hero0')
proc('3.webp',(320,320),'hero1')
proc('4.webp',(320,320),'hero2',holes=True)
proc('1.webp',(720,271),'trio')
