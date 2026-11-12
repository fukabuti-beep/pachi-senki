// @full  (完全版だけ。体験版のビルドには入らない)
// FULL_FEAT: 4人目の英雄 ツララ
/* ---------- 4人目の英雄 槍使いツララ + 完全版の衣装 (feature, 完全版) ----------
   設定は docs/STORY.md。氷原の主(STAGE 75)を倒すと、氷の中で100年眠っていた槍使いツララが仲間になる(X.best>75。転生しても残る)。
   ・役割(docs/DESIGN.md: 役割のちがう仲間): 「装甲つらぬき」= STAGE 30 からのボスの装甲(94c の hvBossK)を無視して刺す。雑魚には普通、ボス戦で頼りになる。
   ・後衛なので敵に狙われない(英雄の体力 HV の3人分の配列には入れない)。1.4秒ごとに突き。会心あり。
   ・強化「槍術」(ゴールド、上限なし、+20%/Lv、転生でリセット)。強化画面「英雄」に4枚目のカード。魂の祭壇の自動強化でも買う。
   ・物語: 加入シーン j4、以降のシーンに一言ずつ足す(98s の SCN に追記)。顔は SPR(h3)。
   ・ラップ: drawHeroes(英雄のすぐ後ろに描く)だけ。転生は PGEN の変化で検知。Math.random は加入後だけ使う。
   セーブ: localStorage['pachi2_lancer'] = {lv}。 */
STH.push({n:'ツララ',r:'槍使い',c:'#8fd8ff'});
/* ===== 英雄3: 槍使いツララ ===== */
mkH2(3,'D#2a5a9a,E#9a5038,F#5a7aa8,K#141c50,L#241a3a,M#4a5a80,N#8a5a00,k#14101f,h#8fd8ff,H#5aa8e0,i#d8f4ff,s#ffd2a6,S#e0957a,e#14101f,w#ffffff,u#4a80d0,a#e8f4ff,b#9ab8d8,t#3a5a9a,T#27407a,o#4a3a6a,l#f4fbff,m#b0c4d8,g#ffd24d',
["................................",
 "..........kkkkkkkk..............",
 "........kkhhhhhhhhkk............",
 ".......khhhhhhhhhhhhk...........",
 "......khhiiiiihhhhhhhk..........",
 ".....khhiiiiiiihhhhhHHk.........",
 ".....khhhhhhhhhhhhhhHHk.........",
 "....khhhhhhhhhhhhhhhHHHk........",
 "....khhhhhhhhhhhhhhhHHHk........",
 "....khhhhhshhhhhhshhhhHk........",
 "....khhhhssshhhhssshhHHk........",
 "....khhhSSSssSSSSsSShHHk........",
 "....khhsssssssssssssshHk........",
 "....khhskkkksssskkkkshHk........",
 "....khhssuuessssuuesshHk........",
 "....khHssssssssSssssShHk........",
 "....khHssssssssssssSShHk........",
 "....khHHsssskkksssSSHhHk........",
 "....khHHkssssssssSkHHhHk........",
 "....khHkakkssssskkakHhHk........",
 "....khHkaaaakkkkaaakHHk.........",
 "...kkhkaaaaaaggaaaabkHkk........",
 "..kaakkaaaaaaaaaabbbkkaak.......",
 "..kaabkbaaaaaaaaabbbkbaak.......",
 "..ksskkaabaaaaaabbabkkssk.......",
 "..ksskkbbbbbbbbbbbbbkkssk.......",
 "...kk.kkttttkkkttttkk.kk........",
 "......kHkttTtkktTttkHk..........",
 "......kk.kttTk.kTttk.kk.........",
 ".........kttk...kttk............",
 "........kooook.kooook...........",
 "........kkkkkk.kkkkkk..........."],
[[[26,0,".l"],[26,1,"klk"],[26,2,"klk"],[25,3,"klllk"],[25,4,"klmlk"],[25,5,".kmk"],[25,6,".kgk"],[25,7,".kmk"],[25,8,".kmk"],[25,9,".kmk"],[25,10,".kmk"],[25,11,".kmk"],[25,12,".kmk"],[25,13,".kmk"],[25,14,".kmk"],[25,15,".kmk"],[25,16,".kmk"],[25,17,".kmk"],[25,18,".kmk"],[25,19,".kmk"],[25,20,".kmk"],[25,21,".kmk"],[25,22,".kmk"],[25,23,".kmk"],[24,24,"ksskk"],[24,25,"ksskk"],[25,26,".kmk"],[25,27,".kmk"],[25,28,".kmk"],[25,29,".kk"]],[[14,23,"kkkkkkkkkkkkkkkk"],[13,24,"kmmmksskmmmmgklllk"],[14,25,"kkkkksskkkkkkklk"],[29,23,"kk"],[29,25,"kk"]],[[16,23,"kkkkkkkkkkkkkkkk"],[15,24,"kmksskmmmmmgkllll"],[16,25,"kkksskkkkkkkklll"],[29,22,"ll"],[29,26,"ll"]]],
[["D","hHi"],["E","sS"],["F","ab"],["K","tT"],["L","o"],["M","lm"],["N","g"]]);
const LN={lv:1,at:.7,h:-9,gen:0,ann:0};
try{const v=Math.floor(+(JSON.parse(localStorage.getItem('pachi2_lancer')||'{}').lv));if(Number.isFinite(v)&&v>=1)LN.lv=Math.min(v,1e6)}catch(e){}
function lnSave(){try{localStorage.setItem('pachi2_lancer',JSON.stringify({lv:LN.lv}))}catch(e){}}
const LNST=75,LNEV=1.4;
const lnOn=()=>X.best>LNST;
const lnMul=()=>1+.2*(LN.lv-1);
const lnCost=()=>Math.floor(50*BAL.costk*Math.pow(BAL.costg,LN.lv-1));
function lnBuy(){if(!lnOn())return false;const c=lnCost();if(!(G.gold>=c))return false;G.gold-=c;LN.lv++;lnSave();try{beep(1000,.1,'triangle');refresh()}catch(e){}return true}
function lnTap(){if(!lnBuy())fxToast('ゴールドが足りない','#aaa');try{grpRefresh()}catch(e){}}
/* 突き: ボスの装甲を無視(hurt が ÷k するので、先に ×k しておく)。塔では装甲が無いのでそのまま */
function lnHit(){LN.h=T;let d=atk()*1.5*cm()*lnMul();
  try{if(isBoss()&&!(typeof TW!=='undefined'&&TW.on))d*=hvBossK(G.stage)}catch(e){}
  const cr=Math.random()<critP();hurt(d,'#8fd8ff',0,cr);if(cr&&Math.random()<.2)lnSay('crit');try{if(typeof sOK==='function'&&sOK()){const t=sNow();tone(1320,t,.04,'square',.02,880)}}catch(e){}}
