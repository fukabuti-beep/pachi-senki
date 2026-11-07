/* ---------- SEフック (sound担当) ----------
   他担当のファイルを編集せずに効果音を差し込むため、読み込み時に既存のグローバル関数を「包む」。
   元の関数は必ず同じ引数で呼ばれ、戻り値もそのまま返す。音側の例外は握りつぶす(ゲームを止めない)。
   対象関数が存在しない/名前が変わった場合は何もしない(その場面は従来のbeepだけになる)。
   sup:true の間は beep() を無効化(既存の単調なbeepを新SEで置き換えるため)。 */
function sndHook(name,pre,post,sup){
  const g=typeof window!=='undefined'?window:globalThis,o=g[name];
  if(typeof o!=='function'||o.__snd)return;
  const w=function(){
    if(!AC||SND.m)return o.apply(this,arguments);
    let ctx;try{if(pre)ctx=pre.apply(null,arguments)}catch(e){}
    if(sup)SND.sup++;
    let r;try{r=o.apply(this,arguments)}finally{if(sup)SND.sup--}
    try{if(post)post(ctx,arguments,r)}catch(e){}
    return r;
  };
  w.__snd=1;
  try{g[name]=w}catch(e){}
}
sndHook('spawn',null,()=>{if(isBoss())seBoss()});
sndHook('kill',()=>{if(isBoss())seBossDown();else seKill(false)},null,true);
sndHook('hurt',(x,col,b,crit)=>{if(crit)seCrit();else seHit(b)});
sndHook('bigHit',jp=>seWin(!!jp),null,true);
sndHook('jackpot',()=>seJackpot());
sndHook('pkHit',null,()=>seCombo(cmb),true);
sndHook('onChucker',()=>G.q,q0=>{if(G.q>q0)sePend(G.q)});
sndHook('cutin',()=>seCut(),null,true);
sndHook('awaken',()=>seAwaken());
sndHook('golden',()=>seGold());
sndHook('startSpin',()=>!!sp,was=>{if(!was&&sp)seSpin()});
// 回転: リール停止音(カチッ) + リーチ中の3列目の減速ティック + リーチ発展の段階音(SUPERは3段、通常リーチは1段)
let sRS={s:null,k:0,tk:-9};
sndHook('updSpin',()=>{const s=sp;return s?{s,t:s.t,f:Math.floor(s.ph[2])}:null},c=>{
  if(!c)return;const s=c.s;
  for(let i=0;i<3;i++)if(c.t<s.stop[i]&&s.t>=s.stop[i])seReelStop(i);
  if(s.type&&s.t>=1.9&&s.t<s.stop[2]){
    if(sRS.s!==s)sRS={s,k:0,tk:-9};
    const p=(s.t-1.9)/Math.max(.1,s.stop[2]-1.9),th=s.type===2?[.28,.55,.8]:[.5];
    while(sRS.k<th.length&&p>=th[sRS.k]){seReachStage(sRS.k+1,s.type===2);sRS.k++}
    if(Math.floor(s.ph[2])!==c.f&&AC.currentTime-sRS.tk>.07){sRS.tk=AC.currentTime;seReelTick(p)}
  }
});
// 予告バナー/メッセージの文言から音を決める(文言が変わったら無音になるだけ)
sndHook('banner',t=>{
  t=String(t);let m;
  if(/激アツ確定/.test(t))seYk(4);else if(/激アツ/.test(t))seYk(3);else if(/チャンス!!/.test(t))seYk(2);else if(/チャンス/.test(t))seYk(1);
  else if(/RARE/.test(t))seRare();else if(/NEW 強化/.test(t))seUnlock();else if(m=/(\d+) COMBO/.exec(t))seMile(+m[1]);
});
sndHook('showMsg',t=>{t=String(t);if(/REACH|リーチ/.test(t))seReach(/SUPER/.test(t));else if(/RUSH終了/.test(t))seRushEnd()});

/* --- 押せ!!(29-push.js): 開始で煽りアルペジオ、押下で決定音。DOUBLE UP の当落音は押下後の #rr の文言から決める --- */
(function(){
  if(typeof pushPrompt!=='function'||pushPrompt.__snd)return;
  const o=pushPrompt,dbl=()=>{try{return !!(typeof RL!=='undefined'&&RL&&RL.hold)}catch(e){return false}};
  pushPrompt=function(cb,opt){
    let c2=cb;
    try{if(typeof cb==='function'&&dbl())c2=function(){const r=cb.apply(this,arguments);try{if(AC&&!SND.m){const t=String($('rr').textContent);if(/DOUBLE!!/.test(t))seDoubleWin();else if(/残念/.test(t))seDoubleLose()}}catch(e){}return r}}catch(e){}
    const was=PUSH,r=o.call(this,c2,opt);
    try{if(PUSH&&!was&&AC&&!SND.m)seAori((opt&&opt.ms)||2400,!!(opt&&opt.small))}catch(e){}
    return r;
  };
  pushPrompt.__snd=1;
})();
sndHook('pushPress',()=>PUSH&&!PUSH.done?{small:PUSH.small}:null,c=>{if(c)seDecide(c.small)});
// ルーレット: 仕切りを通る度の「カッ」と停止時の結果音(元の beep は置き換え)
sndHook('updRoul',()=>RL?{l:RL.last,ph:RL.ph}:null,c=>{
  if(!c||!RL||c.ph!==0)return;
  if(RL.ph===0){if(RL.last!==c.l)seRoulTick(Math.min(1,RL.t/4.6))}else if(RL.ph===1)seRoulResult(RL.m);
},true);
// ミニゲーム(85/95): 開始・ティック・コイン・結果
sndHook('mini',null,()=>seGen('start'),true);
sndHook('mg2Start',null,()=>seGen('start'),true);
sndHook('mg2Coin',null,()=>seGen('coin'),true);
sndHook('mg2Tap',null,null,true);
sndHook('mg2Pick',i=>(typeof MG2!=='undefined'&&MG2&&!MG2.s)?MG2.ch[i]:0,x=>{if(x)seGen(x>=12?'great':x>=5?'good':'ok')},true);
sndHook('mg2Fin',()=>(typeof MG2!=='undefined'&&MG2&&!MG2.s)?Math.min(MG2.n,80):-1,n=>{if(n>=0)seGen(n>=40?'great':n>=15?'good':'ok')},true);
sndHook('stopMG',()=>{if(typeof MG==='undefined'||!MG||MG.s)return 0;const d=Math.abs(MG.x-.5);return d<.06?10:d<.2?4:1.5},m=>{if(m)seGen(m>=10?'great':m>=4?'good':'ok')},true);
sndHook('updMG',()=>(typeof MG!=='undefined'&&MG&&!MG.s)?Math.floor(MG.x*12):-1,k=>{if(k>=0&&typeof MG!=='undefined'&&MG&&!MG.s&&Math.floor(MG.x*12)!==k)seGen('tick',1-Math.abs(MG.x-.5)*2)});
