// 体験版(@full のファイルを外した状態)で長めに動かして、例外が出ないか(完全版だけの名前を使っていないか)を確かめる
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL: ' + m) } };
for (const seed of [1, 2]) {
  const g = createGame({ seed, globals: { PACHI_EDITION: 'free' } }); g.start();
  ok(g.eval('typeof twStart') === 'undefined', '体験版に無限の塔が入っている');
  const buy = '(function(){let b=-1,c=1e300;for(let i=0;i<UP.length;i++){if(G.stage>=(UP[i][4]||0)&&cost(i)<c){c=cost(i);b=i}}if(b>=0&&G.gold>=c)buy(b);const h=hupCheapest();if(h&&G.gold>=h[2])hupBuy(h[0],h[1])})()';
  for (let s = 0; s < 600; s++) { g.advance(1, .05); if (s % 2 === 0) g.eval(buy); if (s === 300) g.eval('G.stage=170;spawn()'); if (s === 400) g.eval('try{fxMenu()}catch(e){};fxClose()') }
  ok(g.eval('FERR') === 0, 'seed' + seed + ' 更新で例外: ' + g.eval('FERR'));
  ok(g.eval('G.stage') <= 175, '体験版の上限を越えた: ' + g.eval('G.stage'));
  for (let i = 0; i < FMN(g); i++) { try { g.eval('fxTab=' + i + ';fxMenu()') } catch (e) { fails++; console.log('FAIL: メニュー ' + i + ' で例外 ' + e.message) } }
  g.eval('fxClose()');
}
function FMN(g) { return g.eval('FM.length') }
console.log(fails ? fails + ' edition-smoke failure(s)' : 'EDITION SMOKE OK'); process.exit(fails ? 1 : 0);
