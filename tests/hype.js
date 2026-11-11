// 激アツ演出(89d 暗転 / 89e スロット破砕→巨大スロット / 89f JACKPOT 超必殺技 / 89g ボタン)のテスト
// 当否が変わらない・各演出が起動/終了する・不発でも報酬は同じ・転生(presAbort)で残らない・配列上限
// 実行: node tests/hype.js
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const idle = 'G.rush=0;G.roul=0;G.jp=0;sp=null;cut=null;PUSH=null;RL=null;MG=null;HEV.jr=null;HEV.mr=null;JPX.p=null;GK.rr=null;GK.rs=null;';

// (a) 暗転: 強制で起動 → リーチで明ける → 消える。当たり保留はそのまま bigHit
{
  const g = createGame({ seed: 3 }); g.start(); g.advance(1);
  g.eval(`var __bh=0;(function(){const o=bigHit;bigHit=function(){__bh++;return o.apply(this,arguments)}})();${idle}
    BK.force=1;G.q=1;QL.length=0;QL.push({h:1,c:0});startSpin();sp.pzN=0;sp.type=2;var __s=sp;`);
  ok(g.eval('!!BK.s&&BK.s.sp===__s'), '暗転が仕込まれない');
  let dark = 0, rel = -1, maxA = 0;
  for (let i = 0; i < 400 && !g.eval('__bh'); i++) { g.advance(.05); const b = g.eval('BK.s?{ph:BK.s.ph,a:BK.s.a,rel:BK.s.rel}:null'); if (b) { if (b.ph >= 1) dark = 1; maxA = Math.max(maxA, b.a); if (b.rel >= 0) rel = b.rel } }
  ok(dark && maxA > .5 && maxA <= .82, '暗転の暗さ: ' + maxA);
  ok(rel === 2, 'SUPER リーチで「発展」にならない: ' + rel);
  ok(g.eval('__bh') === 1, '暗転つきの当たりで bigHit が1回でない');
  g.advance(2);
  ok(g.eval('!BK.s'), '暗転が残る');
  // 不透明度の変化は滑らか(1フレームの変化が小さい=点滅しない)
  g.eval(`${idle}BK.force=1;G.q=1;QL.length=0;QL.push({h:0,c:0});startSpin();sp.pzN=0;`);
  let prev = 0, jump = 0; for (let i = 0; i < 80; i++) { g.advance(.05); const a = g.eval('BK.s?BK.s.a:0'); jump = Math.max(jump, Math.abs(a - prev)); prev = a }
  ok(jump <= .1, '暗転の明暗の変化が急: ' + jump);
  console.log('暗転: OK');
}

// (b) 巨大スロット: 強制で起動 → 破片 → 巨大リール → 揃う → 小さいスロットに戻る
{
  const g = createGame({ seed: 4 }); g.start(); g.advance(1);
  g.eval(`var __bh=0;(function(){const o=bigHit;bigHit=function(){__bh++;return o.apply(this,arguments)}})();${idle}
    BS.force=1;G.q=1;QL.length=0;QL.push({h:1,c:0});startSpin();sp.pzN=0;sp.rv=0;sp.type=2;sp.stop[2]=7.5;var __f=sp.f.slice();`);
  let started = 0, ph2 = 0, maxSh = 0, res = null;
  for (let i = 0; i < 400; i++) { g.advance(.05); const b = g.eval('BS.s?{ph:BS.s.ph,sh:BS.s.sh.length,res:BS.s.res}:null'); if (b) { started = 1; if (b.ph >= 2) ph2 = 1; maxSh = Math.max(maxSh, b.sh); if (b.res && !res) { res = b.res; globalThis.__recD = g.eval('HYR[2].d') } } if (g.eval('__bh') && !b && started) break }
  ok(started && ph2, '巨大スロットが出ない');
  ok(maxSh > 0 && maxSh <= 48, '破片の数: ' + maxSh);
  ok(res === 'win', '当たりで巨大スロットが揃わない: ' + res);
  ok(g.eval('__bh') === 1 && g.eval('__f[0]===__f[1]&&__f[1]===__f[2]'), '巨大スロットで当否/図柄が変わった');
  ok(g.eval('!BS.s') && !/hybs/.test(g.eval('$("slot").className')), '巨大スロットが残る/小さいスロットが戻らない');
  ok(globalThis.__recD === g.eval('__f[2]'), '巨大リールの記録が本物と違う');   // 揃った瞬間の記録で比べる(その後の次の回転で上書きされるため)
  console.log('巨大スロット: OK');
}

