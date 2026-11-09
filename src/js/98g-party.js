/* ---------- 遠征隊の編成 (feature) ----------
   遠征(98d)に仲間を2人まで連れて行ける。仲間は 96-allies の3人(ポチ/魔導士/竜)+遠征専用の2人(ゴーレム/ピクシー)。
   - 行き先ごとの相性: ◎(得意)=報酬+25%・大成功+6%・経験1.5倍 / ○=報酬+10%・大成功+2% / 相性なし=報酬+3%。
   - 仲間は遠征から帰るたびに経験値を得て Lv アップ(最大 Lv20、Lv1つごとに報酬+1.5%・大成功+0.4%)。
   - 合計は 報酬 x1.8・大成功率 35% が上限(既存の経済を壊さないよう控えめに)。
   - 帰還時、連れて行った仲間がそれぞれ半分の確率で「お土産」(魔石 少し / 宝石1)を持ち帰る。
   - 遠征が帰ってきたら、メニュー内の「遊ぶ」ボタンと「遠征」タブにも「!」(29c の1行フック fmgMark)。
   セーブ: localStorage['pachi2_party'] = {sel:[id], go:[id](出発時の編成), lv:{id:Lv}, xp:{id:経験}, trip:仲間連れ帰還回数, gift:お土産の数, sky:天空の神殿からの帰還回数}。
   転生しても残る(仲間の加入は最高到達 X.best で決まる)。旧セーブ(このキーが無い)は「編成なし」で始まる。 */
mk('fa3','k#14101f,g#9a9aae,d#5e5e74,e#7ff3ff,m#43e060',["..kkkk",".kmmgg",".kgggg",".kgegg",".kdggg","kkkddd","kggggg","kgdggg","kkkggg","..kggg","..kgk.","..kkk."]);
mk('fa4','k#14101f,w#c8f8ff,s#ffd2a6,h#ff7ac0,d#8dff7a,e#14101f',["......","...khh","..khhh","..khss","ww.kse","wwwkss","wwkddd",".wkddd","..kddd","...kdd","...ks.","...kk."]);
const PTM=[
 {id:'dog',n:'ポチ',sp:'fa0',st:12,c:'#ffcf8a'},
 {id:'mage',n:'魔導士',sp:'fa1',st:30,c:'#c8b8ff'},
 {id:'dragon',n:'竜',sp:'fa2',st:60,c:'#7dffa6'},
 {id:'golem',n:'ゴーレム',sp:'fa3',st:80,c:'#b8b8d0',ex:1},
 {id:'pixie',n:'ピクシー',sp:'fa4',st:130,c:'#ff9ad0',ex:1}];
/* 相性 PTA[行き先][仲間id] = 2(◎) / 1(○)。行き先の並びは 98d の EXD と同じ */
const PTA=[
 {dog:2,dragon:1,pixie:1},
 {mage:2,dog:1,golem:1},
 {dragon:2,golem:1},
 {golem:2,mage:1,pixie:1},
 {pixie:2,mage:1,dragon:1}];
const PTMAX=2,PTLV=20;
const PTY={sel:[],go:[],lv:{},xp:{},trip:0,gift:0,sky:0};
{const id=v=>PTM.some(m=>m.id===v),n=(v,mx)=>{v=Math.floor(+v);return Number.isFinite(v)&&v>0?Math.min(v,mx):0};
 try{const j=JSON.parse(localStorage.getItem('pachi2_party')||'null');if(j&&typeof j=='object'){
  const ls=a=>Array.isArray(a)?a.filter((v,k)=>id(v)&&a.indexOf(v)===k).slice(0,PTMAX):[];
  PTY.sel=ls(j.sel);PTY.go=ls(j.go);
  for(const m of PTM){if(j.lv&&typeof j.lv=='object')PTY.lv[m.id]=Math.max(1,n(j.lv[m.id],PTLV));if(j.xp&&typeof j.xp=='object')PTY.xp[m.id]=n(j.xp[m.id],1e6)}
  PTY.trip=n(j.trip,1e9);PTY.gift=n(j.gift,1e9);PTY.sky=n(j.sky,1e9)}}catch(e){}
 for(const m of PTM){if(!PTY.lv[m.id])PTY.lv[m.id]=1;if(!PTY.xp[m.id])PTY.xp[m.id]=0}
 /* 遠征中でないのに出発時の編成が残っていたら片付ける */
 if(EXP.d<0)PTY.go=[]}
