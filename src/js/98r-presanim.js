/* ---------- 転生の演出 (fx) ----------
   作り手の指摘「転生するボタンを押したら間が無く即開始」→ 確認画面の「転生する!」で、約3秒の演出を流してから転生する。
   ① 魂の光が中央に集まる(1.5秒、「魂が集まっていく…」と もらえる魂の数) → ② 白い光がふくらんで 転生(presDo はこの瞬間) → ③「転生!!」と新しい旅の案内 → 消える。
   全画面の点滅はしない(光は1回ふくらむだけ)。動きを減らす設定ではフェードのみ。テスト/sim(harness の PACHI_NOPAUSE)では待たずに転生する。
   94-prestige の presAsk のボタンが presAnim を呼ぶ(1行フック)。presDo を直接呼ぶ所(自動テストなど)は今までどおり即時。 */
const PRA={on:0};
const praE=(()=>{try{return fxEl('div','prx','','')}catch(e){return null}})();
function presAnim(){
  let off=false;try{off=!!window.PACHI_NOPAUSE}catch(e){}
  if(off||!praE||PRA.on)return presDo();
  let gn=0;try{gn=presGainShow(G.stage)}catch(e){}
  if(soulGain(G.stage)<1)return presDo();
  try{fxClose()}catch(e){}
  PRA.on=1;let d='';for(let i=0;i<14;i++)d+='<s style="--a:'+(i*25.7).toFixed(0)+'deg;--d:'+(i%5*.12).toFixed(2)+'s"></s>';
  praE.innerHTML='<div class="prl"></div>'+d+'<div class="prt"><small>魂が 集まっていく…</small><b>魂 +'+gn+'</b></div>';
  praE.className='on';
  try{if(typeof sOK==='function'&&sOK()){const t=sNow();for(let i=0;i<10;i++)tone(220*Math.pow(1.122,i),t+i*.14,.16,'triangle',.04);tone(55,t,1.5,'sawtooth',.03,110)}}catch(e){}
  setTimeout(()=>{let st=1;try{presDo();st=G.stage}catch(e){}
    try{praE.className='on p2';praE.querySelector('.prt').innerHTML='<b class="big">転生!!</b><small>STAGE '+st+' から 新しい旅へ</small>'}catch(e){}},1500);
  setTimeout(()=>{try{praE.className='';praE.innerHTML=''}catch(e){}PRA.on=0},3100)}
