/* ---------- ボタン演出の動き (fx) / 見た目は css/39-btnfx.css ----------
   押せ!!(#push #pkB): 出現でバウンド → 待機は脈動+回る光の輪 → 押下で沈み込み+二重の衝撃波(+SE)。
   チャンスボタン(#gkcb, 98b): 出現でバウンド(+SE)・回る光の輪。押すと同じ場所に「残像」(#hycbg)を出して沈み込み+衝撃波 →
     結果の動き: 激アツ/確定=跳ね上がって金の輪 / チャンス!!=小さく跳ねる / チャンス!(低)=しぼんで色が抜ける。当否・文言は 98b のまま。
   ハンドル(#hd): 押すたびに小さな衝撃波(連打でも 0.12 秒に1回)。
   動きは CSS アニメーション(transform/opacity のみ)。prefers-reduced-motion では動きを止める。 */
function hbRe(el,cls){try{if(!el)return;const c=String(el.className||'').split(' ').filter(x=>x&&x!==cls).join(' ');el.className=c;void el.offsetWidth;el.className=(c?c+' ':'')+cls}catch(e){}}
{const o=pushPrompt;pushPrompt=function(){const was=PUSH,r=o.apply(this,arguments);try{if(!was&&PUSH)seHy('pop')}catch(e){}return r}}
{const o=pushPress;pushPress=function(auto){const P0=PUSH,ok=P0&&!P0.done,r=o.apply(this,arguments);try{if(ok){seHy('wave');const e=$('push');if(e&&e.className.indexOf('hyw')<0)e.className+=' hyw'}}catch(e){}return r}}
// チャンスボタン
let HBG=null;
function hbGhost(){if(HBG)return HBG;try{HBG=document.createElement('div');HBG.id='hycbg';HBG.innerHTML='<b>CHANCE</b><i>PUSH</i><s></s>';if(HBG.style)HBG.style.display='none';document.body.appendChild(HBG)}catch(e){HBG=null}return HBG}
{const o=cbShow;cbShow=function(){const r=o.apply(this,arguments);try{seHy('pop')}catch(e){}return r}}
{const o=cbPress;cbPress=function(){const C=ACT.cb,live=C&&!C.done&&sp&&sp===C.s;let L=null,top=null;
  if(live){try{const b=$('gkcb');L=b.style.left;top=b.style.top}catch(e){}}
  const r=o.apply(this,arguments);
  if(live)try{const m=String($('msg').textContent||''),k=/激アツ|確定/.test(m)?'hot':/チャンス!!/.test(m)?'mid':'low',g=hbGhost();seHy('wave');
    if(g){g.style.left=L;g.style.top=top;g.style.display='flex';g.style.setProperty&&g.style.setProperty('--hc',k==='hot'?'#ffd400':k==='mid'?'#33dd66':'#44aaff');g.className='';void g.offsetWidth;g.className='go hy'+k;
      const G0=g;presLater(()=>{try{if(G0.className.indexOf('go')>=0){G0.style.display='none';G0.className=''}}catch(e){}},950)}}catch(e){}
  return r}}
// ハンドル
{let lt=-9;const h=$('hd');try{if(h&&h.addEventListener)h.addEventListener('pointerdown',()=>{if(T-lt<.12)return;lt=T;hbRe(h,'hyp')})}catch(e){}}
