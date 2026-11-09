# パチ戦記 (pachi-senki) — 開発引き継ぎ書

ブラウザ/スマホ(iPhone 15 想定)で遊ぶ「放置バトルパチンコ」。**単一HTMLファイル**として配布する(外部アセット・通信なし)。
玉が釘を転がる → スタート口で3リールのスロットが回る → 大当たりで RUSH(確変) + ルーレット → 英雄が自動で敵を殴る。放置しているだけで「うおー!激アツ!」となるのが目的。

## 作り手(ユーザー)の要望 — 最優先の設計方針
- **ドパミンが出る刺激**が最優先。演出・SE・BGM・画面フラッシュ・数字の気持ちよさに全力を注ぐ。
- 見た目は **2Dドット絵(オリジナル)**。絵文字は使わない。UIもパチンコ筐体/ドット調で細部までこだわる。
- BGM/SEは **8bit(WebAudioで生成)**。「キュインキュイン」等のパチンコ特有音が重要。
- RUSH は長すぎない(約10秒弱)。強化項目は進行度で解放・増加してよい。ミニゲーム歓迎。
- 日本語UI。ゲーム内通貨のみ(実マネーの賭け・換金は作らない)。
- **収益化(ユーザー了承済み)**: 広告(リワードのみ)と「広告削除」の少額課金は `src/js/97-monet.js` の受け口(`window.PachiNative`)経由でのみ。Web版では出さない。強制広告・有料ガチャ(確率課金)は作らない。詳細は MONETIZE.md。

## Unity 版(移行中)
- `unity/PachiSenki`(Unity プロジェクト)と `unity/CoreTests`(dotnet テスト)。ロジックは `Assets/Scripts/Core` の純C#(Web版の移植)、表示は `Assets/Scripts/View`。計画と進み具合は UNITY.md。
- 現在の Unity アプリは **Web版の単一HTMLを WebView で表示**(`Assets/Scripts/Web/WebShell.cs`、HTML は build.js が `Assets/StreamingAssets/` に自動出力 → Web版を変えたらビルドして一緒にコミット)。C# の作り直し版はエディタのメニュー「パチ戦記」で切り替え。
- Web版のロジックを変えたら、Unity版の Core にも同じ変更を入れて `dotnet run --project unity/CoreTests` を通す。

## コマンド
```
node tools/build.js                 # src/ を結合 → dist/pachi-senki.html (OUT=パス で出力先変更可)
node tests/smoke.js [--minutes=15 --seeds=6]   # 長時間シミュで例外/NaN/配列リーク検出 (必ず通すこと)
node tools/sim.js [--minutes=30 --seeds=5 --tap=0|1]  # バランス指標(到達ステージ/大当たり率/RUSH稼働率など)
npm test                            # build + smoke
```
ビルドは `src/js/*.js` を **ファイル名の昇順で連結して1つの <script>** にする。つまり全ファイルが**同一スコープ**(グローバル関数/`let`/`const`共有)。
ロード時に実行される文は、そのファイルより**前**の番号のファイルの宣言にのみ依存してよい(実行時=ループ中の参照は順不同でOK)。

