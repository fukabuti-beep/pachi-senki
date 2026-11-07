#!/usr/bin/env python3
"""dist/pachi-senki.html をヘッドレスChromeで開いてスクリーンショットを撮る(目視確認用)。
使い方: python3 tools/shot.py OUT.png [秒数=6] [幅=393] [高さ=852] [--jp]   (--jp: 大当たりを強制発火)
"""
import sys, os, time
from playwright.sync_api import sync_playwright
out = sys.argv[1]; secs = float(sys.argv[2]) if len(sys.argv) > 2 else 6
w = int(sys.argv[3]) if len(sys.argv) > 3 else 393; h = int(sys.argv[4]) if len(sys.argv) > 4 else 852
html = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist', 'pachi-senki.html'))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=2)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto(html); pg.wait_for_timeout(600)
    if '--title' in sys.argv: pg.screenshot(path=out); b.close(); sys.exit(0)
    pg.click('#go'); pg.wait_for_timeout(int(secs * 1000))
    if '--jp' in sys.argv: pg.evaluate("bigHit(false)"); pg.wait_for_timeout(1500)
    pg.screenshot(path=out)
    print('errors:', errs[:5] if errs else 'none')
    b.close()
