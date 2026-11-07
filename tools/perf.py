#!/usr/bin/env python3
"""性能プロファイル: RUSH/FEVER/PUSH/ルーレット/ジャックポット中の1フレームの処理時間(ms)を測る。
使い方: python3 tools/perf.py [--throttle=4] [--secs=4] [--html=dist/pachi-senki.html] [--prof]   (--prof: CDPサンプリングで自己時間の上位関数も出す)
update/drawP/drawB/drawMq/refresh を performance.now() でフックし、CPU を CDP Emulation.setCPUThrottlingRate で絞る。
"""
import sys, os, json
from playwright.sync_api import sync_playwright
arg = lambda k, d: next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--' + k + '=')), d)
TH = float(arg('throttle', 4)); SECS = float(arg('secs', 4)); PROF = '--prof' in sys.argv
root = os.path.join(os.path.dirname(__file__), '..')
html = 'file://' + os.path.abspath(os.path.join(root, arg('html', 'dist/pachi-senki.html')))
SC = {
 'normal':   ('G.gold=3e5;G.stage=8;', 0),
 'rush':     ('G.stage=8;setInterval(function(){G.rush=9;G.combo=7},200)', 0),
 'fever':    ('G.stage=8;setInterval(function(){G.fv=8;G.rush=0},200)', 0),
 'rush+fever+aw': ('G.stage=8;setInterval(function(){G.rush=9;G.combo=9;G.fv=8;G.aw=5},200)', 0),
 'push':     ('G.stage=8;bigHit(false)', 1.3),
 'roulette': ('G.stage=8;bigHit(false);setTimeout(function(){pushPress(0)},1300)', 2.9),
 'jackpot':  ('G.stage=8;bigHit(true);setTimeout(function(){pushPress(0)},1300)', 3.2),
 'boss':     ('G.stage=10;spawn();', 0.5),
}
HOOK = """(()=>{window.__m={};const F=['update','drawP','drawB','drawMq','refresh'];
F.forEach(n=>{const o=window[n];if(typeof o!=='function')return;window.__m[n]=[];window[n]=function(){const t=performance.now();const r=o.apply(this,arguments);window.__m[n].push(performance.now()-t);return r}});
window.__f=[];let l=0;(function f(ts){if(l)window.__f.push(ts-l);l=ts;requestAnimationFrame(f)})(0)})()"""
def stats(a):
    if not a: return None
    s = sorted(a); n = len(s)
    return dict(mean=sum(s) / n, p95=s[int(n * .95) - 1 if n > 20 else -1], max=s[-1], n=n)
out = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for name, (setup, pre) in SC.items():
        pg = b.new_page(viewport={'width': 393, 'height': 852}, device_scale_factor=3)
        pg.route('**/fonts.g*/**', lambda r: r.abort())
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(html, wait_until='domcontentloaded'); pg.wait_for_timeout(400)
        pg.click('#go'); pg.wait_for_timeout(300)
        cdp = pg.context.new_cdp_session(pg)
        if TH > 1: cdp.send('Emulation.setCPUThrottlingRate', {'rate': TH})
        pg.evaluate(HOOK); pg.evaluate(setup); pg.wait_for_timeout(int(pre * 1000 * (1 if TH <= 1 else 1.0)))
        pg.evaluate('(()=>{for(const k in __m)__m[k].length=0;__f.length=0})()')
        if PROF: cdp.send('Profiler.enable'); cdp.send('Profiler.setSamplingInterval', {'interval': 250}); cdp.send('Profiler.start')
        pg.wait_for_timeout(int(SECS * 1000))
        top = None
        if PROF:
            prof = cdp.send('Profiler.stop')['profile']; nodes = {n['id']: n for n in prof['nodes']}
            dt = prof['timeDeltas']; selft = {}
            for sid, d in zip(prof['samples'], dt):
                cf = nodes[sid]['callFrame']; k = (cf['functionName'] or '(anon)') + ':' + str(cf['lineNumber'] + 1)
                selft[k] = selft.get(k, 0) + d
            tot = sum(selft.values()); top = sorted(selft.items(), key=lambda x: -x[1])[:12]; top = [(k, round(v / 1000, 1), round(v / tot * 100, 1)) for k, v in top]
        m = pg.evaluate('({m:__m,f:__f})')
        r = {k: stats(v) for k, v in m['m'].items()}; r['frame'] = stats(m['f']); r['errs'] = errs[:2]
        if top: r['top'] = top
        out[name] = r; pg.close()
    b.close()
if '--json' in sys.argv: print(json.dumps(out))
else:
    print(f'throttle={TH}x secs={SECS}  (ms/frame mean / p95 / max)  fps=1000/frame.mean')
    print('%-14s %-18s %-18s %-18s %-14s %-16s %s' % ('scene', 'drawP', 'drawB', 'update', 'drawMq', 'refresh', 'frame(rAF) fps'))
    f = lambda s: '%5.2f/%5.2f/%5.1f' % (s['mean'], s['p95'], s['max']) if s else '-'
    for k, r in out.items():
        fr = r['frame']
        print('%-14s %-18s %-18s %-18s %-14s %-16s %s %.0f' % (k, f(r.get('drawP')), f(r.get('drawB')), f(r.get('update')), '%5.2f' % r['drawMq']['mean'] if r.get('drawMq') else '-', '%5.2f' % r['refresh']['mean'] if r.get('refresh') else '-', '%.1fms' % fr['mean'] if fr else '-', 1000 / fr['mean'] if fr else 0), r['errs'] or '')
        if r.get('top'):
            for t in r['top'][:8]: print('      %-34s %7.1fms %5.1f%%' % t)
