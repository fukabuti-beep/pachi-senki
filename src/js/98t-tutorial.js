/* ---------- チュートリアル(はじめのガイド + 新機能の一言ガイド) (feature) ----------
   ・はじめて遊ぶ人に、最初の数分で 玉→スタート口→スロット→英雄の戦い→タップ→強化→大当たり(RUSH) を順に一言ずつ。
     対象(盤面/スロット/戦闘画面/ハンドル/強化ボタン/☰)をゆっくり光る枠で囲み、英雄の吹き出しで説明する。
   ・操作は止めない・待たせない: 枠と吹き出しは画面に重ねるだけ(枠はタップを素通し)。吹き出しは数秒で自動で消え、タップで次へ、「スキップ」で序盤ガイドを全部飛ばす。
   ・新機能が解放された時(STAGE 到達/はじめてのボス/SP/転生 など)にその機能の一言ガイドを1回だけ。
   ・一度出したガイドは二度と出さない(localStorage['pachi2_tut'] の g。98s-story と共用)。旧セーブ(すでに進んでいる人)には序盤ガイドを出さず、
     その時点で条件を満たしている新機能ガイドも既読にする。
   ・演出中(JACKPOT/押せ!!/全画面ルーレット/ミニゲーム/メニュー)は隠して時間を止める。物語の会話シーン(98s)が出ている間は待つ。
   ・光過敏への配慮: 枠の明滅は約0.7Hzのゆっくりした明るさの変化だけ(全画面の点滅なし)。prefers-reduced-motion では止める。
   ・Math.random は使わない(sim の乱数列を変えない)。
   フック: 他ファイルの編集なし(update をラップ、FM.push で「遊び方」タブ)。 */
const tutFM=()=>{try{return FM.some(m=>String(m.n).indexOf('転生')===0)}catch(e){return false}};
const tutMinCost=()=>{let m=Infinity;try{for(let i=0;i<G.lv.length;i++){const c=cost(i);if(c<m)m=c}}catch(e){}return m};
const tutSheet=()=>{try{return $('app').classList.contains('upo')}catch(e){return false}};
/* who=しゃべる英雄(0剣士/1魔法使い/2弓使い) el=光らせる要素の id(関数可) d=表示秒 c=出す条件 done=早めに消す条件 intro=序盤ガイド */
const TG=[
{id:'ball',intro:1,el:'pw',who:2,d:5,tx:'玉が釘をはじいて落ちていくよ。まん中の「スタート口」に入ると…'},
{id:'slot',intro:1,el:'slot',who:1,d:5,tx:'スロットが回るの! 同じ数字が3つそろえば大当たり!'},
{id:'hero',intro:1,el:'bw',who:0,d:5,tx:'俺たちは自動で戦う! 放置していても、どんどん先へ進むぜ'},
{id:'tap',intro:1,el:'hd',who:2,d:5,tx:'ハンドルや盤面をタップすると玉を追加できるよ(放置でもOK)'},
{id:'up',intro:1,el:'ubt',who:1,d:8,tx:'ゴールドがたまったら「強化」! 攻撃力や当たりやすさを上げられるわ',c:()=>G.gold>=tutMinCost()||TUT.age>50,done:tutSheet},
{id:'rush',intro:1,el:'bw',who:0,d:5,tx:'大当たりで RUSH に突入! 約10秒、攻撃も玉も増える大チャンスだ!',c:()=>X.st.hit>=1},
{id:'sp',el:'spw',who:1,d:5,tx:'SPゲージが満タンになると、必殺技が自動で出るわ',c:()=>G.sp>=60},
{id:'boss',el:'bw',who:0,d:5,tx:'ボスだ! 倒すとミニゲームや遺物(お宝)が出ることがあるぞ',c:()=>isBoss()},
{id:'menu',el:'fxmb',who:2,d:6,tx:'☰ メニューには ミッション・図鑑・遺物・仲間 などがあるよ',c:()=>X.best>=6},
{id:'exp',el:'fxmb',who:2,d:6,tx:'☰ の「遠征」で仲間を送り出すと、時間がたってからお宝を持ち帰るよ',c:()=>X.best>=10},
{id:'smith',el:'ubt',who:0,d:6,tx:'強化画面の「鍛冶屋」で、魔石を使って武器を鍛えられるぞ',c:()=>X.best>=15},
{id:'pres',el:()=>tutFM()?'fxmb':'ubt',who:1,d:7,tx:'STAGE 30 から「転生」できるわ。最初に戻るかわりに魂がもらえて、ずっと強くなれる',c:()=>G.stage>=30||X.best>=30},
{id:'altar',el:'ubt',who:1,d:7,tx:'魂は強化画面の「魂の祭壇」で、開始ステージなどの永続強化に使えるわ',c:()=>X.pres>=1}];
const TUT={cur:null,el:null,ring:null,age:0,gap:1.5,hold:0};
/* 旧セーブ: 序盤ガイドを出さない + 今の時点で条件を満たしている新機能ガイドも既読 */
if(TS.old&&TS_NEW){TG.forEach(g=>{try{if(g.intro||(g.c&&g.c()))TS.g[g.id]=1}catch(e){}});tsSave()}
const tutDisp=id=>{try{const e=$(id);return !!(e&&e.style&&e.style.display==='flex')}catch(e){return false}};
function tutBusy(){try{
  if(!run)return true;if(typeof fxOpen!=='undefined'&&fxOpen)return true;
  if(typeof lyBig==='function'?lyBig():(G.jp>0||(typeof PUSH!=='undefined'&&PUSH)||(typeof RL!=='undefined'&&RL)))return true;
  if(tutDisp('rl')||tutDisp('mg')||tutDisp('fxg'))return true;
  if(typeof STY!=='undefined'&&STY.cur)return true;
  return false}catch(e){return true}}

