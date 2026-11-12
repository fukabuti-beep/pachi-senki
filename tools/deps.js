// 依存関係のチェック(デグレ対策)。node tools/deps.js [--update]
//  1) 体験版の安全: 完全版だけのファイル(1行目に @full)で宣言した名前を、他のファイルが typeof の確認なしで使っていないか
//     (体験版のビルドでは @full のファイルが無いので ReferenceError で止まる)
//  2) ラップの順番: 同じ関数(kill/spawn/drawB など)を包んでいるファイルの並び(内側→外側)を tools/wraps.snapshot.json と比べる。
//     新しいラップが入った・順番が変わった時は「意図した変更か」を確認してから --update で記録し直す(docs/WRAPS.md も更新)。
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), jsDir = path.join(root, 'src/js');
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort();
const src = {}, full = {};
for (const f of files) { const t = fs.readFileSync(path.join(jsDir, f), 'utf8'); src[f] = t; full[f] = /@full/.test(t.split('\n')[0]); }
// コメントと文字列を大まかに消す(名前の誤検出を減らす)
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/[^\n]*/g, '$1').replace(/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/g, "''");
const code = {}; for (const f of files) code[f] = strip(src[f]);
let errors = 0; const err = m => { errors++; console.log('NG: ' + m); };

// 1) @full の名前
const decl = t => { const s = new Set(); const re = /^(?:function\s+([A-Za-z_$][\w$]*)|(?:const|let|var)\s+([A-Za-z_$][\w$]*))/gm; let m; while ((m = re.exec(t))) s.add(m[1] || m[2]);
  const re2 = /^(?:const|let|var)\s+[^;\n]*/gm; while ((m = re2.exec(t))) { const parts = m[0].replace(/^(?:const|let|var)\s+/, ''); let d = 0, cur = ''; for (const ch of parts) { if ('([{'.includes(ch)) d++; else if (')]}'.includes(ch)) d--; if (ch === ',' && d === 0) { const n = cur.trim().match(/^([A-Za-z_$][\w$]*)\s*=/); if (n) s.add(n[1]); cur = ''; } else cur += ch; } const n = cur.trim().match(/^([A-Za-z_$][\w$]*)\s*=/); if (n) s.add(n[1]); }
  return s; };
const fullNames = new Map(); for (const f of files) if (full[f]) for (const n of decl(code[f])) fullNames.set(n, f);
for (const f of files) { if (full[f]) continue; const lines = code[f].split('\n');
  lines.forEach((ln, i) => { for (const [n, of] of fullNames) { const re = new RegExp('(^|[^\\w$.])' + n.replace(/\$/g, '\\$') + '(?![\\w$])'); if (!re.test(ln)) continue;
      if (new RegExp('typeof\\s+' + n + '(?![\\w$])').test(ln)) continue;
      err(`${f}:${i + 1} が完全版だけの ${n}(${of})を typeof の確認なしで使っている → 体験版で止まる`); } }); }

