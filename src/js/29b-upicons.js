/* 追加強化(23-upgrades2)のアイコン。26-dots の UX.ICNC に足して ic10〜ic14 に描く */
const ICN2={};
ICN2.tap=['.....kyk..','....kyyk..','...kyyk...','..kyyyyyk.','.kyyyyyk..','...kyyk...','..kyyk....','.kyyk.....','.kyk......','..k.......'];
ICN2.trs=['....kk....','...kyyk...','....kk....','..knnnnk..','.knnnnnnk.','knnyyynnnk','knnyYynnnk','knnnnnnnnk','.knnnnnnk.','..kkkkkk..'];
ICN2.inv=['..kkkkkk..','.krrrrrrk.','krwrrrrrrk','krrrkkrrrk','krrkyykrrk','krrkyykrrk','krrrkkrrrk','krrrrrrrwk','.krrrrrrk.','..kkkkkk..'];
ICN2.sup=['...vvvv...','..vppppv..','.vpwppbbv.','vpwpbbccbv','vppbbccggv','vpbbccggyv','vpbccggyyv','.vccggyyv.','..vggyyv..','...vvvv...'];
ICN2.crt=['....kk....','...kyyk...','k.kyrryk.k','kykyrrykyk','.kyrwwryk.','.kyrwwryk.','kykyrrykyk','k.kyrryk.k','...kyyk...','....kk....'];
function upIcons2(){try{['tap','trs','inv','sup','crt'].forEach((k,j)=>{if(!UX.ICNC[k])UX.ICNC[k]=UX.fromMap(ICN2[k]);UX.putIcon('ic'+(10+j),k)})}catch(e){}}
upIcons2();