(function(){try{const s=document.createElement('style');s.textContent=
'#tutR{position:fixed;z-index:8;pointer-events:none;display:none;border:3px solid #ffd400;box-shadow:0 0 0 2px #000,0 0 14px 3px rgba(255,212,0,.55),inset 0 0 0 2px #000;animation:tutP 1.4s ease-in-out infinite}'+
'#tutR:before,#tutR:after{content:"";position:absolute;width:8px;height:8px;background:#fff;box-shadow:0 0 0 2px #000}#tutR:before{left:-6px;top:-6px}#tutR:after{right:-6px;bottom:-6px}'+
'@keyframes tutP{0%,100%{border-color:#ffd400;box-shadow:0 0 0 2px #000,0 0 10px 2px rgba(255,212,0,.35),inset 0 0 0 2px #000}50%{border-color:#fff3a0;box-shadow:0 0 0 2px #000,0 0 18px 5px rgba(255,212,0,.7),inset 0 0 0 2px #000}}'+
'#tutB{position:fixed;left:0;top:0;width:300px;z-index:8;display:none;transform-origin:0 0;pointer-events:auto;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}'+
'#tutB .tb{position:relative;background:#fff;color:#14021f;box-shadow:0 0 0 2px #000,0 4px 0 #000;padding:7px 8px 7px 42px;font-size:13px;line-height:1.45;animation:tutIn .2s ease-out}'+
'#tutB .tb:after{content:"";position:absolute;left:var(--ax,40px);width:10px;height:10px;background:#fff;box-shadow:2px 2px 0 #000;transform:rotate(45deg)}'+
'#tutB.up .tb:after{bottom:-6px}#tutB.dn .tb:after{top:-6px;box-shadow:-2px -2px 0 #000}'+
'#tutB canvas{position:absolute;left:6px;top:50%;margin-top:-15px;width:30px;height:30px;image-rendering:pixelated;background:#1b1348;box-shadow:0 0 0 2px #000}'+
'#tutB .tn{display:block;font-size:10px;letter-spacing:1px;margin-bottom:1px}'+
'#tutB .tf{display:flex;justify-content:space-between;align-items:center;margin-top:4px;font-size:10px;color:#6a5aa8}'+
'#tutB .tf button{font:inherit;font-size:10px;color:#fff;background:#4a3aa8;border:2px solid #000;padding:1px 7px;line-height:14px}'+
'#tutB .tf .bar{flex:1;height:3px;background:#d8dcff;margin:0 6px}#tutB .tf .bar b{display:block;height:100%;background:#ff2d7a;width:0}'+
'@keyframes tutIn{0%{opacity:0;transform:scale(.92)}100%{opacity:1;transform:none}}'+
'@media (prefers-reduced-motion:reduce){#tutR{animation:none}#tutB .tb{animation:none}}'+
'.tutL{text-align:left;font-size:12px;line-height:1.5}.tutL p{margin:0;padding:5px 2px;border-bottom:1px dotted #4a3aa8}.tutL p.no{opacity:.45}';
(document.head||document.body).appendChild(s)}catch(e){}})();
function tutEls(){if(TUT.el)return TUT.el;
  const r=document.createElement('div');r.id='tutR';document.body.appendChild(r);TUT.ring=r;
  const b=document.createElement('div');b.id='tutB';
  b.innerHTML='<div class="tb"><canvas id="tutC" width="12" height="12"></canvas><b class="tn" id="tutN"></b><span id="tutT"></span><div class="tf"><span id="tutS"></span><i class="bar"><b id="tutBar"></b></i><button type="button" id="tutK">スキップ</button></div></div>';
  document.body.appendChild(b);TUT.el=b;
  try{b.addEventListener('click',ev=>{try{if(ev&&ev.target&&ev.target.id==='tutK'){tutSkip();return}tutClose()}catch(x){}})}catch(x){}
  return b}
