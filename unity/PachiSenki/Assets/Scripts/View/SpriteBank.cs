// SpriteData(Web版から自動生成したドット絵データ)から Unity の Sprite を作ってキャッシュする。
// 1px = 1ワールド単位、補間なし(Point)でくっきり表示。円(釘/玉)や単色の板も生成する。
using System.Collections.Generic;
using UnityEngine;

namespace PachiSenki.View
{
    public static class SpriteBank
    {
        static readonly Dictionary<string, Sprite> cache = new Dictionary<string, Sprite>();
        const string Keys = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

        static Texture2D NewTex(int w, int h)
        {
            var t = new Texture2D(w, h, TextureFormat.RGBA32, false) { filterMode = FilterMode.Point, wrapMode = TextureWrapMode.Clamp };
            return t;
        }

        /// <summary>ドット絵(英雄 h0〜h2 / 雑魚 m0〜m9 / ボス b0〜b3 など)。無い名前は null</summary>
        public static Sprite Get(string name)
        {
            if (cache.TryGetValue(name, out var s)) return s;
            if (!SpriteData.All.TryGetValue(name, out var d)) return null;
            var tex = NewTex(d.W, d.H); var px = new Color32[d.W * d.H];
            var pal = new Color32[d.Palette.Length];
            for (int i = 0; i < pal.Length; i++) { ColorUtility.TryParseHtmlString(d.Palette[i], out var c); pal[i] = c; }
            var rows = d.Rows.Split('|');
            for (int y = 0; y < d.H; y++)
                for (int x = 0; x < d.W; x++)
                {
                    char ch = y < rows.Length && x < rows[y].Length ? rows[y][x] : '.';
                    int k = Keys.IndexOf(ch);
                    // テクスチャは下から上なので y を反転
                    px[(d.H - 1 - y) * d.W + x] = k >= 0 && k < pal.Length ? pal[k] : new Color32(0, 0, 0, 0);
                }
            tex.SetPixels32(px); tex.Apply();
            s = Sprite.Create(tex, new Rect(0, 0, d.W, d.H), new Vector2(.5f, .5f), 1f);
            cache[name] = s; return s;
        }

        /// <summary>塗りつぶしの円(半径 r ピクセル、ふち少し暗く)。釘・玉・バンパー用</summary>
        public static Sprite Circle(int r, Color fill, Color edge)
        {
            string key = "circle" + r + fill + edge;
            if (cache.TryGetValue(key, out var s)) return s;
            int n = r * 2 + 1; var tex = NewTex(n, n); var px = new Color32[n * n];
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
                {
                    float dx = x - r, dy = y - r, d = Mathf.Sqrt(dx * dx + dy * dy);
                    Color c = d <= r - 1 ? fill : d <= r + .3f ? edge : new Color(0, 0, 0, 0);
                    if (d <= r - 1 && dx < -r * .2f && dy > r * .2f) c = Color.Lerp(fill, Color.white, .45f);   // ハイライト
                    px[y * n + x] = c;
                }
            tex.SetPixels32(px); tex.Apply();
            s = Sprite.Create(tex, new Rect(0, 0, n, n), new Vector2(.5f, .5f), 1f);
            cache[key] = s; return s;
        }

        /// <summary>1x1 の白(色と拡大で板・バーを描く)</summary>
        public static Sprite White()
        {
            if (cache.TryGetValue("white", out var s)) return s;
            var tex = NewTex(1, 1); tex.SetPixel(0, 0, Color.white); tex.Apply();
            s = Sprite.Create(tex, new Rect(0, 0, 1, 1), new Vector2(.5f, .5f), 1f);
            cache["white"] = s; return s;
        }
    }
}