function ptSave(){try{localStorage.setItem('pachi2_party',JSON.stringify(PTY))}catch(e){}}
const ptM=id=>PTM.find(m=>m.id===id);
const ptOn=m=>X.best>=m.st;
const ptNeed=lv=>10*lv;           /* 次の Lv までの経験値 */
const ptAff=(i,id)=>(PTA[i]&&PTA[i][id])||0;
/* 編成のボーナス。ids 省略時は「出発時の編成」(遠征中)/「いまの編成」(待機中) */
function ptBonus(i,useGo,ids){ids=ids||(useGo?PTY.go:PTY.sel);let m=1,b=0;
  for(const id of ids){const a=ptAff(i,id),lv=PTY.lv[id]||1;m+=(a===2?.25:a===1?.1:.03)+.015*(lv-1);b+=(a===2?.06:a===1?.02:0)+.004*(lv-1)}
  return {m:Math.min(1.8,m),b:Math.min(.2,b)}}  /* 大成功は 15%+最大20% = 35% */
function ptToggle(id){if(EXP.d>=0)return false;const m=ptM(id);if(!m||!ptOn(m))return false;
  const k=PTY.sel.indexOf(id);if(k>=0)PTY.sel.splice(k,1);else{if(PTY.sel.length>=PTMAX)PTY.sel.shift();PTY.sel.push(id)}
  ptSave();try{if(typeof beep==='function'&&AC)beep(k>=0?520:880,.05,'square',.03)}catch(e){}if(fxOpen)fxMenu();return true}
/* 98d の expGo/expCancel から呼ばれる(i<0=呼び戻し) */
function ptDepart(i){PTY.sel=PTY.sel.filter(id=>{const m=ptM(id);return m&&ptOn(m)});PTY.go=i>=0?PTY.sel.slice():[];ptSave()}
/* 遺物: 未発見 → 低Lv を優先(魔王城/天空の神殿) */
function ptRelicLow(){if(typeof RLD==='undefined')return null;const cand=RLD.filter(r=>(RLV[r.id]||0)<RLMAX);if(!cand.length)return null;
  const lo=Math.min(...cand.map(r=>RLV[r.id]||0)),c=cand.filter(r=>(RLV[r.id]||0)===lo),r=c[Math.floor(Math.random()*c.length)];
  const nw=!RLV[r.id];RLV[r.id]=(RLV[r.id]||0)+1;try{relicSave()}catch(e){}return {r,lv:RLV[r.id],nw}}
/* 帰還: 経験値・Lv アップ・お土産。戻り値 [{id,xp,up,lv,gift:{k,v}|null}] */
function ptReturn(i,r){const out=[],ids=PTY.go.slice();PTY.go=[];if(i===4)PTY.sky++;
  const base=Math.max(5,Math.round(EXD[i].sec/360));
  for(const id of ids){const m=ptM(id);if(!m)continue;const a=ptAff(i,id),xp=Math.round(base*(a===2?1.5:a===1?1.2:1)*(r&&r.big?1.5:1));
    let lv=PTY.lv[id]||1,x=(PTY.xp[id]||0)+xp,up=0;while(lv<PTLV&&x>=ptNeed(lv)){x-=ptNeed(lv);lv++;up++}if(lv>=PTLV)x=0;PTY.lv[id]=lv;PTY.xp[id]=x;
    let gift=null;if(Math.random()<.5){if(Math.random()<.25)gift={k:'gem',v:1};else gift={k:'ms',v:Math.max(1,Math.floor(expMs(i)*.15))}}
    if(gift){PTY.gift++;try{if(typeof RES!=='undefined'){if(gift.k==='gem')RES.gem+=gift.v;else RES.ms+=gift.v;resSave()}}catch(e){}}
    out.push({id,xp,up,lv,gift})}
  if(out.length)PTY.trip++;ptSave();return out}
