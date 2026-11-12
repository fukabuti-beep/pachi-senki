// 物語とキャラクターの一貫性(docs/STORY.md が正)
//  1) 口調: 物語の会話・戦闘の吹き出し・チュートリアル・カットインの台詞が、話す英雄の「使わない言葉」を含まないか
//  2) 色・名前: docs/STORY.md の表とゲーム内(98s の STH)が同じか
//  3) 物語の骨組み: 8エリアそれぞれに 到着(a)と撃破(b)のシーンがあり、STAGE と出てくる敵(エリアの主)が合っているか
//  4) 体験版の終点(STAGE 175 の撃破シーン)が体験版でも出るか
const fs = require('fs'), path = require('path');
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL: ' + m) } };
const g = createGame({ seed: 1 }); g.start(); g.advance(1, .05);
const J = s => JSON.parse(g.eval('JSON.stringify(' + s + ')'));

// docs/STORY.md の「使わない」と同じルール(資料を変えたらここも)
const NG = [
  { n: 'ホムラ', re: [/僕/, /私/, /わよ/, /わね/, /かしら/, /わ[!!。…?]*$/] },
  { n: 'シズク', re: [/俺/, /僕/, /だぜ/, /ぞ[!!。]/, /ぜ[!!。]*$/] },
  { n: 'コハク', re: [/俺/, /私/, /だぜ/, /わよ/, /わね/, /かしら/, /わ[!!。…?]*$/, /ぜ[!!。]*$/] },
  { n: 'ツララ', re: [/俺/, /僕/, /私/, /だぜ/, /わよ/, /わね/, /ぜ[!!。]*$/] }];
const lines = [];   // [英雄, 台詞, どこ]
for (const sc of J('SCN')) for (const [w, t] of sc.L) if (w <= 3) lines.push([w, t, '物語 ' + sc.id]);
const HLC = J('HLC'); for (const k in HLC) HLC[k].forEach((a, i) => a.forEach(t => lines.push([i, t, '吹き出し ' + k])));
for (const tg of J('TG.map(x=>[x.who,x.tx,x.id])')) lines.push([tg[0], tg[1], 'チュートリアル ' + tg[2]]);
J('CUTL').forEach((a, i) => a.forEach(t => lines.push([i, t, 'カットイン'])));
for (const [w, t, where] of lines) for (const r of NG[w].re) if (r.test(t)) ok(false, `${NG[w].n} の口調に合わない(${r}): 「${t}」(${where})`);
ok(lines.length > 80, '台詞が集まっていない: ' + lines.length);

// 2) 色と名前
const doc = fs.readFileSync(path.join(__dirname, '../docs/STORY.md'), 'utf8');
const sth = J('STH');
const colRow = (doc.split('\n').find(l => /^\| 色 \|/.test(l)) || ''), cols = colRow.match(/#[0-9a-fA-F]{6}/g) || [];
sth.forEach((h, i) => { ok(doc.includes(h.n + '(' + h.r + ')'), `docs/STORY.md に ${h.n}(${h.r}) が無い`); ok(cols[i] && cols[i].toLowerCase() === h.c.toLowerCase(), `${h.n} の色が資料(${cols[i]})とゲーム(${h.c})で違う`); });
ok(g.eval('typeof hupMenu==="function"') && sth.slice(0, 3).every(h => g.eval('hupMenu()').includes(h.c)), '英雄の強化画面の色が物語と違う');
ok(sth.length === 4 && J('SCN').filter(sc => sc.L.some(l => l[0] === 3)).length >= 4, 'ツララの台詞が加入シーン以外にもある(完全版)');

// 3) 骨組み
const scn = J('SCN'), byId = Object.fromEntries(scn.map(s => [s.id, s]));
for (let a = 0; a < 8; a++) {
  const A = byId['a' + a], B = byId['b' + a];
  ok(A, `エリア${a + 1} の到着シーン a${a} が無い`); ok(B, `エリア${a + 1} の撃破シーン b${a} が無い`);
  if (A && a > 0) ok(A.h === 'STAGE ' + (25 * a + 1), `a${a} の STAGE 表示が違う: ${A.h}`);
  if (B) ok(B.h === 'STAGE ' + (25 * (a + 1)), `b${a} の STAGE 表示が違う: ${B.h}`);
  for (const S of [A, B]) if (S && S.e) ok(S.e === 'b' + (4 + a), `${S.id} に出る敵 ${S.e} がエリア${a + 1}の主(b${4 + a})と違う`);
}
// 4) 体験版の終点
const f = createGame({ seed: 2, globals: { PACHI_EDITION: 'free' } }); f.start(); f.advance(1, .05);
f.eval('if(fxOpen)fxClose();RL=null;G.roul=0;G.jp=0;cut=null;G.stage=175;X.best=175;spawn();G.hp=0;kill()');
ok(f.eval('STY.q.indexOf("b6")>=0||(STY.cur&&STY.cur.id==="b6")||TS.s.b6===1'), '体験版の終点で宙域の主の撃破シーン(b6)が出ない');
console.log(fails ? fails + ' story failure(s)' : 'STORY OK (台詞 ' + lines.length + ')'); process.exit(fails ? 1 : 0);
