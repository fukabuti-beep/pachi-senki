// ブラウザ無しでゲームを動かすためのハーネス。DOM/Canvas/WebAudio をスタブし、
// 仮想時計(setTimeout/setInterval含む)で何分でも高速にシミュレーションできる。
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');

function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function loadBundle(free) {   // free=体験版: build.js と同じく 1行目に @full があるファイルを外す
  const jsDir = path.join(root, 'src/js');
  return fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(jsDir, f), 'utf8')).filter(t => !(free && /@full/.test(t.split('\n')[0]))).join('\n');
}

// ls: 'ok'(既定) | 'throw'(localStorage への参照自体が例外=一部のプライベートモード) | 'setthrow'(setItem だけ例外=容量超過)
function createGame({ seed = 1, storage = {}, audio: audioMode = 'ok', ls = 'ok', globals = {} } = {}) {   // globals: 読み込み前に置く値(例 fetch のスタブ)
  let simTime = 0;
  const timers = []; let tid = 1;
  const audio = { osc: 0, noise: 0, byMinute: {}, spans: [], resumes: 0, waves: 0, pwaves: 0 };
  const rnd = mulberry(seed);
  const noop = () => {};
  const ctxMethods = ['save', 'restore', 'translate', 'rotate', 'scale', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'arc', 'ellipse', 'fill', 'stroke', 'fillRect', 'strokeRect', 'clearRect', 'fillText', 'strokeText', 'drawImage', 'setLineDash', 'clip', 'rect', 'quadraticCurveTo', 'bezierCurveTo', 'putImageData', 'transform', 'setTransform'];
  const makeCtx = () => {
    const c = { measureText: () => ({ width: 10 }), createLinearGradient: () => ({ addColorStop: noop }), createRadialGradient: () => ({ addColorStop: noop }), getImageData: () => ({ data: [] }) };
    ctxMethods.forEach(m => c[m] = noop); return c;
  };
  const els = {};
  const makeEl = (id) => ({
    id, style: {}, className: '', textContent: '', innerHTML: '', width: 360, height: 100, offsetWidth: 1,
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    getContext() { return this._c || (this._c = makeCtx()); },
    addEventListener(t, f) { (this._ev = this._ev || {})[t] = f; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 360, height: 400 }),
    appendChild: noop, setAttribute: noop,
  });
  const stats = { appended: 0, created: 0 };   // DOM 増加の監視用(堅牢性テスト)
  const docEv = {}, winEv = {};
  const document = {
    getElementById: id => els[id] || (els[id] = makeEl(id)),
    createElement: t => { stats.created++; return makeEl('<' + t + '>'); },
    fonts: { ready: Promise.resolve() }, body: makeEl('body'), hidden: false,
    addEventListener: (t, f) => (docEv[t] = docEv[t] || []).push(f),
  };
  document.body.appendChild = () => { stats.appended++; };
  // WebAudio スタブ(sound担当): 発音数(audio.osc/noise/byMinute)と同時発音の区間(audio.spans)を記録する。
  // audio オプション: 'ok'(既定) | 'none'(AudioContext無し) | 'broken'(生成は成功、create* が全て例外) | 'suspended'(resume() 後に running)
  const P = (v = 0) => ({ value: v, setValueAtTime: noop, exponentialRampToValueAtTime: noop, linearRampToValueAtTime: noop, setTargetAtTime: noop, cancelScheduledValues: noop });
  // audio:'render' = グラフを記録して audio.rec.render(t0,t1,sr,taps) で波形を計算できる(tools/audiorender.js)
  const REC = audioMode === 'render' ? require('./audiorender').createRecorder(() => simTime, {
    osc: () => { audio.osc++; const m = Math.floor(simTime / 60); audio.byMinute[m] = (audio.byMinute[m] || 0) + 1; },
    noise: () => { audio.noise++; }, wave: () => { audio.waves++; }, span: (s, e) => { audio.spans.push([s, e]); },
  }) : null;
  if (REC) audio.rec = REC;
  class AudioContext {
    get currentTime() { return simTime; }
    constructor() {
      this.destination = REC ? REC.destination : {}; this.sampleRate = 44100;
      this.state = audioMode === 'suspended' ? 'suspended' : 'running';
      if (audioMode === 'broken') for (const m of ['createOscillator', 'createGain', 'createBuffer', 'createBufferSource', 'createBiquadFilter', 'createDynamicsCompressor', 'createPeriodicWave', 'createStereoPanner', 'createDelay', 'createWaveShaper']) this[m] = () => { throw new Error('broken audio'); };
      if (REC) for (const m of ['createOscillator', 'createGain', 'createBuffer', 'createBufferSource', 'createBiquadFilter', 'createDynamicsCompressor', 'createPeriodicWave', 'createStereoPanner', 'createDelay', 'createWaveShaper']) this[m] = REC[m];
    }
    resume() { audio.resumes++; this.state = 'running'; return Promise.resolve(); }
    suspend() { this.state = 'suspended'; return Promise.resolve(); }
    createOscillator() {
      audio.osc++; const m = Math.floor(simTime / 60); audio.byMinute[m] = (audio.byMinute[m] || 0) + 1;
      const o = { type: '', frequency: P(), detune: P(), connect: noop, disconnect: noop, setPeriodicWave: () => { audio.pwaves++; }, onended: null };
      o.start = (t = simTime) => { o._s = t; };
      o.stop = (t = simTime) => { audio.spans.push([o._s == null ? simTime : o._s, t]); };
      return o;
    }
    createGain() { return { gain: P(1), connect: noop, disconnect: noop }; }
    createDynamicsCompressor() { return { threshold: P(), knee: P(), ratio: P(), attack: P(), release: P(), reduction: 0, connect: noop, disconnect: noop }; }
    createPeriodicWave(re, im) { audio.waves++; return {}; }
    createStereoPanner() { return { pan: P(), connect: noop, disconnect: noop }; }
    createDelay() { return { delayTime: P(), connect: noop, disconnect: noop }; }
    createWaveShaper() { return { curve: null, oversample: 'none', connect: noop, disconnect: noop }; }
    createBuffer(c, n) { return { length: n, getChannelData: () => new Float32Array(n) }; }
    createBufferSource() { audio.noise++; return { buffer: null, loop: false, playbackRate: P(1), connect: noop, disconnect: noop, start: noop, stop: noop }; }
    createBiquadFilter() { return { type: '', frequency: P(), Q: P(), gain: P(), connect: noop, disconnect: noop }; }
  }
  const store = { ...storage };
  const sandbox = {
    document, console, Float32Array, Promise, JSON, Date,
    innerWidth: 393, innerHeight: 852,
    addEventListener: (t, f) => (winEv[t] = winEv[t] || []).push(f),
    AudioContext: audioMode === 'none' ? undefined : AudioContext, requestAnimationFrame: noop,
    setTimeout: (fn, ms = 0) => { const id = tid++; timers.push({ id, at: simTime + ms / 1000, fn }); return id; },
    clearTimeout: id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); },
    setInterval: (fn, ms = 0) => { const id = tid++; timers.push({ id, at: simTime + ms / 1000, fn, every: ms / 1000 }); return id; },
    clearInterval: id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); },
    performance: { now: () => simTime * 1000 },
  };
  const lsObj = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { if (ls === 'setthrow') throw new Error('QuotaExceededError'); store[k] = String(v); }, removeItem: k => { delete store[k]; }, key: i => { const ks = Object.keys(store); return i < ks.length ? ks[i] : null; }, get length() { return Object.keys(store).length; } };
  if (ls === 'throw') Object.defineProperty(sandbox, 'localStorage', { get() { throw new Error('SecurityError: localStorage denied'); } });
  else sandbox.localStorage = lsObj;
  sandbox.window = sandbox;
  const M = Object.create(Math); M.random = rnd; sandbox.Math = M;
  sandbox.PACHI_NOPAUSE = 1;   // テストは既定で「物語中の一時停止」(98p)を切る(globals で 0 にすると有効)
  sandbox.PACHI_RANK_API = '';   // テストは既定でランキングサーバーに通信しない(globals で上書き可)
  Object.assign(sandbox, globals);
  const ctx = vm.createContext(sandbox);
  vm.runInContext(loadBundle(globals.PACHI_EDITION === 'free'), ctx, { filename: 'bundle.js' });

  const runTimers = () => {
    for (;;) {
      let k = -1;
      for (let i = 0; i < timers.length; i++) if (timers[i].at <= simTime && (k < 0 || timers[i].at < timers[k].at)) k = i;
      if (k < 0) return;
      const t = timers[k];
      if (t.every) t.at += t.every; else timers.splice(k, 1);
      t.fn();
    }
  };
  const game = {
    ctx, audio, els, store, stats,
    // ブラウザイベントの発火(visibilitychange / resize など)。hidden は document.hidden に反映
    fire(type, { hidden, target } = {}) { if (hidden != null) document.hidden = hidden; for (const f of (docEv[type] || []).concat(winEv[type] || [])) f({ type, target: target || document }); },
    setSize(w, h) { sandbox.innerWidth = w; sandbox.innerHeight = h; },
    get time() { return simTime; },
    eval: code => vm.runInContext(code, ctx, { filename: 'probe.js' }),
    start() { game.eval("$('go').onclick()"); },
    // seconds 秒ぶん、frame(秒) 刻みで loop() を回す。
    advance(seconds, frame = 0.05, onFrame) {
      const n = Math.round(seconds / frame);
      for (let i = 0; i < n; i++) {
        simTime += frame; runTimers();
        game.eval(`loop(${(simTime * 1000).toFixed(3)})`);
        if (onFrame) onFrame(i);
      }
    },
  };
  return game;
}
module.exports = { createGame };
