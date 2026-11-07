#!/usr/bin/env python3
"""Chromeトレースでメインスレッドの内訳(Layout/Style/Paint/Raster/Script...)をシーン別に集計する。
使い方: python3 tools/perf_trace.py [--throttle=4] [--secs=3] [--scenes=normal,rush,push]"""
import sys, os, json, tempfile
from playwright.sync_api import sync_playwright
arg = lambda k, d: next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--' + k + '=')), d)
TH = float(arg('throttle', 4)); SECS = float(arg('secs', 3)); SCN = arg('scenes', 'normal,rush,fever,push,roulette,jackpot').split(',')
root = os.path.join(os.path.dirname(__file__), '..')
html = 'file://' + os.path.abspath(os.path.join(root, arg('html', 'dist/pachi-senki.html')))
SC = {
 'normal': ('G.stage=8;', 0),
 'rush': ('G.stage=8;setInterval(function(){G.rush=9;G.combo=7},200)', 0),
 'fever': ('G.stage=8;setInterval(function(){G.fv=8;G.rush=0},200)', 0),
 'push': ('G.stage=8;bigHit(false)', 1.3),
 'roulette': ('G.stage=8;bigHit(false);setTimeout(function(){pushPress(0)},1300)', 2.9),
 'jackpot': ('G.stage=8;bigHit(true);setTimeout(function(){pushPress(0)},1300)', 3.2),
}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for name in SCN:
        setup, pre = SC[name]
        pg = b.new_page(viewport={'width': 393, 'height': 852}, device_scale_factor=3)
        pg.route('**/fonts.g*/**', lambda r: r.abort())
        pg.goto(html, wait_until='domcontentloaded'); pg.wait_for_timeout(400); pg.click('#go'); pg.wait_for_timeout(300)
        pg.evaluate(setup); pg.wait_for_timeout(int(pre * 1000))
        tmp = tempfile.mktemp(suffix='.json')
        b.start_tracing(page=pg, path=tmp, categories=['devtools.timeline', 'disabled-by-default-devtools.timeline', 'cc', 'gpu', 'viz'])
        cdp = pg.context.new_cdp_session(pg)
        if TH > 1: cdp.send('Emulation.setCPUThrottlingRate', {'rate': TH})
        pg.wait_for_timeout(int(SECS * 1000)); b.stop_tracing()
        ev = json.load(open(tmp))['traceEvents']; os.remove(tmp)
        agg = {}
        for e in ev:
            if e.get('ph') == 'X' and 'dur' in e:
                agg.setdefault((e['name']), [0, 0]); agg[e['name']][0] += e['dur']; agg[e['name']][1] += 1
        want = ['FunctionCall', 'UpdateLayoutTree', 'Layout', 'PrePaint', 'Paint', 'Layerize', 'Commit', 'RasterTask', 'ImageDecodeTask', 'FireAnimationFrame', 'RunTask', 'GPUTask', 'DrawFrame', 'CompositeLayers', 'UpdateLayer', 'EvaluateScript', 'MinorGC', 'MajorGC', 'V8.GC_MC_BACKGROUND_MARKING', 'ProxyMain::BeginMainFrame', 'DisplayItemList::Raster','ScheduledAction::Execute','TimerFire','HitTest']
        print(f'== {name}  throttle={TH}x {SECS}s  (ms total / count)')
        for k in sorted(agg, key=lambda k: -agg[k][0])[:14]:
            print('   %-40s %8.1f %6d' % (k, agg[k][0] / 1000, agg[k][1]))
        pg.close()
    b.close()
