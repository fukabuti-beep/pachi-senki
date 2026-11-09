/* ---------- feature 94: 転生(プレステージ) ----------
   PRES_MIN ステージ以上でリセットして「魂」を得る。魂は永続: 与ダメージ +10%/個、ゴールド獲得 +5%/個。
   ダメージ倍率は hurt() のラップ、ゴールド倍率は featUpdate の純増上乗せ(91)で適用 = 20-upgrades.js は無編集。
   (balance 担当へ: 将来は atk()/mul() に SB.a()/SB.g() を直接掛ける形に寄せるとより素直) */
const PRES_MIN=30;
const SB={a:()=>1+.1*X.souls,g:()=>1+.05*X.souls};
if(typeof hurt==='function'){const o=hurt;hurt=function(x){const a=[].slice.call(arguments);a[0]=x*SB.a();return o.apply(this,a)}}
/* 獲得できる魂(第2弾 balance): 「最高記録を超えた分は満額、記録までの分は BAL.soulRep(50%)」。
   基準の量 F(s)=5x(s/30)^2.5(30=5, 40=10, 50=17, 60=28, 80=58, 100=101, 150=279)。PREC=この周回を始めた時の最高記録。
   魂 = F(s) - (1-BAL.soulRep)xF(min(s,PREC)) に「魂の収穫」(強化 添字16)を掛ける。初めての転生(PREC=0)は従来どおり F(s)。
   (旧式は毎回 F(s) 満額で、STAGE50 で転生を繰り返すのが楽に稼げた → 記録更新が得になるように。sim 120分: STAGE50 周回 魂3.6/分、記録+10 で転生 18.7/分) */
const soulF=s=>s<PRES_MIN?0:5*Math.pow(s/PRES_MIN,2.5);
function precSave(){try{localStorage.setItem('pachi2_prec',JSON.stringify({b:PREC}))}catch(e){}}
let PREC=0;   // localStorage['pachi2_prec']={b}。無い旧セーブ: 転生したことがあり今が記録より手前なら X.best、それ以外は0(=今回は従来どおり満額。旧セーブに不利にしない)
try{const j=JSON.parse(localStorage.getItem('pachi2_prec')||'null');const b=j&&Math.floor(+j.b);if(Number.isFinite(b)&&b>=0)PREC=Math.min(b,1e6);else{PREC=X.pres>0&&G.stage<X.best?X.best:0;precSave()}}catch(e){}
const soulGain=(s,b)=>{if(!(s>=PRES_MIN))return 0;const r=Math.min(s,b==null?PREC:b);let h=1;try{h=soulHarv()}catch(e){}
  return Math.floor(Math.min(1e9,(soulF(s)-(1-BAL.soulRep)*soulF(r))*h))};
