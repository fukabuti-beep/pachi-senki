/* ---------- ルーレットの画面占有を短く (feature/fx) ----------
   作り手の指摘「ボタン演出からのルーレットタイムで画面占有され過ぎるとフラストレーションが溜まる」。
   当否・倍率・報酬は 60-roulette のまま(updRoul に渡す時間の進み方だけ変える):
   ・回転 4.6秒→約3.1秒、結果表示 1.8秒→約1.2秒、超倍率の溜め 4.4秒→約3.4秒
   ・ルーレット(.rb)をタップすると早送り(回転はすぐ止まり、結果もすぐ閉じる)
   ・背景の暗幕を薄くして戦闘画面が透けて見えるように(css/41-roulquick.css) */
const RQ={ff:0};
{const o=updRoul;updRoul=function(dt){try{if(RL){const k=RQ.ff?6:RL.ph===0?1.48:RL.hold?1.3:1.5;return o.call(this,dt*k)}}catch(e){}RQ.ff=0;return o.apply(this,arguments)}}
{const o=startRoul;startRoul=function(){RQ.ff=0;return o.apply(this,arguments)}}
/* タップで早送り(暗幕自体は pointer-events:none のまま=盤面への操作は通す。ルーレットの枠だけタップを受ける) */
try{const rl=$('rl'),rb=rl&&rl.querySelector?rl.querySelector('.rb'):null;
  if(rb&&rb.addEventListener)rb.addEventListener('pointerdown',e=>{if(RL){RQ.ff=1;try{e.stopPropagation()}catch(x){}}})}catch(e){}
