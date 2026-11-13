/* ---------- 激アツ演出(89d〜89g)用の SE (sound) ----------
   seHy(k,a): k = 'bko'(暗転: 低く沈む+BGMを絞る) / 'rel'(暗転明け a=0ガセ 1リーチ 2SUPER、BGMを戻す)
                 'crack'(スロットにヒビ) / 'shatter'(砕け散る) / 'bigin'(巨大スロット着地) / 'bigstop'(巨大リール停止 a=1 で熱い) / 'bigwin'(揃った)
                 'charge'(超必殺の溜め a=秒) / 'cut'(カットイン) / 'fire'(大技 a=0剣士 1魔法 2弓) / 'hit'(着弾) / 'fail'(不発) / 'pop'(ボタン出現) / 'wave'(ボタンの衝撃波)
   AC が無い/ミュート/失敗でも何もしないで戻る。BGM を絞るのは暗転中だけ(最長でも数秒、hyDuck(0) と applyMix で必ず戻す)。 */
function hyDuck(on){try{if(!AC||typeof SGR==='undefined'||!SGR||SGR.bad||!SGR.bg)return;if(on){const p=SGR.bg.gain,v=bgGain()*.3,t=AC.currentTime;try{p.cancelScheduledValues(t);p.setValueAtTime(p.value,t);p.linearRampToValueAtTime(v,t+.5)}catch(e){p.value=v}}else applyMix()}catch(e){}}
function seHy(k,a){try{if(typeof sOK!=='function'||!sOK())return;const t=sNow();
  switch(k){
  case 'bko':hyDuck(1);sBoom(t,1.2);tone(330,t,.9,'triangle',.05,82);tone(165,t+.05,1.1,'sawtooth',.025,55);noise(t,.03,.9,'l');break;
  case 'rel':hyDuck(0);if(a>=2){tone(220,t,.5,'sawtooth',.04,1760);[523,659,784,1047].forEach((f,i)=>tone(f,t+.18+i*.05,.25,'square',.03));noise(t,.05,.4,'h')}
    else if(a==1){tone(330,t,.35,'square',.035,990);tone(990,t+.3,.2,'square',.025)}else{tone(440,t,.4,'triangle',.03,220)}break;
  case 'crack':tone(2400,t,.05,'square',.03,1200);noise(t,.06,.08,'h');tone(1800,t+.09,.05,'square',.025,900);break;
  case 'shatter':sBoom(t,1.8);noise(t,.06,.6,'l');noise(t,.12,.45,'h');noise(t,.08,.25,'w');for(let i=0;i<8;i++)tone(3200-i*260+sR()*200,t+i*.035,.07,'square',.018);tone(110,t,.3,'sawtooth',.06,40);break;
  case 'bigin':sBoom(t,2);sClunk(t,1.3);tone(80,t,.45,'sawtooth',.06,30);noise(t,.1,.35,'l');tone(392,t+.12,.3,'square',.03,784);break;
  case 'bigstop':sClunk(t,a?1.5:1);if(a)sBoom(t,1);tone(a?110:150,t,.22,'square',.05,a?50:80);noise(t,.07,.12,'l');if(a)tone(1568,t+.05,.25,'square',.03,2093);break;
  case 'bigwin':sBoom(t,2);sCrash(t,.06,.8);[784,988,1175,1568,1976].forEach((f,i)=>tone(f,t+i*.07,.18,'square',.032));sBell(1568,t+.35,.03,.9);tone(392,t,.6,'sawtooth',.03,784);break;
  case 'charge':{const d=Math.max(.3,a||1);sFat(110,t,d,.045,880,1);tone(55,t,d,'sawtooth',.03,110);tone(220,t,d,'square',.02,1760);noise(t,.03,d,'l');break}
  case 'cut':sBoom(t,.8);tone(1175,t,.08,'square',.04);tone(1568,t+.07,.08,'square',.04);tone(2349,t+.14,.25,'square',.035,2637);noise(t,.05,.2,'h');break;
  case 'fire':if(a==0){noise(t,.12,.35,'h');tone(1600,t,.3,'sawtooth',.04,200)}else if(a==1){tone(60,t,.8,'sawtooth',.07,40);noise(t,.1,.8,'l');tone(880,t,.6,'square',.02,110)}
    else{for(let i=0;i<6;i++){tone(2600-i*200,t+i*.05,.08,'square',.02,600)}noise(t,.08,.3,'h')}break;
  case 'hit':sBoom(t,2.5);sCrash(t,.07,.8);tone(70,t,.6,'sawtooth',.07,28);noise(t,.16,.6,'l');noise(t+.05,.08,.3,'h');break;
  case 'fail':sFat(660,t,.12,.03,330,1);tone(330,t+.12,.35,'triangle',.03,110);noise(t+.1,.04,.3,'l');break;
  case 'pop':tone(784,t,.05,'square',.03,1568);tone(1568,t+.05,.06,'square',.025);break;
  case 'wave':sBoom(t,.7);tone(196,t,.18,'square',.04,98);noise(t,.07,.15,'l');tone(1319,t+.02,.12,'square',.025,1760);break}
}catch(e){}}
