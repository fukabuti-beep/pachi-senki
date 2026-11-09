// タイトル画面 89d-title / タイトル曲 79c-titlebgm: #go で開始できる・最初のタップでタイトル曲・スタートでジングル→ゲーム曲・AC 無し/壊れでも落ちない・曲データの形式
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };

// 1) 曲データ: モチーフ 32文字 / パターン 16文字 / 使える文字だけ / コードとモチーフ番号が範囲内
{ const g = createGame({ seed: 1 });
  const S = JSON.parse(g.eval('JSON.stringify(SONGS.tt,(k,v)=>typeof v==="function"?undefined:v)'));
  ok(S.bpm >= 100 && S.bpm <= 170, 'tempo ' + S.bpm);
  ok(S.mt.length >= 1 && S.mt.every(m => m.length === 32 && /^[0-9a-z.\-]+$/.test(m)), 'motif format');
  ['ar', 'bs', 'dk', 'ds', 'dh'].forEach(k => ok(S[k].length === 2 && S[k].every(p => p.length === 16), 'pattern ' + k));
  ok(S.ar.every(p => /^[0-5.]+$/.test(p)), 'arp chars');
  ok(S.bs.every(p => /^[rofuemt.]+$/.test(p)), 'bass chars');
  ok(S.ch.length === 2 && S.ch.every(sec => sec.length === 4 && sec.every(c => c[0] >= 0 && c[0] <= 6 && ['m', 'M', 'd', 's'].includes(c[1]))), 'chords');
  ok(S.lm.every(sec => sec.length === 4 && sec.every(i => i >= 0 && i < S.mt.length)), 'motif index');
  ok(g.eval('SRANK.tt') < 0, 'title rank lowest');
  ok(g.eval('typeof AC==="undefined"||!AC'), 'AC not created at load');
  ok(g.eval('bgmState()') === 'tt', 'title state while title shown');
}
// 2) 最初のタップ → タイトル曲が鳴る → スタートでジングル → ゲーム曲へ
{ const g = createGame({ seed: 2 });
  ok(g.eval('ttTap()') === true, 'first tap creates audio');
  ok(g.eval('!!AC&&!!BG.iv&&BG.s') === 'tt', 'title song playing');
  let o = g.audio.osc; g.advance(6, 0.05); ok(g.audio.osc - o > 60, 'title song notes ' + (g.audio.osc - o));
  ok(!g.eval('run'), 'tap does not start the game');
  const ac0 = g.eval('AC'); g.start();
  ok(g.eval('run') === true, 'go starts');
  ok(g.eval('AC') === ac0, 'AC kept (no second context)');
  ok(g.eval('BG.s') === 'tt' && g.eval('BG.nx-AC.currentTime') > 1, 'jingle holds game BGM');
  g.advance(2, 0.05);
  ok(g.eval('BG.s') !== 'tt' && g.eval('bgmState()') !== 'tt', 'game BGM after jingle: ' + g.eval('BG.s'));
  o = g.audio.osc; g.advance(3, 0.05); ok(g.audio.osc - o > 30, 'game BGM plays');
  ok(g.eval('ttGo()') === false, 'ttGo only once');
}
// 3) いきなりスタート(タップ無し): 互換 — #go の onclick だけで開始、ジングル→ゲーム曲
{ const g = createGame({ seed: 3 }); g.start();
  ok(g.eval('run') === true && !!g.eval('AC'), 'direct start');
  g.advance(2, 0.05); ok(g.eval('BG.s') !== 'tt', 'direct start -> game BGM');
  g.advance(30, 0.05); ok(Number.isFinite(g.eval('G.gold')), 'game runs');
}
// 4) ミュート中: タップしても無音、スタートも OK
{ const g = createGame({ seed: 4, storage: { pachi2snd: JSON.stringify({ b: .7, s: .9, m: 1 }) } });
  g.eval('ttTap()'); const o = g.audio.osc; g.advance(3, 0.05); ok(g.audio.osc - o === 0, 'muted title silent');
  g.start(); g.advance(2, 0.05); ok(g.audio.osc - o === 0, 'muted jingle silent'); ok(g.eval('run'), 'muted start');
}
// 5) AC 無し / 壊れた AC でも落ちない
for (const audio of ['none', 'broken', 'suspended']) {
  const g = createGame({ seed: 5, audio });
  let err = null; try { g.eval('ttTap();ttSnd()'); g.advance(1, 0.05); g.start(); g.advance(5, 0.05); } catch (e) { err = e; }
  ok(!err, audio + ': no exception ' + (err && err.message)); ok(g.eval('run') === true, audio + ': started');
}
// 6) 描画・更新が DOM スタブでも例外を出さない(寸法を与えて直接回す)
{ const g = createGame({ seed: 6 });
  let err = null;
  try { g.eval('TTL.W=131;TTL.H=284;TTL.box={l:10,t:100,r:120,b:210};TTL.lg={x:20,y:110,w:90,h:24};ttPins();TTL.x=$("ttbg").getContext("2d");for(let i=0;i<600;i++){ttStep(.05);ttDraw()}'); } catch (e) { err = e; }
  ok(!err, 'title step/draw ' + (err && err.message));
  ok(g.eval('TTL.balls.length<=40&&TTL.P.length<=220&&TTL.tw.length<=24&&TTL.F.length<=8'), 'title arrays bounded');
  ok(g.eval('TTL.P.length+TTL.F.length') >= 0 && g.eval('TTL.ht.some(v=>v>0)'), 'heroes attacked enemies');
}
if (fails) { console.error(fails + ' title failure(s)'); process.exit(1); }
console.log('TITLE OK');
