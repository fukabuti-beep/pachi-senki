/* ---------- ui: 魂の祭壇に転生をまとめる ----------
   強化シート(98c)の「魂の祭壇」を「① 転生で魂を集める → ② 魂で永続強化」の1画面にする。
   ・転生の操作/説明(94-prestige の presAsk/presInfo/presGainShow/soulGain)はそのまま呼ぶだけ。ロジックは触らない。
   ・三本線メニューの「転生」タブは外し、代わりに「育てる」グループに「育成」タブ(強化/鍛冶屋/魂の祭壇へ案内)を置く。
   ・94b の祭壇の中身(SOULD/soulBuy/soulAutoToggle)も呼ぶだけ。説明文だけここで短く言い換える。
   読み込み順: 98c(UPG.list を作る)より後。 */
const ALTD={start:l=>'STAGE +5 から再出発(今 STAGE '+(1+5*l)+')',gold:()=>'ゴールドを持って再出発',auto:()=>'一番安い強化を自動で買う',
  relic:()=>{let p=35;try{p=Math.round(relicDropP()*100)}catch(e){}return '遺物ドロップ +5%(今 '+p+'%)'},soul:l=>'転生の魂 +10%(今 +'+10*l+'%)'};
function altarHtml(){
  const s=G.stage,can=soulGain(s)>=1,gn=presGainShow(s),nx=(()=>{try{return soulNext(s)}catch(e){return 0}})(),free=soulFree();
  let h='<div class="alt"><div class="fxh">魂の祭壇</div>'+
   '<div class="altflow"><span class="'+(can?'on':'')+'"><i>1</i>転生で魂を集める</span><b>&gt;</b><span class="'+(free>0?'on':'')+'"><i>2</i>魂でずっと強化</span></div>'+
   '<div class="altsoul">'+resIcon('soul','big')+'<span><small>魂</small><b>'+fmt(X.souls)+'</b></span><span><small>使える</small><b class="fr">'+fmt(free)+'</b></span>'+
   '<span class="altfx"><small>魂ボーナス</small>攻撃 x'+presSbaShow().toFixed(1)+'<br>ゴールド x'+SB.g().toFixed(2)+'</span></div>';
  /* ① 転生 */
  h+='<div class="altc"><div class="altt"><i>1</i>転生で魂を集める</div>'+
   (can?'<div class="altgain"><small>いま STAGE '+s+' で転生すると</small>'+resAmt('soul','+'+fmt(gn),'altn')+'</div>'+presInfo(s)
       :'<div class="altgain"><small>転生は STAGE '+PRES_MIN+' から</small><b class="altn">あと '+(PRES_MIN-s)+' STAGE</b></div>')+
   (can&&nx?'<div class="fxs">STAGE '+nx+' まで進むと魂が増える</div>':'')+
   '<button type="button" class="fxb altgo'+(can?'':' d')+'" onclick="presAsk()">転生する</button>'+
   '<div class="altkeep"><span class="rs">最初から</span> STAGE・ゴールド・強化<br><span class="kp">残る</span> 魂・実績・最高記録・仲間・魔石・宝石・遺物</div></div>';
  /* ② 永続強化 */
  h+='<div class="altc"><div class="altt"><i>2</i>魂で永続強化</div><div class="fxs">魂を使っても 魂ボーナスは減らない</div><div class="fxl">'+
   SOULD.map(d=>{const l=soulLv(d.k),mx=l>=d.max,c=mx?0:d.c(l),ok=!mx&&free>=c;
     return '<div class="'+(l||ok?'ok':'no')+'"><span>'+d.n+' <em class="altlv">Lv'+l+(Number.isFinite(d.max)?'/'+d.max:'')+'</em><br><small>'+(ALTD[d.k]?ALTD[d.k](l):d.d)+'</small></span><span>'+
       (mx?'<b class="altmx">MAX</b>':'<button type="button" class="fxb'+(ok?'':' d')+'" onclick="soulBuy(\''+d.k+'\')">'+resIcon('soul')+c+'</button>')+'</span></div>'}).join('')+'</div>'+
   (soulLv('auto')?'<button type="button" class="fxb g" onclick="soulAutoToggle()">自動強化: '+(SOUL.auto?'ON':'OFF')+'</button>':'')+'</div></div>';
  return h}
(function(){
  try{const e=UPG.list.find(x=>x[0]==='魂の祭壇');if(e)e[1]=altarHtml;else UPG.list.push(['魂の祭壇',altarHtml])}catch(e){}
  /* メニューの「転生」タブを外す(祭壇に統合)→「育てる」には案内タブを置く */
  const i=FM.findIndex(m=>m.n==='転生');if(i>=0)FM.splice(i,1);
  FM.push({n:'育成',r:altNavHtml})})();
/* 強化シートを開いて、指定のグループ(0=通常強化 1=鍛冶屋 2=魂の祭壇)を表示 */
function altOpen(g){try{if(typeof fxClose==='function')fxClose()}catch(e){}try{so=true;sheet(true)}catch(e){}try{grpSet(g)}catch(e){}}
function altNavHtml(){
  const can=soulGain(G.stage)>=1,ms=typeof RES!=='undefined'?RES.ms:0,gem=typeof RES!=='undefined'?RES.gem:0;
  const gi=n=>{try{return Math.max(0,UPG.list.findIndex(x=>x[0]===n))}catch(e){return 0}};
  const row=(ic,name,desc,g,tag)=>'<div class="ok altnav"><span class="nob">'+ic+'<b>'+name+'</b>'+(tag||'')+'<br><small>'+desc+'</small></span><span><button type="button" class="fxb" onclick="altOpen('+g+')">開く</button></span></div>';
  return '<div class="fxh">育成</div><div class="fxs">下の「強化」ボタンの画面で育てる</div><div class="fxl">'+
   row(resIcon('gold'),'通常強化','ゴールドで 攻撃・大当たり などを強化<br>'+resAmt('gold',fmt(G.gold)),0)+
   row(resIcon('ms'),'鍛冶屋','魔石・宝石で 武器と護符<br>'+resAmt('ms',fmt(ms))+' '+resAmt('gem',fmt(gem)),gi('鍛冶屋'))+
   row(resIcon('soul'),'魂の祭壇','転生して魂を集め、ずっと強化<br>'+resAmt('soul',fmt(X.souls))+(can?' <span class="altok">転生できる!</span>':' STAGE '+PRES_MIN+' から転生'),gi('魂の祭壇'))+'</div>'}
/* 転生の確認で「やめる」→ 元の画面(祭壇)に戻る(以前はメニューを開き直していた)。転生したら祭壇を描き直す */
{const o=presAsk;presAsk=function(){const r=o.apply(this,arguments);try{if(typeof FB!=='undefined'&&FB[1]&&FB[1][0]==='やめる')FB[1][1]=()=>{fxClose();try{grpRefresh()}catch(e){}}}catch(e){}return r}}
{const o=presDo;presDo=function(){const r=o.apply(this,arguments);try{grpRefresh()}catch(e){}return r}}
