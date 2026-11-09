/* ---------- ui: リソースのドット絵アイコン ----------
   12x12 ドットのオリジナル絵(文字マップ。左右対称のものは 26-dots/10-sprites と同じく左半分を鏡像)。画像ファイルは作らない。
   公開:
     resIcon(kind[,cls])     → HTML 文字列 '<i class="ri ri-gold"></i>'(CSS の背景に SVG を埋め込み。知らない kind は '')
     resAmt(kind,text[,cls]) → アイコン + 文字(色つき)'<span class="ra ra-gem"><i class="ri ri-gem"></i>27</span>'
     resIconCanvas(ctx,kind,x,y[,size]) → Canvas に描く(size=表示px、既定12)。描けたら true
     RESK                    → 使える kind の一覧
   kind: 'gold'(ゴールド) 'ms'(魔石) 'gem'(宝石) 'soul'(魂) 'relic'(遺物) 'exp'(経験値)。'g'/'G'/'魔石'/'宝石'/'魂'/'遺物' も可。
   CSS(大きさ・行揃え)は css/41-resicon.css。背景画像のルールだけはドットの定義から作ってここで <style> に入れる。 */
const RESICON=(()=>{
const PAL={k:'#1a0f2e',w:'#ffffff',y:'#ffd400',Y:'#c47f00',o:'#ffa03a',O:'#b0560a',r:'#ff3355',v:'#a066ff',V:'#5a2ca8',l:'#e6dcff',c:'#27e3ff',C:'#0d86a8',g:'#43e060',G:'#168a35',p:'#ffc8f0'};
const mir=rows=>rows.map(r=>r+[...r].reverse().join(''));   // 左半分(6列)→12列
const M={
gold:['....kkkk....','..kkyyyykk..','.kywwyyyyyk.','.kwyyYYYyYk.','kywyYyyyYyYk','kywyYyyyyyYk','kyyyYyyYYyYk','kyyyYyyyYyYk','.kyyyYYYyYk.','.kYyyyyyYYk.','..kkYYYYkk..','....kkkk....'],
ms:['.....kk.....','....kllk....','...klwvVk...','..klwvvVVk..','.klwvvvVVVk.','.klvvvvVVVk.','.kvvvvvVVVk.','.kvvvvVVVVk.','..kvvvVVVk..','...kvvVVk...','....kvVk....','.....kk.....'],
gem:['............','...kkkkkk...','..kwwcccCk..','.kwccwccCCk.','kwcccwcccCCk','kkkkkkkkkkkk','.kcwcccccCk.','..kcwcccCk..','...kcwcCk...','....kcCk....','.....kk.....','............'],
soul:['......k.....','.....klk....','.....klvk...','....klvvk...','...klwvvVk..','..klwwvvVVk.','.klwwvvvvVk.','.klwkvvkvVk.','.klvvvvvVVk.','..kvvvvVVk..','...kVVVVk...','....kkkk....'],
relic:['....kkkk....','...kO..Ok...','....kOOk....','..kkkkkkkk..','.koooooooOk.','kowoorroooOk','kooorwrrooOk','kooorrrrooOk','koooorroooOk','.koooooooOk.','..kOOOOOOk..','...kkkkkk...'],
exp:mir(['.....k','....kg','....kw','kkkkkw','.kgggg','..kggg','...kgg','...kgg','..kggg','..kgkk','.kk...','......'])};
const AL={g:'gold',G:'gold','ゴールド':'gold','魔石':'ms','宝石':'gem','魂':'soul','遺物':'relic','経験値':'exp',xp:'exp'};
const kindOf=k=>{k=String(k||'');return M[k]?k:(AL[k]||'')};
/* SVG: 色ごとに 1 本の path(横に続く同じ色はまとめる) */
function svg(rows){const by={};rows.forEach((r,y)=>{let x=0;while(x<r.length){const ch=r[x];if(ch==='.'||!PAL[ch]){x++;continue}let e=x;while(e<r.length&&r[e]===ch)e++;(by[ch]=by[ch]||[]).push('M'+x+' '+y+'h'+(e-x)+'v1h-'+(e-x)+'z');x=e}});
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" shape-rendering="crispEdges">'+Object.keys(by).map(c=>'<path fill="'+PAL[c]+'" d="'+by[c].join('')+'"/>').join('')+'</svg>'}
const URI={};for(const k in M)URI[k]='data:image/svg+xml,'+encodeURIComponent(svg(M[k]));
try{const s=document.createElement('style');s.id='resicon';s.textContent=Object.keys(URI).map(k=>'.ri-'+k+'{background-image:url("'+URI[k]+'")}').join('')+'#up em::before{background-image:url("'+URI.gold+'")}';(document.head||document.body).appendChild(s)}catch(e){}
/* HUD の金貨(index.html の .coin)をドット絵に */
try{const c=document.querySelector&&document.querySelector('#hud .coin');if(c&&c.classList){c.classList.add('ri');c.classList.add('ri-gold')}}catch(e){}
/* Canvas 用: 12x12 の小さなキャンバスを1回だけ作って使い回す */
const CV={};
function cv(k){if(CV[k]!==undefined)return CV[k];let c=null;try{c=document.createElement('canvas');c.width=12;c.height=12;const x=c.getContext('2d');if(!x)throw 0;
  M[k].forEach((r,y)=>{for(let i=0;i<r.length;i++){const col=PAL[r[i]];if(col&&r[i]!=='.'){x.fillStyle=col;x.fillRect(i,y,1,1)}}})}catch(e){c=null}return CV[k]=c}
return {M,PAL,URI,kindOf,cv}})();
const RESK=Object.keys(RESICON.M);
function resIcon(kind,cls){const k=RESICON.kindOf(kind);return k?'<i class="ri ri-'+k+(cls?' '+cls:'')+'" aria-hidden="true"></i>':''}
function resAmt(kind,text,cls){const k=RESICON.kindOf(kind);return '<span class="ra ra-'+(k||'x')+(cls?' '+cls:'')+'">'+resIcon(k)+(text==null?'':text)+'</span>'}
function resIconCanvas(ctx,kind,x,y,size){const k=RESICON.kindOf(kind);if(!k||!ctx)return false;const s=size||12,c=RESICON.cv(k);
  try{if(c){const sm=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=false;ctx.drawImage(c,Math.round(x),Math.round(y),s,s);ctx.imageSmoothingEnabled=sm;return true}
    const r=RESICON.M[k],q=s/12;for(let j=0;j<12;j++)for(let i=0;i<12;i++){const col=RESICON.PAL[r[j][i]];if(col&&r[j][i]!=='.'){ctx.fillStyle=col;ctx.fillRect(x+i*q,y+j*q,q,q)}}return true}catch(e){return false}}
