// パチ戦記 コア: ゲーム本体のシミュレーション(Web版 40-pachinko / 21-pacing / 50-slot / 30-battle / 60-roulette / 70-show / 87-hitev / 90-extra / 99-main の移植)
// 見た目・音は持たない。演出が必要な所は event で通知し、Unity 側(View)が描画/SE を担当する。
// 座標系は Web版と同じ: 盤面 360x400、戦闘 360x150。時間は秒。
using System;
using System.Collections.Generic;

namespace PachiSenki.Core
{
    public struct Ball { public double x, y, vx, vy; public int g; }   // g: 0=通常 1=手動投入 2=黄金玉
    public struct Peg { public double x, y, r, bounce; public bool bumper; }
    public struct Shot { public int hero; public double t, dmg; public bool crit; }

    public enum HitEventKind { Mini, Roulette, Jackpot }

    /// <summary>スロットの1回転(Web版 sp)</summary>
    public sealed class Spin
    {
        public double t, speed; public int[] faces; public int type; // type 0=はずれ 1=リーチ 2=SUPERリーチ
        public bool hit, jp; public int yk; public double[] stop;
    }

    public sealed class PachiGame
    {
        public const double PW = 360, PH = 400;
        public readonly GameState G = new GameState();
        public readonly IRng Rng;
        public double T;                       // ゲーム時間
        public readonly List<Ball> Balls = new List<Ball>();
        public readonly List<Peg> Pegs = new List<Peg>();
        public readonly List<Shot> Shots = new List<Shot>();
        public readonly List<(bool hit, int yk)> Queue = new List<(bool, int)>();   // 保留(QL)
        public Spin CurrentSpin;
        public bool Blocking;                  // Web版 G.roul(大当たり演出中はスロットを止める)
        public int PegCombo; double pegComboT; // cmb / cmbT
        int dry, dryMax; double heat, lastUlt = -99, emitAcc;
        double eventT = -1; HitEventKind eventKind; double eventBase; bool eventSup; bool pushPause;
        double miniT = -1; int miniM; double miniBase;
        double ultT = -1; int ultHero;

        // ---- 演出用の通知(View が購読) ----
        public event Action<string, string> OnBanner;          // 文言, 色(#rrggbb)
        public event Action<Spin> OnSpinStart, OnSpinEnd;
        public event Action<bool, int> OnBigHit;              // jp, 連チャン数
        public event Action<HitEventKind> OnHitEvent;
        public event Action<int, int> OnRouletteResult;       // 倍率, 超倍率(0=なし)
        public event Action<double> OnJackpot;                // 獲得G
        public event Action<double, bool> OnHurt;             // ダメージ, クリティカル
        public event Action<bool, double> OnKill;             // ボスか, 獲得G
        public event Action<int> OnUlt;                       // 英雄
        public event Action OnFever, OnAwaken, OnGolden, OnRushEnd;
        public event Action<int> OnHeroAttack;
        public event Action OnBossDefeatedMiniGame;           // Web版ではここでミニゲーム(Unity版は後の段階で移植)

        public PachiGame(IRng rng = null) { Rng = rng ?? new SysRng(); BuildBoard(); Spawn(); }

        // ===== 盤面 =====
        void BuildBoard()
        {
            double[][] bump = { new[] { 90.0, 140 }, new[] { 270.0, 140 }, new[] { 180.0, 205 } };
            for (int r = 0; r < 10; r++)
            {
                double y = 40 + r * 29, o = r % 2 == 1 ? 15 : 0;
                for (double x = 15 + o; x < 350; x += 30)
                {
                    bool near = false; foreach (var b in bump) if (Math.Sqrt((b[0] - x) * (b[0] - x) + (b[1] - y) * (b[1] - y)) < 24) near = true;
                    if (!near) Pegs.Add(new Peg { x = x, y = y, r = 3.5, bounce = .55 });
                }
            }
            for (int i = 0; i < 10; i++)
            {
                Pegs.Add(new Peg { x = 20 + i * 14, y = 312 + i * 5, r = 3.5, bounce = .45 });
                Pegs.Add(new Peg { x = 340 - i * 14, y = 312 + i * 5, r = 3.5, bounce = .45 });
            }
            foreach (var b in bump) Pegs.Add(new Peg { x = b[0], y = b[1], r = 9, bounce = 1.15, bumper = true });
        }

