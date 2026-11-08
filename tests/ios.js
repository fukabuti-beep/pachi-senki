// iPhone 向け調整 97v-ios: タッチの抑止(入力欄/スクロール領域は除く)・音の休止/再開・AC を勝手に作らない・フォント到着で描き直し
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
const ev = (o = {}) => { const e = { cancelable: true, prevented: false, preventDefault() { this.prevented = true; }, ...o }; return e; };
(async () => {
  // 1) スタート前: AC は作られない(ユーザー操作後に生成の約束)。タッチ/復帰イベントで落ちない
  { const g = createGame({ seed: 1 });
    g.fire('touchstart'); g.fire('visibilitychange', { hidden: false }); g.fire('pageshow'); g.advance(5, 0.1);
    ok(g.eval('typeof AC==="undefined"||!AC'), 'AC not created before start'); }
  // 2) touchmove: 盤面では止める・2本指は止める・入力欄は止めない・非 cancelable は触らない
  { const g = createGame({ seed: 2 }); g.start();
    const tm = g.eval('iosTouchMove');
    const a = ev({ target: { tagName: 'CANVAS', nodeType: 1 } }); tm(a); ok(a.prevented, 'touchmove on board prevented');
    const b = ev({ target: { tagName: 'INPUT', nodeType: 1 } }); tm(b); ok(!b.prevented, 'touchmove on input allowed');
    const c = ev({ target: { tagName: 'INPUT', nodeType: 1 }, touches: [1, 2] }); tm(c); ok(c.prevented, 'pinch prevented');
    const d = ev({ cancelable: false, target: { tagName: 'DIV', nodeType: 1 } }); tm(d); ok(!d.prevented, 'non-cancelable untouched');
    const m = g.eval('iosNoMenu'); const e = ev({ target: { tagName: 'CANVAS' } }); m(e); ok(e.prevented, 'contextmenu prevented');
    const f = ev({ target: { tagName: 'TEXTAREA' } }); m(f); ok(!f.prevented, 'contextmenu on textarea allowed'); }
  // 3) 音: iOS に止められた(suspended/interrupted)後、戻った・触った時に resume。ミュート中(BGM の再開処理が止まる)でも戻る
  { const g = createGame({ seed: 3 }); g.start(); g.advance(1, 0.05); g.eval('setMute(true)');
    g.eval('AC.state="suspended"'); g.fire('visibilitychange', { hidden: true }); g.advance(1, 0.1);
    ok(g.eval('AC.state') === 'suspended', 'no resume while hidden');
    g.fire('visibilitychange', { hidden: false }); ok(g.eval('AC.state') === 'running', 'resume on visible');
    g.eval('AC.state="suspended"'); g.fire('pageshow'); ok(g.eval('AC.state') === 'running', 'resume on pageshow');
    g.eval('AC.state="suspended"'); g.fire('touchstart'); ok(g.eval('AC.state') === 'running', 'resume on touchstart');
    g.eval('setMute(false)');
    g.eval('AC.state="interrupted"'); g.advance(3, 0.1); ok(g.eval('AC.state') === 'running', 'recover from interrupted');
    g.advance(20, 0.05); ok(Number.isFinite(g.eval('G.gold')), 'game keeps running'); }
  // 4) フォント: DotGothic16 が loaded になったら 1 回だけ描き直し
  { const g = createGame({ seed: 4 }); g.start();
    ok(g.eval('iosFontReady()') === false, 'no font yet');
    g.eval('document.fonts.forEach=fn=>[{family:"DotGothic16",status:"loaded"}].forEach(fn);WCH={}');
    ok(g.eval('iosFontReady()') === true && g.eval('WCH') === null, 'rebuild on font loaded');
    ok(g.eval('iosFontReady()') === false, 'only once'); }
  // 5) AudioContext 無しの環境でも落ちない
  { const g = createGame({ seed: 5, audio: 'none' }); g.start(); g.fire('visibilitychange', { hidden: true }); g.fire('visibilitychange', { hidden: false }); g.advance(5, 0.1); ok(true, 'no audio ok'); }
  if (fails) { console.error(fails + ' ios failure(s)'); process.exit(1); }
  console.log('IOS OK');
})();