// (c) 超必殺技: 成功/不発で JACKPOT の報酬が同じ / 従来の jackpot() と同額
{
  const run = (force) => {
    const g = createGame({ seed: 9 }); g.start(); g.advance(1);
    g.eval(`${idle}G.stage=20;spawn();G.pool=1234;var __jp=0,__jg=0;(function(){const o=jackpot;jackpot=function(){__jp++;const g0=G.gold,st=G.stage,pl=G.pool;const r=o.apply(this,arguments);__jg=(G.gold-g0)/Math.max(1,st*500*mul()+pl);return r}})();`);
    if (force === 'plain') g.eval('HEV.jv=0;'); else g.eval(`UJ.force=${force};UJ.hero=${force};`);
    g.eval('HEV.force="jp";bigHit(true)');   // 押せ!! の前に所持金を0に(比較は JACKPOT 分だけ)
    let seen = 0, txt = 0;
    for (let i = 0; i < 160; i++) { g.advance(.05); if (g.eval('!!UJ.s')) { seen = 1; if (g.eval('lyBig()&&lyBusyB()')) txt = 1 } }
    return { g, seen, txt, jp: g.eval('__jp'), gold: g.eval('__jg'), left: g.eval('!!UJ.s') };
  };
  const a = run(0), b = run(1), c = run('plain');
  ok(a.seen && b.seen && !c.seen, '超必殺技の起動: ' + [a.seen, b.seen, c.seen]);
  ok(a.txt && b.txt, '89c の主役判定(lyBig/lyBusyB)に入っていない');
  ok(a.jp === 1 && b.jp === 1 && c.jp === 1, 'jackpot() の回数: ' + [a.jp, b.jp, c.jp]);
  ok(!a.left && !b.left, '超必殺技が終わらない');
  // JACKPOT の獲得額 / (POOL + STAGE x500 x 倍率) が3通りとも同じ(=1。jackpot() の中身は変えていない)
  ok(Math.abs(a.gold - 1) < 1e-9 && Math.abs(b.gold - 1) < 1e-9 && Math.abs(c.gold - 1) < 1e-9, `JACKPOT の報酬比: 成功${a.gold} 不発${b.gold} 従来${c.gold}`);
  ok(a.g.eval('UJ.nf') === 0 && b.g.eval('UJ.nf') === 1, '不発の記録');
  console.log(`超必殺技: 報酬比 成功${a.gold} 不発${b.gold} 従来${c.gold} OK`);
}

// (d) 転生(presAbort)で何も残らない
{
  const g = createGame({ seed: 12 }); g.start(); g.advance(1);
  g.eval(`${idle}UJ.force=0;HEV.force="jp";bigHit(true)`); g.advance(4.2);
  ok(g.eval('!!UJ.s'), '(準備)超必殺技が出ていない');
  g.eval('var __jp=0;(function(){const o=jackpot;jackpot=function(){__jp++;return o.apply(this,arguments)}})();presAbort()'); g.advance(.5);
  ok(g.eval('!UJ.s&&__jp===0'), '転生後に超必殺技/JACKPOT が残る');
  g.eval(`${idle}BK.force=1;BS.force=1;G.q=1;QL.length=0;QL.push({h:1,c:0});startSpin();sp.pzN=0;sp.rv=0;sp.type=2;`); g.advance(2.6);
  ok(g.eval('!!BS.s'), '(準備)巨大スロットが出ていない');
  g.eval('presAbort()'); g.advance(.3);
  ok(g.eval('!BK.s&&!BS.s'), '転生後に暗転/巨大スロットが残る');
  ok(!/hybs/.test(g.eval('$("slot").className')), '転生後もリールが隠れたまま');
  console.log('転生: OK');
}

