// 大当たりまわりの演出(Web版 50-slot の予告/リーチ・83/84 カットイン(提供イラスト)・87-hitev(ミニ/全画面ルーレット・押せ!!)・
// 60-roulette(超倍率)・87b-jpfx(777→JACKPOT パネル)・88 バナー)。コアの状態/イベントを見て描くだけで、当否や報酬は変えない。
// 文字・帯・パネルは IMGUI(GameRunner が仮想 360x760 の行列を設定してから DrawGUI を呼ぶ)、ルーレット盤はスプライト。
using UnityEngine;
using PachiSenki.Core;

namespace PachiSenki.View
{
    public sealed class Presentation : MonoBehaviour
    {
        PachiGame game; System.Func<float, float, Vector3> W;
        const float BATTLE_Y = 28, BOARD_Y = 238;
        // バナー
        string bnText = ""; Color bnCol = Color.yellow; float bnT0 = -9; bool bnHot;
        // カットイン
        float cutT0 = -9; int cutHero; bool cutTrio, cutJp; string cutLine = "";
        Texture2D[] port = new Texture2D[3]; Texture2D trio;
        static readonly string[][] Lines = { new[] { "斬り開け!!", "燃えろ!!", "一刀両断!!" }, new[] { "魔力解放!!", "焼き尽くせ!", "禁呪発動!!" }, new[] { "狙い撃つ!!", "逃さない!!", "一矢必中!!" } };
        static readonly string[] TrioLines = { "総攻撃!!", "全員集合!!", "いくぞ!!" };
        // 予告/リーチ
        Spin lastSpin; bool ykShown, reachShown;
        // ルーレット
        static readonly int[] WS = { 2, 3, 2, 5, 2, 3, 10, 2, 3, 5, 2, 50 };
        static readonly Color[] WC = { C("#2a6df4"), C("#e23b6e"), C("#2a6df4"), C("#17a673"), C("#2a6df4"), C("#e23b6e"), C("#ff8a00"), C("#2a6df4"), C("#e23b6e"), C("#17a673"), C("#2a6df4"), C("#ffd400") };
        SpriteRenderer bigWheel, bigBack, miniWheel; float bigTarget, miniTarget, lastTickSeg = -1; double miniShownT = -1; int miniShownM;
        // JACKPOT
        double jpSlamT0 = -1; float jpPanelT0 = -9; double jpTotal, jpPool, jpBase;
        GUIStyle sBig, sMid, sSmall, sBtn;
        readonly System.Collections.Generic.Dictionary<string, GUIStyle> stc = new System.Collections.Generic.Dictionary<string, GUIStyle>();
        GUIStyle St(GUIStyle b, int size, TextAnchor a) { string k = b.GetHashCode() + "/" + size + "/" + a; if (!stc.TryGetValue(k, out var st)) { st = new GUIStyle(b) { fontSize = size, alignment = a }; stc[k] = st; } return st; }

        static Color C(string h) { ColorUtility.TryParseHtmlString(h, out var c); return c; }

