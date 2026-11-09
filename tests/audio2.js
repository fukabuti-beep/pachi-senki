// 音声テスト2(sound担当): ボーナスタイムBGM / 遠征・ボーナスタイム・ハイ&ローのSE / キュインの耳疲れ対策
// (a) ボーナスタイム中だけアレンジ曲、RUSH/JACKPOT が来たらそちら優先、終われば元の曲へ戻る
// (b) 新SEがゲーム側の流れから呼ばれて実際に発音する (c) AudioContext 無し/壊れていても落ちない・ミュート中は無音
// (d) キュインの差し替え/間引き/音量逓減 (e) ボーナス曲の音量が他のBGMと同じ範囲
// 実行: node tests/audio2.js
const { createGame } = require('../tools/harness');
const { stats } = require('../tools/audiorender');
let failures = 0;
const fail = m => { failures++; console.error('FAIL: ' + m); };
const ok = (c, m) => { if (!c) fail(m); };
const KEEP = 'G.hp=G.mx=1e30;G.sp=0;G.q=0;QL.length=0;PR.length=0;sp=null;PUSH=null;RL=null;G.roul=0;cut=null;BT.left=Math.max(BT.left,600)';
const COUNT = `var __s=[];['seExp','seBt','seHl'].forEach(n=>{const o=globalThis[n];globalThis[n]=function(k,x){__s.push(n+':'+k);return o.apply(this,arguments)}})`;

// (a) ボーナスタイムBGM
{
  const g = createGame({ seed: 3 }); g.start(); g.eval(KEEP);
  const hold = (code, sec) => { for (let i = 0; i < sec * 4; i++) { g.eval(code + ';' + KEEP); g.advance(.25) } return g.eval('BG.s') };
  ok(hold('G.rush=0;G.fv=0;G.jp=0;G.stage=1', 4) === 'n', '開始時に通常曲でない');
  g.eval('btStart(0)');
  let s = hold('G.rush=0;G.fv=0;G.jp=0;G.stage=1', 3);
  ok(s === 'btgold_n', '黄金タイムでボーナス曲にならない: ' + s);
  const a = g.eval('({b:SONGS.n.bpm,p:SONGS.n.pc,bb:SONGS.btgold_n.bpm,bp:SONGS.btgold_n.pc,r:SRANK.btgold_n,cs:typeof SONGS.btgold_n.cs})');
  ok(a.bb > a.b && a.bb <= 168, 'テンポアップしていない ' + JSON.stringify(a));
  ok(a.bp === (a.p + 2) % 12, '転調していない ' + JSON.stringify(a));
  ok(a.r > g.eval('SRANK.b2') && a.r < g.eval('SRANK.f'), '優先順位がボスとFEVERの間でない');
  ok(hold('G.rush=0;G.fv=0;G.jp=0;G.stage=5', 3) === 'btgold_n', 'ボス戦でボーナス曲が途切れた'); // ボーナスはボスより上
  ok(hold('G.rush=15;G.fv=0;G.jp=0;G.stage=1', 2) === 'r', 'RUSH がボーナス曲より優先されない');
  ok(hold('G.rush=0;G.fv=0;G.jp=0;G.stage=1', 3) === 'btgold_n', 'RUSH 後にボーナス曲へ戻らない');
  ok(hold('G.jp=30;G.rush=0;G.stage=1', 2) === 'j', 'JACKPOT がボーナス曲より優先されない');
  ok(hold('G.jp=0;G.rush=0;G.fv=0;G.stage=12', 4) === 'btgold_n2', 'ステージ帯に合わせたアレンジにならない: ' + g.eval('BG.s'));
  g.eval('btEnd()');
  s = hold('G.rush=0;G.fv=0;G.jp=0;G.stage=12', 4);
  ok(s === 'n2', 'ボーナス終了後に元の曲へ戻らない: ' + s);
  // 自然終了(40秒経過)でも戻る
  g.eval('btStart(2)'); s = hold('G.rush=0;G.fv=0;G.jp=0;G.stage=1', 3); ok(s === 'btatk_n', '討伐タイムのボーナス曲: ' + s);
  s = hold('G.rush=0;G.fv=0;G.jp=0;G.stage=1', 42); ok(g.eval('BT.cur') === null && s === 'n', '40秒後に元の曲へ戻らない: ' + s);
  const k = g.eval("['gold','ms','atk'].map(x=>{const S=SONGS[btSong(x,'n')];return S.inner.lw.join()+'/'+S.inner.bw+'/'+S.inner.dk[0]})");
  ok(new Set(k).size === 3, '3種のアレンジが区別されていない: ' + k.join(' | '));
  const bad = g.eval(`(()=>{const b=[];for(const k in SONGS){const S=SONGS[k];if(!S.inner)continue;const I=S.inner;I.mt.forEach((m,i)=>{if(m.length!==32)b.push(k+' mt')});for(const f of ['ar','bs','dk','ds','dh'])I[f].forEach(p=>{if(p.length!==16)b.push(k+' '+f)});if(!(k in SRANK))b.push(k+' SRANK')}return b})()`);
  ok(bad.length === 0, 'ボーナス曲データ不整合: ' + bad.join(','));
  console.log('ボーナスタイムBGM: OK (通常→ボーナス→RUSH→ボーナス→JACKPOT→ボーナス→終了で元の曲)');
}

