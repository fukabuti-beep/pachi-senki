// ブラウザ無しでゲームを動かすためのハーネス。DOM/Canvas/WebAudio をスタブし、
// 仮想時計(setTimeout/setInterval含む)で何分でも高速にシミュレーションできる。
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');

function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function loadBundle() {
  const jsDir = path.join(root, 'src/js');
  return fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(jsDir, f), 'utf8')).join('\n');
}

function createGame({ seed = 1, storage = {} } = {}) {
  let simTime = 0;
  const timers = []; let tid = 1;
  const audio = { osc: 0, noise: 0, byMinute: {} };
  const rnd = mulberry(seed);
  const noop = () => {};
  const ctxMethods = ['save', 'restore', 'translate', 'rotate', 'scale', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'arc', 'ellipse', 'fill', 'stroke', 'fillRect', 'strokeRect', 'clearRect', 'fillText', 'strokeText', 'drawImage', 'setLineDash', 'clip', 'rect', 'quadraticCurveTo', 'bezierCurveTo', 'putImageData'];
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
  const document = {
    getElementById: id => els[id] || (els[id] = makeEl(id)),
    createElement: t => makeEl('<' + t + '>'),
    fonts: { ready: Promise.resolve() }, body: makeEl('body'),
  };
  class AudioContext {
    get currentTime() { return simTime; }
    constructor() { this.destination = {}; }
    createOscillator() { audio.osc++; const m = Math.floor(simTime / 60); audio.byMinute[m] = (audio.byMinute[m] || 0) + 1; const p = { value: 0, setValueAtTime: noop, exponentialRampToValueAtTime: noop, linearRampToValueAtTime: noop }; return { type: '', frequency: p, connect: noop, start: noop, stop: noop }; }
    createGain() { const p = { value: 1, setValueAtTime: noop, exponentialRampToValueAtTime: noop, linearRampToValueAtTime: noop }; return { gain: p, connect: noop }; }
    createBuffer(c, n) { return { getChannelData: () => new Float32Array(n) }; }
    createBufferSource() { audio.noise++; return { buffer: null, connect: noop, start: noop }; }
    createBiquadFilter() { return { type: '', frequency: { value: 0, setValueAtTime: noop }, Q: { value: 0 }, connect: noop }; }
  }
  const store = { ...storage };
  const sandbox = {
    document, console, Float32Array, Promise, JSON, Date,
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
    AudioContext, requestAnimationFrame: noop,
    setTimeout: (fn, ms = 0) => { const id = tid++; timers.push({ id, at: simTime + ms / 1000, fn }); return id; },
    clearTimeout: id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); },
    setInterval: (fn, ms = 0) => { const id = tid++; timers.push({ id, at: simTime + ms / 1000, fn, every: ms / 1000 }); return id; },
    clearInterval: id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); },
    performance: { now: () => simTime * 1000 },
  };
  sandbox.window = sandbox;
  const M = Object.create(Math); M.random = rnd; sandbox.Math = M;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(loadBundle(), ctx, { filename: 'bundle.js' });

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
    ctx, audio, els, store,
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
