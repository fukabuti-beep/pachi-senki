// パチ戦記 Unity版: コア(PachiSenki.Core)を毎フレーム動かす最小の「つなぎ」+ 仮表示(IMGUI)。
// どのシーンで再生しても自動で起動する(RuntimeInitializeOnLoadMethod)。本番の描画(ドット絵/演出/音)は段階的に置き換える(UNITY.md)。
// セーブ: PlayerPrefs["pachi2"] に Web版と同じ JSON({v,gold,stage,lv})。
using System.Collections.Generic;
using UnityEngine;
using PachiSenki.Core;

namespace PachiSenki.View
{
    public sealed class GameRunner : MonoBehaviour
    {
        const string SaveKey = "pachi2";
        public PachiGame Game { get; private set; }
        float saveT; string banner = ""; float bannerT; Color bannerC = Color.yellow;
        readonly Queue<string> log = new Queue<string>();
        Texture2D white;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Boot()
        {
            if (FindObjectOfType<GameRunner>() != null) return;
            var go = new GameObject("PachiSenki"); DontDestroyOnLoad(go); go.AddComponent<GameRunner>();
        }

        void Awake()
        {
            Application.targetFrameRate = 60;
            Game = new PachiGame();
            if (PlayerPrefs.HasKey(SaveKey)) { try { Game.Load(JsonUtility.FromJson<SaveData>(PlayerPrefs.GetString(SaveKey))); } catch { } }
            Game.OnBanner += (t, c) => { banner = t; bannerT = 1.7f; ColorUtility.TryParseHtmlString(c, out bannerC); Log(t); };
            Game.OnJackpot += g => Log("JACKPOT +" + Fmt.N(g));
            Game.OnKill += (boss, g) => { if (boss) Log("ボス撃破 +" + Fmt.N(g)); };
            white = Texture2D.whiteTexture;
        }

        void Log(string s) { log.Enqueue(s); while (log.Count > 6) log.Dequeue(); }

        void Update()
        {
            Game.Tick(Time.deltaTime);
            if (bannerT > 0) bannerT -= Time.deltaTime;
            saveT += Time.deltaTime; if (saveT > 4) { saveT = 0; Save(); }
            // 盤面タップ(画面下側を盤面とみなす仮実装)
            if (Input.GetMouseButtonDown(0) && Input.mousePosition.y < Screen.height * .7f) Game.TapBoard(Input.mousePosition.x / Screen.width * PachiGame.PW);
        }

        void Save() { PlayerPrefs.SetString(SaveKey, JsonUtility.ToJson(Game.ToSave())); PlayerPrefs.Save(); }
        void OnApplicationPause(bool p) { if (p) Save(); }
        void OnApplicationQuit() { Save(); }

        // ---- 仮表示(IMGUI)。本番は SpriteRenderer/UGUI に置き換える ----
        void Box(float x, float y, float w, float h, Color c) { var o = GUI.color; GUI.color = c; GUI.DrawTexture(new Rect(x, y, w, h), white); GUI.color = o; }

        void OnGUI()
        {
            var G = Game.G; float sw = Screen.width, sh = Screen.height, s = Mathf.Min(sw / 360f, sh / 760f);
            GUI.matrix = Matrix4x4.Scale(new Vector3(s, s, 1));
            Box(0, 0, 360, 760, new Color(.04f, .03f, .13f));
            var st = new GUIStyle(GUI.skin.label) { fontSize = 14 }; st.normal.textColor = Color.white;
            GUI.Label(new Rect(8, 4, 344, 20), $"STAGE {G.stage}{(Game.IsBoss ? " BOSS" : "")}   G {Fmt.N(G.gold)}   保留 {G.q}", st);
            // 戦闘(上 150px)
            Box(0, 26, 360, 150, new Color(.15f, .08f, .3f));
            Box(200, 40, 150, 8, Color.black); Box(200, 40, 150 * Mathf.Clamp01((float)(G.hp / System.Math.Max(1, G.mx))), 8, new Color(.3f, .9f, .4f));
            for (int i = 0; i < 3; i++) Box(20 + i * 46, 110, 30, 40, new[] { new Color(1, .45f, .3f), new Color(.45f, .55f, 1), new Color(.4f, .9f, .4f) }[i]);
            Box(250, 90, 60, 60, Game.IsBoss ? new Color(.9f, .2f, .2f) : new Color(.3f, .6f, 1));
            var tag = (G.rush > 0 ? $"RUSH {G.rush:0.0}s x{G.combo}  " : "") + (G.fv > 0 ? "FEVER  " : "") + (G.aw > 0 ? "覚醒  " : "") + (G.jp > 0 ? "JACKPOT" : "");
            GUI.Label(new Rect(8, 152, 344, 20), tag, st);
            // スロット
            var sp = Game.CurrentSpin; GUI.Label(new Rect(8, 180, 344, 24), sp == null ? "---" : $"[{(sp.t >= sp.stop[0] ? sp.faces[0] + "" : "?")}] [{(sp.t >= sp.stop[1] ? sp.faces[1] + "" : "?")}] [{(sp.t >= sp.stop[2] ? sp.faces[2] + "" : "?")}] {(sp.type == 2 ? "SUPER REACH" : sp.type == 1 ? "リーチ" : "")}", st);
            // 盤面(下 400px、y=206 から)
            float oy = 206; Box(0, oy, 360, 400, new Color(.1f, .06f, .25f));
            foreach (var p in Game.Pegs) Box((float)p.x - (float)p.r, oy + (float)p.y - (float)p.r, (float)p.r * 2, (float)p.r * 2, p.bumper ? new Color(1, .3f, .5f) : new Color(.75f, .8f, .95f));
            Box(158, oy + 364, 44, 10, new Color(1, .85f, .2f));
            foreach (var b in Game.Balls) Box((float)b.x - 4, oy + (float)b.y - 4, 8, 8, b.g == 2 ? new Color(1, .85f, 0) : Color.white);
            // バナー
            if (bannerT > 0) { var bs = new GUIStyle(st) { fontSize = 34, alignment = TextAnchor.MiddleCenter }; bs.normal.textColor = bannerC; GUI.Label(new Rect(0, 300, 360, 50), banner, bs); }
            // 強化ボタン(下部)
            float y = 612; int col = 0;
            for (int i = 0; i < Upgrades.Count; i++)
            {
                var u = Upgrades.All[i]; if (G.stage < u.UnlockStage) continue;
                var c = Game.Cost(i); GUI.enabled = G.gold >= c;
                if (GUI.Button(new Rect(4 + col * 89, y, 86, 34), $"{u.Name}\nLv{G.lv[i]} {Fmt.N(c)}")) Game.Buy(i);
                GUI.enabled = true; if (++col == 4) { col = 0; y += 36; }
            }
            int k = 0; foreach (var l in log) GUI.Label(new Rect(8, 206 + 4 + (k++) * 16, 344, 18), l, st);
        }
    }
}
