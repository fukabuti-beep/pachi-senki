/* ---------- セーブデータの整備 (feature) ----------
   ・引き継ぎコード: localStorage の pachi2* を全部まとめて「PACHI3:<圧縮+base64url>:<チェック値>」の1行にする(古い PACHI2: も読める)。
     コピー/ファイルに保存(.txt)/貼り付け or ファイルから読み込み。読み込みは確認してから上書き→再読込。
     BOOTH の HTML は置き場所やブラウザが変わるとセーブが見えなくなるため、引っ越し・端末の乗り換え用。
   ・自動バックアップ: プレイ10分ごと(と裏に回った時、最短2分おき)に 3 世代を localStorage['pbak_pachi2'] へ。
     キー名を pachi2 で始めないのは、引き継ぎコードや Unity アプリの控え(97u)に二重に入らないようにするため。
     読み込み・復元の直前の状態も 1 世代として残す(間違えても戻せる)。
   ・壊れたセーブの検出: 起動時に pachi2 が読めなかったら、自動バックアップを止めて(無事な控えを上書きしない)復元を案内する。
   メニュー「セーブ」(29c の FMGRP「その他」に実行時に追加)。 */
const SV_PRE='pachi2',SV_BAK='pbak_pachi2',SV_N=3;
const SV={t:0,last:-1e9,broken:0,told:0};
try{const raw=localStorage.getItem('pachi2');if(raw){try{const j=JSON.parse(raw);if(!j||typeof j!=='object')SV.broken=1}catch(e){SV.broken=1}}}catch(e){}
function svCollect(){const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf(SV_PRE)===0){const v=localStorage.getItem(k);if(typeof v==='string')o[k]=v}}}catch(e){}return o}
const svSum=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return(h>>>0).toString(36)};
/* UTF-8 ⇔ base64(btoa/TextEncoder が無い環境でも動くよう自前) */
const SVB='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function svUtf8(s){const o=[];for(let i=0;i<s.length;i++){let c=s.charCodeAt(i);if(c>=0xd800&&c<0xdc00&&i+1<s.length){const d=s.charCodeAt(i+1);if(d>=0xdc00&&d<0xe000){c=0x10000+((c-0xd800)<<10)+(d-0xdc00);i++}}
  if(c<0x80)o.push(c);else if(c<0x800)o.push(0xc0|c>>6,0x80|c&63);else if(c<0x10000)o.push(0xe0|c>>12,0x80|c>>6&63,0x80|c&63);else o.push(0xf0|c>>18,0x80|c>>12&63,0x80|c>>6&63,0x80|c&63)}return o}
function svB64(s){try{const b=svUtf8(s);let r='';for(let i=0;i<b.length;i+=3){const n=b[i]<<16|(b[i+1]||0)<<8|(b[i+2]||0);r+=SVB[n>>18&63]+SVB[n>>12&63]+(i+1<b.length?SVB[n>>6&63]:'=')+(i+2<b.length?SVB[n&63]:'=')}return r}catch(e){return''}}
function svUnB64(s){try{const b=[];s=s.replace(/=+$/,'');for(let i=0;i<s.length;i+=4){const n=SVB.indexOf(s[i])<<18|SVB.indexOf(s[i+1])<<12|(s[i+2]?SVB.indexOf(s[i+2]):0)<<6|(s[i+3]?SVB.indexOf(s[i+3]):0);
    b.push(n>>16&255);if(s[i+2])b.push(n>>8&255);if(s[i+3])b.push(n&255)}
  let r='';for(let i=0;i<b.length;){const c=b[i++];let u;if(c<0x80)u=c;else if(c<0xe0)u=(c&31)<<6|b[i++]&63;else if(c<0xf0){u=(c&15)<<12|(b[i++]&63)<<6|b[i++]&63}else{u=(c&7)<<18|(b[i++]&63)<<12|(b[i++]&63)<<6|b[i++]&63}
    if(u>0xffff){u-=0x10000;r+=String.fromCharCode(0xd800+(u>>10),0xdc00+(u&1023))}else r+=String.fromCharCode(u)}return r}catch(e){return null}}
