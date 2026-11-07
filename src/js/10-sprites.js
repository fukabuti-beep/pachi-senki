/* ---------- pixel sprites (すべてオリジナル) ----------
   mk(名,パレット,行,full): 行は左半分(鏡像) / full=true なら全幅。SPR[名]=canvas, PXL[名]=[x,y,色]の一覧(撃破の爆散用)
   英雄: h0..h2 (待機A) +'b'(待機B) +'w'(構え) +'s'(攻撃)  16x16
   雑魚: m0..m9 16x16 / ボス: b0..b3 24x24  (敵スプライト選択は enSpr()) */
const SPR={},PXL={},SPW={};
function mk(n,pal,rows,full){const p={};pal.split(',').forEach(s=>p[s[0]]=s.slice(1));const R=rows.map(r=>full?r:r+[...r].reverse().join('')),w=R[0].length,h=R.length;const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),L=[];R.forEach((r,y)=>[...r].forEach((ch,i)=>{if(p[ch]){x.fillStyle=p[ch];x.fillRect(i,y,1,1);L.push([i,y,p[ch]])}}));SPR[n]=c;PXL[n]=L}
/* 白シルエット(被弾フラッシュ用)。初回に生成してキャッシュ */
function spw(n){if(SPW[n])return SPW[n];const s=SPR[n],c=document.createElement('canvas');c.width=s.width;c.height=s.height;const x=c.getContext('2d');x.drawImage(s,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,s.width,s.height);return SPW[n]=c}
/* 英雄: 基本16行+パッチ(構え/攻撃)。待機Bは胴を1px沈める */
function mkH(i,pal,base,wd,st){const bob=r=>['.'.repeat(16),...r.slice(0,12),...r.slice(13)],pa=(r,p)=>{const o=r.slice();p.forEach(q=>o[q[0]]=q[1]);return o};
mk('h'+i,pal,base,1);mk('h'+i+'b',pal,bob(base),1);mk('h'+i+'w',pal,pa(base,wd),1);mk('h'+i+'s',pal,pa(base,st),1)}
/* ===== 英雄0: 剣士(赤) ===== */
mkH(0,'k#14101f,h#e0443a,H#a8262e,s#ffd2a6,S#d99a6c,e#14101f,a#d5dae6,b#7c859b,r#d1303c,t#3556d6,T#22338f,o#6a3d1e,g#ffd24d,l#f4fbff,m#8fb0d8',
["................",
 "....kkkkkkkk....",
 "...khhhhhhhhk...",
 "..khhHhhhhHhhk.l",
 "..khhhhhhhhhhklm",
 "..khhsssssshhklm",
 "...ksesssseskklm",
 "...kssssssssk.lm",
 "....kssSSsskkklm",
 "...kkaaaaaakgglm",
 "..krkaabbaakgkkm",
 "..krsaaaaaaksgm.",
 "...kkaattaakkgm.",
 "....kttTTttk.k..",
 "....kttkkttk....",
 "....koookkook..."],
[[0,"..............l."],[1,"....kkkkkkkk..lm"],[2,"...khhhhhhhhk.lm"],[3,"..khhHhhhhHhhklm"],[9,"...kkaaaaaakkkm."],[10,"..krkaabbaakgkm."],[11,"..krsaaaaaaksgm."]],
[[9,"...kkaaaaaakkk.."],[10,"..krkaabbaakglll"],[11,"..krsaaaaaaksgmm"],[12,"...kkaattaakkkmm."]]);
/* ===== 英雄1: 魔法使い(紫) ===== */
mkH(1,'k#14101f,h#7a4dff,H#4d2fb8,s#ffd2a6,S#d99a6c,e#14101f,p#5b6cff,P#3a45b8,c#c8b8ff,y#ffd24d,w#fff,o#8a5a2b,q#7ff3ff',
["................",
 ".......kk.......",
 "......khhk......",
 ".....khhhhk.....",
 "...kkkhhhhkkk...",
 "..khhhhyyhhhhk..",
 "...kkkhhhhkkk...",
 "....ksssssssk...",
 "....kseSSSesk..q",
 "....ksssSSssk.qy",
 "...kkpppppppkkoq",
 "..kcpppyyppppko.",
 "..kcsppppppskoo.",
 "...kkpppPPppkko.",
 "....kpppPPppko..",
 "....kPPkkkPPk..."],
[[7,"....ksssssssk.q."],[8,"....kseSSSesk.qq"],[9,"....ksssSSssk.qy"],[10,"...kkpppppppkkoq"],[11,"..kcpppyyppppkoq"],[12,"..kcsppppppskkoq"]],
[[7,"....ksssssssk..q"],[8,"....kseSSSesk.qq"],[9,"....ksssSSsskqqy"],[10,"...kkpppppppqqqq"],[11,"..kcpppyyppppqqq"],[12,"..kcsppppppskkoq"]]);
/* ===== 英雄2: 弓使い(緑) ===== */
mkH(2,'k#14101f,h#2fb36b,H#1b7a47,s#ffd2a6,S#d99a6c,e#14101f,g#3dd27f,d#1b7a47,b#8a5a2b,B#5a3818,c#caffb0,w#fff,y#ffd24d',
["................",
 ".....kkkkkk.....",
 "....khhhhhhk....",
 "...khhggghhhk.kb",
 "...khhhhhhhhk.bb",
 "...khhsssssshkb.",
 "...khsesssesk.b.",
 "....kssssssk..b.",
 "....kkssSSkk..b.",
 "....kggggggkk.b.",
 "...kdgdggdgkkkbb",
 "..kssgggggggsbkk",
 "..kskgggyygkkkb.",
 "...kkdddddddkbb.",
 "....kddkkddk.b..",
 "....kbbkkbbk...."],
[[9,"....kggggggkk..b"],[10,"...kdgdggdgkkkbb"],[11,"..kssgggggggsbkk"],[12,"..kskgggyygkkkb."]],
[[3,"...khhggghhhk..b"],[4,"...khhhhhhhhk.bb"],[5,"...khhsssssshkb."],[6,"...khsesssesk.b."],[7,"....kssssssk..b."],[8,"....kkssSSkk.bb."],[9,"....kggggggkkb.."],[10,"...kdgdggdgskbbb"],[11,"..kssgggggggsbyb"],[12,"..kskgggyygkkkbb"]]);
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
