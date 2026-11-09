// 三本線メニューのグループ分け(29c-menugrp.js)と HUD 文字(39-hudtext.css)の確認
//  1) 全 FM タブが、どれかの大分類ボタン → 中のタブ ボタンで開ける(onclick を実際に実行)
//  2) 後から FM.push したタブは「その他」に自動で入り、開ける
//  3) 最後に開いたタブを覚え、作り直した(=再起動)ゲームでも同じタブから開く
//  4) 壊れた保存値でも落ちない / CSS が成果物に入っている
const fs = require('fs'), path = require('path');
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
const html = id => g => g.eval(`$('${id}').innerHTML`);
const content = html('fxmc');
// innerHTML から onclick="..." を順に取り出す(ハーネスの DOM は innerHTML を解釈しないため)
const clicks = (h, re) => { const out = []; const r = /<button[^>]*onclick="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g; let m; while ((m = r.exec(h))) if (re.test(m[1])) out.push({ js: m[1], label: m[2].replace(/<[^>]+>/g, '') }); return out; };
function walkAll(g) {
  const names = g.eval('FM.map(m=>m.n)'), seen = new Set();
  g.eval('fxClose();fxMenu()');
  const groups = clicks(content(g), /^fmgPick\(/);
  ok(groups.length >= 2 && groups.length <= 4, 'group buttons: ' + groups.length);
  for (const gb of groups) {
    g.eval(gb.js);
    const tabs = clicks(content(g), /^fmgTab\(/);
    ok(tabs.length >= 1 && tabs.length <= 4, 'tabs in group ' + gb.label + ': ' + tabs.length);
    for (const t of tabs) {
      g.eval(t.js);
      const cur = g.eval('FM[fxTab].n');
      ok(cur === t.label, 'tab opens: ' + t.label + ' -> ' + cur);
      ok(g.eval('fxOpen') === true, 'menu open after ' + t.label);
      seen.add(cur);
    }
  }
  for (const n of names) ok(seen.has(n), 'reachable from some group: ' + n);
  return seen;
}
{ const store = {};
  const g = createGame({ seed: 1, storage: store }); g.start(); g.advance(2);
  ok(typeof g.eval('fmgMenu') === 'function', 'fmgMenu defined');
  ok(g.eval('FM.length') >= 10, 'FM tabs: ' + g.eval('FM.length'));
  walkAll(g);
  // 既知のタブの振り分け
  ok(g.eval("fmgOf('遊戯')===0&&fmgOf('くじ')===0&&fmgOf('遠征')===0"), 'play group');
  ok(g.eval("fmgOf('実績')===1&&fmgOf('図鑑')===1&&fmgOf('遺物')===1&&fmgOf('仲間')===1"), 'collect group');
  ok(g.eval("fmgOf('転生')===2&&fmgOf('ミッション')===2"), 'grow group');
  ok(g.eval("fmgOf('応援★')===3&&fmgOf('ランキング')===3"), 'other group (with ★)');
  // 後から追加されたタブは「その他」に入る
  g.eval("FM.push({n:'テスト新機能',r:()=>'<div class=\"fxh\">NEW</div>'})");
  ok(g.eval("fmgOf('テスト新機能')") === 3, 'unknown tab -> その他');
  const seen = walkAll(g);
  ok(seen.has('テスト新機能'), 'new tab reachable');
  // 最後に開いたタブを覚える
  g.eval("fmgTab(FM.findIndex(m=>m.n==='遺物'))");
  ok(/遺物/.test(content(g)) && g.eval('FM[fxTab].n') === '遺物', 'open relic');
  g.eval('fxClose()');
  ok(JSON.parse(store.pachi2_menu || g.eval("localStorage.getItem('pachi2_menu')")).t === '遺物', 'saved last tab');
  // 大分類ボタンはそのグループで最後に開いたタブへ
  g.eval("fmgTab(FM.findIndex(m=>m.n==='くじ'));fmgPick(1)");
  ok(g.eval('FM[fxTab].n') === '遺物', 'group remembers its last tab: ' + g.eval('FM[fxTab].n'));
  g.eval('fmgPick(0)');
  ok(g.eval('FM[fxTab].n') === 'くじ', 'play group remembers くじ');
  ok(g.eval('FERR') === 0, 'no feature errors');
  // 再起動しても同じタブから
  const saved = g.eval("localStorage.getItem('pachi2_menu')");
  const g2 = createGame({ seed: 2, storage: { pachi2_menu: saved } }); g2.start(); g2.advance(1);
  g2.eval('fxClose();fxMenu()');
  ok(g2.eval('FM[fxTab].n') === 'くじ', 'restored after restart: ' + g2.eval('FM[fxTab].n')); }
{ // 壊れた保存値
  for (const bad of ['{', '"x"', '{"t":5,"g":"a"}', '{"t":"消えたタブ"}']) {
    const g = createGame({ seed: 3, storage: { pachi2_menu: bad } }); g.start(); g.advance(1);
    g.eval('fxClose();fxMenu()');
    ok(g.eval('fxOpen') === true && /fmgTab/.test(content(g)), 'menu opens with bad save ' + bad);
    ok(g.eval('FERR') === 0, 'no errors with bad save ' + bad);
  } }
{ const root = path.join(__dirname, '..'), dist = path.join(root, 'dist/pachi-senki.html');
  if (fs.existsSync(dist)) { const d = fs.readFileSync(dist, 'utf8');
    ok(d.includes('.fxt.mgG') && d.includes('.fxt.mgT'), 'menu group css bundled');
    ok(/\.plate small\{font-size:1[2-9]px/.test(d), 'STAGE label enlarged');
    ok(/#spw i\{[^}]*font-size:1[1-9]px/.test(d), 'SP label enlarged');
    ok(/#q \.hl\{font-size:1[2-9]px/.test(d), '保留 label enlarged'); } }
if (fails) { console.error(fails + ' menugrp failure(s)'); process.exit(1); }
console.log('MENUGRP OK');
