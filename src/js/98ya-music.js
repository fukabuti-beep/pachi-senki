// @full  (完全版だけ。体験版のビルドには入らない)
// FULL_FEAT: 音楽室
/* ---------- 音楽室 (feature, 完全版) ----------
   メニュー「集める」→「音楽室」。聞いたことのある曲(進み具合で解放)から、ふだん(通常時)に流す曲を選べる。
   ・選んだ曲は「通常の曲(n/n2/n3/n4)」が流れる場面だけ差し替える。ボス/RUSH/FEVER/JACKPOT/緊張/ボーナスタイム/タイトルは そのまま(演出の盛り上がりは変えない)。
   ・「おまかせ」に戻せる。ラップ: bgmState(一番外側)。セーブ: localStorage['pachi2_music'] = {sel}。転生で残る。 */
const MRL=[['n','旅立ちの草原',()=>1,''],['n2','陽気な行進',()=>X.best>=10,'STAGE 10'],['n3','凍てつく風',()=>X.best>=20,'STAGE 20'],['n4','果ての地へ',()=>X.best>=35,'STAGE 35'],
  ['b','強敵あらわる',()=>X.best>5,'ボスを倒す'],['b2','主との決戦',()=>X.best>=20,'STAGE 20'],['f','FEVER',()=>X.best>=10,'STAGE 10'],['r','RUSH',()=>(X.st.hit||0)>=1,'大当たり 1回'],
  ['j','JACKPOT',()=>(X.st.jp||0)>=1,'JACKPOT 1回'],['tt','タイトル',()=>1,'']];
const MR={sel:''};
try{const v=JSON.parse(localStorage.getItem('pachi2_music')||'{}').sel;if(typeof v==='string'&&MRL.some(m=>m[0]===v))MR.sel=v}catch(e){}
const mrOpen=id=>{const m=MRL.find(m=>m[0]===id);try{return !!(m&&SONGS[id]&&m[2]())}catch(e){return false}};
function mrSet(id){if(id&&!mrOpen(id)){fxToast('まだ聞いたことのない曲','#aaa');return false}MR.sel=id||'';try{localStorage.setItem('pachi2_music',JSON.stringify({sel:MR.sel}))}catch(e){}try{if(fxOpen)fxMenu()}catch(e){}return true}
{const o=bgmState;bgmState=function(){const s=o.apply(this,arguments);try{if(MR.sel&&/^n\d?$/.test(s)&&mrOpen(MR.sel))return MR.sel}catch(e){}return s}}
function mrMenu(){const n=MRL.filter(m=>mrOpen(m[0])).length;
  let h='<div class="fxh">音楽室 '+n+'/'+MRL.length+'</div><div class="fxs">ふだん流れる曲を選べる(ボス・RUSH・JACKPOT などの曲は そのまま)</div><div class="mrl">'+
    '<button type="button" class="mrb'+(MR.sel?'':' on')+'" onclick="mrSet(\'\')"><span>おまかせ(ステージに合わせる)</span><small>'+(MR.sel?'':'選択中')+'</small></button>';
  for(const m of MRL){const op=mrOpen(m[0]),on=MR.sel===m[0];h+='<button type="button" class="mrb'+(on?' on':'')+(op?'':' lk')+'" onclick="mrSet(\''+m[0]+'\')"><span>'+(op?m[1]:'???')+'</span><small>'+(on?'選択中':op?'':m[3])+'</small></button>'}
  return h+'</div>'}
FM.push({n:'音楽室',r:mrMenu});
try{if(typeof FMGRP!=='undefined'){const g=FMGRP.find(x=>x.n==='集める');if(g&&g.t.indexOf('音楽室')<0)g.t.push('音楽室')}}catch(e){}
