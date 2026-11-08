# Unity 版への移行

Web版(src/ の単一HTML)を正として、Unity 版を段階的に作る。

**方針(作り手の選択: 両方)**: まず Web版をそのまま Unity アプリの WebView で動かして**完全一致**させ(`Assets/Scripts/Web/WebShell.cs`)、Unity で作り直した方が良くなる部分だけを少しずつ置き換える。
- HTML は `node tools/build.js` が `Assets/StreamingAssets/pachi-senki.html` に自動で書き出す(Web版を変えたらビルドしてコミット)。
- WebView は unity-webview(`Packages/net.gree.unity-webview`、埋め込みパッケージ、zlib ライセンス)。iOS/Android はネイティブの WebView、Windows エディタは WebView2(Windows 10/11 標準)で表示。
- エディタのメニュー「パチ戦記」で「Web版で起動(完全版)」/「Unity版で起動(作り直し中)」を切り替え(EditorPrefs `pachi_mode`)。ビルドしたアプリは常に Web版。
- Web版 → Unity: `Unity.call('vib:big|jp|boss')` で Handheld.Vibrate、`Unity.call('save:{json}')` でセーブの控えを PlayerPrefs[`pachi_web_backup`] に保存。読み込み時に `window.PachiApp` を注入し、控えがあれば `appRestore()` に渡す(Web 側にセーブが無い時だけ書き戻して再読込)。Web 側は src/js/97u-app.js。Android 以外は WebViewObject.CallFromJS が URL デコードするため、WebShell が読み込み時に Unity.call を encodeURIComponent で包む(JSON の + や % が壊れないように)。
- ストア用のプレイヤー設定(アプリ名 パチ戦記 / ID com.fukabuchi.pachisenki / 縦画面固定 / アイコン Assets/Branding/icon.png / 起動画面の背景色 / iOS 自動署名 / ビルド用の空シーン Assets/Scenes/Main.unity を作って Scenes In Build に登録)は `Assets/Scripts/Editor/StoreSetup.cs` が Unity 起動時に自動で当てる(ProjectSettings.asset は作り手の PC で書き換わるため Git では触らない)。Android の戻るボタンはアプリを終了せずホームへ。
- 広告/課金は Web版の `window.PachiNative`(97-monet)を WebShell.OnJs 経由で実装する予定(SDK を入れる時。それまで PachiNative は注入しない=広告 UI は出ない)。**ゲームロジックは UnityEngine に依存しない純粋な C#** にして、Unity なしでもテストできるようにしている。

## 構成
```
unity/
  PachiSenki/                 Unity プロジェクト(Unity Hub の「追加 → ディスクから」でこのフォルダを開く)
    Assets/Scripts/Core/      ゲームロジック(純C#・asmdef: noEngineReferences)
      Balance.cs              BAL定数・強化データ(20-upgrades/23-upgrades2)
      State.cs                乱数(mulberry32)・状態G・セーブ(Web版と同じ {v,gold,stage,lv})
      PachiGame.cs            本体: 盤面/玉の物理・抽選と天井・スロット・大当たり/RUSH・ルーレット/超倍率/JACKPOT・戦闘・必殺技・FEVER・黄金玉・覚醒
    Assets/Scripts/View/      Unity 側(表示・入力・セーブ)
      GameRunner.cs           どのシーンで再生しても自動起動。コアを毎フレーム実行、スプライト描画+文字(IMGUI)、PlayerPrefs にセーブ
      SpriteBank.cs           SpriteData からドット絵の Sprite を生成(Point フィルタ)、円・単色板も生成
      Fx.cs                   フラッシュ(設定 強/弱/OFF)・揺れ・パーティクル
      Audio8.cs               8bit の SE/BGM をコードで合成
      Presentation.cs         予告/リーチ・カットイン・ルーレット・押せ!!・JACKPOT・バナー
    Assets/Resources/Portraits/  カットイン用の提供イラスト(PNG。Web版 src/img の webp から変換)
      SpriteData.cs           Web版のドット絵データ(自動生成: node tools/export-sprites.js。手で編集しない)
    Packages/manifest.json    使うパッケージ(2D Pixel Perfect / TextMeshPro / UGUI)
  CoreTests/                  Unity なしでコアをテスト(dotnet)
```