        public void Init(PachiGame g, Transform world, System.Func<float, float, Vector3> toWorld)
        {
            game = g; W = toWorld;
            for (int i = 0; i < 3; i++) port[i] = Resources.Load<Texture2D>("Portraits/hero" + i);
            trio = Resources.Load<Texture2D>("Portraits/trio");
            var wheel = MakeWheel(120);
            bigBack = NewSr(world, "RoulBack", SpriteBank.White(), 30); bigBack.transform.localScale = new Vector3(360, 760, 1); bigBack.transform.position = W(180, 380); bigBack.color = new Color(.02f, .01f, .08f, .85f);
            bigWheel = NewSr(world, "RoulWheel", wheel, 31); bigWheel.transform.position = W(180, 330);
            miniWheel = NewSr(world, "MiniWheel", wheel, 6); miniWheel.transform.localScale = new Vector3(.2f, .2f, 1); miniWheel.transform.position = W(112, BATTLE_Y + 29);
            bigBack.gameObject.SetActive(false); bigWheel.gameObject.SetActive(false); miniWheel.gameObject.SetActive(false);

            g.OnBanner += (t, c) => { bnText = t; bnCol = C(c); bnT0 = Time.time; bnHot = t.Contains("激アツ") || t.Contains("JACKPOT") || t.Contains("確定") || t.Contains("超倍率"); Audio8.I?.Play("banner", .6f); };
            g.OnBigHit += (jp, n) =>
            {
                cutT0 = Time.time; cutJp = jp; cutTrio = Random.value < .3f; cutHero = Random.Range(0, 3);
                cutLine = jp ? "JACKPOT!!" : cutTrio ? TrioLines[Random.Range(0, 3)] : Lines[cutHero][Random.Range(0, 3)];
                Audio8.I?.Play("win"); Audio8.I?.Play("kyuin", .7f); Fx.I?.Flash(Color.white); Fx.I?.Shake(5);
            };
            g.OnPushResolved += k => { Audio8.I?.Play("push"); Audio8.I?.Play("kyuin"); Fx.I?.Flash(new Color(1, .9f, .3f)); Fx.I?.Shake(6); if (k == HitEventKind.Jackpot) jpSlamT0 = Time.time; };
            g.OnRouletteResult += (m, sup) =>
            {
                if (sup > 0) { Audio8.I?.Play("jackpot"); Fx.I?.Flash(new Color(1, .83f, 0)); Fx.I?.Shake(8); Fx.I?.CoinRain(60); }
                else { Audio8.I?.Play(m >= 10 ? "win" : "decide"); if (m >= 10) { Fx.I?.Flash(new Color(1, .83f, 0)); Fx.I?.Burst(W(180, 330), 60, new Color(1, .83f, 0)); } }
                if (game.MiniStartT < 0 && !game.EventActive) { miniShownT = Time.time; miniShownM = m; }
            };
            g.OnJackpot += gold => { jpPanelT0 = Time.time; jpTotal = gold; jpBase = System.Math.Floor(game.G.stage * 500 * game.Mul()); jpPool = System.Math.Max(0, gold - jpBase); Audio8.I?.Play("jackpot"); Fx.I?.CoinRain(90); Fx.I?.Shake(8); };
            g.OnHurt += (d, crit) => Audio8.I?.Play(crit ? "crit" : "hit", .6f);
            g.OnKill += (boss, gold) => { Audio8.I?.Play("kill"); Audio8.I?.Play("coin", .6f); Fx.I?.Burst(W(262, BATTLE_Y + 85), boss ? 80 : 30, new Color(1, .83f, 0)); if (boss) Fx.I?.Shake(8); };
            g.OnFever += () => { Audio8.I?.Play("kyuin"); Fx.I?.Flash(new Color(.13f, .88f, 1)); };
            g.OnAwaken += () => { Audio8.I?.Play("kyuin"); Fx.I?.Shake(5); };
            g.OnGolden += () => { Audio8.I?.Play("coin"); Fx.I?.Burst(W(262, BATTLE_Y + 85), 40, new Color(1, .83f, 0)); };
            g.OnUlt += h => { Audio8.I?.Play("super", .8f); Fx.I?.Flash(new Color(.13f, .88f, 1)); };
        }

        static SpriteRenderer NewSr(Transform p, string n, Sprite s, int order)
        {
            var go = new GameObject(n); go.transform.SetParent(p, false); var r = go.AddComponent<SpriteRenderer>(); r.sprite = s; r.sortingOrder = order; return r;
        }
        // 12分割のルーレット盤(上から時計回りに WS の順)。外周に金の輪
        static Sprite MakeWheel(int R)
        {
            int n = R * 2 + 1; var t = new Texture2D(n, n, TextureFormat.RGBA32, false) { filterMode = FilterMode.Point }; var px = new Color32[n * n];
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
                {
                    float dx = x - R, dy = y - R, d = Mathf.Sqrt(dx * dx + dy * dy); Color c = new Color(0, 0, 0, 0);
                    if (d <= R - 8) { float a = (Mathf.Atan2(dx, dy) * Mathf.Rad2Deg + 360) % 360; int seg = (int)(a / 30) % 12; c = WC[seg]; if (a % 30 < 1.2f) c = C("#ffe56a"); if (d < 16) c = d < 9 ? C("#ff2d7a") : C("#c89a10"); else if (d > R - 22) c = Color.Lerp(c, Color.white, .2f); }
                    else if (d <= R - 3) c = C("#c89a10"); else if (d <= R) c = Color.black;
                    px[y * n + x] = c;
                }
            t.SetPixels32(px); t.Apply(); return Sprite.Create(t, new Rect(0, 0, n, n), new Vector2(.5f, .5f), 1f);
        }
        static float TargetFor(int m, float spins)
        {
            int k; int guard = 0; do { k = Random.Range(0, 12); } while (WS[k] != m && ++guard < 100);
            return k * 30 + 15 + Random.Range(-10f, 10f) + 360 * spins;
        }

