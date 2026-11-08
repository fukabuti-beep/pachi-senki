# ドット文字フォント DotGothic16(SIL OFL 1.1)を、ゲームで使う文字だけに絞って src/font/DotGothic16-subset.woff2 を作る。
# build.js がこれを data URI で HTML に埋め込む(ネット無しでも同じ見た目。Google Fonts への通信も無くなる)。
# 文字を足したら作り直す:  pip install fonttools brotli
#   python3 tools/font-subset.py <DotGothic16-Regular.ttf のパス>
#   (TTF は https://raw.githubusercontent.com/google/fonts/main/ofl/dotgothic16/DotGothic16-Regular.ttf )
import sys, glob, os, subprocess, tempfile
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ttf = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__ or 'TTF のパスを指定してください')
chars = set(chr(c) for c in range(0x20, 0x7f))                                   # ASCII
chars |= set(chr(c) for c in range(0x3041, 0x3097)) | set(chr(c) for c in range(0x30a1, 0x30fb))   # ひらがな・カタカナ
chars |= set(chr(c) for c in range(0xff01, 0xff5f))                              # 全角英数記号
chars |= set('ー・「」『』、。　…～×÷★☆◆◇■□●○▲△▼▽←→↑↓♪♥♡々〆〇')
for f in glob.glob(os.path.join(root, 'src/js/*.js')) + glob.glob(os.path.join(root, 'src/css/*.css')) + [os.path.join(root, 'src/index.html'), os.path.join(root, 'src/style.css')]:
    chars |= set(open(f, encoding='utf-8').read())
chars = ''.join(sorted(c for c in chars if ord(c) >= 0x20))
with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False, encoding='utf-8') as t: t.write(chars)
out = os.path.join(root, 'src/font/DotGothic16-subset.woff2')
subprocess.run(['pyftsubset', ttf, '--text-file=' + t.name, '--flavor=woff2', '--output-file=' + out, '--layout-features=*'], check=True)
os.unlink(t.name)
print('wrote', out, os.path.getsize(out), 'bytes,', len(chars), 'chars')
