/* ---------- 遺物コレクション (feature) ----------
   ボス撃破で遺物がドロップ(初回は確定、以降35%)。同じ遺物は Lv アップ(最大5)。転生しても残る永続ボーナス。
   セーブ: localStorage['pachi2_relic'] = {id:lv}。効果は SB.a/SB.g(94-prestige)と spAdd/bigHit のラップ、UPX(23) の RLB() で反映。
   ミニゲーム表示中はドロップ演出を待たせ、終わってから戦闘画面に出す。 */
const RLD=[
 {id:'ken',n:'剛剣の欠片',ch:'剣',c:'#ff5a5a',k:'dmg',v:.08,d:'ダメージ+8%'},
 {id:'hai',n:'黄金の杯',ch:'杯',c:'#ffd400',k:'gold',v:.08,d:'ゴールド+8%'},
 {id:'hane',n:'疾風の羽',ch:'羽',c:'#7ff3ff',k:'tap',v:.2,d:'タップ威力+20%'},
 {id:'chizu',n:'宝探しの地図',ch:'図',c:'#d19a4a',k:'trs',v:.1,d:'お宝出現+10%'},
 {id:'suzu',n:'幸運の鈴',ch:'鈴',c:'#ff9a1f',k:'ev',v:.01,d:'押せ!!発生+1%'},
 {id:'tama',n:'虹の宝珠',ch:'虹',c:'#ff7ac0',k:'sup',v:.02,d:'超倍率チャンス+2%'},
 {id:'suna',n:'時の砂',ch:'砂',c:'#e4d4a0',k:'rush',v:.2,d:'大当たり時RUSH+0.2秒'},
 {id:'hachi',n:'闘魂の鉢巻',ch:'魂',c:'#ff3355',k:'sp',v:.05,d:'SP獲得+5%'},
 {id:'uroko',n:'竜の鱗',ch:'鱗',c:'#43e060',k:'boss',v:.15,d:'ボスへのダメージ+15%'},
 {id:'kan',n:'祝福の冠',ch:'冠',c:'#a066ff',k:'all',v:.03,d:'ダメージ/ゴールド+3%'}];
const RLMAX=5;let RLV={};
try{const j=JSON.parse(localStorage.getItem('pachi2_relic')||'null');if(j&&typeof j=='object')RLD.forEach(r=>{const v=Math.floor(+j[r.id]);if(Number.isFinite(v)&&v>0)RLV[r.id]=Math.min(RLMAX,v)})}catch(e){}
function relicSave(){try{localStorage.setItem('pachi2_relic',JSON.stringify(RLV))}catch(e){}}
function relicBonus(k){let s=0;for(const r of RLD){const lv=RLV[r.id]||0;if(!lv)continue;if(r.k===k||(r.k==='all'&&(k==='dmg'||k==='gold')))s+=r.v*lv}return s}
const relicCount=()=>RLD.filter(r=>RLV[r.id]).length;
// 効果の反映
{const oa=SB.a,og=SB.g;SB.a=()=>oa()*(1+relicBonus('dmg'))*(isBoss()?1+relicBonus('boss'):1);SB.g=()=>og()*(1+relicBonus('gold'))}
{const o=spAdd;spAdd=function(x){return o.call(this,x*(1+relicBonus('sp')))}}
{const o=bigHit;bigHit=function(){const r=o.apply(this,arguments);try{const b=relicBonus('rush');if(b>0)G.rush=Math.min(15,G.rush+b)}catch(e){}return r}}
// ドロップ
const RDR={q:null,show:null};
function relicRoll(force){const cand=RLD.filter(r=>(RLV[r.id]||0)<RLMAX);if(!cand.length)return null;const r=cand[Math.floor(Math.random()*cand.length)];const nw=!RLV[r.id];RLV[r.id]=(RLV[r.id]||0)+1;relicSave();return {r,lv:RLV[r.id],nw}}
{const _k=kill;kill=function(){const wb=isBoss();const res=_k.apply(this,arguments);try{if(wb&&run&&(relicCount()===0||Math.random()<(typeof relicDropP==='function'?relicDropP():.35))){const d=relicRoll();if(d){d.ready=T+1.8;RDR.q=d}}}catch(e){}return res}}
function relicUpd(){const q=RDR.q;if(q&&T>=q.ready&&!MG&&!(typeof MG2!=='undefined'&&MG2)&&!cut){RDR.q=null;RDR.show={t0:T,...q};
  banner(q.nw?'遺物ゲット!!':'遺物 Lv UP!!',q.r.c);kyuin(6,q.r.c);try{if(sOK()){const t=sNow();[784,988,1175,1568,1976].forEach((f,i)=>tone(f,t+i*.07,.14,'square',.035))}}catch(e){}}
  if(RDR.show&&T-RDR.show.t0>3.2)RDR.show=null}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{relicUpd()}catch(e){RDR.q=null;RDR.show=null}return r}}