// (b) 新SEがゲームの流れから呼ばれ、発音する
{
  const g = createGame({ seed: 4 }); g.start(); g.eval(KEEP); g.advance(2); g.eval(COUNT);
  const snd = (code, adv = 1.5) => { g.eval(KEEP); const o = g.audio.osc; g.eval(code); g.advance(adv); g.eval(KEEP); return g.audio.osc - o; };
  const has = k => g.eval('__s').includes(k);
  g.eval('BG.on=0'); g.advance(1); // BGM を止めて SE の発音だけを数える
  ok(snd('X.best=Math.max(X.best,1);expGo(0)') > 8 && has('seExp:go'), '遠征の出発音');
  g.eval('EXP.t0-=2e6;EXP.ntf=0'); g.advance(2); ok(has('seExp:ret'), '遠征の帰還通知音');
  ok(snd('expCollect()', 3) > 20 && (has('seExp:back') || has('seExp:big')), '遠征の受け取り音');
  // 大成功: 乱数を固定
  g.eval('fxClose&&fxClose();expGo(0);EXP.t0-=2e6;var __r=Math.random;Math.random=()=>.01'); g.eval('expCollect()'); g.eval('Math.random=__r'); g.advance(3);
  ok(has('seExp:big'), '遠征 大成功の音');
  try { g.eval('fxClose()') } catch (e) { }
  // ボーナスタイム: 予告 / 開始 / 終了
  g.eval('BT.cur=null;BT.left=5.5;BT.pre=0'); for (let i = 0; i < 4; i++) { g.eval('G.hp=G.mx=1e30;sp=null;PUSH=null;RL=null;G.roul=0;cut=null'); g.advance(.5) }
  ok(has('seBt:pre'), 'ボーナスタイム予告音');
  g.eval('BT.cur=null'); ok(snd('btStart(1)', 2) > 20 && has('seBt:start'), 'ボーナスタイム開始ジングル');
  ok(snd('btEnd()') > 3 && has('seBt:end'), 'ボーナスタイム終了音');
  // ハイ&ロー: 開始 / めくり / 当たり / 外れ / 3連勝 / 受け取り
  const busy = 'MG=null;MG2=null;';
  ok(snd(busy + 'hlStart()', .2) > 3 && has('seHl:start'), 'ハイ&ロー開始音');
  ok(snd('HL.a=1;hlChoose(1,0)', .5) > 8 && has('seHl:flip'), 'カードめくりの音');
  g.advance(.6); ok(has('seHl:win'), '当たり音(A に HIGH は必ず当たり)');
  g.eval('HL.ph=0;HL.a=13;hlChoose(1,0);HL.b=2;hlJudge()'); g.advance(.5); ok(has('seHl:lose'), '外れ音');
  g.eval('hlEnd()'); g.eval('__s.length=0');
  g.eval(busy + 'hlStart();HL.w=2;hlFin()'); g.advance(.5); ok(has('seHl:cash'), '受け取り音'); g.eval('hlEnd()');
  ok(snd(busy + 'hlStart();HL.w=3;hlFin()', 2) > 25 && has('seHl:perfect'), '3連勝の音'); g.eval('hlEnd()');
  // 放置でも一通り鳴る(自動選択)
  g.eval('__s.length=0;' + busy + 'hlStart()'); g.advance(16, .05, () => g.eval('G.hp=G.mx=1e30;sp=null;PUSH=null;RL=null;G.roul=0;cut=null'));
  const s = g.eval('__s'); ok(s.includes('seHl:flip') && (s.includes('seHl:win') || s.includes('seHl:lose')), '自動選択で音が鳴らない: ' + s.join(','));
  console.log('新SE: OK ' + [...new Set(g.eval('__s'))].join(' '));
}

