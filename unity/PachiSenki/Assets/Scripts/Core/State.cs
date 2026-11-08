// パチ戦記 コア: 乱数 / ゲーム状態 / セーブ(Web版 localStorage['pachi2'] = {v,gold,stage,lv} と同じ形・同じ丸め)
using System;

namespace PachiSenki.Core
{
    public interface IRng { double Next(); }

    /// <summary>テスト/再現用のシード付き乱数(Web版テストハーネスと同じ mulberry32)</summary>
    public sealed class Mulberry32 : IRng
    {
        uint a;
        public Mulberry32(uint seed) { a = seed; }
        public double Next()
        {
            unchecked
            {
                a += 0x6D2B79F5; uint t = a;
                t = (t ^ (t >> 15)) * (1 | t);
                t ^= t + (t ^ (t >> 7)) * (61 | t);
                return ((t ^ (t >> 14)) >> 0) / 4294967296.0;
            }
        }
    }

    public sealed class SysRng : IRng { readonly Random r = new Random(); public double Next() => r.NextDouble(); }

    /// <summary>Web版の G に相当する状態</summary>
    public sealed class GameState
    {
        public double gold, hp, mx, rush, sp, pool, jp, aw, fv, at, hit;
        public int stage = 1, combo, q, ai;
        public int[] lv = NewLv();
        public static int[] NewLv() { var a = new int[Upgrades.Count]; for (int i = 0; i < a.Length; i++) a[i] = 1; return a; }
    }

    /// <summary>セーブの中身(Unity 側は JsonUtility でそのまま直列化できる public フィールドのみ)</summary>
    [Serializable]
    public sealed class SaveData
    {
        public int v = 2;
        public double gold;
        public int stage = 1;
        public int[] lv = GameState.NewLv();

        public static SaveData From(GameState g) => new SaveData { gold = g.gold, stage = g.stage, lv = (int[])g.lv.Clone() };

        /// <summary>壊れた値/型違い/Infinity/NaN/巨大値を既定値に丸めて状態へ反映(Web版 00-core / 23-upgrades2 と同じ)</summary>
        public void ApplyTo(GameState g)
        {
            g.gold = Num(gold, 0, 1e300);
            g.stage = (int)Math.Floor(Num(stage, 1, 2000));
            for (int i = 0; i < g.lv.Length; i++)
            {
                double v0 = lv != null && i < lv.Length ? lv[i] : 1;
                g.lv[i] = (int)Math.Min(Math.Floor(Num(v0, 1, i < 10 ? 999 : 1e6)), int.MaxValue);
            }
        }
        static double Num(double v, double d, double hi) => double.IsFinite(v) && v > 0 ? Math.Min(v, hi) : d;
    }
}
