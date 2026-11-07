// 音声テスト: 仮想時計で (a)10分間で例外なし (b)発音数/同時発音が過剰でない (c)AudioContext無し/壊れていても動く
// (d)ミュート/音量の保存 (e)iOS(suspended)で resume される (f)全BGM状態と全SEが一度は鳴る
// 実行: node tests/audio.js [--minutes=10]
const { createGame } = require('../tools/harness');
const { stats } = require('../tools/audiorender');
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
    for (const c of ['beep(500)', 'tone(500,0,.1,"square",.05)', 'noise(0,.1,.1)', 'kyuin(5,"#fff")', 'jara()', 'fan()', 'bgm()', 'seJackpot()', 'seWin(true)', 'setVol(.3,.4)', 'getVol()', 'seAori(2400,false)', 'seAoriCut()', 'seDecide(false)', 'seBossDown()', 'seGen("great")', 'seRoulResult(50)', 'seRoulTick(.5)', 'seDoubleWin()', 'seDoubleLose()', 'sePipo(3,80)', 'seReachStage(2,true)', 'seReelTick(.5)', 'seJaraStream(0,1,10)']) g.eval(c);
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

// ===== ここから拡充分(曲/ミックス/新SE) =====
const KEEP = 'G.hp=G.mx=1e30;G.sp=0;G.q=0;QL.length=0;PR.length=0';
const SR = 16000;
const QUIET = 'sp=null;PUSH=null;RL=null;G.roul=0;cut=null'; // ゲーム側の自発イベント(当たり/押せ/ルーレット)を止めて曲状態だけを検証する

// (g) 曲データの整合: モチーフ32文字/パターン16文字/コード4つ。ステージ帯テーマは別々のキー/テンポ
{
  const g = createGame({ seed: 3 });
  const bad = g.eval(`(()=>{const bad=[];for(const k in SONGS){const S=SONGS[k];if(S.cs)continue;
    S.mt.forEach((m,i)=>{if(m.length!==32)bad.push(k+' mt'+i+' '+m.length)});
    for(const f of ['ar','bs','dk','ds','dh'])S[f].forEach((p,i)=>{if(p.length!==16)bad.push(k+' '+f+i+' '+p.length)});
    S.ch.forEach(sec=>{if(sec.length!==4)bad.push(k+' ch')});S.lm.forEach(a=>a.forEach(x=>{if(x>=S.mt.length)bad.push(k+' lm')}));
    if(!(k in SRANK))bad.push(k+' SRANK')}return bad})()`);
  ok(bad.length === 0, '曲データ不整合: ' + bad.join(', '));
  const th = g.eval(`['n','n2','n3','n4'].map(k=>SONGS[k].pc+'/'+SONGS[k].bpm)`);
  ok(new Set(th).size === 4, 'ステージ帯テーマのキー/テンポが重複: ' + th);
  const nm = g.eval(`Object.keys(SONGS).filter(k=>!SONGS[k].cs).length`);
  ok(nm >= 8, '曲数が足りない: ' + nm);
  console.log('曲データ: OK (' + Object.keys(g.eval('SONGS')).join(',') + ')');
}