        // ===== ステータス式(20-upgrades) =====
        public int LvE(int i) => Math.Min(G.lv[i], Upgrades.All[i].Max);
        public double Cost(int i) { var u = Upgrades.All[i]; if (G.lv[i] >= u.Max) return double.PositiveInfinity; return Math.Floor(u.BaseCost * Bal.costk * Math.Pow(u.Max == Upgrades.Inf ? Bal.costg : Bal.costgCap, G.lv[i] - 1)); }
        public static double HpOf(int s) => Math.Floor(Bal.hp0 * Math.Pow(Bal.hpg, s - 1) * (s % 5 == 0 ? Bal.boss : 1));
        public double Atk() => Bal.atk0 * Math.Pow(Bal.atkg, G.lv[0] - 1) * (G.aw > 0 ? 2 : 1) * (G.fv > 0 ? 1.5 : 1);
        public double Mul() => Math.Pow(Bal.mulg, G.lv[3] - 1);
        public double CritP() => Math.Min(.5, .1 + .03 * (LvE(4) - 1));
        public double Rate() => 2 + .5 * (LvE(1) - 1);
        public double HitP() => Bal.hit0 * (1 + Bal.hitStep * (LvE(2) - 1));
        public double Spm() => 1 + Bal.spStep * (LvE(6) - 1);
        public double Luck() => 1 + .2 * (LvE(5) - 1);
        public double RushExt() => .5 * (LvE(7) - 1);
        public double GoldRate() => (1 + Bal.goldStep * (LvE(8) - 1)) / Bal.goldBase;
        public double FevRate() => (1 + Bal.fevStep * (LvE(9) - 1)) / Bal.fevBase;
        public double EvP() => Bal.evP + Math.Min(.25, .02 * (LvE(12) - 1));
        public double SupP() => Bal.supP + Math.Min(.35, .03 * (LvE(13) - 1));
        public double Cm() => 1 + Math.Min(PegCombo, 50) * .03;
        public bool IsBoss => G.stage % 5 == 0;

        public bool Buy(int i)
        {
            double c = Cost(i); if (G.stage < Upgrades.All[i].UnlockStage || G.gold < c) return false;
            G.gold -= c; G.lv[i]++; return true;
        }

        // ===== 戦闘(30-battle) =====
        public void Spawn() { G.mx = G.hp = HpOf(G.stage); G.hit = 0; if (IsBoss) OnBanner?.Invoke("BOSS出現!", "#ff2d7a"); }
        public void Hurt(double x, bool crit = false)
        {
            if (crit) x *= 3;
            G.hit = crit ? 1.4 : .8; OnHurt?.Invoke(x, crit);
            G.hp -= x; if (G.hp <= 0) Kill();
        }
        void Kill()
        {
            bool boss = IsBoss, rare = Rng.Next() < .12;
            double g = Math.Floor(G.mx * .35 * Mul() * (boss ? 2 : 1) * (rare ? 5 : 1));
            if (rare) OnBanner?.Invoke("RARE DROP!!", "#ffd400");
            G.gold += g; OnKill?.Invoke(boss, g);
            if (boss) OnBossDefeatedMiniGame?.Invoke();
            G.stage++; Spawn();
        }
        void HeroAtk(int i, double m) { Shots.Add(new Shot { hero = i, t = 0, dmg = Atk() * m * Cm(), crit = Rng.Next() < CritP() }); OnHeroAttack?.Invoke(i); }
        void SpAdd(double x) => G.sp = Math.Min(100, G.sp + x);
        void Ult() { lastUlt = T; ultHero = (int)(Rng.Next() * 3); G.sp = 0; ultT = T + .65; OnUlt?.Invoke(ultHero); }