// 2) ラップの並び
const wraps = {};
for (const f of files) { const t = code[f]; let m;
  const re = /(?:const|let)\s+[\w$]+\s*=\s*([A-Za-z_$][\w$]*(?:\.[\w$]+)?)\s*[;,](?:[^\n]*?[^\w$.])?\1\s*=(?!=)/gm;
  while ((m = re.exec(t))) (wraps[m[1]] = wraps[m[1]] || []).push(f);
  const re2 = /(?:^|[^\w$.])([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*\(\s*\1\s*\)/gm;
  while ((m = re2.exec(t))) (wraps[m[1]] = wraps[m[1]] || []).push(f); }
// 対象: どこかで「function 名前」と宣言されたグローバル関数と、SB.a / SB.g(倍率の連鎖)。一時的な保存/復元(G.stage など)は除く
const gfun = new Set(); for (const f of files) { const re = /^function\s+([A-Za-z_$][\w$]*)/gm; let m; while ((m = re.exec(code[f]))) gfun.add(m[1]); }
for (const k in wraps) { if (!(gfun.has(k) || k === 'SB.a' || k === 'SB.g')) { delete wraps[k]; continue; } wraps[k] = [...new Set(wraps[k])]; }
const snapF = path.join(__dirname, 'wraps.snapshot.json');
const sorted = Object.keys(wraps).sort().reduce((o, k) => (o[k] = wraps[k], o), {});
// 3) ファイル同士の依存の一覧(docs/DEPS.md、--update で作り直す)。「このファイルが使っている、他のファイルで宣言された名前」
//    新しいファイルが思わぬファイルに頼り始めていないか(不要な依存)を、レビューで差分として見るためのもの
const owner = new Map(); for (const f of files) for (const n of decl(code[f])) if (!owner.has(n)) owner.set(n, f);
const localNames = t => { const s = new Set(); let m;   // そのファイルの中で作っている名前(どこで作っても)と、関数の引数
  const r1 = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g; while ((m = r1.exec(t))) s.add(m[1]);
  const r1b = /(?:const|let|var)\s+[^;\n]*?,\s*([A-Za-z_$][\w$]*)\s*=/g; while ((m = r1b.exec(t))) s.add(m[1]);
  const r2 = /function\s*[\w$]*\s*\(([^)]*)\)/g; while ((m = r2.exec(t))) m[1].split(',').forEach(a => { const n = a.trim().match(/^[A-Za-z_$][\w$]*/); if (n) s.add(n[0]); });
  const r3 = /\(([^()]*)\)\s*=>/g; while ((m = r3.exec(t))) m[1].split(',').forEach(a => { const n = a.trim().match(/^[A-Za-z_$][\w$]*/); if (n) s.add(n[0]); });
  const r4 = /([A-Za-z_$][\w$]*)\s*=>/g; while ((m = r4.exec(t))) s.add(m[1]);
  const r5 = /catch\s*\(\s*([A-Za-z_$][\w$]*)/g; while ((m = r5.exec(t))) s.add(m[1]);
  const r6 = /for\s*\(\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g; while ((m = r6.exec(t))) s.add(m[1]);
  return s; };
const usesOf = f => { const used = new Map(); const ids = code[f].replace(/\.[A-Za-z_$][\w$]*/g, '').replace(/([{,]\s*)[A-Za-z_$][\w$]*\s*:(?!:)/g, '$1').match(/[A-Za-z_$][\w$]*/g) || []; const mine = localNames(code[f]);
  for (const id of new Set(ids)) { if (/^[a-z][a-z0-9]?$/.test(id)) continue;   // 1〜2文字の小文字は一時変数がほとんど(誤検出を避ける)
    const o = owner.get(id); if (!o || o === f || mine.has(id)) continue; if (!used.has(o)) used.set(o, []); used.get(o).push(id); }
  return [...used.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1); };
if (process.argv.includes('--update')) {
  fs.writeFileSync(snapF, JSON.stringify(sorted, null, 1) + '\n');
  let md = '# ラップの並び(自動生成: node tools/deps.js --update)\n\n同じ関数を包んでいるファイルを **読み込み順(内側 → 外側)** に並べたもの。外側ほど先に呼ばれる。\n挙動を変えるラップ(kill/spawn/hurt など)を足す時は、ここで前後のファイルを確認すること。\n\n| 関数 | ファイル(内側 → 外側) |\n|---|---|\n';
  for (const k in sorted) md += `| \`${k}\` | ${sorted[k].join(' → ')} |\n`;
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true }); fs.writeFileSync(path.join(root, 'docs/WRAPS.md'), md);
  let dm = '# ファイル同士の依存(自動生成: node tools/deps.js --update)\n\n各ファイルが使っている「他のファイルで宣言された名前」。新しく増えた依存はコミットの差分で確認する(不要な依存を作らない)。\n00-core(G など共通の土台)と 20-upgrades(BAL/atk など)への依存は省略。\n\n';
  for (const f of files) { const u = usesOf(f).filter(([o]) => !/^(00-core|20-upgrades)\.js$/.test(o)); if (!u.length) continue;
    dm += `## ${f}${full[f] ? '(完全版のみ)' : ''}\n` + u.map(([o, ns]) => `- ${o}: ${ns.slice(0, 12).join(', ')}${ns.length > 12 ? ' ほか' + (ns.length - 12) : ''}`).join('\n') + '\n\n'; }
  fs.writeFileSync(path.join(root, 'docs/DEPS.md'), dm);
  console.log('wraps.snapshot.json / docs/WRAPS.md / docs/DEPS.md を更新'); }
else { let snap = {}; try { snap = JSON.parse(fs.readFileSync(snapF, 'utf8')); } catch (e) { err('tools/wraps.snapshot.json が無い → node tools/deps.js --update'); }
  const keys = new Set([...Object.keys(snap), ...Object.keys(sorted)]);
  for (const k of keys) { const a = (snap[k] || []).join(' → '), b = (sorted[k] || []).join(' → ');
    if (a !== b) err(`ラップの並びが変わった ${k}\n    前: ${a || '(なし)'}\n    今: ${b || '(なし)'}\n    → 意図した変更なら node tools/deps.js --update`); } }
if (errors) { console.log(errors + ' deps error(s)'); process.exit(1); }
console.log('DEPS OK (完全版だけの名前 ' + fullNames.size + ' 個 / ラップ ' + Object.keys(sorted).length + ' 種)');
