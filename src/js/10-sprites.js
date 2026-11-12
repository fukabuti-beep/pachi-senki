/* ---------- pixel sprites (すべてオリジナル) ----------
   mk(名,パレット,行,full): 行は左半分(鏡像) / full=true なら全幅。SPR[名]=canvas, PXL[名]=[x,y,色]の一覧(撃破の爆散用)
   英雄: h0..h2 (待機A) +'b'(待機B) +'w'(構え) +'s'(攻撃)  32x32
   雑魚: m0..m9 16x16 / ボス: b0..b3 24x24  (敵スプライト選択は enSpr()) */
const SPR={},PXL={},SPW={};
function mk(n,pal,rows,full){const p={};pal.split(',').forEach(s=>p[s[0]]=s.slice(1));const R=rows.map(r=>full?r:r+[...r].reverse().join('')),w=R[0].length,h=R.length;const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),L=[];R.forEach((r,y)=>[...r].forEach((ch,i)=>{if(p[ch]){x.fillStyle=p[ch];x.fillRect(i,y,1,1);L.push([i,y,p[ch]])}}));SPR[n]=c;PXL[n]=L}
/* 白シルエット(被弾フラッシュ用)。初回に生成してキャッシュ */
function spw(n){if(SPW[n])return SPW[n];const s=SPR[n],c=document.createElement('canvas');c.width=s.width;c.height=s.height;const x=c.getContext('2d');x.drawImage(s,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,s.width,s.height);return SPW[n]=c}
/* 英雄: 32x32(戦闘画面では2倍=64px)。体の絵(body)に、コマごとの武器の絵(ov=[待機,構え,攻撃]、[x,y,文字列] の重ね描き)を足して4コマ作る。
   待機Bは上半身を1px沈める。見た目は作り手提供のカットイン用イラスト(src/img)に合わせてある(赤いツンツン髪と銀の鎧/白い髪と紫の帽子/緑のフードと覆面)。
   パレットの色は衣装(98n-skin の色の置きかえ表)が参照するので、変える時は衣装の表も合わせる */
function mkH2(i,pal,body,ov){const W=body[0].length,put=(rows,o,dy)=>{const g=rows.map(r=>[...r]);o.forEach(q=>[...q[2]].forEach((ch,k)=>{const x=q[0]+k,y=q[1]+dy;if(ch!='.'&&x>=0&&x<W&&g[y])g[y][x]=ch}));return g.map(r=>r.join(''))},
  bob=['.'.repeat(W),...body.slice(0,27),...body.slice(28)];
  mk('h'+i,pal,put(body,ov[0],0),1);mk('h'+i+'b',pal,put(bob,ov[0],1),1);mk('h'+i+'w',pal,put(body,ov[1],0),1);mk('h'+i+'s',pal,put(body,ov[2],0),1)}
