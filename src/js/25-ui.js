/* ---------- ui: upgrade buttons, HUD refresh, flash/shake/msg ---------- */
$('up').innerHTML=UP.map((u,i)=>`<button id="u${i}" onclick="buy(${i})"><canvas class="ic" id="ic${i}" width="10" height="10"></canvas><b>${u[1]}</b><span>Lv<s id="l${i}" style="text-decoration:none"></s> ${u[2]}</span><em id="c${i}"></em></button>`).join('');
function uiSet(id,t){const e=$(id);t=''+t;if(e._t!==t){e._t=t;e.textContent=t}}
function refresh(){let n=0;UP.forEach((u,i)=>{const c=cost(i),ok=G.gold>=c,vis=G.stage>=(u[4]||0);uiSet('l'+i,G.lv[i]);uiSet('c'+i,'G '+fmt(c));const b=$('u'+i),cl=ok?'ok':'',d=vis?'':'none';if(b.className!==cl)b.className=cl;if(b.style.display!==d)b.style.display=d;if(ok&&vis)n++});
uiSet('ubd',n||'');uiSet('gd',fmt(G.gold));uiSet('st',G.stage+(isBoss()?' BOSS':''));uiSet('cb',G.rush>0?'RUSH x'+G.combo+' '+Math.ceil(G.rush)+'s':'');
const qh='<b class="hl">保留</b>'+QL.map(o=>'<i class="gm c'+o.c+'"></i>').join('')+'<i class="gm"></i>'.repeat(4-QL.length),q=$('q');if(q._h!==qh){q._h=qh;q.innerHTML=qh}
const w=G.sp+'%',sb=$('spb');if(sb.style.width!==w)sb.style.width=w;uiSet('pl','G '+fmt(G.pool))}
/* フラッシュ強度: UX.S.fl 2=強(演出どおり) 1=弱(薄く・約2Hz以下に間引き) 0=OFF */
let uiFlT=-1e9;
function flash(c){const f=$('fl'),S=(typeof UX!=='undefined'&&UX.S)||{fl:2};if(S.fl<=0)return;const now=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
if(S.fl==1){if(now-uiFlT<500)return}uiFlT=now;f.style.background=c;f.className='';void f.offsetWidth;f.className=S.fl==1?'on w':'on'}
function shake(){if(typeof UX!=='undefined'&&UX.S&&UX.S.fl<=0)return;const a=$('app');a.classList.remove('shake');void a.offsetWidth;a.classList.add('shake')}
function showMsg(t,c){const m=$('msg');m.textContent=t;m.style.color=c||'#fff'}
