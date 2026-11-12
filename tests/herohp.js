// 英雄の体力(24/92c): 強化3種 / 雑魚戦で倒れても起き上がる / ボス戦で全滅→ボス全快+リベンジ / 倒れた英雄は攻撃しない / 塔で全滅すると挑戦終了
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL: ' + m) } };
const g = createGame({ seed: 5 }); g.start(); g.advance(1, .05);
ok(g.eval('UP.length') === 17, '通常強化は増やさない(英雄ごとの強化へ)');
ok(g.eval('UPG.list[1][0]') === '英雄' && g.eval('typeof hupMenu()') === 'string', '強化画面に「英雄」グループ');
g.eval('G.stage=25;X.best=Math.max(X.best,25)'); const m0 = g.eval('hvMax(0)'), m1 = g.eval('hvMax(1)'); g.eval('G.gold=1e12');
ok(g.eval('hupBuy(0,0)') === true && g.eval('HUP.lv[0][0]') === 2, '剣士の体力を買える');
ok(g.eval('hvMax(0)') > m0 && g.eval('hvMax(1)') === m1, '買った英雄だけ体力が増える');
ok(g.eval('JSON.parse(localStorage.getItem("pachi2_hero")).lv[0][0]') === 2, 'セーブされる');
g.eval('hupBuy(1,1);hupBuy(2,2)'); ok(g.eval('hupM(1,1)') > 1 && g.eval('hupM(2,2)') > 1 && g.eval('hupM(0,1)') === 1, '防御/回復も英雄ごと');
g.eval('HUP.lv[0][0]=1;HUP.lv[1][1]=1;HUP.lv[2][2]=1');
ok(g.eval('hvMax(0)') > g.eval('hvMax(1)'), '剣士の方が硬い');
// 雑魚戦: 倒れる → 起き上がる
g.eval('G.stage=12;spawn();hvHit(1,9999,false)'); ok(g.eval('HV.dn[1]') === 1, '倒れる');
const ha = g.eval('HA[1]'); g.eval('heroAtk(1,1)'); ok(g.eval('HA[1]') === ha, '倒れた英雄は攻撃しない');
g.advance(7, .05); ok(g.eval('HV.dn[1]') === 0, '雑魚戦は起き上がる');
// ボス戦: 全滅 → ボス全快 + リベンジ
g.eval('cut=null;G.jp=0;G.roul=0;G.stage=20;spawn();G.hp=G.mx*.3'); ok(g.eval('HV.dn.every(d=>!d)'), 'ボス登場で全快');
const a0 = g.eval('SB.a()');
g.eval('hvHit(0,9999,true);hvHit(1,9999,true)'); ok(g.eval('HV.wipe') === 0, '2人ではまだ全滅しない');
g.advance(3, .05); ok(g.eval('HV.dn[0]') === 1, 'ボス戦では起き上がらない');
g.eval('hvHit(2,9999,true)'); ok(g.eval('HV.wipe') > 0 && g.eval('HV.rev') === 1, '全滅 → リベンジ');
ok(g.eval('SB.a()') > a0 * 1.2, 'リベンジで攻撃アップ');
g.advance(3, .05); ok(g.eval('HV.dn.every(d=>!d)') && g.eval('G.hp') === g.eval('G.mx'), '挑み直し: 全快+ボス全快');
g.eval('G.hp=0;kill()'); ok(g.eval('HV.rev') === 0, '倒したらリベンジ解除');
// 実際に攻撃してくる(長いボス戦で体力が減る)
g.eval('fxClose();cut=null;G.jp=0;G.roul=0;G.stage=40;spawn();G.mx=G.hp=1e300'); g.advance(20, .05);
ok(g.eval('HV.hp.some((h,i)=>h<hvMax(i))') || g.eval('HV.dn.some(d=>d)'), 'ボスが攻撃してくる');
ok(g.eval('FERR') === 0, '例外なし: ' + g.eval('FERR'));
// 転生で英雄の強化はリセット
g.eval('G.stage=25;spawn();G.gold=1e12;hupBuy(0,0);hupBuy(0,0)'); ok(g.eval('HUP.lv[0][0]') === 3, '買える'); g.eval('RL=null;G.roul=0;G.jp=0;cut=null;G.stage=60;presDo()'); ok(g.eval('HUP.lv[0][0]') === 1, '転生でリセット');
// 塔: 全滅で挑戦終了
if (g.eval('typeof twStart') === 'function') {
  g.eval('G.stage=41;spawn();X.best=60;cut=null;G.jp=0;G.roul=0;PUSH=null;twStart(1)'); ok(g.eval('TW.on') === 1, '塔の開始');
  g.eval('hvHit(0,9999,true);hvHit(1,9999,true);hvHit(2,9999,true)'); ok(!g.eval('TW.on'), '塔で全滅すると終了'); g.eval('fxClose()');
}
console.log(fails ? fails + ' herohp failure(s)' : 'HEROHP OK'); process.exit(fails ? 1 : 0);
