// 音声テスト: 仮想時計で (a)10分間で例外なし (b)発音数/同時発音が過剰でない (c)AudioContext無し/壊れていても動く
// (d)ミュート/音量の保存 (e)iOS(suspended)で resume される (f)全BGM状態と全SEが一度は鳴る
// 実行: node tests/audio.js [--minutes=10]
const { createGame } = require('../tools/harness');
const arg = (k, d) => { const a = process.argv.find(s => s.startsWith('--' + k + '=')); return a ? +a.split('=')[1] : d; };
const MIN = arg('minutes', 10);
let failures = 0;
const fail = m => { failures++; console.error('FAIL: ' + m); };
const ok = (c, m) => { if (!c) fail(m); };
// しきい値(実測: BGMのみ 1000〜2800/分、自然プレイ(全強化自動購入) 3000〜4800/分、強制イベント連打の負荷試験 最大約6200/分)
const MAX_OSC_PER_MIN = 7000, MAX_NATURAL_PER_MIN = 6000, MAX_CONCURRENT = 90;

const peak = spans => { const ev = []; for (const [s, e] of spans) { ev.push([s, 1], [e + .02, -1]); } ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]); let c = 0, m = 0; for (const [, d] of ev) { c += d; if (c > m) m = c; } return m; };

// 強制イベント(時刻 s 秒で発火)。全SE/全BGM状態を通す
const forced = {
  5: 'G.q=0;QL.length=0;onChucker()', 10: 'banner("チャンス","#fff")', 11: 'banner("チャンス!!","#fff")', 12: 'banner("激アツ!!","#fff")', 13: 'banner("激アツ確定!!","#fff")',
  14: 'showMsg("リーチ!")', 15: 'showMsg("SUPER BATTLE REACH!!")', 20: 'bigHit(false)', 40: 'bigHit(true)', 60: 'G.fv=8', 75: 'G.stage=4;spawn();kill()', 90: 'ult()',
  100: 'awaken()', 110: 'golden()', 120: 'banner("RARE DROP!!","#fff")', 125: 'banner("NEW 強化解放!","#fff")', 130: 'banner("50 COMBO!","#fff")',
  140: 'G.rush=0;showMsg("RUSH終了")', 150: 'jackpot()', 170: 'G.rush=12', 200: 'kyuin(10,"#fff");fan();jara()',
};

function scenario(g, minutes, extra) {
  g.start();
  const seen = new Set();
  for (let s = 0; s < minutes * 60; s++) {
    g.advance(1, 0.05);
    const f = forced[s % 210]; if (f) g.eval(f);
    if (s % 20 === 0) g.eval('G.gold=Math.max(G.gold,1e6);for(let i=0;i<UP.length;i++)buy(i)');
    if (s % 3 === 0) g.eval("if(typeof cmb==='number'){pkHit(2)}hurt(5,'#fff',0,Math.random()<.3)");
    if (extra) extra(s);
    try { seen.add(g.eval('BG.s')); } catch (e) { }
  }
  return seen;
}

// (a)(b)(f) 通常 + 強制イベント
{
  const g = createGame({ seed: 7 });
  let seen = new Set();
  try { seen = scenario(g, MIN); } catch (e) { fail('10分シナリオで例外: ' + e.stack.split('\n').slice(0, 4).join('\n')); }
  const bm = g.audio.byMinute, mins = Object.keys(bm).map(Number);
  const worst = Math.max(...mins.map(m => bm[m])), avg = g.audio.osc / MIN;
  console.log(`通常: ${MIN}分 osc=${g.audio.osc} (平均 ${avg.toFixed(0)}/分, 最大 ${worst}/分) noise=${g.audio.noise} 同時発音ピーク=${peak(g.audio.spans)} PeriodicWave=${g.audio.waves}`);
  ok(worst <= MAX_OSC_PER_MIN, `1分あたりの発音数が過剰: ${worst} > ${MAX_OSC_PER_MIN}`);
  ok(peak(g.audio.spans) <= MAX_CONCURRENT, `同時発音ピークが過剰: ${peak(g.audio.spans)}`);
  ok(g.audio.osc > MIN * 300, '音がほとんど鳴っていない');
  ok(g.audio.waves > 0 && g.audio.waves <= 8, `PeriodicWave の生成数が不正: ${g.audio.waves}`);
  console.log('到達したBGM状態: ' + [...seen].join(','));
  for (const s of ['n', 'b', 'f', 'r', 'j']) ok(seen.has(s), `BGM状態 ${s} に遷移しなかった`);
}

// 自然プレイ(強制イベント無し・全強化自動購入)
{
  const g = createGame({ seed: 11 }); g.start();
  for (let s = 0; s < 300; s++) { g.advance(1, .05); if (s % 30 === 0) g.eval('G.gold=Math.max(G.gold,1e6);for(let i=0;i<UP.length;i++)buy(i)'); }
  const w = Math.max(...Object.values(g.audio.byMinute));
  console.log(`自然プレイ: 5分 最大 ${w} osc/分, 同時発音ピーク=${peak(g.audio.spans)}`);
  ok(w <= MAX_NATURAL_PER_MIN, `自然プレイの発音数が過剰: ${w}`);
}

