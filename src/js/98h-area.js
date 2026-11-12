/* ---------- エリア(舞台)の変化 + 敵の色違い/エリアの主 + ボスの特殊演出 (feature/fx) ----------
   1) エリア: 25ステージごとに舞台が変わる(8エリア: 草原→砂漠→氷原→火山→魔界→天空→宙域→虚空、STAGE 201〜はII周目として同じ順)。
      戦闘画面の背景(空/遠景/地面/動く小物)をエリアごとに描き分け。オフスクリーンに一度だけ描いて drawImage(エリアごとに4枚)。
      エリア内では5ステージごとに空が夕暮れ/夜色へ近づき、エリアの主(STAGE 25の倍数)で最も劇的な空になる。
      エリアに入った時(起動/転生/到達)に(到達時は FINISH!! の間は前のエリアの背景のまま、タイトルと同時に切り替え)「AREA n 名前」のタイトル帯を戦闘画面に表示(FINISH!!/節目バナーの後に出す)。
   2) 敵: 草原以外では雑魚/ボスをエリアの色にパレット差し替え(図鑑では同じ種類として数える=キーは enSpr のまま)。
      STAGE 25の倍数のボスは新しいオリジナルの「エリアの主」(8体、図鑑キー b4〜b11、BOSS 扱い ★基準 1/10/50体)。
   3) ボスの特殊演出(見た目のみ。HP/攻撃/報酬/当否は不変): HP 50%を切ると「怒り状態!!」(赤いオーラ+赤み)、
      エリアの主は「形態変化!!」で第2形態の色に変わる。エリアの主は常に色付きオーラ、撃破時は専用の大爆発(光の柱+多重リング)+「AREA CLEAR!!」。
   フック: なし(drawBgB を置き換え、enSpr/drawEnemy/drawHP/deathFx/kill/update/drawB をラップ。敵スプライトは描画中だけ SPR を差し替える) */
const AREAS=[
{n:'新緑の草原',k:0,ac:'#7dff6a',g:'森の主 ドリュード',sky:['#2a58c8','#3a74e0','#5a94ec','#7ab4f4','#a0d0f8','#d0ecff'],late:['#1b1048','#3a1a6a','#7a2a7a','#c0484f','#e8844a','#f4b060'],mt:'#2f7a4a',mt2:'#48a060',gr:'#3a8a3e',gr2:'#6ccc5a',P:null},
{n:'灼熱の砂漠',k:1,ac:'#ffb03a',g:'砂塵の大蠍 デザルク',sky:['#3a6ac8','#5a8ee0','#8ab4ec','#c8d8e8','#f0d8a8','#f8e8c0'],late:['#401020','#702030','#b04030','#e07030','#f0a040','#f8d070'],mt:'#b07a28',mt2:'#d8a448',gr:'#d0a04a',gr2:'#f0c870',P:{h:38,k:.55,s:1,l:1.05,lo:.02}},
{n:'白銀の氷原',k:2,ac:'#9ae8ff',g:'氷晶巨人 クリスタロス',sky:['#0a1838','#14305a','#204a7a','#30689a','#5090b8','#80b8d8'],late:['#02040e','#060c20','#0a1430','#102040','#183050','#204060'],mt:'#7aa8d0',mt2:'#c0e0f8',gr:'#d8ecfa',gr2:'#ffffff',st:1,P:{h:198,k:.65,s:.85,l:1.1,lo:.04}},
{n:'紅蓮の火山',k:3,ac:'#ff5a2a',g:'溶岩魔人 ヴォルガン',sky:['#1c0606','#340a0a','#58120c','#84200e','#b03a12','#e0701c'],late:['#0a0202','#1c0404','#300806','#501008','#702010','#a03018'],mt:'#240a0a',mt2:'#3c1210',gr:'#2a1410',gr2:'#ff6a1a',P:{h:8,k:.6,s:1.1,l:.92,lo:0}},
{n:'冥府の魔界',k:4,ac:'#d27aff',g:'冥府の魔将 ベルザーク',sky:['#05020f','#0e0624','#1c0a3c','#2c1058','#42187a','#5a2098'],late:['#100008','#200010','#380820','#501030','#701840','#902050'],mt:'#160a36',mt2:'#26104e',gr:'#24104e',gr2:'#e03aff',st:1,P:{h:285,k:.65,s:1,l:.88,lo:0}},
{n:'天空の聖域',k:5,ac:'#fff08a',g:'天翼の守護神 セレスティア',sky:['#3a8ae8','#5aa4f0','#80bef4','#a8d4f8','#d0e8fc','#f0f8ff'],late:['#a04818','#c86828','#e09040','#f0b868','#f8d898','#fff0d0'],mt:'#e8eefc',mt2:'#ffffff',gr:'#eef2ff',gr2:'#ffffff',P:{h:48,k:.5,s:.9,l:1.12,lo:.06}},
{n:'星降る宙域',k:6,ac:'#7ff3ff',g:'星喰いの騎士 ノヴァゼル',sky:['#000004','#02020c','#060418','#0a0828','#100c38','#181048'],late:['#020008','#0a0218','#18042a','#28063c','#3a0a50','#501060'],mt:'#1a1a3a',mt2:'#2a2a5a',gr:'#283060',gr2:'#80f0ff',st:1,P:{rot:150,k:0,s:1.05,l:1,lo:0}},
{n:'終焉の虚空',k:7,ac:'#e8e8f0',g:'虚無の王 ニヒラ',sky:['#000000','#080808','#101010','#181818','#202020','#2a2a2a'],late:['#000000','#100004','#200008','#30000c','#400010','#500014'],mt:'#1a1a1a',mt2:'#2c2c2c',gr:'#0c0c0c',gr2:'#ffffff',st:1,P:{h:0,k:0,s:.22,l:.95,lo:.02}}];
const arIdx=st=>Math.max(0,Math.floor(((st||G.stage||1)-1)/25));
const arArea=st=>arIdx(st)%AREAS.length,arLap=st=>Math.floor(arIdx(st)/AREAS.length);
const arGuard=st=>{st=st||G.stage;return st%25==0};
const AR={cur:-1,prevA:-1,title:null,rageSt:0,rage0:-9,boom:null,form:0};

