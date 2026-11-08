// アクティブ要素+演出パック(98b-active): タップ攻撃 / お宝ターゲット / ボス演出 / チャンスボタン / 節目の紙吹雪
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
{
  const g = createGame({ seed: 4 }); g.start(); g.advance(1);
  const tap = () => g.eval("$('b')._ev.pointerdown({clientX:270,clientY:80})");
  g.eval('G.hp=G.mx=1e12'); const h0 = g.eval('G.hp');
  for (let i = 0; i < 31; i++) { tap(); g.advance(.1) }
  ok(g.eval('G.hp') < h0, 'タップでダメージが入らない');
  ok(g.eval('ACT.tc') >= 30, 'タップコンボが数えられない: ' + g.eval('ACT.tc'));
  ok(g.eval('ACT.sp.length') <= 16, 'タップ火花の上限超過');
  // お宝: 出現 → タップで捕獲 → 報酬
  g.eval('ACT.next=0;ACT.tg=null'); g.advance(.2);
  ok(g.eval('!!ACT.tg'), 'お宝ターゲットが出ない');
  const gold0 = g.eval('G.gold'), sp0 = g.eval('G.sp'), fv0 = g.eval('G.fv');
  g.eval('ACT.tg.x=200;ACT.tg.y=40'); g.eval("$('b')._ev.pointerdown({clientX:200,clientY:40*400/150})");
  // harness の getBoundingClientRect は 360x400 なので y を換算
  ok(g.eval('!!(ACT.tg&&ACT.tg.got)'), 'タップで捕獲できない');
  ok(g.eval('G.gold') > gold0 || g.eval('G.sp') > sp0 || g.eval('G.fv') > fv0, '捕獲の報酬が無い');
  g.advance(2); ok(g.eval('!ACT.tg'), '捕獲後に消えない');
  // 逃げる
  g.eval('ACT.next=0'); g.advance(.2); g.advance(8); ok(g.eval('!ACT.tg'), 'ターゲットが逃げずに残る');
  // ボス: WARNING / FINISH / 節目
  g.eval('G.stage=4;G.hp=1;hurt(10,"#fff")'); g.advance(.1); ok(g.eval('!!ACT.warn'), 'ボス出現で WARNING が出ない');
  g.eval('G.hp=1;hurt(10,"#fff")'); g.advance(.1); ok(g.eval('!!ACT.fin'), 'ボス撃破で FINISH が出ない');
  g.eval('G.stage=10;spawn();G.hp=1;hurt(10,"#fff")'); g.advance(2); ok(g.eval('CF.length') > 0 && g.eval('CF.length') <= 80, '節目の紙吹雪: ' + g.eval('CF.length'));
  g.advance(6); ok(g.eval('CF.length') === 0, '紙吹雪が残る');
}
// チャンスボタン: SUPERリーチ中に出て、押しても当否・図柄は変わらない
for (const hit of [1, 0]) {
  const g = createGame({ seed: 6 }); g.start(); g.advance(1);
  g.eval(`var __bh=0;(function(){const o=bigHit;bigHit=function(){__bh++;return o.apply(this,arguments)}})();
    G.rush=0;G.roul=0;G.jp=0;sp=null;cut=null;PUSH=null;G.q=1;QL.length=0;QL.push({h:${hit},c:0});startSpin();sp.pzN=0;sp.rv=0;sp.type=2;sp.stop=[1,1.9,7.5];var __s=sp,__f=sp.f.slice();`);
  g.advance(3); ok(g.eval("cbtn.style.display") === 'flex', 'チャンスボタンが出ない(hit=' + hit + ')');
  g.eval("cbtn.onpointerdown()"); ok(g.eval("cbtn.style.display") === 'none', '押した後にボタンが消えない');
  ok(g.eval('!!__s.hit') === !!hit && g.eval('JSON.stringify(__s.f)===JSON.stringify(__f)'), 'ボタンで当否/図柄が変わった');
  g.eval('G.q=0;QL.length=0'); g.advance(6);
  ok(g.eval('__bh') === hit, `bigHit 回数が当否と一致しない hit=${hit} bh=${g.eval('__bh')}`);
}
// キャラクター演出(84-charfx): カットイン3種とも cb が1回呼ばれて終わる / ジャンプ量が有限 / 吹き出しの上限
{
  const g = createGame({ seed: 8 }); g.start(); g.advance(1);
  for (const v of [0, 1, 2]) {
    g.eval(`var __cb=0;cutin(1,'大当たり!!','#ff2d7a',()=>{__cb++});cut.v=${v}`); g.advance(1.3);
    ok(g.eval('__cb') === 1 && g.eval('!cut'), 'カットイン v' + v + ' の終了/cb: ' + g.eval('__cb'));
  }
  g.eval("chJumpAll(2);for(let i=0;i<10;i++)chSayAll('win')"); g.advance(.5);
  ok([0, 1, 2].every(i => Number.isFinite(g.eval('heroDY(' + i + ',T)'))) && g.eval('heroDY(0,T)') <= 0, 'heroDY');
  ok(g.eval('CHR.sb.length') <= 4, '吹き出しの上限: ' + g.eval('CHR.sb.length'));
  g.advance(3); ok(g.eval('CHR.sb.length') === 0 && g.eval('CHR.j.every(j=>!j)'), '吹き出し/ジャンプが残る');
}
if (bad) { console.error(bad + ' failure(s)'); process.exit(1) }
console.log('ACTIVE OK');
