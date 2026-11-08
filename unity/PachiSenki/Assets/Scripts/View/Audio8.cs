// 8bit の効果音と BGM をコードで合成する(音声ファイルなし)。Web版 75-audio / 77-se の考え方を移植した簡易版。
// 効果音: キュイン・リーチ・当たりファンファーレ・JACKPOT・コイン・打撃・ルーレットのティック・決定音・押せ!!のドン
// BGM: 通常 / RUSH / FEVER / JACKPOT の4曲(オリジナルの短いループ)。状態に合わせて切り替える。
using System.Collections.Generic;
using UnityEngine;

namespace PachiSenki.View
{
    public sealed class Audio8 : MonoBehaviour
    {
        public static Audio8 I { get; private set; }
        const int SR = 22050;
        AudioSource se, bgm; readonly Dictionary<string, AudioClip> clips = new Dictionary<string, AudioClip>();
        string bgmNow = ""; float lastHit;

        void Awake()
        {
            I = this;
            se = gameObject.AddComponent<AudioSource>(); se.playOnAwake = false;
            bgm = gameObject.AddComponent<AudioSource>(); bgm.playOnAwake = false; bgm.loop = true; bgm.volume = .35f;
        }

        // ---- 合成の部品 ----
        static float Sq(float ph, float duty = .5f) => (ph % 1f) < duty ? 1 : -1;
        static float Tri(float ph) { float x = ph % 1f; return x < .5f ? x * 4 - 1 : 3 - x * 4; }
        static float Mtof(float m) => 440f * Mathf.Pow(2, (m - 69) / 12f);
        AudioClip Make(string name, float sec, System.Func<float, float> f)
        {
            if (clips.TryGetValue(name, out var c)) return c;
            int n = (int)(SR * sec); var d = new float[n];
            for (int i = 0; i < n; i++) d[i] = Mathf.Clamp(f(i / (float)SR), -1, 1) * .5f;
            c = AudioClip.Create(name, n, 1, SR, false); c.SetData(d, 0); clips[name] = c; return c;
        }
        // 音を順に並べる(各音: 周波数, 長さ, 波形)
        static float Seq(float t, float[] fs, float step, float duty, float decay)
        {
            int k = Mathf.FloorToInt(t / step); if (k < 0 || k >= fs.Length || fs[k] <= 0) return 0;
            float lt = t - k * step; return Sq(fs[k] * t, duty) * Mathf.Exp(-lt * decay);
        }

        public void Play(string name, float vol = 1)
        {
            if (Fx.I != null && Fx.I.Mute) return; AudioClip c = null;
            switch (name)
            {
                case "kyuin": c = Make(name, .7f, t => { float p = (t * 9) % 1; float f = 1200 + p * 1600; return Sq(f * t, .25f) * (1 - t / .7f); }); break;
                case "reach": c = Make(name, .6f, t => Seq(t, new[] { Mtof(76), Mtof(79), Mtof(83), Mtof(88) }, .12f, .25f, 6)); break;
                case "super": c = Make(name, 1.1f, t => Seq(t, new[] { Mtof(72), Mtof(76), Mtof(79), Mtof(84), Mtof(88), Mtof(91), Mtof(96), Mtof(100) }, .12f, .5f, 4) + Sq(Mtof(48) * t, .5f) * .2f * (1 - t / 1.1f)); break;
                case "win": c = Make(name, 1.4f, t => Seq(t, new[] { Mtof(72), Mtof(76), Mtof(79), Mtof(84), 0, Mtof(84), Mtof(88), Mtof(91), Mtof(96) }, .13f, .5f, 3) + Tri(Mtof(48) * t) * .3f * (1 - t / 1.4f)); break;
                case "jackpot": c = Make(name, 2.4f, t => Seq(t, new[] { Mtof(79), Mtof(84), Mtof(88), Mtof(91), Mtof(96), 0, Mtof(91), Mtof(96), Mtof(100), Mtof(103), Mtof(108), Mtof(108), Mtof(108) }, .15f, .5f, 2) + Tri(Mtof(43 + (int)(t * 4) % 2 * 7) * t) * .35f); break;
                case "coin": c = Make(name, .25f, t => Sq((t < .07f ? Mtof(83) : Mtof(88)) * t, .5f) * (1 - t / .25f)); break;
                case "hit": if (Time.time - lastHit < .05f) return; lastHit = Time.time; c = Make(name, .08f, t => (Random.value * 2 - 1) * (1 - t / .08f) * .7f + Sq(110 * t) * .3f * (1 - t / .08f)); vol *= .5f; break;
                case "crit": c = Make(name, .2f, t => Sq((180 - t * 500) * t, .5f) * (1 - t / .2f) + (Random.value * 2 - 1) * .4f * (1 - t / .2f)); break;
                case "tick": c = Make(name, .03f, t => Sq(1800 * t, .25f) * (1 - t / .03f)); vol *= .5f; break;
                case "decide": c = Make(name, .35f, t => Sq((t < .1f ? Mtof(84) : Mtof(91)) * t, .25f) * (1 - t / .35f)); break;
                case "push": c = Make(name, .5f, t => Sq((120 - t * 120) * t, .5f) * Mathf.Exp(-t * 6) + (Random.value * 2 - 1) * Mathf.Exp(-t * 20) * .5f); break;
                case "kill": c = Make(name, .3f, t => Sq((880 - t * 1500) * t, .5f) * (1 - t / .3f)); break;
                case "banner": c = Make(name, .3f, t => Seq(t, new[] { Mtof(81), Mtof(88) }, .1f, .25f, 8)); break;
            }
            if (c != null) se.PlayOneShot(c, vol);
        }

