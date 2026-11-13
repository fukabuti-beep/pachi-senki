/* ---------- ボーナスタイムBGM + 遠征/ボーナスタイム/ハイ&ローのSE (sound担当) ----------
   [BGM] ボーナスタイム(98e: 黄金タイム/魔石フィーバー/討伐タイム、40秒)の間だけ、今のステージ帯の通常曲をアレンジして流す。
     アレンジ = テンポ x1.15(上限168) / 全音上に転調 / 4つ打ち+裏拍オープンハット / ベースはオクターブ跳躍 / リードは最初から+3度下ハモリ。
     種類別: 黄金=明るいパルス25-50%のリード+小節末のコイン「チャリン」 / 魔石=細いパルス12.5%のリード+ディレイで響く下降キラキラ
             討伐=ノコギリのベース+重いキック+小節頭のパワーコード。残り5秒は拍ごとに時計の「チッ」。
     優先順位: JACKPOT > 緊張(押せ!!/ルーレット) > RUSH > FEVER > ボーナスタイム > ボス > 通常。
       (bgmState を包み、ボス/通常のときだけボーナス曲に置き換える。SRANK=1.5 なので RUSH/FEVER が来れば即そちらへ、終われば小節頭でボーナス曲へ戻る。
        ボーナス終了で BT.cur が消えると元の通常/ボス曲へ小節頭でクロスフェード)
   [SE] seExp(go|ret|back|big) / seBt(pre|start|end,k) / seHl(start|flip|win|lose|cash|perfect,w)。各ファイルから1行で呼ぶ。
   すべて AC 無し/ミュート時は何もしない。音程は BGM のキー(fanRoot/sLad/sRise)から作る。 */
const BT_RANK=1.5;
function btKind(){try{if(typeof BT!=='undefined'&&BT&&BT.cur&&typeof BTK!=='undefined')return BTK[BT.cur.k].id}catch(e){}return ''}
/* ボーナスタイム用アレンジ曲を作る(ステージ帯 x 種類ごとにキャッシュ) */
function btSong(kind,band){
  const id='bt'+kind+'_'+band;if(SONGS[id])return id;
  const B=SONGS[band]||SONGS.n,atk=kind==='atk',ms=kind==='ms';
  const I=Object.assign({},B,{
    bpm:Math.min(168,Math.round(B.bpm*1.15)),pc:(B.pc+2)%12,sw:(B.sw||0)*.4,tr:.9,ls:[0,0],hr:[1,1],
    lw:ms?['p12','p25']:atk?['p50','p25']:['p25','p50'],hw:ms?'p12':'triangle',aw:ms?'p12':'p25',
    ar:['0.2.4.5.4.2.5.4.','0245024502450245'],
    bs:['r.o.r.o.r.o.r.f.','r.orr.orr.orr.of'],bw:atk?'sawtooth':B.bw,
    dk:atk?['k..kk...k..kk...','k..kk...k..kk.kk']:['k...k...k...k...','k...k...k...k.kk'],
    dh:['x.X.x.X.x.X.x.X.','xxX.xxX.xxX.xxXx'],ds:B.ds,pd:'triangle',
    vol:Object.assign({},B.vol,{pd:(B.vol&&B.vol.pd)||.013,k:((B.vol&&B.vol.k)||.2)*(atk?1.1:1)})});
  delete I.cs;bgPrep(I);
  const W=Object.assign({},I,{cs:btStep,inner:I,kind});
  SONGS[id]=W;SRANK[id]=BT_RANK;return id;
}
function btStep(S,st,t,sd){
  bgStep(S.inner,st,t,sd);
  const bar=(st>>4)&15,k=st&15,r=S.lt+24;
  if(S.kind==='gold'&&(bar&1)&&(k===12||k===14)){const f=mf(r+(k===12?7:12));sVo(f,t,.05,'square',.014,{dest:'bg'});sVo(f*1.5,t+.03,.12,'triangle',.012,{dest:'bg'})}
  else if(S.kind==='ms'&&(bar&1)&&k>=8&&k%2===0){const f=mf(r+(S.minor?[12,10,7,3]:[12,9,7,4])[(k-8)>>1]);sVo(f,t,.09,'sine',.012,{dest:'ld'})}
  else if(S.kind==='atk'&&k===0&&(bar&1)===0){const b=S.lt-12;sVo(mf(b),t,sd*3,'sawtooth',.02,{dest:'bg'});sVo(mf(b+7),t,sd*3,'sawtooth',.016,{dest:'bg'})}
  try{if(BT.cur&&BT.cur.rem<5.2&&k%4===0)sVo(k===0?3136:2637,t,.025,'p12',.018,{dest:'bg'})}catch(e){}
}
/* bgmState を包む: ボス/通常の時だけボーナス曲に(RUSH/FEVER/JACKPOT/緊張はそのまま) */
{const o=bgmState;bgmState=function(){const s=o.apply(this,arguments);try{const kd=btKind();if(kd&&s!=='tn'&&(SRANK[s]||0)<BT_RANK)return btSong(kd,bgBand())}catch(e){}return s}}

