// 紹介動画の録画: node tools/promo.js → store/promo/raw.webm(映像)+ audio.webm(ゲーム音)+ meta.json(音のずれ)
// 先に node tools/build.js。仕上げは tools/promo.sh(ffmpeg で mp4 に合成)。
// 実際のゲームを Playwright で動かし、テスト用の強制フラグ(BS.force/HEV.force/UJ.force など)で見どころを順に起こす。字幕は DOM で重ねる。
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const OUT = path.resolve(__dirname, '../store/promo'); fs.mkdirSync(OUT, { recursive: true });
const W = 720, H = 1560;   // 録画はこの大きさそのまま(deviceScaleFactor を上げると映像の左上にしか映らないため、画面自体を大きくする)
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const br = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, recordVideo: { dir: OUT, size: { width: W, height: H } } });
  await ctx.addInitScript(() => {
    window.__t0 = performance.now();
    try {
      if (!localStorage.getItem('pachi2')) {
        localStorage.setItem('pachi2', JSON.stringify({ v: 2, gold: 3.2e9, stage: 63, lv: [30, 22, 10, 26, 10, 10, 10, 9, 8, 8, 12, 6, 6, 6, 8, 5, 3] }));
        localStorage.setItem('pachi2_tut', JSON.stringify({ v: 1, s: { a0: 1, a1: 1, a2: 1, b0: 1, b1: 1 }, g: {}, skip: 1, off: 1, old: 1 }));
        const d = new Date(); localStorage.setItem('pachi2_daily', JSON.stringify({ last: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(), day: d.toDateString(), streak: 3 }));
      }
    } catch (e) {}
  });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('file://' + path.resolve(__dirname, '../dist/pachi-senki.html'));
  // 字幕と締めのカード
  await pg.addStyleTag({ content: `
#pcap{position:fixed;left:0;right:0;top:73%;z-index:99;text-align:center;pointer-events:none;font-family:"DotGothic16",monospace;opacity:0}
#pcap b{display:inline-block;font-size:56px;line-height:1.25;padding:10px 26px;color:#fff;letter-spacing:1px;
 text-shadow:-5px 0 #000,5px 0 #000,0 -5px #000,0 5px #000,-5px -5px #000,5px 5px #000,-5px 5px #000,5px -5px #000,0 10px 0 #b0006a,0 14px 0 #000;background:linear-gradient(90deg,rgba(10,7,32,0),rgba(10,7,32,.85) 15%,rgba(10,7,32,.85) 85%,rgba(10,7,32,0))}
#pcap small{display:block;font-size:28px;color:#ffe56a;text-shadow:-2px 0 #000,2px 0 #000,0 -2px #000,0 2px #000;margin-top:2px}
#pcap.on{animation:pcapIn .35s cubic-bezier(.2,1.6,.4,1) forwards}
@keyframes pcapIn{0%{opacity:0;transform:scale(1.8)}100%{opacity:1;transform:none}}
#pcard{position:fixed;inset:0;z-index:100;display:none;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:radial-gradient(circle at 50% 40%,#3a1a8a,#0a0720 70%);font-family:"DotGothic16",monospace;color:#fff;text-align:center}
#pcard .lg{font-size:110px;letter-spacing:4px;background:linear-gradient(90deg,#ff2d55,#ffd400,#33dd66,#22e0ff,#7a5cff,#ff2d55);background-size:200%;-webkit-background-clip:text;color:transparent;filter:drop-shadow(0 4px 0 #000);animation:pclg 2s linear infinite}
@keyframes pclg{to{background-position:200% 0}}
#pcard .s1{font-size:38px;color:#ffe56a}#pcard .s2{font-size:30px;color:#c8c0ff;line-height:1.7}#pcard .s3{margin-top:20px;font-size:34px;padding:14px 30px;border:5px solid #ffd400;color:#fff;background:#2a1a6a}
`});
  await pg.evaluate(() => { const d = document.createElement('div'); d.id = 'pcap'; document.body.appendChild(d);
    const c = document.createElement('div'); c.id = 'pcard'; c.innerHTML = '<div class="s1">放置バトルパチンコ</div><div class="lg">パチ戦記</div><div class="s2">ブラウザでもスマホでも<br>インストール不要・無料</div><div class="s3">BOOTH で配布中<br><small>fukabuchi.booth.pm</small></div>'; document.body.appendChild(c); });
  await pg.evaluate(()=>{try{UX.S.fl=1}catch(e){}});   // 録画中はフラッシュ「弱」(白飛びのコマを避ける)
  const cap = async (t, s, ms) => { await pg.evaluate(([t, s]) => { const e = document.getElementById('pcap'); e.className = ''; e.innerHTML = t ? '<b>' + t + (s ? '<small>' + s + '</small>' : '') + '</b>' : ''; void e.offsetWidth; if (t) e.className = 'on' }, [t, s || '']); if (ms) await wait(ms); };
  const ev = s => pg.evaluate(s).catch(e => errs.push('eval ' + e));
  // ゲーム音を録る(マスター出力を MediaRecorder へ)
  await ev(`window.__arec=setInterval(()=>{try{if(typeof SGR!=='undefined'&&SGR&&SGR.mx&&!window.__rec){const d=AC.createMediaStreamDestination();SGR.mx.connect(d);const r=new MediaRecorder(d.stream);window.__ch=[];r.ondataavailable=e=>window.__ch.push(e.data);r.start(200);window.__rec=r;window.__aStart=performance.now();clearInterval(window.__arec)}}catch(e){}},50)`);

  // 1) タイトル画面
  await wait(600); await pg.mouse.click(60, 240); await wait(400);
  await cap('放置するだけで<br>激アツ!!', 'ドット絵 × パチンコ × 自動バトル', 3200);
  await cap('', '', 0); await pg.click('#go'); await wait(2200);
  await pg.getByText('受け取る!').first().click({ timeout: 1500 }).catch(() => {});
  // 2) 通常プレイ
  await cap('玉が転がる → スロット回転', '入賞するたびに 3リールが回る', 2600);
  await cap('英雄が勝手に戦う!', '剣士・魔法使い・弓使いの自動バトル', 2400);
  // 3) SUPER リーチ → スロット破砕 → 巨大スロット → 押せ!!(超倍率)
  await cap('', '', 0);
  await ev(`try{UPX.__sp=UPX.supP;UPX.supP=()=>1}catch(e){};HEV.force='roul';BS.force=1;sp=null;G.q=1;QL.length=0;QL.push({h:1,c:3});startSpin();sp.pzN=0;sp.rv=0;sp.type=2;sp.stop[2]=7.5`);
  await wait(900); await cap('SUPER リーチ!!', 'スロットが砕けて…巨大スロット出現!?', 0);
  for (let i = 0; i < 80; i++) { await wait(100); if (await pg.evaluate('!!(typeof PUSH!=="undefined"&&PUSH)')) break; }
  await cap('押せ!!', 'ボタンの色で 熱さがわかる', 900);
  await ev('pushPress(0)'); await wait(700); await cap('超倍率 ルーレット!!', '最大 x777', 0);
  for (let i = 0; i < 90; i++) { await wait(100); if (i === 42) await ev('try{RQ.ff=1}catch(e){}'); if (await pg.evaluate('!RL')) break; }
  await ev(`try{UPX.supP=UPX.__sp}catch(e){};HEV.force=null`); await cap('', '', 700);
  // 4) 777 → JACKPOT(英雄の超必殺技)
  await ev(`HEV.force='jp';UJ.force=0;UJ.hero=1;sp=null;bigHit(true)`);
  await wait(800); await cap('777 揃い!!', '', 0);
  for (let i = 0; i < 60; i++) { await wait(100); if (await pg.evaluate('!!(typeof PUSH!=="undefined"&&PUSH)')) break; }
  await wait(500); await ev('pushPress(0)'); await wait(600);
  await cap('JACKPOT!!', 'まれに英雄の 超必殺技!!', 5200);
  await ev(`HEV.force=null`); await cap('', '', 1500);
  // 5) ボーナスタイム
  await ev(`try{btStart(0)}catch(e){}`); await wait(500); await cap('ボーナスタイム', 'ゴールド2倍・魔石3倍・ダメージ2倍', 3000);
  // 6) エリアとボス
  await ev(`G.stage=100;spawn();G.hp=G.mx*.45`); await wait(400); await cap('8つのエリア × 巨大ボス', '形態変化する エリアの主', 3400);
  await ev(`G.stage=64;spawn()`); await cap('', '', 300);
  // 7) やりこみ
  await pg.click('#ubt').catch(() => {}); await wait(500); await cap('強化・転生・宝石屋・くじ', 'やりこみ要素たっぷり', 0);
  for (const i of [0, 2, 3, 4]) { await ev(`grpSet(${i})`); await wait(800); }
  await pg.click('#ubt').catch(() => {}); await ev(`try{if(typeof sheetOpen==='function'&&sheetOpen())$('ubt').click()}catch(e){}`);
  await ev('expBtnOpen()'); await wait(300); await cap('遠征で 仲間と冒険', 'アプリを閉じていても進む', 2400);
  await ev('fxClose()'); await cap('', '', 300);
  // 8) 締め
  await ev(`document.getElementById('pcard').style.display='flex'`); await wait(4200);
  // 音の取り出し
  const a = await pg.evaluate(async () => { try { const r = window.__rec; if (!r) return null; await new Promise(res => { r.onstop = res; r.stop() }); const b = new Blob(window.__ch, { type: 'audio/webm' }); const buf = await b.arrayBuffer(); let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return { b64: btoa(s), off: window.__aStart - window.__t0 } } catch (e) { return { err: String(e) } } });
  const vpath = await pg.video().path(); await ctx.close(); await br.close();
  fs.renameSync(vpath, path.join(OUT, 'raw.webm'));
  if (a && a.b64) { fs.writeFileSync(path.join(OUT, 'audio.webm'), Buffer.from(a.b64, 'base64')); fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ audioOffsetMs: a.off })); }
  console.log('done', a ? (a.err || ('audio ' + Math.round(a.b64.length / 1024) + 'KB off ' + Math.round(a.off) + 'ms')) : 'no audio', errs.slice(0, 5));
})();