/* ===== エリアの主(24x24, 左半分12列。すべてオリジナル) ===== */
mk('b4','k#14101f,a#3dbb4a,b#1f7a2e,c#9af08a,t#8a5a2b,T#5a3818,e#ffe14d',
["...kkk..kkkk","..kccakkccca",".kcaaaakcaaa",".kaaabaaaaab","kcaabbaaabaa","kaabbbaaaaaa","kaaaabbaaaba",".kbaaaaaabbb","..kkbbtttttt","...ktTtttttt","...ktTteeTtt","...ktTteeTtt","...ktTtttttt","..kttTttkkkk","..ktTTttkTTT",".kttkTtttttt","kttk.kTttttt","ktk..kTtttTt","kk...kTttTtt",".....kTtttTt","....kTTttTTt","...kTTtkkTTt","..kTTtk..kTT","..kkkk....kk"]);
mk('b5','k#14101f,a#e0a040,b#a86a20,c#ffd890,e#ff2030,s#8a40c0',
["..........ks",".........kss","..........ka","..........ka",".........kaa",".........kab","kk.......kab","kak......kaa","kcak....kkaa","kcaak..kccaa",".kcaakkcaaaa","..kaakcaaeek",".kcakcaaaaak","kcaakaabaaaa","kaaakabbbaab",".kkkkaabbbba","....kbaabbab","...kbkbaabba","..kbk.kbaaab",".kbk..kbkbab",".kk..kbk.kbk","....kbk..kbk","....kk...kk.","............"]);
mk('b6','k#14101f,a#9ad8ff,b#4a90c8,c#e8faff,d#1a3a6a,e#ff4dd2,w#fff',
["......k.....",".....kck....","..k..kcak..k",".kck.kcak.kc",".kcakkcaakca","..kcakaaakca","..kkkkkkkkkk",".kccccaaaaaa","kcaaaaaaaaaa","kcaakkkaaaaa","kcaakeekaaaa","kcaakkkaaaaa","kaaaaaaakkkk","kbaaaabkdddd",".kbbbbkcaaaa","kccakkcaaaab","kcaakkaaaabb","kaabk.kaabbb","kabbk.kabbbb",".kkk..kbbbbk","......kbbbk.","....kkcaabk.","...kcaaabbk.","...kkkkkkkk."]);
mk('b7','k#14101f,a#3a2a2a,l#ff6a1a,y#ffe14d,e#fff3a0',
["k...........","kk..........","kyk.........",".kyk....kkkk",".kyyk.kkaaaa","..kyykaaalaa","...kkaaaalll","...kaakkkaaa","...kaakyekaa","...kaaakkaaa","..kkaaaaaakk",".kaaklaakkll","kaaklllaakyy","kaakllyllaky","kaakllllaaak","kllk.kaaalll","kyyk.kaalllk",".kk..kaallaa",".....kaaakaa","....kaaak.ka","....kalak..k","...kallak...","...kyyyyk...","...kkkkkk..."]);
mk('b8','k#14101f,a#4a3a6a,b#2a1f44,c#8a7ab8,r#e0203a,e#ffe14d,w#301040,W#7a2a9a,h#e8e0c8,s#c0c8d8',
["..h.........","..hh........","...hh...kkkk","...khh.kccca","....khkcaaaa","w....kcaaaaa","ww...kcakkkk","wWw..kcakeer","wWWw.kaakkkk","wWWWwkaaaaar",".wWWWkkaaarr",".wWWkcckkkkk","..wWkcaabbcc","..wWkcabrrbc","...wkaabrrba","...kkaabbbba","..kssk.kaaab","..ksk..kabbb","..kk...kabkk","......kaabk.","......kabbk.",".....kaabk..",".....kbbbk..",".....kkkkk.."]);
mk('b9','k#14101f,g#ffd24d,G#c08a1a,w#f8f8ff,W#c8d0e8,e#22e0ff,h#fff3a0',
["......hhhhhh",".....h......","......hhhhhh","........kkkk","w......kwwww","ww....kwwwww","wWw...kwwekw","wWWw..kwwwww","wWWWw..kwwkk","wWWWWw.kkkgg",".wWWWWkggGgg",".wWWWkgwwgGg","..wWWkgwwwgg","..wWkkgwwwwG","...wkwkgwwwg","....kwkgwwww","....kk.kgwww",".......kgwww","......kgwwww","......kgwwwW",".....kgwwwWW",".....kgwwWWW",".....kGGGGGG",".....kkkkkkk"]);
/* ===== 色変換(PXL の画素一覧から作り直す: getImageData 不要) ===== */
function arHsl(c){const r=parseInt(c.slice(1,3),16)/255,g=parseInt(c.slice(3,5),16)/255,b=parseInt(c.slice(5,7),16)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;
  if(mx!=mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx==r?(g-b)/d+(g<b?6:0):mx==g?(b-r)/d+2:(r-g)/d+4;h*=60}return [h,s,l]}
