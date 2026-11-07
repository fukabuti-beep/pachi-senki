/* ---------- ui: upgrade buttons, HUD refresh, flash/shake/msg ---------- */
/* 桁区切り表示(HUD/強化シート用)。100万未満は 12,345 形式、それ以上は fmt() の K/M/B */
function fmtC(n){if(n===Infinity)return'MAX';n=Math.floor(n);if(!(n>=0))return'0';if(n>=1e6)return fmt(n);return n<1e3?''+n:Math.floor(n/1e3)+','+('00'+(n%1e3)).slice(-3)}
/* 強化ボタン: 名前 / 説明(MAXは Lv 横に分離) / 現在Lv / 価格 / 所持金ゲージ(--p) */
$('up').innerHTML=UP.map((u,i)=>`<button id="u${i}" type="button" onclick="buy(${i})"><canvas class="ic" id="ic${i}" width="10" height="10"></canvas><b>${u[1]}</b><span><i class="lv">Lv<i id="l${i}"></i></i> ${u[2].replace(/\s*MAX\d+/,'')}</span><em id="c${i}"></em></button>`).join('');
function uiSet(id,t){const e=$(id);t=''+t;if(e._t!==t){e._t=t;e.textContent=t}}
function refresh(){let n=0,nx=-1,nr=-1;const cs=[],rs=[];
UP.forEach((u,i)=>{const c=cost(i),ok=G.gold>=c,vis=G.stage>=(u[4]||0),mx=c===Infinity,r=mx?1:Math.min(1,G.gold/c);cs[i]=[c,ok,vis,mx];rs[i]=r;if(vis&&!ok&&!mx&&r>nr){nr=r;nx=i}});
/* nx = 次に買える強化(いちばん近い未達)。強調表示 */
UP.forEach((u,i)=>{const c=cs[i],b=$('u'+i),cl=(c[1]?'ok':'')+(c[3]?' mx':'')+(i===nx?' nx':''),d=c[2]?'':'none';
uiSet('l'+i,G.lv[i]+(c[3]||UPMAX[i]===Infinity?'':'/'+UPMAX[i]));uiSet('c'+i,c[3]?'MAX':'G '+fmtC(c[0]));
if(b._cl!==cl){b._cl=cl;b.className=cl.trim()}
const pv=c[1]||c[3]?'1':''+Math.floor(rs[i]*20)/20;if(b._p!==pv){b._p=pv;if(b.style.setProperty)b.style.setProperty('--pf',pv)}
if(b._d!==d){b._d=d;b.style.display=d}if(c[1]&&c[2])n++});
uiSet('ubd',n||'');uiSet('shn',n?'買える x'+n:'');uiSet('gd',fmtC(G.gold));uiSet('st',G.stage+(isBoss()?' BOSS':''));uiSet('cb',G.rush>0?'RUSH x'+G.combo+' '+Math.ceil(G.rush)+'s':'');
const qh='<b class="hl">保留</b>'+QL.map(o=>'<i class="gm c'+o.c+'"></i>').join('')+'<i class="gm"></i>'.repeat(4-QL.length),q=$('q');if(q._h!==qh){q._h=qh;q.innerHTML=qh}
const w=G.sp+'%',sb=$('spb');if(sb.style.width!==w)sb.style.width=w;uiSet('pl','G '+fmtC(G.pool))}
/* フラッシュ強度: UX.S.fl 2=強(演出どおり) 1=弱(薄く・約2Hz以下に間引き) 0=OFF */
let uiFlT=-1e9;
function flash(c){const f=$('fl'),S=(typeof UX!=='undefined'&&UX.S)||{fl:2};if(S.fl<=0)return;const now=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
if(S.fl==1){if(now-uiFlT<500)return}uiFlT=now;f.style.background=c;f.className='';void f.offsetWidth;f.className=S.fl==1?'on w':'on'}
function shake(){if(typeof UX!=='undefined'&&UX.S&&UX.S.fl<=0)return;const a=$('app');a.classList.remove('shake');void a.offsetWidth;a.classList.add('shake')}
function showMsg(t,c){const m=$('msg');m.textContent=t;m.style.color=c||'#fff'}
