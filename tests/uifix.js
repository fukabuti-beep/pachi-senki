// 実機ブラウザ(Playwright)検証で見つけた不具合の再発防止
//  1) 共有シートをキャンセル(AbortError)したら、クリップボードへのコピーや「共有できませんでした」を出さない
//  2) トーストがメニューの暗幕より前面 / メニューの「閉じる」がパネル下端に固定(CSS が成果物に入っていること)
const fs = require('fs'), path = require('path');
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
const tick = () => new Promise(r => setImmediate(r));
(async () => {
  { const g = createGame({ seed: 1 }); g.start();
    g.eval(`window.__clip=0;window.navigator={share:()=>Promise.reject(Object.assign(new Error('cancel'),{name:'AbortError'})),clipboard:{writeText:()=>{window.__clip++;return Promise.resolve()}}};fxQ.length=0`);
    g.eval('rkShare()'); for (let i = 0; i < 5; i++) await tick();
    ok(g.eval('window.__clip') === 0, 'share abort: clipboard not used');
    ok(g.eval('fxQ.length') === 0, 'share abort: no toast');
    // 共有が使えない(例外)ならコピーにフォールバック
    g.eval(`window.navigator.share=()=>Promise.reject(new Error('NotAllowedError'))`);
    g.eval('rkShare()'); for (let i = 0; i < 5; i++) await tick();
    ok(g.eval('window.__clip') === 1, 'share error: falls back to clipboard');
    ok(g.eval('fxQ.some(q=>q[0].indexOf("コピー")>=0)'), 'share error: copied toast'); }
  { const root = path.join(__dirname, '..'), css = fs.readFileSync(path.join(root, 'src/css/37-fixes.css'), 'utf8');
    ok(/html body #fxt\{z-index:1[1-9]/.test(css), 'toast above menu (z-index > 10)');
    ok(/html body #fxm #fxmbt\{position:sticky/.test(css), 'menu close buttons sticky');
    const dist = path.join(root, 'dist/pachi-senki.html');
    if (fs.existsSync(dist)) ok(fs.readFileSync(dist, 'utf8').includes('html body #fxt{z-index:11}'), 'fix css bundled'); }
  if (fails) { console.error(fails + ' uifix failure(s)'); process.exit(1); }
  console.log('UIFIX OK');
})();