/* スプライトを <img> に(ブラウザのみ。失敗したら空) */
const ptImgC={};
function ptImg(id,cl){const m=ptM(id);if(!m)return '';if(ptImgC[id]===undefined){ptImgC[id]='';try{const c=SPR[m.sp];if(c&&c.toDataURL){const u=c.toDataURL();if(typeof u==='string'&&u.indexOf('data:image')===0)ptImgC[id]=u}}catch(e){}}
  return ptImgC[id]?'<img class="'+(cl||'ptim')+'" src="'+ptImgC[id]+'" alt="">':'<i class="'+(cl||'ptim')+' ptnim" style="background:'+m.c+'"></i>'}
const ptMark=a=>a===2?'<b class="pta2">◎</b>':a===1?'<b class="pta1">○</b>':'';
/* 帰還モーダルに差し込む: 仲間のお土産と Lv アップ */
function ptHtml(r){if(!r||!r.pt||!r.pt.length)return '';
  return '<div class="ptgift">'+r.pt.map((p,k)=>{const m=ptM(p.id);return '<div class="ptg" style="--d:'+(k*.25)+'s">'+ptImg(p.id,'ptim ptjump')+
    '<div><span style="color:'+m.c+'">'+m.n+'</span> Lv'+p.lv+(p.up?' <b class="ptup">Lv UP!</b>':'')+'<br><small>'+resIcon('exp')+'経験値 +'+p.xp+'</small>'+
    (p.gift?'<br><span class="ptgv">お土産: '+(p.gift.k==='gem'?'<b style="color:#7ff3ff">宝石 +'+p.gift.v+'</b>':'<b style="color:#c8a0ff">魔石 +'+fmt(p.gift.v)+'</b>')+'</span>':'')+'</div></div>'}).join('')+
    '</div>'+(r.pm>1?'<div class="fxs">遠征隊ボーナス 報酬 x'+r.pm.toFixed(2)+'</div>':'')}
/* 遠征タブの編成パネル */
function ptMenu(){const av=PTM.filter(ptOn),busy=EXP.d>=0,ids=busy?PTY.go:PTY.sel;
  let h='<div class="ptbox"><div class="ptttl">遠征隊の編成 <small>'+ids.length+'/'+PTMAX+'人</small></div>';
  if(!av.length)return h+'<div class="fxs">STAGE '+PTM[0].st+' で仲間が加入すると 連れて行ける</div></div>';
  h+='<div class="fxs">'+(busy?'遠征中の仲間は 帰還まで編成を変えられない':'仲間を連れて行くと 相性で報酬と大成功率がアップ')+'</div><div class="ptrow">';
  h+=PTM.map(m=>{if(!ptOn(m))return '<div class="ptc no"><i class="ptim ptnim"></i><span>???</span><small>STAGE '+m.st+'</small></div>';
    const on=ids.indexOf(m.id)>=0,lv=PTY.lv[m.id],need=ptNeed(lv),pc=lv>=PTLV?100:Math.round(100*PTY.xp[m.id]/need);
    return '<button type="button" class="ptc'+(on?' on':'')+(busy?' lk':'')+'" onclick="ptToggle(\''+m.id+'\')">'+ptImg(m.id)+'<span>'+m.n+'</span><small>Lv'+lv+(lv>=PTLV?' MAX':'')+'</small><i class="ptxp"><i style="width:'+pc+'%"></i></i>'+(on?'<em>'+(busy?'遠征中':'同行')+'</em>':'')+'</button>'}).join('');
  return h+'</div></div>'}
/* 行き先の行に相性と見込み(待機中は今の編成、遠征中は出発時の編成) */
function ptAffTag(i){const ids=EXP.d>=0?PTY.go:PTY.sel;
  const fav=PTM.filter(m=>ptOn(m)&&ptAff(i,m.id)===2).map(m=>m.n);
  let s=fav.length?'<br>得意: '+fav.join('・'):'';
  if(ids.length&&(EXP.d<0||EXP.d===i)){const b=ptBonus(i,0,ids);s+='<br><span class="ptbn">'+ids.map(id=>ptMark(ptAff(i,id))+ptM(id).n).join(' ')+' → 報酬 x'+b.m.toFixed(2)+' / 大成功 '+Math.round((.15+b.b)*100)+'%</span>'}
  return s}
