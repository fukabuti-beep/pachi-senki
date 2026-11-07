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
sndHook('kill',()=>seKill(isBoss()),null,true);
sndHook('hurt',(x,col,b,crit)=>{if(crit)seCrit();else seHit(b)});
sndHook('bigHit',jp=>seWin(!!jp),null,true);
sndHook('jackpot',()=>seJackpot());
sndHook('pkHit',null,()=>seCombo(cmb),true);
sndHook('onChucker',()=>G.q,q0=>{if(G.q>q0)sePend(G.q)});
sndHook('cutin',()=>seCut(),null,true);
sndHook('awaken',()=>seAwaken());
sndHook('golden',()=>seGold());
sndHook('startSpin',()=>!!sp,was=>{if(!was&&sp)seSpin()});
sndHook('updSpin',()=>{const s=sp;return s?{s,t:s.t}:null},c=>{if(c)for(let i=0;i<3;i++)if(c.t<c.s.stop[i]&&c.s.t>=c.s.stop[i])seReelStop(i)});
// 予告バナー/メッセージの文言から音を決める(文言が変わったら無音になるだけ)
sndHook('banner',t=>{
  t=String(t);let m;
  if(/激アツ確定/.test(t))seYk(4);else if(/激アツ/.test(t))seYk(3);else if(/チャンス!!/.test(t))seYk(2);else if(/チャンス/.test(t))seYk(1);
  else if(/RARE/.test(t))seRare();else if(/NEW 強化/.test(t))seUnlock();else if(m=/(\d+) COMBO/.exec(t))seMile(+m[1]);
});
sndHook('showMsg',t=>{t=String(t);if(/REACH|リーチ/.test(t))seReach(/SUPER/.test(t));else if(/RUSH終了/.test(t))seRushEnd()});
