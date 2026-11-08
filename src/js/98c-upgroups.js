/* ---------- 強化画面のグループ切り替え (ui/feature) ----------
   強化画面(#sheet)のヘッダー下に「通常強化 / 鍛冶屋 / 魂の祭壇」のタブ。鍛冶屋・魂の祭壇は三本線メニューから強化画面へ移動。
   中身は各機能の描画関数(FM の r)をそのまま使い、#upx に表示。ボタン操作後は grpRefresh() で開いている方を描き直す。 */
const UPG={g:0,list:[['通常強化',null]],t:0};
(function(){const take=n=>{const i=FM.findIndex(m=>m.n===n);if(i<0)return null;return FM.splice(i,1)[0].r};
  const sm=take('鍛冶屋'),so=take('魂の祭壇');if(sm)UPG.list.push(['鍛冶屋',sm]);if(so)UPG.list.push(['魂の祭壇',so]);
  try{const sh=document.querySelector?document.querySelector('#sheet .sh'):null,up=$('up');if(!up||!up.parentNode)return;
    const bar=document.createElement('div');bar.id='upg';bar.innerHTML=UPG.list.map((g,i)=>'<button type="button" data-g="'+i+'" class="'+(i?'':'on')+'">'+g[0]+'</button>').join('');
    const box=document.createElement('div');box.id='upx';box.style.display='none';
    up.parentNode.insertBefore(bar,up);up.parentNode.insertBefore(box,up.nextSibling);
    bar.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('button'):null;if(b)grpSet(+b.getAttribute('data-g'))})}catch(e){}})();
function grpSet(i){UPG.g=Math.max(0,Math.min(UPG.list.length-1,i|0));try{const bar=$('upg');if(bar&&bar.querySelectorAll)bar.querySelectorAll('button').forEach((b,k)=>b.className=k===UPG.g?'on':'');
  $('up').style.display=UPG.g?'none':'';$('upx').style.display=UPG.g?'block':'none';grpRender()}catch(e){}}
function grpRender(){if(!UPG.g)return;try{const r=UPG.list[UPG.g][1];$('upx').innerHTML=r?r():''}catch(e){}}
const sheetOpen=()=>{try{return $('app').classList.contains('upo')}catch(e){return false}};
function grpRefresh(){if(UPG.g&&sheetOpen())grpRender();if(typeof fxOpen!=='undefined'&&fxOpen)try{fxMenu()}catch(e){}}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{if(UPG.g&&sheetOpen()){UPG.t+=dt;if(UPG.t>1){UPG.t=0;const a=document.activeElement;if(!a||a.tagName!=='INPUT')grpRender()}}}catch(e){}return r}}