function tutTarget(g){try{const id=typeof g.el==='function'?g.el():g.el;const e=id&&$(id);if(!e)return null;const r=e.getBoundingClientRect();return r&&r.width>0&&r.height>0?r:null}catch(e){return null}}
/* 枠と吹き出しを置く: 対象が画面の上半分なら吹き出しは下、下半分なら上。吹き出しは #app の拡大率で scale */
function tutPlace(){const C=TUT.cur;if(!C)return;const b=TUT.el,R=TUT.ring;let k=1,aw=393,ah=852;
  try{aw=window.innerWidth||393;ah=window.innerHeight||852;const a=$('app').getBoundingClientRect();if(a&&a.width>0)k=a.width/384}catch(e){}
  const r=tutTarget(C.g),bw=300*k;
  if(r){R.style.display='block';R.style.left=Math.round(r.left-4)+'px';R.style.top=Math.round(r.top-4)+'px';R.style.width=Math.round(r.width+2)+'px';R.style.height=Math.round(r.height+2)+'px'}else R.style.display='none';
  let x=(aw-bw)/2,y=ah*.4,up=false,ax=40;
  if(r){const cx=r.left+r.width/2;x=Math.max(6,Math.min(aw-bw-6,cx-bw/2));ax=Math.max(14,Math.min(276,(cx-x)/k-5));
    const big=r.height>ah*.3;   // 盤面のような大きい対象は内側の上寄りに重ねる
    if(big){y=r.top+12*k}else if(r.top+r.height/2<ah*.5){y=r.bottom+12;up=false}else{up=true;y=r.top-12-86*k}}
  y=Math.max(4,Math.min(ah-90*k,y));
  b.className=r?(up?'up':'dn'):'';b.style.setProperty&&b.style.setProperty('--ax',Math.round(ax)+'px');
  b.style.transform='scale('+k.toFixed(4)+')';b.style.left=Math.round(x)+'px';b.style.top=Math.round(y)+'px'}
