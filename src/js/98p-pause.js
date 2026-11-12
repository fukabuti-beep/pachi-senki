/* ---------- 物語・ガイド・エンディングの間はゲームを止める (feature) ----------
   作り手の方針「ゲームはゲーム、ストーリーはストーリーとして見られるように」。
   会話シーン(98s)・チュートリアルの吹き出し(98t)・エンディング(98y)が **画面に出ている間** は、ゲームの進行(玉・スロット・戦闘・タイマー・効果音)を止める。
   ・仕組み: 99-main の loop の1行フック。pzOn() の間は update() を呼ばず、pzTick() が 物語/ガイド/エンディング だけを進める。描画は続く(止まった絵が見える)。
   ・メニューや演出でシーンが隠れている間は pzOn()=false(ゲームは動く)。シーンは自動送りで必ず終わるので、放置でも止まりっぱなしにならない。
   ・BGM は流れ続ける(エンディング中は 98y が曲を差し替える)。ゲームが止まるので効果音は鳴らない。
   ・盤面を少し暗くして「止まっている」ことを見せる(body.pz、css/41-pause.css)。
   ・テスト用: window.PACHI_NOPAUSE=1 で無効(harness の既定。止める動きは tests/pause.js が確かめる)。 */
const PZ={on:false,off:(typeof window!=='undefined'&&window.PACHI_NOPAUSE)?1:0};
const pzVis=e=>!!(e&&e.style&&e.style.display==='block');
function pzOn(){if(PZ.off)return false;try{
  if(typeof END!=='undefined'&&END.on)return true;
  if(typeof STY!=='undefined'&&STY.cur&&pzVis(STY.el))return true;
  if(typeof TUT!=='undefined'&&TUT.cur&&pzVis(TUT.el))return true}catch(e){}
  return false}
function pzTick(dt){try{styUpd(dt)}catch(e){}try{tutUpd(dt)}catch(e){}try{if(typeof endUpd==='function')endUpd(dt)}catch(e){}}
/* loop から毎フレーム呼ばれる。true を返したら update を飛ばす */
function pzStep(dt){const on=pzOn();
  if(on!==PZ.on){PZ.on=on;try{const b=document.body;if(b&&b.classList)b.classList[on?'add':'remove']('pz')}catch(e){}}
  if(on)pzTick(dt);return on}