## 動かし方
- テスト(Unity 不要): `dotnet run --project unity/CoreTests`(.NET 8 SDK)。乱数がWeb版と一致すること、15分×3シードで例外/NaN/リークなし、決定的、セーブ互換、天井、30分の到達ステージ(現状 平均 37.8 = Web版本体と同等)を確認。
- Unity: Unity Hub で `unity/PachiSenki` を開く(推奨 Unity 6 LTS = 6000.0.85f2)→ 空のシーンのまま再生 → 仮表示で盤面・玉・スロット・戦闘・強化が動く。

## 自分のPCへの導入(Windows / Mac)
1. https://unity.com/download から **Unity Hub** をダウンロードしてインストール。
2. Unity Hub を起動 → Unity ID でサインイン(無ければ作成)→ 設定(歯車)→ ライセンス → 「追加」→ **Personal(無料)ライセンス**を取得。
3. 「インストール」→「エディターをインストール」→ **Unity 6(6000.0.x LTS)** を選ぶ。モジュールは後からでも追加できる(BOOTH で配るなら Windows Build Support / Mac Build Support、ブラウザ版なら WebGL Build Support)。
4. プロジェクトを手元に用意: 既存のフォルダなら `git pull`、無ければ GitHub の Code → Download ZIP で展開。
5. Unity Hub →「プロジェクト」→「追加」→「ディスクから追加」→ `pachi-senki/unity/PachiSenki` を選ぶ(バージョンを聞かれたら入れた Unity 6 を選ぶ)。初回は読み込みに数分かかる。
6. 開いたら上の再生ボタン(▶)を押す → ゲームが自動で起動(盤面・玉・スロット・戦闘・強化ボタンの仮表示)。Game タブの解像度は 1080x1920 などの縦長にすると見やすい。
7. 下の Console に赤いエラーが出たら、その文面を開発チャットに貼る。

### 「有効なプロジェクトではない」と言われたら(確実な方法)
1. Unity Hub →「新しいプロジェクト」→ テンプレート **「Universal 2D」**(または「2D (Built-In Render Pipeline)」)→ プロジェクト名 `PachiSenki` → 好きな場所に作成。
2. 作ったプロジェクトが開いたら、一度 Unity を閉じる。
3. このリポジトリの `unity/PachiSenki/Assets/Scripts` フォルダを、作ったプロジェクトの `Assets` フォルダの中へまるごとコピー。
4. Unity Hub からそのプロジェクトを開き直し、再生(▶)。
- 以後、私がスクリプトを更新したら、同じく `Assets/Scripts` を上書きコピーすれば反映される。

## iPhone 実機で試す手順(Mac + Xcode、無料の Apple ID)
用意するもの: Mac(Xcode が動く最近の macOS)、iPhone と USB ケーブル、Apple ID(無料でよい)。
1. **Mac の準備**: App Store で **Xcode** を入れて一度起動(追加部品のインストールを許可)。Xcode → 設定(Settings)→ Accounts →「+」→ Apple ID でサインイン。
2. **Unity に iOS 用の部品を足す**: Mac に Unity Hub と Unity 6(6000.0.85f2)を入れ、「インストール」→ 歯車 →「モジュールを加える」→ **iOS Build Support** にチェック。
   (Windows の Unity に iOS Build Support を入れて Xcode 用フォルダを作り、それを Mac にコピーしてもよい。以下は Mac だけで行う場合)
3. **プロジェクトを開く**: Unity Hub で `unity/PachiSenki` を開く。初回は自動で「ストア用の設定」(アプリ名・ID・縦画面・アイコン・ビルド用シーン `Assets/Scenes/Main.unity`)が当たる。念のためメニュー「パチ戦記 > ストア用の設定を適用」を押してもよい。
4. **iOS に切り替え**: ファイル → ビルドプロファイル(Build Profiles)→ **iOS** を選んで「プラットフォームを切り替え(Switch Platform)」。数分かかる。
5. **書き出し**: 同じ画面で「Scene List」に `Assets/Scenes/Main` があるのを確認 →「ビルド(Build)」→ 保存先に新しいフォルダ(例 `ios-build`)を作って選ぶ。Xcode 用のフォルダができる。
6. **Xcode で開く**: できたフォルダの `Unity-iPhone.xcodeproj` をダブルクリック。左の一覧で一番上の **Unity-iPhone** → TARGETS の **Unity-iPhone** →「Signing & Capabilities」タブ:
   - 「Automatically manage signing」にチェック、**Team** に自分の名前(Personal Team)を選ぶ。
   - 「Bundle Identifier」で赤いエラーが出たら、末尾を自分だけの名前に変える(例 `com.fukabuchi.pachisenki.test1`)。
