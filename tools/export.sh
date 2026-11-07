#!/bin/sh
# プロジェクト一式(作業履歴つき)を zip にまとめる。使い方: sh tools/export.sh [出力先.zip]
# 解凍後: cd pachi-senki && npm test && claude   (CLAUDE.md が引き継ぎ書。dist/ は node tools/build.js で再生成)
set -e
cd "$(dirname "$0")/.."
OUT=${1:-/tmp/pachi-senki-project.zip}
rm -f "$OUT"
cd ..
zip -qr "$OUT" "$(basename "$OLDPWD")" -x "*/node_modules/*" "*/dist/*" "*/.DS_Store"
echo "wrote $OUT"
