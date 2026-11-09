// QA(組み合わせ)の再発防止:
//  1) 転生直後に「前の周回の収入平均 X.gps」で実績報酬/オフライン収入が計算され、リセットしたはずのゴールドが
//     前の周回の数十秒分(実測: STAGE 31 の転生で 8.9億G、転生前の所持より多い)戻ってくる → 転生で X.gps を測り直す
//  2) ボーナスタイム中に 大当たり/JACKPOT/押せ!!/ミニゲーム/ハイ&ロー が重なってから転生しても、
//     待ち行列(バナー/ミニゲーム)や演出の状態が新しい周回に残らない・例外が出ない
//  3) 強化シートを開いている間はチャンスボタン(#gkcb)をかくす CSS が入っている
const fs = require('fs'), path = require('path');
const { createGame } = require('../tools/harness');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.error('FAIL: ' + m) } };
const fresh = seed => { const g = createGame({ seed }); g.start(); g.advance(1); g.eval('if(fxOpen)fxClose();DLY.shown=1'); return g };

// 1) 転生で収入平均がリセットされ、実績報酬が新しい周回の基準になる
{
  const g = fresh(301);
  g.eval('G.stage=60;X.best=60;spawn();X.gps=5e7;delete X.ach.pr1;X.pres=0');
  const gn = g.eval('presAsk();presDo()');
  ok(gn > 0, '転生できない');
  ok(g.eval('X.gps') === 0, '転生後も X.gps が前の周回のまま: ' + g.eval('X.gps'));
  const gold = g.eval('G.gold');
  ok(gold < 1e6, '転生直後のゴールドが前の周回の収入基準で多すぎる: ' + gold);
  ok(g.eval('offRate()') < 1e5, '転生直後のオフライン収入の基準が前の周回のまま: ' + g.eval('offRate()'));
  // その後の収入で測り直される
  g.advance(30);
  ok(g.eval('X.gps') > 0 && g.eval('X.gps') < 1e7, '転生後に X.gps が測り直されない: ' + g.eval('X.gps'));
}

// 2) ボーナスタイム x 演出の重なり x 転生
const SC = [
  ['BT+JACKPOT押せ!!', 'btStart(0);HEV.force="jp";bigHit(true)', 2],
  ['BT+JACKPOT中のミニゲーム予約', 'btStart(1);HEV.jv=0;HEV.force="jp";bigHit(true)', 4.5, 'mini();banner("ふつう","#fff")'],
  ['BT+ルーレット押せ!!', 'btStart(2);HEV.force="roul";bigHit(false)', 1.6, 'mini();banner("ふつう","#fff")'],
  ['BT+全画面ルーレット', 'btStart(0);HEV.force="roul";bigHit(false)', 5],
  ['BT+ハイ&ロー', 'btStart(1);mg2Start("hilo")', 1, 'mini()'],
  ['BT+宝箱くじ', 'btStart(2);mg2Start("chest")', .5],
];
SC.forEach(([name, code, wait, extra], i) => {
  const g = fresh(320 + i);
  g.eval('G.stage=60;X.best=60;spawn()');
  g.eval(code); g.advance(wait); if (extra) g.eval(extra);
  const f0 = g.eval('FERR');
  g.eval('presAsk()'); g.eval('FB[0][1]()');
  ok(g.eval('G.stage') === 1, name + ': 転生できない');
  ok(g.eval('!!BT.cur'), name + ': ボーナスタイムは転生しても続く仕様');
  ok(!g.eval('presBusy()'), name + ': 演出が残る');
  ok(g.eval('LY.miniQ') === 0 || g.eval('LY.miniG') !== g.eval('PGEN'), name + ': ミニゲーム待ちが新しい周回に残る');
  ok(g.eval('LY.bnQ.every(b=>b.g===PGEN)'), name + ': 古い周回のバナーが待ち行列に残る');
  g.eval('__m=0;{const o=mini;mini=function(){__m++;return o.apply(this,arguments)}}');
  g.eval('G.q=0;QL.length=0;hitRoll=()=>0');
  g.advance(10);
  ok(g.eval('__m') === 0, name + ': 転生後に前の周回のミニゲームが始まった');
  ok(g.eval('!HL&&!MG&&!MG2'), name + ': 転生後にミニゲームが残る');
  ok(g.eval('typeof bgmState==="function"?/^bt/.test(bgmState())||!BT.cur:true'), name + ': ボーナスタイム中なのにボーナス曲に戻らない ' + g.eval('bgmState()'));
  ok(g.eval('FERR') === f0, name + ': 例外 FERR=' + g.eval('FERR'));
  const s = g.eval('JSON.stringify([G.gold,G.stage,G.hp,G.mx])'); ok(!/null|NaN/.test(s), name + ': NaN ' + s);
});

// 3) CSS
{
  const css = fs.readdirSync(path.join(__dirname, '../src/css')).map(f => fs.readFileSync(path.join(__dirname, '../src/css', f), 'utf8')).join('\n');
  ok(/#app\.upo\)\s*#gkcb\s*\{[^}]*display:\s*none/.test(css), '強化シート中にチャンスボタンをかくす CSS が無い');
}

if (bad) { console.error('qa-combo: ' + bad + ' 件失敗'); process.exit(1) }
console.log('qa-combo: OK');
