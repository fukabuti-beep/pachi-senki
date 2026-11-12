// セーブの頑丈さ: ソースに出てくる全キー(pachi2… / pbak_…)に壊れた値を入れても、起動できて3秒動かして例外が出ない(完全版と体験版)
const fs = require('fs'), path = require('path');
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL: ' + m) } };
const dir = path.join(__dirname, '../src/js'), all = fs.readdirSync(dir).map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
const keys = [...new Set([...all.matchAll(/['"]((?:pachi2|pbak_)[a-z0-9_]*)['"]/g)].map(m => m[1]))].sort();
ok(keys.length >= 30, 'キーが集まらない: ' + keys.length);
const BAD = ['', 'null', '{', '[]', '123', '"x"', '{"lv":"a","n":-5,"d":12,"own":[1],"cur":{"a":1},"best":1e999,"sel":{},"s":7,"g":"x"}', '{"lv":[[null,-1,"z"],7],"hp":[null],"n":"NaN","k":99,"r":-3}', 'x'.repeat(5000)];
for (const ed of ['full', 'free']) BAD.forEach((bad, bi) => {
  const storage = {}; for (const k of keys) storage[k] = bad;
  let g; try { g = createGame({ seed: 20 + bi, storage, globals: ed === 'free' ? { PACHI_EDITION: 'free' } : {} }); g.start(); g.advance(3, .05); }
  catch (e) { ok(false, `[${ed}] 壊れた値 #${bi} で起動できない: ${e.message}`); return; }
  ok(g.eval('FERR') === 0, `[${ed}] 壊れた値 #${bi} で更新中に例外 ${g.eval('FERR')}`);
  const s = g.eval('JSON.stringify([G.gold,G.stage,G.hp,G.mx])'); ok(!/null|NaN/.test(s), `[${ed}] 壊れた値 #${bi} で数値が壊れた ${s}`);
});
// 1キーずつ壊す(他は正常)。組み合わせで隠れる不具合を拾う
for (const k of keys) { const storage = { [k]: '{"lv":"a","n":-5,"d":12,"own":[1],"cur":{"a":1},"sel":{},"s":7}' };
  try { const g = createGame({ seed: 3, storage }); g.start(); g.advance(1, .05); ok(g.eval('FERR') === 0, k + ' だけ壊すと例外'); } catch (e) { ok(false, k + ' だけ壊すと起動できない: ' + e.message); } }
console.log(fails ? fails + ' savekeys failure(s)' : 'SAVEKEYS OK (' + keys.length + ' キー)'); process.exit(fails ? 1 : 0);
