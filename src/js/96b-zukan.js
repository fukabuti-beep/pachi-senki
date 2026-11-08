/* ---------- モンスター図鑑 (feature) ----------
   敵14種(雑魚10/ボス4)の撃破数を記録。撃破数が節目に届くと★(最大3)。★1つにつき与ダメージ+1%(永続・転生で残る)。
   セーブ: localStorage['pachi2_zukan'] = {key:撃破数}。キーは enSpr(stage)(m0〜m9 / b0〜b3)。
   ★が増えた時はトースト+小さな演出。メニューに「図鑑」タブ(未発見は ???)。 */
const ZKN={m0:'ぷるスライム',m1:'闇コウモリ',m2:'さまよう霊',m3:'石ゴーレム',m4:'毒キノコ',m5:'火の玉',m6:'ツノガエル',m7:'電撃クラゲ',m8:'ギョロ目',m9:'鉄の番兵',b0:BOSSN[0],b1:BOSSN[1],b2:BOSSN[2],b3:BOSSN[3]};
const ZKK=Object.keys(ZKN),ZKT={m:[10,100,1000],b:[1,10,50]};
let ZK={};
try{const j=JSON.parse(localStorage.getItem('pachi2_zukan')||'null');if(j&&typeof j=='object')ZKK.forEach(k=>{const v=Math.floor(+j[k]);if(Number.isFinite(v)&&v>0)ZK[k]=Math.min(v,1e9)})}catch(e){}
let ZKD=0;function zkSave(){try{localStorage.setItem('pachi2_zukan',JSON.stringify(ZK))}catch(e){}}
const zkStar=k=>{const n=ZK[k]||0,th=ZKT[k[0]];return n>=th[2]?3:n>=th[1]?2:n>=th[0]?1:0};
const zkStars=()=>ZKK.reduce((a,k)=>a+zkStar(k),0);
const zkBonus=()=>.01*zkStars();
{const oa=SB.a;SB.a=()=>oa()*(1+zkBonus())}
{const o=kill;kill=function(){let key=null;try{key=enSpr(G.stage)}catch(e){}const r=o.apply(this,arguments);try{if(key&&ZKN[key]){const s0=zkStar(key);ZK[key]=(ZK[key]||0)+1;ZKD++;const s1=zkStar(key);
    if(s1>s0){fxToast('図鑑 '+ZKN[key]+' '+'★'.repeat(s1)+'  ダメージ+1%','#ffd400');try{if(sOK()){const t=sNow();[1047,1319,1568].forEach((f,i)=>tone(f,t+i*.07,.1,'square',.03))}}catch(e){}zkSave()}
    else if(ZKD>=10){ZKD=0;zkSave()}}}catch(e){}return r}}
addEventListener('pagehide',()=>{try{zkSave()}catch(e){}});
FM.push({n:'図鑑',r:()=>{const found=ZKK.filter(k=>ZK[k]).length;return '<div class="fxh">モンスター図鑑 '+found+'/'+ZKK.length+'</div><div class="fxs">倒した数で★が増える(雑魚 10/100/1000体・ボス 1/10/50体)。★1つでダメージ+1%(今 +'+Math.round(zkBonus()*100)+'%)。転生しても残る。</div><div class="fxl">'+
  ZKK.map(k=>{const n=ZK[k]||0,s=zkStar(k),th=ZKT[k[0]],nx=s<3?th[s]:0;return '<div class="'+(n?'ok':'no')+'"><span>'+(n?ZKN[k]:'???')+(k[0]=='b'?' <small>BOSS</small>':'')+'</span><span>'+(n?'<b style="color:#ffd400">'+'★'.repeat(s)+'</b>'+'☆'.repeat(3-s)+' '+fmt(n)+'体'+(nx?' (次 '+fmt(nx)+')':''):'未発見')+'</span></div>'}).join('')+'</div>'}});
