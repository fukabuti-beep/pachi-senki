# アプリ化ガイド (パチ戦記)

## 1. いちばん簡単: PWA(ホーム画面に追加)
`npm run build` で `dist/pwa/` ができる(index.html / manifest.webmanifest / sw.js / アイコン)。
このフォルダを **HTTPSの静的ホスティング**(GitHub Pages / Netlify / Cloudflare Pages など)にそのまま置く。
- iPhone: **Safari**で開く → 共有(□↑) → 「ホーム画面に追加」 → 全画面・アイコン付きで起動(オフラインでも遊べる)
- Android/Chrome: メニュー →「アプリをインストール」(ゲーム内 設定 →「アプリ化」でも案内)
- 更新: ビルドごとに sw.js のキャッシュ名が変わる。次回起動時に新版へ入れ替わる(2回目の起動で反映)。
- 注意: iOS の PWA は localStorage がブラウザ版と**別**(セーブは引き継がれない)。

## 2. ストア配布(将来): Capacitor でネイティブ包装
```
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init pachi-senki jp.example.pachisenki --web-dir=dist/pwa
npx cap add ios && npx cap add android && npx cap sync
```
- iOS は Xcode(Mac)+ Apple Developer Program(年額)が必要。
- ストア審査上、**ガチャ/課金/実マネー要素は入れていない**(ゲーム内通貨のみ)。「パチンコ」風の表現は年齢区分(12+/17+)に注意。
- 音: iOS は最初のタップ後にしか鳴らない(実装済み)。

## 3. 単一HTML
`dist/pachi-senki.html` はファイル1つで動く(manifest/SWなし)。アイコンはdata URI。メールやアーティファクトで配るならこちら。

## アイコン再生成
`node tools/build.js && python3 tools/icons.py`(ゲームのドット絵スプライトから生成 → `src/pwa/*.png`)
