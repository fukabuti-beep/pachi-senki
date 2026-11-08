/* ---------- 転生の整備: 魂の祭壇 (feature) ----------
   魂を「使って」永続強化を買える。魂の所持数(X.souls)は減らさない=ダメージ/ゴールドの永続ボーナスはそのまま。
   使える魂 = X.souls - 使用済み(SOUL.spent)。セーブ: localStorage['pachi2_soul'] = {spent, lv:{key:lv}}。
   ・開始ステージ: 転生後のスタートが STAGE 1+5×Lv(最高到達の半分まで)
   ・初期ゴールド: 転生後に G を持って始まる
   ・自動強化: 2秒ごとに買える中で一番安い強化を自動購入(メニューで ON/OFF)
   ・遺物の目利き: 遺物ドロップ率 +5%/Lv(96r-relic が relicDropP() を参照)
   ・魂の器: 転生で得る魂 +10%/Lv
   あわせて、転生メニューに「次の魂まであと何ステージか」を表示する。 */
const SOULD=[
  {k:'start',n:'開始ステージ',d:'転生後 STAGE+5/Lv',max:10,c:l=>3*(l+1)},
  {k:'gold',n:'初期ゴールド',d:'転生後に G を持って開始',max:8,c:l=>2*(l+1)},
  {k:'auto',n:'自動強化',d:'一番安い強化を自動で購入',max:1,c:()=>5},
  {k:'relic',n:'遺物の目利き',d:'遺物ドロップ率 +5%/Lv',max:6,c:l=>4*(l+1)},
  {k:'soul',n:'魂の器',d:'転生で得る魂 +10%/Lv',max:10,c:l=>5*(l+1)}];
let SOUL={spent:0,lv:{},auto:1};
try{const j=JSON.parse(localStorage.getItem('pachi2_soul')||'null');if(j&&typeof j=='object'){SOUL.spent=Math.max(0,Math.floor(+j.spent)||0);SOUL.auto=j.auto===0?0:1;SOULD.forEach(s=>{const v=Math.floor(+(j.lv||{})[s.k]);if(Number.isFinite(v)&&v>0)SOUL.lv[s.k]=Math.min(s.max,v)})}}catch(e){}
function soulSave(){try{localStorage.setItem('pachi2_soul',JSON.stringify(SOUL))}catch(e){}}
const soulLv=k=>SOUL.lv[k]||0;
const soulFree=()=>Math.max(0,X.souls-SOUL.spent);
function soulBuy(k){const s=SOULD.find(d=>d.k===k);if(!s)return;const l=soulLv(k);if(l>=s.max)return;const c=s.c(l);if(soulFree()<c){fxToast('魂が足りない(あと '+(c-soulFree())+')','#aaa');return}
  SOUL.spent+=c;SOUL.lv[k]=l+1;soulSave();fxToast(s.n+' Lv'+(l+1)+'!','#c8b8ff');try{kyuin(3,'#c8b8ff')}catch(e){}try{grpRefresh()}catch(e){}}
function soulAutoToggle(){SOUL.auto=SOUL.auto?0:1;soulSave();try{grpRefresh()}catch(e){}}
const relicDropP=()=>.35+.05*soulLv('relic');
// 次の魂までのステージ
function soulNext(s){const g=soulGain(s);for(let t=Math.max(s,PRES_MIN);t<s+5000;t++)if(soulGain(t)>g)return t;return 0}
const soulBonusGain=gn=>Math.floor(gn*.1*soulLv('soul'));
// 転生の後処理(本体の presDo をラップ): 魂の器の追加分 / 開始ステージ / 初期ゴールド
{const o=presDo;presDo=function(){const best=Math.max(X.best,G.stage),gn=o.apply(this,arguments);try{if(gn>0){const b=soulBonusGain(gn);if(b>0){X.souls+=b;saveX()}
    const st=Math.min(1+5*soulLv('start'),Math.max(1,Math.floor(best/2)));if(st>1){G.stage=st;spawn()}
    const gl=soulLv('gold');if(gl>0)G.gold=Math.floor(2000*gl*gl*Math.pow(1.4,Math.max(0,st-1)/5));
    if(st>1||gl>0){try{localStorage.setItem('pachi2',JSON.stringify({v:2,gold:G.gold,stage:G.stage,lv:G.lv}))}catch(e){}refresh()}
    if(b>0||st>1)setTimeout(()=>{try{fxToast((b>0?'魂の器 +'+b+' ':'')+(st>1?'STAGE '+st+' から再出発!':''),'#c8b8ff')}catch(e){}},900)}}catch(e){}return gn}}
// 自動強化
let SOULT=0;
function soulAutoTick(dt){if(!soulLv('auto')||!SOUL.auto||!run)return;SOULT+=dt;if(SOULT<2)return;SOULT=0;let bi=-1,bc2=Infinity;
  for(let i=0;i<UP.length;i++){if(G.stage<(UP[i][4]||0))continue;const c=cost(i);if(c<bc2&&G.gold>=c){bc2=c;bi=i}}if(bi>=0)buy(bi)}
FU.push(dt=>soulAutoTick(dt));
// メニュー: 魂の祭壇 + 転生タブの補足
FM.push({n:'魂の祭壇',r:()=>'<div class="fxh">魂の祭壇</div><div class="fxs">魂を使って永続強化。使っても魂のボーナス(ダメージ x'+SB.a().toFixed(1)+' / ゴールド x'+SB.g().toFixed(2)+')は減らない。</div><div class="fxn" style="font-size:22px">使える魂 '+soulFree()+' / '+X.souls+'</div><div class="fxl">'+
  SOULD.map(s=>{const l=soulLv(s.k),mx=l>=s.max,c=mx?0:s.c(l),ok=!mx&&soulFree()>=c;return '<div class="'+(l||ok?'ok':'no')+'"><span>'+s.n+' Lv'+l+'/'+s.max+'<br><small>'+s.d+'</small></span><span>'+(mx?'MAX':'<button class="fxb'+(ok?'':' d')+'" style="margin:0;padding:4px 8px" onclick="soulBuy(\''+s.k+'\')">魂'+c+'</button>')+'</span></div>'}).join('')+'</div>'+
  (soulLv('auto')?'<button class="fxb" onclick="soulAutoToggle()">自動強化: '+(SOUL.auto?'ON':'OFF')+'</button>':'')+
  '<div class="fxs" style="margin-top:6px">今 STAGE '+G.stage+' で転生 → 魂 +'+soulGain(G.stage)+(soulLv('soul')?'(+器 '+soulBonusGain(soulGain(G.stage))+')':'')+(soulNext(G.stage)?' / 次の魂は STAGE '+soulNext(G.stage):'')+'</div>'});
