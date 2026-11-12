/* ---------- 体験版 / 完全版 (共有) ----------
   BOOTH では「無料の体験版」と「有料の完全版」を配る。どちらも同じ src から作る:
     node tools/build.js                       → 完全版(dist/pachi-senki.html。GitHub Pages / Unity / テストもこれ)
     EDITION=free node tools/build.js          → 体験版(dist/pachi-senki-free.html)。先頭に window.PACHI_EDITION='free' を入れ、
                                                 1行目に「@full」と書いたファイル(完全版だけの中身)は入れない
   体験版は STAGE FREE_MAX(エリア3の終わり)まで。続きは 98l-edition が「完全版で」と案内する。
   セーブは同じ形式なので、体験版の引き継ぎコード(97w)を完全版でそのまま読み込める。 */
const EDITION=(typeof window!=='undefined'&&window.PACHI_EDITION==='free')?'free':'full';
const IS_FULL=EDITION==='full';
const FREE_MAX=75;
