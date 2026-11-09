// コアロジックのテスト + 簡易バランス計測(Web版 tests/smoke.js・tools/sim.js に相当)
using System;
using System.Linq;
using System.Text.Json;
using PachiSenki.Core;

static class Program
{
    static int bad = 0;
    static void Ok(bool c, string m) { if (!c) { bad++; Console.Error.WriteLine("FAIL: " + m); } }

    static PachiGame Run(uint seed, double minutes, bool buy, Action<PachiGame> perSec = null)
    {
        var g = new PachiGame(new Mulberry32(seed));
        for (int s = 0; s < minutes * 60; s++)
        {
            for (int f = 0; f < 20; f++) g.Tick(.05);
            if (buy)
            {
                int b = -1; double c = 1e300;
                for (int i = 0; i < Upgrades.Count; i++) if (g.G.stage >= Upgrades.All[i].UnlockStage && g.Cost(i) < c) { c = g.Cost(i); b = i; }
                if (b >= 0) g.Buy(b);
            }
            perSec?.Invoke(g);
        }
        return g;
    }

    static int Main()
    {
        // 1) 乱数(Web版ハーネスと同じ mulberry32)
        var r = new Mulberry32(1); Ok(Math.Abs(r.Next() - 0.6270739405881613) < 1e-12, "mulberry32 が Web版と一致しない");

        // 2) 長時間で例外/NaN/配列リークなし・決定的
        foreach (uint seed in new uint[] { 1, 2, 3 })
        {
            int hits = 0, kills = 0, rushEnd = 0, ults = 0; int maxBalls = 0, maxShots = 0;
            var g = new PachiGame(new Mulberry32(seed));
            g.OnBigHit += (jp, n) => hits++; g.OnKill += (b, gold) => kills++; g.OnRushEnd += () => rushEnd++; g.OnUlt += h => ults++;
            for (int s = 0; s < 15 * 60; s++)
            {
                for (int f = 0; f < 20; f++) g.Tick(.05);
                maxBalls = Math.Max(maxBalls, g.Balls.Count); maxShots = Math.Max(maxShots, g.Shots.Count);
                int b = -1; double c = 1e300; for (int i = 0; i < Upgrades.Count; i++) if (g.G.stage >= Upgrades.All[i].UnlockStage && g.Cost(i) < c) { c = g.Cost(i); b = i; }
                if (b >= 0) g.Buy(b);
            }
            Ok(double.IsFinite(g.G.gold) && double.IsFinite(g.G.hp) && double.IsFinite(g.G.rush) && double.IsFinite(g.G.sp), "NaN/Infinity seed " + seed);
            Ok(maxBalls <= 91 && maxShots < 50 && g.Queue.Count <= 4, $"配列リーク balls={maxBalls} shots={maxShots}");
            Ok(hits > 10 && kills > 10 && rushEnd > 3 && ults > 3, $"進行していない hits={hits} kills={kills} rushEnd={rushEnd} ult={ults}");
            Console.WriteLine($"seed{seed} 15分: stage {g.G.stage} 大当たり {hits} 撃破 {kills} 必殺 {ults} ハマり最大 {g.DryMax}");
        }
        var a1 = Run(7, 3, true); var a2 = Run(7, 3, true);
        Ok(a1.G.stage == a2.G.stage && a1.G.gold == a2.G.gold, "同じシードで結果が変わる(決定的でない)");

        // 3) セーブ: Web版と同じ JSON 形 / 壊れた値の丸め / 旧セーブ(lv 10個)
        var gs = Run(3, 2, true); var json = JsonSerializer.Serialize(gs.ToSave(), new JsonSerializerOptions { IncludeFields = true });
        Ok(json.Contains("\"v\":2") && json.Contains("\"stage\"") && json.Contains("\"lv\""), "セーブ形式: " + json);
        var back = new PachiGame(new Mulberry32(1)); back.Load(JsonSerializer.Deserialize<SaveData>(json, new JsonSerializerOptions { IncludeFields = true }));
        Ok(back.G.stage == gs.G.stage && back.G.lv.SequenceEqual(gs.G.lv), "セーブの読み戻し");
        var broken = new PachiGame(); broken.Load(new SaveData { gold = double.NaN, stage = -5, lv = new[] { 3, 0, -1, 2, 1, 1, 1, 1, 1, 1 } });
        Ok(broken.G.gold == 0 && broken.G.stage == 1 && broken.G.lv[0] == 3 && broken.G.lv[1] == 1 && broken.G.lv.Length == 17 && broken.G.lv[14] == 1 && broken.G.lv[16] == 1, "壊れたセーブ/旧セーブの丸め");

        // 3b) ボス特効(添字15): ボス戦だけ x1.15/Lv、通常の敵は変わらない
        { var bg = new PachiGame(new Mulberry32(1)); bg.G.stage = 4; double a4 = bg.Atk(); bg.G.lv[15] = 3; double b4 = bg.Atk(); bg.G.stage = 5; double b5 = bg.Atk(); bg.G.lv[15] = 1; double a5 = bg.Atk();
          Ok(a4 == b4 && Math.Abs(b5 / a5 - 1.15 * 1.15) < 1e-9, $"ボス特効 {a4} {b4} {a5} {b5}"); }

        // 4) 天井: 通常時 pityEnd 回はずれたら次は必ず当たる
        var p = new PachiGame(new Mulberry32(5)); int maxDry = 0;
        p.OnSpinStart += s => { }; for (int s = 0; s < 40 * 60; s++) { for (int f = 0; f < 20; f++) p.Tick(.05); maxDry = Math.Max(maxDry, p.DryMax); }
        Ok(maxDry <= Bal.pityEnd, "天井を超えてハマった: " + maxDry);

        // 4b) 押せ!!: PUSH 待ち中に PressPush → 結果が決まり、回転後に報酬。PUSH 中は RUSH が減らない
        {
            var e = new PachiGame(new Mulberry32(9)); bool seenRoul = false, pushedOk = false, rewarded = false, rushHeld = true;
            e.OnRouletteResult += (m, sup) => rewarded = true;
            for (int s = 0; s < 120 * 60 * 20 && !(seenRoul && rewarded); s++)
            {
                e.Tick(.05);
                if (e.PushActive)
                {
                    double r0 = e.G.rush; e.Tick(.05); if (e.PushActive && e.G.rush != r0) rushHeld = false;
                    if (e.EventKind == HitEventKind.Roulette && !seenRoul) { seenRoul = true; pushedOk = e.PressPush() && e.PushEnd >= 0 && e.EventRouletteM >= 2; rewarded = false; }
                    else e.PressPush();
                }
            }
            Ok(seenRoul && pushedOk && rewarded, $"押せ!!→ルーレット seen={seenRoul} pushed={pushedOk} rewarded={rewarded}");
            Ok(rushHeld, "PUSH 待ちの間に RUSH が減った");
        }

        // 4c) 擬似連/復活/保留変化/RUSHリザルト: 当否は変わらない(回転開始時の当たり数 = 大当たり数)、各演出が起きる
        {
            var e = new PachiGame(new Mulberry32(21)); int startHits = 0, big = 0, pz = 0, rv = 0, hold = 0, res = 0; string grade = "";
            e.OnSpinStart += sp => { if (sp.hit) startHits++; }; e.OnBigHit += (j, n) => big++; e.OnPseudo += k => pz++; e.OnRevive += () => rv++;
            e.OnHoldChange += (i, c) => hold++; e.OnRushResult += r => { res++; grade = r.Grade; };
            for (int s = 0; s < 40 * 60 * 20; s++) { e.Tick(.05); if (e.PushActive) e.PressPush(); }
            int pend = e.CurrentSpin != null && e.CurrentSpin.hit ? 1 : 0;
            Ok(big == startHits - pend, $"当否と大当たり数が不一致 start={startHits} big={big}");
            Ok(pz > 0 && rv > 0 && hold > 0 && res > 0, $"演出が起きない pz={pz} rv={rv} hold={hold} res={res}");
            Ok(new[] { "C", "C+", "B", "B+", "A", "A+", "S", "S+" }.Contains(grade), "ランク: " + grade);
            Ok(PachiGame.RushGrade(PachiGame.RushScore(6, 14, true)) == "S+" && PachiGame.RushGrade(PachiGame.RushScore(1, 0, false)) == "C", "ランク計算");
            Console.WriteLine($"40分: 擬似連 {pz} 復活 {rv} 保留変化 {hold} リザルト {res}");
        }

        // 5) バランス計測(Web版 tools/sim.js と同じ買い方: 毎秒いちばん安い強化を買う)
        double sumSt = 0; int n = 5;
        for (uint seed = 1; seed <= n; seed++) sumSt += Run(seed, 30, true).G.stage;
        Console.WriteLine($"30分 x {n}シード 平均到達 stage {sumSt / n:0.0}(Web版 sim は 約42。遺物/図鑑/魂など未移植の分は含まない)");
        Ok(sumSt / n > 15 && sumSt / n < 80, "到達ステージが想定外");

        if (bad > 0) { Console.Error.WriteLine(bad + " failure(s)"); return 1; }
        Console.WriteLine("CORE OK"); return 0;
    }
}
