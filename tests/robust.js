// 堅牢性テスト(ui/QA): localStorage 不可 / セーブ破損 / タブ非表示→復帰 / 極端なリサイズ / 100連打 / 長時間放置後の復帰
const { createGame } = require('../tools/harness');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
const sane = (g, tag) => {
  const s = g.eval('({gold:G.gold,stage:G.stage,hp:G.hp,mx:G.mx,sp:G.sp,rush:G.rush,lv:G.lv.slice(),balls:balls.length,F:F.length,PT:PT.length,PR:PR.length,FX:FX.length,jp:G.jp,fv:G.fv})');
  for (const k of ['gold', 'stage', 'hp', 'mx', 'sp', 'rush', 'jp', 'fv']) ok(Number.isFinite(s[k]), `${tag}: ${k}=${s[k]}`);
  ok(s.gold >= 0 && s.stage >= 1 && Number.isInteger(s.stage), `${tag}: gold/stage range (${s.gold},${s.stage})`);
  ok(s.lv.every(v => Number.isInteger(v) && v >= 1), `${tag}: lv ${s.lv}`);
  ok(s.balls <= 200 && s.F <= 150 && s.PT <= 1500 && s.PR <= 100 && s.FX <= 20, `${tag}: array leak ${JSON.stringify(s)}`);
  return s;
};
const boot = (o, secs = 20, tag = 'boot') => {
  let g; try { g = createGame(o); g.start(); g.advance(secs, 0.05); } catch (e) { ok(false, tag + ': exception ' + e.stack.split('\n').slice(0, 3).join(' | ')); return null; }
  sane(g, tag); ok(g.eval('typeof FERR') === 'undefined' || g.eval('FERR') === 0, tag + ': FERR=' + g.eval('FERR')); return g;
};

// 1) localStorage が使えない(参照で例外 / setItem で例外)
boot({ seed: 1, ls: 'throw' }, 30, 'ls=throw');
boot({ seed: 2, ls: 'setthrow' }, 30, 'ls=setthrow');
{ // setItem 例外でも設定パネルの操作で落ちない
  const g = boot({ seed: 2, ls: 'setthrow' }, 5, 'ls=setthrow+ui');
  if (g) { try { g.eval("$('cfgb')._ev.click();$('cfgF0')._ev.click();$('cfgMute')._ev.click();$('cfgYes')._ev.click&&0"); } catch (e) { ok(false, 'settings with failing storage: ' + e.message); } }
}

// 2) セーブ破損(壊れたJSON/型違い/極端値)。全キーに同じ値を入れる
const bad = ['not json{', '', 'null', '[]', '123', '"str"', 'true', '{}',
  '{"gold":"abc","stage":"x","lv":"zzz"}', '{"gold":null,"stage":null,"lv":null}', '{"gold":-5,"stage":0,"lv":[null,"a",-3,1e999,{},[]]}',
  '{"gold":1e999,"stage":1e999,"lv":[1e999]}', '{"gold":1e308,"stage":5000000,"lv":[99999999,1,1,99999999]}', '{"gold":{"a":1},"stage":[3],"lv":{"0":9}}',
  '{"v":2,"gold":12.5,"stage":7.9,"lv":[3.7,2,1,1,1,1,1,1,1,1]}', '{"t":"x","souls":"y","pres":-1,"best":"z","ach":5,"st":"q"}', '{"t":1e999,"souls":-9,"ach":[1],"st":{"hit":"a"}}',
  '{"bgm":"loud","se":null,"fl":9,"mute":"yes"}', '{"wake":"x"}'];
bad.forEach((v, i) => {
  const st = { pachi2: v, pachi2x: v, pachi2ui: v, pachi2app: v };
  const g = boot({ seed: 10 + i, storage: st }, 25, 'corrupt#' + i + ' ' + JSON.stringify(v).slice(0, 40));
  if (g) { const s = sane(g, 'corrupt#' + i); ok(g.eval('refresh(),1'), 'refresh'); }
});
{ // 正常なセーブは保たれる
  const g = createGame({ seed: 3, storage: { pachi2: JSON.stringify({ v: 2, gold: 12345, stage: 4, lv: [3, 2, 1, 1, 1, 1, 1, 1, 1, 1] }) } });
  ok(g.eval('G.gold') === 12345 && g.eval('G.stage') >= 1 && g.eval('G.lv[0]') === 3 && g.eval('G.lv[1]') === 2, 'valid save preserved');
}

