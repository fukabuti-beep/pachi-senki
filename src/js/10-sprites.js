/* ---------- pixel sprites (left half, mirrored) ---------- */
const SPR={};
function mk(n,pal,rows){const p={};pal.split(',').forEach(s=>p[s[0]]=s.slice(1));const c=document.createElement('canvas');c.width=12;c.height=12;const x=c.getContext('2d');rows.forEach((r,y)=>[...(r+[...r].reverse().join(''))].forEach((ch,i)=>{if(p[ch]){x.fillStyle=p[ch];x.fillRect(i,y,1,1)}}));SPR[n]=c}
mk('h0','k#14101f,h#e0443a,s#ffd2a6,e#14101f,a#c9ced8,b#6e7586,c#fff,r#b0212a',["..kkkk",".khhhh","khhhhh","khssss","kssess",".kssss","..kaaa",".kaaac","kraabb",".kaabb",".kbbk.",".kkkk."]);
mk('h1','k#14101f,h#7a4dff,p#5b6cff,s#ffd2a6,e#14101f,c#c8b8ff,b#3a45b8',[".....k","....kh","...khh","kkkkkk",".kssss",".ksess","..kppp",".kpppc",".kpppp",".kppbb",".kppbb",".kkkkk"]);
mk('h2','k#14101f,g#2fb36b,d#1b7a47,s#ffd2a6,e#14101f,c#9be8b8,b#8a5a2b',["..kkkk",".kgggg","kgggss","kggsss","kgsess",".kgsss","..kggg",".kgggc",".kgddd",".kgddd",".kbbk.",".kkkk."]);
mk('m0','k#14101f,a#3fb6ff,b#1f6fd1,c#a6e6ff,w#fff',["......","......","....kk","..kkcc",".kcaaa",".kcaaa","kcawka","kaaaaa","kaaaaa","kabbbb",".kbbbb","..kkkk"]);
mk('m1','k#14101f,a#8a4dff,b#4b2a99,c#c9a6ff,e#ff4d6a,w#fff',["......","......","......","......","k...k.","kk..ka","kbkkaa","kbbkae","kbbbka",".kbbka","..kbka","...kkw"]);
mk('m2','k#14101f,w#ecebf5,b#9ea0b8,e#ff4d6a',["......","..kkkk",".kwwww","kwwwww","kwwkkw","kwwkkw","kwwwww",".kwwbw",".kbwkw","..kwkw","..kkkk","......"]);
mk('m3','k#14101f,a#8a8f9c,b#575c6b,c#c3c8d4,e#ffd24d',["......","..kkkk",".kcccc",".kcaee",".kaaaa","kkkaaa","kccaaa","kcaabb","kaabbb","kkabbb","..kaab","..kkkk"]);
mk('b0','k#14101f,a#e0364a,b#8c1030,c#ff8a9a,e#ffe14d,w#fff,h#f2f0d0',[".h....",".hh...",".hkkkk",".kaaaa","kaaekk","kaaaaa","kaawww",".kabbb","kkabbb","kaabbb",".kabbb",".kkkkk"]);
mk('b1','k#14101f,a#7a3cff,b#4a1fa8,c#c7a6ff,w#fff,e#ff2d55',["..kkkk",".kcaaa","kcaaaa","kaawww","kawwke","kawwke","kaawww","kaaaaa",".kabbb",".kabbb",".kk.kb",".k..k."]);