/* --- 遠征 --- go=出発(ラッパのファンファーレ) ret=帰ってきた通知(控えめなチャイム) back=受け取り(袋ドサッ+コイン) big=大成功(さらに駆け上がり) */
function seExp(kind){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();
    sBig(()=>{
      if(kind==='go'){
        for(let i=0;i<4;i++)noise(t+i*.045,.03+.01*i,.04,'h'); // 小太鼓のロール
        [[7,0,.08],[7,.1,.08],[7,.2,.08],[12,.3,.32]].forEach(([s,o,d])=>{tone(mf(r+s),t+.18+o,d,'p25',.05);tone(mf(r+s-12),t+.18+o,d,'triangle',.04)});
        tone(mf(r+16),t+.48,.3,'p12',.025);sBoom(t+.48,.7);
      }else if(kind==='ret'){
        [[16,0],[12,.18],[19,.36]].forEach(([s,o])=>{tone(mf(r+s),t+o,.4,'sine',.04);tone(mf(r+s+12),t+o,.12,'p12',.012)});
      }else{ // back / big
        sBoom(t+.9,1.2);noise(t+.9,.05,.12,'w');
        for(let i=0;i<5;i++)tone(mf(sLad(5+i*2)),t+.95+i*.06,.12,'p25',.045);
        if(kind==='big'){
          tone(300,t+1.3,.5,'sawtooth',.03,1800);
          [0,4,7,12,16,19,24].forEach((s,i)=>{tone(mf(r+s+12),t+1.6+i*.06,.13,'p25',.05);tone(mf(r+s),t+1.6+i*.06,.13,'triangle',.04)});
          sBoom(t+2.05,1.6);[0,4,7,12].forEach((s,j)=>sFat(mf(r+s+12),t+2.05,.8,.024,0,j>0));sBell(mf(r+24),t+2.1,.03,.9);
        }
      }
    });
    if(kind==='back'||kind==='big'){seJaraStream(t+1,kind==='big'?1.8:.9,kind==='big'?20:14);sDuck(.3,kind==='big'?2.6:1.5)}
    else if(kind==='go')sDuck(.2,.8);
  }catch(e){}
}

