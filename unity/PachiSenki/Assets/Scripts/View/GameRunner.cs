// パチ戦記 Unity版: コア(PachiSenki.Core)を毎フレーム動かし、ドット絵スプライトで描画する(第3段階の第一歩)。
// どのシーンで再生しても自動で起動する(RuntimeInitializeOnLoadMethod)。カメラ・背景・釘・玉・英雄・敵はすべてコードで生成。
// 画面は Web版と同じ縦長 360x760 の仮想解像度。横長の画面では中央に縦長の筐体を表示(左右は黒帯)。
// 文字(HUD/スロット/バナー/ダメージ数字/強化ボタン)は当面 IMGUI。セーブ: PlayerPrefs["pachi2"](Web版と同じ JSON)。
using System.Collections.Generic;
using UnityEngine;
using PachiSenki.Core;

namespace PachiSenki.View
{
    public sealed class GameRunner : MonoBehaviour
    {
        const string SaveKey = "pachi2";
        const float VW = 360, VH = 760, BATTLE_Y = 28, SLOT_Y = 178, BOARD_Y = 238, BTN_Y = 642;
        public PachiGame Game { get; private set; }

        Camera cam; Transform world;
        readonly List<SpriteRenderer> ballR = new List<SpriteRenderer>();
        SpriteRenderer[] heroR = new SpriteRenderer[3]; SpriteRenderer enemyR, hpBack, hpFill, boardBg, battleBg, atkPocket;
        readonly float[] heroAtkT = { -9, -9, -9 }; float enemyHitT = -9, shakeT;
        Presentation pres;
        struct Pop { public string s; public float t, x, y; public Color c; public bool big; }
        readonly List<Pop> pops = new List<Pop>();
        float saveT;
        GUIStyle stS, stM, stL, stB, stR, stC, stCB, stReel; Texture2D white;

        /// <summary>Web版(WebShell)で起動している時は true。Unity版(作り直し中)は起動しない</summary>
        public static bool Disabled;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Boot()
        {
            if (Disabled || FindFirstObjectByType<GameRunner>() != null) return;
            var go = new GameObject("PachiSenki"); DontDestroyOnLoad(go); go.AddComponent<GameRunner>();
        }

        // 仮想座標(左上原点・下向き y)→ ワールド座標
        static Vector3 W(float x, float y, float z = 0) => new Vector3(x - VW / 2, VH / 2 - y, z);

        void Awake()
        {
            Application.targetFrameRate = 60;
            Game = new PachiGame();
            if (PlayerPrefs.HasKey(SaveKey)) { try { Game.Load(JsonUtility.FromJson<SaveData>(PlayerPrefs.GetString(SaveKey))); } catch { } }
            Game.OnHeroAttack += i => heroAtkT[i] = Time.time;
            Game.OnHurt += (d, crit) =>
            {
                enemyHitT = Time.time; if (crit) shakeT = .15f;
                if (pops.Count < 30) pops.Add(new Pop { s = (crit ? "★" : "") + Fmt.N(d), t = Time.time, x = 215 + Random.value * 80, y = BATTLE_Y + 60 + Random.value * 25, c = crit ? new Color(1, .88f, .3f) : Color.white, big = crit });
            };
            Game.OnKill += (boss, g) => { if (pops.Count < 30) pops.Add(new Pop { s = "+" + Fmt.N(g), t = Time.time, x = 150, y = BATTLE_Y + 35, c = new Color(1, .83f, 0), big = true }); };
            gameObject.AddComponent<Fx>(); gameObject.AddComponent<Audio8>();
            BuildWorld();
            pres = gameObject.AddComponent<Presentation>(); pres.Init(Game, world, (x, y) => W(x, y));
        }

