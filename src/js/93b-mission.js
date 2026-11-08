/* ---------- デイリーミッション (feature) ----------
   毎日3つのお題(日付から決まる)。達成で 宝石2 + 魔石、3つ全部で ボーナス宝石5。メニュー「ミッション」で受け取り。
   進捗はイベントのラップで数える(bigHit / kill / ult / mini / タップ攻撃 / お宝 / RUSHリザルト / ステージ)。
   セーブ: localStorage['pachi2_mission'] = {d:'YYYY-MM-DD', ids:[3], p:[3], c:[3], b:0/1, s0:開始時ステージ} */
const MSD=[
  {k:'hit',n:'大当たり',u:'回',v:[5,10]},{k:'boss',n:'ボス撃破',u:'体',v:[2,4]},{k:'tap',n:'タップ攻撃',u:'回',v:[100,300]},
  {k:'trs',n:'お宝を捕まえる',u:'回',v:[2,3]},{k:'ult',n:'必殺技',u:'回',v:[10,20]},{k:'chain',n:'RUSHで3連チャン以上',u:'回',v:[1,2]},
  {k:'rank',n:'RUSHランク A 以上',u:'回',v:[1,2]},{k:'stage',n:'ステージを進める',u:'',v:[10,20]},{k:'mini',n:'ミニゲーム',u:'回',v:[2,3]}];
let MS=null;
function msToday(){try{return typeof dailyToday==='function'?dailyToday():new Date().toISOString().slice(0,10)}catch(e){return ''}}
function msNew(d){let h=0;for(const ch of d)h=(h*31+ch.charCodeAt(0))>>>0;const idx=[...MSD.keys()],ids=[];while(ids.length<3){h=(h*1103515245+12345)>>>0;const i=idx.splice(h%idx.length,1)[0];ids.push(i)}
  return {d,ids,lv:ids.map((_,j)=>(h>>(j+3))&1),p:[0,0,0],c:[0,0,0],b:0,s0:G.stage}}
function msLoad(){try{const j=JSON.parse(localStorage.getItem('pachi2_mission')||'null');if(j&&Array.isArray(j.ids)&&j.ids.length==3&&j.ids.every(i=>MSD[i])){MS={d:String(j.d||''),ids:j.ids,lv:(j.lv||[0,0,0]).map(v=>v?1:0),p:(j.p||[0,0,0]).map(v=>Math.max(0,Math.floor(+v)||0)),c:(j.c||[0,0,0]).map(v=>v?1:0),b:j.b?1:0,s0:Math.max(1,Math.floor(+j.s0)||1)}}}catch(e){}}
function msSave(){try{localStorage.setItem('pachi2_mission',JSON.stringify(MS))}catch(e){}}
function msCheckDay(){const d=msToday();if(!MS||MS.d!==d){MS=msNew(d);msSave()}}
msLoad();
const msGoal=j=>MSD[MS.ids[j]].v[MS.lv[j]];
function msAdd(k,n){try{msCheckDay();for(let j=0;j<3;j++){const m=MSD[MS.ids[j]];if(m.k!==k||MS.c[j])continue;const g=msGoal(j),was=MS.p[j]>=g;MS.p[j]=k==='stage'?Math.max(MS.p[j],n):Math.min(g,MS.p[j]+(n||1));
  if(!was&&MS.p[j]>=g){fxToast('ミッション達成!「'+m.n+'」 メニューで受け取れます','#7ff3ff');try{if(sOK()){const t=sNow();[1047,1319,1568].forEach((f,i)=>tone(f,t+i*.07,.1,'square',.03))}}catch(e){}}}msSave()}catch(e){}}
function msClaim(j){msCheckDay();if(MS.c[j]||MS.p[j]<msGoal(j))return;MS.c[j]=1;const ms=50+G.stage*2;try{RES.gem+=2;RES.ms+=ms;resSave()}catch(e){}
  fxToast('ミッション報酬 宝石+2 魔石+'+ms,'#7ff3ff');if(MS.c.every(v=>v)&&!MS.b){MS.b=1;try{RES.gem+=5;resSave()}catch(e){}banner('ミッション全達成!!','#7ff3ff');try{kyuin(5,'#7ff3ff')}catch(e){}}msSave();try{fxMenu()}catch(e){}}
// 進捗のフック
{const o=bigHit;bigHit=function(){const r=o.apply(this,arguments);msAdd('hit');return r}}
{const o=kill;kill=function(){const b=isBoss();const r=o.apply(this,arguments);if(b)msAdd('boss');try{msCheckDay();msAdd('stage',G.stage-MS.s0)}catch(e){}return r}}
{const o=ult;ult=function(){const r=o.apply(this,arguments);msAdd('ult');return r}}
if(typeof actTap==='function'){const o=actTap;actTap=function(e){const c0=typeof ACT!=='undefined'?ACT.tc:0,t0=typeof ACT!=='undefined'?ACT.tt:0;const r=o.apply(this,arguments);try{if(ACT.tt!==t0)msAdd('tap')}catch(e2){}return r}}
if(typeof actCatch==='function'){const o=actCatch;actCatch=function(){const r=o.apply(this,arguments);msAdd('trs');return r}}
let MSRR=null,MSMG=false;   // ミニゲームは種類ごとに開始経路が違うので、表示中フラグの立ち上がりで数える
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{const mg=!!MG||(typeof MG2!=='undefined'&&!!MG2);if(mg&&!MSMG)msAdd('mini');MSMG=mg;const R=typeof GK!=='undefined'?GK.rr:null;if(R&&R!==MSRR){MSRR=R;if(R.n>=3)msAdd('chain');if(['A','A+','S','S+'].includes(R.gr))msAdd('rank')}}catch(e){}return r}}
FM.push({n:'ミッション',r:()=>{msCheckDay();const done=MS.c.filter(v=>v).length;return '<div class="fxh">デイリーミッション '+done+'/3</div><div class="fxs">毎日3つ。達成で 宝石2+魔石、全部達成で ボーナス宝石5!(日付が変わると入れ替わる)</div><div class="fxl">'+
  MS.ids.map((id,j)=>{const m=MSD[id],g=msGoal(j),p=Math.min(MS.p[j],g),ok=p>=g;return '<div class="'+(ok||MS.c[j]?'ok':'')+'"><span>'+m.n+' '+g+m.u+'<br><small>'+p+' / '+g+'</small><span style="display:block;height:5px;margin-top:3px;background:#0b0624;box-shadow:0 0 0 1px #000"><span style="display:block;height:100%;width:'+Math.round(p/g*100)+'%;background:'+(ok?'#7ff3ff':'#ffd400')+'"></span></span></span><span>'+(MS.c[j]?'受取済':'<button class="fxb'+(ok?'':' d')+'" style="margin:0;padding:4px 10px" onclick="msClaim('+j+')">受け取る</button>')+'</span></div>'}).join('')+'</div>'+
  '<div class="fxs" style="margin-top:6px">'+(MS.b?'全達成ボーナス 受取済!':'全達成ボーナス: 宝石5')+'</div>'}});