        void Update()
        {
            if (game == null) return; float now = Time.time; double T = game.T;
            // BGM
            var G = game.G; Audio8.I?.SetBgm(G.jp > 0 || jpSlamT0 > 0 && now - jpSlamT0 < 3 ? "jp" : G.rush > 0 ? "rush" : G.fv > 0 ? "fever" : "normal");
            // 予告(回転1秒で)・リーチ(1.9秒で)
            var sp = game.CurrentSpin;
            if (sp != lastSpin) { lastSpin = sp; ykShown = reachShown = false; }
            if (sp != null)
            {
                if (!ykShown && sp.yk > 0 && sp.t > 1) { ykShown = true; string[] tx = { "", "チャンス", "チャンス!!", "激アツ!!", "激アツ確定!!" }; string[] cl = { "", "#44aaff", "#33dd66", "#ff2244", "#ffd400" }; bnText = tx[sp.yk]; bnCol = C(cl[sp.yk]); bnT0 = now; bnHot = sp.yk >= 3; Audio8.I?.Play("kyuin", .5f + sp.yk * .12f); if (sp.yk >= 3) Fx.I?.Shake(4); }
                if (!reachShown && sp.type > 0 && sp.t > 1.9) { reachShown = true; Audio8.I?.Play(sp.type == 2 ? "super" : "reach"); if (sp.type == 2) { bnText = "SUPER REACH"; bnCol = C("#ff2d7a"); bnT0 = now; bnHot = false; Fx.I?.Flash(new Color(1, 0, 0)); Fx.I?.Shake(4); } }
            }
            // 全画面ルーレット(押した後 4.6秒回って止まる)
            bool big = game.EventActive && game.EventKind == HitEventKind.Roulette && game.PushEnd >= 0;
            if (bigWheel.gameObject.activeSelf != big) { bigWheel.gameObject.SetActive(big); bigBack.gameObject.SetActive(big); if (big) { bigTarget = TargetFor(game.EventRouletteM, 6); lastTickSeg = -1; } }
            if (big)
            {
                float p = Mathf.Clamp01((float)((T - game.PushEnd) / PachiGame.RouletteSpin)), e = 1 - Mathf.Pow(1 - p, 4), th = bigTarget * e;
                bigWheel.transform.rotation = Quaternion.Euler(0, 0, th);
                int seg = (int)(th / 30); if (seg != lastTickSeg && p < 1) { lastTickSeg = seg; Audio8.I?.Play("tick"); }
            }
            // ミニルーレット(戦闘画面の上で勝手に回る)
            bool mini = game.MiniStartT >= 0 || (miniShownT > 0 && now - miniShownT < 1.0);
            if (miniWheel.gameObject.activeSelf != mini) { miniWheel.gameObject.SetActive(mini); if (game.MiniStartT >= 0) miniTarget = TargetFor(game.MiniM, 4); }
            if (game.MiniStartT >= 0)
            {
                float p = Mathf.Clamp01((float)((T - game.MiniStartT) / PachiGame.MiniSpin)), e = 1 - Mathf.Pow(1 - p, 3);
                miniWheel.transform.rotation = Quaternion.Euler(0, 0, miniTarget * e);
            }
            if (Input.GetKeyDown(KeyCode.Space)) game.PressPush();
        }

