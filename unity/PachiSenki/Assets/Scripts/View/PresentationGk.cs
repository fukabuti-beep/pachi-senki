// 激アツ演出パック(Web版 86-gekiatsu / 89-horyu の見た目): 擬似連(NEXT×2〜4)・復活・保留変化・RUSHリザルト(ランク C〜S+)。
// 当否・図柄はコア(PachiGame)が決める。ここは表示と音だけ。
using UnityEngine;
using PachiSenki.Core;

namespace PachiSenki.View
{
    public sealed partial class Presentation
    {
        public static readonly Color[] HoldCol = { C("#ffffff"), C("#44aaff"), C("#33dd66"), C("#ff2244"), C("#ffd400") };
        static readonly string[] HoldName = { "", "青", "緑", "赤", "金" };
        static readonly Color[] PzCol = { Color.white, Color.white, C("#33dd66"), C("#ff2244"), C("#ffd400") };
        // 中央に大きく出す一言(NEXT×k / 復活!! / はずれ…)
        string popText = ""; Color popCol = Color.white; float popT0 = -9; bool popBig;
        // 擬似連のバラけ目(サイクルごとに作り直す)
        int[] pzFake = new int[3]; int pzKey = -1; Spin pzSpin;
        // 保留変化の光る輪
        float holdFxT0 = -9; int holdFxI; Color holdFxC;
        // RUSHリザルト
        RushResult rr; float rrT0 = -9; int best; bool newBest, rrStamped;

        void Banner(string t, Color c, bool hot) { bnText = t; bnCol = c; bnT0 = Time.time; bnHot = hot; Audio8.I?.Play("banner", .6f); }
        void Pop(string t, Color c, bool big) { popText = t; popCol = c; popT0 = Time.time; popBig = big; }

        void InitGk(PachiGame g)
        {
            best = PlayerPrefs.GetInt("pachi2_gk_best", 0);
            g.OnPseudo += k =>
            {
                var c = PzCol[Mathf.Min(k, 4)];
                Banner("擬似連 ×" + k, c, k >= 4); Pop("NEXT ×" + k, c, k >= 3);
                Audio8.I?.Play("reach", .8f); if (k >= 3) Audio8.I?.Play("kyuin", .7f);
                if (k >= 4) { Fx.I?.Flash(c); Fx.I?.Shake(5); }
            };
            g.OnReviveFake += () => { Pop("はずれ…", new Color(.6f, .63f, .78f), false); Audio8.I?.Play("tick"); };
            g.OnRevive += () =>
            {
                var c = new Color(1, .83f, 0); Banner("復活!!", c, true); Pop("復活!!", c, true);
                Audio8.I?.Play("kyuin"); Audio8.I?.Play("super", .7f); Fx.I?.Flash(Color.white); Fx.I?.Shake(6);
            };
            g.OnHoldChange += (i, to) =>
            {
                to = Mathf.Clamp(to, 0, 4); holdFxT0 = Time.time; holdFxI = i; holdFxC = HoldCol[to];
                if (to > 0) Pop("保留変化!! " + HoldName[to], HoldCol[to], to >= 3);
                Audio8.I?.Play(to >= 3 ? "kyuin" : "decide", to >= 3 ? .8f : .6f);
                if (to >= 4) { Banner("金保留!!", HoldCol[4], true); Fx.I?.Shake(5); }
            };
            g.OnRushResult += r =>
            {
                rr = r; rrT0 = Time.time; rrStamped = false; newBest = r.Chain > best;
                if (newBest) { best = r.Chain; PlayerPrefs.SetInt("pachi2_gk_best", best); }
                bool hi = r.Grade.StartsWith("S");
                Audio8.I?.Play(hi ? "win" : "decide"); if (hi) { Fx.I?.CoinRain(40); Fx.I?.Flash(new Color(1, .83f, 0)); }
            };
        }

        /// <summary>リールに出す図柄の上書き(擬似連のバラけ目・復活のハズレ目)。上書きなしは -1。spinning=回転中に見せる</summary>
        public int ReelOverride(Spin s, int k, float now, out bool spinning)
        {
            spinning = false; if (s == null) return -1;
            if (s.PzN > 0 && s.PzI < s.PzN)
            {
                if (pzSpin != s || pzKey != s.PzI)
                {
                    pzSpin = s; pzKey = s.PzI; int a = Random.Range(0, 10), b = (a + 1 + Random.Range(0, 8)) % 10, c = (b + 1 + Random.Range(0, 8)) % 10;
                    if (c == a) c = (c + 1) % 10; if (c == b) c = (c + 1) % 10; pzFake[0] = a; pzFake[1] = b; pzFake[2] = c;
                }
                float[] st = { .5f, .62f, .74f };
                if (s.PzT >= st[k]) return pzFake[k];
                spinning = true; return (int)(now * 20 + k * 3) % 10;
            }
            if (k == 2 && s.Rv == 2)
            {
                if (s.RvT < Spin.RvWait) return s.RvFake;
                spinning = true; return (int)(now * 26) % 10;
            }
            return -1;
        }

