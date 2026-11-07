/* ---------- ui: upgrade buttons, HUD refresh, flash/shake/msg ---------- */
$('up').innerHTML=UP.map((u,i)=>`<button id="u${i}" onclick="buy(${i})"><i class="ic">${u[0]}</i><b>${u[1]}</b><span>Lv<s id="l${i}" style="text-decoration:none"></s> ${u[2]}</span><em id="c${i}"></em></button>`).join('');
function refresh(){UP.forEach((u,i)=>{$('l'+i).textContent=G.lv[i];$('c'+i).textContent='G '+fmt(cost(i));$('u'+i).className=G.gold>=cost(i)?'ok':'';$('u'+i).style.display=G.stage>=(u[4]||0)?'':'none'});$('gd').textContent=fmt(G.gold);$('st').textContent=G.stage+(isBoss()?' BOSS':'');$('cb').textContent=G.rush>0?'RUSH x'+G.combo+' '+Math.ceil(G.rush)+'s':'';$('q').innerHTML='保留 '+QL.map(o=>'<s style="text-decoration:none;color:'+['#fff','#4af','#3d6','#f24','#ffd400'][o.c]+'">●</s>').join('')+'○'.repeat(4-QL.length);$('spb').style.width=G.sp+'%';$('pl').textContent='JACKPOT G '+fmt(G.pool)}
function flash(c){const f=$('fl');f.style.background=c;f.className='';void f.offsetWidth;f.className='on'}
function shake(){const a=$('app');a.classList.remove('shake');void a.offsetWidth;a.classList.add('shake')}
function showMsg(t,c){const m=$('msg');m.textContent=t;m.style.color=c||'#fff'}