        void Styles()
        {
            if (sBig != null) return;
            sBig = new GUIStyle(GUI.skin.label) { fontSize = 36, alignment = TextAnchor.MiddleCenter, fontStyle = FontStyle.Bold };
            sMid = St(sBig, 20, TextAnchor.MiddleCenter); sSmall = new GUIStyle(sBig) { fontSize = 12, fontStyle = FontStyle.Normal };
            sBtn = new GUIStyle(GUI.skin.button) { fontSize = 30, fontStyle = FontStyle.Bold };
        }
        static void Outline(Rect r, string s, GUIStyle st, Color c, int w = 2)
        {
            var o = st.normal.textColor; st.normal.textColor = Color.black;
            for (int dx = -w; dx <= w; dx += w) for (int dy = -w; dy <= w; dy += w) if (dx != 0 || dy != 0) GUI.Label(new Rect(r.x + dx, r.y + dy, r.width, r.height), s, st);
            st.normal.textColor = c; GUI.Label(r, s, st); st.normal.textColor = o;
        }
        static Color Rainbow(float t, float o = 0) => Color.HSVToRGB(((t * .6f + o) % 1 + 1) % 1, .85f, 1);
        static void Box(Rect r, Color c) { var o = GUI.color; GUI.color = c; GUI.DrawTexture(r, Texture2D.whiteTexture); GUI.color = o; }
        // 一文字ずつ波打つ文字(中央揃え・おおよその文字幅で配置)
        static void Wave(float cx, float y, string s, GUIStyle st, float t, bool rainbow, Color c, float amp = 4)
        {
            float cw = st.fontSize * .95f, x0 = cx - cw * s.Length / 2;
            for (int i = 0; i < s.Length; i++)
            {
                float dy = Mathf.Sin(t * 8 - i * .6f) * amp; Outline(new Rect(x0 + i * cw - cw, y + dy, cw * 3, st.fontSize * 1.6f), s[i].ToString(), st, rainbow ? Rainbow(t, i * .08f) : c);
            }
        }

