// 激アツ演出パック(86-gekiatsu)のテスト: 擬似連/復活/RUSHリザルトが発生し、当否を一切変えないこと
// 実行: node tests/gekiatsu.js
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };

// (a) 強制ケース: 当たり保留1個に 擬似連×3 + 復活 を仕込み、最後は必ず当たり目で bigHit されること
{
  const g = createGame({ seed: 11 }); g.start(); g.advance(1);
  g.eval(`var __bh=0;(function(){const o=bigHit;bigHit=function(){__bh++;return o.apply(this,arguments)}})();
    G.rush=0;G.roul=0;G.jp=0;sp=null;cut=null;PUSH=null;G.q=1;QL.length=0;QL.push({h:1,c:0});startSpin();sp.pzN=2;sp.pzI=0;sp.rv=1;sp.type=1;sp.jp=false;var __f=sp.f.slice();`);
  const seen = { pz: 0, rv: 0, hz: 0, fk: 0 };
  for (let i = 0; i < 300 && !g.eval('__bh'); i++) {
    g.advance(.05);
    const s = g.eval('sp?{i:sp.pzI,rv:sp.rv||0,msg:$("msg").textContent,c2:UX.cur[2]}:null');
    if (!s) continue;
    if (s.i > seen.pz) seen.pz = s.i;
    if (s.rv === 2) { seen.rv = 1; if (/はずれ/.test(s.msg)) seen.hz = 1 }
  }
  ok(seen.pz === 2, '擬似連が2回(×2,×3)進まない: ' + seen.pz);
  ok(seen.rv && seen.hz, '復活の「はずれ…」段階が無い');
  ok(g.eval('__bh') === 1, '復活後に bigHit が1回呼ばれない: ' + g.eval('__bh'));
  ok(g.eval('__f[0]===__f[1]&&__f[1]===__f[2]'), '当たり図柄が揃っていない');
  console.log('強制ケース(擬似連×3+復活): OK');
}

// (b) 長時間: 回転開始時の当否と bigHit の回数が一致(演出で当否が変わらない) / 各演出が自然発生する / リザルト表示と最高記録
{
  const g = createGame({ seed: 5 }); g.start();
  g.eval(`var __st={spin:0,hitSpin:0,bh:0,pz:0,rv:0,rr:0,maxN:0};
    (function(){const s0=startSpin;startSpin=function(){const w=sp,r=s0.apply(this,arguments);if(!w&&sp){__st.spin++;if(sp.hit)__st.hitSpin++;if(sp.pzN>0)__st.pz++;if(sp.rv)__st.rv++}return r};
      const b0=bigHit;bigHit=function(){__st.bh++;return b0.apply(this,arguments)}})()`);
  let lastRR = null;
  for (let s = 0; s < 25 * 60; s++) {
    g.advance(1);
    const r = g.eval('GK.rr?GK.rr.t0+"|"+GK.rr.n+"|"+GK.rr.g:null');
    if (r && r !== lastRR) { lastRR = r; g.eval('__st.rr++;__st.maxN=Math.max(__st.maxN,GK.rr.n)'); const p = r.split('|'); ok(+p[1] >= 1 && isFinite(+p[2]) && +p[2] >= 0, 'リザルトの値が不正: ' + r); ok(['C', 'C+', 'B', 'B+', 'A', 'A+', 'S', 'S+'].includes(g.eval('GK.rr.gr')) && g.eval('GK.rr.sc') >= 12, 'ランク評価: ' + g.eval('GK.rr.gr')) }
  }
  const st = g.eval('__st'), pend = g.eval('sp&&sp.hit?1:0');
  ok(st.bh === st.hitSpin - pend, `当否と大当たり回数が不一致: hitSpin=${st.hitSpin} bigHit=${st.bh} pending=${pend}`);
  ok(st.pz > 0, '擬似連が自然発生しない');
  ok(st.rv > 0, '復活演出が自然発生しない');
  ok(st.rr > 0, 'RUSHリザルトが出ない');
  const best = g.eval('GK.best'), saved = g.eval(`(JSON.parse(localStorage.getItem('pachi2_gk')||'{}').best)||0`);
  ok(best === saved && (st.maxN < 2 || best >= 2), `最高記録の保存: best=${best} saved=${saved} maxN=${st.maxN}`);
  ok(g.eval('isFinite(G.gold)&&isFinite(G.stage)'), 'NaN');
  console.log(`25分: 回転${st.spin} 当たり${st.bh} 擬似連${st.pz} 復活${st.rv} リザルト${st.rr} 最高${best}連`);
}

// (c) 旧セーブとの共存: pachi2 を壊さない / pachi2_gk が壊れていても落ちない
{
  const g = createGame({ seed: 2, storage: { pachi2_gk: '{broken', pachi2: JSON.stringify({ v: 2, gold: 123, stage: 4, lv: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }) } });
  g.start(); g.advance(5);
  ok(g.eval('GK.best') === 0, '壊れた pachi2_gk で best が0にならない');
  ok(g.eval('G.stage') >= 4, '旧セーブのステージが読めていない');
}

// (d) 保留変化: 隠れた保留は消化時に必ず本来の色(予告レベル)に戻り、途中で1段ずつ上がる
{
  const g = createGame({ seed: 9 }); g.start(); g.advance(1);
  g.eval(`var __yk=[];(function(){const s0=startSpin;startSpin=function(){const q=QL[0],w=sp,r=s0.apply(this,arguments);if(!w&&sp&&q)__yk.push([q.t==null?q.c:q.t,sp.yk]);return r}})()`);
  let ups = 0;
  g.eval(`(function(){const o=hryUp;hryUp=function(){__ups=(typeof __ups=='number'?__ups:0)+1;return o.apply(this,arguments)}})()`);
  g.advance(15 * 60);
  const yk = g.eval('__yk'); ups = g.eval("typeof __ups=='number'?__ups:0");
  ok(yk.length > 50 && yk.every(([t, y]) => t === y), '保留変化で予告レベルが変わった: ' + JSON.stringify(yk.filter(([t, y]) => t !== y).slice(0, 5)));
  ok(ups > 0, '保留変化が発生しない');
  ok(g.eval('QL.every(q=>q.c<=4&&(q.t==null||q.c<=q.t))'), '保留の色が本来より上がっている');
  console.log(`保留変化: 15分で ${ups} 回 / 消化 ${yk.length} 個すべて本来の予告レベル`);
}

if (bad) { console.error(bad + ' failure(s)'); process.exit(1) }
console.log('GEKIATSU OK');
