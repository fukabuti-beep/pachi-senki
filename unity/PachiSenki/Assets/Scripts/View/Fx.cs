// 演出の土台: 画面フラッシュ(強/弱/OFF の設定つき・光過敏に配慮して頻度制限)・画面揺れ・パーティクル(爆発/コインの雨)・設定の保存。
// Web版 25-ui(flash/shake) / 30-battle(burst) / 87b-jpfx(コインの雨) / 28-settings 相当。
using System.Collections.Generic;
using UnityEngine;

namespace PachiSenki.View
{
    public sealed class Fx : MonoBehaviour
    {
        public static Fx I { get; private set; }
        // ---- 設定(PlayerPrefs) ----
        public int FlashLevel { get; private set; } = 2;     // 2=強 1=弱 0=OFF
        public bool Mute { get; private set; }
        public void CycleFlash() { FlashLevel = (FlashLevel + 2) % 3; PlayerPrefs.SetInt("pachi2_fl", FlashLevel); }
        public void ToggleMute() { Mute = !Mute; PlayerPrefs.SetInt("pachi2_mute", Mute ? 1 : 0); }

        float flashA, lastFlash = -9; Color flashC = Color.white;
        float shakeT, shakeAmp;
        Transform root;
        struct P { public SpriteRenderer r; public Vector2 v; public float life, max, spin; public bool coin; }
        readonly List<P> live = new List<P>(); readonly Stack<SpriteRenderer> pool = new Stack<SpriteRenderer>();
        const int MaxParticles = 300;
        Sprite dot, coin;

        void Awake()
        {
            I = this;
            FlashLevel = PlayerPrefs.GetInt("pachi2_fl", 2); Mute = PlayerPrefs.GetInt("pachi2_mute", 0) == 1;
            root = new GameObject("Particles").transform; root.SetParent(transform, false);
            dot = SpriteBank.White(); coin = SpriteBank.Circle(3, new Color(1, .83f, 0), new Color(.6f, .4f, 0));
        }

        /// <summary>画面フラッシュ。強=最大0.8/弱=0.22・0.5秒に1回まで。OFF なら何もしない</summary>
        public void Flash(Color c)
        {
            if (FlashLevel <= 0) return; float now = Time.time;
            if (FlashLevel == 1 && now - lastFlash < .5f) return; if (now - lastFlash < .12f) return;   // 高頻度の点滅を防ぐ
            lastFlash = now; flashC = c; flashA = FlashLevel == 2 ? .8f : .22f;
        }
        public void Shake(float amp = 4, float t = .25f) { if (FlashLevel <= 0) return; shakeAmp = amp; shakeT = t; }

        SpriteRenderer Get(Sprite s)
        {
            var r = pool.Count > 0 ? pool.Pop() : new GameObject("p").AddComponent<SpriteRenderer>();
            r.transform.SetParent(root, false); r.sprite = s; r.sortingOrder = 20; r.gameObject.SetActive(true); return r;
        }
        /// <summary>爆発(ワールド座標 pos から n 個の粒が飛び散る)</summary>
        public void Burst(Vector3 pos, int n, Color c, float speed = 90)
        {
            for (int i = 0; i < n && live.Count < MaxParticles; i++)
            {
                float a = Random.value * Mathf.PI * 2, sp = speed * (.4f + Random.value);
                var r = Get(dot); r.color = c; float sz = 2 + Random.value * 2; r.transform.localScale = new Vector3(sz, sz, 1); r.transform.position = pos;
                live.Add(new P { r = r, v = new Vector2(Mathf.Cos(a) * sp, Mathf.Sin(a) * sp + 40), life = 0, max = .6f + Random.value * .5f });
            }
        }
        /// <summary>コインの雨(画面上から n 枚)</summary>
        public void CoinRain(int n, float halfW = 180, float top = 380)
        {
            for (int i = 0; i < n && live.Count < MaxParticles; i++)
            {
                var r = Get(coin); r.color = Color.white; r.transform.localScale = new Vector3(2, 2, 1);
                r.transform.position = new Vector3(Random.Range(-halfW, halfW), top + Random.value * 260, 0);
                live.Add(new P { r = r, v = new Vector2(Random.Range(-15f, 15f), -(120 + Random.value * 160)), life = 0, max = 4f, spin = Random.value * 10, coin = true });
            }
        }

        void Update()
        {
            float dt = Time.deltaTime;
            if (flashA > 0) flashA = Mathf.Max(0, flashA - dt * 1.8f);
            var cam = Camera.main;
            if (cam != null) { if (shakeT > 0) { shakeT -= dt; cam.transform.position = new Vector3(Random.Range(-shakeAmp, shakeAmp), Random.Range(-shakeAmp, shakeAmp), -10); } else cam.transform.position = new Vector3(0, 0, -10); }
            for (int i = live.Count - 1; i >= 0; i--)
            {
                var p = live[i]; p.life += dt;
                if (p.life >= p.max || p.r.transform.position.y < -400) { p.r.gameObject.SetActive(false); pool.Push(p.r); live.RemoveAt(i); continue; }
                if (!p.coin) p.v.y -= 260 * dt;
                p.r.transform.position += new Vector3(p.v.x * dt, p.v.y * dt, 0);
                if (p.coin) { float w = Mathf.Abs(Mathf.Cos(p.life * 8 + p.spin)) * 2 + .3f; p.r.transform.localScale = new Vector3(w, 2, 1); }
                else { var c = p.r.color; c.a = 1 - p.life / p.max; p.r.color = c; }
                live[i] = p;
            }
        }

        /// <summary>フラッシュは GameRunner の OnGUI の最後に描く(画面全体=仮想 360x760 の範囲)</summary>
        public void DrawFlashGUI()
        {
            if (flashA <= 0) return; var o = GUI.color; GUI.color = new Color(flashC.r, flashC.g, flashC.b, flashA);
            GUI.DrawTexture(new Rect(0, 0, 360, 760), Texture2D.whiteTexture); GUI.color = o;
        }
        public int ParticleCount => live.Count;
    }
}