/* 短い引き継ぎコード(作り手の指摘「長い」): 「PACHI3:<圧縮して base64url>:<チェック値>」。
   ・各キーの値は JSON として入れ直す(文字列の中の JSON だと " が全部 \" になって長くなるため)。JSON でない値だけ r に生のまま。キー名の先頭 pachi2 は省く
   ・LZW で圧縮(同じ言葉のくり返しが多いセーブ向き)。外部ライブラリなし・同期処理。だいたい元の 1/3 の長さ
   ・古い PACHI2: のコードも読める(svParse)。出すのは PACHI3 だけ */
function svLz(b){const D=new Map();let n=256,w=9,out=[],acc=0,bits=0,cur='';const put=c=>{acc|=c<<bits;bits+=w;while(bits>=8){out.push(acc&255);acc>>>=8;bits-=8}};
  for(let i=0;i<b.length;i++){const ch=String.fromCharCode(b[i]),nx=cur+ch;if(cur===''||D.has(nx)){cur=nx;continue}
    put(cur.length===1?cur.charCodeAt(0):D.get(cur));if(n<65535){D.set(nx,n++);if(n>(1<<w)&&w<16)w++}cur=ch}
  if(cur!=='')put(cur.length===1?cur.charCodeAt(0):D.get(cur));if(bits>0)out.push(acc&255);return out}
function svUnLz(b,len){const D=[];let n=256,w=9,acc=0,bits=0,p=0,out=[],prev=null;const get=()=>{while(bits<w){if(p>=b.length)return -1;acc|=b[p++]<<bits;bits+=8}const c=acc&((1<<w)-1);acc>>>=w;bits-=w;return c};
  while(out.length<len){const c=get();if(c<0)break;let e;if(c<256)e=[c];else if(D[c])e=D[c];else if(c===n&&prev)e=prev.concat(prev[0]);else return null;
    for(const v of e)out.push(v);if(prev&&n<65535){D[n++]=prev.concat(e[0]);if(n+1>(1<<w)&&w<16)w++}prev=e}
  return out.length===len?out:null}
const SVU='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function svB64b(b){let r='';for(let i=0;i<b.length;i+=3){const n=b[i]<<16|(b[i+1]||0)<<8|(b[i+2]||0);r+=SVU[n>>18&63]+SVU[n>>12&63]+(i+1<b.length?SVU[n>>6&63]:'')+(i+2<b.length?SVU[n&63]:'')}return r}
function svUnB64b(s){const b=[];for(let i=0;i<s.length;i+=4){const n=SVU.indexOf(s[i])<<18|SVU.indexOf(s[i+1])<<12|(s[i+2]?SVU.indexOf(s[i+2]):0)<<6|(s[i+3]?SVU.indexOf(s[i+3]):0);b.push(n>>16&255);if(s[i+2])b.push(n>>8&255);if(s[i+3])b.push(n&255)}return b}
function svUtf8Dec(b){let r='';for(let i=0;i<b.length;){const c=b[i++];let u;if(c<0x80)u=c;else if(c<0xe0)u=(c&31)<<6|b[i++]&63;else if(c<0xf0){u=(c&15)<<12|(b[i++]&63)<<6|b[i++]&63}else{u=(c&7)<<18|(b[i++]&63)<<12|(b[i++]&63)<<6|b[i++]&63}
  if(u>0xffff){u-=0x10000;r+=String.fromCharCode(0xd800+(u>>10),0xdc00+(u&1023))}else r+=String.fromCharCode(u)}return r}
function svCode(){const src=svCollect(),d={},r={};for(const k in src){const s=k.slice(SV_PRE.length);let j,ok=false;try{j=JSON.parse(src[k]);ok=JSON.stringify(j)===src[k]||(j&&typeof j==='object')}catch(e){}if(ok)d[s]=j;else r[s]=src[k]}
  const raw=svUtf8(JSON.stringify({v:2,t:Math.floor(Date.now()/60000),d,r})),body=raw.length.toString(36)+'.'+svB64b(svLz(raw));return 'PACHI3:'+body+':'+svSum(body)}
