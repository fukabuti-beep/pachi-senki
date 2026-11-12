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
mkH3(3,'D#2a5a9a,E#a85a40,F#5a7aa8,K#14143c,L#1c1a44,M#4a6a9a,N#8a5a00,k#14101f,h#8fd8ff,H#5aa8e0,i#d8f4ff,s#ffd9b0,S#e8a888,z#c87860,e#14101f,w#ffffff,u#6ab0ff,U#2a60c0,x#a03050,a#e8f4ff,b#9ab8d8,q#6aa8f0,t#3b3c8c,T#262560,o#2e2e70,l#f4fbff,m#9fd0f0,g#ffd24d',[["D","hHi"],["E","sSz"],["F","abq"],["K","tT"],["L","o"],["M","lm"],["N","g"]],
[
 "",
 "...........kkkkkkkkk",
 ".........kkiiihhhhhhkk",
 "........kiiiiihhhhhhhHk",
 ".......kiiihhhhhhhhhhhHk",
 "......khhhhhhhhhhhhhhhHHk",
 "......khhhhhhhhhhhhhhhHHk",
 ".....khhhhhhhhhhhhhhhhHHHk",
 ".....khhhhhhhhhhhhhhhhHHHk",
 ".....khhHhhhHhhhHhhhHhHHHk",
 ".....khhhzzzzzzzzzzzzhHHHk",
 ".....khhHseeessssseeeshHHk",
 ".....khhHswUUsssSswUUshHHk",
 ".....khHHswuussSSswuuSHHHk",
 ".....khHHsssssssssssSSHHHk",
 "......kHHksssxxsssSSkHHHk"],
[
 "......kHkkaaTkkkkTaakkHk",
 ".....kkkaaaaaTTTTaaaabkkk",
 "....kaaaaaaaaatTaaaaabbbk",
 "....kqqqaaaaaaaaaaaabqqqk",
 "....ktTkkqqaaaqqaabqqkktTk",
 "....kggk.kTTTgggTTTTk.kggk",
 "....kssk.kaaaaTTaaabk.kssk",
 ".....kk..kaaakTTkabbk..kk"],
[
 "..........kttTk.ktTTk",
 "..........kttTk.ktTTk",
 "..........kttTk.ktTTk",
 "..........kttTk.ktTTk",
 ".........kaaabk.kaabbk",
 ".........kooTk..kooTk",
 "........kooook.kooook",
 "........kkkkkk.kkkkkk"],
[
 "..........kttTkkktTTk",
 ".........kttTk..kktTTk",
 "........kttTk.....ktTTk",
 ".......kttTk.......ktTTk",
 "......kaabk........kaabbk",
 ".....kooTk.........kooTk",
 "....kooook........kooook",
 "....kkkkkk........kkkkkk"],
{"i":[0,0,[[27,0,".l"],[26,1,".klk"],[26,2,"klilk"],[26,3,"klilk"],[26,4,".klk"],[25,5,"gkgkgkg"],[26,6,"kgggk"],[27,7,"kgk"],[27,8,"kmk"],[27,9,"kmk"],[27,10,"kmk"],[27,11,"kmk"],[27,12,"kmk"],[27,13,"kmk"],[27,14,"kmk"],[27,15,"kmk"],[27,16,"kmk"],[27,17,"kmk"],[27,18,"kmk"],[27,19,"kmk"],[27,20,"kmk"],[27,21,"kmk"],[27,22,"kmk"],[27,23,"kmk"],[27,24,"kmk"],[27,25,"kmk"],[27,26,"kmk"],[27,27,"kmk"],[27,28,"kmk"],[27,29,"kk"]],0],"w":[-2,1,[[0,22,"kkkkkkkkkkkkkkkkkkkkkkkkkkkk"],[0,23,"mmksskmmmmmmmmmmmmmksskmmmmgk"],[0,24,"kkkkkkkkkkkkkkkkkkkkkkkkkkkk"],[27,21,"g"],[27,25,"g"],[28,22,"kkkkkk"],[28,23,"lillllk"],[28,24,"kkkkkk"]],1],"s":[3,1,[[25,21,"______"],[25,22,"______"],[25,23,"______"],[25,24,"______"],[24,21,"k"],[24,22,"k"],[24,23,"k"],[25,21,"kkkkk"],[25,22,"tttttk"],[25,23,"ggTTTk"],[25,24,"kkkkk"],[6,22,"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk"],[5,23,"kmmmksskmmmmmmmmmmmmmmmmmmksskmmmmgk"],[6,24,"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk"],[39,21,"g"],[39,25,"g"],[40,22,"kkkkkk"],[40,23,"lilllllk"],[40,24,"kkkkkk"],[46,21,"i"],[47,23,"i"],[46,25,"i"],[44,20,"i"],[44,26,"i"]],1]});
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
function lnDraw(t){const d=t-LN.h,at=d>=0&&d<.26,lg=at?Math.round(Math.sin(d/.26*Math.PI)*26):0,x=hx(3)-8+lg,y=52+(at?0:Math.round(Math.sin(t*3+3)*1.2)),n='h3'+(at?(d<.08?'w':'s'):(Math.floor(t*2.6+2.1)%2?'b':''));
  bc.fillStyle='rgba(0,0,0,.4)';bc.fillRect(hx(3)+2,114,40,4);
  if(at){bc.globalAlpha=.3;bc.drawImage(SPR[n],x-Math.round(lg*.5),y,SPR[n].width*2,64);bc.globalAlpha=1}
  bc.drawImage(SPR[n],x,y,SPR[n].width*2,64);
  if(d>=.08&&d<.22){const q=(d-.08)/.14;bc.globalAlpha=1-q;bc.fillStyle='#fff';bc.fillRect(x+94,y+46,Math.round(20+q*30),2);bc.fillStyle='#8fd8ff';bc.fillRect(x+94,y+49,Math.round(14+q*24),1);bc.globalAlpha=1}}
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
/* 春の槍使い=桜色の髪に花の髪飾り・若草色の服 / 塔の覇者=金の王冠・黒紫の外套・金の槍 / 光の衣=白と金の衣に背中の小さな羽 */
const LNART={
'3:sakura':{pal:'h#ffb0d0,H#e07aa8,i#ffe0ec,D#a04070,u#ff7ab0,U#c03a78,a#fff0f6,b#e0a8c0,F#a06080,q#7dd87a,t#3a8a4a,T#22602e,K#103018,o#2a6a3a,L#0c2a14,m#c8e8b0,l#ffe0ec,M#5a8a4a,f#7dd87a',
 head:[
  "",
  "...........kkkkkkkkk",
  ".........kkfiihhhhhhkk",
  "........wiiiiihhhhhhhHk",
  ".......wgwihhhhhhhhhhhHk",
  "......khwhfhhhhhhhhhhhHHk",
  "......khhhhhhhhhhhhhhhHHk",
  ".....khhhhhhhhhhhhhhhhHHHk",
  ".....khhhhhhhhhhhhhhhhHHHk",
  ".....khhHhhhHhhhHhhhHhHHHk",
  ".....khhhzzzzzzzzzzzzhHHHk",
  ".....khhHseeessssseeeshHHk",
  ".....khhHswUUsssSswUUshHHk",
  ".....khHHswuussSSswuuSHHHk",
  ".....khHHsssssssssssSSHHHk",
  "......kHHksssxxsssSSkHHHk"],
 body:[
  "......kHkkaaTkkkkTaakkHk",
  ".....kkkaaaaaTTTTaaaabkkk",
  "....kaaawaaaaatTaaaaabbbk",
  "....kqqwgwaaaaaaaaaabqqqk",
  "....ktTkkqqaaaqqaabqqkktTk",
  "....kggk.kTTTgggTTTTk.kggk",
  "....kssk.kaaaaTTaaabk.kssk",
  ".....kk..kaaakTTkabbk..kk"]},
'3:tower':{pal:'a#4a3c68,b#2a2040,F#100818,q#ffd24d,t#8a1c28,T#5a1020,K#2a0810,o#2a2040,L#100818,j#ff3050,u#ffd24d,U#b98300,l#ffe9a0,m#ffd24d,M#8a5a00',
 head:[
  "..........g....g....g",
  "..........gg..ggg..gg",
  ".........kggggjggjggggk",
  "........kiiiiihhhhhhhHk",
  ".......kiiihhhhhhhhhhhHk",
  "......khhhhhhhhhhhhhhhHHk",
  "......khhhhhhhhhhhhhhhHHk",
  ".....khhhhhhhhhhhhhhhhHHHk",
  ".....khhhhhhhhhhhhhhhhHHHk",
  ".....khhHhhhHhhhHhhhHhHHHk",
  ".....khhhzzzzzzzzzzzzhHHHk",
  ".....khhHseeessssseeeshHHk",
  ".....khhHswUUsssSswUUshHHk",
  ".....khHHswuussSSswuuSHHHk",
  ".....khHHsssssssssssSSHHHk",
  "......kHHksssxxsssSSkHHHk"],
 body:[
  "......kHkkaaTkkkkTaakkHk",
  ".....kkkaaaaaTTTTaaaabkkk",
  "....kaaaaaaaagjgaaaaabbbk",
  "....kqqqaaaaaaaaaaaabqqqk",
  "....ktTkkqqaaaqqaabqqkktTk",
  "....kggk.kTTTgggTTTTk.kggk",
  "....kssk.kaaaaTTaaabk.kssk",
  ".....kk..kaaakTTkabbk..kk"]},
'0:light':{pal:'a#ffffff,b#c8d4f0,c#ffffff,F#b08a30,r#ffd24d,R#e0a020,J#8a5a00,t#f4f6ff,T#b8c4e8,K#b08a30,o#ffd24d,L#8a5a00,l#ffffff,m#ffe9a0,M#b08a30,g#7ff3ff,N#1a7a9a',
 body:[
  ".mm.....kkrrrrrrrrrRkk....mm",
  "mllm..kkcakrrrrrrRRkabkk..mllm",
  "mlllmkcaabkarrrrRRakbabbk.mlllm",
  ".mllmkaabkkcaagaabbkkbabk.mllm",
  "..mm.kssk.kcaaaaabbk.kssk.mm",
  "......kk..koooggoook..kk",
  "..........krraaaabrRk",
  "..........krrkttTkRRk"]},
'1:light':{pal:'p#ffffff,P#c8d4f0,c#ffffff,G#b08a30,h#ffffff,H#c8d4f0,j#ffffff,D#b08a30,W#ffffff,o#ffd24d,L#8a5a00,q#fff6a0,Q#b08a30',
 body:[
  ".yy...kvvkPyyqyyPkvVVk....yy",
  "yWWy.kkvkpppyyypPPkVVkk...yWWy",
  "yWWWypckcpppppppPPPkVkPk..yWWWy",
  ".yWWyppkpypppppppyPkkPPk..yWWy",
  "..yykssk.kpppppPPPk.kssk..yy",
  ".....kk..kyyppppPyyk..kk",
  ".........kpppppPPPPk",
  "........kpppypppPyPPk"]},
'2:light':{pal:'h#ffffff,g#ffffff,H#c8d4f0,d#c8d4f0,c#ffffff,D#b08a30,b#ffd24d,B#e0a020,L#8a5a00,W#ffffff,u#ffd24d,U#b98300',
 body:[
  ".yy....kkhhhhkkkkhhhHHkk..yy",
  "yWWy..kgkhhhhhhhhhhHHkgdk.yWWy",
  "yWWWykggkkbgggggggddkkgdk.yWWWy",
  ".yWWykggk.kgbgggggdk.kgdk.yWWy",
  "..yy.kssk.kggbggyddk.kssk.yy",
  "......kk..kbbbbbBBBk..kk",
  "..........kgggggdddk",
  "..........kggkkkkddk"]}};
skAdd(3,[{id:'sakura',n:'春の槍使い',gem:SKGEM,art:LNART['3:sakura']},
         {id:'tower',n:'塔の覇者',lb:'無限の塔 50階',pr:()=>[(typeof TW!=='undefined'?TW.best:0),50],art:LNART['3:tower']}]);
for(let i=0;i<3;i++)skAdd(i,[{id:'light',n:'光の衣',lb:'エンディングを見る',pr:lnEnd,art:LNART[i+':light']}]);
try{if(typeof AC_!=='undefined')AC_.push(['ln1','4人目の英雄','槍使いツララが仲間になる',3,()=>lnOn(),[()=>X.best,LNST+1]])}catch(e){}
