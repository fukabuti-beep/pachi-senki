// WebAudio グラフの「記録 + 数値レンダラ」(sound担当)。
// ブラウザ/OfflineAudioContext が無い環境でも、ゲームが組んだ音声グラフ(Oscillator/Gain/BufferSource/Compressor/Delay/WaveShaper)を
// 1サンプルずつ計算して波形(Float32Array)にする。ピーク/RMS/クリップの検証用。
// 近似: DynamicsCompressor は Chromium のカーブ(ニー+makeup)を静的に適用し、アタックは瞬時、リリースのみ平滑化する簡易モデル。
//       BufferSource は最近傍補間(ノイズ用途のみ)。Oscillator は帯域制限なし(エイリアスは無視)。
'use strict';
const TAU = Math.PI * 2;

class Param {
  constructor(rec, def) { this.rec = rec; this.def = def; this.ev = []; }
  get value() { return this._v === undefined ? this.def : this._v; }
  set value(v) { this._v = v; this.ev.push({ k: 's', v, t: this.rec.now() }); this._sort(); }
  _add(k, v, t) { this.ev.push({ k, v, t, n: this.ev.length }); this._sort(); return this; }
  _sort() { this.ev.sort((a, b) => a.t - b.t || (a.n || 0) - (b.n || 0)); }
  setValueAtTime(v, t) { return this._add('s', v, t); }
  linearRampToValueAtTime(v, t) { return this._add('l', v, t); }
  exponentialRampToValueAtTime(v, t) { return this._add('e', v, t); }
  setTargetAtTime(v, t) { return this._add('s', v, t); }
  // 本物の Web Audio では、すでに過ぎた時刻の値は取り消せない(鳴った音は変わらない)。あとからまとめて計算するので、
  // 「今より前」を指定された取り消しは「今から先」だけにする(過去の音量の記録を消すと、過去の区間を初期値1で計算してしまう)
  cancelScheduledValues(t) { const c = Math.max(t, this.rec.now()); this.ev = this.ev.filter(e => e.t < c); return this; }
  at(t) {
    const ev = this.ev; if (!ev.length) return this.def;
    let i = -1; while (i + 1 < ev.length && ev[i + 1].t <= t) i++;
    const base = i >= 0 ? ev[i] : { v: this.def, t: -1e9, k: 's' }, nx = ev[i + 1];
    if (nx && (nx.k === 'l' || nx.k === 'e') && nx.t > base.t) {
      const r = (t - base.t) / (nx.t - base.t);
      if (nx.k === 'l') return base.v + (nx.v - base.v) * r;
      if (base.v > 0 && nx.v > 0) return base.v * Math.pow(nx.v / base.v, r);
    }
    return base.v;
  }
}

