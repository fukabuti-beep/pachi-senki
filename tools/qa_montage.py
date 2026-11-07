#!/usr/bin/env python3
"""qa_shots.py の出力を1枚に並べる。 python3 tools/qa_montage.py DIR VP OUT.png scene1,scene2,... [cols]"""
import sys
from PIL import Image, ImageDraw
d, vp, out, scenes = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4].split(',')
cols = int(sys.argv[5]) if len(sys.argv) > 5 else len(scenes)
ims = [Image.open(f'{d}/{vp}_{s}.png') for s in scenes]
ims = [i.resize((i.width // 2, i.height // 2), Image.LANCZOS) for i in ims]
w, h = ims[0].size; rows = (len(ims) + cols - 1) // cols
M = Image.new('RGB', ((w + 6) * cols, (h + 6) * rows), (60, 60, 60))
for k, (s, i) in enumerate(zip(scenes, ims)):
    M.paste(i, ((k % cols) * (w + 6), (k // cols) * (h + 6)))
M.save(out)
