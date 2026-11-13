/* ---------- 演出の動きの設定 (ui) ----------
   作り手の指摘「ボタン演出も転生演出も静止画みたいで動かない」→ 原因: 端末の「動きを減らす(視差効果を減らす/アニメーション効果オフ)」が ON だと、
   CSS の @media (prefers-reduced-motion) で演出の動きを全部止めていた。動きを止めるかどうかは端末まかせにせず、ゲームの設定で決める:
     設定「演出の動き」= ふつう(既定。端末の設定に関係なく動く)/ ひかえめ(動きを止める。今までの「動きを減らす」と同じ見た目)
   仕組み: 読み込まれたスタイルの @media (prefers-reduced-motion…) を探し、ふつう=無効('not all')・ひかえめ=常に有効('all')に書き換える。
   光の点滅は別(設定「フラッシュ」。動きを減らす端末では初期値 OFF のまま=光過敏性への配慮は変えない)。
   `moLow()` = ひかえめ か(JS で動かす演出が見る)。保存 localStorage['pachi2_motion']={low:0|1}。 */
const MO={low:0,rules:null};
try{const d=JSON.parse(localStorage.getItem('pachi2_motion')||'{}');MO.low=d&&d.low?1:0}catch(e){}
function moLow(){return !!MO.low}
function moApply(){try{if(!MO.rules){MO.rules=[];const walk=L=>{for(const r of L){try{if(r.media&&/prefers-reduced-motion/.test(r.media.mediaText||r.conditionText||''))MO.rules.push(r);else if(r.cssRules)walk(r.cssRules)}catch(e){}}};
    for(const s of document.styleSheets){try{walk(s.cssRules)}catch(e){}}}
  for(const r of MO.rules){try{r.media.mediaText=MO.low?'all':'not all'}catch(e){}}
  try{document.body.classList[MO.low?'add':'remove']('molow')}catch(e){}}catch(e){}}
function moSet(v){MO.low=v?1:0;try{localStorage.setItem('pachi2_motion',JSON.stringify({low:MO.low}))}catch(e){}moApply();moPaint()}
function moPaint(){try{const a=$('cfgM0'),b=$('cfgM1');if(a&&a.classList){a.classList[MO.low?'remove':'add']('on');b.classList[MO.low?'add':'remove']('on')}}catch(e){}}
/* 設定パネルに1行足す(フラッシュの説明のすぐ下) */
try{const cf=$('cfgF2'),row0=cf&&cf.parentNode&&cf.parentNode.parentNode,note=row0&&row0.nextElementSibling;
  if(row0&&row0.parentNode){const r=document.createElement('div');r.className='row';r.innerHTML='<span>演出の動き</span><div class="seg"><button id="cfgM0" class="bv" type="button">ふつう</button><button id="cfgM1" class="bv" type="button">ひかえめ</button></div>';
    const n=document.createElement('div');n.className='note';n.textContent='ひかえめ: ボタンや演出の動きを止める(動きで酔いやすい方向け)';
    const at=(note&&note.nextSibling)||null;row0.parentNode.insertBefore(r,at);row0.parentNode.insertBefore(n,at);
    $('cfgM0').onclick=()=>moSet(0);$('cfgM1').onclick=()=>moSet(1)}}catch(e){}
moApply();moPaint();
