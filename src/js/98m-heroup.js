/* ---------- 強化画面「英雄」グループ (ui) ----------
   英雄ごとの 体力/防御/回復(94c-herohp の HUP)を、強化画面のグループ「英雄」(通常強化の次)で買う。
   読み込み順: 98c(UPG)・98k(宝石屋/くじを足してタブを作り直す)より後。タブが6つになるので 3x2 に折り返す(css/41-heroup.css)。 */
const HUPN=[['剣士','ホムラ','#ff7a45'],['魔法使い','シズク','#6fe3ff'],['弓使い','コハク','#9bff6b']];
const HUPF={};   // 英雄の顔(SPR を data URL に。作れない環境では出さない)
function hupFace(i){if(i in HUPF)return HUPF[i];let u='';try{const s=SPR['h'+i];if(s&&s.toDataURL)u=s.toDataURL()}catch(e){}return HUPF[i]=u}
function hupMenu(){const ic=['hp','df','rg'];
  let h='<div class="fxs">英雄ごとに 守りを強化(ゴールド)。敵は先へ進むほど強くなる。ボス戦で 3人とも倒れると 1つ前のステージへ。体力が多いほど 攻撃も上がる(元気ボーナス)。転生でリセット。</div><div class="hupl">';
  for(let i=0;i<3;i++){const n=HUPN[i],m=hvMax(i),r=Math.max(0,Math.min(1,HV.hp[i]/m)),f=hupFace(i);
    h+='<div class="hupc" style="--hc:'+n[2]+'"><div class="huph">'+(f?'<img class="hupf" src="'+f+'" alt="">':'')+'<b>'+n[0]+' '+n[1]+'</b>'+
      '<span class="hupv">元気 +'+Math.round((hvGenki(i)-1)*100)+'% ・ 体力 '+fmt(Math.ceil(HV.hp[i]))+' / '+fmt(Math.ceil(m))+(HV.dn[i]?' <em>ダウン</em>':'')+'</span></div>'+
      '<div class="hupbar"><i style="width:'+Math.round(r*100)+'%"></i></div>'+hupSurvHtml(i)+'<div class="hupr">';
    for(let k=0;k<3;k++){const d=HUPD[k],op=hupOpen(k),l=HUP.lv[i][k],mx=l>=d[4],c=hupCost(i,k),ok=op&&!mx&&G.gold>=c;
      h+='<button type="button" class="hupb'+(ok?' ok':'')+(mx?' mx':'')+(op?'':' lk')+'" onclick="hupTap('+i+','+k+')">'+hupIcon(ic[k])+
        '<span class="hupn">'+d[0]+' <small>Lv'+l+(mx?' MAX':d[4]===Infinity?'':'/'+d[4])+'</small></span>'+
        '<span class="hupd">'+(op?d[1]:'STAGE '+d[3]+' で解放')+'</span>'+
        '<span class="hupp">'+(mx?'MAX':op?(typeof resIcon==='function'?resIcon('gold'):'G')+fmt(c):'---')+'</span></button>'}
    h+='</div></div>'}
  return h+'</div>'}
/* 次のボス戦で持ちこたえる目安(赤=すぐ倒れる → 守りを育てる合図) */
function hupSurvHtml(i){const bs=Math.max(5,Math.ceil(G.stage/5)*5),v=hvSurv(i,bs),cl=v<10?'bad':v<HVSAFE?'mid':'ok';
  return '<div class="hups '+cl+'">次のボス(STAGE '+bs+')で '+(v===Infinity||v>600?'倒れない':'約'+Math.max(1,Math.round(v))+'秒 もつ')+(v<HVSAFE?' → 守りを育てよう':'')+'</div>'}
function hupTap(i,k){if(!hupBuy(i,k)){const d=HUPD[k];if(d&&!hupOpen(k))fxToast('STAGE '+d[3]+' で解放','#aaa');else if(HUP.lv[i]&&HUP.lv[i][k]<HUPD[k][4])fxToast('ゴールドが足りない','#aaa')}try{grpRefresh()}catch(e){}}
(function(){try{
  if(!UPG.list.some(x=>x[0]==='英雄'))UPG.list.splice(1,0,['英雄',hupMenu]);
  const bar=$('upg');if(bar){bar.innerHTML=UPG.list.map((g,i)=>'<button type="button" data-g="'+i+'" class="'+(i===UPG.g?'on':'')+'">'+g[0]+'</button>').join('');
    if(bar.classList){for(let n=2;n<9;n++)bar.classList.remove('upg'+n);bar.classList.add('upg'+UPG.list.length)}}
}catch(e){}})();
/* 98i-altar の altOpen(g) は「通常強化=0/鍛冶屋=1/魂の祭壇=2」の番号で呼ばれる。グループが増えても同じ画面が開くよう、番号を名前に読み替える */
const UPG_OLD=['通常強化','鍛冶屋','魂の祭壇'];
{const _a=altOpen;altOpen=function(g){if(typeof g==='number'&&UPG_OLD[g]){const i=UPG.list.findIndex(x=>x[0]===UPG_OLD[g]);if(i>=0)g=i}return _a.call(this,g)}}
