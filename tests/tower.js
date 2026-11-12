// 無限の塔(98z): 解放条件 / 撃破で次の階・記録・報酬 / 時間切れで元の敵に戻る / ステージは進まない / 転生で打ち切り / 体験版に入らない
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL: ' + m) } };
const g = createGame({ seed: 3 }); g.start(); g.advance(1, .05);
ok(g.eval('typeof twStart') === 'function', 'twStart がある');
g.eval('X.best=10'); g.eval('twStart(1)'); ok(!g.eval('TW.on'), 'STAGE 30 未満では始まらない');
g.eval('X.best=40;G.stage=12;spawn();G.hp=G.mx*.5'); const mx0 = g.eval('G.mx'), hp0 = g.eval('G.hp');
const busy = 'RL=null;G.roul=0;G.jp=0;cut=null;PUSH=null;if(typeof HEV!=="undefined")HEV.jr=null;';
g.eval(busy + 'twStart(1)'); ok(g.eval('TW.on') === 1 && g.eval('TW.f') === 1, '1階から始まる');
ok(g.eval('G.mx') === g.eval('twHp(1)'), '塔のHP');
const ms0 = g.eval('RES.ms'), gem0 = g.eval('RES.gem');
for (let f = 1; f <= 10; f++) { g.eval('G.hp=0;kill()'); g.advance(1, .05) }
ok(g.eval('G.stage') === 12, 'ステージは進まない: ' + g.eval('G.stage'));
ok(g.eval('TW.best') === 10 && g.eval('TW.f') === 11, '10階突破: best=' + g.eval('TW.best') + ' f=' + g.eval('TW.f'));
ok(g.eval('RES.ms') - ms0 >= 220, '魔石の報酬: ' + (g.eval('RES.ms') - ms0));
ok(g.eval('RES.gem') - gem0 >= 4, '宝石 5階1+10階3: ' + (g.eval('RES.gem') - gem0));
ok(Math.abs(g.eval('twBless()') - .03) < 1e-9, '塔の加護 +3%');
ok(g.eval('JSON.parse(localStorage.getItem("pachi2_tower")).best') === 10, 'セーブされる');
// 時間切れ → 元の敵へ
g.advance(25, .05); ok(!g.eval('TW.on'), '時間切れで終わる'); ok(g.eval('G.mx') === mx0 && g.eval('G.hp') <= hp0 && g.eval('G.hp') > hp0 * .5, '元の敵のHPに戻る: ' + g.eval('G.hp'));
ok(g.eval('fxOpen') === true, '結果画面'); g.eval('fxClose()');
// 記録内の階はもう報酬なし
const ms1 = g.eval('RES.ms'); g.eval(busy + 'twStart(1)'); for (let f = 1; f <= 3; f++) { g.eval('G.hp=0;kill()'); g.advance(1, .05) }
ok(g.eval('RES.ms') === ms1, '記録内は報酬なし');
// 途中で spawn(転生など)→ 打ち切り
g.eval('spawn()'); ok(!g.eval('TW.on'), 'spawn で打ち切り');
g.eval(busy + 'twStart(99)'); ok(g.eval('TW.f') === 11, '記録+1 より上からは始められない: ' + g.eval('TW.f')); g.eval('twEnd(0,1)');
// 描画が落ちない
g.eval(busy + 'twStart(5)'); g.advance(2, .05); ok(g.eval('FERR') === 0, '更新で例外なし'); g.eval('twEnd(0,1)');
ok(g.eval('typeof twMenu()') === 'string' && g.eval('FMGRP.find(x=>x.n==="遊ぶ").t.includes("無限の塔")'), 'メニュー');
console.log(fails ? fails + ' tower failure(s)' : 'TOWER OK'); process.exit(fails ? 1 : 0);