        void BuildWorld()
        {
            // カメラ(既存の Main Camera があれば使う)
            cam = Camera.main; if (cam == null) { var cg = new GameObject("Main Camera"); cam = cg.AddComponent<Camera>(); cg.tag = "MainCamera"; }
            cam.orthographic = true; cam.orthographicSize = VH / 2; cam.transform.position = new Vector3(0, 0, -10);
            cam.clearFlags = CameraClearFlags.SolidColor; cam.backgroundColor = Color.black;
            world = new GameObject("World").transform; world.SetParent(transform, false);

            var wsp = SpriteBank.White();
            battleBg = Quad("BattleBg", 0, BATTLE_Y, VW, 150, new Color(.16f, .09f, .32f), -5);
            Quad("Ground", 0, BATTLE_Y + 118, VW, 32, new Color(.14f, .38f, .2f), -4);
            Quad("SlotBg", 0, SLOT_Y, VW, 60, new Color(.08f, .05f, .2f), -5);
            boardBg = Quad("BoardBg", 0, BOARD_Y, VW, 400, new Color(.1f, .06f, .25f), -5);
            Quad("BtnBg", 0, BTN_Y - 4, VW, VH - BTN_Y + 4, new Color(.06f, .04f, .15f), -5);
            // 釘・バンパー
            var peg = SpriteBank.Circle(4, new Color(.78f, .82f, .96f), new Color(.35f, .38f, .6f));
            var bump = SpriteBank.Circle(9, new Color(1f, .3f, .5f), new Color(.5f, .05f, .2f));
            foreach (var p in Game.Pegs) Spr("Peg", p.bumper ? bump : peg, (float)p.x, BOARD_Y + (float)p.y, 1, -2);
            Quad("Chucker", 158, BOARD_Y + 364, 44, 10, new Color(1, .85f, .2f), -1);
            Quad("SideL", 6, BOARD_Y + 385, 32, 10, new Color(.3f, .9f, 1f), -1);
            Quad("SideR", 322, BOARD_Y + 385, 32, 10, new Color(.3f, .9f, 1f), -1);
            atkPocket = Quad("AtkPocket", 134, BOARD_Y + 385, 92, 10, new Color(1, .55f, .2f), -1);
            // 英雄・敵・HP
            for (int i = 0; i < 3; i++) heroR[i] = Spr("Hero" + i, SpriteBank.Get("h" + i), 0, 0, 4, 1);
            enemyR = Spr("Enemy", SpriteBank.Get("m0"), 262, BATTLE_Y + 86, 4, 1);
            hpBack = Quad("HpBack", 200, BATTLE_Y + 10, 150, 8, Color.black, 2);
            hpFill = Quad("HpFill", 201, BATTLE_Y + 11, 148, 6, new Color(.3f, .9f, .45f), 3);
            var ballSp = SpriteBank.Circle(4, Color.white, new Color(.55f, .6f, .75f));
            for (int i = 0; i < 100; i++) { var b = Spr("Ball", ballSp, 0, 0, 1, 0); b.gameObject.SetActive(false); ballR.Add(b); }
        }

        SpriteRenderer Spr(string n, Sprite s, float x, float y, float scale, int order)
        {
            var go = new GameObject(n); go.transform.SetParent(world, false); go.transform.position = W(x, y); go.transform.localScale = new Vector3(scale, scale, 1);
            var r = go.AddComponent<SpriteRenderer>(); r.sprite = s; r.sortingOrder = order; return r;
        }
        // 左上 (x,y)・幅 w・高さ h の単色の板
        SpriteRenderer Quad(string n, float x, float y, float w, float h, Color c, int order)
        {
            var r = Spr(n, SpriteBank.White(), x + w / 2, y + h / 2, 1, order); r.transform.localScale = new Vector3(w, h, 1); r.color = c; return r;
        }

        static string EnemySprite(int st) => st % 5 == 0 ? "b" + ((st / 5 - 1) % 4) : "m" + ((st - 1 + 3 * ((st - 1) / 5)) % 10);

        void Update()
        {
            float dt = Time.deltaTime; Game.Tick(dt);
            if (shakeT > 0) shakeT -= dt;
            saveT += dt; if (saveT > 4) { saveT = 0; Save(); }
            FitCamera(); Sync();
        }

