# BOOTH での配布手順

## 1. 配布ファイルを作る
```
python3 tools/booth.py 1.0.0
```
→ `dist/booth/pachi-senki-1.0.0.zip`(無料版: `パチ戦記/pachi-senki.html` + `README.txt`)

応援版も作る場合(サポーターコードはリポジトリに置かず、環境変数で渡す):
```
SUPPORT_CODE=PACHI-XXXX-XXXX python3 tools/booth.py 1.0.0
```
→ `dist/booth/pachi-senki-1.0.0-supporter.zip`(+ `サポーターコード.txt`)

`booth/README.txt` の「作者 / 連絡先」を自分の情報に書き換えてから作ること。

## 2. BOOTH に出品する
1. 無料版: 商品を「ダウンロード商品」で作成 → 価格 0円 → 無料版 zip をアップロード。
   - 無料商品でも購入者は **BOOST(任意の上乗せ)** で応援できる(BOOTH の標準機能)。
2. 応援版(任意): 別の商品(例 300円)として、応援版 zip をアップロード。中身は同じゲーム + サポーターコード。
   - 説明文に「内容は無料版と同じです。応援用です」と明記すると親切。
3. 商品ページのURLが決まったら `src/js/97s-support.js` の `BOOTH_URL` に設定して作り直す → ゲーム内「応援」タブに「BOOTH のページを開く」ボタンが出る。

## 3. サポーターコードを変える
- ゲームはコードの **ハッシュ** だけを持つ(`SUP_CODE_HASH`)。新しいコードにするときは次で値を出して `SUP_CODE_HASH` に追加する(古い値を残せば旧コードも有効):
```
node -e "let h=0x811c9dc5;for(const c of process.argv[1].toUpperCase())h=Math.imul(h^c.charCodeAt(0),0x01000193)>>>0;console.log(h.toString(16))" PACHI-XXXX-XXXX
```
- ブラウザゲームなので判定は簡易。特典はお礼の宝石30個(1回だけ)とパトロン証・★。

## 4. 注意
- パチンコ風の表現を含むので、BOOTH のガイドライン(年齢制限・表現)を確認。実際のお金を賭ける/換金する要素は無い旨を説明文にも書くと安心。
- 外部サイトの決済リンクとストア版(App Store/Google Play)の課金は混在させない(ストア版を出す時は `BOOTH_URL` を空に)。