/* 引き継ぎコードを読む: 正しければ {t,d}、だめなら null。新しい PACHI3(短い)と 古い PACHI2 の両方 */
function svParse(code){try{code=String(code||'').replace(/\s+/g,'');
  const m3=/^PACHI3:([a-z0-9]+)\.([A-Za-z0-9_-]+):([a-z0-9]+)$/.exec(code);
  if(m3){if(svSum(m3[1]+'.'+m3[2])!==m3[3])return null;const len=parseInt(m3[1],36);if(!(len>0&&len<4e6))return null;const raw=svUnLz(svUnB64b(m3[2]),len);if(!raw)return null;
    const j=JSON.parse(svUtf8Dec(raw));if(!j||typeof j.d!=='object'||!j.d)return null;const d={};for(const k in j.d)d[SV_PRE+k]=JSON.stringify(j.d[k]);if(j.r&&typeof j.r==='object')for(const k in j.r)if(typeof j.r[k]==='string')d[SV_PRE+k]=j.r[k];
    if(!d.pachi2)return null;JSON.parse(d.pachi2);return{t:(+j.t||0)*60000,d}}
  const m=/^PACHI2:([A-Za-z0-9+/=]+):([a-z0-9]+)$/.exec(code);if(!m||svSum(m[1])!==m[2])return null;
  const j=JSON.parse(svUnB64(m[1])||'null');if(!j||typeof j.d!=='object'||!j.d)return null;const d={};for(const k in j.d)if(k.indexOf(SV_PRE)===0&&typeof j.d[k]==='string')d[k]=j.d[k];
  if(!d.pachi2)return null;JSON.parse(d.pachi2);return{t:+j.t||0,d}}catch(e){return null}}
/* 中身を丸ごと差し替えて再読込(差し替え前の状態はバックアップに残す) */
function svApply(d){try{svBackup('読み込み前',1);const old=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf(SV_PRE)===0)old.push(k)}
  old.forEach(k=>localStorage.removeItem(k));for(const k in d)localStorage.setItem(k,d[k]);
  try{if(typeof appSend==='function'){UAPP.bak='';appSend('save:'+JSON.stringify(d))}}catch(e){}
  if(typeof location!=='undefined'&&location.reload)location.reload();return true}catch(e){return false}}
/* ---- 自動バックアップ ---- */
function svBaks(){try{const a=JSON.parse(localStorage.getItem(SV_BAK)||'[]');return Array.isArray(a)?a.filter(b=>b&&b.d&&typeof b.d==='object'):[]}catch(e){return[]}}
function svBackup(why,force){try{if(SV.broken&&!force)return false;const d=svCollect();if(!d.pachi2)return false;let st=0,best=0;try{st=JSON.parse(d.pachi2).stage|0}catch(e){}try{best=X.best|0}catch(e){}
  const a=svBaks();a.unshift({t:Date.now(),why:why||'自動',st,best,d});while(a.length>SV_N)a.pop();localStorage.setItem(SV_BAK,JSON.stringify(a));SV.last=T;return true}catch(e){return false}}
function svRestore(i){const b=svBaks()[i];if(!b)return;fxShow('<div class="fxh">バックアップから戻す</div><div class="fxs">'+svWhen(b.t)+' の状態(STAGE '+b.st+')に戻します。<br>今の状態もバックアップに残ります。</div>',[['戻す',()=>{SV.broken=0;svApply(b.d)}],['やめる',()=>fxMenu(),'g']])}
const svWhen=t=>{try{const d=new Date(t),p=n=>('0'+n).slice(-2);return (d.getMonth()+1)+'/'+d.getDate()+' '+p(d.getHours())+':'+p(d.getMinutes())}catch(e){return'?'}};
FU.push(dt=>{SV.t+=dt;if(SV.t>600){SV.t=0;svBackup('自動')}
  if(SV.broken&&!SV.told&&run&&T>3){SV.told=1;const n=svBaks().length;
    fxShow('<div class="fxh">セーブが読めませんでした</div><div class="fxs">保存データが壊れていたため、最初から始まっています。'+(n?'<br>自動バックアップ('+svWhen(svBaks()[0].t)+')から戻せます。':'')+'</div>',
      n?[['バックアップから戻す',()=>{SV.broken=0;svApply(svBaks()[0].d)}],['このまま始める',()=>{SV.broken=0},'g']]:[['OK',()=>{SV.broken=0},'g']])}});