        // 縦長 360x760 を画面の中央に(横長なら左右に黒帯、縦長すぎるなら上下に黒帯)
        float vScale, vOx, vOy;
        void FitCamera()
        {
            float sw = Screen.width, sh = Screen.height; vScale = Mathf.Min(sw / VW, sh / VH); float w = VW * vScale, h = VH * vScale;
            vOx = (sw - w) / 2; vOy = (sh - h) / 2;
            cam.rect = new Rect(vOx / sw, vOy / sh, w / sw, h / sh);
        }
        Vector2 ScreenToVirtual(Vector3 m) => new Vector2((m.x - vOx) / vScale, (Screen.height - m.y - vOy) / vScale);

        void Sync()
        {
            var G = Game.G; float t = Time.time;
            // 状態で背景の色味を変える
            battleBg.color = G.jp > 0 ? Color.HSVToRGB(t * .3f % 1, .5f, .45f) : G.rush > 0 ? new Color(.35f, .08f, .25f) : G.fv > 0 ? new Color(.05f, .22f, .35f) : new Color(.16f, .09f, .32f);
            boardBg.color = G.rush > 0 ? new Color(.22f, .05f, .2f) : new Color(.1f, .06f, .25f);
            atkPocket.gameObject.SetActive(G.rush > 0);
            // 英雄: 待機は2コマ、攻撃は構え→攻撃+踏み込み、RUSH中は弾む
            float[] lunge = { 40, 10, -6 };
            for (int i = 0; i < 3; i++)
            {
                float d = t - heroAtkT[i]; bool at = d >= 0 && d < .3f;
                string fr = at ? (d < .14f ? "s" : "w") : (Mathf.FloorToInt(t * 2.6f + i * .7f) % 2 == 1 ? "b" : "");
                heroR[i].sprite = SpriteBank.Get("h" + i + fr) ?? heroR[i].sprite;
                float lg = at ? Mathf.Sin(d / .3f * Mathf.PI) * lunge[i] : 0, bob = at ? 0 : Mathf.Round(Mathf.Sin(t * 3 + i) * 1.2f) - (G.rush > 0 ? Mathf.Max(0, Mathf.Sin(t * 7 + i * 1.3f)) * 3 : 0);
                heroR[i].transform.position = W(6 + i * 46 + 32 + lg, BATTLE_Y + 52 + 32 + bob);
            }
            // 敵: ステージで見た目が変わる。被弾で揺れて白っぽく
            var es = SpriteBank.Get(EnemySprite(G.stage)); if (es != null) enemyR.sprite = es;
            float hit = Mathf.Clamp01(1 - (t - enemyHitT) / .12f), sx = shakeT > 0 ? Random.Range(-3f, 3f) : 0;
            float eh = es != null ? es.rect.height * 4 : 64;
            enemyR.transform.position = W(262 + hit * 4 + sx, BATTLE_Y + 118 - eh / 2);
            enemyR.color = Color.Lerp(Color.white, new Color(1, .6f, .6f), hit);
            float hp = Mathf.Clamp01((float)(G.hp / System.Math.Max(1, G.mx)));
            hpFill.transform.localScale = new Vector3(148 * hp, 6, 1); hpFill.transform.position = W(201 + 148 * hp / 2, BATTLE_Y + 14);
            hpFill.color = Game.IsBoss ? new Color(1, .3f, .4f) : new Color(.3f, .9f, .45f);
            // 玉
            for (int i = 0; i < ballR.Count; i++)
            {
                bool on = i < Game.Balls.Count; if (ballR[i].gameObject.activeSelf != on) ballR[i].gameObject.SetActive(on);
                if (!on) continue; var b = Game.Balls[i];
                ballR[i].transform.position = W((float)b.x, BOARD_Y + (float)b.y); ballR[i].color = b.g == 2 ? new Color(1, .85f, 0) : Color.white;
            }
        }

