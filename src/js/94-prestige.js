/* ---------- feature 94: 転生(プレステージ) ----------
   PRES_MIN ステージ以上でリセットして「魂」を得る。魂は永続: 与ダメージ +10%/個、ゴールド獲得 +5%/個。
   ダメージ倍率は hurt() のラップ、ゴールド倍率は featUpdate の純増上乗せ(91)で適用 = 20-upgrades.js は無編集。
   (balance 担当へ: 将来は atk()/mul() に SB.a()/SB.g() を直接掛ける形に寄せるとより素直) */
const PRES_MIN=30;
const SB={a:()=>1+.1*X.souls,g:()=>1+.05*X.souls};
if(typeof hurt==='function'){const o=hurt;hurt=function(x){const a=[].slice.call(arguments);a[0]=x*SB.a();return o.apply(this,a)}}
/* 獲得できる魂: stage<PRES_MIN なら0。stage30=5, 60=14, 100=31, 150=58 */
const soulGain=s=>s<PRES_MIN?0:Math.floor(Math.pow(s/10,1.5));
/* 演出中(スロット/ルーレット/ミニゲーム/カットイン/押せ!!)かどうか。
   以前はこれが真だと転生を断っていたが、放置中はスロットがほぼ常に回っているので事実上転生できなかった。
   今は「転生する!」を押したら presAbort() で進行中の演出を安全に打ち切ってから即転生する(確認画面で注意書きを出すだけ)。 */
const presBusy=()=>!!(sp||RL||G.roul||G.jp>0||cut||MG||(typeof MG2!=='undefined'&&MG2)||(typeof PUSH!=='undefined'&&PUSH)||(typeof HL!=='undefined'&&HL));
/* 転生の世代。setTimeout で後から走る演出(ボス撃破→ミニゲーム、ラッシュ斬り、節目演出など)は presLater で予約し、
   その間に転生したら何もしない(新しい周回に古い報酬/ミニゲームが混ざらないように) */
let PGEN=0;
function presLater(fn,ms){const g=PGEN;return setTimeout(()=>{if(g===PGEN)fn()},ms)}
/* 進行中の演出をすべて止める(当否/報酬は捨てる。転生で G/STAGE はどのみちリセットされる)。各ファイルの状態は存在する時だけ触る */
function presAbort(){PGEN++;const tr=f=>{try{f()}catch(e){}};
  tr(()=>{if(PUSH){(PUSH.tm||[]).forEach(clearTimeout);PUSH=null}const e=$('push');if(e)e.className=''});
  sp=null;cut=null;RL=null;G.roul=0;G.jp=0;
  tr(()=>{$('rl').style.display='none'});
  tr(()=>{MG=null;$('mg').style.display='none'});
  tr(()=>{if(typeof MG2!=='undefined'&&MG2)mg2End()});
  tr(()=>{if(typeof HL!=='undefined'&&HL){HL=null;const e=$('fxg');if(e)e.style.display='none'}}); // ハイ&ロー(98f、#fxg を使う)
  tr(()=>{if(typeof HEV!=='undefined'){HEV.mr=null;HEV.jr=null;HEV.mq.length=0}});
  tr(()=>{if(typeof JPX!=='undefined'){JPX.p=null;JPX.coins.length=0}});
  tr(()=>{if(typeof GK!=='undefined'){GK.rs=null;GK.rr=null;GK.pop=null}});
  tr(()=>{if(typeof ACT!=='undefined'){ACT.cb=null;ACT.warn=null;ACT.fin=null;ACT.mile=null;if(typeof cbHide==='function')cbHide()}});
  tr(()=>{RS=null;HS=0})}
function presAsk(){
  const gn=soulGain(G.stage);if(gn<1){fxToast('STAGE '+PRES_MIN+' から転生できる','#aaa');return}
  fxShow('<div class="fxh">転生しますか?</div><div class="fxp">STAGE・ゴールド・強化がリセットされます。<br>実績・最高到達・仲間は残ります。'+(presBusy()?'<br><span style="color:#ffb0c8">※進行中の演出(回転中の当たり等)は打ち切られます</span>':'')+'</div><div class="fxn">魂 +'+gn+'</div><div class="fxs">魂 '+X.souls+' → '+(X.souls+gn)+'<br>ダメージ x'+SB.a().toFixed(1)+' → x'+(1+.1*(X.souls+gn)).toFixed(1)+' / ゴールド x'+SB.g().toFixed(2)+' → x'+(1+.05*(X.souls+gn)).toFixed(2)+'</div>',[['転生する!',presDo],['やめる',()=>fxMenu(),'g']])}
function presDo(){
  const gn=soulGain(G.stage);if(gn<1){fxClose();return 0}
  presAbort();
  X.best=Math.max(X.best,G.stage);X.souls+=gn;X.pres++;
  G.gold=0;G.stage=1;G.lv=G.lv.map(()=>1);G.rush=0;G.combo=0;G.pool=0;G.sp=0;G.q=0;G.at=0;G.fv=0;G.aw=0;G.hit=0;QL.length=0;balls.length=0;PR.length=0;cmb=0;cmbT=0;
  fg=0;spawn();refresh();
  try{localStorage.setItem('pachi2',JSON.stringify({v:2,gold:G.gold,stage:G.stage,lv:G.lv}))}catch(e){}
  saveX();fxClose();banner('転生!! 魂 +'+gn,'#c8b8ff');kyuin(6,'#c8b8ff');fan();shake();achCheck();return gn}
FM.push({n:'転生',r:()=>{const gn=soulGain(G.stage),can=gn>=1;return '<div class="fxh">転生</div><div class="fxp">STAGE '+PRES_MIN+' 以上でリセットし、永続ボーナス「魂」を得る。</div><div class="fxs">所持 魂 '+X.souls+'(転生 '+X.pres+'回)<br>ダメージ x'+SB.a().toFixed(1)+' / ゴールド x'+SB.g().toFixed(2)+'</div><div class="fxs" style="margin-top:6px">今の STAGE '+G.stage+' → 獲得予定 魂 +'+gn+'</div><button class="fxb'+(can?'':' d')+'" onclick="presAsk()">転生する</button>'}});
