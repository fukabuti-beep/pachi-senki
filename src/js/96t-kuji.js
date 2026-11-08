/* ---------- 魔石くじ (feature) ----------
   ゲーム内の魔石だけで引ける宝箱(現実のお金は一切使わない。有料ガチャではない)。1回 魔石100 / 10連 魔石1000。
   中身(確率): ゴールド 48% / 魔石2倍返し 20% / 宝石1 15% / 宝石3 5% / 金運の護符1分 8% / 武器Lv+1(ランダムなキャラ) 4%
   結果は宝箱が開く演出つきのダイアログで表示。確率はメニューに明記する。 */
const KUJI=[[.48,'gold','ゴールド'],[.20,'ms','魔石2倍返し'],[.15,'gem1','宝石 1'],[.05,'gem3','宝石 3'],[.08,'buff','金運の護符 1分'],[.04,'wpn','武器 Lv+1']];
const KJC=100;let KJIMG='';
function kujiRoll(){let r=Math.random(),i=0;while(i<KUJI.length-1&&r>=KUJI[i][0]){r-=KUJI[i][0];i++}const k=KUJI[i][1];let s='';
  if(k=='gold'){const g=Math.floor(G.stage*150*mul()*(.6+Math.random()*.8));G.gold+=g;s='ゴールド +'+fmt(g)}
  else if(k=='ms'){RES.ms+=KJC*2;s='魔石 +'+(KJC*2)}
  else if(k=='gem1'){RES.gem+=1;s='宝石 +1'}
  else if(k=='gem3'){RES.gem+=3;s='宝石 +3'}
  else if(k=='buff'){RES.bg+=60;s='金運の護符 +1分'}
  else{const h=Math.floor(Math.random()*3);RES.w[h]=(RES.w[h]||0)+1;s=WPN[h][1]+'の'+WPN[h][0]+' Lv'+RES.w[h]+'!'}
  return {k,s,rare:k=='gem3'||k=='wpn'}}
function kujiDraw(n){n=n===10?10:1;const c=KJC*n;if(typeof RES==='undefined')return;if(RES.ms<c){fxToast('魔石が足りない(あと '+fmt(c-RES.ms)+')','#aaa');return}
  RES.ms-=c;const rs=[];for(let i=0;i<n;i++)rs.push(kujiRoll());resSave();const rare=rs.some(r=>r.rare);
  try{if(sOK()){const t=sNow();[523,659,784,1047,1319].forEach((f,i)=>tone(f,t+i*.06,.1,'square',.03));if(rare)setTimeout(()=>{try{kyuin(6,'#ffd400')}catch(e){}},300)}}catch(e){}
  let img='';try{if(!KJIMG&&SPR.fchest2&&SPR.fchest2.toDataURL)KJIMG=SPR.fchest2.toDataURL();img=KJIMG||''}catch(e){}
  const chest='<div style="margin:4px auto 6px;width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,#fff6b0 0,#ffd400 30%,transparent 68%);'+(rare?'animation:pkhue 1s linear infinite;':'')+'">'+(img?'<img src="'+img+'" style="width:64px;height:64px;image-rendering:pixelated" alt="">':'')+'</div>';
  fxShow('<div class="fxh">'+(rare?'大当たり!!':'魔石くじ')+'</div>'+chest+'<div class="fxl">'+rs.map(r=>'<div class="'+(r.rare?'ok':'')+'"><span>'+(r.rare?'★ ':'')+r.s+'</span></div>').join('')+'</div>',
    [['もう一度('+n+'回)',()=>kujiDraw(n)],['閉じる',null,'g']]);if(rare)banner('くじ大当たり!!','#ffd400')}
FM.push({n:'くじ',r:()=>'<div class="fxh">魔石くじ</div><div class="fxs">魔石で宝箱を開けるくじ。ゲーム内の魔石だけで遊べます(お金は使いません)。</div><div class="fxn" style="font-size:20px"><span style="color:#c8a0ff">魔石 '+fmt(typeof RES!=='undefined'?RES.ms:0)+'</span></div>'+
  '<button class="fxb" onclick="kujiDraw(1)">1回 魔石'+KJC+'</button> <button class="fxb" onclick="kujiDraw(10)">10連 魔石'+KJC*10+'</button>'+
  '<div class="fxl" style="margin-top:10px">'+KUJI.map(k=>'<div><span>'+k[2]+'</span><span>'+Math.round(k[0]*100)+'%</span></div>').join('')+'</div>'});
