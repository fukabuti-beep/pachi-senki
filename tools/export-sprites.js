// Web版のドット絵(10-sprites.js などの mk() で作る SPR/PXL)を Unity 用の C# データに書き出す。
//   node tools/export-sprites.js   → unity/PachiSenki/Assets/Scripts/View/SpriteData.cs
// 形式: 名前, 幅, 高さ, パレット(色の配列), 画素(行ごとに1文字=パレット番号 '.'=透明, 0-9a-z)
const fs = require('fs'), path = require('path');
const { createGame } = require('./harness');
const g = createGame({ seed: 1 });
const list = JSON.parse(g.eval('JSON.stringify(Object.keys(SPR).filter(k=>PXL[k]).map(k=>({n:k,w:SPR[k].width,h:SPR[k].height,px:PXL[k]})))'));
const KEYS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const out = [];
for (const s of list) {
  const pal = [], grid = Array.from({ length: s.h }, () => Array(s.w).fill('.'));
  for (const [x, y, c] of s.px) { let i = pal.indexOf(c); if (i < 0) { i = pal.length; pal.push(c) } grid[y][x] = KEYS[i] }
  out.push(`            { "${s.n}", new SpriteDef(${s.w}, ${s.h}, new[] { ${pal.map(c => '"' + c + '"').join(', ')} }, "${grid.map(r => r.join('')).join('|')}") },`);
}
const cs = `// 自動生成(node tools/export-sprites.js)。手で編集しない。元データは Web版 src/js の mk() スプライト(すべてオリジナル)。
using System.Collections.Generic;

namespace PachiSenki.View
{
    public sealed class SpriteDef
    {
        public readonly int W, H; public readonly string[] Palette; public readonly string Rows;
        public SpriteDef(int w, int h, string[] pal, string rows) { W = w; H = h; Palette = pal; Rows = rows; }
    }

    public static class SpriteData
    {
        public static readonly Dictionary<string, SpriteDef> All = new Dictionary<string, SpriteDef>
        {
${out.join('\n')}
        };
    }
}
`;
const dst = path.join(__dirname, '..', 'unity', 'PachiSenki', 'Assets', 'Scripts', 'View', 'SpriteData.cs');
fs.writeFileSync(dst, cs);
console.log('wrote', path.relative(process.cwd(), dst), list.length, 'sprites');
