// PWA成果物の整合性: manifest/SW/アイコン/参照、設定UIの存在
const fs = require('fs'), path = require('path');
const d = path.join(__dirname, '..', 'dist', 'pwa');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
const m = JSON.parse(fs.readFileSync(path.join(d, 'manifest.webmanifest'), 'utf8'));
ok(m.display === 'standalone' && m.start_url && m.name && m.short_name, 'manifest basics');
for (const i of m.icons) ok(fs.existsSync(path.join(d, i.src)) && fs.statSync(path.join(d, i.src)).size > 1000, 'icon ' + i.src);
const html = fs.readFileSync(path.join(d, 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(d, 'sw.js'), 'utf8');
ok(html.includes('rel="manifest"') && html.includes('apple-touch-icon') && html.includes("register('sw.js')"), 'index links manifest/icon/sw');
ok(!html.includes('<!--@PWA-->'), 'marker replaced');
for (const f of ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png']) ok(sw.includes(f) && fs.existsSync(path.join(d, f)), 'sw core ' + f);
new (require('vm').Script)(sw);
const single = fs.readFileSync(path.join(__dirname, '..', 'dist', 'pachi-senki.html'), 'utf8');
ok(single.includes('apple-mobile-web-app-capable') && single.includes('data:image/png;base64'), 'single-file has iOS meta + inline icon');
ok(!single.includes('<!--@PWA-->'), 'single marker replaced');
ok(/id="cfgWake"/.test(single) && /id="cfgInst"/.test(single), 'settings rows');
if (fails) { console.error(fails + ' pwa failure(s)'); process.exit(1); }
console.log('PWA OK');
