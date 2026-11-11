// チュートリアル(98t-tutorial)と物語(98s-story)
// 空のセーブ: プロローグ→序盤ガイドが順に出る / 二度目は出ない / 旧セーブには序盤ガイドを出さない / 演出中は待つ / 物語タブ
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const closeModal = g => { if (g.eval('fxOpen')) g.eval('fxClose()') };
const S = g => JSON.parse(g.eval('JSON.stringify({s:STY.cur&&STY.cur.id,i:STY.cur&&STY.cur.i,q:STY.q,t:TUT.cur&&TUT.cur.g.id,TS})'));
let saved;
{
  const g = createGame({ seed: 3 }); g.start(); g.advance(.3); closeModal(g);
  ok(g.eval('Math.random') === g.eval('Math.random'), 'noop');
  // プロローグ(エリアのタイトル帯のあと)
  let seenScene = false, guides = [];
  for (let i = 0; i < 400; i++) { g.advance(.5); closeModal(g); const s = S(g); if (s.s === 'a0') seenScene = true; if (s.t && guides[guides.length - 1] !== s.t) guides.push(s.t);
    if (s.s) ok(!s.t, 'シーンとガイドが同時に出た'); }
  ok(seenScene, 'プロローグが出ない');
  const intro = ['ball', 'slot', 'hero', 'tap'];
  ok(JSON.stringify(guides.slice(0, 4)) === JSON.stringify(intro), '序盤ガイドの順番: ' + guides.join(','));
  ok(guides.includes('up') && guides.includes('rush'), '強化/RUSH のガイド: ' + guides.join(','));
  ok(g.eval('FERR') === 0, 'FERR=' + g.eval('FERR'));
  // タップで早送り: 文字送り→次の行→閉じる
  g.eval('styStart("a1")'); ok(S(g).s === 'a1' && S(g).i === 0, '再生'); g.eval('styTap()'); ok(S(g).i === 0, '1回目のタップは文字送り'); g.eval('styTap()'); ok(S(g).i === 1, '2回目で次の行');
  g.eval('styTap();styTap();styTap();styTap()'); ok(!S(g).s, 'タップで最後まで進むと閉じる');
  // 放置: 自動で閉じる
  g.eval('styStart("a2")'); g.advance(15); closeModal(g); ok(!S(g).s, '放置で自動で閉じない');
  // 演出中は時間が止まる
  g.eval('styStart("a3")'); g.advance(.5); g.eval('G.jp=30'); const i0 = S(g).i; g.advance(10); ok(S(g).s === 'a3' && S(g).i === i0, 'JACKPOT 中に進んだ'); g.eval('G.jp=0;styClose()');
  // エリアの主の撃破 → 撃破シーン → 次のエリアの登場シーン
  g.eval('G.stage=24;spawn();G.hp=1;hurt(10,"#fff")'); g.advance(.3); closeModal(g); g.eval('G.hp=1;hurt(1e30,"#fff")'); g.advance(.1);
  ok(g.eval('G.stage') === 26, '撃破できない'); ok(S(g).q[0] === 'b0' && S(g).q.includes('a1') === false || S(g).q[0] === 'b0', 'b0 が先頭に入らない: ' + JSON.stringify(S(g).q));
  ok(!S(g).s, 'AREA CLEAR 中にシーンが出た');
  let order = []; for (let i = 0; i < 120; i++) { g.advance(.25); closeModal(g); g.eval('if(MG)stopMG&&stopMG()'); const s = S(g); if (s.s && order[order.length - 1] !== s.s) order.push(s.s) }
  ok(order[0] === 'b0', '撃破シーン: ' + order.join(','));
  // 新機能ガイド: 転生
  g.eval('G.stage=31;X.best=31;spawn()'); let pr = false; for (let i = 0; i < 80; i++) { g.advance(.25); closeModal(g); if (S(g).t === 'pres') pr = true } ok(pr, '転生ガイドが出ない');
  // メニュー
  ok(g.eval('!FM.some(m=>m.n==="物語")&&FM.some(m=>m.n==="遊び方")'), '物語タブは出さない(作り手の希望)/遊び方タブはある');
  ok(g.eval('typeof tutSkip')=== 'function', 'skip');
  ok(g.eval('F.length<=200&&PT.length<=2000&&STY.q.length<=6'), '配列上限');
  saved = { ...g.store };
}
// 二度目(同じセーブ)は序盤ガイド・プロローグを出さない
{
  const g = createGame({ seed: 4, storage: saved }); g.start(); g.advance(.3); closeModal(g);
  let any = []; for (let i = 0; i < 60; i++) { g.advance(.5); closeModal(g); const s = S(g); if (s.s) any.push(s.s); if (s.t && ['ball', 'slot', 'hero', 'tap', 'up'].includes(s.t)) any.push(s.t) }
  ok(any.length === 0, '二度目に出た: ' + any.join(','));
}
// 旧セーブ(すでに進んでいる人): 序盤ガイドもプロローグも出ない。通過済みのシーンは既読(読める)
{
  const g = createGame({ seed: 5, storage: { pachi2: JSON.stringify({ v: 2, gold: 5000, stage: 60, lv: [9, 9, 5, 5, 5, 5, 5, 5, 5, 5] }), pachi2x: JSON.stringify({ best: 80, pres: 2, souls: 30 }) } });
  ok(g.eval('TS.old') === 1 && g.eval('TS.skip') === 1, '旧セーブ判定');
  ok(g.eval('TS.s.a0&&TS.s.b0&&TS.s.a2&&TS.s.p1&&!TS.s.b3&&!TS.s.a4') == 1, '既読の範囲: ' + g.eval('JSON.stringify(TS.s)'));
  ok(g.eval('TS.g.ball&&TS.g.menu&&TS.g.pres&&TS.g.altar') == 1, '旧セーブのガイド既読');
  g.start(); g.advance(.3); closeModal(g);
  let any = []; for (let i = 0; i < 60; i++) { g.advance(.5); closeModal(g); const s = S(g); if (s.s) any.push(s.s); if (s.t) any.push(s.t) }
  ok(!any.some(x => ['ball', 'slot', 'hero', 'tap', 'up', 'rush', 'a0', 'a2'].includes(x)), '旧セーブに序盤が出た: ' + any.join(','));
}
// スキップ: 序盤ガイドは全部消え、新機能ガイドは残る
{
  const g = createGame({ seed: 6 }); g.start(); g.advance(.3); closeModal(g);
  g.eval('styClose();STY.q.length=0;TS.s.a0=1'); g.advance(3); closeModal(g);
  ok(S(g).t === 'ball', '最初のガイド'); g.eval('tutSkip()');
  ok(g.eval('["ball","slot","hero","tap","up","rush"].every(k=>TS.g[k])') && g.eval('TS.skip') === 1, 'スキップ');
  g.eval('G.stage=10;X.best=10;spawn()'); let m = false; for (let i = 0; i < 60; i++) { g.advance(.5); closeModal(g); if (S(g).t === 'menu' || S(g).t === 'exp') m = true } ok(m, 'スキップ後も新機能ガイドは出る');
  ok(JSON.parse(g.store.pachi2_tut).skip === 1, '保存');
}
// 壊れたセーブ/localStorage 不可でも落ちない
{ const g = createGame({ seed: 7, storage: { pachi2_tut: '{bad' } }); g.start(); g.advance(5); ok(g.eval('FERR') === 0, '壊れたセーブ') }
{ const g = createGame({ seed: 8, ls: 'throw' }); g.start(); g.advance(5); ok(g.eval('FERR') === 0, 'localStorage 不可') }
if (bad) { console.error(bad + ' failure(s)'); process.exit(1) }
console.log('TUTORIAL OK');
