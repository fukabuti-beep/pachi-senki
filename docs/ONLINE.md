# オンライン機能(ランキング / 応援)の設定

ゲーム本体は**設定しない限り一切通信しません**(既定はオフ)。設定すると有効になります。

## 1. オンラインランキング

**現在の状態(2026-11-12)**: 作り手の Cloudflare に `pachi-rank` Worker + KV(`RANK`)を公開済み。接続先 `https://pachi-rank.okumosiroiro.workers.dev` を `src/js/97t-rank.js` の `RANK_SERVER` に設定済み。プライバシーポリシー(store/privacy.html)もランキング用の記述に更新済み。サーバーのプログラムを変えたら、Cloudflare の Worker 画面で中身を貼り替えて Deploy。

ゲーム内メニュー「ランキング」には、いつでも**自己ベスト**(最高到達ステージ / 最高連チャン / 最高RUSHスコア / 大当たり累計)と「記録を共有」が出ます。
オンライン(全国順位)にするには、どちらかを設定します。

### A. 自前サーバー(無料で始められる: Cloudflare Workers + KV)
1. Cloudflare のアカウントを作る(無料プランで可)。
2. Workers & Pages → Create → Worker を作成し、`server/ranking-worker.js` の中身を貼り付けて Deploy。
3. Storage → KV で名前空間(例 `pachi-rank`)を作り、Worker の Settings → Bindings で **変数名 `RANK`** として紐付ける。
4. 表示された Worker のURL(例 `https://pachi-rank.xxxx.workers.dev`)を `src/js/97t-rank.js` の `RANK_SERVER` に設定 → build/コミット。
5. ゲームでプレイヤー名を決めると、自己ベスト更新時に自動送信(最短60秒おき)。「ランキング」タブのボタンで上位20位を表示。

注意: ブラウザゲームのスコアは改ざんできるので、景品などは絶対に付けないこと。異常な記録は KV から手で消す運用。
- サーバー見本の守り: 値の上限・プレイヤーごと60秒の連打防止・「初めて送ってからの経過時間に対してありえない値」を弾く(STAGE は 80+120×経過時間 まで等)。`GET /me` で自分の順位。
- 動作確認: `node tests/rankserver.js`(サーバー単体)・`node tests/rankclient.js`(ゲームとつないだ状態)。
- **オンラインを有効にしたら store/privacy.html を更新すること**(プレイヤー名・記録・ランダムなIDを送るため。今は「通信しない」と書いてある)。

### B. ストア版(Game Center / Google Play Games)
ネイティブ側が `window.PachiNative.rank = { submit(board, score, name): Promise<boolean>, top(board): Promise<{name, score}[]> }` を注入すると、それを使います(`RANK_API` より優先)。ボード名: `stage` `chain` `score` `hits`。

## 2. 開発者を応援する
BOOTH 配布向けに作り直した。手順は BOOTH.md。
- Web/配布版: `src/js/97s-support.js` の `BOOTH_URL` に商品ページURLを設定 → 「応援」タブに BOOTH へのボタン(BOOST の案内付き)。
- 応援版に同梱する「サポーターコード」をゲームで入力するとパトロン登録(宝石30個・パトロン証・タイトルの★)。
- ストア版の課金(`PachiNative.iap.purchaseTip`)の受け口は将来用に残してある。
