/* ---------- pixel sprites (すべてオリジナル) ----------
   mk(名,パレット,行,full): 行は左半分(鏡像) / full=true なら全幅。SPR[名]=canvas, PXL[名]=[x,y,色]の一覧(撃破の爆散用)
   英雄: h0..h2 (待機A) +'b'(待機B) +'w'(構え) +'s'(攻撃)  32x32
   雑魚: m0..m9 16x16 / ボス: b0..b3 24x24  (敵スプライト選択は enSpr()) */
const SPR={},PXL={},SPW={};
function mk(n,pal,rows,full){const p={};pal.split(',').forEach(s=>p[s[0]]=s.slice(1));const R=rows.map(r=>full?r:r+[...r].reverse().join('')),w=R[0].length,h=R.length;const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),L=[];R.forEach((r,y)=>[...r].forEach((ch,i)=>{if(p[ch]){x.fillStyle=p[ch];x.fillRect(i,y,1,1);L.push([i,y,p[ch]])}}));SPR[n]=c;PXL[n]=L}
/* 白シルエット(被弾フラッシュ用)。初回に生成してキャッシュ */
function spw(n){if(SPW[n])return SPW[n];const s=SPR[n],c=document.createElement('canvas');c.width=s.width;c.height=s.height;const x=c.getContext('2d');x.drawImage(s,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,s.width,s.height);return SPW[n]=c}
/* 英雄: 32x32(戦闘画面では2倍=64px)。作りは docs/DESIGN.md「ドット絵の考え方」(dotartplay の32x32アクション風に学ぶ):
   頭16行・胴8行・足8行 / 目は3x4(まつ毛+白目+瞳の濃淡)/ 輪郭は黒でなく素材の暗い色(k を自動で塗り分け。目のふちだけ濃いまま)/ 光は左上 /
   攻撃は体ごと踏み込む(コマごとに 上半身の傾き lean と 足の形 を変える)。
   mkH3(i,pal,mat,head,body,legs,legsS,fr): mat=[[輪郭の文字,'素材の文字(先頭が基本色)'],…]、legsS=踏み込みの足、
     fr={i:待機,w:構え,s:攻撃} それぞれ [上半身を横にずらすpx, 足(0=legs/1=legsS), 武器などの重ね描き [x,y,文字列]…]。待機Bは頭を1px沈める。
   見た目は作り手提供のイラスト(src/img)に合わせる。HGRP[i]=色のまとまり(衣装 98n が、基本色の置きかえから影や輪郭の色も自動で作る) */
const HGRP={};
function mkH3(i,pal,mat,head,body,legs,legsS,fr){const W=32,M={},P={};pal.split(',').forEach(s=>P[s[0]]=s.slice(1));mat.forEach(m=>[...m[1]].forEach(c=>M[c]=m[0]));
  HGRP[i]=mat.map(m=>[P[m[1][0]],[P[m[0]],...[...m[1]].slice(1).map(c=>P[c])]]);
  const pad=r=>(r+'.'.repeat(W)).slice(0,W),sh=(r,dx)=>dx>=0?('.'.repeat(dx)+r).slice(0,W):r.slice(-dx)+'.'.repeat(-dx);
  const build=(f,bob)=>{let g=[...head,...body].map(r=>[...sh(pad(r),f[0])]).concat((f[1]?legsS:legs).map(r=>[...pad(r)]));
    if(bob)g=[[...'.'.repeat(W)],...g.slice(0,16),...g.slice(17)];
    f[2].forEach(q=>[...q[2]].forEach((ch,k)=>{const x=q[0]+k,y=q[1]+(bob?1:0);if(ch!='.'&&x>=0&&x<W&&g[y])g[y][x]=ch}));
    const at=(x,y)=>(g[y]&&g[y][x])||'.',out=g.map(r=>r.slice());
    for(let y=0;y<32;y++)for(let x=0;x<W;x++){if(g[y][x]!='k')continue;const n=[at(x-1,y),at(x,y-1),at(x+1,y),at(x,y+1)];if(n.some(c=>'wuUe'.includes(c)))continue;
      let c=n.filter(q=>M[q]).map(q=>M[q]);if(!c.length)c=[at(x-1,y-1),at(x+1,y-1),at(x-1,y+1),at(x+1,y+1)].filter(q=>M[q]).map(q=>M[q]);
      if(c.length)out[y][x]=c.slice().sort((a,b)=>c.filter(v=>v==b).length-c.filter(v=>v==a).length)[0]}
    return out.map(r=>r.join(''))};
  mk('h'+i,pal,build(fr.i,0),1);mk('h'+i+'b',pal,build(fr.i,1),1);mk('h'+i+'w',pal,build(fr.w,0),1);mk('h'+i+'s',pal,build(fr.s,0),1)}
