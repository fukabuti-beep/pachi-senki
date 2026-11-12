# パチ戦記 (pachi-senki) — 開発引き継ぎ書

ブラウザ/スマホ(iPhone 15 想定)で遊ぶ「放置バトルパチンコ」。**単一HTMLファイル**として配布する(外部アセット・通信なし)。
玉が釘を転がる → スタート口で3リールのスロットが回る → 大当たりで RUSH(確変) + ルーレット → 英雄が自動で敵を殴る。放置しているだけで「うおー!激アツ!」となるのが目的。

## 作り手(ユーザー)の要望 — 最優先の設計方針
- **ドパミンが出る刺激**が最優先。演出・SE・BGM・画面フラッシュ・数字の気持ちよさに全力を注ぐ。
- 見た目は **2Dドット絵(オリジナル)**。絵文字は使わない。UIもパチンコ筐体/ドット調で細部までこだわる。
- BGM/SEは **8bit(WebAudioで生成)**。「キュインキュイン」等のパチンコ特有音が重要。
- RUSH は長すぎない(約10秒弱)。強化項目は進行度で解放・増加してよい。ミニゲーム歓迎。
- 日本語UI。ゲーム内通貨のみ(実マネーの賭け・換金は作らない)。
- **収益化(ユーザー了承済み)**: 広告(リワードのみ)と「広告削除」の少額課金は `src/js/97-monet.js` の受け口(`window.PachiNative`)経由でのみ。Web版では出さない。強制広告・有料ガチャ(確率課金)は作らない。詳細は docs/MONETIZE.md。

## Unity 版(移行中)
- `unity/PachiSenki`(Unity プロジェクト)と `unity/CoreTests`(dotnet テスト)。ロジックは `Assets/Scripts/Core` の純C#(Web版の移植)、表示は `Assets/Scripts/View`。計画と進み具合は docs/UNITY.md。
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


## リポジトリの構成(ここに無いファイルは tools/audit.js が止める。ファイルを足す時はここに1行、消したらここからも消す)
| 場所 | 中身 |
|---|---|
| CLAUDE.md / package.json / .gitignore / .github/workflows/pages.yml | この引き継ぎ書 / npm のコマンド / Git の除外 / GitHub Pages への自動公開 |
| src/index.html, src/style.css, src/js/, src/css/ | ゲーム本体(上の表) |
| src/font/ | 埋め込みフォント DotGothic16 の文字絞り込み版とライセンス(OFL.txt) |
| src/img/ | 作り手提供のカットイン用イラスト(build.js が埋め込む) |
| src/pwa/ | ホーム画面アイコン(tools/icons.py が作る) |
| tests/ | 自動テスト(全部 npm test に入れる) |
| tools/build.js, tools/harness.js, tools/audiorender.js | ビルド / テスト用の仮想ブラウザ / 音の数値レンダラ(harness が使う) |
| tools/sim.js | バランス計測 |
| tools/deps.js, tools/wraps.snapshot.json, tools/audit.js, tools/audit.baseline.json | 依存と導線のチェック(と、その基準) |
| tools/booth.py, tools/store-shots.js, tools/store-pack.py, tools/promo.js, tools/promo.sh | BOOTH の zip / 商品ページの画像 / 紹介動画 |
| tools/font-subset.py, tools/cutout.py, tools/icons.py, tools/export-sprites.js | フォント絞り込み / イラストの切り抜き / アイコン / Unity 用のドット絵書き出し |
| docs/APP.md, docs/BOOTH.md, docs/MONETIZE.md, docs/ONLINE.md, docs/UNITY.md | 説明書: アプリ化 / BOOTH 配布 / 収益化 / オンラインランキング / Unity 版 |
| docs/STORY.md | 物語・キャラクターの設定資料(性格・一人称・語尾・使わない言葉・色・物語の流れ・伏線と回収)。台詞はここが正 |
| docs/DEPS.md, docs/WRAPS.md | 自動生成(tools/deps.js --update): ファイル同士の依存 / 関数を包む順番 |
| store/booth-page.md, store/privacy.html, store/shots/ | 配布用: 商品ページの文 / プライバシーポリシー / 商品ページの画像 |
| booth/README.txt | BOOTH の zip に入れる説明書の元 |
| server/ranking-worker.js | オンラインランキングのサーバー(Cloudflare Workers) |
| unity/ | Unity 版(移行中) |
生成物(dist/、store/promo/ など)はコミットしない(.gitignore)。作業用の一時ファイルはリポジトリに置かない。

