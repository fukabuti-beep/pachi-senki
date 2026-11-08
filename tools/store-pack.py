# store-shots.js で撮った PNG を、BOOTH 用の JPEG(幅1080)と横長のまとめ画像 0-header.jpg にする
#   node tools/store-shots.js && python3 tools/store-pack.py
from PIL import Image
import os, glob
d = os.path.join(os.path.dirname(__file__), '..', 'store', 'shots')
names = ['1-play', '2-bighit', '3-rush', '4-jackpot', '5-menu']
ims = [Image.open(f'{d}/6.9-{n}.png').convert('RGB') for n in names]
for f in glob.glob(d + '/*.png'): os.remove(f)
W = 1080
for n, im in zip(names, ims): im.resize((W, int(im.height * W / im.width)), Image.LANCZOS).save(f'{d}/{n}.jpg', quality=88)
s = 0.36; w = int(ims[0].width * s); h = int(ims[0].height * s); pad = 24
c = Image.new('RGB', (w * 5 + pad * 6, h + pad * 2), (10, 7, 32))
for i, im in enumerate(ims): c.paste(im.resize((w, h), Image.LANCZOS), (pad + i * (w + pad), pad))
c.save(f'{d}/0-header.jpg', quality=88); print('packed', d)