function arHex(h,s,l){h=((h%360)+360)%360;s=Math.max(0,Math.min(1,s));l=Math.max(0,Math.min(1,l));const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=t=>{t=(t+1)%1;const v=t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;return ('0'+Math.round(v*255).toString(16)).slice(-2)};
  return '#'+f(h/360+1/3)+f(h/360)+f(h/360-1/3)}
function arRecol(c,P){if(!P||c=='#14101f'||c[0]!='#'||c.length!=7)return c;const q=arHsl(c);let h=q[0],s=q[1],l=q[2];
  if(s>=.12){if(P.rot)h+=P.rot;if(P.k){let d=((P.h-h+540)%360)-180;h+=d*P.k}}
  return arHex(h,s*(P.s||1),l*(P.l||1)+(P.lo||0))}
function arMkVar(src,name,P){const S=SPR[src],L=PXL[src];if(!S||!L)return null;const c=document.createElement('canvas');c.width=S.width;c.height=S.height;const x=c.getContext('2d'),L2=[],memo={};
  for(const q of L){const col=memo[q[2]]||(memo[q[2]]=arRecol(q[2],P));x.fillStyle=col;x.fillRect(q[0],q[1],1,1);L2.push([q[0],q[1],col])}SPR[name]=c;PXL[name]=L2;return c}
/* エリアの主 b10/b11 は b8/b9 の色違い(宙域/虚空の主)。第2形態は赤黒系 */
arMkVar('b8','b10',{rot:170,k:0,s:1.2,l:1.1,lo:.04});arMkVar('b7','b11',{h:0,k:0,s:.15,l:1.25,lo:.05});
/* 色違いの名前: 'm3@2' など。エリア0(草原)と周回II以降の草原は元の色 */
function arVarName(sn,a){if(!sn||!a||!/^(m\d|b[0-3])$/.test(sn))return sn;const n=sn+'@'+a;if(SPR[n])return n;try{return arMkVar(sn,n,AREAS[a].P)?n:sn}catch(e){return sn}}
const AR_RAGEP={h:350,k:.5,s:1.25,l:.82,lo:0};
function arFormName(sn){const n=sn+'@r';if(SPR[n])return n;try{return arMkVar(sn,n,AR_RAGEP)?n:sn}catch(e){return sn}}
/* 単色シルエット(オーラ用)。色ごとにキャッシュ(エリアの主8体+怒り赤のみ=数十枚まで) */
const ARS={};function arSil(n,col){const k=n+col;if(ARS[k])return ARS[k];const s=SPR[n],c=document.createElement('canvas');c.width=s.width;c.height=s.height;const x=c.getContext('2d');x.drawImage(s,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,s.width,s.height);return ARS[k]=c}

/* ===== 図鑑(96b)への追加: エリアの主 b4〜b11(BOSS 扱い)。保存済みの撃破数をここで読み直す ===== */
if(typeof ZKN!=='undefined'&&typeof ZKK!=='undefined'){AREAS.forEach((A,i)=>{const k='b'+(4+i);if(!ZKN[k]){ZKN[k]=A.g;ZKK.push(k)}});
  try{const j=JSON.parse(localStorage.getItem('pachi2_zukan')||'null');if(j&&typeof j=='object')AREAS.forEach((A,i)=>{const k='b'+(4+i),v=Math.floor(+j[k]);if(Number.isFinite(v)&&v>0)ZK[k]=Math.min(v,1e9)})}catch(e){}}
/* 敵スプライト選択: STAGE 25の倍数はエリアの主。それ以外は従来どおり(図鑑キーも従来どおり) */
{const _e=enSpr;enSpr=function(st){st=st||G.stage;if(st%25==0)return 'b'+(4+arArea(st));return _e.apply(this,arguments)}}

/* ===== 背景: エリアごとに sky / late(夕暮れ) / far / near を一度だけ描く ===== */
const ARB={},AR_ST=[];for(let i=0;i<40;i++)AR_ST.push([(i*131+17)%360,(i*53+11)%96,i%5==0?2:1]);
function arProf(x,a,b,c,tri){const u=x/360*6.2832;let v=a*Math.sin(u*2+1)+b*Math.sin(u*5+2)+c*Math.sin(u*9+.5);return tri?Math.abs(v)*1.3:v}
function arSkyCv(A,cols,late){const c=document.createElement('canvas');c.width=376;c.height=166;const s=c.getContext('2d');
  for(let i=0;i<6;i++){s.fillStyle=cols[i];s.fillRect(0,i*28,376,28);if(i){s.fillStyle=cols[i-1];for(let x=0;x<376;x+=4)for(let y=0;y<4;y+=2)s.fillRect(x+((y>>1)%2)*2,i*28+y,2,2)}}
  const K=A.k;
  if(K==1){s.fillStyle=late?'#ff8a3a':'#fff6c8';s.beginPath();s.arc(300,late?70:44,18,0,TAU);s.fill();s.fillStyle=late?'#ffc070':'#ffffff';s.beginPath();s.arc(300,late?70:44,12,0,TAU);s.fill()}
  if(K==2){[['#5affb0',30],['#5ae0ff',44],['#b07aff',58]].forEach((q,j)=>{s.fillStyle=q[0];s.globalAlpha=late?.32:.16;for(let x=0;x<376;x+=4){const y=q[1]+Math.round(Math.sin(x*.025+j*1.7)*10+Math.sin(x*.07+j)*4);s.fillRect(x,y,4,10-j*2)}});s.globalAlpha=1}
  if(K==4){s.fillStyle=late?'#ff3050':'#d02040';s.beginPath();s.arc(90,44,20,0,TAU);s.fill();s.fillStyle=late?'#ff8a9a':'#ff6a7a';s.fillRect(80,34,6,4);s.fillRect(96,50,8,4);s.fillStyle='rgba(0,0,0,.25)';s.fillRect(98,30,6,6)}
  if(K==6){for(let i=0;i<70;i++){s.fillStyle=i%7==0?'#ffe8a0':i%5==0?'#a0e8ff':'#ffffff';s.fillRect((i*89+31)%376,(i*37+5)%120,i%9==0?2:1,i%9==0?2:1)}
    s.globalAlpha=.09;s.fillStyle=late?'#ff5ab8':'#7a5aff';for(let i=0;i<9;i++){s.beginPath();s.arc(130+i*16,40+Math.sin(i*1.7)*16,10+(i%3)*5,0,TAU);s.fill()}s.globalAlpha=1;
    s.fillStyle='#e0a060';s.beginPath();s.arc(304,40,16,0,TAU);s.fill();s.fillStyle='#b06a30';s.fillRect(292,38,24,3);s.fillRect(296,46,16,2);s.strokeStyle='#ffe0b0';s.lineWidth=2;s.beginPath();s.ellipse(304,42,30,7,-.25,0,TAU);s.stroke()}
  if(K==7){s.fillStyle=late?'#ff2040':'#ffffff';s.globalAlpha=.5;[[60,30,40],[220,18,28],[300,60,36]].forEach(q=>{s.fillRect(q[0],q[1],q[2],1);s.fillRect(q[0]+q[2]*.4,q[1]-6,1,14)});s.globalAlpha=1}
  if(K==0||K==5){s.fillStyle=late?(K==5?'#ffe0b0':'#f0a0a0'):'#ffffff';s.globalAlpha=.85;[[40,26],[170,16],[290,34]].forEach(q=>{s.fillRect(q[0],q[1],36,6);s.fillRect(q[0]+6,q[1]-4,22,4);s.fillRect(q[0]-4,q[1]+2,44,4)});s.globalAlpha=1}
  return c}