try{if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('visibilitychange',()=>{try{if(document.hidden&&T-SV.last>120)svBackup('自動')}catch(e){}})}catch(e){}
/* ---- 画面 ---- */
function svCopy(){const t=$('svcode');const v=t?t.value:svCode();try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(v).then(()=>fxToast('引き継ぎコードをコピーしました','#7ff3ff'),()=>{svSel();fxToast('コードを長押しでコピーしてね','#aaa')});return}}catch(e){}svSel();fxToast('コードを長押しでコピーしてね','#aaa')}
function svSel(){try{const t=$('svcode');t.focus();t.select()}catch(e){}}
function svFile(){try{const d=new Date(),p=n=>('0'+n).slice(-2),b=new Blob([svCode()],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(b);
  a.download='pachi-senki-save-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'.txt';document.body.appendChild(a);a.click();setTimeout(()=>{try{URL.revokeObjectURL(a.href);a.remove()}catch(e){}},500);fxToast('ファイルに保存しました','#7ff3ff')}catch(e){fxToast('保存できませんでした(コピーを使ってね)','#aaa')}}
function svLoadText(v){const r=svParse(v);if(!r){fxToast('引き継ぎコードが正しくありません','#ff6a8a');return}let st=0;try{st=JSON.parse(r.d.pachi2).stage|0}catch(e){}
  fxShow('<div class="fxh">引き継ぎコードを読み込む</div><div class="fxs">'+(r.t?svWhen(r.t)+' に書き出した ':'')+'STAGE '+st+' のデータで<b>今のデータを上書き</b>します。<br>今の状態は自動バックアップに残ります。</div>',[['上書きする',()=>svApply(r.d)],['やめる',()=>fxMenu(),'g']])}
function svLoad(){const t=$('svin');svLoadText(t?t.value:'')}
function svPick(){try{const i=document.createElement('input');i.type='file';i.accept='.txt,text/plain';i.onchange=()=>{const f=i.files&&i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>svLoadText(String(r.result||''));r.readAsText(f)};i.click()}catch(e){fxToast('ファイルを開けませんでした','#aaa')}}
function svMenu(){const bs=svBaks();
  return '<div class="fxh">セーブ</div><div class="fxs">進行はこの端末のブラウザに自動で保存されています。<br>別の端末・別のブラウザ・ファイルの置き場所を変える時は、<b>引き継ぎコード</b>で持っていけます。</div>'+
  '<div class="svbox"><div class="svh">① 書き出す</div><textarea id="svcode" readonly rows="3" onclick="svSel()">'+svCode()+'</textarea>'+
  '<div class="svrow"><button type="button" class="fxb" onclick="svCopy()">コピー</button><button type="button" class="fxb" onclick="svFile()">ファイルに保存</button></div></div>'+
  '<div class="svbox"><div class="svh">② 読み込む</div><textarea id="svin" rows="3" placeholder="ここに引き継ぎコードを貼り付け"></textarea>'+
  '<div class="svrow"><button type="button" class="fxb" onclick="svLoad()">読み込む</button><button type="button" class="fxb" onclick="svPick()">ファイルから</button></div></div>'+
  '<div class="svbox"><div class="svh">自動バックアップ <small>(10分ごと・最大'+SV_N+'つ)</small></div>'+(bs.length?bs.map((b,i)=>'<div class="svb"><span>'+svWhen(b.t)+' <small>'+b.why+'</small><br>STAGE '+b.st+(b.best?' / 最高 '+b.best:'')+'</span><button type="button" class="fxb" onclick="svRestore('+i+')">戻す</button></div>').join(''):'<div class="fxs">まだありません</div>')+
  '<div class="svrow"><button type="button" class="fxb" onclick="svBackup(\'手動\',1);fxMenu();fxToast(\'バックアップしました\',\'#7ff3ff\')">今すぐバックアップ</button></div></div>'}
FM.push({n:'セーブ',r:svMenu});
try{if(typeof FMGRP!=='undefined'){const g=FMGRP.find(q=>q.n==='その他');if(g&&g.t.indexOf('セーブ')<0)g.t.unshift('セーブ')}}catch(e){}