/* ===== 英雄0: 剣士ホムラ ===== */
mkH2(0,'k#14101f,h#e0443a,H#a8262e,i#ff8a5a,s#ffd2a6,S#d99a6c,e#14101f,w#ffffff,y#ffc020,a#d5dae6,b#7c859b,c#f4f8ff,r#d1303c,t#3556d6,T#22338f,o#6a3d1e,g#ffd24d,l#f4fbff,m#8fb0d8,n#5a6a88',
["............k....k.....k........",
 "...........khk..khk...khk.......",
 "......k...khhk.khhhk.khhk.......",
 ".....khk.khhhkkhhhhkkhhhk..k....",
 ".....khhkhhihhhhhihhhhhhkkhk....",
 "......khhhhihhhhhihhhhhhhhhk....",
 ".....khhhhhhhhhhhhhhhhhhhhk.....",
 "....khhhhhhhhhhhhhhhhhhhhhk.....",
 "...khhhHhhhhhhhhhhhhhhhHhhk.....",
 "....khHhhhhhhhhhhhhhhhhhHk......",
 "....khhhhhsshhhhhhsshhhhhk......",
 ".....khhhsssshhhhsssshhhHk......",
 ".....khhsssssssssssssshhk.......",
 ".....khskkkksssskkkksshk........",
 ".....kssswykssssswykssk.........",
 ".....kssswyksssSswyksSk.........",
 ".....ksssssssssssssssSk.........",
 "......kssssskkkssssSSk..........",
 ".......ksssssssssSSSk...........",
 "......krkkssssssskkrk...........",
 ".....krrrrkkkkkkkrrrrkk.........",
 "....kcakrrrrrrrrrrkacrrk........",
 "...kcaakbrrrrrrrrbkaaakrk.......",
 "...kaabkaaarrrraaakbaak.k.......",
 "...kkbkkaaaaggaaaakkbkk.........",
 "...ksskkaabaaaabaakkssk.........",
 "...ksskkbbbbbbbbbbkkssk.........",
 "....kk.kttttkkttttk.kk..........",
 ".......kttTtkktTttk.............",
 ".......kttTk..kTttk.............",
 "......kooook..kooook............",
 "......kkkkkk..kkkkkk............"],
[[[23,9,"..l"],[23,10,".klk"],[23,11,".klmk"],[23,12,".klmk"],[23,13,".klmk"],[23,14,".klmk"],[23,15,".klmk"],[23,16,".klmk"],[23,17,".klmk"],[23,18,".klmk"],[23,19,".klmk"],[23,20,".klmk"],[22,21,"kgggggk"],[23,22,".kook"],[22,23,"ksskok"],[22,24,"ksskk"]],[[24,0,"...kk"],[24,1,"..klmk"],[24,2,"..klmk"],[24,3,"..klmk"],[24,4,"..klmk"],[24,5,"..klmk"],[24,6,"..klmk"],[24,7,"..klmk"],[24,8,"..klmk"],[24,9,"..klmk"],[24,10,"..klmk"],[24,11,"..klmk"],[24,12,"..klmk"],[23,13,".kgggggk"],[24,14,"..kook"],[24,15,"..kook"],[22,16,"..ksssk"],[22,17,"..kcaak"],[22,18,".kaabk"],[22,19,"kaabk"]],[[20,22,"...kkkkkkkkkk"],[20,23,"ksskgkllllllk"],[20,24,"ksskgkmmmmmmmk"],[20,25,"kkk.gkkkkkkkk"],[24,21,"g"],[24,26,"g"]]]);
/* ===== 英雄1: 魔法使いシズク ===== */
mkH2(1,'k#14101f,h#7a4dff,H#4d2fb8,s#ffd2a6,S#d99a6c,e#14101f,p#5b6cff,P#3a45b8,c#c8b8ff,y#ffd24d,w#ffffff,o#8a5a2b,q#7ff3ff,v#eef0ff,V#aab0d8,u#b060ff,Y#b98300',
["..................kkk...........",
 ".................khhhk..........",
 "...............kkhhHhk..........",
 ".............kkhhhhHk...........",
 "...........kkhhhhhHHk...........",
 "..........khhhhhhhHk............",
 ".........khhhhhhhhHHk...........",
 "........khhhhhhhhhhHHk..........",
 ".......kyyyyyyyyyyyYYYk.........",
 "...kkkkkhhhhhhhhhhhhHHkkkkk.....",
 "..khhhhhhhhhhhhhhhhhhhHHHHHk....",
 "...kkkkkvvvvvvvvvvvvvVkkkkk.....",
 ".....kvvvvsssvvvsssvvvVk........",
 ".....kvvskkkksskkkksvvVk........",
 ".....kvvswukssswukssvVVk........",
 ".....kvvswukssSwuksSvVVk........",
 ".....kvvsssssssssssSvVVk........",
 ".....kvVVsssskksssSSvVVk........",
 ".....kvVVkssssssSSkVvVVk........",
 ".....kvVkpkkssskkpkVVVk.........",
 ".....kvkpppykkkypppkVVk.........",
 "....kkkpppppyqypppppkVk.........",
 "...kppkpppppyyypPPPPkkk.........",
 "...kppkppppppppPPPPPkppk........",
 "...ksskpppppppPPPPPPkssk........",
 "...ksskpyppppPPPPPyPkssk........",
 "....kkkpppppppPPPPPPkkk.........",
 "......kppppppPPPPPPPk...........",
 "......kyyppppPPPPPyyk...........",
 ".......kkkkkkkkkkkkk............",
 ".......kooook.kooook............",
 ".......kkkkkk.kkkkkk............"],
[[[24,8,".kqk"],[24,9,"kqwqk"],[24,10,"kqqqk"],[24,11,".kqk"],[24,12,".kok"],[24,13,".kok"],[24,14,".kok"],[24,15,".kok"],[24,16,".kok"],[24,17,".kok"],[24,18,".kok"],[24,19,".kok"],[24,20,".kok"],[24,21,".kok"],[23,22,"kssok"],[23,23,"kssok"],[24,24,".kok"],[24,25,".kok"],[24,26,".kok"],[24,27,".kk"]],[[25,3,".kqk"],[25,4,"kqwqk"],[25,5,"kqqqk"],[25,6,".kqk"],[25,7,".kok"],[25,8,".kok"],[25,12,".kok"],[25,13,".kok"],[25,14,".kok"],[25,15,".kok"],[25,16,".kok"],[25,17,".kok"],[25,18,".kok"],[25,19,".kok"],[24,20,"kssok"],[24,21,"kssok"],[23,22,"kppk"],[25,22,"kok"],[25,23,".kk"],[23,1,"q"],[29,2,"q"],[22,5,"c"],[30,6,"c"]],[[21,19,"..........q"],[21,20,"kkkkkkkk.qwq"],[21,21,"ksoooooqkqwwq"],[21,22,"kskkkkkqqwwwq"],[21,23,"kkk....kqqwq"],[30,24,"q"],[29,18,"c"],[31,22,"c"],[28,25,"c"]]]);
/* ===== 英雄2: 弓使いコハク ===== */
mkH2(2,'k#14101f,h#2fb36b,H#1b7a47,s#ffd2a6,S#d99a6c,e#14101f,g#3dd27f,d#1b7a47,b#8a5a2b,B#5a3818,c#caffb0,w#ffffff,y#ffd24d,n#9a6230,N#5a3510,u#40e080,x#e8e0c0,r#ff4a4a',
["..........kkkkkkkk..............",
 "........kkhhhhhhhhkk............",
 ".......khhhhhhhhhhhhk...........",
 "......khhhchhhhhhhhhHk..........",
 ".....khhhchhhhhhhhhhHHk.........",
 "....khhhhhhhhhhhhhhhhHHk........",
 "....khhhhkkkkkkkkkkhhHHk........",
 "...khhhhknnnnnnnnnNkhhHHk.......",
 "...khhhknnnnnnnnnnNNkhHHk.......",
 "...khhhknnsnnnnsnnnNkhHHk.......",
 "...khhhknsssnnsssnsNkhHHk.......",
 "...khhhkssssssssssssHkHHk.......",
 "...khhhkskkkksskkkksHkHHk.......",
 "...khhhkswukssswuksskhHHk.......",
 "...khhHkswuksssSwuksSkHHk.......",
 "....khHkggggggggggggdkHk........",
 "....khHkgggggggggggddkHk........",
 ".....kHHkggggggggggdkHHk........",
 "......kHHkkgggggddkkHHk.........",
 ".....kkhhhhkkkkkkhhhhHkk........",
 "....kgkhhhhhhhhhhhhhHHkgk.......",
 "...kggkbkhhhhhhhhhHHkbkggk......",
 "...kggkgbkhhhhhhHHkbdkgdk.......",
 "...ksskggbkggggddkbddkssk.......",
 "...ksskgggbkgggdkbdddkssk.......",
 "....kkkgygggbkkbdddydkkk........",
 "......kggggggBBdddddk...........",
 "......kkbbkkkkkkkbbkk...........",
 ".......kbbbk...kbbbk............",
 ".......kbBbk...kbBbk............",
 "......kBBBBk...kBBBBk...........",
 "......kkkkkk...kkkkkk..........."],
[[[25,6,"kk"],[24,7,"kbbk"],[25,8,".kbk"],[26,9,".kbk"],[26,10,"x.kbk"],[26,11,"x.kbk"],[26,12,"x..kbk"],[26,13,"x..kbk"],[26,14,"x..kbk"],[26,15,"x..kbk"],[26,16,"x..kbk"],[26,17,"x..kbk"],[26,18,"x..kbk"],[26,19,"x..kbk"],[26,20,"x.kbk"],[26,21,"x.kbk"],[26,22,".kbk"],[25,23,".kbk"],[24,24,"kbbk"],[25,25,"kk"]],[[24,6,"kk"],[23,7,"kbbk"],[24,8,".kbk"],[25,9,".kbk"],[22,10,"x...kbk"],[21,11,"x....kbk"],[20,12,"x......kbk"],[19,13,"x.......kbk"],[18,14,"kxxxxxxxxxkbkrr"],[17,15,"ksskkkkkkkkkbk"],[19,16,"x.......kbk"],[20,17,"x......kbk"],[21,18,"x....kbk"],[22,19,"x...kbk"],[25,20,".kbk"],[24,21,".kbk"],[23,22,"kbbk"],[24,23,"kk"]],[[25,6,"kk"],[24,7,"kbbk"],[25,8,".kbk"],[26,9,".kbk"],[26,10,"x.kbk"],[26,11,"x.kbk"],[26,12,"x..kbk"],[26,13,"x..kbk"],[26,14,"x..kbk"],[26,15,"x..kbk"],[26,16,"x..kbk"],[26,17,"x..kbk"],[26,18,"x..kbk"],[26,19,"x..kbk"],[26,20,"x.kbk"],[26,21,"x.kbk"],[26,22,".kbk"],[25,23,".kbk"],[24,24,"kbbk"],[25,25,"kk"],[22,14,"cc"],[22,15,"ccc"]]]);
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