function createRecorder(now, hooks = {}) {
  const rec = { now, nodes: [], dest: null };
  const P = d => new Param(rec, d);
  class Node {
    constructor(kind) { this.kind = kind; this.in = []; this.out = []; rec.nodes.push(this); }
    connect(d) { if (d && d.in) { d.in.push(this); this.out.push(d) } return d; }
    disconnect() { for (const d of this.out) { const i = d.in.indexOf(this); if (i >= 0) d.in.splice(i, 1) } this.out = []; }
  }
  rec.dest = new Node('dest');
  rec.destination = rec.dest;
  rec.createOscillator = () => {
    const o = new Node('osc'); o.frequency = P(440); o.detune = P(0); o.wtype = 'sine'; o.wave = null; o._s = null; o._e = null;
    Object.defineProperty(o, 'type', { get() { return this.wtype }, set(v) { this.wtype = v } });
    o.setPeriodicWave = w => { o.wave = w };
    o.start = (t = now()) => { o._s = t };
    o.stop = (t = now()) => { o._e = t; hooks.span && hooks.span(o._s == null ? now() : o._s, t) };
    hooks.osc && hooks.osc();
    return o;
  };
  rec.createGain = () => { const g = new Node('gain'); g.gain = P(1); return g };
  rec.createBufferSource = () => {
    const b = new Node('buf'); b.buffer = null; b.playbackRate = P(1); b._s = null;
    b.start = (t = now(), off = 0, dur) => { b._s = t; b._off = off || 0; b._dur = dur == null ? 1e9 : dur };
    b.stop = () => { };
    hooks.noise && hooks.noise();
    return b;
  };
  rec.createBuffer = (c, n, sr) => { const d = new Float32Array(n); return { length: n, sampleRate: sr, getChannelData: () => d } };
  rec.createDynamicsCompressor = () => { const c = new Node('comp'); c.threshold = P(-24); c.knee = P(30); c.ratio = P(12); c.attack = P(.003); c.release = P(.25); c.reduction = 0; return c };
  rec.createDelay = () => { const d = new Node('delay'); d.delayTime = P(0); return d };
  rec.createWaveShaper = () => { const s = new Node('shaper'); s.curve = null; s.oversample = 'none'; return s };
  rec.createPeriodicWave = (re, im) => { hooks.wave && hooks.wave(); return { re, im } };
  rec.createStereoPanner = () => { const p = new Node('gain'); p.pan = P(0); p.gain = P(1); return p };
  rec.createBiquadFilter = () => { const f = new Node('gain'); f.frequency = P(350); f.Q = P(1); f.gain = P(1); f.type = 'lowpass'; return f };

  // ---- Chromium 風コンプレッサの静的カーブ ----
  const db2l = d => Math.pow(10, d / 20), l2db = x => 20 * Math.log10(Math.max(x, 1e-9));
  function compCurve(thDb, kneeDb, ratio) {
    const lt = db2l(thDb), kt = db2l(thDb + kneeDb), slope = 1 / ratio;
    const kc = (x, k) => x < lt ? x : lt + (1 - Math.exp(-k * (x - lt))) / k;
    const sl = (x, k) => { if (x < lt) return 1; const x2 = x * 1.001; return (l2db(kc(x2, k)) - l2db(kc(x, k))) / (l2db(x2) - l2db(x)) };
    let lo = .1, hi = 10000, k = 5;
    for (let i = 0; i < 15; i++) { if (sl(kt, k) < slope) hi = k; else lo = k; k = Math.sqrt(lo * hi) }
    const yk = l2db(kc(kt, k));
    const sat = x => x < lt ? x : x < kt ? kc(x, k) : db2l(yk + slope * (l2db(x) - (thDb + kneeDb)));
    const makeup = Math.pow(1 / sat(1), .6);
    return { sat, makeup };
  }

  /* 区間 [t0,t1) を sr でレンダリング。taps: 出力を別途取りたいノード配列 */
  rec.render = function (t0, t1, sr = 16000, taps = []) {
    const N = Math.ceil((t1 - t0) * sr), B = 128, nodes = rec.nodes;
    const outs = new Float32Array(N), tapOut = taps.map(() => new Float32Array(N));
    // 状態
    const oscs = nodes.filter(n => n.kind === 'osc' && n._s != null);
    for (const o of oscs) { o.ph = 0; if (!o.wave) o.tab = null; else { const T = new Float32Array(512); for (let i = 0; i < 512; i++) { let s = 0; for (let h = 1; h < o.wave.re.length; h++) s += o.wave.re[h] * Math.cos(h * TAU * i / 512) + o.wave.im[h] * Math.sin(h * TAU * i / 512); T[i] = s } o.tab = T } }
    const comps = nodes.filter(n => n.kind === 'comp'); for (const c of comps) { c.env = 0; c.g = 1; c.cv = compCurve(c.threshold.at(t0), c.knee.at(t0), c.ratio.at(t0)); c.minG = 1 }
    const dls = nodes.filter(n => n.kind === 'delay'); for (const d of dls) { d.len = Math.ceil(1.1 * sr) + B; d.buf = new Float32Array(d.len); d.w = 0 }
    for (const n of nodes) if (n.kind === 'gain') n.mod = null;
    const wave = (o, ph) => {
      switch (o.wtype) {
        case 'sine': return Math.sin(TAU * ph);
        case 'square': return ph < .5 ? 1 : -1;
        case 'sawtooth': return 2 * ph - 1;
        case 'triangle': return ph < .25 ? 4 * ph : ph < .75 ? 2 - 4 * ph : 4 * ph - 4;
        default: return o.tab ? o.tab[(ph * 512) | 0] : Math.sin(TAU * ph);
      }
    };
    const sorted = oscs.slice().sort((a, b) => a._s - b._s);
    const bufs = nodes.filter(n => n.kind === 'buf' && n._s != null);
    const cache = new Map();
    let blk0 = 0;
    const get = (n, b0, len) => {
      if (n.kind === 'delay') { // 過去に書いた分だけ読む(遅延 >= ブロック長)
        const key = n; if (cache.has(key)) return cache.get(key);
        const o = new Float32Array(len), ds = Math.round(n.delayTime.at(t0 + b0 / sr) * sr);
        let any = false;
        for (let i = 0; i < len; i++) { const r = ((n.w + i - ds) % n.len + n.len) % n.len; const v = n.buf[r]; if (v) any = true; o[i] = v }
        const res = any ? o : null; cache.set(key, res); return res;
      }
      if (cache.has(n)) return cache.get(n);
      cache.set(n, null); // 循環ガード
      let res = null;
      const tt = i => t0 + (b0 + i) / sr;
      if (n.kind === 'osc') {
        if (n._s < t0 + (b0 + len) / sr && (n._e == null || n._e > t0 + b0 / sr)) {
          res = new Float32Array(len);
          for (let i = 0; i < len; i++) {
            const t = tt(i); if (t < n._s || (n._e != null && t >= n._e)) continue;
            const f = n.frequency.at(t) * Math.pow(2, n.detune.at(t) / 1200);
            n.ph = (n.ph + f / sr) % 1; res[i] = wave(n, n.ph);
          }
        }
      } else if (n.kind === 'buf') {
        if (n.buffer && n._s < t0 + (b0 + len) / sr && n._s + n._dur > t0 + b0 / sr) {
          res = new Float32Array(len); const d = n.buffer.getChannelData(0), bs = n.buffer.sampleRate || 44100;
          for (let i = 0; i < len; i++) { const t = tt(i), u = t - n._s; if (u < 0 || u >= n._dur) continue; res[i] = d[Math.floor((n._off + u) * bs) % d.length] }
        }
      } else {
        let sum = null;
        for (const s of n.in) { const o = get(s, b0, len); if (!o) continue; if (!sum) sum = new Float32Array(len); for (let i = 0; i < len; i++) sum[i] += o[i] }
        if (n.kind === 'dest' || n.kind === 'delay') res = sum;
        else if (sum) {
          if (n.kind === 'gain') { res = sum; const g = n.gain; if (!g.ev.length) { const v = g.def; for (let i = 0; i < len; i++) res[i] *= v } else for (let i = 0; i < len; i++) res[i] *= g.at(tt(i)) }
          else if (n.kind === 'shaper') { const c = n.curve; if (!c) res = sum; else { res = sum; for (let i = 0; i < len; i++) { const x = Math.max(-1, Math.min(1, sum[i])), p = (x + 1) / 2 * (c.length - 1), j = Math.floor(p), f = p - j; res[i] = c[j] * (1 - f) + (c[Math.min(j + 1, c.length - 1)]) * f } } }
          else if (n.kind === 'comp') {
            res = sum; const rel = Math.exp(-1 / (Math.max(.01, n.release.at(t0)) * sr));
            for (let i = 0; i < len; i++) {
              const a = Math.abs(sum[i]); n.env = a > n.env ? a : n.env * rel + a * (1 - rel);
              const e = Math.max(n.env, 1e-6), tg = n.cv.sat(e) / e; n.g = tg < n.g ? tg : n.g + (tg - n.g) * (1 - rel);
              res[i] = sum[i] * n.g * n.cv.makeup; if (n.g < n.minG) n.minG = n.g;
            }
          }
        }
      }
      cache.set(n, res); return res;
    };
    for (let b0 = 0; b0 < N; b0 += B) {
      const len = Math.min(B, N - b0); cache.clear();
      const o = get(rec.dest, b0, len);
      if (o) outs.set(o, b0);
      taps.forEach((n, k) => { const r = get(n, b0, len); if (r) tapOut[k].set(r, b0) });
      for (const d of dls) { // 入力をリングバッファへ書き込み
        let sum = null; for (const s of d.in) { const r = get(s, b0, len); if (!r) continue; if (!sum) sum = new Float32Array(len); for (let i = 0; i < len; i++) sum[i] += r[i] }
        for (let i = 0; i < len; i++) d.buf[(d.w + i) % d.len] = sum ? sum[i] : 0;
        d.w = (d.w + len) % d.len;
      }
    }
    return { out: outs, taps: tapOut, sr, comps: comps.map(c => ({ minGain: c.minG, makeup: c.cv.makeup })) };
  };
  return rec;
}

/* 波形の統計: ピーク / RMS / 区間(秒)ごとのRMS */
function stats(x, sr) {
  let pk = 0, ss = 0; for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > pk) pk = a; ss += x[i] * x[i] }
  const w = Math.max(1, Math.round(sr * .1)); let pkRms = 0;
  for (let i = 0; i + w <= x.length; i += w) { let s = 0; for (let j = 0; j < w; j++) s += x[i + j] * x[i + j]; pkRms = Math.max(pkRms, Math.sqrt(s / w)) }
  return { peak: pk, rms: Math.sqrt(ss / Math.max(1, x.length)), rms100: pkRms };
}
module.exports = { createRecorder, stats };
