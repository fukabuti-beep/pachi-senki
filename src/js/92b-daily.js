/* ---------- ログインボーナス (feature) ----------
   1日1回(端末の日付)、ゲーム開始後に受け取りダイアログ。連続日数で報酬が増え、7日目ごとに宝石5個。
   報酬: 魔石 = 20×(連続日数 1〜7) + STAGE、宝石 = 7日目 5 / それ以外 1。途切れたら1日目から。
   セーブ: localStorage['pachi2_daily'] = {last:'YYYY-MM-DD', streak}。日付は dailyToday() で取得(テストで差し替え可)。 */
let DLY={last:'',streak:0,shown:0};
try{const j=JSON.parse(localStorage.getItem('pachi2_daily')||'null');if(j&&typeof j=='object'){DLY.last=typeof j.last=='string'&&/^\d{4}-\d\d-\d\d$/.test(j.last)?j.last:'';DLY.streak=Math.max(0,Math.min(9999,Math.floor(+j.streak)||0))}}catch(e){}
function dailyToday(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dailyPrev(s){const [y,m,d]=s.split('-').map(Number),t=new Date(y,m-1,d-1);return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0')}
function dailySave(){try{localStorage.setItem('pachi2_daily',JSON.stringify({last:DLY.last,streak:DLY.streak}))}catch(e){}}
function dailyClaim(){const td=dailyToday();if(DLY.last===td)return null;DLY.streak=DLY.last&&DLY.last===dailyPrev(td)?DLY.streak+1:1;DLY.last=td;dailySave();
  const day=(DLY.streak-1)%7+1,ms=20*day+G.stage,gem=day==7?5:1;
  try{if(typeof RES!=='undefined'){RES.ms+=ms;RES.gem+=gem;resSave()}}catch(e){}return {day,streak:DLY.streak,ms,gem}}
function dailyShow(r){const cal=Array.from({length:7},(_,i)=>'<span style="display:inline-block;width:34px;margin:2px;padding:4px 0;font-size:11px;'+(i+1<r.day?'background:#3a2a8a;color:#c8c0ff':i+1==r.day?'background:#ffd400;color:#2a1000':'background:#140a3c;color:#5a4a9a')+';box-shadow:0 0 0 2px #000">'+(i+1)+'日'+(i==6?'<br>宝5':'')+'</span>').join('');
  try{fxShow('<div class="fxh">ログインボーナス</div><div class="fxs">連続 '+r.streak+' 日目</div><div style="margin:8px 0">'+cal+'</div><div class="fxn" style="font-size:18px">魔石 +'+fmt(r.ms)+' / 宝石 +'+r.gem+'</div><div class="fxs">毎日遊ぶと報酬アップ。7日目は宝石5個!</div>',[['受け取る!',()=>{try{kyuin(4,'#ffd400');jara()}catch(e){}}]])}catch(e){}}
let DLYT=0;
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{if(!DLY.shown&&run){DLYT+=dt;if(DLYT>2.5&&!(typeof fxOpen!=='undefined'&&fxOpen)&&!cut&&!G.roul){DLY.shown=1;const c=dailyClaim();if(c)dailyShow(c)}}}catch(e){DLY.shown=1}return r}}