/* ===== 英雄0: 剣士ホムラ ===== */
mkH3(0,'D#7a1028,E#a85a40,F#3a4466,J#701030,K#141c50,L#2a1810,M#3a4a6a,N#8a5a00,k#14101f,h#e0443a,H#a8262e,i#ff7a45,I#ffb070,s#ffd9b0,S#e8a888,z#c87860,e#14101f,w#ffffff,u#ffc020,U#d07800,x#7a1a20,a#d5dae6,b#7c859b,c#ffffff,r#d1303c,R#9c1c3c,t#3556d6,T#22338f,o#6a3d1e,g#ffd24d,l#f4fbff,m#8fb0d8',[["D","hHiI"],["E","sSz"],["F","abc"],["J","rR"],["K","tT"],["L","o"],["M","lm"],["N","g"]],
[
 "..............k",
 ".........k...kIk...k",
 "........kik.kiihk.kik",
 "....k..kiihkiihhhkkihhk..k",
 "...khkkiihhhhhhhhhhhhhhkkhk",
 "...khhiihhhhhhhhhhhhhhhhHhk",
 "....khihhhhhhhhhhhhhhhhHHk",
 "....khhhhhhhhhhhhhhhhhhHHk",
 "...khhhhHhhhhHhhhhHhhhhHHHk",
 "....khhHzhhhHzhhhHzhhhHHHk",
 "....khHzsszHzsssHzssszHHk",
 "....kHHseeessssseeeszHHk",
 ".....kHswUUsssSswUUsskk",
 ".....kkswuussSSswuusSk",
 "......ksssssssssssssSk",
 ".......kssssxxxsssSSk"],
[
 "........kkrrrrrrrrrRkk",
 "......kkcakrrrrrrRRkabkk",
 ".....kcaabkarrrrRRakbabbk",
 ".....kaabkkcaagaabbkkbabk",
 ".....kssk.kcaaaaabbk.kssk",
 "......kk..koooggoook..kk",
 "..........krraaaabrRk",
 "..........krrkttTkRRk"],
[
 "..........kttTkktTTk",
 "..........kttTk.ktTTk",
 "..........kttTk.ktTTk",
 ".........kcaabk.kaabbk",
 ".........kaabk..kaabk",
 ".........kaabk..kaabk",
 "........kooook.kooook",
 "........kkkkkk.kkkkkk"],
[
 "..........kttTkkkTtTk",
 ".........kttTk..kkTttk",
 "........kttTk.....kTttk",
 ".......kcabk.......kaabk",
 "......kaabk........kaabk",
 ".....kaabk.........kaabk",
 "....kooook........kooook",
 "....kkkkkk........kkkkkk"],
{"i":[0,0,[[23,6,"..l"],[23,7,".klk"],[23,8,".klmk"],[23,9,".klmk"],[23,10,".klmk"],[23,11,".klmk"],[23,12,".klmk"],[23,13,".klmk"],[23,14,".klmk"],[23,15,".klmk"],[23,16,".klmk"],[23,17,".klmk"],[23,18,".klmk"],[22,19,"kgggggk"],[23,20,".kook"],[23,21,".kok"]]],"w":[-1,0,[[4,0,"....kk"],[3,1,"...klmk"],[3,2,"..klmk"],[2,3,"..klmk"],[2,4,".klmk"],[1,5,".klmk"],[1,6,"klmk"],[0,7,"klmk"],[0,8,"kmk"],[3,9,"g"],[20,9,"kk"],[19,10,"kssk"],[4,10,"kgggk"],[19,11,"kcak"]]],"s":[3,1,[[24,17,"kkkkkkkk"],[23,18,"kgklllllll"],[22,19,"ksskgkmmmmmmmm"],[23,20,"kgkkkkkkkk"],[24,16,"g"],[24,21,"g"],[26,4,"mm"],[27,5,"mlm"],[28,6,"mlm"],[29,7,"mlm"],[29,8,"mlwm"],[30,9,"lwm"],[30,10,"lw"],[30,11,"lw"],[30,12,"lw"],[30,13,"lw"],[29,14,"mlw"],[29,15,"mlm"],[28,23,"mlm"],[29,22,"mlm"],[30,21,"ml"]]]});
/* ===== 英雄1: 魔法使いシズク ===== */
mkH3(1,'D#2e1a78,E#a85a40,F#6a70a8,G#1e2670,N#8a5a00,L#3a2410,Q#1a7a9a,k#14101f,h#7a4dff,H#4d2fb8,j#a584ff,s#ffd9b0,S#e8a888,z#c87860,e#14101f,w#ffffff,u#c070ff,U#7a30c0,x#a03050,p#5b6cff,P#3a45b8,c#8f9cff,y#ffd24d,Y#b98300,o#8a5a2b,q#7ff3ff,v#f2f4ff,V#aab0d8',[["D","hHj"],["E","sSz"],["F","vV"],["G","pPc"],["N","yY"],["L","o"],["Q","q"]],
[
 "................kkk",
 "...............kjhhk",
 ".............kkjhhHk",
 "...........kkjjhhHHk",
 "..........kjjhhhhHHk",
 ".........kjjhhhhhhHHk",
 "........kyyyyyyyyyYYYk",
 "...kkkkkjjhhhhhhhhhHHkkkkk",
 "...kjjhhhhhhhhhhhhhhhHHHHHk",
 "....kkkVVVVVVVVVVVVVVVkkk",
 "......kvvvvsvvvvsvvvvVk",
 "......kvseeessseeesvVVk",
 "......kvswUUssswUUsvVVk",
 "......kvswuusSswuusvVVk",
 "......kvvsssssssssSvVVk",
 "......kvvkssxxssSkvVVVk"],
[
 "......kvvkPyyqyyPkvVVk",
 ".....kkvkpppyyypPPkVVkk",
 "....kpckcpppppppPPPkVkPk",
 "....kppkpypppppppyPkkPPk",
 "....kssk.kpppppPPPk.kssk",
 ".....kk..kyyppppPyyk..kk",
 ".........kpppppPPPPk",
 "........kpppypppPyPPk"],
[
 "........kpppppppPPPPk",
 ".......kpppppppPPPPPPk",
 ".......kpppypppPPPyPPk",
 ".......kyypppppPPPPyyk",
 "........kkyyyyyyyyykk",
 ".........koook.koook",
 "........kooook.kooook",
 "........kkkkkk.kkkkkk"],
[
 "........kpppppppPPPPk",
 ".......kpppppppPPPPPPk",
 "......kppppypppPPPyPPPk",
 ".....kyyppppppPPPPPPyyk",
 "......kkyyyyyyyyyyykk",
 "........koook...koook",
 ".......kooook..kooook",
 ".......kkkkkk..kkkkkk"],
{"i":[0,0,[[24,5,".kqk"],[24,6,"kqwqk"],[24,7,"kqqqk"],[24,8,".kyk"],[24,9,".kok"],[24,10,".kok"],[24,11,".kok"],[24,12,".kok"],[24,13,".kok"],[24,14,".kok"],[24,15,".kok"],[24,16,".kok"],[24,17,".kok"],[24,18,".kok"],[24,19,".kok"],[23,20,"kssok"],[24,21,".kok"],[24,22,".kok"],[24,23,".kok"],[24,24,".kok"],[24,25,".kok"],[24,26,".kk"]]],"w":[-1,0,[[24,1,".kqk"],[24,2,"kqwqk"],[24,3,"kqqqk"],[24,4,".kyk"],[24,5,".kok"],[24,6,".kok"],[24,7,".kok"],[24,8,".kok"],[24,9,".kok"],[24,10,".kok"],[24,11,".kok"],[24,12,".kok"],[24,13,".kok"],[24,14,".kok"],[24,15,".kok"],[24,16,".kok"],[24,17,".kok"],[23,18,"kssok"],[22,19,"kppk"],[24,19,"kok"],[25,20,"kk"],[22,0,"q"],[29,1,"q"],[30,4,"c"],[21,3,"c"],[28,6,"q"]]],"s":[2,1,[[22,18,"kkkkkkkkk"],[21,19,"kssooooykqk"],[21,20,"kssooooykqwq"],[22,21,"kkkkkkkkqqq"],[30,17,"q"],[31,20,"w"],[29,15,"q"],[27,13,"c"],[30,23,"q"],[28,25,"c"],[31,12,"q"]]]});
/* ===== 英雄2: 弓使いコハク ===== */
mkH3(2,'D#0e4a2c,E#a85a40,F#3a2008,L#3a2410,N#8a5a00,X#8a8468,J#8a1c28,k#14101f,h#2fb36b,H#1b7a47,c#7fe8a0,s#ffd9b0,S#e8a888,z#c87860,e#14101f,w#ffffff,u#50f090,U#18a050,g#3dd27f,d#1b7a47,b#8a5a2b,B#5a3818,n#a86a34,N#6a3c14,y#ffd24d,x#e8e0c0,r#ff4a4a',[["D","hHcgd"],["E","sSz"],["F","nN"],["L","bB"],["N","y"],["X","x"],["J","r"]],
[
 "............kkkkkkk",
 "..........kkcchhhhhkk",
 ".........kcchhhhhhhhHk",
 "........kcchhhhhhhhhhHk",
 ".......kchhhhhhhhhhhhHHk",
 ".......khhhhhhhhhhhhhHHk",
 "......khhhHkkkkkkkkkHHHHk",
 "......khhHknnnnnnnnNkHHHk",
 "......khhHknnNnnnNnnNkHHk",
 "......khHknnznnnznnnNkHHk",
 "......khHkzeeesszeeeskHHk",
 "......khHkswUUssswUUskHHk",
 "......khHkswuusSswuuSkHHk",
 "......khHkggggggggggdkHHk",
 ".......kHHkgggggggddkHHk",
 "........kHHkkgggddkkHHk"],
[
 ".......kkhhhhkkkkhhhHHkk",
 "......kgkhhhhhhhhhhHHkgdk",
 ".....kggkkbgggggggddkkgdk",
 ".....kggk.kgbgggggdk.kgdk",
 ".....kssk.kggbggyddk.kssk",
 "......kk..kbbbbbBBBk..kk",
 "..........kgggggdddk",
 "..........kggkkkkddk"],
[
 "..........kbbBk.kbBBk",
 "..........kbbBk.kbBBk",
 "..........kbbBk.kbBBk",
 ".........kgggdk.kggddk",
 ".........kbBBk..kbBBk",
 ".........kbBBk..kbBBk",
 "........kBBBBk.kBBBBk",
 "........kkkkkk.kkkkkk"],
[
 "..........kbbBkkkbBBk",
 ".........kbbBk..kkbBBk",
 "........kbbBk.....kbBBk",
 ".......kgggdk.....kggddk",
 "......kbBBk........kbBBk",
 ".....kbBBk.........kbBBk",
 "....kBBBBk........kBBBBk",
 "....kkkkkk........kkkkkk"],
{"i":[0,0,[[2,13,".rr"],[2,14,".xx"],[2,15,"kxxk"],[2,16,"kbbk"],[2,17,"kbBk"],[2,18,"kbBk"],[3,19,"kk"],[25,6,"kk"],[24,7,"kbbk"],[25,8,".kbk"],[26,9,".kbk"],[26,10,"x.kbk"],[26,11,"x.kbk"],[26,12,"x.kbk"],[26,13,"x..kb"],[26,14,"x..kb"],[26,15,"x..kb"],[26,16,"x..kb"],[26,17,"x..kb"],[26,18,"x..kb"],[26,19,"x.kbk"],[26,20,"x.kbk"],[26,21,"x.kbk"],[26,22,".kbk"],[25,23,".kbk"],[24,24,"kbbk"],[25,25,"kk"]]],"w":[-1,1,[[1,13,".rr"],[1,14,".xx"],[1,15,"kxxk"],[1,16,"kbbk"],[1,17,"kbBk"],[1,18,"kbBk"],[2,19,"kk"],[25,7,"kk"],[24,8,"kbbk"],[25,9,".kbk"],[26,10,".kbk"],[23,11,"x...kbk"],[22,12,"x.....kb"],[21,13,"x......kb"],[20,14,"x.......kb"],[16,15,"kkkkkkkkkkkkkbrr"],[15,16,"ksskxxxxxxxxxkbk"],[16,17,"kkkkx.......kb"],[21,18,"x......kb"],[22,19,"x.....kb"],[23,20,"x...kbk"],[26,21,".kbk"],[25,22,".kbk"],[24,23,"kbbk"],[25,24,"kk"]]],"s":[1,1,[[3,13,".rr"],[3,14,".xx"],[3,15,"kxxk"],[3,16,"kbbk"],[3,17,"kbBk"],[3,18,"kbBk"],[4,19,"kk"],[26,6,"kk"],[25,7,"kbbk"],[26,8,".kbk"],[27,9,".kbk"],[27,10,"x.kb"],[27,11,"x.kb"],[27,12,"x.kb"],[27,13,"x.kb"],[27,14,"x.kb"],[27,15,"x.kb"],[27,16,"x.kb"],[27,17,"x.kb"],[27,18,"x.kb"],[27,19,"x.kb"],[27,20,"x.kb"],[27,21,"x.kb"],[27,22,".kbk"],[26,23,".kbk"],[25,24,"kbbk"],[26,25,"kk"],[22,15,"cc"],[21,16,"ccc"],[22,17,"cc"],[29,16,"xxr"]]]});
/* ===== 雑魚(16x16, 左半分) ===== */
/* m0 スライム(青) */
mk('m0','k#14101f,a#3fb6ff,b#1f6fd1,c#b8ecff,w#fff,e#14101f',
["........","........","........","......kk","....kkcc","...kcaaa","..kcaaaa","..kcaaaa",".kcawkaa",".kcawkaa",".kaaaaaa",".kaaaaak","kaaabbbb","kabbbbbb","kbbbbbbb",".kkkkkkk"]);
/* m1 コウモリ(紫) */
mk('m1','k#14101f,a#8a4dff,b#4b2a99,c#c9a6ff,e#ff4d6a,w#fff',
["........","......k.","....k.ka","....kkaa","k...kaaa","kk..kaee","kbk.kaaa","kabkkbaw","kaabkbaa",".kaabbaa",".kbaabbb","..kbkkbk","...k..kb","........","........","........"]);
/* m2 ゴースト(白) */
mk('m2','k#14101f,w#f2f1ff,b#a9acd0,e#14101f,r#ff7a9a',
["........","......kk","....kkww","...kwwww","..kwwwww","..kwwwww",".kwwewee",".kwwwwww",".kwwwrww",".kwwwwkk","kwwwwwkb","kwwwwwwk","kwbwwbwk",".kkwkkwb","...kk.kk","........"]);
/* m3 岩の巨人(灰) */
mk('m3','k#14101f,a#8a8f9c,b#575c6b,c#c3c8d4,e#ffd24d,m#3d6b3a',
["........","...kkkkk","..kcccca","..kcaaaa","..kaeekk",".kkaaaaa","kcccaaaa","kcaakmmk","kaabkmbb","kaabbkaa","kkkabkaa","..kbbkab","..kcakbb","..kaabbb","..kkbbbb","...kkkkk"]);
/* m4 きのこ(赤) */
mk('m4','k#14101f,r#e0364a,R#8c1030,w#fff,s#f2e3c0,S#c9a878,e#14101f',
["........","....kkkk","..kkrrrr","..krwwrr",".krwwrrr",".krrrrrw","krrrrrww","kRRRRRRR",".kkkkkkk","..ksseek","..kssesk","..kssssS","..kssssS","..kSssSS","...kSSSk","....kkkk"]);
/* m5 炎の精(橙) */
mk('m5','k#14101f,a#ff8a1f,b#e0301a,c#ffe14d,w#fff,e#14101f',
["........",".......k","......ka","....k.ka","...kak.k","...kaakb","..kaaaab","..kacaab",".kaccawb",".kaccwka",".kaaccka",".kbaaaaa",".kbbaaaa","..kbbbbb","...kkbbb","......kk"]);
/* m6 カニ(緑) */
mk('m6','k#14101f,a#38c06a,b#1f7a47,c#a0f0b8,e#14101f,w#fff,r#e0364a',
["........","........","........","kk......","krk.....","krrk..kk","kkrrkkaa","..kkcaaa","..kcawka","..kaaaaa","kkkaaaaa","kckbaarr","kakbbkaa","kbkbbbkb","kk.kkkbb","...k.k.k"]);
/* m7 クラゲ(水色) */
mk('m7','k#14101f,a#6fe8ff,b#2aa0d0,c#e6fcff,e#14101f,p#ff7ab8',
["........","....kkkk","..kkcccc","..kcaaaa",".kcaaaaa",".kcaaaaa","kcaaewee","kcaaaaaa","kaaapaap","kbbbbbbb",".kbkbkbk",".kpkbkpk","..kkbkkb","..kpkbkp","...k.k.k","........"]);
/* m8 目玉(桃) */
mk('m8','k#14101f,a#ff5aa8,b#a8206a,c#ffc0e0,w#fff,e#14101f,r#ff2d3a,y#ffd24d',
["........","........","...kkkkk","..kccaaa",".kcaaaaa",".kaawwwk","kaawwrrk","kaawrkek","kaawwrrk","kaaawwwk",".kabaaaa",".kbbbaaa","..kkbbbb","..k.kkbb","....k.kk","........"]);
/* m9 暗黒の兜(紺) */
mk('m9','k#14101f,a#6a72c0,b#3a3f88,c#b8c0ff,e#ff4d4d,w#fff,y#ffd24d',
["........","......k.","....kkkk","...kcccc","..kcaaaa","..kcaaaa","..kcakkk","..kaeeke","..kaakkk","..kbaaaa","..kbbaaa","kkkbbbab","kcabbbkb","kaabbbaa","kbbkkkbb",".kk..kkk"]);
/* ===== ボス(24x24, 左半分12列) ===== */
/* b0 紅蓮竜 */
mk('b0','k#14101f,a#e0364a,b#8c1030,c#ff8a9a,e#ffe14d,w#fff,h#f2f0d0,o#ff8a1f,d#5a0a22',
["............","..k.........","..kk......kk","..khk....kah","..khkkkkkkkc","...kaaaaaacc","..kaaccaaaaa","..kaaeekkaaa","..kaaeekwwaa","..kaaaakwwwa","...kaaaaaaaa","....kaakkkkk","...kkaakooyy","..kaakkbkooo","..kaabbbbkoo","..kabbbbbbkk",".kaabbbbbbbb",".kabbbddbbbb","kaabbbddbbbb","kaabbbbbbbbb","kbbkkbbbbbbb","kbk.kkkbbbbb","kk...kbbbkkk","......kkkk.."]);
/* b1 邪眼王 */
mk('b1','k#14101f,a#7a3cff,b#4a1fa8,c#c7a6ff,w#fff,e#ff2d55,y#ffd24d,d#2a1070',
["............","....kk.....k","...kck....kk","..kcck..kkca","..kcakkkkcaa","..kcaaaaaaaa",".kcaaaaaaaaa",".kcaaakkkkkk",".kaaakwwwwww",".kaaakwwwwww","kcaaakwweeee","kaaaakwweeee","kaaaakwweeee","kaaaakwwwwww",".kaaakwwwwww",".kbaaakkkkkk",".kbbaaaaaaaa","..kbbaaakkaa","..kbbbakyykb","...kbbbkyykb","...kdbbbkkbb","....kdbbbbbb","....kkdbbbkk",".....kkkkk.."]);
/* b2 岩窟王(石の巨人) */
mk('b2','k#14101f,a#9a9fae,b#5d6272,c#d3d8e6,e#ffd24d,m#3d8a46,d#363a48,w#fff',
["............","..kkkkkkkkkk","..kccccccccc","..kcaaaaaaaa","..kcaakkkkkk",".kkaaakeeeee",".kcaaakeeeee",".kcaaaakkkkk",".kcaabaaaaaa",".kkaabbaakkk","kccaabbkddww","kcaaabbkddww","kcaabbbkddww","kaabbmmkkkkk","kaabbmmmbbbb","kkabbbbmmbbb","kcabbbbbbbbb","kaabkkkbbbbb","kaabkcckbbbb","kaabkaakbbbb",".kkbkaabbbbb","..kbbbbbbbbb","..kbbkkkkkkk","...kkk......"]);
/* b3 氷獄の女帝 */
mk('b3','k#14101f,a#7fd6ff,b#2a86c8,c#e6f8ff,e#ff2d7a,w#fff,y#ffd24d,d#1a4a8a,p#b8a0ff',
["....k.......","...kck......k","...kck....kkc","..kcck.kkcca","..kccckkcaaa","..kcaaaaaaaa","..kcaaaaaaaa","..kaaakkkkkk",".kcaakeeewww",".kcaakeeeeww","kcaaaakkkkkk","kcaaaaaaaaaa","kkcaaaaakkaa",".kkcaaakyykb",".kppcaaaakyk",".kpppcaabbkk","kppppcabbbbb","kpppppabbbbb","kppkpppabbbb","kpk.kppabbbb","kk...kkpbbbb","......kppbbb",".......kkkkk"]);
/* 敵スプライト選択(ステージのみで決まる): 雑魚はステージごとに変化、ボスは5ステージごとに4種を循環 */
const BOSSN=['紅蓮竜 ガルザード','邪眼王 ゾルアイ','岩窟王 ゴルドム','氷獄の女帝 フリジア'];
function enSpr(st){st=st||G.stage;return st%5==0?'b'+((st/5-1)%4):'m'+((st-1+3*Math.floor((st-1)/5))%10)}
