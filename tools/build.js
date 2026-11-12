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
// src/img/*.webp|png を data URI にして PIMG に埋め込む(単一HTMLのまま配布するため)。ハーネス(テスト)には入らないので、使う側は typeof PIMG を確認する
const imgDir = path.join(root, 'src/img');
const imgs = fs.existsSync(imgDir) ? fs.readdirSync(imgDir).filter(f => /\.(webp|png)$/.test(f)).sort() : [];
const pimg = 'const PIMG={' + imgs.map(f => JSON.stringify(f.replace(/\.\w+$/, '')) + ':"data:image/' + (f.endsWith('.png') ? 'png' : 'webp') + ';base64,' + fs.readFileSync(path.join(imgDir, f)).toString('base64') + '"').join(',') + '};\n';
// 体験版(EDITION=free): 先頭で window.PACHI_EDITION='free' にし、1行目に @full と書いたファイル(完全版だけの中身)は入れない(01-edition.js)
const FREE = process.env.EDITION === 'free';
const useFiles = FREE ? files.filter(f => !/@full/.test(fs.readFileSync(path.join(jsDir, f), 'utf8').split('\n')[0])) : files;
const js = (FREE ? "window.PACHI_EDITION='free';\n" : '') + pimg + useFiles.map(f => fs.readFileSync(path.join(jsDir, f), 'utf8')).join('\n');
try { new vm.Script(js, { filename: 'bundle.js' }); }
catch (e) { bad++; console.error('SYNTAX ERROR in bundle: ' + e.message); }
if (bad) process.exit(1);

// CSS: src/style.css の後ろに src/css/*.css をファイル名順で連結(担当ごとに追記ファイルを分けて衝突を避ける)
const cssDir = path.join(root, 'src/css');
const css = read('src/style.css') + (fs.existsSync(cssDir) ? fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).sort().map(f => '\n/* ' + f + ' */\n' + fs.readFileSync(path.join(cssDir, f), 'utf8')).join('') : '');
const ICON = n => fs.readFileSync(path.join(root, 'src/pwa', n));
const hash = (str) => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
// ドット文字フォント(DotGothic16, SIL OFL 1.1, src/font/OFL.txt)を内蔵: 使う文字だけに絞った woff2 を data URI で埋め込み、Google Fonts の読み込みをやめる
const fontFile = path.join(root, 'src/font/DotGothic16-subset.woff2');
const fontCss = fs.existsSync(fontFile) ? "/* DotGothic16 (c) The DotGothic16 Project Authors, SIL Open Font License 1.1 */\n@font-face{font-family:'DotGothic16';src:url(data:font/woff2;base64," + fs.readFileSync(fontFile).toString('base64') + ") format('woff2');font-display:swap}\n" : '';
let page = read('src/index.html');
if (fontCss) page = page.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>\s*/g, '');
const base = page.replace('/*@CSS*/', () => fontCss + css).replace('/*@JS*/', () => js);
// 単一HTML版: アイコンはdata URI(外部ファイル不要)。manifest/SWなし(file:// や埋め込み表示でも動く)
const single = base.replace('<!--@PWA-->', () => '<link rel="apple-touch-icon" href="data:image/png;base64,' + ICON('apple-touch-icon.png').toString('base64') + '">');
const out = path.join(root, process.env.OUT || (FREE ? 'dist/pachi-senki-free.html' : 'dist/pachi-senki.html'));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, single);
console.log(`built ${path.relative(root, out)}  (${files.length} js files, ${(single.length / 1024).toFixed(1)} KB)`);
// Unity 版(Web版をアプリ内の WebView で動かす)にも同じ単一HTMLを置く。Unity 側は StreamingAssets から読み込む
if (!process.env.OUT && !FREE && fs.existsSync(path.join(root, 'unity/PachiSenki/Assets'))) {
  const ua = path.join(root, 'unity/PachiSenki/Assets/StreamingAssets/pachi-senki.html');
  fs.mkdirSync(path.dirname(ua), { recursive: true }); fs.writeFileSync(ua, single);
  console.log('built ' + path.relative(root, ua) + '  (Unity 版の WebView 用)');
}
// PWA版(dist/pwa/): index.html + manifest + sw.js + icons。静的ホスティング(GitHub Pages/Netlify等)に置けばホーム画面に追加→オフライン起動できる。
if (!process.env.OUT && !FREE) {
  const dir = path.join(root, 'dist/pwa'), ver = hash(base);
  fs.mkdirSync(dir, { recursive: true });
  const reg = `<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="apple-touch-icon.png">\n<script>if('serviceWorker' in navigator&&/^https?:/.test(location.protocol))addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})</script>`;
  fs.writeFileSync(path.join(dir, 'index.html'), base.replace('<!--@PWA-->', () => reg));
  fs.writeFileSync(path.join(dir, 'manifest.webmanifest'), JSON.stringify({
    name: 'パチ戦記 放置バトルパチンコ', short_name: 'パチ戦記', description: '放置で激アツ!ドット絵パチンコ型バトルゲーム',
    lang: 'ja', start_url: './index.html', scope: './', display: 'standalone', orientation: 'portrait',
    background_color: '#0a0720', theme_color: '#0a0720',
    icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }]
  }, null, 2));
  const sw = `// 自動生成(tools/build.js)。ビルドごとにキャッシュ名が変わり、古いキャッシュは起動時に消える。
const CACHE='pachi-senki-${ver}',CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('pachi-senki-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin===location.origin){e.respondWith(caches.match(r,{ignoreSearch:true}).then(h=>h||fetch(r).then(x=>{if(x.ok){const y=x.clone();caches.open(CACHE).then(c=>c.put(r,y))}return x}).catch(()=>caches.match('index.html'))));return}
 if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(h=>{const f=fetch(r).then(x=>{c.put(r,x.clone());return x}).catch(()=>h);return h||f})))}});
`;
  fs.writeFileSync(path.join(dir, 'sw.js'), sw);
  for (const n of ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png']) fs.copyFileSync(path.join(root, 'src/pwa', n), path.join(dir, n));
  console.log('built dist/pwa/  (index.html, manifest.webmanifest, sw.js, icons)  cache=pachi-senki-' + ver);
}