try{upCapSet(X.pres)}catch(e){}
/* 転生画面の説明: 記録更新の分は満額 / 記録までは35% / 次の転生で強化の上限 +1 */
function presInfo(s){const gn=soulGain(s),rec=PREC>=PRES_MIN?PREC:0,over=rec&&s>rec,ce=upCapExt(X.pres),cn=upCapExt(X.pres+1);
  return '<div class="fxs presi" style="margin-top:6px">'+(rec?'最高記録 STAGE '+rec+' を超えた分は魂 100%(記録までは '+Math.round(BAL.soulRep*100)+'%)'+(over?'<br><span style="color:#7dffa6">記録更新中! +'+(s-rec)+' STAGE</span>':'<br><span style="color:#ffb0c8">記録まであと '+(rec-s)+' STAGE(超えると魂が大きく増える)</span>'):'はじめての転生は魂 100%。次からは最高記録を超えた分が 100%')+
    (lvE(16)>1?'<br>魂の収穫 x'+soulHarv().toFixed(2):'')+(cn>ce?'<br>転生すると 当たり確率・ルーレット運・お宝運・招待・超倍率 の MAX +1(今 +'+ce+')':'')+'</div>'}
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
  const gn0=soulGain(G.stage);if(gn0<1){fxToast('STAGE '+PRES_MIN+' から転生できる','#aaa');return}
  const gn=presGainShow(G.stage),sa=presSbaShow();   // 表示は 魂の器(94b)込み・再出発の勢い(94b)抜き(QA: 実際の獲得と表示がずれていた)
  fxShow('<div class="fxh">転生しますか?</div><div class="fxp">STAGE 1 からやり直して 魂をもらう。<br><span style="color:#ffb0c8">最初から</span> STAGE・ゴールド・強化<br><span style="color:#7dffa6">残る</span> 魂・実績・最高記録・仲間'+(presBusy()?'<br><span style="color:#ffb0c8">※進行中の演出(回転中の当たり等)は打ち切られます</span>':'')+'</div><div class="fxn">魂 +'+gn+'</div>'+presInfo(G.stage)+'<div class="fxs">魂 '+X.souls+' → '+(X.souls+gn)+'<br>攻撃 x'+sa.toFixed(1)+' → x'+(1+.1*(X.souls+gn)).toFixed(1)+' / ゴールド x'+SB.g().toFixed(2)+' → x'+(1+.05*(X.souls+gn)).toFixed(2)+'</div>',[['転生する!',presDo],['やめる',()=>fxMenu(),'g']])}
function presDo(){
  const gn=soulGain(G.stage);if(gn<1){fxClose();return 0}
  presAbort();
  X.best=Math.max(X.best,G.stage);X.souls+=gn;X.pres++;PREC=Math.max(PREC,X.best);precSave();try{upCapSet(X.pres)}catch(e){}
  X.gps=0;fgb=0;fgt=0;   // 収入の移動平均も新しい周回から(前周回の稼ぎで実績報酬/オフライン収入が出ないように)
  G.gold=0;G.stage=1;G.lv=G.lv.map(()=>1);G.rush=0;G.combo=0;G.pool=0;G.sp=0;G.q=0;G.at=0;G.fv=0;G.aw=0;G.hit=0;QL.length=0;balls.length=0;PR.length=0;cmb=0;cmbT=0;
  fg=0;spawn();refresh();
  /* 収入の平均(91 の X.gps)は前の周回の稼ぎなので測り直す。残すと直後の実績報酬(achReward)やオフライン収入が
     前の周回の収入基準になり、リセットしたゴールドが一気に戻っていた(QA: STAGE 31 の転生直後に 8.9億G) */
  try{localStorage.setItem('pachi2',JSON.stringify({v:2,gold:G.gold,stage:G.stage,lv:G.lv}))}catch(e){}
  saveX();fxClose();banner('転生!! 魂 +'+gn,'#c8b8ff');kyuin(6,'#c8b8ff');fan();shake();achCheck();return gn}
/* 表示用(QA): 獲得予定は 94b の魂の器を足した実際の量、ダメージ倍率は 94b の「再出発の勢い」(一時的な補正)を除いた値 */
const presGainShow=s=>{try{if(typeof soulTotal==='function')return soulTotal(s)}catch(e){}return soulGain(s)};
const presSbaShow=()=>{try{if(typeof sbShow==='function')return sbShow()}catch(e){}return SB.a()};
FM.push({n:'転生',r:()=>{const gn=presGainShow(G.stage),can=soulGain(G.stage)>=1;return '<div class="fxh">転生</div><div class="fxp">STAGE '+PRES_MIN+' 以上でリセットし、永続ボーナス「魂」を得る。</div><div class="fxs">所持 魂 '+X.souls+'(転生 '+X.pres+'回)<br>ダメージ x'+presSbaShow().toFixed(1)+' / ゴールド x'+SB.g().toFixed(2)+'</div><div class="fxs" style="margin-top:6px">今の STAGE '+G.stage+' → 獲得予定 魂 +'+gn+'</div>'+presInfo(G.stage)+'<button class="fxb'+(can?'':' d')+'" onclick="presAsk()">転生する</button>'}});
