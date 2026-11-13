/* ---------- 押せ!!ボタンを「脳汁」仕様に (fx/sound) ----------
   作り手の指摘「ボタン演出のボタンがほかの演出と比べてインパクトが薄く味気ない」:
   ・熱さの段階(heat)でボタンが光る: 1=赤(通常) 2=金(チャンス) 3=虹(激アツ/確定)。777(JACKPOT)は必ず 3。
     ルーレット行きは 87-hitev が超倍率を先に抽選し、当たりなら 虹60%/金40%、外れなら 赤80%/金20% で色を渡す(=信頼度。確率自体は不変)。
   ・短い登場アニメ: 上から叩きつけ(0.35秒)→衝撃の輪→待機は熱さ色のオーラが脈打つ(約1.2Hz、ボタンの形の中だけ)。
   ・押した瞬間: 光の放射と、熱さに応じた文字(チャンス!/激アツ!!/確定!!)を一瞬重ねる。
   ・SE を厚く: 登場=低音のドン+ノイズの打撃+熱さ別の和音、押下=サブベースの落下+打撃+和音の積み上げ(虹は上昇キュイーンとベル)。
   光過敏配慮: 全画面の点滅は足さない(ボタン周りだけ、明暗の明滅でなく色相の回転とゆっくりした脈動)。reduced-motion では動きを止める。 */
const PHY={h:0};
const phOf=o=>{o=o||{};return o.jp?3:Math.max(1,Math.min(3,o.heat|0||1))};
function phSnd(k,h){try{if(typeof sOK!=='function'||!sOK())return;const t=sNow(),r=fanRoot();
  /* 音程は BGM の調から(以前は固定の和音で、BGM とぶつかることがあった)。押下の土台(ドン・振動・和音)は 79 の seDecide、ここは熱さの上乗せだけ */
  if(k==='in'){
    sBoom(t,.5+h*.35);noise(t,.06,.08,'h');                                     // ドン(熱さで強く)
    const ch=h>=3?[0,4,7,12,16]:h==2?[0,4,7,12]:[0,4,7];
    ch.forEach((s2,i)=>{tone(mf(r+12+s2),t+.04+i*.035,.32,'p25',.03);tone(mf(r+s2),t+.04+i*.035,.28,'triangle',.022)});
    if(h>=2)sFat(mf(r-12),t+.05,.45,.03,mf(r+12),1);                            // 金: うなりが上がる
    if(h>=3)[24,28,31].forEach((s2,i)=>sBell(mf(r+s2),t+.3+i*.06,.025,.4));      // 虹: 鐘
  }else if(k==='hit'){
    if(h>=2){sCrash(t,.05,.5);sFat(mf(r),t+.04,.55,.035,mf(r+24),1)}           // 金・虹: クラッシュ+駆け上がり
    if(h>=3){sBoom(t+.09,1.4);[24,28,31,36].forEach((s2,i)=>sBell(mf(r+s2),t+.36+i*.07,.026,.45));noise(t+.3,.05,.5,'h')}   // 虹: 2回目の衝撃「ドドン」+鐘
  }}catch(e){}}
function phCls(el,add,rm){try{let c=String(el.className||'').split(' ').filter(x=>x&&!rm.test(x));el.className=c.concat(add).join(' ')}catch(e){}}
{const o=pushPrompt;pushPrompt=function(cb,opt){const was=PUSH,r=o.apply(this,arguments);
  try{if(!was&&PUSH){const h=phOf(opt);PHY.h=h;PUSH.heat=h;const el=$('push');if(el){phCls(el,['ph'+h,'phin'],/^ph/);presLater(()=>{try{if(PUSH)phCls(el,[],/^phin$/)}catch(e){}},380)}phSnd('in',h)}}catch(e){}return r}}
{const o=pushPress;pushPress=function(auto){const P0=PUSH,ok=P0&&!P0.done,h=P0&&P0.heat||PHY.h||1,r=o.apply(this,arguments);
  try{if(ok){phSnd('hit',h);const el=$('push');if(el)phCls(el,['phhit'],/^phhit$/);
    const tx=$('pkT');if(tx&&!(P0&&P0.small))tx.textContent=h>=3?'確定!!':h==2?'激アツ!!':'GO!!';
    if(h>=2&&typeof burst==='function')burst(262,80,h>=3?70:40,h>=3?'#fff':'#ffd400')}}catch(e){}return r}}