        void Save() { PlayerPrefs.SetString(SaveKey, JsonUtility.ToJson(Game.ToSave())); PlayerPrefs.Save(); }
        void OnApplicationPause(bool p) { if (p) Save(); }
        void OnApplicationQuit() { Save(); }

        // ---- 文字(IMGUI)。仮想 360x760 に合わせて拡大 ----
        void Styles()
        {
            if (stS != null) return; white = Texture2D.whiteTexture;
            stS = new GUIStyle(GUI.skin.label) { fontSize = 12 }; stS.normal.textColor = Color.white;
            stM = new GUIStyle(stS) { fontSize = 16 }; stL = new GUIStyle(stS) { fontSize = 30, alignment = TextAnchor.MiddleCenter };
            stB = new GUIStyle(GUI.skin.button) { fontSize = 11 };
            stR = new GUIStyle(stS) { alignment = TextAnchor.UpperRight }; stC = new GUIStyle(stS) { alignment = TextAnchor.MiddleCenter };
            stCB = new GUIStyle(stM) { alignment = TextAnchor.MiddleCenter }; stReel = new GUIStyle(stS) { fontSize = 34, alignment = TextAnchor.MiddleCenter, fontStyle = FontStyle.Bold };
        }
        void Txt(Rect r, string s, GUIStyle st, Color c)
        {
            var o = st.normal.textColor; st.normal.textColor = Color.black;
            for (int k = 0; k < 4; k++) GUI.Label(new Rect(r.x + (k == 0 ? 2 : k == 1 ? -2 : 0), r.y + (k == 2 ? 2 : k == 3 ? -2 : 0), r.width, r.height), s, st);
            st.normal.textColor = c; GUI.Label(r, s, st); st.normal.textColor = o;
        }

