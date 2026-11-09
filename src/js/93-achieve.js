/* ---------- feature 93: 実績/ミッション ----------
   達成でゴールド報酬+トースト。統計 X.st は pachi2x に保存。既存の bigHit/kill はラップして数える(元ファイル無編集)。 */
const sbg=()=>typeof SB!=='undefined'?SB.g():1;
if(typeof bigHit==='function'){const o=bigHit;bigHit=function(jp){X.st.hit++;if(jp)X.st.jp++;return o.apply(this,arguments)}}
if(typeof kill==='function'){const o=kill;kill=function(){const b=isBoss();const r=o.apply(this,arguments);if(b)X.st.boss++;return r}}
/* [id, 名前, 条件の説明, 報酬ティア(1〜5), 達成判定, 進捗(現在値,目標)] */
const AC_=[
['c30','30コンボ','コンボ30',1,()=>X.st.cmb>=30,[()=>X.st.cmb,30]],
['c100','100コンボ','コンボ100',2,()=>X.st.cmb>=100,[()=>X.st.cmb,100]],
['s10','ステージ10','STAGE 10到達',1,()=>X.best>=10,[()=>X.best,10]],
['s25','ステージ25','STAGE 25到達',2,()=>X.best>=25,[()=>X.best,25]],
['s50','ステージ50','STAGE 50到達',3,()=>X.best>=50,[()=>X.best,50]],
['s100','ステージ100','STAGE 100到達',5,()=>X.best>=100,[()=>X.best,100]],
['h10','大当たり10回','大当たり累計10',1,()=>X.st.hit>=10,[()=>X.st.hit,10]],
['h50','大当たり50回','大当たり累計50',2,()=>X.st.hit>=50,[()=>X.st.hit,50]],
['h200','大当たり200回','大当たり累計200',4,()=>X.st.hit>=200,[()=>X.st.hit,200]],
['jp1','JACKPOT初達成','777で大当たり',2,()=>X.st.jp>=1,[()=>X.st.jp,1]],
['jp10','JACKPOT10回','777累計10',4,()=>X.st.jp>=10,[()=>X.st.jp,10]],
['r50','ルーレット50倍','x50を引く',3,()=>X.st.r50>=1,[()=>X.st.r50,1]],
['rc5','5連チャン','RUSH中に5連',2,()=>X.st.rc>=5,[()=>X.st.rc,5]],
['rc10','10連チャン','RUSH中に10連',3,()=>X.st.rc>=10,[()=>X.st.rc,10]],
['b10','ボスハンター','ボス10体撃破',2,()=>X.st.boss>=10,[()=>X.st.boss,10]],
['b50','ボスキラー','ボス50体撃破',4,()=>X.st.boss>=50,[()=>X.st.boss,50]],
['mg1','ミニゲーム初挑戦','ミニゲームを遊ぶ',1,()=>X.st.mg>=1,[()=>X.st.mg,1]],
['mg10','ミニゲーム常連','ミニゲーム10回',2,()=>X.st.mg>=10,[()=>X.st.mg,10]],
['mgp','ミニゲーム大成功','最高評価を出す',3,()=>X.st.mgp>=1,[()=>X.st.mgp,1]],
['pr1','はじめての転生','転生する',3,()=>X.pres>=1,[()=>X.pres,1]],
['pr5','転生マスター','転生5回',5,()=>X.pres>=5,[()=>X.pres,5]]];
/* 報酬: 直近の収入(平均 X.gps)の15秒分×ティア。実測が無ければステージ基準 */
function achReward(tier){const b=Math.max(X.gps*15,G.stage*30*mul(),20);return Math.floor(b*tier*sbg())}
let achT=0;
function achCheck(){let n=0;for(const a of AC_){if(X.ach[a[0]])continue;let c=false;try{c=a[4]()}catch(e){}if(c){X.ach[a[0]]=1;n++;const g=addGold(achReward(a[3]));fxToast('実績達成! '+a[1]+'  +G'+fmt(g));beep(1200,.12,'square',.05);if(AC)setTimeout(()=>beep(1600,.2,'square',.05),110)}}if(n)saveX();return n}
FU.push(dt=>{
  if(cmb>X.st.cmb)X.st.cmb=cmb;if(G.combo>X.st.rc)X.st.rc=G.combo;
  if(RL&&RL.ph==1&&RL.m==50&&!RL.cnt){RL.cnt=1;X.st.r50++}
  achT-=dt;if(achT<=0){achT=.5;achCheck()}});
FM.push({n:'実績',r:()=>{const d=AC_.filter(a=>X.ach[a[0]]).length;return '<div class="fxh">実績 '+d+'/'+AC_.length+'</div><div class="fxl">'+AC_.map(a=>{const e=!!X.ach[a[0]],p=a[5];return '<div class="'+(e?'ok':'no')+'"><span class="nob">'+(e?'★ ':'◆ ')+a[1]+'<br><small>'+a[2]+(e?'':' ('+Math.min(p[0](),p[1])+'/'+p[1]+')')+'</small></span><span>'+resAmt('gold',fmt(achReward(a[3])))+'</span></div>'}).join('')+'</div>'}});