function arMkBg(a){const A=AREAS[a],K=A.k,far=document.createElement('canvas'),nr=document.createElement('canvas');far.width=360;far.height=100;nr.width=360;nr.height=40;const f=far.getContext('2d'),n=nr.getContext('2d');
  const ridge=(col,base,a1,b1,c1,off,tri,step)=>{f.fillStyle=col;step=step||4;for(let x=0;x<360;x+=step){const h=(Math.round(base+arProf(x+off,a1,b1,c1,tri))>>2)<<2;f.fillRect(x,100-h,step,h)}};
  if(K==0){ridge(A.mt,48,10,6,3,0);ridge(A.mt2,30,7,4,2,90);f.fillStyle='#1f5a34';for(let i=0;i<9;i++){const x=i*40+12,h=(Math.round(30+arProf(x+90,7,4,2))>>2)<<2,y=100-h;f.fillRect(x+4,y-6,4,8);f.beginPath();f.arc(x+6,y-12,9,0,TAU);f.fill()}f.fillStyle='#6ad07a';for(let i=0;i<9;i++){const x=i*40+12,h=(Math.round(30+arProf(x+90,7,4,2))>>2)<<2;f.fillRect(x+2,100-h-18,4,3)}}
  if(K==1){ridge(A.mt,40,12,3,1,0,0,2);f.fillStyle='#8a5a1a';[[70,46],[250,34]].forEach(q=>{for(let r=0;r<q[1];r+=4)f.fillRect(q[0]-q[1]+r,100-q[1]+r/1-0,(q[1]-r)*2,4)});f.fillStyle='#b08030';[[70,46],[250,34]].forEach(q=>{for(let r=0;r<q[1];r+=4)f.fillRect(q[0],100-q[1]+r,q[1]-r,4)});ridge(A.mt2,22,8,3,1,140,0,2);
    f.fillStyle='#4a7a2a';[[150,30],[320,24]].forEach(q=>{f.fillRect(q[0],100-q[1],6,q[1]);f.fillRect(q[0]-6,100-q[1]+8,6,4);f.fillRect(q[0]-6,100-q[1]+2,4,8);f.fillRect(q[0]+6,100-q[1]+12,6,4);f.fillRect(q[0]+8,100-q[1]+6,4,8)})}
  if(K==2){ridge(A.mt,60,16,10,6,0,1);ridge(A.mt2,38,10,7,4,70,1);f.fillStyle='#ffffff';for(let x=0;x<360;x+=4){const h=(Math.round(60+arProf(x,16,10,6,1))>>2)<<2;if(h>66)f.fillRect(x,100-h,4,4)}f.fillStyle='#e0f8ff';for(let i=0;i<7;i++){const x=i*52+20;f.fillRect(x,72,4,28);f.fillRect(x+4,80,4,20);f.fillRect(x-4,84,4,16);f.fillRect(x+1,68,2,4)}}
  if(K==3){ridge(A.mt,40,12,8,5,0,1);f.fillStyle='#4a1a12';for(let y=0;y<80;y+=4){const w=24+y*1.6;f.fillRect(180-w/2,20+y,w,4)}f.fillStyle='#6a2a18';for(let y=0;y<80;y+=4){const w=24+y*1.6;f.fillRect(180-w/2,20+y,4,4)}f.fillStyle='#ff6a1a';f.fillRect(166,20,28,4);f.fillStyle='#ffd040';f.fillRect(172,18,16,3);
    f.fillStyle='#ff5a1a';for(let y=24;y<100;y+=4){f.fillRect(176+Math.round(Math.sin(y*.15)*4)-(y-24)*.25,y,4,4);f.fillRect(186+Math.round(Math.cos(y*.13)*3)+(y-24)*.3,y,3,4)}f.fillStyle='rgba(60,40,40,.5)';for(let i=0;i<5;i++){f.beginPath();f.arc(170+i*8,10-i*2,8+i*2,0,TAU);f.fill()}
    ridge(A.mt2,22,6,4,3,120,1)}
  if(K==4){ridge(A.mt,30,8,5,3,0,1);f.fillStyle=A.mt2;[[40,60],[70,44],[150,70],[180,82],[210,66],[300,54],[330,40]].forEach(q=>{f.fillRect(q[0]-6,100-q[1],12,q[1]);f.beginPath();f.moveTo(q[0]-8,100-q[1]);f.lineTo(q[0],100-q[1]-16);f.lineTo(q[0]+8,100-q[1]);f.fill()});
    f.fillStyle='#ffcf4a';[[40,48],[150,56],[180,70],[180,52],[210,50],[300,40]].forEach(q=>f.fillRect(q[0]-1,100-q[1],3,4))}
  if(K==5){f.fillStyle='#c8d8f0';for(let i=0;i<4;i++){const x=i*96+30,y=40+(i%2)*22;f.fillRect(x-24,y,48,6);f.fillStyle='#4aa860';f.fillRect(x-24,y-3,48,3);f.fillStyle='#8a7a6a';for(let r=0;r<16;r+=4)f.fillRect(x-20+r,y+6+r,40-r*2,4);f.fillStyle='#c8d8f0'}
    f.fillStyle='#ffffff';for(let i=0;i<5;i++){f.fillRect(150+i*14,58,6,42);f.fillStyle='#e0e8f8';f.fillRect(154+i*14,58,2,42);f.fillStyle='#ffffff'}f.fillRect(144,52,72,6);f.fillStyle='#ffe08a';f.fillRect(144,50,72,2);
    ridge('#f4f8ff',14,4,3,2,30)}
  if(K==6){f.fillStyle=A.mt2;[[40,30,10],[130,60,6],[220,24,14],[300,56,8],[350,20,5]].forEach(q=>{f.beginPath();f.moveTo(q[0]-q[2],q[1]);f.lineTo(q[0]-q[2]*.4,q[1]-q[2]*.8);f.lineTo(q[0]+q[2]*.7,q[1]-q[2]*.6);f.lineTo(q[0]+q[2],q[1]+q[2]*.3);f.lineTo(q[0],q[1]+q[2]*.9);f.fill()});f.fillStyle='#4a4a8a';[[40,30],[220,24],[300,56]].forEach(q=>f.fillRect(q[0]-2,q[1]-3,3,2));
    ridge(A.mt,16,6,4,3,0,1)}
  if(K==7){f.strokeStyle='#ffffff';f.globalAlpha=.6;f.lineWidth=1;[[40,70,18],[110,40,12],[190,64,22],[270,30,10],[330,72,16]].forEach((q,i)=>{f.beginPath();f.moveTo(q[0],q[1]-q[2]);f.lineTo(q[0]+q[2]*.8,q[1]+q[2]*.5);f.lineTo(q[0]-q[2]*.8,q[1]+q[2]*.5);f.closePath();f.stroke();if(i%2){f.strokeRect(q[0]-4,q[1]+q[2],8,8)}});f.globalAlpha=1;
    f.fillStyle='#1a1a1a';for(let x=0;x<360;x+=8){const h=((x*13)%5)*4+8;f.fillRect(x,100-h,8,h)}f.fillStyle='#ffffff';for(let x=0;x<360;x+=8){const h=((x*13)%5)*4+8;f.fillRect(x,100-h,8,1)}}
  /* 地面 */
  n.fillStyle=A.gr;n.fillRect(0,0,360,40);n.fillStyle=A.gr2;n.fillRect(0,0,360,2);n.fillStyle='rgba(0,0,0,.22)';n.fillRect(0,2,360,3);
  if(K==0){n.fillStyle='#2e7a32';for(let i=0;i<15;i++){n.fillRect(i*24,12+(i*7%3)*8,12,2);n.fillRect(i*24+6,26+(i*5%3)*4,8,2)}n.fillStyle='#58b868';for(let i=0;i<20;i++){n.fillRect(i*18+3,3,2,4);n.fillRect(i*18+5,1,2,6)}['#ffe14d','#ff7ab8','#ffffff'].forEach((c,j)=>{n.fillStyle=c;for(let i=0;i<5;i++)n.fillRect((i*71+j*23+9)%356,10+((i+j)*11)%24,2,2)})}
  if(K==1){n.fillStyle='#b8863a';for(let y=10;y<40;y+=8)for(let x=0;x<360;x+=4)n.fillRect(x,y+Math.round(Math.sin((x+y*7)*.05)*2),4,1);n.fillStyle='#fff0b0';for(let i=0;i<8;i++)n.fillRect((i*47+5)%356,6+(i*9)%28,2,1)}
  if(K==2){n.fillStyle='#a8d0f0';for(let i=0;i<9;i++){n.fillRect(i*40+6,10+(i%3)*8,18,1);n.fillRect(i*40+20,11+(i%3)*8,1,6)}n.fillStyle='#7ff3ff';for(let i=0;i<10;i++)n.fillRect((i*37+11)%356,6+(i*7)%30,2,2)}
  if(K==3){n.fillStyle='#ff9a2a';for(let i=0;i<7;i++){n.fillRect(i*52+10,8+(i%3)*8,20,2);n.fillRect(i*52+26,10+(i%3)*8,2,8)}n.fillStyle='#1a0a08';for(let i=0;i<12;i++)n.fillRect(i*30+4,24+(i%2)*6,10,4)}
  if(K==4){n.fillStyle='#e03aff';n.globalAlpha=.45;for(let x=0;x<360;x+=24)n.fillRect(x,4,1,36);for(let y=8;y<40;y+=10)n.fillRect(0,y,360,1);n.globalAlpha=1;n.fillStyle='#ff6af0';for(let i=0;i<6;i++){const x=i*60+18,y=16+(i%2)*10;n.fillRect(x,y,6,1);n.fillRect(x+2,y-2,2,5)}}
  if(K==5){n.fillStyle='#c8d8f8';for(let i=0;i<12;i++)n.fillRect(i*30,14+(i%3)*8,22,3);n.fillStyle='#ffffff';for(let i=0;i<24;i++){n.beginPath();n.arc(i*16+8,2,7+(i%3)*2,Math.PI,0);n.fill()}}
  if(K==6){n.fillStyle='#80f0ff';n.globalAlpha=.4;for(let x=0;x<360;x+=30){n.fillRect(x,4,1,36)}for(let y=10;y<40;y+=12)n.fillRect(0,y,360,1);n.globalAlpha=1;n.fillStyle='#b0a0ff';for(let i=0;i<8;i++){const x=i*46+10;n.fillRect(x,20,4,8);n.fillRect(x+1,16,2,4)}}
  if(K==7){for(let y=4;y<40;y+=6)for(let x=0;x<360;x+=12){if(((x/12)+(y/6))%2<1){n.fillStyle='#202020';n.fillRect(x,y,12,6)}}n.fillStyle='#ffffff';n.globalAlpha=.35;for(let x=0;x<=360;x+=36){n.fillRect(x,4,1,36)}n.globalAlpha=1}
  return ARB[a]={sky:arSkyCv(A,A.sky,0),late:arSkyCv(A,A.late,1),far,nr}}
