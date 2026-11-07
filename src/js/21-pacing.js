/* ---------- pacing: ハマり救済(天井) / SP・必殺技の間隔制御 ---------- */
// DRY = 通常時にスタート口へ入ったのに当たらなかった回数(=ハマり回転数)。当たる/RUSH中はリセット。
let DRY=0,DRYMAX=0,HEAT=0,LU=-99;
const heat=()=>DRY<=BAL.pityStart?0:Math.min(1,(DRY-BAL.pityStart)/(BAL.pityEnd-BAL.pityStart));
// 当選抽選(onChucker から)。RUSH中は固定確率。通常時は pityStart を超えたら確率が二次曲線で上がり、pityEnd で確定(天井)。
function hitRoll(){let p;HEAT=0;
 if(G.rush>0)p=BAL.rushP;
 else{HEAT=heat();p=hitP();p+=(1-p)*HEAT*HEAT;if(DRY>=BAL.pityEnd)p=1}
 const h=Math.random()<p;
 if(h)DRY=0;
 else if(G.rush<=0){DRY++;if(DRY>DRYMAX)DRYMAX=DRY;if(DRY==BAL.pityStart+1)banner('チャンスゾーン!','#4af')}
 return h}
// 予告レベル: ハマるほど「当たりの予告」は熱く、はずれの予告もたまに「チャンス」まで上がる(激アツ以上ははずれに出さない)
function heatYk(h){let c=ykLv(h);if(HEAT>0){if(h)c=Math.max(c,1+Math.ceil(HEAT*3));else if(Math.random()<HEAT*.6)c=Math.max(c,Math.min(c+1,2))}return c}
// SPゲージ加算 / 必殺技の最小間隔(ゲージが満タンでも直前の必殺技からこの秒数は発動しない)
function spAdd(x){G.sp=Math.min(100,G.sp+x)}
const ultReady=()=>T-LU>=BAL.ultMin;