// BGMだけ(強制イベント無し)の基本負荷
{
  const g = createGame({ seed: 3 }); g.start();
  g.eval('G.rush=0;QL.length=0');
  let n0 = 0;
  for (let s = 0; s < 120; s++) { g.advance(1, .05); g.eval('G.q=0;QL.length=0;balls.length=0;G.hp=G.mx=1e30;PR.length=0;G.sp=0;G.fv=0;G.rush=0;G.stage=1'); if (s === 59) n0 = g.audio.osc; }
  console.log(`BGMのみ(通常曲): ${g.audio.osc - n0} osc/分`);
  ok(g.audio.osc - n0 < 3000, 'BGM単体の発音数が過剰');
}

// (c) AudioContext 無し / 壊れている
for (const mode of ['none', 'broken']) {
  try {
    const g = createGame({ seed: 5, audio: mode });
    scenario(g, 4);
    ok(g.audio.osc === 0, `${mode}: 発音が起きている`);
    for (const c of ['beep(500)', 'tone(500,0,.1,"square",.05)', 'noise(0,.1,.1)', 'kyuin(5,"#fff")', 'jara()', 'fan()', 'bgm()', 'seJackpot()', 'seWin(true)', 'setVol(.3,.4)', 'getVol()']) g.eval(c);
    console.log(`AC ${mode}: 4分 例外なし`);
  } catch (e) { fail(`AC ${mode} で例外: ` + e.stack.split('\n').slice(0, 4).join('\n')); }
}

// (d) ミュート/音量の保存と復元、ミュート中は発音しない
{
  const g = createGame({ seed: 9 }); g.start();
  g.advance(5);
  g.eval("$('mu').onclick()");
  ok(JSON.parse(g.store.pachi2snd).m === 1, 'ミュート状態が localStorage に保存されない');
  ok(g.eval('isMuted()') === true, 'isMuted');
  const o0 = g.audio.osc; g.eval('bigHit(true);kyuin(8,"#fff");fan()'); g.advance(20);
  ok(g.audio.osc === o0, `ミュート中に発音している (${g.audio.osc - o0})`);
  g.eval("$('mu').onclick()"); g.advance(10);
  ok(g.audio.osc > o0, 'ミュート解除後に鳴らない');
  g.eval('setVol(.25,2)');
  const v = g.eval('getVol()'); ok(v.bgm === .25 && v.se === 1, 'setVol のクランプ/getVol: ' + JSON.stringify(v));
  g.eval('setVol(null,.5)'); ok(g.eval('getVol().bgm') === .25, 'setVol(null,x) は bgm を変えない');
  const g2 = createGame({ seed: 9, storage: { pachi2snd: g.store.pachi2snd } });
  const v2 = g2.eval('getVol()'); ok(v2.bgm === .25 && v2.se === .5 && v2.mute === false, '再起動後に音量が復元されない: ' + JSON.stringify(v2));
  const g3 = createGame({ seed: 9, storage: { pachi2snd: JSON.stringify({ b: 'x', s: 5, m: 1 }) } });
  const v3 = g3.eval('getVol()'); ok(v3.mute === true && v3.se === 1 && v3.bgm === .7, '壊れた保存値の扱い: ' + JSON.stringify(v3));
  console.log('ミュート/音量の保存: OK');
}

// (e) iOS: suspended の AudioContext は resume される
{
  const g = createGame({ seed: 2, audio: 'suspended' }); g.start(); g.advance(3);
  ok(g.audio.resumes >= 1, 'suspended の AudioContext に resume() が呼ばれない');
  g.advance(10);
  ok(g.audio.osc > 20, 'resume 後にBGMが鳴らない');
  console.log(`iOS suspended: resume 呼び出し ${g.audio.resumes} 回, 発音 ${g.audio.osc}`);
}

// (f) 各SEが個別に鳴る(フックが効いている)
{
  const g = createGame({ seed: 4 }); g.start(); g.advance(3);
  const cases = { 'kill': 'G.stage=1;spawn();kill()', 'hurt crit': 'hurt(5,"#fff",0,1)', 'bigHit': 'bigHit(false)', 'jackpot': 'jackpot()', 'pkHit': 'pkHit(2)', 'cutin': 'cutin(0,"x","#fff",()=>{})', 'banner激アツ': 'banner("激アツ!!","#f00")', 'reach': 'showMsg("リーチ!")' };
  for (const [k, c] of Object.entries(cases)) { g.advance(1); const o = g.audio.osc; g.eval(c); ok(g.audio.osc > o, `SE "${k}" が鳴らない`); }
  // 既存beepの置き換え: bigHit 中の beep(1400) は抑止され、新SE(多数のoscillator)に置き換わっている
  console.log('SEフック: OK');
}

if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1); }
console.log('\nAUDIO OK');
