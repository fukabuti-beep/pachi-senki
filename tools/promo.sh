#!/bin/sh
# 紹介動画の仕上げ: tools/promo.js が録った映像(raw.webm)とゲーム音(audio.webm)を合わせて mp4 にする
#   node tools/build.js && node tools/promo.js && sh tools/promo.sh  → store/promo/pachi-senki-promo.mp4
set -e
D="$(dirname "$0")/../store/promo"
OFF=$(python3 -c "import json;print(json.load(open('$D/meta.json'))['audioOffsetMs']/1000)" 2>/dev/null || echo 0)
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$D/raw.webm")
END=$(python3 -c "print(max(1,float('$DUR')-0.8))")
FO=$(python3 -c "print(max(0,float('$END')-1.2))")
ffmpeg -v error -y -i "$D/raw.webm" -itsoffset "$OFF" -i "$D/audio.webm" \
  -t "$END" -filter_complex "[0:v]fps=30,scale=720:-2:flags=lanczos,fade=t=in:st=0:d=0.4,fade=t=out:st=$FO:d=1.2[v];[1:a]loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.3,afade=t=out:st=$FO:d=1.2,apad[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -c:a aac -b:a 160k -shortest -movflags +faststart "$D/pachi-senki-promo.mp4"
ls -la "$D/pachi-senki-promo.mp4"