7. **iPhone をつなぐ**: USB でつなぎ、iPhone に「このコンピュータを信頼」と出たら「信頼」。iPhone の 設定 → プライバシーとセキュリティ → **デベロッパモード** を ON(再起動あり。項目が無い時は一度 Xcode につないでから見る)。
8. **転送**: Xcode 上部の実行先で自分の iPhone を選び、▶(Run)を押す。初回は数分かかる。
9. **初回だけ**: iPhone に「信頼されていないデベロッパ」と出たら、設定 → 一般 → **VPN とデバイス管理** → 自分の Apple ID →「信頼」。もう一度アプリのアイコンをタップ。
- 無料の Apple ID で入れたアプリは **7日で起動できなくなる**(もう一度 Xcode から ▶ で入れ直せば OK。セーブは残る)。同時に入れられるのは 3 本まで。
- **音が出ない時**: iPhone 左側の消音スイッチ(または消音モード)を確認。この版は消音モードでは鳴らない(他のアプリの音楽も止めない設定)。最初に「スタート」をタップした後から鳴る。
- うまくいかない時は、Xcode 下部の赤いエラー文、または Unity の Console の文面を開発チャットに貼る。

## 移植の進み具合(JS → C#)
| 段階 | 内容 | 状態 |
|---|---|---|
| 1 | コアロジック(00/20/21/23/30/40/50/60/70/87/90/99) | **済**(CoreTests で検証) |
| 2 | Unity 起動・セーブ・仮表示・強化ボタン | **済**(Unity 6000.0.85f2 で起動を確認) |
| 3 | ドット絵(10-sprites の mk() 方式をテクスチャ生成)・盤面/戦闘の本描画 | **一部済**: スプライトを自動生成(tools/export-sprites.js → View/SpriteData.cs)、縦長 360x760 を中央表示、釘/玉/役物/英雄(待機・攻撃コマ)/敵(ステージ別・ボス)/HPバーをスプライトで描画。文字はまだ IMGUI |
| 4 | 演出: カットイン(提供イラスト)・バナー・予告・擬似連/復活・リザルト・ルーレット・777演出・キャラ演出・攻撃モーション | **一部済**: フラッシュ(強/弱/OFF)・揺れ・爆発/コインの雨・予告/リーチ・カットイン(提供イラスト/キメ台詞)・ミニ/全画面ルーレット・押せ!!・超倍率・777叩きつけ・JACKPOTパネル・バナー(虹色/波打ち)・擬似連(NEXT×2〜4・バラけ目)・復活(はずれ…→復活!!)・色つき保留と保留変化・RUSHリザルト(ランクC〜S+のハンコ/最高記録)。残り: キャラ演出/攻撃モーション、文字の TextMeshPro 化 |
| 5 | 音: 8bit BGM/SE(WebAudio の合成を AudioClip 生成 or OnAudioFilterRead で移植) | **一部済**: AudioClip 生成で SE(キュイン/リーチ/当たり/JACKPOT/コイン/打撃 ほか)と BGM 4曲(通常/RUSH/FEVER/JACKPOT。オリジナルの簡易版)。Web版の曲・SE の完全移植は未 |
| 6 | メタ: 実績・転生/魂の祭壇・遺物・図鑑・鍛冶屋/魔石宝石・ログインボーナス・ミニゲーム・お宝/タップ攻撃・応援/パトロン・ランキング | 未 |
| 7 | 配布ビルド(Windows/Mac zip で BOOTH、または WebGL)・設定(フラッシュ強弱/音量)・光過敏配慮 | 未 |

コア側は演出が必要な所で event(OnBanner/OnBigHit/OnHitEvent/OnRouletteResult/OnJackpot/OnKill/OnUlt …)を出すので、View はそれを購読して描画/SE を担当する。

## 決めてほしいこと
- **配布先**: BOOTH なら Windows(.exe を zip)/ Mac / WebGL(ブラウザ)。スマホ(iOS/Android)も出すか。
- **Unity のバージョン**: 既定は Unity 6 LTS(ProjectSettings/ProjectVersion.txt)。
- Web版は当面そのまま更新・配布を続け、Unity 版が追いついたら切り替える想定。

## できないこと/注意(この開発環境の制約)
- Unity エディタ自体はこの環境で動かせないため、**Unity 上でのコンパイル・実行・ビルドは未確認**。コアは dotnet でコンパイルとテスト済み。
- Unity の利用規約(Personal は売上/資金が一定以下なら無料)とビルドは作り手側の環境で行う。