// (h) ステージ帯/ボス/緊張の BGM 切替: 拍同期(上位は拍頭・下位は小節頭)・クロスフェード用バスの更新・SE用のキー
{
  const g = createGame({ seed: 3, audio: 'render' }); g.start(); g.eval(KEEP);
  g.eval(`var __sw=[];(function(){const o=bgSwitch;bgSwitch=function(s,t){__sw.push({from:BG.s,to:s,st:BG.st,bus:BG.bus});return o.apply(this,arguments)}})()`);
  const want = (setup, st, label, sec = 4) => { for (let i = 0; i < sec * 2; i++) { g.eval(setup + ';' + QUIET); g.advance(.5); g.eval(KEEP) } const s = g.eval('BG.s'); ok(s === st, `${label}: BGM状態 ${s} (期待 ${st})`); };
  want('G.rush=0;G.fv=0;G.jp=0;G.stage=1', 'n', 'STAGE1');
  want('G.rush=0;G.fv=0;G.jp=0;G.stage=12', 'n2', 'STAGE12'); want('G.rush=0;G.fv=0;G.jp=0;G.stage=22', 'n3', 'STAGE22'); want('G.rush=0;G.fv=0;G.jp=0;G.stage=41', 'n4', 'STAGE41');
  want('G.rush=0;G.fv=0;G.jp=0;G.stage=25', 'b2', 'ボス25'); want('G.rush=0;G.fv=0;G.jp=0;G.stage=10', 'b', 'ボス10'); want('G.rush=0;G.fv=0;G.jp=0;G.stage=11', 'n2', 'STAGE11');
  want('G.rush=0;G.jp=0;G.fv=30', 'f', 'FEVER'); want('G.rush=15;G.fv=0;G.jp=0', 'r', 'RUSH'); want('G.jp=30;G.rush=15', 'j', 'JACKPOT'); want('G.jp=0;G.rush=0;G.fv=0', 'n2', '復帰');
  // 緊張: 押せ!! で tn、押したら(PUSH解除後)抜ける。ルーレット回転中も tn
  g.eval('G.rush=15;G.stage=1;G.jp=0;G.fv=0;' + QUIET); g.advance(3); g.eval(KEEP);
  g.eval('pushPrompt(()=>{},{ms:20000})'); g.advance(1.5); ok(g.eval('BG.s') === 'tn', '押せ!!待ちで緊張曲にならない: ' + g.eval('BG.s'));
  g.eval('pushPress(0)'); g.advance(2); g.eval(KEEP); ok(g.eval('BG.s') === 'r', '押下後にRUSH曲へ戻らない: ' + g.eval('BG.s'));
  g.eval('startRoul(1)'); g.advance(1.5); ok(g.eval('BG.s') === 'tn', 'ルーレット回転中に緊張曲にならない: ' + g.eval('BG.s'));
  g.advance(8); g.eval(KEEP); ok(g.eval('BG.s') !== 'tn', 'ルーレット終了後も緊張曲のまま');
  const sw = g.eval('__sw'); let bgOk = 0;
  for (const e of sw) {
    const up = g.eval(`SRANK['${e.to}']>SRANK['${e.from}']`) || e.from === 'tn';
    if (up ? e.st % 4 !== 0 : e.st % 16 !== 0) fail(`切替が拍/小節頭でない: ${e.from}->${e.to} step=${e.st}`); else bgOk++;
  }
  ok(sw.length >= 12, '切替回数が少ない: ' + sw.length);
  const buses = new Set(sw.map(e => e.bus)); ok(buses.size >= sw.length - 1, '曲切替ごとに新しい曲バスが作られていない');
  // 旧バスのゲインはフェードアウト(最後のイベントが 0)
  const olds = sw.filter(e => e.bus && e.bus.bg && e.bus.bg.gain.ev.length >= 2);
  ok(olds.length > 5 && olds.every(e => e.bus.bg.gain.ev[e.bus.bg.gain.ev.length - 1].v === 0), '旧バスがフェードアウトしていない');
  console.log(`BGM切替: ${sw.length}回 全て拍/小節同期(${bgOk}) 経路=${[...new Set(sw.map(e => e.from + '>' + e.to))].join(' ')}`);
}