function tutStart(g){TS.g[g.id]=1;tsSave();tutEls();TUT.cur={g,t:0};
  try{$('tutN').textContent=STH[g.who].n+'('+STH[g.who].r+')';$('tutN').style.color=['#c8401f','#8a3ad0','#1f9a4a'][g.who];$('tutT').textContent=g.tx;
    const ni=TG.filter(q=>q.intro),ii=ni.indexOf(g);$('tutS').textContent=g.intro?'ガイド '+(ii+1)+'/'+ni.length:'NEW';
    $('tutK').style.display=g.intro?'':'none';
    const cv=$('tutC'),x=cv.getContext('2d'),s=SPR['h'+g.who];if(x&&s){x.imageSmoothingEnabled=false;x.clearRect(0,0,12,12);x.drawImage(s,0,0,12,12)}}catch(e){}
  TUT.el.style.display='block';tutPlace()}
function tutClose(){TUT.cur=null;TUT.gap=1.5;if(TUT.el)TUT.el.style.display='none';if(TUT.ring)TUT.ring.style.display='none'}
function tutSkip(){TG.forEach(g=>{if(g.intro)TS.g[g.id]=1});TS.skip=1;tsSave();tutClose()}
function tutVis(v){if(!TUT.el)return;const d=v?'block':'none';if(TUT.el.style.display!==d){TUT.el.style.display=d;if(v)tutPlace();else TUT.ring.style.display='none'}}
function tutNext(){for(const g of TG){if(TS.g[g.id])continue;if(g.intro&&TS.skip)continue;if(!g.intro&&TS.off)continue;let ok=true;try{ok=!g.c||!!g.c()}catch(e){ok=false}if(ok)return g;if(g.intro&&!g.c)return null}return null}
function tutUpd(dt){if(!run)return;TUT.age+=dt;const C=TUT.cur;
  if(C){if(tutBusy()){tutVis(false);return}tutVis(true);C.t+=dt;TUT.hold+=dt;if(TUT.hold>.4){TUT.hold=0;tutPlace()}
    try{$('tutBar').style.width=Math.min(100,C.t/C.g.d*100).toFixed(1)+'%'}catch(e){}
    let dn=false;try{dn=C.g.done&&C.g.done()}catch(e){}if(C.t>=C.g.d||dn)tutClose();return}
  if(TUT.gap>0){TUT.gap-=dt;return}
  if(tutBusy()||(typeof STY!=='undefined'&&STY.q.length))return;   // 物語のシーン待ちがあれば先に
  if(TUT.age<1.2)return;
  const g=tutNext();if(g)tutStart(g)}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{tutUpd(dt)}catch(e){if(typeof FERR!=='undefined')FERR++}return r}}

/* ===== メニュー「遊び方」(どのグループにも当てはまらないので「その他」へ) ===== */
function tutReset(){TG.forEach(g=>{if(g.intro)delete TS.g[g.id]});TS.skip=0;tsSave();TUT.age=0;TUT.gap=.5;try{fxClose()}catch(e){}try{fxToast('はじめのガイドをもう一度表示します','#ffd400')}catch(e){}}
function tutOff(){TS.off=TS.off?0:1;tsSave();try{fxMenu()}catch(e){}}
FM.push({n:'遊び方',r:()=>'<div class="fxh">遊び方</div><div class="fxs">玉がスタート口に入るとスロットが回り、そろえば大当たり。英雄は自動で戦うので、放置でも進みます。</div><div class="tutL">'+
  TG.map(g=>TS.g[g.id]?'<p>'+g.tx+'</p>':'<p class="no">??? (まだ出ていないガイド)</p>').join('')+'</div>'+
  '<button class="fxb" type="button" onclick="tutReset()">はじめのガイドをもう一度</button><button class="fxb g" type="button" onclick="tutOff()">新機能のガイド: '+(TS.off?'OFF':'ON')+'</button>'});
