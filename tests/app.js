// Unity アプリ(WebView)との橋渡し 97u-app: ブラウザでは何も送らない・アプリでは振動/セーブの控えを送る・書き戻しはセーブが無い時だけ
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
(async () => {
  // 1) ブラウザ: PachiApp 無し → 送信しない・落ちない
  { const g = createGame({ seed: 1 }); g.start();
    ok(g.eval('appIn()') === false, 'web: not in app');
    g.eval('bigHit(false)'); g.advance(2, 0.1); ok(true, 'web: bigHit ok'); }
  // 2) アプリ: 大当たりで vib、セーブの控えを送る
  { const store = { pachi2: '{"v":2,"gold":5,"stage":3,"lv":[]}' }; const g = createGame({ seed: 2, storage: store });
    g.eval(`window.__m=[];window.Unity={call:m=>window.__m.push(m)};window.PachiApp={v:1}`); g.start();
    ok(g.eval('appIn()') === true, 'app: detected');
    g.eval('UAPP.lastV=-9;bigHit(false)'); ok(g.eval('window.__m.some(m=>m==="vib:big")'), 'app: vib on bigHit');
    g.eval('UAPP.lastV=-9;UAPP.vib=0;bigHit(true)'); ok(!g.eval('window.__m.some(m=>m==="vib:jp")'), 'app: vib off respected');
    g.eval('appBackup()'); const s = g.eval('window.__m.find(m=>m.indexOf("save:")===0)');
    ok(s && JSON.parse(s.slice(5)).pachi2, 'app: backup sent');
    const n = g.eval('window.__m.length'); g.eval('appBackup()'); ok(g.eval('window.__m.length') === n, 'app: unchanged backup not resent');
    ok(g.eval(`appRestore('{"pachi2":"{}"}')`) === false, 'app: restore skipped when save exists'); }
  // 3) 書き戻し: セーブが無ければ書く / 壊れた控えでも落ちない
  { const g = createGame({ seed: 3 }); g.start(); g.eval('localStorage.removeItem("pachi2")');
    g.eval('window.location=window.location||{};window.location.reload=()=>{window.__rl=1}');
    ok(g.eval(`appRestore('{"pachi2":"{\\\\"gold\\\\":9}","other":"x"}')`) === true, 'restore: writes');
    ok(g.eval('localStorage.getItem("pachi2")') === '{"gold":9}' && g.eval('localStorage.getItem("other")') === null, 'restore: only pachi2 keys');
    g.eval('localStorage.removeItem("pachi2")'); ok(g.eval(`appRestore('not json')`) === false, 'restore: corrupt ignored'); }
  if (fails) { console.error(fails + ' app failure(s)'); process.exit(1); }
  console.log('APP OK');
})();
