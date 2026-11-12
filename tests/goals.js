// 次の目標・おみくじ(98o)と 音楽室(98ya、完全版のみ)
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL: ' + m) } };
const g = createGame({ seed: 12 }); g.start(); g.advance(1, .05); g.eval('if(fxOpen)fxClose()');
ok(g.eval("FM.some(m=>m.n==='目標')") && g.eval("fmgOf('目標')===FMGRP.findIndex(x=>x.n==='遊ぶ')"), 'メニュー「遊ぶ」に目標');
// おみくじ: 引くまで効果なし → 引くと今日だけ効く → 1日1回 → 翌日に消える
ok(!g.eval('omHas()') && ['a', 'g', 'ms', 'sp'].every(k => g.eval('omB("' + k + '")') === 0), '引く前は効果なし');
const a0 = g.eval('SB.a()'), g0 = g.eval('SB.g()');
ok(g.eval('omDraw()') === true && g.eval('omHas()'), '引ける'); ok(g.eval('omDraw()') === false, '1日1回');
const k = g.eval('OMK[OMI.k][0]'), b = g.eval('OMR[OMI.r][1]'); ok(b >= .1 && b <= .3, '効果は 10〜30%: ' + b);
if (k === 'a') ok(Math.abs(g.eval('SB.a()') / a0 - (1 + b)) < 1e-9, 'ダメージに効く'); else ok(Math.abs(g.eval('SB.a()') - a0) < 1e-9, '他の日はダメージ不変');
if (k === 'g') ok(Math.abs(g.eval('SB.g()') / g0 - (1 + b)) < 1e-9, 'ゴールドに効く');
g.eval('OMI.k=2'); const m0 = g.eval('RES.ms'); g.eval('resMs(100)'); ok(g.eval('RES.ms') - m0 > 100, '魔石の日は魔石が増える');
ok(/今日いっぱい/.test(g.eval('glMenu()')), '画面に今日の結果');
const g2 = createGame({ seed: 13, storage: g.store }); ok(g2.eval('omHas()'), '読み直しても今日の分は残る');
g.eval('OMI.d="2000-01-01"'); ok(!g.eval('omHas()') && g.eval('omB("ms")') === 0 && /おみくじを引く/.test(g.eval('glMenu()')), '日付が変わると消えて、また引ける');
// 次の目標
g.eval('X.best=20;G.stage=20'); let L = JSON.parse(g.eval('JSON.stringify(glList())'));
ok(L.length >= 3 && L.every(x => x[1] < x[2]) && L.some(x => /転生/.test(x[0])) && L.some(x => /仲間/.test(x[0])), '目標が並ぶ: ' + L.map(x => x[0]).join(','));
for (let i = 1; i < L.length; i++) ok(L[i - 1][1] / L[i - 1][2] >= L[i][1] / L[i][2], '近い順');
g.eval('X.best=40'); L = JSON.parse(g.eval('JSON.stringify(glList())')); ok(!L.some(x => /転生ができる/.test(x[0])), '達成した目標は消える');
// 音楽室(完全版)
ok(g.eval("FM.some(m=>m.n==='音楽室')") && g.eval('typeof mrMenu()') === 'string', '音楽室がある');
g.eval('X.best=5;X.st.jp=0;RL=null;G.roul=0;G.jp=0;G.rush=0;G.fv=0;cut=null;G.stage=3;spawn()');
ok(g.eval("mrSet('j')") === false, '聞いたことのない曲は選べない'); ok(g.eval("mrSet('tt')") === true && g.eval('bgmState()') === 'tt', '選んだ曲が通常時に流れる');
g.eval('G.rush=5'); ok(g.eval('bgmState()') === 'r', 'RUSH の曲はそのまま'); g.eval('G.rush=0');
ok(g.eval('JSON.parse(localStorage.getItem("pachi2_music")).sel') === 'tt', '保存'); g.eval("mrSet('')"); ok(/^n/.test(g.eval('bgmState()')), 'おまかせに戻せる');
ok(g.eval('FERR') === 0, '例外なし');
// 体験版: 目標とおみくじはある、音楽室は無い
const f = createGame({ seed: 14, globals: { PACHI_EDITION: 'free' } }); f.start(); f.advance(1, .05);
ok(f.eval("FM.some(m=>m.n==='目標')") && f.eval('typeof glMenu()') === 'string' && f.eval('typeof mrSet') === 'undefined', '体験版の中身');
console.log(fails ? fails + ' goals failure(s)' : 'GOALS OK'); process.exit(fails ? 1 : 0);
