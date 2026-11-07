// 広告/課金の受け口: Webでは何も出ない・ネイティブ注入時だけ動く・永続化・ブースト・不正値耐性
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL: ' + m); } };
const wait = (g, s) => g.advance(s, 0.1);
(async () => {
  // 1) Web(ネイティブ無し): 無効・倍率1・DOM差し込み無し
  { const g = createGame({ seed: 1 }); g.start();
    ok(g.eval('monEnabled()') === false, 'web: disabled'); ok(g.eval('monMul()') === 1, 'web: mul 1');
    ok(g.eval('monRows') === null, 'web: no rows'); ok(await g.eval('monBoost()') === false, 'web: boost refused'); }
  // 2) ネイティブ注入(スタブ): リワード成功→ブースト、クールダウン、購入、復元、永続化
  { const store = {}; const g = createGame({ seed: 2, storage: store });
    g.eval(`window.__shown=0;window.__bought=0;window.PachiNative={ads:{ready:()=>true,showRewarded:async p=>{window.__shown++;return true},setBanner(v){window.__banner=v}},iap:{price:()=>'¥480',purchaseRemoveAds:async()=>{window.__bought++;return true},restore:async()=>false,owned:()=>false}}`);
    g.start(); ok(g.eval('monEnabled()') === true, 'native: enabled');
    ok(await g.eval('monBoost()') === true, 'native: boost granted'); ok(g.eval('monMul()') === 2, 'native: mul 2');
    ok(g.eval('window.__shown') === 1, 'native: ad shown once');
    ok(await g.eval('monBoost()') === false, 'native: no double boost'); ok(g.eval('window.__shown') === 1, 'native: no extra ad while boosted');
    ok(g.eval('monCdLeft()') > 1000, 'native: cooldown set');
    ok(await g.eval('monBuy()') === true && g.eval('MON.noAds') === 1, 'native: purchase marks noAds');
    ok(g.eval('window.__banner') === false, 'native: banner off after purchase');
    ok(await g.eval('monBuy()') === false && g.eval('window.__bought') === 1, 'native: no double purchase');
    const saved = JSON.parse(g.eval('localStorage.getItem("pachi2mon")')); ok(saved && saved.noAds === 1, 'persisted noAds'); }
  // 3) 広告失敗(false/例外)でブーストは付かない
  { const g = createGame({ seed: 3 });
    g.eval(`window.PachiNative={ads:{ready:()=>true,showRewarded:async()=>{throw new Error('no fill')}},iap:{price:()=>'x',purchaseRemoveAds:async()=>{throw new Error('x')},restore:async()=>false,owned:()=>false}}`);
    g.start(); ok(await g.eval('monBoost()') === false && g.eval('monMul()') === 1, 'failed ad: no boost');
    ok(await g.eval('monBuy()') === false && g.eval('MON.noAds') === 0, 'failed purchase: not owned'); }
  // 4) 壊れたセーブ値でも落ちない
  { const g = createGame({ seed: 4, storage: { pachi2mon: '{"noAds":1,"boostUntil":"abc","cdUntil":-5}' } }); g.start();
    ok(g.eval('MON.boostUntil') === 0 && g.eval('monMul()') === 1, 'corrupt save sanitized'); }
  if (fails) { console.error(fails + ' monet failure(s)'); process.exit(1); }
  console.log('MONET OK');
})();