FU.push(dt=>{if(!run)return;
  if(LN.gen!==PGEN){LN.gen=PGEN;if(LN.lv>1){LN.lv=1;lnSave()}}   // 転生(PGEN が進む)で槍術もリセット(通常強化と同じ)
  if(!lnOn())return;
  if(!LN.ann){LN.ann=1;if(!TS.s.j4){if(styQueue('j4')){const i=STY.q.indexOf('j4'),b=STY.q.indexOf('b2');STY.q.splice(i,1);STY.q.splice(b>=0?b+1:0,0,'j4')}try{fxToast('4人目の英雄 ツララ が仲間に!','#8fd8ff');banner('槍使い ツララ','#8fd8ff');fan()}catch(e){}}}
  if(LN.st!==G.stage){const up=LN.st!=null&&G.stage>LN.st,wasB=LN.st%5===0;LN.st=G.stage;if(up&&wasB)lnSay('win');else if(up&&isBoss())lnSay('boss')}
  if(cut||RL||(typeof HV!=='undefined'&&HV.wipe>0))return;
  LN.at-=dt*(G.rush>0?2:1);if(LN.at<=0){LN.at=LNEV;lnHit()}
  if(typeof soulLv==='function'&&soulLv('auto')&&SOUL.auto){LN.bt=(LN.bt||0)-dt;if(LN.bt<=0){LN.bt=3;if(G.gold>=lnCost()*4)lnBuy()}}});
/* 描画: 3人のすぐ右うしろ。突く時は前へ出る */
{const _dh=drawHeroes;drawHeroes=function(t){const r=_dh.apply(this,arguments);try{if(lnOn())lnDraw(t)}catch(e){}return r}}
function lnDraw(t){const d=t-LN.h,at=d>=0&&d<.26,lg=at?Math.round(Math.sin(d/.26*Math.PI)*26):0,x=hx(3)-8+lg,y=52+(at?0:Math.round(Math.sin(t*3+3)*1.2)),n='h3'+(at?(d<.13?'s':'w'):(Math.floor(t*2.6+2.1)%2?'b':''));
  bc.fillStyle='rgba(0,0,0,.4)';bc.fillRect(hx(3)+2,114,40,4);
  if(at){bc.globalAlpha=.3;bc.drawImage(SPR[n],x-Math.round(lg*.5),y,64,64);bc.globalAlpha=1}
  bc.drawImage(SPR[n],x,y,64,64);
  if(d>=0&&d<.14){const q=d/.14;bc.globalAlpha=1-q;bc.fillStyle='#fff';bc.fillRect(x+58,y+34,Math.round(30+q*30),2);bc.fillStyle='#8fd8ff';bc.fillRect(x+58,y+37,Math.round(20+q*24),1);bc.globalAlpha=1}}
/* カットインと吹き出し(docs/STORY.md の口調: マイペースで眠たがり)。大当たりのカットインは 加入後 4回に1回くらいツララ。
   絵は src/img/hero3.webp があればそれ(build.js が PIMG に入れる)、無ければ 83b のコード描画 PORT(3)、それも無ければドット絵 */