        // ---- BGM(16拍のループ。旋律はオリジナル)----
        AudioClip Song(string name, float bpm, int[] mel, int[] bass, float duty)
        {
            float beat = 60 / bpm / 2;   // 8分音符
            float len = beat * mel.Length;
            return Make("bgm_" + name, len, t =>
            {
                int k = Mathf.FloorToInt(t / beat) % mel.Length; float lt = t - Mathf.FloorToInt(t / beat) * beat;
                float v = 0; if (mel[k] > 0) v += Sq(Mtof(mel[k]) * t, duty) * .35f * Mathf.Exp(-lt * 3);
                int b = bass[k % bass.Length]; if (b > 0) v += Tri(Mtof(b) * t) * .45f;
                if (k % 2 == 0) v += (Random.value * 2 - 1) * .15f * Mathf.Exp(-lt * 40);   // ハイハット
                return v;
            });
        }
        public void SetBgm(string state)
        {
            if (state == bgmNow) return; bgmNow = state;
            AudioClip c;
            switch (state)
            {
                case "rush": c = Song("rush", 156, new[] { 76, 79, 83, 79, 84, 83, 79, 76, 77, 81, 84, 81, 86, 84, 81, 79, 76, 79, 83, 86, 88, 86, 83, 79, 81, 84, 88, 91, 88, 84, 81, 0 }, new[] { 45, 45, 52, 52, 41, 41, 48, 48, 43, 43, 50, 50, 45, 45, 52, 52 }, .25f); break;
                case "fever": c = Song("fever", 140, new[] { 84, 0, 86, 88, 0, 91, 88, 86, 84, 0, 81, 79, 81, 84, 86, 0 }, new[] { 48, 55, 48, 55, 45, 52, 45, 52 }, .5f); break;
                case "jp": c = Song("jp", 168, new[] { 91, 96, 91, 96, 93, 98, 93, 98, 95, 100, 95, 100, 96, 103, 108, 0 }, new[] { 43, 50, 43, 50, 45, 52, 47, 54 }, .5f); break;
                default: c = Song("normal", 120, new[] { 72, 0, 76, 79, 77, 76, 74, 0, 72, 74, 76, 0, 79, 77, 76, 74, 71, 0, 74, 77, 76, 74, 72, 0, 74, 76, 77, 79, 76, 74, 72, 0 }, new[] { 48, 48, 55, 55, 53, 53, 50, 50, 43, 43, 50, 50, 48, 48, 55, 55 }, .5f); break;
            }
            bgm.clip = c; bgm.mute = Fx.I != null && Fx.I.Mute; bgm.Play();
        }
        void Update() { if (bgm != null && Fx.I != null) bgm.mute = Fx.I.Mute; }
    }
}
