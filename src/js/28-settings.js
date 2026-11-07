/* ---------- ui: 設定パネル (音量/フラッシュ強度/ミュート/データリセット) ---------- */
(function(){
const S=UX.S,on=(id,ev,fn)=>{const e=$(id);if(e&&e.addEventListener)e.addEventListener(ev,fn)};
let scale=1;/* setVol に渡す値のスケール(getVol の戻り値から推定。無ければ0..1) */
/* sound担当の setVol(bgm,se) / getVol() があれば使う。getVol は {bgm,se} か [bgm,se] を想定 */
function readVol(){try{if(typeof getVol!='function')return null;const v=getVol();const b=Array.isArray(v)?v[0]:v&&v.bgm,e=Array.isArray(v)?v[1]:v&&v.se;if(typeof b!='number'||typeof e!='number')return null;if(Math.max(b,e)>1)scale=100;return [b/scale*100,e/scale*100]}catch(x){return null}}
function applyAudio(){try{const m=S.mute?0:1;if(typeof setVol=='function')setVol(S.bgm/100*m*scale,S.se/100*m*scale);else if(typeof BG!='undefined'&&BG){const o=BG.on;BG.on=!(S.mute||S.bgm<=0);if(BG.on&&!o&&AC)BG.nx=AC.currentTime+.1;const mu=$('mu');if(mu)mu.style.opacity=BG.on?1:.4}}catch(e){}}
function paint(){const set=(id,t)=>{const e=$(id);if(e)e.textContent=t};
const bv=$('cfgBgm'),sv=$('cfgSe');if(bv)bv.value=S.bgm;if(sv)sv.value=S.se;set('cfgBgmV',S.bgm);set('cfgSeV',S.se);
[2,1,0].forEach(v=>{const e=$('cfgF'+v);if(e&&e.classList)e.classList[S.fl==v?'add':'remove']('on')});
const m=$('cfgMute');if(m){m.textContent=S.mute?'ON':'OFF';if(m.classList)m.classList[S.mute?'add':'remove']('on')}}
function open(){if(!S.loaded){const v=readVol();if(v){S.bgm=Math.round(v[0]/5)*5;S.se=Math.round(v[1]/5)*5}S.loaded=1}paint();const c=$('cfg'),cf=$('cfgCf');if(cf&&cf.classList)cf.classList.remove('on');if(c&&c.classList)c.classList.add('on')}
function close(){const c=$('cfg');if(c&&c.classList)c.classList.remove('on')}
on('cfgb','click',open);on('cfgX','click',close);
on('cfg','click',e=>{if(e&&e.target&&e.target.id==='cfg')close()});
on('cfgBgm','input',()=>{S.bgm=+$('cfgBgm').value||0;paint();applyAudio();UX.save()});
on('cfgSe','input',()=>{S.se=+$('cfgSe').value||0;paint();applyAudio();UX.save()});
[2,1,0].forEach(v=>on('cfgF'+v,'click',()=>{S.fl=v;paint();UX.save();if(v>0)flash('#ffffff')}));
on('cfgMute','click',()=>{S.mute=S.mute?0:1;paint();applyAudio();UX.save()});
on('cfgRst','click',()=>{const c=$('cfgCf');if(c&&c.classList)c.classList.add('on')});
on('cfgNo','click',()=>{const c=$('cfgCf');if(c&&c.classList)c.classList.remove('on')});
on('cfgYes','click',()=>{try{localStorage.removeItem('pachi2')}catch(e){}try{if(typeof location!='undefined')location.reload()}catch(e){}});
/* 保存済み設定を音声側へ反映(音声ファイルのロード順に依存しないよう遅延) */
const boot=()=>{if(S.loaded)applyAudio()};
setTimeout(boot,0);on('go','click',()=>setTimeout(boot,0));
})();