CUTL[3]=['つらぬくよー','ねむいけど…本気','氷槍、いくよー'];
{const _c=cutin;cutin=function(h,txt,c,cb){try{if(lnOn()&&/大当たり/.test(String(txt))&&Math.random()<.25)h=3}catch(e){}return _c.call(this,h,txt,c,cb)}}
const LNSAY={hit:['やったねー','当たったー','いい感じー'],crit:['そこだよー','つらぬくー','えいっ'],boss:['大きいねー','おきたー…やるよー'],win:['おつかれー','ふあ…勝ったー','ねていい?']};
function lnSay(k){try{if(typeof chSay==='function'){const a=LNSAY[k];chSay(3,a[Math.floor(Math.random()*a.length)],1.6)}}catch(e){}}
/* 強化画面「英雄」: 4枚目のカード(衣装の見出しの前に差し込む) */
function lnCard(){const c=lnCost(),ok=G.gold>=c,f=(typeof hupFace==='function')?hupFace(3):'';
  if(!lnOn())return '<div class="hupc" style="--hc:#8fd8ff"><div class="huph"><b>??? 4人目の英雄</b></div><div class="lnj">氷原の主(STAGE '+LNST+')を倒すと 仲間になる</div></div>';
  return '<div class="hupc" style="--hc:#8fd8ff"><div class="huph">'+(f?'<img class="hupf" src="'+f+'" alt="">':'')+'<b>槍使い ツララ</b><span class="hupv">槍の威力 x'+lnMul().toFixed(1)+'</span></div>'+
    '<div class="lnj">後衛なので狙われない。ボスの装甲を つらぬいて刺す('+LNEV+'秒ごと)</div><div class="hupr ln1">'+
    '<button type="button" class="hupb'+(ok?' ok':'')+'" onclick="lnTap()"><span class="hupn">槍術 <small>Lv'+LN.lv+'</small></span><span class="hupd">槍の威力 +20%</span><span class="hupp">'+(typeof resIcon==='function'?resIcon('gold'):'G')+fmt(c)+'</span></button></div></div>'}
try{const e=UPG.list.find(x=>x[0]==='英雄');if(e){const o=e[1];e[1]=()=>{const h=o(),k=h.indexOf('<!--sk-->');return k>=0?h.slice(0,k)+lnCard()+h.slice(k):h+lnCard()}}}catch(e){}
/* 物語(docs/STORY.md) */
SCN.push({id:'j4',t:'氷の中の槍使い',h:'STAGE 75 のあと',L:[
  [9,'溶けた氷の中から、槍を抱いた人影が ゆっくり起き上がった'],
  [3,'ふあ…よく寝たー。…あれ、いま何年?'],
  [1,'氷晶巨人の呪いで眠らされていたのね。100年は たっているわよ'],
  [3,'100年かー。寝すぎたなー。お礼に、ウチの槍 貸したげるよー'],
  [0,'おう、頼もしいぜ! …って、立ったまま寝るな!']]});
{const add=(id,l)=>{const s=scnOf(id);if(s)s.L.push(l)};
  add('a3',[3,'あついー…氷の中のほうが 涼しかったなー']);
  add('a5',[3,'雲の上は お昼寝に よさそうだねー']);
  add('a6',[3,'星がきれいだねー。…ちょっと ねむくなってきた']);
  add('f1',[3,'いい光だねー。…ウチ、今度は 寝すごさないよー'])}
/* 衣装: ツララと、完全版だけの3人の衣装(エンディングを見ると「光の衣」) */
const lnEnd=()=>[(typeof END!=='undefined'?END.n:0)>0?1:0,1];
skAdd(3,[{id:'sakura',n:'春の槍使い',gem:SKGEM,m:{'#8fd8ff':'#ffb0d0','#5aa8e0':'#e07aa8','#e8f4ff':'#fff0f6','#9ab8d8':'#e0a8c0'}},
         {id:'tower',n:'塔の覇者',lb:'無限の塔 50階',pr:()=>[(typeof TW!=='undefined'?TW.best:0),50],m:{'#8fd8ff':'#b48cff','#5aa8e0':'#7a5cd0','#e8f4ff':'#2a2040','#9ab8d8':'#14102e'}}]);
skAdd(0,[{id:'light',n:'光の衣',lb:'エンディングを見る',pr:lnEnd,m:{'#d5dae6':'#fff6c0','#7c859b':'#e0c060','#d1303c':'#fff','#3556d6':'#ffe9a0','#22338f':'#d0b050'}}]);
skAdd(1,[{id:'light',n:'光の衣',lb:'エンディングを見る',pr:lnEnd,m:{'#5b6cff':'#fff6c0','#3a45b8':'#e0c060','#c8b8ff':'#fff'}}]);
skAdd(2,[{id:'light',n:'光の衣',lb:'エンディングを見る',pr:lnEnd,m:{'#3dd27f':'#fff6c0','#1b7a47':'#e0c060','#caffb0':'#fff'}}]);
try{if(typeof AC_!=='undefined')AC_.push(['ln1','4人目の英雄','槍使いツララが仲間になる',3,()=>lnOn(),[()=>X.best,LNST+1]])}catch(e){}