/* 29c のフック: 遠征が帰ってきたら「遊ぶ」ボタンと「遠征」タブに ! */
function fmgMark(name,grp){try{if(!expDone())return '';const g=FMGRP.findIndex(G_=>G_.t.indexOf('遠征')>=0);
  if(grp?(g>=0&&FMGRP[g].n===name):name==='遠征')return '<i class="mgdot">!</i>'}catch(e){}return ''}
/* メニューを開いたまま帰還した時は、ボタンに直接「!」を足す(ブラウザのみ。再描画でスクロールが戻らないように) */
let ptTk=0;
FU.push(dt=>{ptTk+=dt;if(ptTk<1)return;ptTk=0;
  try{if(fxOpen&&expDone()&&document.querySelectorAll){const bs=document.querySelectorAll('#fxm .mgG button,#fxm .mgT button');
    for(const b of bs){if(b.querySelector('.mgdot'))continue;const t=(b.getAttribute('data-n')||b.textContent||'').trim();
      if(fmgMark(t,0)||(!b.getAttribute('data-n')&&FMGRP.some(G_=>t.indexOf(G_.n)===0&&fmgMark(G_.n,1))))b.insertAdjacentHTML('beforeend','<i class="mgdot">!</i>')}}}catch(e){}});
/* 仲間タブ(96-allies)に遠征での成長と遠征専用の仲間を足す */
{const f=FM.find(m=>m.n==='仲間');if(f){const o=f.r;f.r=function(){let h=o.apply(this,arguments);try{
  h+='<div class="fxh" style="font-size:18px;margin-top:12px">遠征隊</div><div class="fxs">遠征に連れて行くと Lv アップ(最大 Lv'+PTLV+')。◎ は得意な行き先</div><div class="fxl">'+
   PTM.map(m=>{const on=ptOn(m),fav=EXD.filter((D,i)=>ptAff(i,m.id)===2).map(D=>D.n).join('・');
    return '<div class="'+(on?'ok':'no')+'"><span>'+(on?m.n+(m.ex?' <small>(遠征専用)</small>':''):'???')+'<br><small>'+(on?'◎ '+fav:'STAGE '+m.st+' で加入')+'</small></span><span>'+(on?'Lv '+PTY.lv[m.id]+(PTY.lv[m.id]>=PTLV?' MAX':''):'STAGE '+m.st)+'</span></div>'}).join('')+
   '</div><div class="fxs" style="margin-top:6px">仲間と帰還 '+PTY.trip+'回 / お土産 '+PTY.gift+'個</div>'}catch(e){}return h}}}
/* 遠征専用の仲間の加入トースト(96-allies の3人は 96 側で出る) */
let ptAnn=X.best;
FU.push(()=>{if(X.best>ptAnn){for(const m of PTM)if(m.ex&&m.st>ptAnn&&m.st<=X.best){fxToast('遠征の仲間加入! '+m.n,m.c);try{banner('仲間 '+m.n,m.c)}catch(e){}}ptAnn=X.best}});
if(typeof AC_!=='undefined'){
  AC_.push(['pt1','遠征隊結成','仲間を連れて遠征から帰還',1,()=>PTY.trip>=1,[()=>PTY.trip,1]]);
  AC_.push(['pt10','歴戦の仲間','仲間を Lv10 に',3,()=>PTM.some(m=>PTY.lv[m.id]>=10),[()=>Math.max(...PTM.map(m=>PTY.lv[m.id])),10]]);
  AC_.push(['pt20','お土産マニア','お土産を20個',2,()=>PTY.gift>=20,[()=>PTY.gift,20]]);
  AC_.push(['ex5','天空の覇者','天空の神殿から帰還',4,()=>PTY.sky>=1,[()=>PTY.sky,1]])}