/* 動く小物(1フレームあたり ≤24 矩形) */
function arAnim(t,A){const K=A.k;
  if(K==0){for(let i=0;i<5;i++){const x=(i*83+t*(14+i*3))%380-10,y=96+Math.sin(t*2+i*2)*10;bc.fillStyle=i%2?'#ffe14d':'#ffffff';const w=Math.sin(t*12+i)>0?3:1;bc.fillRect(Math.round(x),Math.round(y),w,2)}}
  if(K==1){bc.fillStyle='rgba(255,230,170,.45)';for(let i=0;i<10;i++){const x=360-((t*(120+i*20)+i*61)%420),y=96+(i*7)%28;bc.fillRect(Math.round(x),y,14+(i%3)*6,1)}}
  if(K==2){bc.fillStyle='#ffffff';for(let i=0;i<22;i++){const x=(i*47+Math.sin(t+i)*10-t*8)%370,y=(t*(18+i%4*6)+i*23)%150;bc.fillRect(Math.round(x<0?x+370:x),Math.round(y),i%3?2:1,i%3?2:1)}}
  if(K==3){for(let i=0;i<14;i++){const x=(i*61)%360+Math.sin(t*1.7+i)*6,y=140-((t*(24+i%5*8)+i*31)%150);bc.fillStyle=i%3?'#ff8a1f':'#ffe14d';bc.fillRect(Math.round(x),Math.round(y),2,2)}}
  if(K==4){for(let i=0;i<7;i++){const x=(i*59+t*10)%380-10,y=70+Math.sin(t*1.3+i*1.9)*30;bc.globalAlpha=.35+.25*Math.sin(t*2+i);bc.fillStyle=i%2?'#d27aff':'#7ff3ff';bc.fillRect(Math.round(x),Math.round(y),4,4);bc.fillRect(Math.round(x)+1,Math.round(y)+4,2,4)}bc.globalAlpha=1}
  if(K==5){bc.fillStyle='rgba(255,250,220,.08)';for(let i=0;i<3;i++){const x=40+i*120+Math.sin(t*.3+i)*20;bc.beginPath();bc.moveTo(x,0);bc.lineTo(x+30,0);bc.lineTo(x-10,150);bc.lineTo(x-40,150);bc.fill()}
    bc.fillStyle='#fffbe0';for(let i=0;i<6;i++){const x=(i*67+t*6)%360,y=30+(i*29)%80;if(Math.sin(t*3+i*2)>.3)bc.fillRect(Math.round(x),y,2,2)}}
  if(K==6){const p=(t*.5)%6;if(p<.8){const q=p/.8,x=320-q*220,y=10+q*50;for(let k=0;k<6;k++){bc.globalAlpha=(1-q)*(1-k/6);bc.fillStyle='#fff8d0';bc.fillRect(Math.round(x+k*6),Math.round(y-k*1.4),3-(k>2?1:0),2)}bc.globalAlpha=1}}
  if(K==7){for(let i=0;i<6;i++){const ph=Math.floor(t*1.2+i*.37);const s=(ph*7919+i*104729)%997;if(s%3)continue;bc.globalAlpha=.25;bc.fillStyle=i%2?'#ffffff':'#ff2040';bc.fillRect(s%340,(s*7)%110+10,6+(s%4)*4,2)}bc.globalAlpha=1}}
{const _bg=drawBgB;drawBgB=function(t){let a,v;try{a=arArea(G.stage);v=Math.min(4,Math.floor(((G.stage-1)%25)/5));if(AR.pend&&AR.prevA>=0&&AR.prevA!==a){a=AR.prevA;v=4}}catch(e){return _bg(t)}const A=AREAS[a];let B=ARB[a];if(!B){try{B=arMkBg(a)}catch(e){return _bg(t)}}
  bc.drawImage(B.sky,-8,-8);if(v){bc.globalAlpha=v/4*.9;bc.drawImage(B.late,-8,-8);bc.globalAlpha=1}
  if(A.st){bc.fillStyle='#fff';for(let i=0;i<AR_ST.length;i+=(A.k==6?1:2)){bc.globalAlpha=.3+.4*Math.sin(t*1.4+i*1.7);const s=AR_ST[i];bc.fillRect(s[0],s[1],s[2],s[2])}bc.globalAlpha=1}
  const o1=-((t*3)%360),o2=-((t*8)%360);bc.drawImage(B.far,o1,20);bc.drawImage(B.far,o1+360,20);bc.drawImage(B.nr,o2,118);bc.drawImage(B.nr,o2+360,118);
  arAnim(t,A)}}

