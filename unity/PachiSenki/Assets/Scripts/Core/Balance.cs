// パチ戦記 コア: バランス定数と強化データ(Web版 src/js/20-upgrades.js / 23-upgrades2.js / 21-pacing.js の移植)
// UnityEngine に依存しない純粋な C#(dotnet でテスト可能)。
using System;

namespace PachiSenki.Core
{
    public static class Bal
    {
        public static double atk0 = 5, atkg = 1.25, mulg = 1.2, hp0 = 1500, hpg = 1.32, boss = 4, costg = 1.63, costgCap = 1.45, costk = 50;
        public static double hit0 = .15, hitStep = .025, rushP = .10, jpP = .04;
        public static double spBall = .07, spHero = 1.0, spStep = .06, ultMin = 14, ultK = 42;
        public static double goldBase = 45, goldStep = .12, fevBase = 60, fevStep = .1;
        public static int pityStart = 20, pityEnd = 60;
        public static double evP = .15, supP = .3, supG = .25;
        public static double bossg = 1.15, soulRep = .5;   // ボス特効(添字15) / 転生の魂: 記録までの分の割合(Web版 94-prestige)
    }

    public sealed class UpgradeDef
    {
        public readonly string Icon, Name, Desc; public readonly double BaseCost; public readonly int UnlockStage, Max;
        public UpgradeDef(string icon, string name, string desc, double cost, int unlock, int max)
        { Icon = icon; Name = name; Desc = desc; BaseCost = cost; UnlockStage = unlock; Max = max; }
    }

    public static class Upgrades
    {
        public const int Inf = int.MaxValue;
        // 並び(=Lv配列の添字)は Web版のセーブ互換のため変更しない
        public static readonly UpgradeDef[] All = {
            new UpgradeDef("攻","英雄強化","ダメージ+25%",15,0,Inf),
            new UpgradeDef("速","発射速度","玉+0.5/秒 MAX11",20,0,11),
            new UpgradeDef("当","当たり確率","大当たり率+2.5% MAX12",30,0,12),
            new UpgradeDef("金","ゴールド","獲得+20%",25,0,Inf),
            new UpgradeDef("会","会心率","CRIT+3% MAX15",22,0,15),
            new UpgradeDef("運","ルーレット運","高倍率UP MAX15",40,0,15),
            new UpgradeDef("溜","SPチャージ","ゲージ+6% MAX8",35,3,8),
            new UpgradeDef("延","RUSH延長","継続+0.5秒 MAX5",50,8,5),
            new UpgradeDef("黄","黄金玉率","黄金玉+12% MAX10",60,12,10),
            new UpgradeDef("祭","FEVER率","発生率+10% MAX10",80,16,10),
            new UpgradeDef("撃","タップ攻撃","タップ威力+30%",45,5,Inf),
            new UpgradeDef("宝","お宝運","出現/報酬UP MAX10",70,10,10),
            new UpgradeDef("招","ルーレット招待","押せ!!発生+2% MAX10",90,15,10),
            new UpgradeDef("超","超倍率","化ける率+3% MAX10",120,20,10),
            new UpgradeDef("極","会心ダメージ","会心の威力+8%",1500,25,Inf),
            new UpgradeDef("討","ボス特効","ボスへのダメージ+15%",6000,30,Inf),
            new UpgradeDef("収","魂の収穫","転生の魂+6% MAX10",40000,40,10),   // 転生は Core 未移植のため効果は Web版のみ
        };
        public static int Count => All.Length;
    }

    /// <summary>JS の fmt(): 1.2K / 3.4M ...</summary>
    public static class Fmt
    {
        public static string N(double n)
        {
            if (double.IsPositiveInfinity(n)) return "MAX";
            if (n < 1e3) return Math.Floor(n).ToString();
            // Web版 00-core の fmt と同じ: T より上も単位(Qa..Dc)、それ以上は指数表記(桁が増えてもはみ出さない)
            string[] suf = { "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc" };
            int e = (int)Math.Floor(Math.Log10(n) / 3); double v = n / Math.Pow(10, e * 3);
            if (v >= 999.95) { v /= 1e3; e++; }
            if (e < suf.Length) return v.ToString("0.0", System.Globalization.CultureInfo.InvariantCulture) + suf[e];
            return n.ToString("0.00e0", System.Globalization.CultureInfo.InvariantCulture);
        }
    }
}