// (c) AudioContext 無し / 壊れている / ミュート
for (const mode of ['none', 'broken', 'mute']) {
  try {
    const g = createGame({ seed: 5, audio: mode === 'mute' ? 'ok' : mode }); g.start(); g.advance(2);
    if (mode === 'mute') g.eval("setMute(1)");
    const o = g.audio.osc;
    g.eval("['go','ret','back','big'].forEach(k=>seExp(k));['pre','start','end'].forEach(k=>seBt(k,0));['start','flip','win','lose','cash','perfect'].forEach(k=>seHl(k,2));kyuin(5,'#fff');kyuin(2,'#fff')");
    g.eval('X.best=Math.max(X.best,1);expGo(0);EXP.t0-=2e6;expCollect();BT.cur=null;btStart(0)'); g.advance(3);
    g.eval('MG=null;MG2=null;hlStart();HL.a=1;hlChoose(1,0)'); g.advance(8);
    g.eval('btEnd();btSong("ms","n3")');
    for (let i = 0; i < 20; i++) g.advance(1);
    if (mode !== 'none') ok(g.audio.osc === o, `${mode}: 発音している (${g.audio.osc - o})`);
    console.log(`${mode}: 例外なし`);
  } catch (e) { fail(`${mode} で例外: ` + e.stack.split('\n').slice(0, 4).join('\n')); }
}

// (d) キュイン: 鳴っている途中の次のキュインは差し替え / 大きいキュイン中の小さいキュインは鳴らさない / 連発で音量逓減(下限 .6) / 7段以上はフル
{
  const g = createGame({ seed: 6, audio: 'render' }); g.start(); g.eval('BG.on=0'); g.advance(1);
  g.eval("sKH=[];kyuin(3,'#fff')"); const b1 = g.eval('sKB.bus'); g.advance(.1);
  g.eval("kyuin(4,'#fff')"); const ev = b1.gain.ev; ok(ev[ev.length - 1].v === 0, '途中のキュインが差し替えられていない(前のバスがフェードしない)');
  g.advance(2); g.eval("sKH=[];kyuin(10,'#fff')"); g.advance(.2);
  let o = g.audio.osc; g.eval("kyuin(3,'#fff')"); ok(g.audio.osc === o, '大きいキュインの途中に小さいキュインが重なった');
  g.advance(2); g.eval('sKH=[]'); const vs = [];
  for (let i = 0; i < 8; i++) { g.eval("kyuin(3,'#fff')"); vs.push(g.eval('sKB.v')); g.advance(.8); }
  ok(vs[0] === 1 && vs[vs.length - 1] >= .6 && vs[vs.length - 1] < .8, 'キュイン連発の音量逓減: ' + vs.map(v => v.toFixed(2)).join(','));
  g.eval("kyuin(9,'#fff')"); ok(g.eval('sKB.v') === 1, '大当たり級のキュインがフル音量でない');
  g.advance(10); g.eval('sKH=[];sKB=null'); o = g.audio.osc; g.eval("kyuin(5,'#fff')");   // sKB=null: 乱数次第で鳴っている自然なキュイン(FEVER等)に左右されないように ok(g.audio.osc - o >= 15, 'キュインの発音数が少ない ' + (g.audio.osc - o));
  console.log('キュイン: 差し替え/間引き/逓減 ' + vs.map(v => v.toFixed(2)).join(' '));
}

// (e) ボーナス曲の音量(数値レンダリング): 他のBGMと同じ範囲(ピーク .05〜.35)
{
  for (const kd of [0, 1, 2]) {
    const g = createGame({ seed: 3, audio: 'render' }); g.start(); g.eval(KEEP); g.eval('setVol(.7,0)'); g.advance(1);
    g.eval(`btStart(${kd})`);
    for (let i = 0; i < 8; i++) { g.eval('G.rush=0;G.fv=0;G.jp=0;G.stage=1;' + KEEP); g.advance(.5) }
    const t0 = g.time; for (let i = 0; i < 24; i++) { g.eval('G.rush=0;G.fv=0;G.jp=0;G.stage=1;' + KEEP); g.advance(.5) }
    const st = stats(g.audio.rec.render(t0, g.time, 16000, []).out, 16000);
    ok(st.peak < .35 && st.peak > .05 && st.rms > .006, `ボーナス曲 ${kd}: 音量が範囲外 peak=${st.peak.toFixed(3)} rms=${st.rms.toFixed(4)}`);
    console.log(`ボーナス曲 ${g.eval('BG.s')}: peak ${st.peak.toFixed(3)} rms ${st.rms.toFixed(4)}`);
  }
}

if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1); }
console.log('\nAUDIO2 OK');