        // ===== 盤面イベント(40-pachinko / 90-extra) =====
        void PegHit(double s, int ballG)
        {
            PegCombo++; pegComboT = 1.6;
            if (PegCombo == 30) { G.aw = 8; OnBanner?.Invoke("覚醒!!", "#22e0ff"); OnAwaken?.Invoke(); }
            if (PegCombo == 10 || PegCombo == 25 || PegCombo == 50 || PegCombo == 100) OnBanner?.Invoke(PegCombo + " COMBO!", "#ffd400");
            if (ballG == 2) Golden();
            SpAdd(s * Bal.spBall * Spm());
        }
        void Golden() { G.gold += Math.Floor(G.stage * 80 * Mul()); Hurt(Atk() * 60, true); OnBanner?.Invoke("黄金玉!!", "#ffd400"); OnGolden?.Invoke(); }
        void OnSide(int g) { PegHit(3, g); Hurt(Atk() * 1.5 * Cm()); }
        void OnAtkPocket(int g) { PegHit(2, g); Hurt(Atk() * 3 * (1 + G.combo * .2) * Cm()); G.gold += Math.Ceiling(G.stage * Mul()); }
        void OnChucker(int g)
        {
            PegHit(6, g);
            if (G.q < 4) { G.q++; bool h = HitRoll(); Queue.Add((h, HeatYk(h))); }
            StartSpin();
        }
        /// <summary>プレイヤーが盤面をタップ(x: 0〜360)</summary>
        public void TapBoard(double x) { if (Balls.Count <= 90) Balls.Add(new Ball { x = x, y = 12, g = 1 }); }

        void StepBalls(double dt)
        {
            double h = dt * 60 / 2;
            for (int k = Balls.Count - 1; k >= 0; k--)
            {
                var b = Balls[k]; bool gone = false;
                for (int s = 0; s < 2 && !gone; s++)
                {
                    b.vy = Math.Min(6, b.vy + .09 * h); b.x += b.vx * h; b.y += b.vy * h;
                    if (b.x < 5) { b.x = 5; b.vx = Math.Abs(b.vx) * .6; }
                    if (b.x > 355) { b.x = 355; b.vx = -Math.Abs(b.vx) * .6; }
                    foreach (var p in Pegs)
                    {
                        double dx = b.x - p.x, dy = b.y - p.y, R = 4 + p.r;
                        if (Math.Abs(dx) > R || Math.Abs(dy) > R) continue;
                        double d2 = dx * dx + dy * dy;
                        if (d2 < R * R)
                        {
                            double d = Math.Sqrt(d2); if (d == 0) d = .01; double nx = dx / d, ny = dy / d;
                            b.x = p.x + nx * R; b.y = p.y + ny * R;
                            double dot = b.vx * nx + b.vy * ny;
                            if (dot < 0)
                            {
                                b.vx -= (1 + p.bounce) * dot * nx; b.vy -= (1 + p.bounce) * dot * ny; b.vx += (Rng.Next() - .5) * .5;
                                double s2 = Math.Sqrt(b.vx * b.vx + b.vy * b.vy); if (s2 > 5) { b.vx *= 5 / s2; b.vy *= 5 / s2; }
                            }
                        }
                    }
                    if (b.y > 364 && b.y < 378 && Math.Abs(b.x - 180) < 22) { gone = true; OnChucker(b.g); }
                    else if (b.y > 385 && b.y < 397)
                    {
                        if (G.rush > 0 && Math.Abs(b.x - 180) < 46) { gone = true; OnAtkPocket(b.g); }
                        else if (Math.Abs(b.x - 22) < 16 || Math.Abs(b.x - 338) < 16) { gone = true; OnSide(b.g); }
                    }
                    if (b.y > PH) { gone = true; G.pool += G.stage * Mul() * .6; }
                }
                if (gone) Balls.RemoveAt(k); else Balls[k] = b;
            }
        }

        // ===== 抽選(21-pacing / 85 ykLv) =====
        double HeatV() => dry <= Bal.pityStart ? 0 : Math.Min(1, (dry - Bal.pityStart) / (double)(Bal.pityEnd - Bal.pityStart));
        bool HitRoll()
        {
            double p; heat = 0;
            if (G.rush > 0) p = Bal.rushP;
            else { heat = HeatV(); p = HitP(); p += (1 - p) * heat * heat; if (dry >= Bal.pityEnd) p = 1; }
            bool h = Rng.Next() < p;
            if (h) dry = 0;
            else if (G.rush <= 0) { dry++; if (dry > dryMax) dryMax = dry; if (dry == Bal.pityStart + 1) OnBanner?.Invoke("チャンスゾーン!", "#44aaff"); }
            return h;
        }
        int YkLv(bool h)
        {
            double[] w = h ? new[] { .15, .25, .3, .2, .1 } : new[] { .55, .25, .13, .06, .01 };
            double r = Rng.Next(); int i = 0; while (i < 4 && r > w[i]) { r -= w[i]; i++; }
            return i;
        }
        int HeatYk(bool h)
        {
            int c = YkLv(h);
            if (heat > 0) { if (h) c = Math.Max(c, 1 + (int)Math.Ceiling(heat * 3)); else if (Rng.Next() < heat * .6) c = Math.Max(c, Math.Min(c + 1, 2)); }
            return c;
        }
        public int DryMax => dryMax;

