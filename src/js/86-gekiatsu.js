/* ---------- 激アツ演出パック (fx/feature) ----------
   1) 擬似連: 回転開始直後にリールが一旦止まり「NEXT ×2〜×4」で再始動(回数が多いほど当たりやすい)
   2) 復活演出: 当たりの一部で、3列目が一度ハズレ目で止まり → 「復活!!」で再回転して当たり目に
   3) RUSHリザルト: RUSH終了時に 連チャン数 / RUSH中の獲得ゴールド(カウントアップ) / 最高記録 を表示
   startSpin / updSpin / bigHit / update / drawB をラップする(本体は変更しない)。
   当否・図柄・抽選は一切変えない(見せ方とタイミングだけ)。例外は握りつぶしてゲームを止めない。 */
const GK={rs:null,rr:null,pop:null,best:0,lg:0,tk:0,fin:0};
const GKC=['#fff','#fff','#33dd66','#ff2244','#ffd400'];
try{GK.best=+(JSON.parse(localStorage.getItem('pachi2_gk')||'{}').best)||0}catch(e){}
function gkPick(w){let r=Math.random(),i=0;while(i<w.length-1&&r>=w[i]){r-=w[i];i++}return i}
function gkPop(t,c,big){GK.pop={t0:T,t,c,big:!!big}}
function gkFake(){const a=Math.floor(Math.random()*10);let b=(a+1+Math.floor(Math.random()*8))%10,c=(b+1+Math.floor(Math.random()*8))%10;if(c==a)c=(c+1)%10;if(c==b)c=(c+1)%10;return[a,b,c]}
function gkChime(k){try{if(!sOK())return;const t=sNow();for(let j=0;j<=k;j++)tone(660*Math.pow(1.26,j),t+j*.055,.12,'square',.028);if(k>=3)tone(1760,t+(k+1)*.055,.3,'sawtooth',.02,2640)}catch(e){}}
// 回転開始時に演出を仕込む(RUSH中はテンポ優先で擬似連/復活なし)
{const _st=startSpin;startSpin=function(){const was=sp,r=_st.apply(this,arguments);try{const s=sp;if(!was&&s&&!s.gk){s.gk=1;if(G.rush<=0){
  const w=s.hit?[.42,.3,.18,.1]:s.type?[.72,.2,.07,.01]:s.yk?[.82,.14,.04,0]:[.95,.045,.005,0];
  s.pzN=gkPick(w);s.pzI=0;s.pzF=null;if(s.hit&&!s.jp&&s.type&&Math.random()<.25)s.rv=1}}}catch(e){}return r}}
// 擬似連の1サイクル(約1.15秒): 回転 → 3列が順に停止(バラけ目) → NEXT!! → 再始動
function gkPz(s,dt){if(!s.pzF){s.pzF=gkFake();s.pzT=0;s.pzP=[s.ph[0],s.ph[1],s.ph[2]];s.pzS=0;s.pzX=0}s.pzT+=dt;const t=s.pzT,st=[.5,.62,.74];
  for(let i=0;i<3;i++){if(t>=st[i]){if(!(s.pzS>>i&1)){s.pzS|=1<<i;try{seReelStop(i)}catch(e){}}reelShow(i,s.pzF[i],0)}else{s.pzP[i]+=dt*14;reelShow(i,Math.floor(s.pzP[i])%10,1,s.pzP[i])}}
  if(t>=.8&&!s.pzX){s.pzX=1;const k=s.pzI+2,c=GKC[Math.min(k,4)];banner('擬似連 ×'+k,c);showMsg('NEXT!! ×'+k,c);gkPop('NEXT ×'+k,c,k>=3);gkChime(k);if(k>=3)kyuin(k,c);if(k>=4){flash(c);shake()}}
  if(t>=1.15){s.pzI++;s.ph=s.pzP.slice();s.pzF=null;try{seSpin()}catch(e){}}}
