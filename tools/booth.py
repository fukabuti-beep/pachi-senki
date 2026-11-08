#!/usr/bin/env python3
# BOOTH 配布用の zip を作る。
#   python3 tools/booth.py [版番号]                 → dist/booth/pachi-senki-<版>.zip(無料版: HTML + README.txt)
#   SUPPORT_CODE=PACHI-XXXX-XXXX python3 tools/booth.py [版番号]
#                                                  → 上に加えて dist/booth/pachi-senki-<版>-supporter.zip(応援版: + サポーターコード.txt)
# 先に node tools/build.js を実行しておくこと(このスクリプトが自動で実行もする)。コードはリポジトリに置かない(環境変数で渡す)。
import os, sys, subprocess, zipfile, datetime
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ver = sys.argv[1] if len(sys.argv) > 1 else datetime.date.today().strftime('%Y%m%d')
subprocess.run(['node', os.path.join(root, 'tools', 'build.js')], check=True, stdout=subprocess.DEVNULL)
html = os.path.join(root, 'dist', 'pachi-senki.html')
readme = open(os.path.join(root, 'booth', 'README.txt'), encoding='utf-8').read().replace('(バージョン)', ver)
out = os.path.join(root, 'dist', 'booth'); os.makedirs(out, exist_ok=True)
def mk(name, extra=None):
    p = os.path.join(out, name)
    with zipfile.ZipFile(p, 'w', zipfile.ZIP_DEFLATED) as z:
        z.write(html, 'パチ戦記/pachi-senki.html')
        z.writestr('パチ戦記/README.txt', '﻿' + readme.replace('\n', '\r\n'))   # Windows のメモ帳でも文字化けしないよう BOM+CRLF
        for n, t in (extra or {}).items(): z.writestr('パチ戦記/' + n, '﻿' + t.replace('\n', '\r\n'))
    print('built', os.path.relpath(p, root), os.path.getsize(p) // 1024, 'KB')
mk(f'pachi-senki-{ver}.zip')
code = os.environ.get('SUPPORT_CODE', '').strip()
if code:
    mk(f'pachi-senki-{ver}-supporter.zip', {'サポーターコード.txt':
        'パチ戦記を応援してくださって、本当にありがとうございます!\n\n'
        'サポーターコード: ' + code + '\n\n'
        'ゲームのメニュー(三本線)→「応援」タブで入力するとパトロン登録になり、\n'
        'お礼に宝石30個・タイトルの★・メニューの「パトロン証」を贈ります。\n\n'
        'このコードは他の人に教えないでね。\n'})