/* ===== 敵の描画: 色違い/第2形態へ差し替え + オーラ ===== */
const arRaging=()=>isBoss()&&AR.rageSt===G.stage;
function arAura(t,sn,col,str){const S=SPR[sn];if(!S)return;const age=t-ENT;if(age<.85)return;const sc=4,dw=S.width*sc,dh=S.height*sc,dx=EXX-dw/2,dy=124-dh,p=.5+.5*Math.sin(t*4),sil=arSil(sn,col),g=6+Math.round(p*3);
  bc.globalAlpha=(.22+.18*p)*str;bc.drawImage(sil,dx-g,dy-g,dw+g*2,dh+g*2);bc.globalAlpha=(.3+.15*p)*str;bc.drawImage(sil,dx-3,dy-3,dw+6,dh+6);bc.globalAlpha=1;
  for(let i=0;i<8;i++){const x=dx+8+((i*29)%(dw-16)),y=dy+dh-((t*(40+i*9)+i*17)%(dh+10));bc.fillStyle=i%2?col:'#ffffff';bc.globalAlpha=.6*str;bc.fillRect(Math.round(x+Math.sin(t*3+i)*3),Math.round(y),2,3)}bc.globalAlpha=1}
{const _de=drawEnemy;drawEnemy=function(t){let sn,vn,swap=0;try{sn=enSpr();const boss=isBoss(),g=boss&&arGuard();
    vn=g?(arRaging()?arFormName(sn):sn):arVarName(sn,arArea(G.stage));
    if(g)arAura(t,vn,AREAS[arArea(G.stage)].ac,arRaging()?.7:.8);if(boss&&arRaging())arAura(t,vn,'#ff2030',1);
    if(vn!==sn&&SPR[vn]){swap=SPR[sn];SPR[sn]=SPR[vn]}}catch(e){swap=0}
  try{_de(t)}finally{if(swap)SPR[sn]=swap}
  try{if(sn&&isBoss()&&arRaging())arRageFx(t,vn||sn)}catch(e){}}}
