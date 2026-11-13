/* ---------- 効果音の追加(操作・攻撃・買い物) (sound) ----------
   作り手の指摘「ゲーム全体の SE」: 音が無かった所を埋める。どれも短く小さめ(主役は大当たりの音)。AC が無い/ミュート中は鳴らない。
   ・ボタンを押した音 `seUi(kind)`: 画面のどのボタンでも(タブ/決定/閉じる で高さを変える)。document の click を1か所で聞く
   ・攻撃の振り `seSwing(i)`: 剣=風を切る音 / 杖=きらめき / 弓=弦の音 / 槍(98yb が呼ぶ)=鋭い突き。鳴らしすぎない(同じ英雄は0.2秒、全体で0.07秒あける)
   ・買い物の成功 `seBuy()`: ゴールド・魔石・宝石・魂のどれかが減った時に「チャリン」(強化/鍛冶屋/勲章/祭壇/衣装など共通)。元の単調な beep は消す
   ・命中の音は 77 の seHit を英雄ごとの音色に(78 のフックが色を渡す) */
let sUiT=-9,sSwT=-9,sByT=-9;const sSwH=[-9,-9,-9,-9];
function seUi(kind){if(!sOK())return;try{const t=AC.currentTime;if(t-sUiT<.05)return;sUiT=t;
  if(kind==='x'){tone(520,t,.05,'square',.022,390)}                                  // 閉じる・やめる: 下がる
  else if(kind==='ok'){tone(880,t,.05,'square',.026);tone(1320,t+.045,.08,'square',.024)}   // 決定: ピポッ
  else if(kind==='tab'){tone(990,t,.035,'triangle',.03)}                               // タブ: 軽く
  else{tone(760,t,.04,'square',.022,880)}}catch(e){}}
/* 攻撃の振りは数が多い。①声の数の枠(sVok)を使わずに直接鳴らす(枠を埋めると BGM や大事な SE が間引かれる)
   ②ゲームの乱数 Math.random を使わない(75 の sNs は雑音の開始位置に乱数を使うので、ここでは時刻から決める。乱数を使うと当たりの出方がずれる) */
function seSwing(i){if(!sOK())return;try{const t=AC.currentTime;if(t-sSwH[i]<.2||t-sSwT<.07)return;sSwH[i]=sSwT=t;const v=G.rush>0?.6:1,to=(f,a,d,ty,vv,f2)=>sVo(f,a,d,ty,vv,{f2}),nz=(a,vv,d)=>{const b=AC.createBufferSource(),g=AC.createGain();sGr();b.buffer=SNB;g.gain.setValueAtTime(Math.max(vv,.0002),a);g.gain.exponentialRampToValueAtTime(.0001,a+d);b.connect(g);g.connect(sDst('se'));b.start(a,(a*.37)%.4,d+.02)};
  if(i===0){nz(t,.035*v,.09);to(900,t+.06,.09,'sawtooth',.014*v,220)}
  else if(i===1){to(1568,t+.05,.06,'sine',.02*v);to(2093,t+.09,.07,'sine',.018*v);to(2637,t+.13,.09,'sine',.014*v)}
  else if(i===2){to(330,t+.07,.05,'triangle',.035*v,165);nz(t,.012*v,.03)}
  else{to(1200,t+.06,.07,'sawtooth',.016*v,2400);nz(t,.02*v,.05)}}catch(e){}}
function seBuy(){if(!sOK())return;try{const t=AC.currentTime;if(t-sByT<.06)return;sByT=t;tone(1319,t,.05,'square',.03);tone(1760,t+.05,.06,'square',.03);tone(2637,t+.1,.12,'triangle',.028)}catch(e){}}
sndHook('heroAtk',i=>seSwing(i));
/* 買い物: 資源の合計が減ったら成功。beep は消す(sup) */
{const st=()=>{let a=0;try{a=G.gold}catch(e){}let b=0;try{if(typeof RES!=='undefined')b=RES.ms+RES.gem*1000}catch(e){}let c=0;try{if(typeof SOUL!=='undefined')c=SOUL.spent}catch(e){}return [a,b,c]};
  const used=(p,q)=>q[0]<p[0]||q[1]<p[1]||q[2]>p[2];
  for(const n of ['buy','hupBuy','smithUp','smithBuff','soulBuy','gsBuyM','gsBuyB','gsBuyC','gsBuyTurbo','skSet','lnBuy','kujiDraw'])sndHook(n,()=>st(),p=>{if(p&&used(p,st()))seBuy()},true)}
/* ボタンの音: 1か所で聞く(ゲーム開始後だけ。押せ!!や盤面のタップは それぞれの音があるので除く) */
try{document.addEventListener('click',e=>{try{if(!run)return;const b=e.target&&e.target.closest&&e.target.closest('button');if(!b||b.id==='pkB'||b.id==='mib')return;
  const tx=b.textContent||'';seUi(/閉じる|やめる|とばす|OFF/.test(tx)?'x':/する|引く|挑戦|受け取|買う|OK|はい|着る|戻す/.test(tx)?'ok':(b.className||'').indexOf('fxb')>=0?'ok':/tab|fmg|upg|seg/.test((b.className||'')+(b.parentNode&&b.parentNode.className||''))?'tab':'')}catch(x){}},true)}catch(e){}
