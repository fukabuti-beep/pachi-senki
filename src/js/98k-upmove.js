/* ---------- リソースを使う画面は強化ボタンへ (ui) ----------
   作り手の指摘「リソース消費系のタブがメニューにあって分かりにくい。全て強化ボタンからアクセスできるように」。
   強化画面(#sheet)のグループに「宝石ショップ」(98i-gemshop)と「くじ」(96t)を移し、メニューからは外す。
   メニューの「育成」タブ(98i-altar の案内)も、強化画面に全部そろったので外す。
   これで ゴールド=通常強化 / 魔石=鍛冶屋・くじ / 魂=魂の祭壇 / 宝石=宝石ショップ と、使い道がすべて強化ボタンの中にまとまる。
   読み込み順: 98c(UPG を作る)・98i(altar/gemshop が FM に登録)より後。 */
(function(){try{
  const take=n=>{const i=FM.findIndex(m=>m.n===n);if(i<0)return null;return FM.splice(i,1)[0].r};
  const gs=take('宝石ショップ'),kj=take('くじ');take('育成');
  if(gs&&!UPG.list.some(x=>x[0]==='宝石屋'))UPG.list.push(['宝石屋',gs]);
  if(kj&&!UPG.list.some(x=>x[0]==='くじ'))UPG.list.push(['くじ',kj]);
  const bar=$('upg');if(bar)bar.innerHTML=UPG.list.map((g,i)=>'<button type="button" data-g="'+i+'" class="'+(i===UPG.g?'on':'')+'">'+g[0]+'</button>').join('');
  if(bar&&bar.classList)bar.classList.add('upg'+UPG.list.length);
}catch(e){}})();
/* 宝石ショップで買った後は、開いている強化画面を描き直す(元はメニューの再描画だけだった) */
{const o=gsRe;gsRe=function(){const r=o.apply(this,arguments);try{grpRefresh()}catch(e){}return r}}
/* 強化画面のグループを名前で開く(他の画面からの案内用) */
function upOpen(name){try{const i=UPG.list.findIndex(x=>x[0]===name);if(i<0)return;if(typeof fxClose==='function'&&typeof fxOpen!=='undefined'&&fxOpen)fxClose();
  if(!sheetOpen()){const b=$('ubt');if(b&&b.click)b.click()}grpSet(i)}catch(e){}}
