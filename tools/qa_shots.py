#!/usr/bin/env python3
"""複数ビューポート x 主要シーンのスクリーンショットを撮る(ui/QA用)。
使い方: python3 tools/qa_shots.py OUTDIR [--vp=320x568,375x667,...] [--scenes=title,battle,...]
dist/pachi-senki.html を使う。シーンごとに新しいページを開く(状態を引きずらない)。
"""
import sys, os, json
from playwright.sync_api import sync_playwright
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
arg = lambda k, d: next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--' + k + '=')), d)
VPS = [tuple(map(int, v.split('x'))) for v in arg('vp', '320x568,375x667,390x844,393x852,430x932,852x393').split(',')]
SC = arg('scenes', 'title,battle,rush,fever,push,roulette,sheet,settings,mini,jackpot,menu').split(',')
html = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist', 'pachi-senki.html'))
SETUP = {
 'title': None,
 'battle': ('', 3000),
 'rush': ('G.rush=9;G.combo=4;', 1500),
 'fever': ('G.fv=8;', 1500),
 'push': ('bigHit(false);', 1700),
 'roulette': ('bigHit(false);', 1700, 'pushPress(0)', 2600),
 'sheet': ('G.gold=5e4;G.stage=12;', 800, "$('ubt').click()", 600),
 'settings': ('', 500, "$('cfgb').click()", 400),
 'mini': ('G.stage=3;MGT[0];mini();', 1500),
 'jackpot': ('bigHit(true);', 1700, 'pushPress(0)', 2200),
 'menu': ('', 500, 'fxMenu()', 400),
}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    errs = {}
    for (w, h) in VPS:
        for sc in SC:
            pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=2)
            e = errs.setdefault(f'{w}x{h}/{sc}', [])
            pg.on('pageerror', lambda x, e=e: e.append(str(x)))
            pg.on('console', lambda m, e=e: e.append(m.text) if m.type == 'error' and 'fonts.g' not in m.text and 'ERR_' not in m.text else None)
            pg.goto(html); pg.wait_for_timeout(500)
            if sc != 'title':
                pg.click('#go'); pg.wait_for_timeout(400)
                s = SETUP[sc]
                if sc == 'mini': pg.evaluate("mini()")
                else:
                    if s[0]: pg.evaluate(s[0])
                    pg.wait_for_timeout(s[1])
                    if len(s) > 2: pg.evaluate(s[2]); pg.wait_for_timeout(s[3])
            pg.screenshot(path=f'{out}/{w}x{h}_{sc}.png')
            pg.close()
    b.close()
print(json.dumps({k: v[:3] for k, v in errs.items() if v}, ensure_ascii=False, indent=1) or 'no errors')