        // ===== スロット(50-slot) =====
        int Dg() => (int)(Rng.Next() * 10);
        void StartSpin()
        {
            if (CurrentSpin != null || G.q <= 0 || Blocking) return;
            G.q--; var q0 = Queue.Count > 0 ? Queue[0] : (false, 0); if (Queue.Count > 0) Queue.RemoveAt(0);
            bool rush = G.rush > 0, hit = q0.Item1, jp = false; int type; int[] f;
            if (hit) { jp = Rng.Next() < Bal.jpP; int d = jp ? 7 : Dg(); if (!jp && d == 7) d = 3; f = new[] { d, d, d }; type = jp ? 2 : (Rng.Next() < .6 ? 2 : 1); }
            else if (Rng.Next() < .3) { int d = Dg(), e = Dg(); while (e == d) e = Dg(); f = new[] { d, d, e }; type = Rng.Next() < .25 ? 2 : 1; }
            else { f = new[] { Dg(), Dg(), Dg() }; if (f[0] == f[1]) f[1] = (f[1] + 1) % 10; type = 0; }
            CurrentSpin = new Spin { t = 0, faces = f, type = type, hit = hit, jp = jp, yk = q0.Item2, stop = new[] { 1, 1.9, type == 2 ? 7.5 : type == 1 ? 4.8 : 2.8 }, speed = rush ? 2.2 : 1 };
            OnSpinStart?.Invoke(CurrentSpin);
        }
        void UpdSpin(double dt)
        {
            var s = CurrentSpin; if (s == null) return;
            s.t += dt * s.speed;
            if (s.t >= s.stop[2])
            {
                CurrentSpin = null; OnSpinEnd?.Invoke(s);
                if (s.hit) BigHit(s.jp);
                StartSpin();
            }
        }

        // ===== 大当たり(70-show / 87-hitev / 60-roulette) =====
        void BigHit(bool jp)
        {
            bool was = G.rush > 0; Blocking = true; G.combo++;
            G.rush = Math.Min(15, G.rush + (jp ? 12 : 9) + RushExt());
            OnBanner?.Invoke(jp ? "JACKPOT!!" : was ? G.combo + "連チャン!!" : "確変突入!!", jp ? "#ffd400" : "#ff2d7a");
            OnBigHit?.Invoke(jp, G.combo);
            eventBase = Atk() * 40 * (1 + G.combo * .5);
            // カットイン(.65秒)の後に分岐。777 と 押せ!! は PUSH(放置なら2.4秒で自動)の間 RUSH を減らさない
            if (jp) { eventKind = HitEventKind.Jackpot; eventT = T + .65 + 2.4 + 2.6; pushPause = true; }
            else if (Rng.Next() < EvP()) { eventKind = HitEventKind.Roulette; eventSup = Rng.Next() < SupP(); eventT = T + .65 + 2.4 + 4.6; pushPause = true; }
            else { eventKind = HitEventKind.Mini; eventT = T + .65; }
            OnHitEvent?.Invoke(eventKind);
        }
        int RollRoulette()
        {
            int[] ws = { 2, 3, 2, 5, 2, 3, 10, 2, 3, 5, 2, 50 }; double[] w = new double[ws.Length]; double sum = 0;
            for (int i = 0; i < ws.Length; i++) { int m = ws[i]; w[i] = (m == 2 ? 30 : m == 3 ? 22 : m == 5 ? 14 : m == 10 ? 6 : 1) * (m >= 5 ? Luck() : 1); sum += w[i]; }
            double r = Rng.Next() * sum; int k = 0; while (k < w.Length - 1 && r > w[k]) { r -= w[k]; k++; }
            return ws[k];
        }
        void RouletteReward(double bas, int m)
        {
            Hurt(bas * m, m >= 5); G.gold += Math.Floor(G.stage * 40 * m * Mul());
            if (m >= 10 && G.rush > 0) G.rush = Math.Min(15, G.rush + 3);
        }
        void UpdEvent()
        {
            if (eventT >= 0 && T >= eventT)
            {
                eventT = -1;
                switch (eventKind)
                {
                    case HitEventKind.Mini:
                        Blocking = false; miniBase = eventBase; miniM = RollRoulette(); miniT = T + 2.2; StartSpin(); break;
                    case HitEventKind.Roulette:
                        {
                            pushPause = false; int m = RollRoulette(); RouletteReward(eventBase, m); int sup = 0;
                            if (eventSup)
                            {
                                int[] SM = { 100, 100, 100, 100, 100, 100, 300, 300, 300, 777 }; sup = SM[(int)(Rng.Next() * SM.Length)];
                                Hurt(eventBase * sup, true); G.gold += Math.Floor(G.stage * 40 * sup * Mul() * Bal.supG); G.rush = Math.Min(15, G.rush + 3);
                                OnBanner?.Invoke("超倍率 x" + sup + "!!", "#ffd400");
                            }
                            OnRouletteResult?.Invoke(m, sup);
                            Blocking = false; StartSpin(); break;
                        }
                    case HitEventKind.Jackpot:
                        {
                            pushPause = false; G.jp = 5; double g = Math.Floor(G.pool + G.stage * 500 * Mul()); G.gold += g; G.pool = 0;
                            Hurt(Atk() * 150, true); OnJackpot?.Invoke(g); break;   // Blocking は jp が切れた時に解除
                        }
                }
            }
            if (miniT >= 0 && T >= miniT) { miniT = -1; RouletteReward(miniBase, miniM); OnRouletteResult?.Invoke(miniM, 0); }
        }