## ファイル構成と担当(所有権)
| ファイル | 内容 | 担当 |
|---|---|---|
| src/index.html, src/style.css | 筐体UI(HTML/CSS) | ui |
| 00-core.js | `$`, canvas, 定数, `fmt`, 状態 `G`, セーブ読込 | 共有(変更は最小限) |
| 10-sprites.js | ドット絵スプライト定義 `mk()`/`SPR` | fx |
| 20-upgrades.js | 強化項目 `UP`, コスト/ステータス式 (`atk` `mul` `rate` `hitP` `critP`), `buy` | balance |
| 23-upgrades2.js / 29b-upicons.js | 強化項目の追加(添字10〜13: タップ攻撃/お宝運/ルーレット招待/超倍率)と `UPX.*`。追加分のセーブ読込はここ(00-core は先頭10個のみ) | balance |
| 25-ui.js | `refresh`(HUD/強化ボタン更新), `flash` `shake` `showMsg` | ui |
| 30-battle.js | 戦闘ロジック(`spawn` `hurt` `kill` `heroAtk` `cutin` `ult`) | balance |
| 35-battle-draw.js | 戦闘画面の描画 `drawB` | fx |
| 40-pachinko.js | 盤面の釘配置・玉の物理・入賞処理 | balance |
| 45-pachinko-draw.js | 盤面の描画 `buildBg` `drawP` | fx |
| 50-slot.js | スロット抽選/回転 `startSpin` `updSpin` | balance |
| 60-roulette.js | ルーレット `startRoul` `updRoul` | balance |
| 70-show.js | 大当たり/ジャックポット演出の流れ `bigHit` `jackpot` `banner` | balance(流れ) / fx(見た目) |
| 75-audio.js | WebAudio: `beep` `tone` `noise` BGM `bgm()` `kyuin` `jara` `fan` | sound |
| 80-skillfx.js | スキルエフェクト `fire` `bolt` `arrow` `drawFX` `aur` `jpShow` | fx |
| 83b-portrait.js | カットイン専用の等身イラスト(3人の胸像を図形で描画→2値化+輪郭でドット化)。`PORT(i)`、失敗時は null で SPR にフォールバック | fx |
| 84-charfx.js | キャラクター演出: 英雄のジャンプ(`heroDY` を 35 の drawHeroes が y に加算=1行フック)、吹き出しセリフ、カットインのバリエーション(従来/3人そろい踏み/ドアップ) | fx |
| 84b-atkfx.js | 攻撃モーションのバリエーション(heroAtk をラップ、剣士/魔法使い/弓使いの特殊モーション。`heroDX` を 35 に1行フック、heroDY を加算ラップ。見た目のみ) | fx |
| 85-pachifx.js | 予告 `ykLv`, 結果表示 `res`, 電飾 `drawMq`, ミニゲーム `mini` | fx(表示) / feature(ミニゲーム) |
| 86-gekiatsu.js | 激アツ演出パック: 擬似連(NEXT×2〜4)・復活演出・RUSHリザルト(連チャン/獲得G/最高記録 `localStorage['pachi2_gk']`)。当否は変えない(テスト: tests/gekiatsu.js) | fx/feature |
| 87-hitev.js | 大当たり後の分岐 `hitEvent`: 777=押せ!!→前置きアニメ3種(従来/777叩きつけ/カウントダウン)→`jackpot()`、確率`BAL.evP`=押せ!!→全画面ルーレット(押下時`BAL.supP`で超倍率x100/x300/x777)、他=戦闘画面のミニルーレット(非ブロッキング) | feature/fx |
| 87b-jpfx.js / css/35-jp.css | JACKPOT 強化: 盤面に「777 揃い!! JACKPOT」パネル(POOL/ステージボーナス/合計のカウントアップ)・虹の光線・コインの雨・キャラ大喜び、G.jp を7秒に延長。777の押せ!!は文字を画面幅に収め虹色に | fx |
| 88-bannerfx.js / css/30-banner.css | 予告バナー(#bn)の文字強化(黒縁+押し出し/色の本体/上半分ハイライトの3層、熱い文言は虹色) | fx |
| 89-horyu.js | 保留変化: 熱い保留の一部を低い色で表示→待機中に1段ずつ/消化直前に本来の色へ。消化時は必ず元の予告レベル | fx/feature |
| 89c-layer.js / css/39-layer.css | 演出の交通整理(見せ方の順番/位置だけ、当否・報酬は不変): バナー(#bn)は全画面パネル/強化シート中は戦闘画面の下寄りへ小さめに(.bup)、熱いバナー直後1秒の普通のバナーは待たせる(待ち行列≤2)。ミニゲームは JACKPOT/押せ!!/全画面ルーレット中なら終わってから開始。カットイン/JACKPOT中はボーナス帯(98e)を引っ込め、数え中のRUSHリザルトは隠す(数え終わりなら下げる)、NEXT はリザルトより上。ミニルーレットは左上角へ移しコンボ/敵名を右へ(`lyNameX()` を 35 の敵名に1行フック)。コンボは吹き出しの上に。ピーク(JACKPOT合計/リザルト確定・ランク/超倍率)に局所の衝撃リング+短いヒットストップ、超倍率はルーレット背後に金の光の筋。ラップの一部は最初の update で入れる(後のファイルより外側)。比較画像 store/design/5,6(テスト: tests/layer.js) | fx |
| 93b-mission.js | デイリーミッション(日付で3つ、達成で宝石2+魔石、全達成で宝石5)。`localStorage['pachi2_mission']` | feature |
| 94-prestige.js / css/38-busyfix.css | 転生(魂)。「転生する!」は演出中でも即転生: `presAbort()` が進行中の演出(回転/カットイン/押せ!!/ルーレット/JACKPOT/ミニゲーム/RUSHリザルト等)を打ち切る。後から走る setTimeout は `presLater(fn,ms)`(転生の世代 `PGEN` が変わっていたら何もしない)で予約すること。38-busyfix.css は押せ!!(#push)をメニュー/設定の下に(テスト: tests/prestige.js) | feature |
| 94b-soul.js | 魂の祭壇: 魂を使って永続強化(開始ステージ/初期G/自動強化/遺物ドロップ率/魂の器)。使っても X.souls(ボーナス)は減らない。`localStorage['pachi2_soul']`。presDo をラップ | feature |
| 96b-zukan.js | モンスター図鑑: 敵14種の撃破数と★(★1つでダメージ+1%)。`localStorage['pachi2_zukan']`。kill と SB.a をラップ | feature |
| 96s-smith.js | リソース: 魔石(撃破で入手)・宝石(JACKPOT/高ランク/図鑑★/お宝)と鍛冶屋(武器強化=キャラ別通常攻撃+12%/Lv・10Lv毎に宝石で限界突破、宝石の護符=3分間 G/ダメージ x2)。`localStorage['pachi2_res']`、転生で残る。戦闘画面右下に所持数 | feature |
| 96t-kuji.js | 魔石くじ(魔石100/10連1000、確率はメニューに明記。ゲーム内通貨のみ) | feature |
| 96r-relic.js | 遺物コレクション: ボス撃破でドロップ(初回確定/以降35%)、10種×Lv5、`localStorage['pachi2_relic']`、転生で残る。SB.a/SB.g・spAdd・bigHit をラップ(テスト: tests/content.js) | feature |
| 92b-daily.js | ログインボーナス(連続日数で魔石/宝石、7日目は宝石5)。`localStorage['pachi2_daily']` | feature |
| 97s-support.js | 開発者を応援(BOOTH 配布向け: BOOTH_URL で商品ページ/BOOST 案内、応援版のサポーターコード入力でパトロン登録=宝石30個+パトロン証+★。ストア版の purchaseTip 受け口も残す)。お礼は見た目のみ。`pachi2_sup`。配布は `python3 tools/booth.py`(BOOTH.md) | feature |
| 97u-app.js | Unity アプリ(WebView)との橋渡し `window.PachiApp`(WebShell.cs が注入): 振動(大当たり/JACKPOT/ボス撃破、設定で ON/OFF、ブラウザは navigator.vibrate がある端末のみ)とセーブの控え(pachi2* を PlayerPrefs へ、消えたら書き戻し)。`pachi2_vib`(テスト: tests/app.js) | feature |
| 97v-ios.js / css/37-ios.css | iPhone(WKWebView/Safari/ホーム画面追加)向け: 筐体のバウンス・ピンチ拡大を touchmove で抑止(スクロール領域/入力欄は除く)、長押しメニュー/選択の抑止、AudioContext の復帰(pageshow/focus/touchstart/click、interrupted の保険)、Google Font の非ブロッキング読込(index.html の `#gf`)後に盤面/ルーレット文字を描き直し、重ね表示の safe-area と dvh。見た目・バランスは不変(テスト: tests/ios.js) | feature |
| 97t-rank.js | ランキング: 自己ベスト/共有/プレイヤー名、オンラインは RANK_API か PachiNative.rank を設定した時だけ(既定は通信しない)。サーバー見本 server/ranking-worker.js、手順 ONLINE.md | feature |
| css/37-fixes.css | 実機ブラウザ検証で見つけたレイアウト修正(トーストをメニューより前面に・長いメニュータブで「閉じる」を下端に固定)(テスト: tests/uifix.js) | ui |
| 98-mgfx.js / css/32-minigame.css | ミニゲーム(BONUS STOP/宝箱くじ/コインラッシュ)の描画とパネルの強化。ルールは 85/95 のまま | fx |
| 90-extra.js | 覚醒/黄金玉/ヒットストップ等 | balance |
| 98b-active.js / css/33-active.css | アクティブ要素+演出: 戦闘画面タップ攻撃(コンボ/ラッシュ斬り)、お宝ターゲット(宝袋/流れ星をタップで捕獲)、ボスWARNING/FINISH、SUPERリーチ中のチャンスボタン(当否不変)、10ステージ毎の節目演出(テスト: tests/active.js) | feature/fx |
| 98c-upgroups.js / css/36-upgroups.css | 強化画面のグループ切り替え(通常強化/鍛冶屋/魂の祭壇)。鍛冶屋と魂の祭壇は三本線メニューから移動。操作後の再描画は grpRefresh() | ui/feature |
| 98d-expedition.js / css/38-expedition.css | 遠征: 行き先3種(30分/2時間/8時間、X.best で解放)へ実時間で送り出し→帰還で魔石/宝石/遺物(15%で大成功=2倍)。帰還でメニューボタンに「!」+トースト。`localStorage['pachi2_exp']`、転生で残る。実績 ex1/ex20 を AC_ に追加(テスト: tests/content2.js) | feature |
| 98e-bonustime.js | ボーナスタイム: プレイ6〜9分ごとに40秒(黄金タイム=G x2/魔石フィーバー=魔石 x3/討伐タイム=ダメージ x2)。毎日12時台・20〜21時台はゴールデンタイム(間隔半分)。SB.a/SB.g・resMs・update・drawB をラップ。当否は不変。`localStorage['pachi2_bt']`、転生で残る | feature |
| 98f-hilo.js | ミニゲーム「ハイ&ロー」(STAGE30〜、95 の MGT ローテーションに追加、#fxg を共用)。最大3回 x2→x4→x8、外れても x1 は受け取れる、自動選択あり。mg2Start/mini/relicUpd をラップ | feature |
| css/38-polish.css | 全画面のデザイン統一(見た目のみ): 設定パネルを金ベゼル+LED+液晶数値の筐体デザインに、見出し下線を虹色に、メニューのタブ字間/入力欄(液晶風)/ログボのマス/ミッションのバー/強化タブの高さ44px/ヒント文字の拡大。比較画像は store/design/ | design |
| 99-main.js | メインループ `update` `loop`、起動処理 | 共有(**起動順に注意**) |

新機能は **自分の番号帯の新規ファイル**として追加するのを推奨(衝突回避): fx=`81-89`の空き/`36` `46`、sound=`76-79`、feature=`91-98`、ui=`26-29`、balance=`21-24`。
他担当のファイルに触る必要がある時は「**1行のフック呼び出し**を足す」程度に留め、最終報告に列挙する。

## CSS/HTMLの追加ルール
- メニュー(#fxm)の見た目は `src/css/34-menu.css`(筐体デザイン: 金ベゼル/LED/立体タブ・ボタン/液晶数値)。91-meta の注入CSSより詳細度を上げて上書きしている。
- 新しいCSSは `src/css/NN-名前.css`(ビルドが style.css の後ろに連結)。新しいDOMは**JSで生成**(index.html の編集は ui 担当のみ)。

## 状態とお約束
- 全体状態は `G`(gold, stage, hp/mx, lv[], rush, combo, q, sp, roul, jp, aw, fv ...)。ゲーム時間 `T`、`run`(開始後true)。
- 描画用の一時配列: `F`(ダメージ数字) `PT`(パーティクル) `PR`(英雄の弾) `FX`(スキル演出) `balls`(玉)。**必ず上限を守る**(smoke が上限超過を検出する)。
- 既存の**関数名・シグネチャ・DOMのid**は変更/削除しない(追加はOK)。他ファイルから参照されている。
- 描画: 戦闘=`#b`(360x150) 盤面=`#p`(360x400) をCanvas2Dで毎フレーム描画。スプライトは12x12ドットの**左半分を鏡像**する `mk()` 方式(オリジナルのみ。既存IP/キャラの模倣は禁止)。
- 音: `AC`(AudioContext)は**ユーザー操作後に生成**される。`AC` が無い/失敗しても落ちないこと。BGMは先読みスケジューラ(60ms interval)。
- 性能: 60fps維持。iPhoneで重くなる `shadowBlur` の多用、毎フレームの大きな `createLinearGradient` 乱発、巨大配列は避ける。
- **フラッシュは光過敏性への配慮が必要**: 全画面の高頻度点滅(3〜30Hz)は危険。`flash()`の頻度/強度は設定で「強/弱/OFF」に切り替えられるようにし、`prefers-reduced-motion` を尊重する。
- ネットワーク依存禁止。フォント `DotGothic16`(SIL OFL)は使う文字だけに絞った `src/font/DotGothic16-subset.woff2` を build.js が埋め込む(Google Fonts は読まない)。**新しい漢字を UI に足したら `python3 tools/font-subset.py <TTF>` で作り直す**(無い文字は等幅フォントで出る)。画像/音声ファイルは作らず、すべて**コード生成**。
  - 例外(作り手の指示): カットイン用キャラクターイラストは作り手提供の画像を `src/img/*.webp` に置き、`tools/build.js` が data URI として `PIMG` に埋め込む(単一HTMLのまま)。切り抜き/縮小は `python3 tools/cutout.py <元画像フォルダ>`。テスト(ハーネス)には入らないので、使う側は `typeof PIMG`/`PIMGI` を確認してコード描画(83b)にフォールバックする。
- セーブは `localStorage['pachi2']`(`{gold,stage,lv}`)。形式を変える時は**旧セーブを壊さず**読めるようにする。

## 検証ルール(全担当共通)
1. 作業後に必ず `npm test`(=build+smoke)が**通る**こと。通らない状態でコミットしない。
2. バランスに影響する変更は `node tools/sim.js` の前後比較を最終報告に載せる。
3. 見た目/音は実機確認できないので、「何をどう変えたか」と「確認できていないこと」を**正直に**報告する。
4. 既存のテストが足りなければ `tests/` に追加してよい(`tools/harness.js` のDOM/Audio/Canvasスタブと仮想時計を使う)。

## 既知の課題(旧計測。バランス調整・光過敏性対応・旧セーブ移行は対応済み。再計測は tools/sim.js)
- 進行が速すぎる: stage 5 が約18秒、stage 20 が約1分、20分で stage 約120。
- `golden`(黄金玉)・`FEVER`の発生率が `1+.3*(Lv-1)` で**無制限に増える**ため、後半は毎秒のように発生。上限/逓減が必要。
- 必殺技(`ult`)が後半 約1.8秒に1回(SPチャージ強化が無制限)。RUSH稼働率 約66%、FEVER稼働率 約25%。「特別感」が薄れる。
- `kyuin()` のフラッシュは約9.5Hz で全画面点滅 → 光過敏性リスク。設定で弱められるようにしたい。
- ルーレットの `DOUBLE UP` や黄金玉などは実機での体感未確認。

## Git運用
- 各担当は専用ブランチ/worktreeで作業し、こまめにコミット。コミットメッセージは日本語可、末尾に:
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`
- 統合は親(Claude)がマージする。**他担当のファイルの整形・リネーム・大規模リファクタは禁止**(衝突の元)。
- `dist/` はコミットしない(生成物)。

## 最終報告のフォーマット(各担当)
1. 変更の要約(プレイヤーから見て何が変わったか)を箇条書き
2. 変更したファイル一覧 / 他担当ファイルに入れたフック一覧
3. `npm test` の結果、(balanceなら)sim の前後比較
4. 確認できていないこと・懸念・次にやるべきこと
