#!/usr/bin/env node
// src/ を結合して単一HTML (dist/pachi-senki.html) を生成する。
// 使い方:  node tools/build.js            -> dist/pachi-senki.html
//          OUT=dist/fx.html node tools/build.js   -> 出力先を変更(並列作業用)
// ファイル単位で構文チェックし、エラーはファイル名つきで表示する。
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const jsDir = path.join(root, 'src/js');
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort();
let bad = 0;
for (const f of files) {
  try { new vm.Script(fs.readFileSync(path.join(jsDir, f), 'utf8'), { filename: 'src/js/' + f }); }
  catch (e) { bad++; console.error(`SYNTAX ERROR in src/js/${f}: ${e.message}`); }
}
const js = files.map(f => fs.readFileSync(path.join(jsDir, f), 'utf8')).join('\n');
try { new vm.Script(js, { filename: 'bundle.js' }); }
catch (e) { bad++; console.error('SYNTAX ERROR in bundle: ' + e.message); }
if (bad) process.exit(1);

const html = read('src/index.html')
  .replace('/*@CSS*/', () => read('src/style.css'))
  .replace('/*@JS*/', () => js);
const out = path.join(root, process.env.OUT || 'dist/pachi-senki.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`built ${path.relative(root, out)}  (${files.length} js files, ${(html.length / 1024).toFixed(1)} KB)`);
