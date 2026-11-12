// 体験版/完全版(01-edition・98l): 体験版は STAGE 175 で止まり案内が出る / 完全版は止まらない / 体験版の書き出しは @full のファイルを含まない
const { createGame } = require('../tools/harness');
const fs = require('fs'), path = require('path'), cp = require('child_process');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
(async () => {
  const g = createGame({ seed: 1, globals: { PACHI_EDITION: 'free' } }); g.start(); g.advance(1);
  ok(g.eval('EDITION') === 'free' && g.eval('IS_FULL') === false, '体験版にならない');
  g.eval('G.stage=175;spawn();G.hp=0;kill()'); ok(g.eval('G.stage') === 175, '体験版で STAGE 175 を越えた: ' + g.eval('G.stage'));
  g.advance(3, .05); ok(g.eval('fxOpen') === true && /完全版/.test(g.eval("$('fxmc').innerHTML")), '案内が出ない');
  ok(g.eval('FM.some(m=>m.n==="完全版")'), '体験版に「完全版」タブが無い');
  g.eval('fxClose()'); for (let i = 0; i < 4; i++) g.eval('G.hp=0;kill()'); ok(g.eval('G.stage') === 175, '何度倒しても 175');
  const s2 = { pachi2: JSON.stringify({ v: 2, gold: 1, stage: 250, lv: [] }) }; const h = createGame({ seed: 2, storage: s2, globals: { PACHI_EDITION: 'free' } }); h.start();
  ok(h.eval('G.stage') === 175, '上限を超えたセーブは 175 に: ' + h.eval('G.stage'));
  const f = createGame({ seed: 3 }); f.start(); f.advance(1); ok(f.eval('IS_FULL') === true, '既定は完全版');
  f.eval('G.stage=175;spawn();G.hp=0;kill()'); ok(f.eval('G.stage') === 176, '完全版は止まらない'); ok(!f.eval('FM.some(m=>m.n==="完全版")'), '完全版に案内タブがある');
  // 体験版の書き出し: 目印が入り、@full のファイルは入らない
  const tmp = path.join(__dirname, '..', 'dist', 'edition-test-free.html'); const fake = path.join(__dirname, '..', 'src', 'js', '99z-fulltest.js');
  fs.writeFileSync(fake, "/* @full テスト用 */\nconst FULL_ONLY_MARK=1;\n");
  try { cp.execSync('node tools/build.js', { cwd: path.join(__dirname, '..'), env: Object.assign({}, process.env, { EDITION: 'free', OUT: 'dist/edition-test-free.html' }), stdio: 'ignore' });
    const html = fs.readFileSync(tmp, 'utf8'); ok(/window\.PACHI_EDITION='free'/.test(html), '体験版の目印が無い'); ok(!/FULL_ONLY_MARK/.test(html), '@full のファイルが体験版に入った'); ok(!/function twStart/.test(html), '無限の塔(@full)が体験版に入った');
  } finally { try { fs.unlinkSync(fake) } catch (e) {} try { fs.unlinkSync(tmp) } catch (e) {} }
  if (fails) { console.error(fails + ' edition failure(s)'); process.exit(1); }
  console.log('EDITION OK');
})();
