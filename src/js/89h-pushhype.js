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
function phSnd(k,h){try{if(typeof sOK!=='function'||!sOK())return;const t=sNow();
  if(k==='in'){
    tone(90,t,.32,'sine',.11,38);noise(t,.12,.18,'l');noise(t,.06,.08,'h');                  // ドン+打撃
    const ch=h>=3?[523,659,784,1047,1319]:h==2?[440,554,659,880]:[392,494,587];
    ch.forEach((f,i)=>{tone(f,t+.04+i*.03,.34,'square',.03);tone(f*2,t+.04+i*.03,.2,'triangle',.018)});
    if(h>=3){tone(220,t+.05,.7,'sawtooth',.035,1760);[1568,2093,2637].forEach((f,i)=>tone(f,t+.3+i*.06,.25,'triangle',.025))}
    else if(h==2)tone(330,t+.05,.45,'sawtooth',.03,1320);
  }else if(k==='hit'){
    tone(120,t,.5,'sine',.13,30);tone(60,t,.6,'sawtooth',.06,28);noise(t,.16,.35,'l');noise(t+.02,.08,.18,'h');   // 落下+打撃
    const base=h>=3?[523,659,784,1047,1319,1568]:h==2?[440,554,659,880,1109]:[392,494,587,784];
    base.forEach((f,i)=>{tone(f,t+.06+i*.045,.42,'square',.032);tone(f/2,t+.06+i*.045,.42,'sawtooth',.016)});
    if(h>=2)tone(330,t+.04,.6,'sawtooth',.04,h>=3?2637:1760);                                // 上昇キュイーン
    if(h>=3){[2093,2637,3136,4186].forEach((f,i)=>tone(f,t+.36+i*.07,.3,'triangle',.028));noise(t+.3,.05,.5,'h')}
  }}catch(e){}}
function phCls(el,add,rm){try{let c=String(el.className||'').split(' ').filter(x=>x&&!rm.test(x));el.className=c.concat(add).join(' ')}catch(e){}}
{const o=pushPrompt;pushPrompt=function(cb,opt){const was=PUSH,r=o.apply(this,arguments);
  try{if(!was&&PUSH){const h=phOf(opt);PHY.h=h;PUSH.heat=h;const el=$('push');if(el){phCls(el,['ph'+h,'phin'],/^ph/);presLater(()=>{try{if(PUSH)phCls(el,[],/^phin$/)}catch(e){}},380)}phSnd('in',h)}}catch(e){}return r}}
{const o=pushPress;pushPress=function(auto){const P0=PUSH,ok=P0&&!P0.done,h=P0&&P0.heat||PHY.h||1,r=o.apply(this,arguments);
  try{if(ok){phSnd('hit',h);const el=$('push');if(el)phCls(el,['phhit'],/^phhit$/);
    const tx=$('pkT');if(tx&&!(P0&&P0.small))tx.textContent=h>=3?'確定!!':h==2?'激アツ!!':'GO!!';
    if(h>=2&&typeof burst==='function')burst(262,80,h>=3?70:40,h>=3?'#fff':'#ffd400')}}catch(e){}return r}}
