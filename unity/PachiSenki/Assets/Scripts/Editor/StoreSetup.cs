// ストア版(iOS/Android)向けのプレイヤー設定を、Unity を開いた時に自動で当てる(エディタ専用)。
// ProjectSettings.asset を Git で直接書き換えると作り手の PC 側の変更とぶつかるため、コードで設定する方式にしている。
// 手動で当て直す: メニュー「パチ戦記 > ストア用の設定を適用」。値を変えたら Version を上げる。
using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.SceneManagement;
using UnityEngine;

static class StoreSetup
{
    const int Version = 2;
    const string Key = "pachi_store_setup";
    const string Bundle = "com.fukabuchi.pachisenki";
    const string ScenePath = "Assets/Scenes/Main.unity";

    [InitializeOnLoadMethod]
    static void Auto()
    {
        EditorApplication.delayCall += () => { if (EditorPrefs.GetInt(Key, 0) < Version) Apply(false); };
    }

    [MenuItem("パチ戦記/ストア用の設定を適用", false, 20)]
    static void Manual() => Apply(true);

    static void Apply(bool verbose)
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode) return;   // 再生中は触らない(次回起動時に当てる)
        PlayerSettings.companyName = "fukabuchi";
        PlayerSettings.productName = "パチ戦記";
        PlayerSettings.bundleVersion = "1.0.0";
        PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Android, Bundle);
        PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.iOS, Bundle);
        // 縦画面に固定(Web版の筐体は縦長)
        PlayerSettings.defaultInterfaceOrientation = UIOrientation.Portrait;
        PlayerSettings.allowedAutorotateToPortrait = true;
        PlayerSettings.allowedAutorotateToPortraitUpsideDown = false;
        PlayerSettings.allowedAutorotateToLandscapeLeft = false;
        PlayerSettings.allowedAutorotateToLandscapeRight = false;
        // 起動画面の背景はゲームと同じ濃い紫
        PlayerSettings.SplashScreen.backgroundColor = new Color32(10, 7, 32, 255);
        PlayerSettings.statusBarHidden = true;
        // 通信しない(フォントも HTML に内蔵)のでネット権限は付けない
        PlayerSettings.Android.forceInternetPermission = false;
        // iOS: Xcode で「Team」を選ぶだけで署名できるよう自動署名にする(無料の Apple ID でも可)
        PlayerSettings.iOS.appleEnableAutomaticSigning = true;
        // アイコン(Web版 PWA と同じ絵を 1024px に拡大したもの)
        var icon = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Branding/icon.png");
        if (icon != null)
        {
            var imp = AssetImporter.GetAtPath("Assets/Branding/icon.png") as TextureImporter;
            if (imp != null && (imp.filterMode != FilterMode.Point || imp.textureCompression != TextureImporterCompression.Uncompressed || imp.npotScale != TextureImporterNPOTScale.None))
            {
                imp.filterMode = FilterMode.Point; imp.textureCompression = TextureImporterCompression.Uncompressed; imp.npotScale = TextureImporterNPOTScale.None; imp.mipmapEnabled = false; imp.SaveAndReimport();
            }
            // NamedBuildTarget.Unknown = 全機種共通の「既定のアイコン」(iOS/Android の各サイズはここから自動で縮小される)
            PlayerSettings.SetIcons(NamedBuildTarget.Unknown, new[] { icon }, IconKind.Any);
        }
        EnsureScene();
        AssetDatabase.SaveAssets();
        EditorPrefs.SetInt(Key, Version);
        Debug.Log("[パチ戦記] ストア用の設定を適用しました(アプリ名/ID " + Bundle + "/縦画面/アイコン/ビルド用シーン)");
        if (verbose) EditorUtility.DisplayDialog("パチ戦記", "ストア用の設定を適用しました。\nアプリ名: パチ戦記\nID: " + Bundle + "\n縦画面固定・アイコン・ビルド用シーン設定済み", "OK");
    }

    // ビルドには「Scenes In Build」に 1 つ以上のシーンが必要(空だと開いているシーンが使われ、未保存だと止まる)。
    // ゲームは RuntimeInitializeOnLoadMethod で自動起動するので、中身が空のシーンを 1 つ作って登録する。
    static void EnsureScene()
    {
        if (EditorBuildSettings.scenes.Length > 0) return;   // 作り手が自分で登録していればそのまま
        if (!File.Exists(ScenePath))
        {
            // 開いているシーンに未保存の変更があれば保存を確認してから(キャンセルなら今回は作らない)
            if (!EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo()) return;
            Directory.CreateDirectory(Path.GetDirectoryName(ScenePath));
            var sc = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            if (!EditorSceneManager.SaveScene(sc, ScenePath)) { Debug.LogWarning("[パチ戦記] シーンを保存できませんでした: " + ScenePath); return; }
        }
        EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
    }
}
