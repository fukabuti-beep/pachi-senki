/* ---------- feature 94: 転生(プレステージ) ----------
   PRES_MIN ステージ以上でリセットして「魂」を得る。魂は永続: 与ダメージ +10%/個、ゴールド獲得 +5%/個。
   ダメージ倍率は hurt() のラップ、ゴールド倍率は featUpdate の純増上乗せ(91)で適用 = 20-upgrades.js は無編集。
   (balance 担当へ: 将来は atk()/mul() に SB.a()/SB.g() を直接掛ける形に寄せるとより素直) */
const PRES_MIN=30;
const SB={a:()=>1+.1*X.souls,g:()=>1+.05*X.souls};
if(typeof hurt==='function'){const o=hurt;hurt=function(x){const a=[].slice.call(arguments);a[0]=x*SB.a();return o.apply(this,a)}}
/* 獲得できる魂: stage<PRES_MIN なら0。5x(stage/30)^2.5 = stage30=5, 40=10, 50=17, 60=28, 80=58, 100=101, 150=279。
   (旧式 (stage/10)^1.5 は 30=5/80=22 と平坦で、転生しても前回の最高に戻るのが遅く(sim: 9〜17分)うま味が薄かった。balance) */
const soulGain=s=>s<PRES_MIN?0:Math.floor(Math.min(1e9,5*Math.pow(s/PRES_MIN,2.5)));
/* 演出中(スロット/ルーレット/ミニゲーム/カットイン)は転生させない */
const presBusy=()=>!!(sp||RL||G.roul||G.jp>0||cut||MG||(typeof MG2!=='undefined'&&MG2));
function presAsk(){
  const gn=soulGain(G.stage);if(gn<1){fxToast('STAGE '+PRES_MIN+' から転生できる','#aaa');return}
  if(presBusy()){fxToast('演出が終わるまで待ってね','#aaa');return}
  fxShow('<div class="fxh">転生しますか?</div><div class="fxp">STAGE・ゴールド・強化がリセットされます。<br>実績・最高到達・仲間は残ります。</div><div class="fxn">魂 +'+gn+'</div><div class="fxs">魂 '+X.souls+' → '+(X.souls+gn)+'<br>ダメージ x'+SB.a().toFixed(1)+' → x'+(1+.1*(X.souls+gn)).toFixed(1)+' / ゴールド x'+SB.g().toFixed(2)+' → x'+(1+.05*(X.souls+gn)).toFixed(2)+'</div>',[['転生する!',presDo],['やめる',()=>fxMenu(),'g']])}
function presDo(){
  const gn=soulGain(G.stage);if(gn<1||presBusy()){fxClose();return 0}
  X.best=Math.max(X.best,G.stage);X.souls+=gn;X.pres++;
  G.gold=0;G.stage=1;G.lv=G.lv.map(()=>1);G.rush=0;G.combo=0;G.pool=0;G.sp=0;G.q=0;G.at=0;G.fv=0;G.aw=0;G.hit=0;QL.length=0;balls.length=0;PR.length=0;cmb=0;cmbT=0;
  fg=0;spawn();refresh();
  try{localStorage.setItem('pachi2',JSON.stringify({v:2,gold:G.gold,stage:G.stage,lv:G.lv}))}catch(e){}
  saveX();fxClose();banner('転生!! 魂 +'+gn,'#c8b8ff');kyuin(6,'#c8b8ff');fan();shake();achCheck();return gn}
FM.push({n:'転生',r:()=>{const gn=soulGain(G.stage),can=gn>=1;return '<div class="fxh">転生</div><div class="fxp">STAGE '+PRES_MIN+' 以上でリセットし、永続ボーナス「魂」を得る。</div><div class="fxs">所持 魂 '+X.souls+'(転生 '+X.pres+'回)<br>ダメージ x'+SB.a().toFixed(1)+' / ゴールド x'+SB.g().toFixed(2)+'</div><div class="fxs" style="margin-top:6px">今の STAGE '+G.stage+' → 獲得予定 魂 +'+gn+'</div><button class="fxb'+(can?'':' d')+'" onclick="presAsk()">転生する</button>'}});