// 復活: 3列目を一度ハズレ目で止め、溜めてから再回転 → 本来の当たり目で停止(以降は本体の処理に戻す)
function gkRv(s,dt){s.rvT+=dt;const t=s.rvT;
  if(t<1){reelShow(2,s.rvW,0);return}
  if(!s.rvB){s.rvB=1;s.rvP=s.rvW;banner('復活!!','#ffd400');showMsg('復活!!','#ffd400');gkPop('復活!!','#ffd400',1);kyuin(6,'#ffd400');flash('#fff');shake();gkChime(4)}
  if(t<1.7){s.rvP+=dt*18;reelShow(2,Math.floor(s.rvP)%10,1,s.rvP);return}
  s.rv=3;s.t=s.stop[2];try{seReelStop(2)}catch(e){}}
{const _up=updSpin;updSpin=function(dt){const s=sp;try{
  if(s&&s.pzN>0&&s.pzI<s.pzN){gkPz(s,dt);return}
  if(s&&s.rv==1&&s.t+dt*s.sc>=s.stop[2]){s.rv=2;s.rvT=0;s.rvB=0;s.rvW=(s.f[2]+1+Math.floor(Math.random()*8))%10;try{seReelStop(2)}catch(e){}showMsg('はずれ…','#9aa0c8')}
  if(s&&s.rv==2){gkRv(s,dt);if(s.rv==2)return}
}catch(e){if(s){s.pzN=0;if(s.rv==2){s.rv=3;s.t=s.stop[2]}}}return _up.apply(this,arguments)}}
// RUSHの連チャン数と獲得ゴールドを集計
{const _bh=bigHit;bigHit=function(jp){try{if(!GK.rs){GK.rs={n:0,g:0,k:0,jp:0};GK.lg=G.gold}GK.rs.n++;if(jp)GK.rs.jp=1}catch(e){}return _bh.apply(this,arguments)}}
{const _kl=kill;kill=function(){const r=_kl.apply(this,arguments);try{if(GK.rs)GK.rs.k=(GK.rs.k||0)+1}catch(e){}return r}}
// ランク評価: スコア = 連チャン×12 + RUSH中の撃破×3 + JACKPOT 20 → C/C+/B/B+/A/A+/S/S+
function gkScore(R){return R.n*12+(R.k||0)*3+(R.jp?20:0)}
const GKGR=[[85,'S+',null],[66,'S','#ffd400'],[52,'A+','#ff3a6a'],[40,'A','#ff5a7a'],[30,'B+','#3a9aff'],[22,'B','#5ab0ff'],[15,'C+','#b0b8e0'],[0,'C','#9aa0c8']];
function gkGrade(sc){const g=GKGR.find(r=>sc>=r[0]);return [g[1],g[2]]}
function gkTrack(){const d=G.gold-GK.lg;GK.lg=G.gold;if(GK.rs){if(d>0)GK.rs.g+=d;
    if(G.rush<=0&&!G.roul&&!(G.jp>0)){const n=GK.rs.n,g=GK.rs.g,k=GK.rs.k||0,jp=GK.rs.jp||0,rec=n>GK.best&&n>=2;GK.rs=null;
      if(rec){GK.best=n;try{localStorage.setItem('pachi2_gk',JSON.stringify({best:n}))}catch(e){}}
      GK.rr={t0:T,n,g,k,jp,rec};GK.rr.sc=gkScore(GK.rr);GK.rr.gr=gkGrade(GK.rr.sc)[0];GK.tk=0;GK.fin=0}}
  const R=GK.rr;if(!R)return;const p=T-R.t0;
  if(p<1.2){if(T-GK.tk>.07){GK.tk=T;try{if(sOK())tone(1200+p*900,sNow(),.03,'square',.018)}catch(e){}}}
  else if(!GK.fin){GK.fin=1;try{const G2=R.gr;if(G2[0]=='S'||G2=='A+'){kyuin(G2=='S+'?8:5,'#ffd400');shake()}if(sOK()){const t=sNow();tone(110,t,.25,'sawtooth',.06,55);noise(t,.05,.2,'l');if(typeof sBoom==='function')sBoom(t,R.n>=5?2:R.n>=3?1.3:.7)/* 連チャン数で重さを変える */}}catch(e){}gkChime(R.n>=5?4:R.n>=3?3:2);if(R.n>=3)try{jara()}catch(e){}if(R.rec)banner('NEW RECORD!! '+R.n+'連','#ffd400')}
  if(p>3.8)GK.rr=null}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{gkTrack()}catch(e){GK.rs=null;GK.rr=null}return r}}
