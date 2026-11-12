# BOOTH での配布手順

## 1. 配布ファイルを作る(体験版と完全版)
```
SUPPORT_CODE=PACHI-XXXX-XXXX python3 tools/booth.py 1.1.0
```
→ `dist/booth/` に2つできる(サポーターコードはリポジトリに置かず、環境変数で渡す)
- `pachi-senki-1.1.0-体験版.zip` … `EDITION=free` でビルドした HTML。STAGE 75(エリア3)まで。先頭行に `@full` と書いたファイルは入らない
- `pachi-senki-1.1.0-完全版.zip` … 全部入り HTML + `サポーターコード.txt`(SUPPORT_CODE を渡した時)

体験版だけ手で作る: `EDITION=free node tools/build.js` → `dist/pachi-senki-free.html`
(Pages / Unity / テストは常に完全版。体験版の上限は `src/js/01-edition.js` の `FREE_MAX`、案内画面は `98l-edition.js`)

`booth/README.txt` の「作者 / 連絡先」を自分の情報に書き換えてから作ること。

## 2. BOOTH に出品する
1. 体験版: 「ダウンロード商品」0円 → 体験版 zip。
2. 完全版: 別の商品(有料)→ 完全版 zip。説明文は store/booth-page.md。
   - セーブは引き継ぎコード(メニュー「その他」→「セーブ」)で体験版から完全版へ移せる、と書く。
3. 商品ページのURLが決まったら `src/js/97s-support.js` の `BOOTH_URL` に設定して作り直す → 体験版の「完全版のご案内」と「応援」タブにボタンが出る。

## 完全版だけの中身を足すとき
- 新しいファイルの**1行目**に `// @full` と書く → 体験版のビルドから外れる(ロード時に他ファイルから参照されないこと)。
- `98l-edition.js` の `FULL_FEATS`(案内画面の一覧)に追記する(98l 自体は @full にしない)。

## 3. サポーターコードを変える
- ゲームはコードの **ハッシュ** だけを持つ(`SUP_CODE_HASH`)。新しいコードにするときは次で値を出して `SUP_CODE_HASH` に追加する(古い値を残せば旧コードも有効):
```
node -e "let h=0x811c9dc5;for(const c of process.argv[1].toUpperCase())h=Math.imul(h^c.charCodeAt(0),0x01000193)>>>0;console.log(h.toString(16))" PACHI-XXXX-XXXX
```
- ブラウザゲームなので判定は簡易。特典はお礼の宝石30個(1回だけ)とパトロン証・★。

## 4. 注意
- パチンコ風の表現を含むので、BOOTH のガイドライン(年齢制限・表現)を確認。実際のお金を賭ける/換金する要素は無い旨を説明文にも書くと安心。
- 外部サイトの決済リンクとストア版(App Store/Google Play)の課金は混在させない(ストア版を出す時は `BOOTH_URL` を空に)。