        public void DrawGUI()
        {
            if (game == null) return; Styles(); float now = Time.time; double T = game.T; var m0 = GUI.matrix;
            // ミニルーレットの結果
            if (miniShownT > 0 && now - miniShownT < 1.0) { float s = 1 + Mathf.Max(0, .15f - (now - (float)miniShownT)) * 4; GUIUtility.ScaleAroundPivot(new Vector2(s, s), new Vector2(112, BATTLE_Y + 29)); Outline(new Rect(62, BATTLE_Y + 14, 100, 30), "x" + miniShownM, sMid, miniShownM >= 10 ? Rainbow(now) : new Color(1, .83f, 0)); GUI.matrix = m0; }
            // 全画面ルーレットのラベルと結果
            if (bigWheel.gameObject.activeSelf)
            {
                Outline(new Rect(0, 150, 360, 40), "ROULETTE CHANCE", sMid, new Color(1, .83f, 0));
                float th = bigWheel.transform.rotation.eulerAngles.z;
                for (int i = 0; i < 12; i++) { float a = (i * 30 + 15 - th) * Mathf.Deg2Rad; Vector2 c = new Vector2(180 + Mathf.Sin(a) * 84, 330 - Mathf.Cos(a) * 84); Outline(new Rect(c.x - 30, c.y - 12, 60, 24), "x" + WS[i], sSmall, WS[i] == 50 ? new Color(1, .95f, .4f) : Color.white); }
                // 針
                Box(new Rect(172, 196, 16, 22), new Color(1, .18f, .48f)); Box(new Rect(176, 218, 8, 8), new Color(1, .18f, .48f));
                double r = game.PushEnd + PachiGame.RouletteSpin;
                if (T >= r) { Outline(new Rect(0, 470, 360, 50), "x" + game.EventRouletteM + (game.EventRouletteM >= 10 ? " BIG!!" : ""), sBig, new Color(1, .83f, 0)); }
                if (game.EventSupM > 0 && T >= r + .8 && T < r + 1.9) Outline(new Rect(0, 300, 360, 60), "!?", sBig, ((int)(now * 6) % 2 == 0) ? new Color(1, .83f, 0) : new Color(1, .18f, .48f), 3);
                if (game.EventSupM > 0 && T >= r + 1.9) { float s = Mathf.Max(1, 2.6f - (float)(T - r - 1.9) * 6); GUIUtility.ScaleAroundPivot(new Vector2(s, s), new Vector2(180, 330)); Outline(new Rect(30, 300, 300, 60), "x" + game.EventSupM, St(sBig, 52, TextAnchor.MiddleCenter), Rainbow(now), 3); GUI.matrix = m0; Outline(new Rect(0, 520, 360, 40), "超倍率!!", sMid, Rainbow(now, .5f)); }
            }
            // カットイン(1秒): 帯が開く → キャラが滑り込む → 文字
            float cp = now - cutT0;
            if (cp >= 0 && cp < 1f)
            {
                float open = Mathf.Min(1, cp / .1f) * (cp > .88f ? Mathf.Max(0, (1 - cp) / .12f) : 1), h = 88 * open, y0 = BATTLE_Y + 76 - h / 2;
                Color col = cutJp ? new Color(1, .83f, 0) : new Color(1, .18f, .48f);
                Box(new Rect(0, y0, 360, h), new Color(.06f, .03f, .15f, .95f)); Box(new Rect(0, y0 - 3, 360, 3), col); Box(new Rect(0, y0 + h, 360, 3), col);
                GUI.BeginGroup(new Rect(0, y0, 360, h));
                float ex = 1 - Mathf.Pow(1 - Mathf.Min(1, cp / .22f), 3);
                var tex = cutTrio ? trio : port[cutHero];
                if (tex != null)
                {
                    float th2 = cutTrio ? 112 : 190, tw = th2 * tex.width / tex.height, fx = cutTrio ? .5f : new[] { .39f, .5f, .37f }[cutHero], fy = cutTrio ? .43f : new[] { .3f, .43f, .38f }[cutHero];
                    float x = (cutTrio ? -tw + ex * tw : 70 - fx * tw - (1 - ex) * 200), y = 44 - fy * th2 + y0 - y0;
                    GUI.DrawTexture(new Rect(x, y, tw, th2), tex);
                }
                GUI.EndGroup();
                float tx = 350 - (1 - ex) * 220;
                Outline(new Rect(tx - 230, BATTLE_Y + 64, 230, 50), cutLine, St(sBig, 34, TextAnchor.MiddleRight), Color.white, 3);
                Outline(new Rect(tx - 230, BATTLE_Y + 40, 230, 20), cutJp ? "★ 777 ★" : "★ 大当たり ★", St(sSmall, 13, TextAnchor.MiddleRight), col);
                if (cp > .6f && cp < .72f) Box(new Rect(0, y0, 360, h), new Color(1, 1, 1, .8f - (cp - .6f) * 6));
            }
            // 押せ!!(PUSH 待ち)
            if (game.PushActive)
            {
                bool jp = game.EventKind == HitEventKind.Jackpot; float pulse = 1 + Mathf.Sin(now * 12) * .05f;
                Box(new Rect(0, 0, 360, 760), jp ? new Color(.3f, .05f, .3f, .7f) : new Color(.15f, .02f, .1f, .7f));
                Wave(180, 230, jp ? "777 押せ!!" : "押せ!!", St(sBig, jp ? 40 : 48, TextAnchor.MiddleCenter), now, jp, new Color(1, .95f, .63f), 8);
                GUIUtility.ScaleAroundPivot(new Vector2(pulse, pulse), new Vector2(180, 400));
                var o = GUI.backgroundColor; GUI.backgroundColor = jp ? Rainbow(now) : new Color(1, .2f, .3f);
                if (GUI.Button(new Rect(90, 330, 180, 140), "PUSH", sBtn)) game.PressPush();
                GUI.backgroundColor = o; GUI.matrix = m0;
                float left = Mathf.Clamp01((float)((game.EventT0 + PachiGame.CutinDur + PachiGame.PushMax - T) / PachiGame.PushMax));
                Box(new Rect(90, 490, 180, 10), Color.black); Box(new Rect(91, 491, 178 * left, 8), new Color(1, .83f, 0));
                Outline(new Rect(0, 505, 360, 24), "TAP!(放置でも自動で押されます)", sSmall, new Color(1, .95f, .63f));
            }
            // 777 叩きつけ(押した後 2.6秒)
            if (jpSlamT0 > 0 && now - jpSlamT0 < PachiGame.JpAnim)
            {
                float p = now - (float)jpSlamT0; Box(new Rect(0, BATTLE_Y, 360, 150), new Color(.03f, .01f, .07f, .88f));
                for (int k = 0; k < 3; k++) { float q = p - (.35f + k * .38f); if (q < 0) continue; float s = q < .12f ? 3.2f - q / .12f * 2.2f : 1; GUIUtility.ScaleAroundPivot(new Vector2(s, s), new Vector2(110 + k * 70, BATTLE_Y + 80)); Outline(new Rect(80 + k * 70, BATTLE_Y + 45, 60, 70), "7", St(sBig, 64, TextAnchor.MiddleCenter), Rainbow(now, k * .3f), 4); GUI.matrix = m0; }
                if (p > 1.6f) Outline(new Rect(0, BATTLE_Y + 115, 360, 34), "JACKPOT!!!", sMid, Rainbow(now));
            }
            // JACKPOT パネル(7秒): 777揃い → POOL / ステージボーナス / 合計 のカウントアップ
            float jt = now - jpPanelT0;
            if (jt >= 0 && jt < 7)
            {
                float a = Mathf.Min(1, jt * 4, (7 - jt) * 2); var oc = GUI.color; GUI.color = new Color(1, 1, 1, a);
                Box(new Rect(20, BOARD_Y + 70, 320, 210), new Color(.04f, .02f, .12f, .88f)); Box(new Rect(20, BOARD_Y + 70, 320, 3), new Color(1, .83f, 0)); Box(new Rect(20, BOARD_Y + 277, 320, 3), new Color(1, .83f, 0));
                for (int k = 0; k < 3; k++) { float q = jt - k * .12f; if (q < 0) continue; float bob = q >= .2f ? Mathf.Sin(now * 7 + k * 1.4f) * 5 : 0; Outline(new Rect(105 + k * 50, BOARD_Y + 82 + bob, 50, 50), "7", St(sBig, 40, TextAnchor.MiddleCenter), Rainbow(now, k * .3f), 3); }
                Wave(180, BOARD_Y + 128, "揃い!! JACKPOT!!", St(sMid, 18, TextAnchor.MiddleCenter), now, true, Color.white, 3);
                void Row(int i, string lab, double val, Color c)
                {
                    if (jt < .6f + i) return; float q = Mathf.Min(1, (jt - .6f - i) / .8f), e = 1 - Mathf.Pow(1 - q, 3);
                    Outline(new Rect(40, BOARD_Y + 162 + i * 30, 160, 24), lab, St(sSmall, 13, TextAnchor.MiddleLeft), new Color(.8f, .75f, 1));
                    Outline(new Rect(160, BOARD_Y + 160 + i * 30, 160, 28), "+" + Fmt.N(System.Math.Floor(val * e)) + " G", St(sMid, i == 2 ? 20 : 16, TextAnchor.MiddleRight), c);
                }
                Row(0, "ためた玉(POOL)", jpPool, Color.white); Row(1, "ステージボーナス", jpBase, Color.white); Row(2, "合計", jpTotal, Rainbow(now));
                if (jt > 3.2f) Outline(new Rect(20, BOARD_Y + 250, 320, 20), "こぼれた玉は JACKPOT POOL に貯まり、777 でまとめて獲得!", St(sSmall, 10, TextAnchor.MiddleCenter), new Color(.8f, .75f, 1), 1);
                GUI.color = oc;
            }
            // バナー(登場で拡大→少し揺れて消える。熱い文言は虹色)
            float bp = now - bnT0;
            if (bp >= 0 && bp < 1.7f)
            {
                float s = bp < .2f ? 3 - bp / .2f * 2 : 1 + (bp > 1.4f ? (bp - 1.4f) * 1.5f : Mathf.Sin(bp * 10) * .03f), a = bp > 1.4f ? 1 - (bp - 1.4f) / .3f : 1;
                var oc = GUI.color; GUI.color = new Color(1, 1, 1, a);
                GUIUtility.RotateAroundPivot(-3, new Vector2(180, BOARD_Y + 70)); GUIUtility.ScaleAroundPivot(new Vector2(s, s), new Vector2(180, BOARD_Y + 70));
                if (bnHot) Wave(180, BOARD_Y + 45, bnText, St(sBig, 40, TextAnchor.MiddleCenter), now, true, bnCol, 4);
                else Outline(new Rect(0, BOARD_Y + 45, 360, 50), bnText, St(sBig, 40, TextAnchor.MiddleCenter), bnCol, 3);
                GUI.matrix = m0;
                GUI.color = oc;
            }
        }
    }
}
