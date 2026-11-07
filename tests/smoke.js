// スモークテスト: 複数シードで長時間シミュレーションし、例外・NaN・リークを検出する。
// 実行: node tests/smoke.js [--minutes=15] [--seeds=6]
const { createGame } = require('../tools/harness');
const arg = (k, d) => { const a = process.argv.find(s => s.startsWith('--' + k + '=')); return a ? +a.split('=')[1] : d; };
const MIN = arg('minutes', 15), SEEDS = arg('seeds', 6);
let failures = 0;
const fail = (seed, msg) => { failures++; console.error(`FAIL seed=${seed}: ${msg}`); };

for (let seed = 1; seed <= SEEDS; seed++) {
  let g;
  try { g = createGame({ seed }); } catch (e) { fail(seed, 'load: ' + e.stack); continue; }
  try {
    g.start();
    // 強制イベントを混ぜて低確率パスも通す(プレイ中の時刻 t 秒で発火)
    const forced = {
      20: 'bigHit(false)', 60: 'bigHit(true)', 100: 'ult()', 140: 'awaken()', 170: 'golden()',
      200: 'G.fv=8', 230: 'mini()', 232: 'stopMG()', 260: 'startRoul(atk()*40)', 300: "G.stage=4;spawn();kill()", 330: 'kill()',
    };
    const buyer = () => g.eval('G.gold=Math.max(G.gold,1e6);for(let i=0;i<UP.length;i++)buy(i)');
    for (let s = 0; s < MIN * 60; s++) {
      g.advance(1, 0.05);
      if (forced[s]) g.eval(forced[s]);
      if (s % 30 === 0) buyer();
      if (s % 7 === 0) g.eval("P.addEventListener&&P._ev&&P._ev.pointerdown&&P._ev.pointerdown({clientX:100+Math.random()*160,clientY:50})");
      // 不変条件
      const st = g.eval('({gold:G.gold,hp:G.hp,mx:G.mx,sp:G.sp,rush:G.rush,q:G.q,ql:QL.length,balls:balls.length,F:F.length,PT:PT.length,PR:PR.length,FX:FX.length,stage:G.stage,cmb})');
      for (const k of ['gold', 'hp', 'mx', 'sp', 'rush', 'stage']) if (!Number.isFinite(st[k])) fail(seed, `${k} is ${st[k]} at t=${s}s`);
      if (st.q < 0 || st.q > 4) fail(seed, `G.q out of range (${st.q}) at t=${s}s`);
      if (st.ql > 4) fail(seed, `QL too long (${st.ql}) at t=${s}s`);
      if (st.balls > 200) fail(seed, `balls leak (${st.balls}) at t=${s}s`);
      if (st.F > 150 || st.PT > 1500 || st.PR > 100 || st.FX > 20) fail(seed, `fx array leak ${JSON.stringify(st)} at t=${s}s`);
      if (failures > 8) break;
    }
    const end = g.eval('({stage:G.stage,gold:G.gold,lv:G.lv.join(",")})');
    console.log(`seed=${seed} ok  ${MIN}min  stage=${end.stage}  osc=${g.audio.osc}`);
  } catch (e) { fail(seed, e.stack.split('\n').slice(0, 6).join('\n')); }
  if (failures > 8) break;
}
if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1); }
console.log('\nSMOKE OK');
