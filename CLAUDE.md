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
| 85-pachifx.js | 予告 `ykLv`, 結果表示 `res`, 電飾 `drawMq`, ミニゲーム `mini` | fx(表示) / feature(ミニゲーム) |
| 86-gekiatsu.js | 激アツ演出パック: 擬似連(NEXT×2〜4)・復活演出・RUSHリザルト(連チャン/獲得G/最高記録 `localStorage['pachi2_gk']`)。当否は変えない(テスト: tests/gekiatsu.js) | fx/feature |
| 87-hitev.js | 大当たり後の分岐 `hitEvent`: 777=押せ!!→前置きアニメ3種(従来/777叩きつけ/カウントダウン)→`jackpot()`、確率`BAL.evP`=押せ!!→全画面ルーレット(押下時`BAL.supP`で超倍率x100/x300/x777)、他=戦闘画面のミニルーレット(非ブロッキング) | feature/fx |
| 88-bannerfx.js / css/30-banner.css | 予告バナー(#bn)の文字強化(黒縁+押し出し/色の本体/上半分ハイライトの3層、熱い文言は虹色) | fx |
| 89-horyu.js | 保留変化: 熱い保留の一部を低い色で表示→待機中に1段ずつ/消化直前に本来の色へ。消化時は必ず元の予告レベル | fx/feature |
| 98-mgfx.js / css/32-minigame.css | ミニゲーム(BONUS STOP/宝箱くじ/コインラッシュ)の描画とパネルの強化。ルールは 85/95 のまま | fx |
| 90-extra.js | 覚醒/黄金玉/ヒットストップ等 | balance |
| 98b-active.js / css/33-active.css | アクティブ要素+演出: 戦闘画面タップ攻撃(コンボ/ラッシュ斬り)、お宝ターゲット(宝袋/流れ星をタップで捕獲)、ボスWARNING/FINISH、SUPERリーチ中のチャンスボタン(当否不変)、10ステージ毎の節目演出(テスト: tests/active.js) | feature/fx |
| 99-main.js | メインループ `update` `loop`、起動処理 | 共有(**起動順に注意**) |

新機能は **自分の番号帯の新規ファイル**として追加するのを推奨(衝突回避): fx=`81-89`の空き/`36` `46`、sound=`76-79`、feature=`91-98`、ui=`26-29`、balance=`21-24`。
他担当のファイルに触る必要がある時は「**1行のフック呼び出し**を足す」程度に留め、最終報告に列挙する。

## CSS/HTMLの追加ルール
- 新しいCSSは `src/css/NN-名前.css`(ビルドが style.css の後ろに連結)。新しいDOMは**JSで生成**(index.html の編集は ui 担当のみ)。

## 状態とお約束
- 全体状態は `G`(gold, stage, hp/mx, lv[], rush, combo, q, sp, roul, jp, aw, fv ...)。ゲーム時間 `T`、`run`(開始後true)。
- 描画用の一時配列: `F`(ダメージ数字) `PT`(パーティクル) `PR`(英雄の弾) `FX`(スキル演出) `balls`(玉)。**必ず上限を守る**(smoke が上限超過を検出する)。
- 既存の**関数名・シグネチャ・DOMのid**は変更/削除しない(追加はOK)。他ファイルから参照されている。
- 描画: 戦闘=`#b`(360x150) 盤面=`#p`(360x400) をCanvas2Dで毎フレーム描画。スプライトは12x12ドットの**左半分を鏡像**する `mk()` 方式(オリジナルのみ。既存IP/キャラの模倣は禁止)。
- 音: `AC`(AudioContext)は**ユーザー操作後に生成**される。`AC` が無い/失敗しても落ちないこと。BGMは先読みスケジューラ(60ms interval)。
- 性能: 60fps維持。iPhoneで重くなる `shadowBlur` の多用、毎フレームの大きな `createLinearGradient` 乱発、巨大配列は避ける。
- **フラッシュは光過敏性への配慮が必要**: 全画面の高頻度点滅(3〜30Hz)は危険。`flash()`の頻度/強度は設定で「強/弱/OFF」に切り替えられるようにし、`prefers-reduced-motion` を尊重する。
- ネットワーク依存禁止(Google Fontの `DotGothic16` のみ例外で、失敗時はmonospaceに落ちる)。画像/音声ファイルは作らず、すべて**コード生成**。
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
