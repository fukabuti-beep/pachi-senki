// 衣装(98n)と 4人目の英雄ツララ(98yb、完全版のみ)と 追加の仲間(96)
const { createGame } = require('../tools/harness');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL: ' + m) } };
const g = createGame({ seed: 4 }); g.start(); g.advance(1, .05);
// --- 衣装 ---
ok(g.eval('SKD[0].length>=3&&SKD[1].length>=3&&SKD[2].length>=3'), '3人に衣装がある');
ok(g.eval("skMenu().indexOf('衣装')>0") && g.eval("UPG.list.find(x=>x[0]==='英雄')[1]().indexOf('<!--sk-->')>0"), '強化画面「英雄」に衣装');
const col0 = g.eval("JSON.stringify(PXL.h0.map(q=>q[2]))");
g.eval('RES.gem=0'); ok(g.eval("skSet(0,'blue')") === false && g.eval('skCur(0).id') === 'd', '宝石が無いと買えない');
g.eval('RES.gem=SKGEM+5'); ok(g.eval("skSet(0,'blue')") === true && g.eval('RES.gem') === 5 && g.eval('skCur(0).id') === 'blue', '宝石で買って着る');
ok(g.eval("JSON.stringify(PXL.h0.map(q=>q[2]))") !== col0 && g.eval("PXL.h0.some(q=>q[2]==='#3a8cff')"), '色が塗り変わる');
ok(g.eval("PXL.h0s.some(q=>q[2]==='#3a8cff')"), '攻撃のコマも変わる');
ok(g.eval("skSet(0,'gold')") === false, '条件つきは満たすまで着られない'); g.eval('X.st.jp=50;if(fxOpen)fxClose()'); g.advance(3, .05); ok(g.eval("SK.own['0:gold']") === 1, '条件を満たした時に手に入る(お知らせ)'); ok(g.eval("skSet(0,'gold')") === true, '条件を満たすと着られる');
ok(g.eval('SKGEM') >= 400, '宝石の衣装は高め');
g.eval("skSet(0,'d')"); ok(g.eval("JSON.stringify(PXL.h0.map(q=>q[2]))") === col0, 'いつもの に戻せる');
g.eval("skSet(0,'blue')"); const st = g.store;
const g2 = createGame({ seed: 5, storage: st }); ok(g2.eval('skCur(0).id') === 'blue' && g2.eval("PXL.h0.some(q=>q[2]==='#3a8cff')"), '読み直しても着ている');
// --- 追加の仲間 ---
ok(g.eval('ALY.length') === 5 && g.eval("SPR.fa5&&SPR.fa6") , '仲間が5人');
g.eval('if(fxOpen)fxClose();HV.hp=[10,10,10];HV.dn=[0,0,0];ALY.find(a=>a.id==="fairy").go()'); ok(g.eval('HV.hp[0]') > 10, '妖精が回復する');
const at0 = g.eval('HV.at'); g.eval('G.mx=G.hp=1e30;ALY.find(a=>a.id==="bird").go()'); ok(g.eval('HV.at') > at0 + 2, '雷鳥が敵の手を止める');
// --- 4人目(完全版) ---
ok(g.eval('typeof lnOn') === 'function' && g.eval('STH.length') === 4 && g.eval('!!SPR.h3s'), 'ツララがいる');
g.eval('X.best=60'); ok(!g.eval('lnOn()') && /\?\?\?/.test(g.eval('lnCard()')), 'STAGE 75 までは ???');
g.eval('RL=null;G.roul=0;G.jp=0;cut=null;G.stage=76;X.best=76;spawn();G.mx=G.hp=1e30'); g.advance(4, .05);
ok(g.eval('LN.h') > 0, '加入すると突く'); ok(g.eval('TS.s.j4===1||STY.q.indexOf("j4")>=0||(STY.cur&&STY.cur.id==="j4")'), '加入の会話');
// 装甲つらぬき: STAGE 60 のボス(装甲÷4)でも雑魚と同じだけ通る
const dmg = st2 => { g.eval('cut=null;G.stage=' + st2 + ';spawn();G.mx=G.hp=1e12;cmb=0;{const r=Math.random;Math.random=()=>.99;lnHit();Math.random=r}'); return 1e12 - g.eval('G.hp') };
const dB = dmg(60), dN = dmg(61); ok(dB > dN * .7, 'ボスの装甲をつらぬく: ' + dB + ' / ' + dN);
g.eval('G.gold=1e12'); const m0 = g.eval('lnMul()'); ok(g.eval('lnBuy()') && g.eval('lnMul()') > m0 && g.eval('JSON.parse(localStorage.getItem("pachi2_lancer")).lv') === 2, '槍術を買える・保存');
ok(/槍術/.test(g.eval("UPG.list.find(x=>x[0]==='英雄')[1]()")), '強化画面にカード');
g.eval('RL=null;G.roul=0;G.jp=0;cut=null;G.stage=80;presDo()'); g.advance(1, .05); ok(g.eval('LN.lv') === 1 && g.eval('lnOn()'), '転生で槍術はリセット・仲間は残る');
ok(g.eval('SKD[3].length>=3') && g.eval("skMenu().indexOf('ツララ')>0"), 'ツララの衣装');
ok(g.eval("SKD[0].some(s=>s.id==='light')") && !g.eval("skHas(0,skOf(0,'light'))"), '光の衣はエンディング後');
ok(g.eval('FERR') === 0, '例外なし: ' + g.eval('FERR'));
// --- 体験版: 衣装と仲間はある、ツララはいない ---
const f = createGame({ seed: 6, globals: { PACHI_EDITION: 'free' } }); f.start(); f.advance(1, .05);
ok(f.eval('typeof lnOn') === 'undefined' && f.eval('STH.length') === 3 && f.eval('SKD[0].length') === 3 && !f.eval('SKD[3]'), '体験版にツララが入っている');
ok(f.eval("skMenu().indexOf('衣装')>0") && f.eval('ALY.length') === 5, '体験版にも衣装と仲間');
console.log(fails ? fails + ' skin failure(s)' : 'SKIN OK'); process.exit(fails ? 1 : 0);