## ファイル構成と担当(所有権)
| ファイル | 内容 | 担当 |
|---|---|---|
| src/index.html, src/style.css | 筐体UI(HTML/CSS) | ui |
| 00-core.js | `$`, canvas, 定数, `fmt`, 状態 `G`, セーブ読込 | 共有(変更は最小限) |
| 10-sprites.js | ドット絵スプライト定義 `mk()`/`SPR` | fx |
| 20-upgrades.js | 強化項目 `UP`, コスト/ステータス式 (`atk` `mul` `rate` `hitP` `critP`), `buy` | balance |
| 23-upgrades2.js / 29b-upicons.js | 強化項目の追加(添字10〜16: タップ攻撃/お宝運/ルーレット招待/超倍率/会心ダメージ/ボス特効(STAGE30, x1.15/Lv=20 の `bossD`)/魂の収穫(STAGE40, 魂+6%/Lv MAX10=`soulHarv`))と `UPX.*`(会心ダメージ `UPX.critD` は 30 の hurt が参照)。追加分のセーブ読込はここ(00-core は先頭10個のみ、旧セーブの不足分は Lv1)。上限の解放 `upCapSet(X.pres)`: 転生1回ごとに 当/運/宝/招/超 の MAX+1(最大+5、UPMAX をその場で書き換え。黄金玉/FEVER/SP/RUSH延長は伸ばさない)。94-prestige が起動時/転生時に呼ぶ(テスト: tests/balance2.js) | balance |
| 25-ui.js | `refresh`(HUD/強化ボタン更新), `flash` `shake` `showMsg` | ui |
| 29c-menugrp.js / css/39-menugrp.css / css/39-hudtext.css | 三本線メニューのグループ分け: FM のタブを上段=大分類(遊ぶ/集める/育てる/ミッション/その他。ミッションは作り手の希望で独立、中のタブが1つのグループは下段を出さない)・下段=中のタブの2段に。タブ名の先頭一致で振り分け(`FMGRP`)、知らないタブ(後から FM.push したもの)は「その他」へ自動。最後に開いたタブとグループごとの最後のタブを `localStorage['pachi2_menu']` に。91-meta の fxMenu 先頭に1行フック(`fmgMenu()`、失敗時は従来表示)。39-hudtext は HUD の小さい文字(STAGE/SP/保留/JACKPOT札)を枠の寸法そのままで拡大・高コントラスト化(テスト: tests/menugrp.js) | ui |
| 29d-resicon.js / css/41-resicon.css | リソースのドット絵アイコン(12x12、オリジナル、文字マップ→SVG/Canvas): `resIcon(kind[,cls])`=HTML文字列 `<i class="ri ri-gold">`、`resAmt(kind,text)`=アイコン+色つき文字、`resIconCanvas(ctx,kind,x,y[,size])`=Canvas に描く。kind は gold/ms/gem/soul/relic/exp(別名 G/魔石/宝石/魂/遺物 も可)、一覧 `RESK`。HUD の金貨・強化シートの価格(em::before)・戦闘画面右下の魔石/宝石(96s resDraw)・各メニューの報酬に使用。説明文を読みやすく(強化ボタンの説明12px、メニューの .fxs 13px)(テスト: tests/altar.js) | ui |
| 30-battle.js | 戦闘ロジック(`spawn` `hurt` `kill` `heroAtk` `cutin` `ult`) | balance |
| 35-battle-draw.js | 戦闘画面の描画 `drawB` | fx |
| 40-pachinko.js | 盤面の釘配置・玉の物理・入賞処理 | balance |
| 45-pachinko-draw.js | 盤面の描画 `buildBg` `drawP` | fx |
| 50-slot.js | スロット抽選/回転 `startSpin` `updSpin` | balance |
| 60-roulette.js | ルーレット `startRoul` `updRoul` | balance |
| 70-show.js | 大当たり/ジャックポット演出の流れ `bigHit` `jackpot` `banner` | balance(流れ) / fx(見た目) |
| 75-audio.js | WebAudio: `beep` `tone` `noise` BGM `bgm()` `kyuin` `jara` `fan` | sound |
| 79b-bonus.js | ボーナスタイム中だけのBGMアレンジ(通常曲をテンポx1.15・全音上・4つ打ち・種類別リード。優先 JACKPOT>緊張>RUSH>FEVER>ボーナス>ボス>通常、bgmState をラップ)と SE `seExp`(遠征)/`seBt`(ボーナスタイム)/`seHl`(ハイ&ロー)。98d/98e/98f から1行で呼ぶ。キュインの耳疲れ対策(差し替え/音量逓減)は 77 の kyuin(テスト: tests/audio2.js) | sound |
| 80-skillfx.js | スキルエフェクト `fire` `bolt` `arrow` `drawFX` `jpShow` | fx |
| 83b-portrait.js | カットイン専用の等身イラスト(3人の胸像を図形で描画→2値化+輪郭でドット化)。`PORT(i)`、失敗時は null で SPR にフォールバック | fx |
| 84-charfx.js | キャラクター演出: 英雄のジャンプ(`heroDY` を 35 の drawHeroes が y に加算=1行フック)、吹き出しセリフ、カットインのバリエーション(従来/3人そろい踏み/ドアップ) | fx |
| 84b-atkfx.js | 攻撃モーションのバリエーション(heroAtk をラップ、剣士/魔法使い/弓使いの特殊モーション。`heroDX` を 35 に1行フック、heroDY を加算ラップ。見た目のみ) | fx |
| 85-pachifx.js | 予告 `ykLv`, 結果表示 `res`, 電飾 `drawMq`, ミニゲーム `mini` | fx(表示) / feature(ミニゲーム) |
| 86-gekiatsu.js | 激アツ演出パック: 擬似連(NEXT×2〜4)・復活演出・RUSHリザルト(連チャン/獲得G/最高記録 `localStorage['pachi2_gk']`)。当否は変えない(テスト: tests/gekiatsu.js) | fx/feature |
| 87-hitev.js | 大当たり後の分岐 `hitEvent`: 777=押せ!!→前置きアニメ3種(従来/777叩きつけ/カウントダウン)→`jackpot()`、確率`BAL.evP`=押せ!!→全画面ルーレット(押下時`BAL.supP`で超倍率x100/x300/x777)、他=戦闘画面のミニルーレット(非ブロッキング) | feature/fx |
| 87b-jpfx.js / css/35-jp.css | JACKPOT 強化: 盤面に「777 揃い!! JACKPOT」パネル(POOL/ステージボーナス/合計のカウントアップ)・虹の光線・コインの雨・キャラ大喜び、G.jp を7秒に延長。777の押せ!!は文字を画面幅に収め虹色に | fx |
| 88-bannerfx.js / css/30-banner.css | 予告バナー(#bn)の文字強化(黒縁+押し出し/色の本体/上半分ハイライトの3層、熱い文言は虹色) | fx |
| 89-horyu.js | 保留変化: 熱い保留の一部を低い色で表示→待機中に1段ずつ/消化直前に本来の色へ。消化時は必ず元の予告レベル | fx/feature |
| 89d-title.js / 79c-titlebgm.js / css/41-title.css | 動くタイトル画面(#ov に JS で飾りを足す。id は不変): 背景キャンバス #ttbg(3px=1ドット)に回る光の筋・釘と風車を転がる銀玉(看板=ロゴ/ボタンに入ると「入賞」で下から出る)・左右の電飾・英雄3人の行進と敵撃破、ロゴは1文字ずつ落下→光が走る、#go は輪と光が脈打つ(ボタン本体は動かさない=自動操作の安定待ちを妨げない)、続きの人には STAGE/最高/転生回数。音: 最初のタップ(#go/#ttsnd 以外)で `ttBgmStart()`=AC を作ってタイトル曲 `SONGS.tt`(D major 136、16小節、bgmState をタイトル中だけ 'tt' にラップ)、右上 #ttsnd でサウンド切替。スタートは 99-main の #go.onclick の1行フック `ttGo()` → `ttBgmGo()`(タイトル曲を切ってジングル約1.3秒→ゲーム曲)+扉が上下に開くトランジション #ttx(reduced-motion はフェードのみ)。99-main は AC を作り直さない(`AC=AC||new`)(テスト: tests/title.js) | fx/sound |
| 89c-layer.js / css/39-layer.css | 演出の交通整理(見せ方の順番/位置だけ、当否・報酬は不変): バナー(#bn)は全画面パネル/強化シート中は戦闘画面の下寄りへ小さめに(.bup)、熱いバナー直後1秒の普通のバナーは待たせる(待ち行列≤2)。ミニゲームは JACKPOT/押せ!!/全画面ルーレット中なら終わってから開始。カットイン/JACKPOT中はボーナス帯(98e)を引っ込め、数え中のRUSHリザルトは隠す(数え終わりなら下げる)、NEXT はリザルトより上。ミニルーレットは左上角へ移しコンボ/敵名を右へ(`lyNameX()` を 35 の敵名に1行フック)。コンボは吹き出しの上に。ピーク(JACKPOT合計/リザルト確定・ランク/超倍率)に局所の衝撃リング+短いヒットストップ、超倍率はルーレット背後に金の光の筋。ラップの一部は最初の update で入れる(後のファイルより外側)(テスト: tests/layer.js) | fx |
| 93b-mission.js | デイリーミッション(日付で3つ、達成で宝石2+魔石、全達成で宝石5)。`localStorage['pachi2_mission']` | feature |
| 94-prestige.js / css/38-busyfix.css | 転生(魂)。操作の置き場所は強化シートの魂の祭壇(98i、メニューの「転生」タブは 98i が外す)。魂 `soulGain(s)` = F(s)-(1-`BAL.soulRep`)xF(min(s,PREC)) x魂の収穫、F(s)=5x(s/30)^2.5: 最高記録を超えた分は満額・記録までは50%(`PREC`=周回開始時の最高記録、`localStorage['pachi2_prec']`。旧セーブは「転生済みで記録より手前なら X.best、他は0」で推定して保存)。転生画面の説明は `presInfo(s)`。転生で X.gps/fgb/fgt もリセット。「転生する!」は演出中でも即転生: `presAbort()` が進行中の演出(回転/カットイン/押せ!!/ルーレット/JACKPOT/ミニゲーム/RUSHリザルト等)を打ち切る。後から走る setTimeout は `presLater(fn,ms)`(転生の世代 `PGEN` が変わっていたら何もしない)で予約すること。38-busyfix.css は押せ!!(#push)をメニュー/設定の下に(テスト: tests/prestige.js) | feature |
| 94b-soul.js | 魂の祭壇: 魂を使って永続強化(開始ステージ/初期G/自動強化/遺物ドロップ率/魂の器/魂の力=ダメージ+8%・魂の富=ゴールド+8%(この2つは上限なし))。コストは `SCOST(b,r)`=ceil(b·r^Lv) の指数で増える(作り手の指摘「魂が余る」対応、上限も 開始30/初期G20/遺物8/器25 に拡大)。開始ステージで再出発した直後は「再出発の勢い」(`SOUL_RUN`: STAGE+15 まで最長3分、1体≒20発になるよう SB.a を補正)で止まらない(テスト: tests/soulrun.js)。使っても X.souls(ボーナス)は減らない。`localStorage['pachi2_soul']`。presDo をラップ | feature |
| 96b-zukan.js | モンスター図鑑: 敵14種の撃破数と★(★1つでダメージ+1%)。`localStorage['pachi2_zukan']`。kill と SB.a をラップ | feature |
| 96s-smith.js | リソース: 魔石(撃破で入手)・宝石(JACKPOT/高ランク/図鑑★/お宝)と鍛冶屋(武器強化=キャラ別通常攻撃+12%/Lv・10Lv毎に宝石で限界突破、宝石の護符=3分間 G/ダメージ x2)。`localStorage['pachi2_res']`、転生で残る。戦闘画面右下に所持数 | feature |
| 96t-kuji.js | 魔石くじ(魔石100/10連1000、確率はメニューに明記。ゲーム内通貨のみ) | feature |
| 96r-relic.js | 遺物コレクション: ボス撃破でドロップ(初回確定/以降35%)、10種×Lv5、`localStorage['pachi2_relic']`、転生で残る。SB.a/SB.g・spAdd・bigHit をラップ(テスト: tests/content.js) | feature |
| 92b-daily.js | ログインボーナス(連続日数で魔石/宝石、7日目は宝石5)。`localStorage['pachi2_daily']` | feature |
| 97s-support.js | 開発者を応援(BOOTH 配布向け: BOOTH_URL で商品ページ/BOOST 案内、応援版のサポーターコード入力でパトロン登録=宝石30個+パトロン証+★。ストア版の purchaseTip 受け口も残す)。お礼は見た目のみ。`pachi2_sup`。配布は `python3 tools/booth.py`(docs/BOOTH.md) | feature |
| 97u-app.js | Unity アプリ(WebView)との橋渡し `window.PachiApp`(WebShell.cs が注入): 振動(大当たり/JACKPOT/ボス撃破、設定で ON/OFF、ブラウザは navigator.vibrate がある端末のみ)とセーブの控え(pachi2* を PlayerPrefs へ、消えたら書き戻し)。`pachi2_vib`(テスト: tests/app.js) | feature |
| 97v-ios.js / css/37-ios.css | iPhone(WKWebView/Safari/ホーム画面追加)向け: 筐体のバウンス・ピンチ拡大を touchmove で抑止(スクロール領域/入力欄は除く)、長押しメニュー/選択の抑止、AudioContext の復帰(pageshow/focus/touchstart/click、interrupted の保険)、Google Font の非ブロッキング読込(index.html の `#gf`)後に盤面/ルーレット文字を描き直し、重ね表示の safe-area と dvh。見た目・バランスは不変(テスト: tests/ios.js) | feature |
| 97t-rank.js | ランキング: 自己ベスト/共有/プレイヤー名、オンラインは `RANK_SERVER`(テストは window.PACHI_RANK_API)か PachiNative.rank を設定した時だけ(既定は通信しない)。通信は8秒で打ち切り(`rkReq`)、送信失敗/連打防止は記録を残して間をあけて再送(最長10分)、自分の順位(`/me`)と上位50件、開いたら自動読み込み(テスト: tests/rankserver.js・tests/rankclient.js)。サーバー見本 server/ranking-worker.js、手順 docs/ONLINE.md | feature |
| css/37-fixes.css | 実機ブラウザ検証で見つけたレイアウト修正(トーストをメニューより前面に・長いメニュータブで「閉じる」を下端に固定)(テスト: tests/uifix.js) | ui |
| 98-mgfx.js / css/32-minigame.css | ミニゲーム(BONUS STOP/宝箱くじ/コインラッシュ)の描画とパネルの強化。ルールは 85/95 のまま | fx |
| 90-extra.js | 覚醒/黄金玉/ヒットストップ等 | balance |
| 98b-active.js / css/33-active.css | アクティブ要素+演出: 戦闘画面タップ攻撃(コンボ/ラッシュ斬り)、お宝ターゲット(宝袋/流れ星をタップで捕獲)、ボスWARNING/FINISH、SUPERリーチ中のチャンスボタン(当否不変)、10ステージ毎の節目演出(テスト: tests/active.js) | feature/fx |
| 98c-upgroups.js / css/36-upgroups.css | 強化画面のグループ切り替え(通常強化/鍛冶屋/魂の祭壇)。鍛冶屋と魂の祭壇は三本線メニューから移動。操作後の再描画は grpRefresh() | ui/feature |
| 98d-expedition.js / css/38-expedition.css | 遠征: 行き先3種(30分/2時間/8時間、X.best で解放)へ実時間で送り出し→帰還で魔石/宝石/遺物(15%で大成功=2倍)。帰還でメニューボタンに「!」+トースト。`localStorage['pachi2_exp']`、転生で残る。実績 ex1/ex20 を AC_ に追加(テスト: tests/content2.js) | feature |
| 98g-party.js / css/39-party.css | 遠征隊の編成: 仲間(96-allies の3人+遠征専用ゴーレム STAGE80/ピクシー STAGE130、mk() の fa3/fa4)を2人まで連れて行く。行き先との相性(◎報酬+25%/大成功+6%・○+10%/+2%)と仲間Lv(遠征の経験値で成長、最大20)で報酬倍率(上限x1.8)・大成功率(上限35%)が上がる。帰還時のお土産(魔石少し/宝石1)、Lv UP 表示。後半の行き先「魔王城」(STAGE100,12h)「天空の神殿」(STAGE150,16h、遺物は未発見/低Lv優先)は 98d の EXD に追加。98d には `typeof pt*` のフック(ptDepart/ptBonus/ptReturn/ptHtml/ptMenu/ptAffTag/ptRelicLow)。帰還時はメニュー内の「遊ぶ」ボタンと「遠征」タブにも「!」(29c の1行フック `fmgMark`)。仲間タブに遠征での Lv を追記。実績 pt1/pt10/pt20/ex5。`localStorage['pachi2_party']`、転生で残る(テスト: tests/party.js) | feature |
| 98e-bonustime.js | ボーナスタイム: プレイ6〜9分ごとに40秒(黄金タイム=G x2/魔石フィーバー=魔石 x3/討伐タイム=ダメージ x2)。毎日12時台・20〜21時台はゴールデンタイム(間隔半分)。SB.a/SB.g・resMs・update・drawB をラップ。当否は不変。`localStorage['pachi2_bt']`、転生で残る | feature |
| 98f-hilo.js | ミニゲーム「ハイ&ロー」(STAGE30〜、95 の MGT ローテーションに追加、#fxg を共用)。最大3回 x2→x4→x8、外れても x1 は受け取れる、自動選択あり。mg2Start/mini/relicUpd をラップ | feature |
| 98h-area.js | エリア(舞台)の変化: 25ステージごとに8エリア(草原→砂漠→氷原→火山→魔界→天空→宙域→虚空、201〜はII周目)。36 の drawBgB を置き換えてエリア別の背景(空/夕暮れ空/遠景/地面をエリアごとに1回だけオフスクリーン描画、エリア内は5ステージごとに夕暮れへ)+動く小物、到達/起動/転生時に「AREA n 名前」のタイトル帯(到達時は FINISH!! の後、FINISH 中は前エリアの背景)。敵: 草原以外は雑魚/ボス b0〜b3 をエリア色にパレット差し替え(図鑑は同種扱い=キーは enSpr のまま)、STAGE 25の倍数は新しいエリアの主 b4〜b11(図鑑に BOSS として追加、★基準 1/10/50、保存済みの撃破数はここで読む)。ボス: HP50%未満で「怒り状態!!」(赤オーラ)/エリアの主は「形態変化!!」(第2形態の色)、エリアの主は常にオーラ・撃破で光の柱+多重リング+AREA CLEAR!!。見た目のみ(HP/報酬/当否は不変)。フック無し: enSpr/drawEnemy(描画中だけ SPR を差し替え)/drawHP(エリアの主の名前)/deathFx/kill/update/drawB をラップ(テスト: tests/area.js) | feature/fx |
| 98s-story.js | 軽いストーリー(設定は docs/STORY.md、口調と骨組みは tests/story.js が確かめる): 剣士ホムラ/魔法使いシズク/弓使いコハク(オリジナル)が虚無の王(魔王)ニヒラを目指す旅。エリア到達(a0〜a7)/エリアの主撃破(b0〜b7)/初JACKPOT/初転生 で2〜4行の会話を戦闘画面の下寄りに重ねる(顔は PIMGI→PORT→SPR、敵は SPR)。タップで文字送り→次の行、放置で1行約3秒、「とばす」。演出中(lyBig/lyBusyB/#rl #mg #fxg/MG/エリアのタイトル帯・大爆発/メニュー)は隠して停止。メニュー「物語」(FMGRP の「集める」に実行時に追加)で読み返し/再生。進行は `localStorage['pachi2_tut']`(98t と共用: s/g/skip/off/old)、キーが無い旧セーブは通過済みシーンを既読に。kill/update をラップ、Math.random 不使用(テスト: tests/tutorial.js) | feature |
| 98t-tutorial.js | チュートリアル: 序盤ガイド(玉→スロット→英雄→タップ→強化→RUSH)を対象(#pw/#slot/#bw/#hd/#ubt)のゆっくり光る枠(約0.7Hz、reduced-motion で停止)+英雄の吹き出しで順に。数秒で自動で消える/タップで次へ/スキップ。新機能ガイド(SP/ボス/☰/遠征/鍛冶屋/転生/魂の祭壇)は条件を満たした時に1回だけ。旧セーブは序盤+満たし済みを既読。物語シーン中は待つ。メニュー「遊び方」(その他)で一覧/もう一度/新機能ガイド ON・OFF。update をラップ | feature |
| 98i-gemshop.js / css/39-gemshop.css | 宝石ショップ(メニュー「育てる」。29c の FMGRP へ実行時に '宝石' を追加): ブースト(魔石の加護=5分 魔石x2 宝石3・幸運の香=3分 大当たり約1.5倍 宝石4(hitRoll ラップ、RUSH/天井は不変)・重ねがけ上限あり、ゲーム時間で減る/ボーナスタイム招来 宝石3/遠征の早馬 -1時間 宝石2・今すぐ 30分ごと宝石1)、勲章(永続・逓増コスト: 戦神 ダメージ+4%/Lv・黄金 G+4%/Lv 各 10+5l MAX10、魔石 +10%/Lv 8+4l MAX10、遠征の羅針盤 -6%/Lv 12+6l MAX5、祭りの太鼓 ボーナスタイム+4秒/Lv 10+5l MAX5)、便利(ミッション入れ替え 1日1回 宝石3、自動強化ターボ=祭壇の自動強化を4倍速 宝石20)、見た目(玉の色/図柄の色/筐体テーマ body.gscN/称号=戦闘画面左下。性能不変)。`localStorage['pachi2_gemshop']`、すべて転生で残る。SB.a/SB.g・resMs・hitRoll・expGo・pxText・drawB・update をラップ。sim は `--gs=1` で勲章を自動購入(テスト: tests/gemshop.js) | feature |
| 98j-expbtn.js / css/41-expbtn.css | 遠征ボタン(作り手の指摘「遠征の導線が無い」): 操作パネル #ctl の設定ボタンの前に #expb(旗アイコン)を JS で追加し、押すとメニューの遠征タブを直接開く(`expBtnOpen`)。右上の札で状態表示: 出発できる=GO/遠征中=残り時間(25m・3h)/帰還=!(ゆっくり脈動、reduced-motion で停止)。98d の EXP/expOpen/expDone/expLeft を読むだけ。チュートリアルの遠征ガイドもこのボタンを指す(テスト: tests/expbtn.js) | feature |
| 98k-upmove.js | リソース消費系は強化ボタンへ集約(作り手の指摘): 強化画面のグループに「宝石屋」(98i-gemshop の gsMenu)と「くじ」(96t)を移し、メニューから外す。メニューの「育成」タブ(98i-altar の案内)も外す(→「育てる」グループは空になり非表示、大分類は4つで 2x2 = 29c の mgC4)。gsRe をラップして購入後に grpRefresh。`upOpen(name)` で強化画面のグループを名前で開く(テスト: tests/upmove.js) | ui |
| 87d-roulquick.js / css/41-roulquick.css | ルーレットの画面占有を短く(作り手の指摘): updRoul に渡す時間を早める(回転 4.6→約3.1秒、結果 1.8→約1.2秒、超倍率の溜め 4.4→約3.4秒、合計 約6.4→4.4秒)、ルーレットの枠(.rb)をタップで早送り(`RQ.ff`、約1秒で閉じる)、暗幕を薄く(.45)。当否・倍率・報酬は 60 のまま(テスト: tests/upmove.js) | feature/fx |
| 89h-pushhype.js / css/41-pushhype.css | 押せ!!ボタンを脳汁仕様に(作り手の指摘「インパクトが薄い」): 熱さ `heat` 1=赤/2=金/3=虹(777は必ず虹)。ルーレット行きは 87-hitev が超倍率を先に抽選(確率不変)して 当たり=虹60%/金40%・外れ=赤80%/金20% を渡す(信頼度)。登場は上から叩きつけ0.35秒+熱さ色のオーラ(約1.2Hz、ボタン周りのみ)、押下で光の放射+文字(GO!!/激アツ!!/確定!!)、SE を厚く(`phSnd`: 低音のドン+打撃ノイズ+熱さ別の和音、虹は上昇キュイーン+ベル)。全画面の点滅なし、reduced-motion で停止(テスト: tests/pushhype.js) | fx/sound |
| 97w-save.js / css/41-save.css | セーブデータの整備: 引き継ぎコード `svCode()`=「PACHI2:<base64(UTF-8 JSON)>:<チェック値>」(localStorage の pachi2* を全部)、`svParse` で検証→ `svApply` で丸ごと差し替え+再読込(差し替え前は自動バックアップへ)。コピー/ファイルに保存/ファイルから読み込み。自動バックアップ: プレイ10分ごと+裏に回った時(最短2分)に3世代を `localStorage['pbak_pachi2']`(pachi2 で始めない=引き継ぎ/Unity控えに混ざらない)、一覧から戻せる。起動時に pachi2 が壊れていたら `SV.broken` で自動バックアップを止め、復元を案内。メニュー「セーブ」(その他)(テスト: tests/save.js) | feature |
| css/38-polish.css | 全画面のデザイン統一(見た目のみ): 設定パネルを金ベゼル+LED+液晶数値の筐体デザインに、見出し下線を虹色に、メニューのタブ字間/入力欄(液晶風)/ログボのマス/ミッションのバー/強化タブの高さ44px/ヒント文字の拡大 | design |
| 98i-altar.js / css/41-altar.css | 魂の祭壇に転生を統合: 強化シートの「魂の祭壇」を「① 転生で魂を集める(presAsk/presInfo/presGainShow を呼ぶだけ)→ ② 魂で永続強化(94b の SOULD/soulBuy)」の1画面に(`altarHtml`)。三本線メニューの「転生」タブは外し、「育てる」には案内の「育成」タブ(通常強化/鍛冶屋/魂の祭壇を `altOpen(g)` で開く)。presAsk の「やめる」はメニューを開かず閉じる、転生後は grpRefresh(テスト: tests/altar.js) | ui |
| 01-edition.js / 98l-edition.js / css/41-edition.css | 体験版/完全版: `EDITION=free node tools/build.js` → dist/pachi-senki-free.html(`window.PACHI_EDITION='free'` を先頭に、**1行目に `@full` があるファイルは除外**)。既定ビルド(Pages/Unity/テスト)は完全版。`EDITION`/`IS_FULL`/`FREE_MAX`(=175)。98l: 体験版は kill をラップして STAGE 175 で止め「完全版のご案内」(`edFullHtml`、一覧 `FULL_FEATS`=完全版コンテンツを足したら追記)、メニュー「完全版」(その他)、タイトルに札 #edb。BOOTH zip は tools/booth.py が体験版/完全版の2つを作る(docs/BOOTH.md)(テスト: tests/edition.js) | feature |
| 98z-tower.js / css/41-tower.css | **@full(完全版のみ)** 無限の塔: メニュー「遊ぶ」→「無限の塔」(X.best>=30)。今の敵をしまって塔のボスと連続バトル(いつものダメージがそのまま当たる)、1階20秒(`TWT`)、撃破で次の階・時間切れで結果画面→元の敵に戻る(ステージは進まない)。HP `twHp(f)`=STAGE 2f のボスの1.5倍(到達は だいたい (最高STAGE-8)/2 階)。記録を越えた階だけ 魔石4f・5階ごと宝石1(10階ごと3)・10階ごとに塔の加護 ダメージ+3%(SB.a)。見た目は描画中だけ G.stage を `twVs(f)` に差し替えて drawEnemy/drawHP/drawBgB(5階ごとエリアの主)。kill/spawn を一番外側でラップ(挑戦中の kill は塔だけ、spawn=転生などで打ち切り)。実績 tw10/tw30/tw60。`localStorage['pachi2_tower']`、転生で残る(テスト: tests/tower.js) | feature |
| 94c-herohp.js / 98m-heroup.js / css/41-heroup.css | 英雄の体力と敵の攻撃(体験版にも入る。作り手の方針「序盤は順当、中盤以降はリソースを使って育てないと詰まる」「ボス戦だけ厳しく」): 3人それぞれ体力(`HB`x役割 1.4/0.8/1.0)、敵が一定間隔で攻撃(剣士が2倍狙われる)。敵の強さ `hvThr(s)`=0.25x1.08^(s-15)(STAGE 30 までは さらに 30%→100%)。雑魚戦は倒れても6秒で起き上がる(全滅なし)。ボス戦(STAGE 15〜のボスと無限の塔)は倒れたら戦闘終了まで起きず攻撃しない、3人とも倒れると全滅→**1つ前のステージへ**+リベンジ(攻撃+10%/回 最大3、そのボスを倒すまで)、塔は挑戦終了。STAGE 30 からボスに装甲(hurt ÷`hvBossK` 50で3/80で6/最大8、体力とゴールドは不変)=ボス戦が長くなる。元気ボーナス(体力が多いほど通常攻撃 最大+30%、heroAtk の m に掛ける)。英雄ごとの強化 `HUP`(体力 x1.18/Lv・防御 ÷1.12/Lv は上限なし コスト伸び1.9、回復 +20%/Lv MAX15、解放STAGE10/15/20、ゴールド、転生でリセット、`localStorage['pachi2_hero']`)は強化画面の「英雄」グループ(98m、通常強化の次。タブ6つは 3x2、次のボスで持つ秒数 `hvSurv` を表示)。魂の祭壇の自動強化と sim は `hupNeed()`(持つ秒数が `HVSAFE`=40秒未満の英雄がいる時だけ買う)。spawn/heroAtk/hurt/drawHeroes/drawB/presDo/SB.a をラップ(テスト: tests/herohp.js) | feature |
| 99-main.js | メインループ `update` `loop`、起動処理 | 共有(**起動順に注意**) |


### 表に無かった既存ファイル(2026-11 の点検で追記。担当と中身の要約)
| ファイル | 内容 | 担当 |
|---|---|---|
| 21-pacing.js | ハマり救済(天井 `DRY`)と SP・必殺技の間隔制御 | balance |
| 22-migrate.js | 旧バランスのセーブ補正(v<2 の伸びすぎた stage を倒せる所まで戻す) | balance |
| 26-dots.js | ドット絵ツールキット `UX`(リール図柄/強化アイコン/ハンドル)と UI 設定 `UX.S` | ui |
| 27-cabinet.js | 筐体まわり(画面フィット/強化シート/ハンドル/電飾/タイトル) | ui |
| 28-settings.js | 設定パネル(音量/フラッシュ強度/ミュート/データリセット) | ui |
| 29-push.js | 「押せ!!」ボタン `pushPrompt`(大当たり/DOUBLE UP の押下待ち) | ui/fx |
| 36-battle-bg.js | 戦闘画面の背景 `drawBgB`(98h が置き換え)・状態別オーバーレイ・枠 | fx |
| 46-board-fx.js | 盤面の動的演出(オーバーレイ/電飾/センター窓/保留ランプ/玉の軌跡/入賞口の発光) | fx |
| 76-bgm.js / 79-songs.js | BGM エンジン(先読みスケジューラ・`SONGS`・`bgmState`)と追加曲 | sound |
| 77-se.js / 78-sehooks.js / 79-se2.js / 79c-hypese.js | 効果音ライブラリ(`sOK` `sNow` `kyuin` 等)と、他ファイルの関数を包んで SE を足すフック、激アツ演出用 SE `seHy` | sound |
| 81-pxfont.js | ドットフォント `pxText`(5x7)とダメージ数字/コンボ表示 | fx |
| 82-hitfx.js | 被弾スパーク/撃破の爆散/コイン/衝撃波リング `ringFx` `deathFx`(hurt/kill をラップ) | fx |
| 83-cutin.js | カットインの描画 `drawCut` | fx |
| 89d-blackout.js / 89e-bigslot.js / 89f-ultjp.js / 89g-btnfx.js / css/39-btnfx.css | 激アツ演出: 暗転予告と共通オーバーレイ #hyc / スロット破砕→巨大スロット / JACKPOT の超必殺技 / ボタンの動き | fx |
| 92-offline.js | おかえりボーナス(オフライン中のゴールド) | feature |
| 93-achieve.js | 実績(`AC_`、統計 X.st) | feature |
| 95-minigames.js | ミニゲームのローテーション(BONUS STOP/宝箱くじ/コインラッシュ、`mini` をラップ) | feature |
| 97-app.js | PWA(常時点灯・ホーム画面に追加の案内) | feature |
| css/20-ui.css / css/31-flash.css / css/40-qafix.css | 画面サイズ対応・タップ領域 / 動きを減らす端末のフラッシュ / 組み合わせで見つかった表示の重なり修正 | ui |

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
- ネットワーク依存禁止(例外: オンラインランキング 97t のみ。接続先 `RANK_SERVER`=https://pachi-rank.okumosiroiro.workers.dev(作り手の Cloudflare Workers+KV、変数名 RANK)。名前を決めた人だけ自己ベストを送信、ランキング画面を開いた時だけ一覧を取得。通信できなくてもゲームは普通に動くこと。テストは harness が PACHI_RANK_API='' で通信しない)。フォント `DotGothic16`(SIL OFL)は使う文字だけに絞った `src/font/DotGothic16-subset.woff2` を build.js が埋め込む(Google Fonts は読まない)。**新しい漢字を UI に足したら `python3 tools/font-subset.py <TTF>` で作り直す**(無い文字は等幅フォントで出る)。画像/音声ファイルは作らず、すべて**コード生成**。
  - 例外(作り手の指示): カットイン用キャラクターイラストは作り手提供の画像を `src/img/*.webp` に置き、`tools/build.js` が data URI として `PIMG` に埋め込む(単一HTMLのまま)。切り抜き/縮小は `python3 tools/cutout.py <元画像フォルダ>`。テスト(ハーネス)には入らないので、使う側は `typeof PIMG`/`PIMGI` を確認してコード描画(83b)にフォールバックする。
- セーブは `localStorage['pachi2']`(`{gold,stage,lv}`)。形式を変える時は**旧セーブを壊さず**読めるようにする。

## 検証ルール(全担当共通)
1. 作業後に必ず `npm test`(=build+smoke)が**通る**こと。通らない状態でコミットしない。
2. バランスに影響する変更は `node tools/sim.js` の前後比較を最終報告に載せる。
3. 見た目/音は実機確認できないので、「何をどう変えたか」と「確認できていないこと」を**正直に**報告する。
4. 既存のテストが足りなければ `tests/` に追加してよい(`tools/harness.js` のDOM/Audio/Canvasスタブと仮想時計を使う。`createGame({globals:{PACHI_EDITION:'free'}})` で体験版=@full を外した状態)。
5. **依存関係のチェック `node tools/deps.js`(npm test に入っている)**:
   - 完全版だけのファイル(1行目 `@full`)で宣言した名前を、他のファイルで使う行には必ず `typeof 名前` の確認を入れる(体験版で ReferenceError になる)。tests/edition-smoke.js が体験版で10分動かして確かめる。
   - 同じ関数(kill/spawn/hurt/drawB/update/SB.a など)を包む順番を tools/wraps.snapshot.json と比べる。新しくラップした・ファイル番号を変えた時は docs/WRAPS.md の前後を見て、意図どおりなら `node tools/deps.js --update` で記録し直してコミット(レビューで差分が見える)。挙動を止める/横取りするラップ(例: 98z の kill)は一番外側に置く。
   - ロード時に別ファイルの値を使う文は、そのファイルより前の番号にしか依存しない(例: SB は 94-prestige で作られるので、SB.a を包むのは 94 より後)。


## 保守・デバッグの手順(毎回必ず。作り手はコードを読まないので、確認は機械と手順で担保する)
作業の前
1. 触るファイルの依存を docs/DEPS.md(使っている他ファイルの名前)と docs/WRAPS.md(同じ関数を包む順番)で確認する。
2. 既存の仕組みで済むなら新しい依存・新しいラップ・新しいファイルを作らない(同じ役目のものが既にないか先に探す)。使い終わった物(関数・ファイル・一度きりのスクリプト)は残さず消す(Git に履歴が残るので戻せる)。作業用の一時ファイルはリポジトリの外(scratchpad)に置く。

作業の後(`npm test` に全部入っている。どれか1つでも NG ならコミットしない)
3. `node tools/deps.js` … 完全版だけの名前を typeof なしで使っていないか / ラップの並びが変わっていないか。
4. `node tools/audit.js` … 散らかり(全ファイルが「リポジトリの構成」に載っているか・一時ファイルの置き忘れ)と導線の入れ忘れ: ファイルが CLAUDE.md にあるか・テストが npm test にあるか・セーブを書いて読んでいるか・呼ばれない関数・存在しない画面部品・@full の案内(`// FULL_FEAT:`)・全メニュー/強化画面が開けるか・タブの置き場所(FMGRP)・1分動かして例外0(完全版/体験版の両方)。
5. 基準(tools/wraps.snapshot.json / tools/audit.baseline.json / docs/*.md)を `--update` で書き換えたら、**何が増えた/減ったかを最終報告に書く**。増やすのは意図した時だけ。
6. テストが落ちたら、まず「ゲームの不具合」か「テストの前提が古い」かを切り分ける。前のコミットの版(git worktree)で同じテストを動かして比べ、根拠なしにテストを緩めない。
7. バランスに触れたら sim を前後で3シード以上。新しい育成要素は「買う/買わない」の比較も取る(買わない方が得なら設計を見直す)。
8. 画面に触れたら Playwright で撮って目で確認(文字の重なり・隠れ・はみ出し)。音と手触りは実機で未確認と報告する。
9. 台詞を足す・直す時は docs/STORY.md(性格・口調・伏線)に合わせ、tests/story.js を通す。前に言っていないことを前提にした台詞を書かない。物語の筋や伏線を足したら資料の表も更新する。
10. 新しい機能には、つながっていることを確かめるテストを足す: 入口(メニュー/ボタン/強化画面)から開ける・セーブして読み直せる・転生/体験版でも壊れない。

最終報告に必ず書くこと: プレイヤーから見た変化 / 変えたファイル / 新しく増えた依存とラップ(docs の差分) / 消した物 / 基準の増減 / テストと sim の結果 / 確認できていないこと。

## 既知の課題(2026-11 balance 第2弾で再計測。`node tools/sim.js`、転生込みは `--pres=auto|recN --meta=1`、並列は `--seed0=K`。ボーナスタイム(98e)・遠征(98d)・ハイ&ロー(98f)込み、遠征隊(98g)は未計測)
- 放置+自動購入で 30分 stage 約42、2時間 約93(転生なし)。転生(auto)込みだと 2時間で最高 約140〜150、2.5時間で 約175〜185。
- 黄金玉/FEVER/必殺/RUSH は上限あり: FEVER稼働 約10%、RUSH稼働 約43%。必殺は SP を絞って通常時の間隔 中央値 約16〜22秒(10〜90%: 14〜37秒。終盤は仲間の魔導士の SP+10 もあり 14〜20秒に寄る)。
- 転生: 記録超えは満額・記録までは50%。sim 120分の魂/分: STAGE50 周回 3.4 / 記録+10 で転生 11〜19 / auto(240秒止まったら転生)3.5(第1弾の式+X.gps修正: STAGE50 周回 5.0 / 記録+10 25 / auto 0.4〜1.0)。
- 開始ステージ(魂の祭壇)が高いと転生直後に強化 Lv1 のまま止まることがある(sim rec10 で STAGE51 から4分進まない例が1回)。祭壇側で開始ステージに見合う初期ゴールドを出す等の余地。
- 上限付き強化は 30分でほぼ MAX(魂の収穫もすぐ MAX)。以降は 攻/金/撃/極/討 の無限強化 + 転生で上限が伸びる5種。「迷う」幅はまだ小さい。
- `kyuin()` のフラッシュ・ルーレットの `DOUBLE UP`・黄金玉などは実機での体感未確認。

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