/* 怒り/形態変化の瞬間: 白→赤の点滅は敵の形だけ(全画面フラッシュは使わない)+衝撃リング+文字 */
function arRageFx(t,sn){const p=t-AR.rage0,S=SPR[sn];if(!S)return;const sc=4,dw=S.width*sc,dh=S.height*sc,dx=EXX-dw/2,dy=124-dh;
  if(p<.5){bc.globalAlpha=(1-p/.5)*.85;bc.drawImage(arSil(sn,'#ffffff'),dx,dy,dw,dh);bc.globalAlpha=1}
  else{bc.globalAlpha=.12+.06*Math.sin(t*5);bc.drawImage(arSil(sn,'#ff2030'),dx,dy,dw,dh);bc.globalAlpha=1}}
function arTxtFx(t){const p=t-AR.rage0;if(!arRaging()||p<0||p>1.6)return;const a=Math.min(1,p*6,(1.6-p)*3),s=p<.12?1.8-p/.12*.8:1;bc.save();bc.globalAlpha=a;bc.textAlign='center';bc.translate(EXX,40);bc.scale(s,s);
  thickTxt(bc,AR.form?'形態変化!!':'怒り状態!!',0,0,14,AR.form?'#ff5aff':'#ff4040');bc.restore();bc.globalAlpha=1}
/* ===== エリアの主の大爆発 + AREA CLEAR!! ===== */
function arBoomDraw(t){const B=AR.boom;if(!B)return;const p=t-B.t0;if(p>2.2){AR.boom=null;return}if(p<0)return;const c=AREAS[B.a].ac;
  if(p<1.2){const q=p/1.2;for(let i=0;i<7;i++){const x=EXX+(i-3)*22+Math.sin(i*2.1)*6,h=Math.min(1,q*3)*(110+(i%3)*20),w=(i%2?6:10)*(1-q*.6);bc.globalAlpha=(1-q)*.7;bc.fillStyle=i%2?c:'#ffffff';bc.fillRect(Math.round(x-w/2),Math.round(124-h),Math.round(w),Math.round(h))}bc.globalAlpha=1}
  for(let k=0;k<3;k++){const q=(p-k*.18)/.9;if(q<0||q>1)continue;bc.globalAlpha=1-q;bc.strokeStyle=k==1?'#ffffff':c;bc.lineWidth=Math.max(1,6*(1-q));bc.beginPath();bc.ellipse(EXX,110,10+q*170,4+q*44,0,0,TAU);bc.stroke()}bc.globalAlpha=1;
  if(p<1.5){const q=p/1.5;for(let i=0;i<12;i++){const an=i*.5236+p*.6,r=14+q*90;bc.globalAlpha=(1-q)*.9;bc.fillStyle=i%2?c:'#fff8d0';const s=i%3?3:5;bc.fillRect(Math.round(EXX+Math.cos(an)*r)-s/2,Math.round(80+Math.sin(an)*r*.6)-s/2,s,s)}bc.globalAlpha=1}}
