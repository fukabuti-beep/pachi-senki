// 入力方式の自動修正(エディタ専用)。このプロジェクトは Input System パッケージを使わず、旧方式(Input Manager)で動かす。
// プレイヤー設定が「Input System のみ」になっていたら旧方式に直し、再起動をすすめる(設定は再起動後に反映される)。
using UnityEditor;

static class InputHandlerFix
{
    [InitializeOnLoadMethod]
    static void Check()
    {
        EditorApplication.delayCall += () =>
        {
            var objs = AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/ProjectSettings.asset");
            if (objs == null || objs.Length == 0) return;
            var so = new SerializedObject(objs[0]); var p = so.FindProperty("activeInputHandler");
            if (p == null || p.intValue != 1) return;   // 0=旧方式 2=両方 は OK
            p.intValue = 0; so.ApplyModifiedPropertiesWithoutUndo(); AssetDatabase.SaveAssets();
            if (EditorUtility.DisplayDialog("パチ戦記", "入力の設定を自動で直しました。\n反映には Unity の再起動が必要です。", "今すぐ再起動", "あとで"))
                EditorApplication.OpenProject(System.IO.Directory.GetCurrentDirectory());
        };
    }
}