// 3) タブ非表示→復帰: 非表示中は rAF が止まる(=loop が呼ばれない)。復帰時に時間が飛んでも崩れない
{
  const g = boot({ seed: 5 }, 20, 'visibility'); if (g) {
    g.fire('visibilitychange', { hidden: true });
    const goldBefore = g.eval('G.gold');
    // 3時間放置: X.t を過去にして復帰 → おかえりモーダル、ゴールドは有限で増える
    g.eval('X.t=Date.now()-3*3600*1000');
    g.fire('visibilitychange', { hidden: false });
    g.advance(4, 0.05);
    ok(g.eval('fxOpen') === true || g.eval('G.gold') >= goldBefore, 'returns with offline bonus modal');
    sane(g, 'after 3h hidden');
    // 極端な dt(ts が飛ぶ/逆行/NaN/Infinity)でも状態が壊れない
    for (const ts of [1e12, -5000, NaN, Infinity, 0, 1e300]) { try { g.eval(`loop(${ts})`); } catch (e) { ok(false, 'loop(' + ts + '): ' + e.message); } }
    g.advance(10, 0.05); sane(g, 'after weird timestamps');
    ok(Number.isFinite(g.eval('T')), 'T finite after weird timestamps');
    // 非表示→復帰を連続で繰り返す
    for (let i = 0; i < 20; i++) { g.fire('visibilitychange', { hidden: true }); g.fire('visibilitychange', { hidden: false }); g.advance(0.5, 0.05); }
    sane(g, 'visibility flapping');
  }
}

// 4) 極端なリサイズ
{
  const g = boot({ seed: 6 }, 3, 'resize'); if (g) {
    for (const [w, h] of [[0, 0], [1, 1], [10, 10000], [10000, 10], [320, 568], [852, 393], [NaN, NaN], [-5, -5], [Infinity, 800], [393, 852]]) {
      g.setSize(w, h);
      try { g.fire('resize'); g.fire('orientationchange'); } catch (e) { ok(false, `resize ${w}x${h}: ${e.message}`); }
      g.advance(0.3, 0.05);
    }
    const tr = g.els.scl && g.els.scl.style.transform;
    ok(!tr || /^scale\([0-9.]+\)$/.test(tr), 'transform stays a finite scale: ' + tr);
    sane(g, 'after resize');
  }
}

// 5) 連打: 盤面100連打 + ハンドル連射 + 強化ボタン連打。配列/DOMが増え続けない
{
  const g = boot({ seed: 7 }, 10, 'tap spam'); if (g) {
    const spam = (rounds) => {
      for (let r = 0; r < rounds; r++) {
        for (let i = 0; i < 100; i++) {
          g.eval("P._ev&&P._ev.pointerdown&&P._ev.pointerdown({clientX:20+Math.random()*320,clientY:50,preventDefault(){}})");
          g.eval("$('hd')._ev&&$('hd')._ev.pointerdown&&$('hd')._ev.pointerdown({preventDefault(){}})");
          g.eval('buy(Math.floor(Math.random()*UP.length))');
        }
        const s = sane(g, 'spam round ' + r); ok(s.balls <= 200, 'balls bounded after 100 taps (' + s.balls + ')');
        g.eval("$('hd')._ev&&$('hd')._ev.pointerup&&$('hd')._ev.pointerup({})");
        g.advance(2, 0.05);
      }
      // 強制イベント連発(大当たり/ジャックポット/ミニゲーム/ルーレットを重ねて呼ぶ)
      for (let i = 0; i < 30; i++) { g.eval(['bigHit(false)', 'bigHit(true)', 'mini()', 'ult()', 'awaken()', 'golden()', 'startRoul(1e3)', 'pushPress(0)', 'stopMG()', 'G.fv=8'][i % 10]); g.advance(0.3, 0.05); }
      g.advance(60, 0.05);
      sane(g, 'event spam');
    };
    spam(3);                                           // ウォームアップ(キャッシュ類が埋まる)
    const dom0 = g.stats.created, ap0 = g.stats.appended;
    spam(5);
    ok(g.stats.appended === ap0, 'body.appendChild not growing (' + (g.stats.appended - ap0) + ')');
    // 描画キャッシュ(ドット文字/背景/ビネット等)の初出で数十個は増える。タップ毎のリークなら数百〜数千になる
    ok(g.stats.created - dom0 < 60, `DOM creation does not keep growing after warm-up (${g.stats.created - dom0} new)`);
  }
}

// 6) 長時間放置: 30分連続 + 8時間放置の復帰 + 復帰後さらに5分
{
  const g = boot({ seed: 8 }, 5, 'idle'); if (g) {
    const buyer = () => g.eval('G.gold=Math.max(G.gold,1e5);for(let i=0;i<UP.length;i++)buy(i)');
    for (let m = 0; m < 30; m++) { g.advance(60, 0.05); if (m % 5 == 0) buyer(); }
    sane(g, '30min idle');
    const g0 = g.eval('G.gold');
    g.eval('X.t=Date.now()-8*3600*1000'); g.fire('visibilitychange', { hidden: false }); g.advance(3, 0.05);
    const g1 = g.eval('G.gold'); ok(Number.isFinite(g1) && g1 >= g0, 'gold after 8h away is finite and not lower');
    g.eval('X.t=Date.now()-1e12'); g.fire('visibilitychange', { hidden: false }); g.advance(3, 0.05);   // 壊れた時刻でも上限(8h)で頭打ち
    g.eval('X.t=Date.now()+1e9'); g.fire('visibilitychange', { hidden: false }); g.advance(3, 0.05);   // 未来の時刻
    g.advance(300, 0.05); sane(g, 'after return');
  }
}
if (fails) { console.error(fails + ' robustness failure(s)'); process.exit(1); }
console.log('ROBUST OK');