// 描画: 宝石(ドット)+名前+効果
function relicGem(c,x,y,s,col){const P=['...kkk...','..kwwck..','.kwwcccC.','kwccccCCk','kcccccCCk','.kcccCCk.','..kcCCk..','...kCk...','....k....'];
  for(let j=0;j<9;j++)for(let i=0;i<9;i++){const ch=P[j][i];if(ch=='.')continue;c.fillStyle=ch=='k'?'#14101f':ch=='w'?'#fff':ch=='c'?col:'rgba(0,0,0,.35)';c.fillRect(x+i*s,y+j*s,s,s);if(ch=='C'){c.fillStyle=col;c.globalAlpha=.6;c.fillRect(x+i*s,y+j*s,s,s);c.globalAlpha=1}}}
function relicDraw(t){const S=RDR.show;if(!S)return;const p=t-S.t0,a=Math.min(1,p*5,(3.2-p)*3);if(a<=0)return;
  bc.save();bc.globalAlpha=a;bc.fillStyle='rgba(8,4,24,.88)';bc.fillRect(0,20,360,110);
  bc.save();bc.translate(70,75);bc.rotate(p*1.4);for(let k=0;k<12;k++){bc.rotate(TAU/12);bc.fillStyle='hsla('+Math.floor(t*120+k*30)%360+',100%,60%,.3)';bc.beginPath();bc.moveTo(0,0);bc.lineTo(80,-10);bc.lineTo(80,10);bc.closePath();bc.fill()}bc.restore();
  const s=p<.2?7-p/.2*2:5,gx=70-s*4.5,gy=75-s*4.5+Math.sin(t*3)*2;relicGem(bc,gx,gy,s,S.r.c);
  bc.textAlign='center';thickTxt(bc,S.r.ch,70,82+Math.sin(t*3)*2,16,'#fff');
  bc.textAlign='left';thickTxt(bc,S.nw?'NEW!':'Lv '+S.lv,135,44,12,S.nw?'#ffd400':'#7ff3ff');
  thickTxt(bc,S.r.n,135,74,20,S.r.c);thickTxt(bc,S.r.d+(S.lv>1?' ×'+S.lv:''),135,100,12,'#fff');
  thickTxt(bc,'遺物 '+relicCount()+'/'+RLD.length,135,120,10,'#9aa0c8');bc.restore()}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{relicDraw(t)}catch(e){RDR.show=null}return r}}
// メニュー
FM.push({n:'遺物',r:()=>'<div class="fxh">遺物 '+relicCount()+'/'+RLD.length+'</div><div class="fxs">ボスを倒すと手に入る(初回は必ず・以降 '+Math.round((typeof relicDropP==='function'?relicDropP():.35)*100)+'%)<br>同じ遺物で Lv アップ(最大 '+RLMAX+')。転生しても残る</div><div class="fxl">'+
  RLD.map(r=>{const lv=RLV[r.id]||0;return '<div class="'+(lv?'ok':'no')+'"><span>'+(lv?'<b style="color:'+r.c+'">['+r.ch+']</b> '+r.n:'??? ')+'</span><span>'+(lv?r.d+' Lv'+lv+(lv>=RLMAX?' MAX':''):'未発見')+'</span></div>'}).join('')+'</div>'});
