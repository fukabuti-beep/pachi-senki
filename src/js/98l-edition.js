/* ---------- 体験版の上限と完全版の案内 (feature) ----------
   体験版(EDITION='free'、01-edition)は STAGE FREE_MAX(エリア7の主)まで。主を倒しても STAGE はそこで止まり(同じボスを繰り返し倒せる=放置は続く)、
   最初の1回は「体験版はここまで」の案内、以降はトーストで知らせる。メニュー「その他」に「完全版」タブ(体験版のみ)。
   タイトルに 体験版/完全版 の札。完全版の中身の一覧 FULL_FEATS は体験版にも入る(@full のファイルは体験版に入らないため、ここに書く)。 */
const FULL_FEATS=[
  ['最後のエリア「終焉の虚空」','STAGE 176〜200。体験版では行けない 最後の舞台'],
  ['魔王 虚無の王ニヒラ','エリアの主の最後の1体と 形態変化、AREA CLEAR の先へ'],
  ['物語の最終章','虚無の王との決着、解き放たれる光、そしてエンディング'],
  ['2周目(STAGE 201〜)','強くなった敵と 終わりのない記録更新。転生の魂も さらに稼げる'],
  ['4人目の英雄 ツララ','氷の中で100年眠っていた槍使い。ボスの装甲をつらぬく。完全版だけの衣装「光の衣」なども'],
  ['音楽室','聞いたことのある曲から、ふだん流す BGM を選べる'],
  ['無限の塔','ボスと次々に戦う 連続バトル。1階20秒、記録更新で魔石・宝石、10階ごとに永続のダメージ強化'],
  ['これからの追加コンテンツ','完全版は アップデートで 新しい遊びを どんどん追加していきます']];
const ED={told:0,n:0};
function edFullHtml(){return '<div class="fxh">完全版のご案内</div><div class="fxs">体験版は <b>STAGE '+FREE_MAX+'(エリア'+Math.ceil(FREE_MAX/25)+')</b>まで遊べます。<br>完全版では、この続きが全部遊べます。</div>'+
  '<div class="fxl">'+FULL_FEATS.map(f=>'<div class="ok"><span><b>'+f[0]+'</b><br><small>'+f[1]+'</small></span></div>').join('')+'</div>'+
  '<div class="fxs">体験版のセーブは そのまま引き継げます(メニュー「その他」→「セーブ」の引き継ぎコードを、完全版で読み込むだけ)。</div>'+
  (typeof BOOTH_URL!=='undefined'&&BOOTH_URL?'<button type="button" class="fxb" onclick="edOpenShop()">BOOTH で完全版を見る</button>':'')}
function edOpenShop(){try{if(typeof window!=='undefined'&&window.open)window.open(BOOTH_URL,'_blank','noopener')}catch(e){}}
if(!IS_FULL){
  {const _k=kill;kill=function(){const r=_k.apply(this,arguments);try{if(G.stage>FREE_MAX){G.stage=FREE_MAX;spawn();ED.n++;
      // 体験版の終点(宙域の主)を倒した会話は体験版でも出す(docs/STORY.md: 話を途切れさせない)。ステージが進まないので物語側では拾えない
      if(!ED.told){try{if(typeof styQueue==='function'&&typeof TS!=='undefined'&&!TS.s.b6)styQueue('b6')}catch(e){}}
      if(!ED.told){ED.told=1;presLater(()=>{try{fxShow(edFullHtml(),[['このまま遊ぶ',null,'g']])}catch(e){}},2600)}
      else if(ED.n%3===0)fxToast('体験版はここまで! 続きは完全版で','#ffd400')}}catch(e){}return r}}
  FM.push({n:'完全版',r:edFullHtml});
  try{if(typeof FMGRP!=='undefined'){const g=FMGRP.find(q=>q.n==='その他');if(g&&g.t.indexOf('完全版')<0)g.t.unshift('完全版')}}catch(e){}
  // 起動時に上限を超えたセーブ(完全版から持ってきた等)は上限に合わせる
  try{if(G.stage>FREE_MAX){G.stage=FREE_MAX;spawn()}}catch(e){}
}
/* タイトルの札 */
try{if(typeof document!=='undefined'&&document.createElement){const ov=$('ov');if(ov&&ov.appendChild){const b=document.createElement('div');b.id='edb';b.className=IS_FULL?'full':'free';b.textContent=IS_FULL?'完全版':'体験版';ov.appendChild(b)}}}catch(e){}
