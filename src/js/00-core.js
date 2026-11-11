const $=i=>document.getElementById(i),P=$('p'),pc=P.getContext('2d'),B=$('b'),bc=B.getContext('2d');
bc.imageSmoothingEnabled=false;
const PW=360,PH=400,TAU=6.2832,FN='DotGothic16,monospace';
// 数字の短縮表記。T(兆)より上も単位を付けて、桁が増えても HUD 等からはみ出さない(Qa=10^15 … Dc=10^33、それ以上は 1.23e45)
const FSUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
const fmt=n=>{if(n===Infinity)return'MAX';if(!(n>=1e3))return Math.floor(n)+'';let e=Math.floor(Math.log10(n)/3),v=n/Math.pow(10,e*3);if(v>=999.95){v/=1e3;e++}
  return e<FSUF.length?v.toFixed(1)+FSUF[e]:n.toExponential(2).replace('e+','e')};
let G={gold:0,stage:1,hp:0,mx:0,lv:[1,1,1,1,1,1,1,1,1,1],rush:0,combo:0,q:0,at:0,hit:0,sp:0,roul:0,en:'m0',ai:0,pool:0,jp:0,aw:0,fv:0};
/* セーブ読込: 壊れた値/型違い/Infinity/NaN/巨大値は既定値に丸める(プライベートモードで localStorage が使えない場合も try で無視) */
try{const s=JSON.parse(localStorage.getItem('pachi2')||'null');if(s&&typeof s=='object'){const n=(v,d,hi)=>{v=+v;return Number.isFinite(v)&&v>0?Math.min(v,hi):d};G.gold=n(s.gold,0,1e300);G.stage=Math.floor(n(s.stage,1,2000));G.lv=G.lv.map((v,i)=>Math.floor(n(Array.isArray(s.lv)?s.lv[i]:0,v,999)))}}catch(e){}
