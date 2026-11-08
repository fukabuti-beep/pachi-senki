# Unity 版への移行

Web版(src/ の単一HTML)を正として、Unity 版を段階的に作る。**ゲームロジックは UnityEngine に依存しない純粋な C#** にして、Unity なしでもテストできるようにしている。

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

## 移植の進み具合(JS → C#)
| 段階 | 内容 | 状態 |
|---|---|---|
| 1 | コアロジック(00/20/21/23/30/40/50/60/70/87/90/99) | **済**(CoreTests で検証) |
| 2 | Unity 起動・セーブ・仮表示・強化ボタン | **済**(Unity 6000.0.85f2 で起動を確認) |
| 3 | ドット絵(10-sprites の mk() 方式をテクスチャ生成)・盤面/戦闘の本描画 | **一部済**: スプライトを自動生成(tools/export-sprites.js → View/SpriteData.cs)、縦長 360x760 を中央表示、釘/玉/役物/英雄(待機・攻撃コマ)/敵(ステージ別・ボス)/HPバーをスプライトで描画。文字はまだ IMGUI |
| 4 | 演出: カットイン(提供イラスト)・バナー・予告・擬似連/復活・リザルト・ルーレット・777演出・キャラ演出・攻撃モーション | **一部済**: フラッシュ(強/弱/OFF)・揺れ・爆発/コインの雨・予告/リーチ・カットイン(提供イラスト/キメ台詞)・ミニ/全画面ルーレット・押せ!!・超倍率・777叩きつけ・JACKPOTパネル・バナー(虹色/波打ち)。残り: 擬似連/復活/保留変化/リザルト/キャラ演出/攻撃モーション |
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