        // ===== メインループ(99-main) =====
        public void Tick(double dt)
        {
            if (dt <= 0) return; if (dt > .05) dt = .05;
            T += dt;
            emitAcc += Rate() * dt * (G.rush > 0 ? 1.5 : 1) * (G.fv > 0 ? 2.5 : 1);
            while (emitAcc >= 1) { emitAcc--; if (Balls.Count < 70) Balls.Add(new Ball { x = 332 + Rng.Next() * 10, y = 18, vx = -(.8 + Rng.Next() * 3.6) }); }
            StepBalls(dt); UpdSpin(dt); UpdEvent();
            if (G.jp > 0) { G.jp -= dt; if (G.jp <= 0) { G.jp = 0; Blocking = false; StartSpin(); } }
            pegComboT -= dt; if (pegComboT <= 0) PegCombo = 0;
            if (G.aw > 0) G.aw -= dt;
            if (G.fv > 0) G.fv -= dt;
            else if (G.rush <= 0 && Rng.Next() < dt * FevRate()) { G.fv = 8; OnBanner?.Invoke("FEVER TIME!!", "#22e0ff"); OnFever?.Invoke(); }
            if (Rng.Next() < dt * GoldRate() && Balls.Count < 70) Balls.Add(new Ball { x = 332, y = 18, vx = -(1 + Rng.Next() * 3), g = 2 });
            for (int i = Shots.Count - 1; i >= 0; i--)
            {
                var p = Shots[i]; p.t += dt;
                if (p.t >= .22) { Shots.RemoveAt(i); Hurt(p.dmg, p.crit); } else Shots[i] = p;
            }
            G.at += dt;
            if (G.at > .55 / (G.rush > 0 ? 2 : 1)) { G.at = 0; G.ai = (G.ai + 1) % 3; HeroAtk(G.ai, .8 * (G.rush > 0 ? 2 : 1)); SpAdd(Bal.spHero * Spm()); }
            if (G.sp >= 100 && ultT < 0 && !Blocking && T - lastUlt >= Bal.ultMin) Ult();
            if (ultT >= 0 && T >= ultT) { ultT = -1; Hurt(Atk() * 25 * Cm(), true); }
            if (G.rush > 0) { if (!pushPause) G.rush -= dt; if (G.rush <= 0) { G.rush = 0; G.combo = 0; OnRushEnd?.Invoke(); } }
        }

        public SaveData ToSave() => SaveData.From(G);
        public void Load(SaveData s) { if (s == null) return; s.ApplyTo(G); Spawn(); }
    }
}