// 描画(戦闘キャンバスの上に重ねる)
// 厚みのある文字: 下方向への押し出し(暗色を数層) → 太い黒縁 → 本体 → 上半分のハイライト縁。ctx を指定可(既定は戦闘キャンバス)
function thickTxt(c,t,x,y,px,fill,o){o=o||{};const d=o.d!=null?o.d:Math.max(2,Math.round(px/8)),lw=o.lw||Math.max(5,px/4),b=px<16?0:Math.max(1,Math.round(px/18));c.font=px+'px '+FN;c.lineJoin='round';
  // 押し出し(暗色) → 黒縁(太) → 本体を十字にずらして重ね塗り(疑似ボールド) → 上側に明るい重ね(立体感)
  c.fillStyle=o.ex||'#2a0a3a';c.strokeStyle='#000';c.lineWidth=lw;for(let i=d;i>=1;i--){c.strokeText(t,x+i*.5,y+i);c.fillText(t,x+i*.5,y+i)}
  c.strokeText(t,x,y);c.fillStyle=fill;for(let k=-b;k<=b;k++){c.fillText(t,x+k,y);c.fillText(t,x,y+k)}
  if(b){c.save();c.globalAlpha*=.45;c.fillStyle=o.hi||'#fff';c.fillText(t,x,y-b);c.restore();c.fillStyle=fill;c.fillText(t,x,y+b*.5)}}
function gkTxtR(t,x,y,px,c,s){thickTxt(bc,t,x,y,px,c)}
// RUSHリザルトは従来の描き方(細めの黒縁)に戻す(ユーザー要望)
function gkTxtR(t,x,y,px,c){bc.font=px+'px '+FN;bc.strokeStyle='#000';bc.lineWidth=Math.max(3,px/5);bc.strokeText(t,x,y);bc.fillStyle=c;bc.fillText(t,x,y)}
function gkRank(n){return n>=10?['LEGEND!!!',null]:n>=5?['EXCELLENT!!','#ff2d7a']:n>=3?['GREAT!!','#ffd400']:n>=2?['NICE!','#7ff3ff']:['GOOD!','#9aff9a']}
function gkDraw(t){const P=GK.pop;
  if(P){const p=t-P.t0;if(p>.85)GK.pop=null;else{const s=p<.12?2.4-p/.12*1.4:1;bc.save();bc.translate(180,P.big?66:70);bc.scale(s,s);bc.globalAlpha=Math.min(1,(.85-p)*4);bc.textAlign='center';gkTxtR(P.t,0,0,P.big?34:26,P.c);bc.restore()}}
  const R=GK.rr;if(!R)return;const p=t-R.t0,a=Math.min(1,p*5,(3.8-p)*2.5);if(a<=0)return;
  bc.save();bc.globalAlpha=a;bc.fillStyle='rgba(10,4,30,.84)';bc.fillRect(0,28,360,96);bc.fillStyle='#ffd400';bc.fillRect(0,28,360,2);bc.fillRect(0,122,360,2);
  bc.textAlign='center';gkTxtR('RUSH RESULT',180,44,12,'#ffd400');
  const q=Math.min(1,p/1.2),e=1-Math.pow(1-q,3),gs='+'+fmt(Math.floor(R.g*e))+' G',s=p<.18?1.8-p/.18*.8:1;
  {const rk=gkRank(R.n),rc=rk[1]||'hsl('+Math.floor(t*90)%360+',100%,62%)';
  bc.save();bc.translate(140,78);bc.scale(s,s);gkTxtR(R.n+'連チャン',0,0,30,rc);bc.restore();
  gkTxtR(rk[0]+'  撃破'+(R.k||0)+(R.jp?'  JACKPOT':''),140,96,11,rc);
  gkTxtR(gs,140,116,18,q>=1?'#fff3a0':'#fff');
  // ランク(カウントアップ後にスタンプ)
  if(p>1.25&&R.gr){const g2=gkGrade(R.sc),gp=p-1.25,gs2=gp<.12?3-gp/.12*2:1,gc=g2[1]||'hsl('+Math.floor(t*200)%360+',100%,62%)';
    bc.save();bc.translate(306,92);bc.rotate(-.12);bc.scale(gs2,gs2);bc.globalAlpha*=Math.min(1,gp*8);
    bc.strokeStyle=gc;bc.lineWidth=3;bc.strokeRect(-36,-40,72,56);bc.strokeStyle='#000';bc.lineWidth=1;bc.strokeRect(-38,-42,76,60);
    gkTxtR('RANK',0,-28,9,gc);if(typeof thickTxt==='function')thickTxt(bc,R.gr,0,8,R.gr.length>1?36:44,gc,{d:3,lw:7});else gkTxtR(R.gr,0,8,40,gc);bc.restore()}}
  if(R.rec&&p>1.2&&Math.floor(p*3)%2==0)gkTxtR('NEW RECORD!',300,118,10,'#ff2d7a');
  bc.restore()}
{const _d=drawB;drawB=function(t){const r=_d.apply(this,arguments);try{gkDraw(t)}catch(e){GK.pop=null;GK.rr=null}return r}}
