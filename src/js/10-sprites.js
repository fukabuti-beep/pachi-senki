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
   攻撃は体ごと動かす: 構え(武器を引く・腰を落とす)→ 攻撃(踏み込んで腕を伸ばし、武器は必ず手の先から出る)。構え/攻撃のコマは横48(右に16の余白=伸ばした腕と武器と軌跡のぶん)。
   mkH3(i,pal,mat,head,body,legs,legsS,fr): mat=[[輪郭の文字,'素材の文字(先頭が基本色)'],…]、legsS=踏み込みの足、
     fr={i:待機,w:構え,s:攻撃} それぞれ [上半身を横にずらすpx, 足(0=legs/1=legsS), 重ね描き [x,y,文字列]…, 腰を落とすpx]。
     重ね描きの '_' は消す(下ろした腕を消して、肩から腕を描き直す)。待機Bは頭を1px沈める。描く側は必ず SPR[n].width を見る(64 決め打ちにしない)。
   見た目は作り手提供のイラスト(src/img)に合わせる。HGRP[i]=色のまとまり(衣装 98n が、基本色の置きかえから影や輪郭の色も自動で作る) */
const HGRP={};
function mkH3(i,pal,mat,head,body,legs,legsS,fr){const M={},P={};pal.split(',').forEach(s=>P[s[0]]=s.slice(1));mat.forEach(m=>[...m[1]].forEach(c=>M[c]=m[0]));
  HGRP[i]=mat.map(m=>[P[m[1][0]],[P[m[0]],...[...m[1]].slice(1).map(c=>P[c])]]);
  const build=(f,bob,W)=>{const pad=r=>(r+'.'.repeat(W)).slice(0,W),sh=(r,dx)=>dx>=0?('.'.repeat(dx)+r).slice(0,W):r.slice(-dx)+'.'.repeat(-dx),dp=f[3]||0;
    let g=[];for(let k=0;k<dp;k++)g.push([...'.'.repeat(W)]);
    g=g.concat([...head,...body].map(r=>[...sh(pad(r),f[0])]),(f[1]?legsS:legs).slice(dp).map(r=>[...pad(r)]));
    if(bob)g=[[...'.'.repeat(W)],...g.slice(0,16),...g.slice(17)];
    f[2].forEach(q=>[...q[2]].forEach((ch,k)=>{const x=q[0]+k,y=q[1]+(bob?1:0);if(ch!='.'&&x>=0&&x<W&&g[y])g[y][x]=ch=='_'?'.':ch}));
    const at=(x,y)=>(g[y]&&g[y][x])||'.',out=g.map(r=>r.slice());
    for(let y=0;y<32;y++)for(let x=0;x<W;x++){if(g[y][x]!='k')continue;const n=[at(x-1,y),at(x,y-1),at(x+1,y),at(x,y+1)];if(n.some(c=>'wuUe'.includes(c)))continue;
      let c=n.filter(q=>M[q]).map(q=>M[q]);if(!c.length)c=[at(x-1,y-1),at(x+1,y-1),at(x-1,y+1),at(x+1,y+1)].filter(q=>M[q]).map(q=>M[q]);
      if(c.length)out[y][x]=c.slice().sort((a,b)=>c.filter(v=>v==b).length-c.filter(v=>v==a).length)[0]}
    return out.map(r=>r.join(''))};
  mk('h'+i,pal,build(fr.i,0,32),1);mk('h'+i+'b',pal,build(fr.i,1,32),1);mk('h'+i+'w',pal,build(fr.w,0,48),1);mk('h'+i+'s',pal,build(fr.s,0,48),1)}
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
{"i":[0,0,[[24,7,"l"],[23,8,"klk"],[23,9,"klmk"],[23,10,"klmk"],[23,11,"klmk"],[23,12,"klmk"],[23,13,"klmk"],[23,14,"klmk"],[23,15,"klmk"],[23,16,"klmk"],[23,17,"klmk"],[23,18,"klmk"],[22,19,"kggggk"],[24,20,"kok"],[24,21,"kok"],[25,22,"k"]],0],"w":[-1,0,[[20,18,"______"],[20,19,"______"],[20,20,"______"],[20,21,"______"],[19,18,"k"],[19,19,"k"],[19,20,"k"],[20,16,"kak"],[21,15,"kak"],[22,14,"kbk"],[23,13,"kak"],[23,12,"ksk"],[23,11,"ksk"],[24,10,"k"],[21,9,"kgggggk"],[15,0,"klmk"],[16,1,"klmk"],[17,2,"klmk"],[18,3,"klmk"],[19,4,"klmk"],[20,5,"klmk"],[21,6,"klmk"],[22,7,"klmk"],[23,8,"klmk"]],0],"s":[3,1,[[23,19,"______"],[23,20,"______"],[23,21,"______"],[23,22,"______"],[23,18,"kkkkk"],[23,19,"aaaaak"],[23,20,"bbbbbk"],[23,21,"kkkkk"],[28,19,"ssk"],[28,20,"ssk"],[28,18,"kk"],[28,21,"kk"],[30,16,"k"],[30,17,"g"],[30,18,"g"],[30,19,"g"],[30,20,"g"],[30,21,"g"],[30,22,"g"],[30,23,"k"],[31,18,"kkkkkkkkkkkk"],[31,19,"llllllllllllk"],[31,20,"mmmmmmmmmmmk"],[31,21,"kkkkkkkkkkk"],[30,4,"mm"],[32,5,"mlm"],[34,6,"mllm"],[37,7,"mllm"],[39,8,"mlwm"],[41,9,"mlwm"],[42,10,"lwm"],[43,11,"lwm"],[44,12,"lwm"],[44,13,"lw"],[45,14,"lw"],[45,15,"lw"],[45,16,"lw"],[44,17,"mlw"]],1]});
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
{"i":[0,0,[[24,5,".kqk"],[24,6,"kqwqk"],[24,7,"kqqqk"],[24,8,".kyk"],[25,9,"kok"],[25,10,"kok"],[25,11,"kok"],[25,12,"kok"],[25,13,"kok"],[25,14,"kok"],[25,15,"kok"],[25,16,"kok"],[25,17,"kok"],[25,18,"kok"],[25,19,"kok"],[25,20,"kok"],[25,21,"kok"],[25,22,"kok"],[25,23,"kok"],[25,24,"kok"],[25,25,"kok"],[25,26,"kok"],[25,27,"kk"]],0],"w":[-1,0,[[19,18,"______"],[19,19,"______"],[19,20,"______"],[19,21,"______"],[18,18,"k"],[18,19,"k"],[18,20,"k"],[20,16,"kpk"],[21,15,"kpk"],[22,14,"kPk"],[23,13,"kpk"],[23,12,"ksk"],[23,11,"ksk"],[26,0,".kqk"],[26,1,"kqwqk"],[26,2,"kqqqk"],[26,3,".kyk"],[27,4,"kok"],[27,5,"kok"],[27,6,"kok"],[27,7,"kok"],[27,8,"kok"],[27,9,"kok"],[27,10,"kok"],[27,11,"kok"],[27,12,"kok"],[27,13,"kok"],[27,14,"kok"],[27,15,"kok"],[27,16,"kok"],[27,17,"kok"],[27,18,"kk"],[25,11,"kk"],[25,12,"kk"],[24,0,"q"],[32,1,"q"],[33,4,"c"],[23,3,"c"],[31,6,"q"],[30,-1,"w"]],0],"s":[2,1,[[21,18,"______"],[21,19,"______"],[21,20,"______"],[21,21,"______"],[21,17,"kkkkk"],[21,18,"pppppk"],[21,19,"PPPPPk"],[21,20,"kkkkk"],[27,18,"ssk"],[27,19,"ssk"],[27,17,"kk"],[27,20,"kk"],[24,16,"kkkkk"],[30,17,"kkkkkkk"],[23,17,"k"],[30,18,"oooooooyk"],[30,19,"kkkkkkkk"],[38,15,".kqk"],[38,16,"kqwqk"],[38,17,"kqwwqk"],[38,18,"kqwwqk"],[38,19,"kqwqk"],[38,20,".kqk"],[43,13,"q"],[45,15,"qc"],[44,18,"qqwc"],[45,21,"qc"],[43,23,"q"],[41,12,"c"],[41,24,"c"],[47,18,"c"]],0]});
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
{"i":[0,0,[[2,13,".rr"],[2,14,".xx"],[2,15,"kxxk"],[2,16,"kbbk"],[2,17,"kbBk"],[2,18,"kbBk"],[3,19,"kk"],[26,12,"kk"],[25,13,"kbbk"],[26,14,".kbk"],[27,15,".kbk"],[26,16,"x.kbk"],[26,17,"x.kbk"],[26,18,"x.kbk"],[26,19,"x.kbk"],[26,20,"x.kbk"],[26,21,"x.kbk"],[26,22,"x.kbk"],[26,23,"x.kbk"],[26,24,"x.kbk"],[27,25,".kbk"],[26,26,".kbk"],[25,27,"kbbk"],[26,28,"kk"]],0],"w":[0,1,[[2,13,".rr"],[2,14,".xx"],[2,15,"kxxk"],[2,16,"kbbk"],[2,17,"kbBk"],[2,18,"kbBk"],[3,19,"kk"],[20,19,"______"],[20,20,"______"],[20,21,"______"],[20,22,"______"],[4,19,"______"],[4,20,"______"],[4,21,"______"],[4,22,"______"],[19,19,"k"],[19,20,"k"],[9,19,"k"],[9,20,"k"],[20,18,"kkkkkkk"],[20,19,"ggggggk"],[20,20,"ddddddk"],[20,21,"kkkkkkk"],[27,19,"ssk"],[27,20,"ssk"],[27,18,"kk"],[27,21,"kk"],[30,10,"kk"],[29,11,"kbbk"],[30,12,".kbk"],[31,13,".kbk"],[32,14,"kbk"],[32,15,"kbk"],[32,16,"kbk"],[32,17,"kbk"],[32,18,"kbk"],[32,19,"kbk"],[32,20,"kbk"],[32,21,"kbk"],[32,22,"kbk"],[32,23,"kbk"],[32,24,"kbk"],[32,25,"kbk"],[31,26,".kbk"],[30,27,".kbk"],[29,28,"kbbk"],[30,29,"kk"],[29,12,"x"],[27,13,"xx"],[25,14,"xx"],[23,15,"xx"],[21,16,"xx"],[19,17,"xx"],[18,18,"x"],[18,21,"x"],[19,22,"xx"],[21,23,"xx"],[23,24,"xx"],[25,25,"xx"],[27,26,"xx"],[29,27,"x"],[15,18,"kkkk"],[14,19,"kssk"],[14,20,"kssk"],[15,21,"kkkk"],[8,18,"kkkkkkk"],[7,19,"kgggggg"],[7,20,"kdddddd"],[8,21,"kkkkkkk"],[18,19,"xxxxxxxxxxxxxxxxxx"],[36,18,"r"],[36,19,"rr"],[36,20,"r"]],1],"s":[1,1,[[3,13,".rr"],[3,14,".xx"],[3,15,"kxxk"],[3,16,"kbbk"],[3,17,"kbBk"],[3,18,"kbBk"],[4,19,"kk"],[21,19,"______"],[21,20,"______"],[21,21,"______"],[21,22,"______"],[5,19,"______"],[5,20,"______"],[5,21,"______"],[5,22,"______"],[20,19,"k"],[20,20,"k"],[10,19,"k"],[10,20,"k"],[21,18,"kkkkkkk"],[21,19,"ggggggk"],[21,20,"ddddddk"],[21,21,"kkkkkkk"],[28,19,"ssk"],[28,20,"ssk"],[28,18,"kk"],[28,21,"kk"],[31,10,"kk"],[30,11,"kbbk"],[31,12,".kbk"],[32,13,".kbk"],[33,14,"kbk"],[33,15,"kbk"],[33,16,"kbk"],[33,17,"kbk"],[33,18,"kbk"],[33,19,"kbk"],[33,20,"kbk"],[33,21,"kbk"],[33,22,"kbk"],[33,23,"kbk"],[33,24,"kbk"],[33,25,"kbk"],[32,26,".kbk"],[31,27,".kbk"],[30,28,"kbbk"],[31,29,"kk"],[31,13,"x"],[31,14,"x"],[31,15,"x"],[31,16,"x"],[31,17,"x"],[31,18,"x"],[31,19,"x"],[31,20,"x"],[31,21,"x"],[31,22,"x"],[31,23,"x"],[31,24,"x"],[31,25,"x"],[31,26,"x"],[5,17,"kkkk"],[4,18,"kssk"],[4,19,"kssgk"],[5,20,"kkggk"],[6,21,"kkk"],[36,19,"cccc"],[40,18,"kkkkkk"],[40,19,"xxxxxrr"],[40,20,"kkkkkk"],[35,17,"c"],[35,21,"c"]],1]});
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