/* --- ボーナスタイム --- pre=5秒前の予告(ピロピロ+小さなライザー) start=種類別ジングル(kyuin(7)+fan の後に鳴る) end=終了の下降音 */
function seBt(kind,k){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();
    sBig(()=>{
      if(kind==='pre'){sePipo(3,r+24,t);tone(400,t,.9,'p12',.018,1600)}
      else if(kind==='start'){
        const id=(typeof BTK!=='undefined'&&BTK[k])?BTK[k].id:'gold',t1=t+.75;
        if(id==='gold'){ // 黄金: コインが跳ねる長調の駆け上がり
          [0,4,7,12,16,19,24,28].forEach((s,i)=>{tone(mf(r+s),t1+i*.07,.12,'p25',.045);if(i%2)tone(mf(r+s+12)*1.003,t1+i*.07+.02,.08,'square',.015)});
          tone(mf(r+24),t1+.6,.6,'sine',.03);
        }else if(id==='ms'){ // 魔石: 細いパルスの下降→上昇、鈴のような余韻
          [24,19,16,12,16,19,24,31].forEach((s,i)=>{tone(mf(r+s),t1+i*.08,.18,'p12',.04);tone(mf(r+s)*2,t1+i*.08,.06,'sine',.015)});
          tone(mf(r+12),t1,.9,'triangle',.035);noise(t1+.6,.02,.4,'m');
        }else{ // 討伐: パワーコードのスタブ x3 + 突撃ラッパ
          [0,.16,.32].forEach((o,i)=>{sFat(mf(r-12),t1+o,.13,.045);sFat(mf(r-5),t1+o,.13,.035,0,1);sBoom(t1+o,.7);noise(t1+o,.05,.06,'w')});
          [[7,.5,.1],[7,.62,.1],[12,.74,.4]].forEach(([s,o,d])=>tone(mf(r+s),t1+o,d,'p25',.05));
        }
      }else if(kind==='end'){[12,7,4,0].forEach((s,i)=>tone(mf(r+s),t+i*.11,.22,'triangle',.04));tone(mf(r+19),t+.44,.3,'p12',.015)}
    });
    if(kind==='start')sDuck(.3,1.6);
  }catch(e){}
}

/* --- ハイ&ロー --- start=カードを切る音 flip=めくる前のドラムロール(0.9秒) win=当たり(w=勝ち数で音程が上がる) lose=ブブー cash=受け取り perfect=3連勝 */
function seHl(kind,w){
  if(!sOK())return;
  try{const t=sNow(),r=fanRoot();w=w|0;
    sBig(()=>{
      if(kind==='start'){for(let i=0;i<7;i++){noise(t+i*.035,.035,.025,'h');tone(1800-i*90,t+i*.035,.02,'p12',.015)}tone(mf(r+12),t+.3,.09,'p25',.045);tone(mf(r+19),t+.38,.18,'p25',.045)}
      else if(kind==='flip'){
        let o=0;for(let i=0;i<10;i++){tone(mf(sRise(3+i)),t+o,.045,'p50',.03);noise(t+o,.02+.002*i,.03,'w');o+=Math.max(.04,.11-.008*i)}
        noise(t+.8,.04,.06,'h');tone(2200,t+.8,.06,'p12',.03,900); // ペラッ
      }else if(kind==='win'){
        const b=5+w*3;for(let i=0;i<2+w;i++)tone(mf(sRise(b+i*2)),t+i*.065,.12,'p25',.05);
        tone(mf(sRise(b+(2+w)*2)),t+(2+w)*.065,.3,'square',.032);sBoom(t,.5+w*.3);sBell(mf(sRise(b+(2+w)*2)),t+(2+w)*.065,.025,.4);
      }else if(kind==='lose'){tone(mf(r-5),t,.16,'sawtooth',.045);tone(mf(r-6),t+.2,.32,'sawtooth',.045,mf(r-8));tone(mf(r-17),t,.5,'triangle',.05)}
      else if(kind==='cash'){for(let i=0;i<3;i++)tone(mf(sLad(6+i*2)),t+i*.07,.12,'triangle',.04)}
      else if(kind==='perfect'){
        sBoom(t,2);sCrash(t,.07,.8);
        [0,4,7,12,16,19,24].forEach((s,i)=>{tone(mf(r+s+12),t+i*.06,.13,'p25',.055);tone(mf(r+s),t+i*.06,.13,'triangle',.04)});
        [0,4,7,12,16].forEach((s,j)=>sFat(mf(r+s+12),t+.5,.9,.022,0,j>0));sBell(mf(r+24),t+.55,.03,1);
      }
    });
    if(kind==='cash')seJaraStream(t+.15,.6,12);
    else if(kind==='perfect'){seJaraStream(t+.3,1.6,20);sDuck(.4,2)}
    else if(kind==='win'&&w>=2)sDuck(.2,.6);
  }catch(e){}
}