// (e) 長時間: 当否と大当たり回数が一致 / 各演出が自然発生 / 配列上限
{
  const g = createGame({ seed: 7 }); g.start();
  g.eval(`var __st={hitSpin:0,bh:0};(function(){const s0=startSpin;startSpin=function(){const w=sp,r=s0.apply(this,arguments);if(!w&&sp&&sp.hit)__st.hitSpin++;return r};const b0=bigHit;bigHit=function(){__st.bh++;return b0.apply(this,arguments)}})();UJ.p=.6`);
  let maxSh = 0, maxPP = 0;
  for (let s = 0; s < 30 * 60; s++) {
    g.advance(1);
    if (s % 30 === 0) g.eval('G.gold=Math.max(G.gold,1e6);for(let i=0;i<UP.length;i++)buy(i)');
    maxSh = Math.max(maxSh, g.eval('BS.s?BS.s.sh.length:0')); maxPP = Math.max(maxPP, g.eval('UJ.pp.length'));
    const st = g.eval('({PT:PT.length,F:F.length})'); if (st.PT > 1500 || st.F > 150) { ok(0, '配列上限 ' + JSON.stringify(st)); break }
  }
  const st = g.eval('__st'), pend = g.eval('sp&&sp.hit?1:0');
  ok(st.bh === st.hitSpin - pend, `当否と大当たり回数が不一致: ${st.hitSpin} vs ${st.bh}`);
  const n = g.eval('({bk:BK.n,bs:BS.n,uj:UJ.n})');
  ok(n.bk > 0, '暗転が自然発生しない'); ok(n.bs > 0, '巨大スロットが自然発生しない');
  ok(maxSh <= 48 && maxPP <= 40, '演出の配列上限: ' + maxSh + '/' + maxPP);
  ok(g.eval('isFinite(G.gold)&&isFinite(G.stage)'), 'NaN');
  console.log(`30分: 当たり${st.bh} 暗転${n.bk} 巨大スロット${n.bs} 超必殺技${n.uj}`);
}

// (f) ボタン: 押せ!! の衝撃波クラス / チャンスボタンの残像
{
  const g = createGame({ seed: 2 }); g.start(); g.advance(1);
  g.eval(`${idle}pushPrompt(()=>{},{ms:2400});`);
  g.eval('pushPress(0)');
  ok(/hyw/.test(g.eval('$("push").className')), '押せ!! の衝撃波クラスが付かない');
  g.advance(1);
  ok(g.eval('!PUSH'), '押せ!! が終わらない');
  g.eval(`${idle}G.q=1;QL.length=0;QL.push({h:1,c:0});startSpin();sp.pzN=0;sp.type=2;sp.stop[2]=7.5;`); g.advance(3);
  ok(g.eval('!!(ACT.cb&&!ACT.cb.done)'), '(準備)チャンスボタンが出ない');
  g.eval('cbPress()');
  ok(g.eval('!!HBG&&/go hy(hot|mid|low)/.test(HBG.className)'), 'チャンスボタンの残像が出ない: ' + g.eval('HBG&&HBG.className'));
  g.advance(1.2);
  ok(g.eval('HBG.className===""'), 'チャンスボタンの残像が消えない');
  console.log('ボタン: OK');
}

if (bad) { console.error(`\n${bad} failure(s)`); process.exit(1); }
console.log('\nHYPE OK');
