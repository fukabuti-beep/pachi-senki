// 導線と保守のチェック(デグレ・入れ忘れ対策)。node tools/audit.js [--update]
// 作り手はコードを読まないので、「作ったのにつながっていない」「つないだつもりで抜けている」を機械で見つける。
//
//  静的(ソースを読むだけ)
//   1) 説明書: src/js・src/css の各ファイルが CLAUDE.md に書かれているか(誰が何のために作ったか分からないファイルを増やさない)
//   2) テスト: tests/*.js が npm test に入っているか(作ったテストが走っていない、を防ぐ)
//   2b) 散らかり: 全ファイルが CLAUDE.md の「リポジトリの構成」に載っているか・一時ファイルらしい名前が無いか
//   3) セーブ: localStorage のキー(pachi2_*)が 書く と 読む の両方あるか(保存したのに読まない/読むのに保存しない)
//   3b) セーブのキーが CLAUDE.md の「セーブのキー一覧」に全部あるか
//   4) 使われていない関数: どこからも呼ばれない関数(作りかけ・消し忘れ)
//   5) 画面の部品: $('id') で探している id が、HTML か JS のどこかで作られているか(名前の打ち間違い・作り忘れ)
//   6) 完全版の案内: @full のファイルに「// FULL_FEAT: 名前」があり、98l の FULL_FEATS に同じ名前があるか
//  実行(ゲームを動かして)
//   7) メニューの全タブ・強化画面の全グループが 例外なく開け、中身が空でない
//   8) 新しいタブが FMGRP に登録されず「その他」に自動で落ちていないか
//   9) 1分動かして更新処理(FU)の例外 0
//
// 1・4・5 は今あるものを「基準」(tools/audit.baseline.json)として記録し、**新しく増えたものだけ** を止める(だんだん減らす方式)。
// 基準を更新するのは「意図した変更」と確認できた時だけ: node tools/audit.js --update(差分はコミットで見える)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), jsDir = path.join(root, 'src/js'), cssDir = path.join(root, 'src/css');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort();
const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).sort();
const src = {}; for (const f of jsFiles) src[f] = fs.readFileSync(path.join(jsDir, f), 'utf8');
const allJs = jsFiles.map(f => src[f]).join('\n');
const html = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');
const claude = fs.readFileSync(path.join(root, 'CLAUDE.md'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const baseF = path.join(__dirname, 'audit.baseline.json');
let base = {}; try { base = JSON.parse(fs.readFileSync(baseF, 'utf8')); } catch (e) {}
const UPDATE = process.argv.includes('--update');
let errors = 0, warns = 0; const ng = m => { errors++; console.log('NG: ' + m); }, warn = m => { warns++; console.log('注意: ' + m); };
const found = {};   // 基準と比べるリスト
const ratchet = (key, list, msg) => { found[key] = [...new Set(list)].sort(); if (UPDATE) return; const b = new Set(base[key] || []);
  for (const x of found[key]) if (!b.has(x)) ng(msg(x));
  const gone = (base[key] || []).filter(x => !found[key].includes(x)); if (gone.length) warn(key + ' が ' + gone.length + ' 件 減った(良いこと)→ node tools/audit.js --update で基準を縮める: ' + gone.slice(0, 5).join(', ')); };

// 1) 説明書
const mentioned = f => claude.includes(f) || claude.includes(f.replace(/\.(js|css)$/, ''));
ratchet('undocumented', [...jsFiles, ...cssFiles.map(f => 'css/' + f)].filter(f => !mentioned(f.replace(/^css\//, ''))), f => `${f} が CLAUDE.md の表に無い(何のファイルか書く)`);

// 2) テスト
const testCmd = (pkg.scripts && pkg.scripts.test) || '';
for (const f of fs.readdirSync(path.join(root, 'tests')).filter(f => f.endsWith('.js'))) if (!testCmd.includes('tests/' + f)) ng(`tests/${f} が npm test に入っていない(作ったテストが走らない)`);

// 2b) ファイルの散らかり: リポジトリの全ファイル(コミット済み+まだコミットしていない新しいファイル)が CLAUDE.md の「リポジトリの構成」に載っているか、
//     一時ファイルらしい名前が無いか(作業の残りを置き忘れない)
{ const cp = require('child_process'); let files = [];
  try { files = cp.execSync('git ls-files -co --exclude-standard', { cwd: root }).toString().split('\n').filter(Boolean); } catch (e) { warn('git が使えないのでファイルの散らかりは見ていない'); }
  const sec = (claude.split('## リポジトリの構成')[1] || '').split('\n## ')[0];
  const listed = f => { if (/^(src\/js|src\/css|tests|unity)\//.test(f) || f === 'src/index.html' || f === 'src/style.css') return true;
    if (sec.includes(f)) return true; const parts = f.split('/'); for (let i = parts.length - 1; i > 0; i--) { const d = parts.slice(0, i).join('/') + '/';   // フォルダ丸ごとの許可は「store/shots/」のように単独で書いた時だけ
      if (new RegExp('(^|[\\s,|])' + d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=[\\s,|(]|$)', 'm').test(sec)) return true; }
    return false; };
  for (const f of files) {
    if (!fs.existsSync(path.join(root, f))) continue;   // 消したばかり(まだコミットしていない)
    if (/(^|[\/._-])(tmp|temp|old|bak|backup|copy|untitled|scratch|wip)([\/._-]|\d|$)|~$|\.orig$|\.rej$|\.swp$|\.log$/i.test(f)) ng(`一時ファイルらしい ${f} がある(作業の残りなら消す)`);
    else if (!listed(f)) ng(`${f} が CLAUDE.md の「リポジトリの構成」に無い(必要なら1行書く、不要なら消す)`); } }

// 3) セーブのキー(書く/読む の対)
const keysOf = re => { const s = new Set(); let m; while ((m = re.exec(allJs))) s.add(m[1]); return s; };
const wr = keysOf(/setItem\(\s*['"](pachi2[\w]*)['"]/g), rd = keysOf(/getItem\(\s*['"](pachi2[\w]*)['"]/g);
const constKeys = keysOf(/(?:const|let)\s+\w+\s*=\s*['"](pachi2[\w]*)['"]/g);   // キーを定数に入れて使う書き方
for (const k of wr) if (!rd.has(k) && !constKeys.has(k)) ng(`セーブ ${k} を書いているのに読んでいない(次回起動で消える)`);
for (const k of rd) if (!wr.has(k) && !constKeys.has(k) && k !== 'pachi2') warn(`セーブ ${k} を読んでいるが書く所が見つからない(古いキーなら問題なし)`);

// 3b) セーブのキーの一覧: ソースに出てくる 'pachi2…' / 'pbak_…' が、CLAUDE.md の「セーブのキー一覧」に全部あるか(増やしたら書く=引き継ぎ・転生・体験版で壊さないための台帳)
{ const sec = (claude.split('## セーブのキー一覧')[1] || '').split('\n## ')[0]; const all = new Set(); let m; const re = /['"]((?:pachi2|pbak_)[a-z0-9_]*)['"]/g; while ((m = re.exec(allJs))) all.add(m[1]);
  for (const k of all) if (!new RegExp('`' + k + '`').test(sec)) ng(`セーブのキー ${k} が CLAUDE.md の「セーブのキー一覧」に無い`);
  const listed = [...sec.matchAll(/^\| `((?:pachi2|pbak_)[a-z0-9_]*)`/gm)].map(x => x[1]); for (const k of listed) if (!all.has(k)) ng(`セーブのキー一覧の ${k} は、もうソースに無い(表から消す)`); }

// 4) 使われていない関数(名前が定義の1回しか出てこない。HTML の onclick 文字列も数える)
// tools/ と tests/ から呼ばれる関数(sim・テスト用の入口)も「使われている」に数える
const extra = ['tools', 'tests'].flatMap(d => fs.readdirSync(path.join(root, d)).filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.join(root, d, f), 'utf8'))).join('\n');
const everything = allJs + '\n' + html + '\n' + extra;
const unused = [];
for (const f of jsFiles) { const re = /^function\s+([A-Za-z_$][\w$]*)/gm; let m; while ((m = re.exec(src[f]))) { const n = m[1];
    const cnt = (everything.match(new RegExp('(^|[^\\w$])' + n.replace(/\$/g, '\\$') + '(?![\\w$])', 'g')) || []).length; if (cnt <= 1) unused.push(f + ':' + n); } }
ratchet('unusedFunctions', unused, x => `関数 ${x} がどこからも呼ばれていない(作りかけ/つなぎ忘れ/消し忘れ)`);

// 5) $('id') の id が作られているか
const ids = new Set(); { let m; const r1 = /\bid\s*=\s*["']([\w-]+)["']/g; while ((m = r1.exec(html + allJs))) ids.add(m[1]);
  const r2 = /\.id\s*=\s*['"]([\w-]+)['"]/g; while ((m = r2.exec(allJs))) ids.add(m[1]);
  const r3 = /fxEl\(\s*['"]\w+['"]\s*,\s*['"]([\w-]+)['"]/g; while ((m = r3.exec(allJs))) ids.add(m[1]);
  const r4 = /id="'\+['"]?([\w-]+)/g; while ((m = r4.exec(allJs))) ids.add(m[1]); }
// 探すだけの書き方($('x') / getElementById('x'))を消した残りに 'x' が出てくれば、補助関数(ttEl('div','x') など)で作っているとみなす
const rest = allJs.replace(/(?:\$|getElementById)\(\s*['"][\w-]+['"]\s*\)/g, '');
const missing = []; { let m; const re = /(?:\$|getElementById)\(\s*['"]([\w-]+)['"]\s*\)/g; while ((m = re.exec(allJs))) if (!ids.has(m[1]) && !new RegExp("['\"]" + m[1] + "['\"]").test(rest)) missing.push(m[1]); }
ratchet('unknownIds', missing, x => `画面の部品 #${x} を探しているが、どこでも作られていない(id の打ち間違い/作り忘れ)`);

// 6) 完全版の案内
const featBlock = (src['98l-edition.js'] || '').match(/FULL_FEATS\s*=\s*\[([\s\S]*?)\];/); const featTitles = featBlock ? [...featBlock[1].matchAll(/\[\s*'([^']+)'/g)].map(m => m[1]) : [];
for (const f of jsFiles) { if (!/@full/.test(src[f].split('\n')[0])) continue; const m = src[f].match(/\/\/\s*FULL_FEAT:\s*(.+)/);
  if (!m) ng(`${f} は完全版だけのファイルなのに「// FULL_FEAT: 名前」が無い(体験版の「完全版のご案内」に載せ忘れ防止)`);
  else if (!featTitles.includes(m[1].trim())) ng(`${f} の FULL_FEAT「${m[1].trim()}」が 98l-edition の FULL_FEATS に無い(案内に載っていない)`); }

// 7〜9) 実行
try {
  const { createGame } = require('./harness');
  for (const ed of ['full', 'free']) {
    const g = createGame({ seed: 11, globals: ed === 'free' ? { PACHI_EDITION: 'free' } : {} }); g.start(); g.advance(2, .05);
    g.eval('G.stage=200;X.best=Math.max(X.best,200);spawn();G.gold=1e30;if(typeof RES!=="undefined"){RES.ms=1e9;RES.gem=1e6}');   // 全部解放した状態で開く
    const tabs = JSON.parse(g.eval('JSON.stringify(FM.map(m=>m.n))'));
    tabs.forEach((n, i) => { let h = ''; try { h = g.eval('(()=>{const r=FM[' + i + '].r;return typeof r==="function"?String(r()):""})()'); } catch (e) { ng(`[${ed}] メニュー「${n}」を開くと例外: ${e.message}`); return; }
      if (!h || h.replace(/<[^>]+>/g, '').trim().length < 4) ng(`[${ed}] メニュー「${n}」の中身が空`); });
    // 8) その他 に自動で落ちたタブ
    const other = JSON.parse(g.eval('JSON.stringify(typeof FMGRP==="undefined"?[]:FM.map(m=>m.n).filter(n=>fmgOf(n)===FMG_OTHER&&!FMGRP[FMG_OTHER].t.some(t=>n.indexOf(t)===0)))'));
    for (const n of other) ng(`[${ed}] メニュー「${n}」が FMGRP に登録されず「その他」に自動で入っている(置き場所を決める)`);
    // 強化画面の全グループ
    const ug = JSON.parse(g.eval('JSON.stringify(typeof UPG==="undefined"?[]:UPG.list.map(x=>x[0]))'));
    ug.forEach((n, i) => { if (!i) return; let h = ''; try { h = g.eval('String(UPG.list[' + i + '][1]?UPG.list[' + i + '][1]():"")'); } catch (e) { ng(`[${ed}] 強化画面「${n}」で例外: ${e.message}`); return; }
      if (h.replace(/<[^>]+>/g, '').trim().length < 4) ng(`[${ed}] 強化画面「${n}」の中身が空`); });
    // upOpen で名前から開けるか
    for (const n of ug) { try { g.eval('upOpen(' + JSON.stringify(n) + ')'); if (g.eval('UPG.list[UPG.g][0]') !== n) ng(`[${ed}] upOpen("${n}") で開けない`); } catch (e) { ng(`[${ed}] upOpen("${n}") で例外 ${e.message}`); } }
    g.eval('try{fxClose()}catch(e){}'); g.advance(60, .05);
    const fe = g.eval('FERR'); if (fe) ng(`[${ed}] 1分動かすと更新処理で例外 ${fe} 回`);
  }
} catch (e) { ng('実行チェックが動かない: ' + e.message); }

if (UPDATE) { fs.writeFileSync(baseF, JSON.stringify(found, null, 1) + '\n'); console.log('audit.baseline.json を更新: ' + Object.entries(found).map(([k, v]) => k + ' ' + v.length).join(' / ')); }
if (errors) { console.log(errors + ' audit error(s)'); process.exit(1); }
console.log('AUDIT OK' + (warns ? ' (注意 ' + warns + ')' : '') + ' — 基準: ' + Object.entries(found).map(([k, v]) => k + ' ' + v.length).join(' / '));