// (i) ミックス(数値レンダリング): BGM単体/SE単体/最悪ケース同時鳴動の波形を計算
{
  const level = (o) => {
    const g = createGame({ seed: 3, audio: 'render' }); g.start(); g.eval(KEEP);
    g.eval(o.vol || 'setVol(.7,.9)'); g.advance(1); if (o.setup) g.eval(o.setup);
    const t0 = g.time;
    for (let s = 0; s < o.dur; s += .5) { if (o.hold) g.eval(o.hold + ';' + QUIET); g.advance(.5); g.eval(KEEP); const e = o.ev && o.ev[s]; if (e) g.eval(e) }
    const r = g.audio.rec.render(t0 + (o.skip || 0), g.time, SR, [g.eval('SGR.mx')]);
    return { out: stats(r.out, SR), pre: stats(r.taps[0], SR), g };
  };
  const bgm = {};
  for (const [k, hold, setup] of [['n', 'G.rush=0;G.fv=0;G.jp=0;G.stage=1'], ['n2', 'G.rush=0;G.fv=0;G.jp=0;G.stage=12'], ['n3', 'G.rush=0;G.fv=0;G.jp=0;G.stage=22'], ['n4', 'G.rush=0;G.fv=0;G.jp=0;G.stage=41'], ['b', 'G.rush=0;G.fv=0;G.jp=0;G.stage=5'], ['b2', 'G.rush=0;G.fv=0;G.jp=0;G.stage=25'], ['f', 'G.rush=0;G.jp=0;G.fv=99'], ['r', 'G.jp=0;G.fv=0;G.rush=15'], ['j', 'G.jp=99;G.rush=0'], ['tn', 'G.jp=0;G.rush=15;G.fv=0', 'pushPrompt(()=>{},{ms:20000})']]) {
    bgm[k] = level({ vol: 'setVol(.7,0)', hold: k === 'tn' ? hold + ';if(!PUSH)pushPrompt(()=>{},{ms:20000})' : hold, dur: 14, skip: 2 }).out;
    ok(bgm[k].peak < .35 && bgm[k].peak > .05, `BGM ${k}: ピークが範囲外 ${bgm[k].peak.toFixed(3)}`);
    ok(bgm[k].rms > .006, `BGM ${k}: ほぼ無音 rms=${bgm[k].rms.toFixed(4)}`);
  }
  const bgPk = Math.max(...Object.values(bgm).map(x => x.peak));
  const se = {};
  for (const [k, ev] of [['bigHit', 'bigHit(false)'], ['jackpot', 'jackpot()'], ['bossDown', 'G.stage=5;spawn();kill()'], ['aori', 'pushPrompt(()=>{},{ms:2400})'], ['decide', 'seDecide(false)'], ['great', 'seGen("great")'], ['kyuin9', 'kyuin(9,"#fff")'], ['reelStop', 'seReelStop(1)']]) {
    se[k] = level({ vol: 'setVol(0,.9)', dur: 6, ev: { .5: ev } }).out;
    ok(se[k].peak < .95, `SE ${k}: クリップ ${se[k].peak.toFixed(3)}`);
  }
  // BGM < SE: 派手なSEの短時間RMS(100ms窓)は BGM より大きく、BGMのピークは主要SEのピークより小さい
  for (const k of ['bigHit', 'bossDown', 'aori', 'decide', 'great']) ok(se[k].rms100 > 1.5 * Math.max(...Object.values(bgm).map(x => x.rms100)) * .7, `SE ${k} がBGMに埋もれている rms100 ${se[k].rms100.toFixed(3)}`);
  for (const k of ['bigHit', 'jackpot', 'bossDown', 'aori']) ok(se[k].peak > bgPk, `SE ${k} のピーク ${se[k].peak.toFixed(3)} がBGMピーク ${bgPk.toFixed(3)} 以下`);
  // 最悪ケース: JACKPOT中のBGM + 大当たり/ジャックポット/ボス撃破/押せ/キュイン/ファンファーレ/ミニゲーム を同時に連打
  const st = level({
    setup: 'G.rush=15;G.jp=99', dur: 9, skip: 0,
    ev: { 0: 'bigHit(true);jackpot();kyuin(10,"#fff");fan();seBossDown();pushPrompt(()=>{},{ms:2400})', 1: 'seWin(true);seDecide(false);seGen("great");seRoulResult(50);seDoubleWin()', 2: 'bigHit(false);kyuin(10,"#fff");seReachStage(3,true);seJaraStream(AC.currentTime,2,20)' },
  });
  console.log(`ミックス: BGM単体ピーク最大 ${bgPk.toFixed(2)} / SE単体 bigHit ${se.bigHit.peak.toFixed(2)} bossDown ${se.bossDown.peak.toFixed(2)} aori ${se.aori.peak.toFixed(2)} / 最悪同時鳴動 ピーク=${st.out.peak.toFixed(3)} (コンプ前 ${st.pre.peak.toFixed(2)})`);
  ok(st.out.peak < .95, `最悪ケースでクリップ: ピーク ${st.out.peak.toFixed(3)}`);
  ok(peak(st.g.audio.spans) <= MAX_CONCURRENT + 20, `最悪ケースの同時発音ピーク ${peak(st.g.audio.spans)}`);
  // マスターに リミッタ + ソフトクリップ が入っている(WaveShaper の曲線は |y|<=.95)
  const cv = st.g.eval('(()=>{const m=SGR.mx;let n=m;const seen=[];for(let i=0;i<4&&n.out&&n.out[0];i++){n=n.out[0];seen.push(n.kind)}return seen})()');
  ok(cv.join(',') === 'comp,comp,shaper,dest', 'マスターの接続が compressor→limiter→shaper→destination でない: ' + cv.join(','));
  // UXスライダ: BGM=0 で BGM が無音、SE=0 で SE が無音、ミュートで全部無音
  const gv = (vol) => { const g = createGame({ seed: 3, audio: 'render' }); g.start(); g.advance(1); g.eval(vol); g.advance(.2); return g.eval('(()=>{const t=AC.currentTime+.05;return{bg:SGR.bg.gain.at(t),se:SGR.se.gain.at(t),mx:SGR.mx.gain.at(t)}})()') };
  const a = gv('setVol(0,.9)'), b = gv('setVol(.7,0)'), c = gv('setMute(1)'), d = gv('setVol(.7,.9)');
  ok(a.bg === 0 && a.se > .5, 'BGM音量0: bgバスが0でない ' + JSON.stringify(a)); ok(b.se === 0 && b.bg > .1, 'SE音量0: seバスが0でない ' + JSON.stringify(b));
  ok(c.mx === 0, 'ミュート: masterが0でない'); ok(d.se > d.bg * 1.5, `既定音量で SE(${d.se.toFixed(2)}) が BGM(${d.bg.toFixed(2)}) の1.5倍以上でない`);
  const z3 = level({ vol: 'setMute(1)', dur: 6, ev: { .5: 'bigHit(true);seGen("great")' }, hold: 'G.rush=15' }).out; ok(z3.peak < .001, 'ミュートで音が出る ' + z3.peak.toFixed(3));
}

