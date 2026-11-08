/* ---------- バナー文字の強化 (fx) ----------
   banner(t,c) をラップして、CSS(30-banner.css)用に data-t(背面レイヤーの文字) / --c(色) / .rb(熱い文言は虹色) を付けるだけ。 */
const BN_HOT=/激アツ|JACKPOT|超倍率|確定|LEGEND|RECORD|777|EXCELLENT/;
{const _bn=banner;banner=function(t,c){const r=_bn.apply(this,arguments);try{const b=$('bn');t=String(t);
  if(b.dataset)b.dataset.t=t;else b.setAttribute('data-t',t);if(b.style&&b.style.setProperty)b.style.setProperty('--c',c||'#ffd400');
  if(BN_HOT.test(t))b.className+=' bhot'}catch(e){}return r}}