        void OnGUI()
        {
            // 入力は IMGUI のイベントで受ける(旧Input/新Input System どちらの設定でも動く。スマホのタッチもここに来る)
            var ev = Event.current;
            if (ev != null)
            {
                GUI.matrix = Matrix4x4.identity;
                if (ev.type == EventType.MouseDown)
                {
                    var v = new Vector2((ev.mousePosition.x - vOx) / vScale, (ev.mousePosition.y - vOy) / vScale);
                    if (v.y >= BOARD_Y && v.y < BOARD_Y + 400 && v.x >= 0 && v.x <= VW) Game.TapBoard(v.x);
                }
                else if (ev.type == EventType.KeyDown && ev.keyCode == KeyCode.Space) Game.PressPush();
            }
            Styles(); var G = Game.G;
            GUI.matrix = Matrix4x4.TRS(new Vector3(vOx, vOy, 0), Quaternion.identity, new Vector3(vScale, vScale, 1));
            GUI.BeginGroup(new Rect(0, 0, VW, VH));   // ゲーム画面(360x760)の外に文字がはみ出さないよう切り抜く
            Txt(new Rect(8, 4, 200, 22), "STAGE " + G.stage + (Game.IsBoss ? " BOSS" : ""), stM, new Color(1, .85f, .3f));
            Txt(new Rect(200, 4, 152, 22), "G " + Fmt.N(G.gold), stR, new Color(1, .85f, .3f));
            var tag = (G.rush > 0 ? $"RUSH x{G.combo} {G.rush:0.0}s  " : "") + (G.fv > 0 ? "FEVER  " : "") + (G.aw > 0 ? "覚醒  " : "") + (G.jp > 0 ? "JACKPOT" : "");
            Txt(new Rect(8, BATTLE_Y + 128, 344, 20), tag, stS, new Color(1, .5f, .7f));
            // ダメージ数字(上に流れて消える)
            float now = Time.time;
            for (int i = pops.Count - 1; i >= 0; i--)
            {
                var p = pops[i]; float a = now - p.t; if (a > .9f) { pops.RemoveAt(i); continue; }
                Txt(new Rect(p.x - 40, p.y - a * 30, 80, 22), p.s, (p.big ? stCB : stC), p.c);
            }
            // スロット(3リール + 保留)
            var sp = Game.CurrentSpin;
            for (int k = 0; k < 3; k++)
            {
                int ov = pres != null ? pres.ReelOverride(sp, k, now, out _) : -1;
                string d = ov >= 0 ? ov.ToString() : sp == null ? "7" : sp.t >= sp.stop[k] ? sp.faces[k].ToString() : ((int)(now * 20 + k * 3) % 10).ToString();
                GUI.color = new Color(.95f, .92f, .85f); GUI.DrawTexture(new Rect(12 + k * 52, SLOT_Y + 6, 46, 48), white); GUI.color = Color.white;
                Txt(new Rect(12 + k * 52, SLOT_Y + 6, 46, 48), d, stReel, d == "7" ? new Color(1, .2f, .3f) : new Color(.2f, .2f, .35f));
            }
            string msg = sp == null ? "START!" : sp.type == 2 && sp.t > 1.9 ? "SUPER REACH!!" : sp.type == 1 && sp.t > 1.9 ? "リーチ!" : "回転中…";
            Txt(new Rect(176, SLOT_Y + 6, 124, 22), msg, stM, sp != null && sp.type == 2 ? new Color(1, .2f, .5f) : Color.white);
            // 保留(色つきの玉。白/青/緑/赤/金。保留変化で色が上がる)
            Txt(new Rect(176, SLOT_Y + 30, 40, 20), "保留", stS, new Color(.8f, .8f, 1));
            for (int k = 0; k < 4; k++)
            {
                float hx = 206 + k * 14, hy = SLOT_Y + 41;
                GUI.color = new Color(.1f, .1f, .2f); GUI.DrawTexture(new Rect(hx - 5, hy - 5, 10, 10), white);
                if (k < Game.Queue.Count)
                {
                    int sh = Mathf.Clamp(Game.Queue[k].Shown, 0, 4); var hc = Presentation.HoldCol[sh];
                    if (sh >= 3) hc = Color.Lerp(hc, Color.white, Mathf.Abs(Mathf.Sin(now * 8)) * .4f);
                    GUI.color = hc; GUI.DrawTexture(new Rect(hx - 4, hy - 4, 8, 8), white);
                }
                GUI.color = Color.white;
            }
            pres?.DrawHoldFx(206, SLOT_Y + 41, 14, now);
            Txt(new Rect(264, SLOT_Y + 46, 96, 16), "JP " + Fmt.N(G.pool), stS, new Color(.8f, .8f, 1));
            // 強化ボタン
            float y = BTN_Y; int col = 0;
            for (int i = 0; i < Upgrades.Count; i++)
            {
                var u = Upgrades.All[i]; if (G.stage < u.UnlockStage) continue;
                var c = Game.Cost(i); GUI.enabled = G.gold >= c;
                if (GUI.Button(new Rect(4 + col * 89, y, 86, 36), $"{u.Name}\nLv{G.lv[i]}  {Fmt.N(c)}", stB)) Game.Buy(i);
                GUI.enabled = true; if (++col == 4) { col = 0; y += 38; }
            }
            // 設定(フラッシュ 強/弱/OFF・音 ON/OFF)
            if (Fx.I != null)
            {
                if (GUI.Button(new Rect(300, SLOT_Y + 2, 56, 18), "光:" + new[] { "OFF", "弱", "強" }[Fx.I.FlashLevel], stB)) Fx.I.CycleFlash();
                if (GUI.Button(new Rect(300, SLOT_Y + 22, 56, 18), "音:" + (Fx.I.Mute ? "OFF" : "ON"), stB)) Fx.I.ToggleMute();
            }
            pres?.DrawGUI();
            GUI.matrix = Matrix4x4.TRS(new Vector3(vOx, vOy, 0), Quaternion.identity, new Vector3(vScale, vScale, 1));
            Fx.I?.DrawFlashGUI();
            GUI.EndGroup();
        }
    }
}