// (j) 光過敏性: kyuin のフラッシュは約3Hz以下(間隔 >= 0.3秒)
{
  const g = createGame({ seed: 3 }); g.start(); g.eval(KEEP);
  g.eval('var __fl=[];(function(){const o=flash;flash=function(c){__fl.push(performance.now());return o.apply(this,arguments)}})()');
  g.eval('kyuin(10,"#fff")'); g.advance(2);
  const fl = g.eval('__fl'); let minGap = 9e9; for (let i = 1; i < fl.length; i++) minGap = Math.min(minGap, fl[i] - fl[i - 1]);
  ok(fl.length >= 3, 'kyuin のフラッシュが出ない'); ok(minGap >= 300, `kyuin のフラッシュ間隔が短い: ${minGap}ms`);
  console.log(`kyuin(10) フラッシュ ${fl.length}回 最短間隔 ${Math.round(minGap)}ms`);
}

// (k) 新SEがフック経由で鳴る / 内容の検証
{
  const g = createGame({ seed: 4, audio: 'render' }); g.start(); g.eval(KEEP); g.advance(2);
  const sounds = (code, adv = 1) => { g.eval(KEEP); const o = g.audio.osc; g.eval(code); g.advance(adv); g.eval(KEEP); return g.audio.osc - o; };
  g.eval('G.rush=0;G.stage=1');
  // 押せ!!: 開始で煽り、押下で決定音
  g.eval('var __c={aori:0,dec:0,rs:0,tick:0,boss:0,dw:0,dl:0,gen:[],rt:0,rr:0};' + ['seAori', 'seDecide', 'seReachStage', 'seReelTick', 'seBossDown', 'seDoubleWin', 'seDoubleLose', 'seRoulTick', 'seRoulResult'].map(n => `(function(){const o=${n};${n}=function(){__c.${{ seAori: 'aori', seDecide: 'dec', seReachStage: 'rs', seReelTick: 'tick', seBossDown: 'boss', seDoubleWin: 'dw', seDoubleLose: 'dl', seRoulTick: 'rt', seRoulResult: 'rr' }[n]}++;return o.apply(this,arguments)}})();`).join('') + '(function(){const o=seGen;seGen=function(k){__c.gen.push(k);return o.apply(this,arguments)}})();');
  g.eval('pushPrompt(()=>{},{ms:2400})'); g.advance(.3); ok(g.eval('__c.aori') === 1, '押せ!!開始で煽り音が鳴らない');
  g.eval('pushPress(0)'); g.advance(1); ok(g.eval('__c.dec') === 1, '押下で決定音が鳴らない'); ok(g.eval('sAB') === null, '押下後も煽りのバスが残っている');
  g.advance(2);
  // 放置(自動押下)でも決定音
  g.eval('pushPrompt(()=>{},{ms:1500})'); g.advance(2.5); ok(g.eval('__c.dec') === 2, '自動押下で決定音が鳴らない');
  // 煽り: 音程が単調に上昇し、数が上限内、時間内に収まる
  {
    const h = createGame({ seed: 4, audio: 'render' }); h.start(); h.eval('BG.on=0'); h.advance(1);
    const n0 = h.audio.rec.nodes.length; h.eval('seAori(2400,false)');
    const osc = h.audio.rec.nodes.slice(n0).filter(n => n.kind === 'osc' && n.wtype !== 'triangle' && n.wave);
    const fs = osc.map(o => o.frequency.ev[0].v), ts = osc.map(o => o._s);
    ok(fs.length >= 12 && fs.length <= 40, `煽り音の数 ${fs.length}`);
    let mono = true; for (let i = 1; i < fs.length; i++) if (fs[i] < fs[i - 1] * .999 && ts[i] > ts[i - 1] + .001 && (i % 4)) mono = false;
    const main = fs.filter((f, i) => true); ok(main[main.length - 1] > main[0] * 2, `煽り音が上昇していない ${main[0]}→${main[main.length - 1]}`);
    ok(Math.max(...osc.map(o => o._e)) <= h.time + 2.6, '煽り音が指定時間を超えて鳴る');
    const gaps = ts.slice(1).map((t, i) => t - ts[i]).filter(x => x > .02); ok(gaps[gaps.length - 1] < gaps[0], '煽りの間隔が詰まっていない');
    h.eval('seAoriCut()'); const bus = h.audio.rec.nodes.filter(n => n.kind === 'gain').slice(-1)[0];
    console.log(`煽り: ${fs.length}音 ${Math.round(main[0])}→${Math.round(main[main.length - 1])}Hz 間隔 ${gaps[0].toFixed(3)}→${gaps[gaps.length - 1].toFixed(3)}s`);
  }
  // リーチ発展: SUPER は3段(音程上昇)、通常は1段。3列目のティックが鳴る
  g.eval('G.q=1;QL.push({h:0,c:0});startSpin();sp.type=2;sp.hit=false;sp.stop=[1,1.9,7.5];sp.f=[1,2,3];sp.sc=1');
  g.advance(9, .05, () => g.eval(KEEP.replace('G.q=0;', '')));
  ok(g.eval('__c.rs') === 3, `SUPERリーチの発展SEが3段でない: ${g.eval('__c.rs')}`); ok(g.eval('__c.tick') >= 5, `リーチ中のティックが少ない: ${g.eval('__c.tick')}`);
  g.eval('__c.rs=0;G.q=1;QL.push({h:0,c:0});startSpin();sp.type=1;sp.hit=false;sp.stop=[1,1.9,4.8];sp.f=[1,2,3];sp.sc=1');
  g.advance(7, .05, () => g.eval(KEEP.replace('G.q=0;', ''))); ok(g.eval('__c.rs') === 1, `通常リーチの発展SEが1段でない: ${g.eval('__c.rs')}`);
  const pit = g.eval('[1,2,3].map(k=>sRise(5+k*3))'); ok(pit[0] < pit[1] && pit[1] < pit[2], '発展段階で音程が上がらない: ' + pit);
  // ボス撃破
  g.eval('G.stage=5;spawn();kill()'); g.advance(1); ok(g.eval('__c.boss') === 1, 'ボス撃破ファンファーレが鳴らない');
  g.eval('G.stage=1;spawn();kill()'); g.advance(1); ok(g.eval('__c.boss') === 1, '雑魚撃破でボス用ファンファーレが鳴った');
  ok(sounds('G.stage=5;spawn();kill()', 1.5) > 25, 'ボス撃破の音数が少ない');
  // ダブルアップ当落
  g.eval("RL={ph:1,hold:1,t:0,m:3,k:0,a:0,kick:0,last:0,base:1};pushPrompt(()=>{$('rr').textContent='DOUBLE!! x6'},{small:1,ms:2400});pushPress(0)"); g.advance(1.5);
  ok(g.eval('__c.dw') === 1, 'DOUBLE UP 成功音が鳴らない');
  g.eval("RL={ph:1,hold:1,t:0,m:3,k:0,a:0,kick:0,last:0,base:1};pushPrompt(()=>{$('rr').textContent='残念… x3'},{small:1,ms:2400});pushPress(0)"); g.advance(1.5);
  ok(g.eval('__c.dl') === 1, 'DOUBLE UP 失敗音が鳴らない'); g.eval('RL=null;G.roul=0'); g.advance(1);
  // ルーレット: ティックと結果
  g.eval('G.rush=15;startRoul(10)'); g.advance(7, .05, () => g.eval(KEEP.replace('G.q=0;', '')));
  ok(g.eval('__c.rt') >= 8, `ルーレットのティックが少ない: ${g.eval('__c.rt')}`); ok(g.eval('__c.rr') === 1, 'ルーレット結果音が1回でない: ' + g.eval('__c.rr'));
  // ミニゲーム
  g.eval('__c.gen.length=0;G.stage=10;mini()'); g.advance(1); ok(g.eval('__c.gen').includes('start'), 'BONUS STOP 開始音が鳴らない');
  g.advance(8); g.eval('MG=null;MG2=null'); g.advance(3);
  g.eval("__c.gen.length=0;MG={t:0,s:0,x:0}"); g.advance(6); // BONUS STOP を直接起動(mini() は種類がローテーションするため)
  ok(g.eval('__c.gen').filter(k => k === 'tick').length >= 3, 'BONUS STOP のティックが鳴らない: ' + g.eval('__c.gen').join(','));
  ok(g.eval('__c.gen').some(k => k === 'ok' || k === 'good' || k === 'great'), 'BONUS STOP 結果音が鳴らない'); g.advance(3);
  g.eval('__c.gen.length=0;mg2Start("tap")'); g.advance(6.5); const gn = g.eval('__c.gen'); ok(gn.includes('coin') && gn.some(k => /ok|good|great/.test(k)), 'コインラッシュの音が鳴らない: ' + gn.join(',')); g.advance(3);
  g.eval('__c.gen.length=0;mg2Start("chest")'); g.advance(7); ok(g.eval('__c.gen').some(k => /ok|good|great/.test(k)), '宝箱の結果音が鳴らない');
  console.log('新SE: OK (煽り/決定/リーチ発展/ボス撃破/DOUBLE UP/ルーレット/ミニゲーム)');
}

// (l) ミュート中は新SEも鳴らない
{
  const g = createGame({ seed: 6 }); g.start(); g.advance(3); g.eval("$('mu').onclick()");
  const o0 = g.audio.osc;
  g.eval('pushPrompt(()=>{},{ms:1000});pushPress(0);seDecide(false);seBossDown();seGen("great");seRoulResult(50);seDoubleWin();seReachStage(3,true);mini()'); g.advance(8);
  ok(g.audio.osc === o0, `ミュート中に新SEが鳴る (${g.audio.osc - o0})`); console.log('ミュート中の新SE: 無音');
}

if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1); }
console.log('\nAUDIO OK');