function arClearTxt(t){const B=AR.boom;if(!B)return;const p=t-B.t0-.25;if(p<0||p>1.9)return;const a=Math.min(1,p*5,(1.9-p)*3);bc.globalAlpha=a;bc.textAlign='center';thickTxt(bc,'AREA CLEAR!!',180,40,16,AREAS[B.a].ac);bc.globalAlpha=1}
/* ===== エリアタイトル帯 ===== */
function arTitleDraw(t){const R=AR.title;if(!R)return;const p=t-R.t0;if(p<0)return;if(p>3.4){AR.title=null;return}const A=AREAS[R.a],e=Math.min(1,p/.3),out=p>2.9?(p-2.9)/.5:0,a=1-out;
  const hw=Math.round(180*(1-(1-e)*(1-e)));bc.save();bc.globalAlpha=a*.78;bc.fillStyle='#05030c';bc.fillRect(180-hw,48,hw*2,56);bc.globalAlpha=a;bc.fillStyle=A.ac;bc.fillRect(180-hw,46,hw*2,2);bc.fillRect(180-hw,104,hw*2,2);
  bc.fillStyle='#ffffff';bc.fillRect(180-hw,49,hw*2,1);bc.fillRect(180-hw,102,hw*2,1);
  if(p>.15){const sx=Math.round((1-Math.min(1,(p-.15)/.3))*60);const lab='AREA '+(R.i+1);pxText(bc,lab,180-sx,54,2,'#ffffff',A.ac,'c');
    bc.textAlign='center';const nm=A.n+(R.lap?' '+['','II','III','IV','V'][Math.min(4,R.lap)]:'');thickTxt(bc,nm,180+sx,94,22,A.ac);
    for(let i=0;i<6;i++){const x=(180-hw)+((i*67+t*40)%(hw*2||1));bc.globalAlpha=a*.7;bc.fillStyle='#ffffff';bc.fillRect(Math.round(x),i%2?52:98,2,2)}}
  bc.restore();bc.globalAlpha=1}
function arSnd(){try{if(sOK()){const t=sNow();[523,659,784,1047,1319].forEach((f,i)=>tone(f,t+i*.08,.16,'square',.028));tone(262,t,.5,'triangle',.04)}}catch(e){}}
function arRageSnd(){try{if(sOK()){const t=sNow();tone(110,t,.5,'sawtooth',.05,55);tone(165,t+.05,.4,'square',.025,82)}}catch(e){}}

/* ===== 進行: エリアの切り替わり/怒りの検出/撃破 ===== */
{const _k=kill;kill=function(){const s0=G.stage,wb=isBoss(),wg=wb&&arGuard(s0),a0=arArea(s0);const r=_k.apply(this,arguments);
  try{if(wg&&run){AR.boom={t0:T,a:a0};HS=Math.max(HS,.35);for(let i=0;i<4;i++)ringFx(EXX,84,120+i*40,i%2?'#ffffff':AREAS[a0].ac,5,.5,.1+i*.12);
      try{if(sOK()){const t=sNow();tone(80,t,.8,'sawtooth',.06,40);[784,988,1175,1568].forEach((f,i)=>tone(f,t+.3+i*.09,.18,'square',.03))}}catch(e){}}
    if(G.stage>s0&&arIdx(G.stage)!==arIdx(s0))AR.delay=T+(s0%10==0?3.1:1.8)}catch(e){}return r}}
/* deathFx(82) は撃破した敵の画素色で爆散する → 色違い/第2形態の色で散らす */
{const _df=deathFx;deathFx=function(spr,boss){let n=spr;try{const st=G.stage-1;if(/^b([4-9]|1[01])$/.test(spr)){if(AR.rageSt===st)n=arFormName(spr)}else n=arVarName(spr,arArea(st))}catch(e){n=spr}return _df.call(this,n||spr,boss)}}
/* ボス名: エリアの主は BOSSN の代わりに専用の名前(描画の間だけ差し替え) */
{const _hp=drawHP;drawHP=function(t){let i=-1,o;try{if(isBoss()&&arGuard()){i=(G.stage/5-1)%4;o=BOSSN[i];BOSSN[i]=AREAS[arArea(G.stage)].g}}catch(e){i=-1}try{return _hp.apply(this,arguments)}finally{if(i>=0)BOSSN[i]=o}}}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{
    if(isBoss()&&G.mx>0&&G.hp>0&&G.hp<G.mx*.5&&AR.rageSt!==G.stage){AR.rageSt=G.stage;AR.rage0=T;AR.form=arGuard()?1:0;if(run){arRageSnd();ringFx(EXX,84,140,AR.form?'#ff5aff':'#ff2030',6,.5);ringFx(EXX,84,90,'#ffffff',3,.4,.08)}}
    if(!isBoss()&&AR.rageSt&&AR.rageSt!==G.stage)AR.rageSt=0;
    const ai=arIdx(G.stage);if(run&&ai!==AR.cur){AR.prevA=AR.cur>=0&&AR.delay>T?AR.cur%AREAS.length:-1;AR.cur=ai;AR.pend=1;if(!(AR.delay>T))AR.delay=T+.8}
    if(AR.pend&&AR.delay!=null&&T>=AR.delay){AR.pend=0;AR.delay=null;AR.title={t0:T,a:arArea(G.stage),i:arIdx(G.stage),lap:arLap(G.stage)};arSnd()}
  }catch(e){AR.title=null;AR.boom=null}return r}}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{bc.imageSmoothingEnabled=false;arBoomDraw(t);arTxtFx(t);arClearTxt(t);arTitleDraw(t)}catch(e){AR.title=null;AR.boom=null}return r}}
/* 戦闘以外のUI向け: 現在のエリア名(他ファイルから使える) */
