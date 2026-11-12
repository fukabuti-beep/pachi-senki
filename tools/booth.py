#!/usr/bin/env python3
# BOOTH 配布用の zip を作る。
#   SUPPORT_CODE=PACHI-XXXX-XXXX python3 tools/booth.py [版番号]
#     → dist/booth/pachi-senki-<版>-体験版.zip(無料: STAGE 75 まで)と pachi-senki-<版>-完全版.zip(有料: 全部 + サポーターコード)
#   体験版は EDITION=free で書き出す(01-edition.js)。
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
# 体験版(無料)と完全版(有料)の2つを作る。完全版はサポーターコード(SUPPORT_CODE)があれば同梱(お礼の宝石30個など)
FREE_SEC = """■ 体験版について
 この体験版は STAGE 75(エリア3)まで遊べます。
 完全版では、エリア4〜8・残りのエリアの主・物語の続きと決着・遠征の新しい行き先など、
 この続きが全部遊べます。体験版のセーブは引き継ぎコードでそのまま完全版へ持っていけます。
 BOOTH: https://fukabuchi.booth.pm/
"""
FULL_SEC = """■ 完全版について
 お買い上げありがとうございます!完全版はすべてのエリアとコンテンツを遊べます。
 体験版で遊んでいた方は、体験版のメニュー「その他」→「セーブ」で引き継ぎコードを書き出し、
 完全版の同じ画面で読み込むと続きから遊べます。
"""
def readme_for(free):
    return readme.replace('{EDITION}', '体験版' if free else '完全版').replace('{EDITION_SECTION}', FREE_SEC if free else FULL_SEC).replace('{TRANSFER}', '完全版' if free else '新しいバージョン')
subprocess.run(['node', os.path.join(root, 'tools', 'build.js')], check=True, stdout=subprocess.DEVNULL, env=dict(os.environ, EDITION='free'))
full_html, free_html = html, os.path.join(root, 'dist', 'pachi-senki-free.html')
def mk2(name, src, rd, extra=None):
    p = os.path.join(out, name)
    with zipfile.ZipFile(p, 'w', zipfile.ZIP_DEFLATED) as z:
        z.write(src, 'パチ戦記/pachi-senki.html')
        z.writestr('パチ戦記/README.txt', '\ufeff' + rd.replace('\n', '\r\n'))
        for n, t in (extra or {}).items(): z.writestr('パチ戦記/' + n, '\ufeff' + t.replace('\n', '\r\n'))
    print('built', os.path.relpath(p, root), os.path.getsize(p) // 1024, 'KB')
mk2(f'pachi-senki-{ver}-体験版.zip', free_html, readme_for(True))
code = os.environ.get('SUPPORT_CODE', '').strip()
extra = {'サポーターコード.txt':
    '完全版をお買い上げいただき、本当にありがとうございます!\n\n'
    'サポーターコード: ' + code + '\n\n'
    'ゲームのメニュー(三本線)→「応援」タブで入力するとパトロン登録になり、\n'
    'お礼に宝石30個・タイトルの★・メニューの「パトロン証」を贈ります。\n\n'
    'このコードは他の人に教えないでね。\n'} if code else None
mk2(f'pachi-senki-{ver}-完全版.zip', full_html, readme_for(False), extra)