        /// <summary>保留の光る輪(GameRunner が保留を描いた位置を渡す)</summary>
        public void DrawHoldFx(float x0, float y, float step, float now)
        {
            float a = now - holdFxT0; if (a < 0 || a > .5f) return;
            float r = 8 + a * 40, x = x0 + holdFxI * step; var c = holdFxC; c.a = 1 - a / .5f;
            Box(new Rect(x - r, y - 1, r * 2, 2), c); Box(new Rect(x - 1, y - r, 2, r * 2), c);
        }

        void DrawGk(float now)
        {
            // 一言(盤面の上部に 0.9秒)
            float pa = now - popT0;
            if (pa >= 0 && pa < .9f)
            {
                float s = pa < .12f ? 1.6f - pa / .12f * .6f : 1, a = pa > .7f ? 1 - (pa - .7f) / .2f : 1, y = BOARD_Y + 120 - pa * 12;
                var oc = GUI.color; GUI.color = new Color(1, 1, 1, a); var m0 = GUI.matrix;
                GUIUtility.ScaleAroundPivot(new Vector2(s, s), new Vector2(180, y + 22));
                if (popBig) Wave(180, y, popText, St(sBig, 34, TextAnchor.MiddleCenter), now, popCol == Color.white, popCol, 3);
                else Outline(new Rect(0, y, 360, 44), popText, St(sMid, 22, TextAnchor.MiddleCenter), popCol, 2);
                GUI.matrix = m0; GUI.color = oc;
            }
            // RUSH リザルト(戦闘画面に 3.6秒)
            float ra = now - rrT0;
            if (rr != null && ra >= 0 && ra < 3.6f)
            {
                float a = Mathf.Min(1, ra * 5, (3.6f - ra) * 3); var oc = GUI.color; GUI.color = new Color(1, 1, 1, a); var m0 = GUI.matrix;
                Box(new Rect(0, BATTLE_Y, 360, 150), new Color(.03f, .01f, .08f, .86f));
                Box(new Rect(0, BATTLE_Y, 360, 2), new Color(1, .83f, 0)); Box(new Rect(0, BATTLE_Y + 148, 360, 2), new Color(1, .83f, 0));
                Outline(new Rect(0, BATTLE_Y + 6, 360, 20), "RUSH RESULT", St(sMid, 15, TextAnchor.MiddleCenter), new Color(1, .83f, 0));
                Outline(new Rect(20, BATTLE_Y + 30, 200, 40), rr.Chain + " 連チャン", St(sBig, 30, TextAnchor.MiddleLeft), Color.white, 2);
                Outline(new Rect(20, BATTLE_Y + 72, 220, 20), "獲得 " + Fmt.N(rr.Gold) + " G", St(sSmall, 14, TextAnchor.MiddleLeft), new Color(1, .9f, .5f));
                Outline(new Rect(20, BATTLE_Y + 94, 220, 20), "撃破 " + rr.Kills + (rr.Jackpot ? "   JACKPOT!" : ""), St(sSmall, 13, TextAnchor.MiddleLeft), new Color(.8f, .75f, 1));
                Outline(new Rect(20, BATTLE_Y + 118, 300, 20), newBest ? "最高記録 更新!! " + best + "連" : "最高記録 " + best + "連", St(sSmall, 12, TextAnchor.MiddleLeft), newBest ? Rainbow(now) : new Color(.7f, .7f, .85f));
                // ランクのハンコ(0.5秒後にドン)
                if (ra > .5f)
                {
                    float q = ra - .5f, s = q < .15f ? 2.4f - q / .15f * 1.4f : 1;
                    if (!rrStamped) { rrStamped = true; Audio8.I?.Play("push", .7f); Fx.I?.Shake(4); }
                    bool s1 = rr.Grade.StartsWith("S"); Color rc = s1 ? Rainbow(now) : rr.Grade.StartsWith("A") ? new Color(1, .3f, .4f) : rr.Grade.StartsWith("B") ? new Color(.3f, .7f, 1) : new Color(.7f, .75f, .8f);
                    GUIUtility.RotateAroundPivot(-12, new Vector2(290, BATTLE_Y + 80)); GUIUtility.ScaleAroundPivot(new Vector2(s, s), new Vector2(290, BATTLE_Y + 80));
                    Box(new Rect(240, BATTLE_Y + 42, 100, 76), new Color(rc.r, rc.g, rc.b, .25f));
                    Box(new Rect(240, BATTLE_Y + 42, 100, 3), rc); Box(new Rect(240, BATTLE_Y + 115, 100, 3), rc); Box(new Rect(240, BATTLE_Y + 42, 3, 76), rc); Box(new Rect(337, BATTLE_Y + 42, 3, 76), rc);
                    Outline(new Rect(240, BATTLE_Y + 44, 100, 70), rr.Grade, St(sBig, 50, TextAnchor.MiddleCenter), rc, 3);
                    GUI.matrix = m0;
                }
                GUI.color = oc;
            }
        }
    }
}
