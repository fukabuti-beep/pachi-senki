/* ---------- migrate: 旧バランスのセーブ補正 ----------
   旧バランスで伸びすぎた stage(例: 20分で120)は、新しいHP曲線では倒せず進行が止まる。
   バージョン無し(v<2)のセーブだけ、現在の攻撃力で十分倒せる範囲(HP <= 攻撃力x40)まで stage を戻す。
   強化Lv・ゴールドはそのまま維持する。保存時に v:2 を付けるので補正は一度きり。 */
(function(){let v=0;try{const s=JSON.parse(localStorage.getItem('pachi2')||'null');v=(s&&s.v)||0}catch(e){}
 if(v>=2)return;
 const a=atk()*40;let s=G.stage;while(s>1&&hpOf(s)>a)s--;G.stage=s})();
