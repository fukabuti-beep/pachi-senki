// BOOTH の商品ページ用スクリーンショットを自動で撮る: node tools/store-shots.js  → store/shots/*.png
// 縦長スマホ 2種(1290x2796 = 430x932@3、1242x2688 = 414x896@3)。先に node tools/build.js を実行しておく。
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const html = 'file://' + path.resolve(__dirname, '../dist/pachi-senki.html');
const out = path.resolve(__dirname, '../store/shots'); fs.mkdirSync(out, { recursive: true });
const sizes = [{ n: '6.9', w: 430, h: 932 }];   // 続けて python3 tools/store-pack.py で JPEG(幅1080)とまとめ画像 0-header.jpg を作る
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const br = await chromium.launch();
  for (const s of sizes) {
    const ctx = await br.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
      reducedMotion: 'no-preference' });
    // 見栄えのため、序盤を少し進めたセーブで始める
    await ctx.addInitScript(() => { try { if (!localStorage.getItem('pachi2')) localStorage.setItem('pachi2', JSON.stringify({ v: 2, gold: 2.4e7, stage: 47, lv: [12, 10, 9, 8, 7, 6, 6, 5, 4, 3, 3, 2, 2, 1] })); } catch (e) {} });
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e)));
    await pg.goto(html); await wait(800);
    await pg.click('#go').catch(() => {}); await wait(1500);
    await pg.getByText('受け取る!').first().click({ timeout: 3000 }).catch(() => {}); await wait(5000);
    const shot = async (name) => { await pg.screenshot({ path: path.join(out, `${s.n}-${name}.png`) }); console.log('shot', s.n, name); };
    await shot('1-play');
    await pg.evaluate(() => { try { bigHit(false) } catch (e) {} }); await wait(1500); await shot('2-bighit');
    await wait(3500); await shot('3-rush');
    await pg.evaluate(() => { try { G.sp = null; bigHit(true) } catch (e) {} }); await wait(9000); await shot('4-jackpot');
    await pg.click('#fxmb').catch(() => {}); await wait(800); await shot('5-menu');
    if (errs.length) console.log('page errors:', errs.slice(0, 5));
    await ctx.close();
  }
  await br.close();
})();
