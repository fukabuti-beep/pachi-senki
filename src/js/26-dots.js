/* ---------- ui: ドット絵ツールキット (リール図柄/アイコン/ハンドル) + UI設定 ----------
   すべて文字マップ→Canvasで生成(画像ファイル無し)。内部の公開名は UX と reelShow のみ。 */
const UX=(()=>{
const PAL={k:'#1a0f2e',w:'#ffffff',W:'#e4e9ff',s:'#a3accf',S:'#59629a',r:'#ff3355',R:'#a8142f',o:'#ff9a1f',O:'#c4620a',y:'#ffd400',Y:'#b98300',g:'#43e060',G:'#168a35',b:'#3aa8ff',B:'#1558c0',p:'#ff7ac0',P:'#a02a78',c:'#27e3ff',C:'#0d86a8',v:'#a066ff',V:'#5a2ca8',n:'#8a5a2b',N:'#5a3510',d:'#2b2250'};
const mkc=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const fromMap=(rows,pal)=>{const h=rows.length,w=rows[0].length,c=mkc(w,h),x=c.getContext('2d'),p=pal||PAL;for(let y=0;y<h;y++)for(let i=0;i<w;i++){const ch=rows[y][i],col=p[ch];if(col&&ch!='.'){x.fillStyle=col;x.fillRect(i,y,1,1)}}return c};
/* ---- 図柄(16x16) 0..9 : 0チェリー 1ベル 2スイカ 3BAR 4星 5王冠 6宝石 7赤セブン 8剣 9炎 ---- */
const SYM=[
['................','..........ggg...','.........gGGgg..','........n..ggg..','.......n........','......n..n......','.....n....n.....','....n......n....','...kkk.....kkk..','..krrrk...krrrk.','.krwrrRk.krwrrRk','.krwrrRk.krrrrRk','.krrrrRk.krrrrRk','..kRrRk...kRRRk.','...kkk.....kkk..','................'],
['.......kk.......','......kyyk......','.....kywyyk.....','....kywyyyYk....','...kywyyyyyYk...','...kywyyyyyYk...','..kywyyyyyyYYk..','..kyyyyyyyyYYk..','..kyyyyyyyyYYk..','.kyyyyyyyyyYYYk.','.kyyyyyyyyyYYYk.','kyyyyyyyyyyYYYYk','kYYYYYYYYYYYYYYk','.kkkkkkkkkkkkkk.','.....kooook.....','......kkkk......'],
['................','................','.kkkkkkkkkkkkkk.','kGGGGGGGGGGGGGGk','kgggggggggggggGk','kwwwwwwwwwwwwwwk','krrrrrrrrrrrrrrk','krrkrrrrrrkrrrrk','.krrrrkrrrrrrrk.','.krrrrrrrrkrrrk.','..krrkrrrrrrrk..','...krrrrrrrrk...','....krrrkrrk....','.....kkrrrk.....','.......kk.......','................'],
null,
['................','.......kk.......','......kyyk......','......kyyk......','.....kywyyk.....','kkkkkkywyYkkkkkk','kyyyyyywyyyyyyYk','.kyyyywyyyyyYYk.','..kyyyyyyyyYYk..','...kyyyyyyYYk...','...kyyyyyyYYk...','..kyyyYkkYYYYk..','..kyyYk..kYYYk..','.kyyYk....kYYYk.','.kkkk......kkkk.','................'],
['................','.kk....kk....kk.','kyyk..kyyk..kyyk','kyyyk.kyyk.kyyyk','kywyykyyyykyyyYk','kywyyyyyyyyyyYYk','kywyyyyrryyyyYYk','kyyyyyyrryyyyYYk','kyyyyyyyyyyyyYYk','kYYYYYYYYYYYYYYk','.kkkkkkkkkkkkkk.','.kbbyyyybbyyyyk.','.kkkkkkkkkkkkkk.','................','................','................'],
['................','....kkkkkkkk....','...kwcccccccck..','..kwcccwcccccck.','.kcccccccccccCck','kkkkkkkkkkkkkkkk','.kcwcccccccccCk.','..kcwccccccCCk..','...kcwccccCCk...','....kcwccCCk....','.....kcccCk.....','......kccCk.....','.......kk.......','................','................','................'],
null,
['.......kk.......','......kWWk......','......kWsk......','......kWsk......','......kWsk......','......kWsk......','......kWsk......','......kWsk......','......kWSk......','..kkkkkkkkkkkk..','.kyyyyyyyyyyyYk.','..kkkkkkkkkkkk..','......knnk......','......knnk......','.....kyyyyk.....','.....kkkkkk.....'],
['................','.......o........','.......oo.......','......ooo.......','......oooo......','.....ooyooo.....','....oooyyoo.....','....ooyyyyoo.o..','...ooyyyyyoooo..','...ooyywyyyooo..','..oooyywyyyoooo.','..ooryywyyyyoor.','..ooryyyyyyyoor.','...orryyyyyyorr.','....orrryyyrrr..','.....rrrrrrrr...']];
/* BAR: 3x5ドット文字 */
(function(){const L={B:['ww.','w.w','ww.','w.w','ww.'],A:['.w.','w.w','www','w.w','w.w'],R:['ww.','w.w','ww.','w.w','w.w']},rows=[];
for(let y=0;y<16;y++)rows.push('................');
const put=(y,str)=>{rows[y]=str};
put(3,'kkkkkkkkkkkkkkkk');put(4,'kyyyyyyyyyyyyyyk');
for(let y=5;y<=11;y++)rows[y]='kBBBBBBBBBBBBBBk';
for(let ly=0;ly<5;ly++){let s='kBB';['B','A','R'].forEach((c,ci)=>{s+=L[c][ly]+(ci<2?'.':'')});s=s.replace(/\./g,'B');rows[6+ly]=(s+'BBBBBBBBBBBBBBBB').slice(0,15)+'k'}
put(12,'kYyyyyyyyyyyyyYk');put(13,'kkkkkkkkkkkkkkkk');SYM[3]=rows})();
/* 赤セブン: 形をマスクで作り、2段の縁取り(金/黒)と陰影を付ける */
(function(){const N=16,m=[];for(let y=0;y<N;y++){m.push([]);for(let x=0;x<N;x++)m[y].push(0)}
for(let y=3;y<=6;y++)for(let x=3;x<=12;x++)m[y][x]=1;
for(let y=7;y<=13;y++){const t=y-7,x1=Math.round(12-t*.95),x0=x1-3;for(let x=x0;x<=x1;x++)if(x>=0)m[y][x]=1}
const dil=a=>a.map((r,y)=>r.map((v,x)=>{if(v)return 1;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const q=a[y+j]&&a[y+j][x+i];if(q)return 1}return 0}));
const d1=dil(m),d2=dil(d1),rows=[];
for(let y=0;y<N;y++){let s='';for(let x=0;x<N;x++){let c='.';if(m[y][x]){const top=!(m[y-1]&&m[y-1][x]),lft=!m[y][x-1],bot=!(m[y+1]&&m[y+1][x]),rgt=!m[y][x+1];c=(top||lft)?'p':(bot||rgt)?'R':'r';if(y>=4&&y<=5&&x>=4&&x<=11&&c=='r')c=(y==4)?'r':'r'}else if(d1[y][x])c='y';else if(d2[y][x])c='k';s+=c}rows.push(s)}
SYM[7]=rows})();
const SYMC=SYM.map(r=>fromMap(r));
/* 7の光沢スイープ用: 7の赤い画素 */
const S7=[];SYM[7].forEach((r,y)=>{for(let x=0;x<16;x++)if('rpR'.indexOf(r[x])>=0)S7.push([x,y])});
/* ---- リール描画 (16x16窓)。ph: 回転位相(小数部がスクロール量) ---- */
const BGC='#f2ead2';
function drawReel(x,d,spin,ph,ox,oy,gl){
x.save();x.beginPath();x.rect(ox,oy,16,16);x.clip();
x.fillStyle=BGC;x.fillRect(ox,oy,16,16);x.fillStyle='#d8cca6';x.fillRect(ox,oy+3,16,1);x.fillRect(ox,oy+12,16,1);
if(!spin){x.drawImage(SYMC[d],ox,oy);if(d==7&&gl>=0){x.fillStyle='#fff';for(const p of S7)if(Math.abs(p[0]+p[1]-gl)<=1)x.fillRect(ox+p[0],oy+p[1],1,1)}}
else{const f=ph-Math.floor(ph),off=Math.round(f*16),n=(d+1)%10;
x.drawImage(SYMC[n],ox,oy+off-16);x.drawImage(SYMC[d],ox,oy+off);
x.globalAlpha=.4;x.drawImage(SYMC[d],ox,oy+off+3);x.drawImage(SYMC[n],ox,oy+off-13);x.drawImage(SYMC[d],ox,oy+off-3);x.drawImage(SYMC[n],ox,oy+off-19);x.globalAlpha=1;
x.fillStyle='rgba(255,255,255,.45)';for(let i=0;i<3;i++)x.fillRect(ox,oy+(i*6+off)%16,16,1);
x.fillStyle='rgba(80,120,255,.12)';x.fillRect(ox,oy,16,16)}
/* 円筒の陰影 */
x.fillStyle='rgba(20,10,60,.42)';x.fillRect(ox,oy,16,1);x.fillRect(ox,oy+15,16,1);x.fillStyle='rgba(20,10,60,.2)';x.fillRect(ox,oy+1,16,1);x.fillRect(ox,oy+14,16,1);x.fillStyle='rgba(20,10,60,.1)';x.fillRect(ox,oy+2,16,1);x.fillRect(ox,oy+13,16,1);
x.restore()}
const RS=[],cur=[7,7,7];let GL=-1;
function initReel(i){const el=$('r'+i);el.textContent='';const cv=mkc(16,16);cv.className='rc';try{el.appendChild(cv)}catch(e){}return RS[i]={el,cv,x:cv.getContext('2d'),key:''}}
function reel(i,d,spin,ph){const st=RS[i]||initReel(i);d=((d|0)%10+10)%10;ph=ph||0;
const k=d+(spin?'s'+Math.round((ph-Math.floor(ph))*16):'n'+(d==7?GL:-1));if(st.key===k)return;const was=st.spin;st.key=k;st.spin=spin;cur[i]=d;
drawReel(st.x,d,spin,ph,0,0,GL);
if(was!==spin)st.el.className=spin?'r s':was?'r stp':'r'}
function glint(g){if(g===GL)return;GL=g;for(let i=0;i<3;i++)if(cur[i]==7&&RS[i]&&!RS[i].spin)reel(i,7,0)}
/* ---- ドット小アイコン(10x10) ---- */
const ICN={
atk:['.......skk.','......sWsk.','.....sWsk..','....sWsk...','k..sWsk....','ykWsk......','.kyk.......','nkyyk......','nnk..k.....','nk.........'].map(r=>r.slice(0,10)),
spd:['..........','yy..yy....','.yy..yy...','..yy..yy..','...yy..yy.','...yy..yy.','..yy..yy..','.yy..yy...','yy..yy....','..........'],
hit:['...rrrr...','..rwwwwr..','.rwrrrrwr.','rwrwwwwrwr','rwrwrrwrwr','rwrwrrwrwr','rwrwwwwrwr','.rwrrrrwr.','..rwwwwr..','...rrrr...'],
gld:['...YYYY...','..YyyyyY..','.YyywyyyY.','YyywyYyyyY','YywyyYyyyY','YywyyYyyyY','YyywyYyyyY','.YyyyYyyY.','..YyyyyY..','...YYYY...'],
cri:['....yy....','....yy....','y...yy...y','.y.yyyy.y.','..yywwyy..','yyyywwyyyy','..yywwyy..','.y.yyyy.y.','y...yy...y','....yy....'],
luk:['..gg..gg..','.gGGgGGGg.','.gGgGgggGg','..gggggg..','.gGgGggGg.','gGGgGgGGGg','.gg.gg.gg.','....gG....','....gG....','...gG.....'],
chg:['...cccc...','..kkkkkk..','.kCcccckk.','.kCcwcck..','.kCcccck..','.kCcwcck..','.kCcccck..','.kCcccck..','.kkkkkkk..','..........'],
ext:['.kkkkkkkk.','.kwwwwwwk.','..kwyyyk..','...kwyk...','....kk....','....kk....','...kyyk...','..kyyyyk..','.kyyyyyyk.','.kkkkkkkk.'],
gol:['..yyyyyy..','.yywwyyyy.','yywyyyyyyY','ywyyyyyyyY','yyyyyyyyyY','yyyyyyyyyY','yyyyyyyyYY','.yyyyyYYY.','..YYYYYY..','..........'],
fes:['...r..o...','.o..r..r..','..r.oo.o..','r..ooyy..o','.roywwyor.','..oywwyo.r','o..oyyo...','..o.oo.r.o','.r.r.o....','...o..r...']};
ICN.gear=['....kk....','.k.kyyk.k.','.kkyyyykk.','..kyYYyk..','kyyYkkYyyk','kyyYkkYyyk','..kyYYyk..','.kkyyyykk.','.k.kyyk.k.','....kk....'];
ICN.note=['....kkkkk.','....kwwwk.','....kwkkk.','....kwk...','....kwk...','..kkkwk...','.kyyykk...','.kyyyk....','..kkk.....','..........'];
ICN.up=['....yy....','...yyyy...','..yywwyy..','.yywwwwyy.','yyyywwyyyy','...yywwy..','...yywwy..','...yyyyy..','..........','..........'];
const ICNC={};for(const k in ICN)ICNC[k]=fromMap(ICN[k]);
const UPI=['atk','spd','hit','gld','cri','luk','chg','ext','gol','fes'];
function icons(){UPI.forEach((n,i)=>{const e=$('ic'+i);if(!e||!e.getContext)return;const x=e.getContext('2d');x.clearRect(0,0,10,10);x.drawImage(ICNC[n],0,0)})}
function putIcon(id,n){const e=$(id);if(!e||!e.getContext)return;const x=e.getContext('2d');x.clearRect(0,0,10,10);x.drawImage(ICNC[n],0,0)}
/* ---- ハンドル(28x28, 12コマ) : 光は左上。角度aのレバーが回る ---- */
function handleRows(a){const rows=[],c=13.5,ca=Math.cos(a),sa=Math.sin(a);
for(let y=0;y<28;y++){let s='';for(let x=0;x<28;x++){const dx=x-c,dy=y-c,r=Math.hypot(dx,dy),th=Math.atan2(dy,dx),lit=r?(-dx-dy)/(r*1.414):0;let ch='.';
if(r<=13.4){
if(r>12.2)ch='k';
else if(r>10.3){ch=lit>.55?'w':lit>.05?'W':lit>-.45?'s':'S';if(Math.cos(8*(th-a))>.82)ch=lit>0?'s':'S'}
else{ch=r>8.6&&lit<-.15?'R':'r';if((dx+4)*(dx+4)+(dy+4)*(dy+4)<7)ch='p'}
const t=dx*ca+dy*sa,u=-dx*sa+dy*ca,au=Math.abs(u),at=Math.abs(t);
if(at<=10&&au<=3.3)ch=au>2.3?'k':(u<-1?'w':u>1?'Y':'y');
const e1=Math.hypot(t-8.5,u),e2=Math.hypot(t+8.5,u);
if(e1<4.3||e2<4.3){const e=Math.min(e1,e2);ch=e<3.1?(e<1.6?'w':'y'):'k'}
if(r<3.6)ch=r>2.6?'k':(lit>0?'W':'s')}
s+=ch}rows.push(s)}return rows}
const HF=[];for(let i=0;i<12;i++)HF.push(fromMap(handleRows(i*Math.PI/12)));
/* ---- 設定(保存) ---- */
const KEY='pachi2ui';let rm=false;try{rm=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){}
const S={bgm:70,se:70,fl:rm?0:2,mute:0};
try{const j=JSON.parse(localStorage.getItem(KEY)||'null');if(j){['bgm','se','fl','mute'].forEach(k=>{if(typeof j[k]=='number'&&isFinite(j[k]))S[k]=j[k]});S.loaded=1}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify({bgm:S.bgm,se:S.se,fl:S.fl,mute:S.mute}))}catch(e){}}
return {PAL,SYM,ICN,fromMap,mkc,drawReel,reel,glint,icons,putIcon,ICNC,HF,handleRows,S,save,rm,mute:null,cur,get GL(){return GL}}})();
/* 公開: リール表示 (50-slot.js から呼ぶ)。digit=0..9, spinning=true で縦スクロール(ph=回転位相) */
function reelShow(i,digit,spinning,ph){try{UX.reel(i,digit,!!spinning,ph)}catch(e){}}
for(let i=0;i<3;i++)reelShow(i,7,0);
