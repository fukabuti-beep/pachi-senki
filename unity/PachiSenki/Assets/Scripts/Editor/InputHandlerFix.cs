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
            var ps = Unsupported.GetSerializedAssetInterfaceSingleton("PlayerSettings");
            if (ps == null) return;
            var so = new SerializedObject(ps); var p = so.FindProperty("activeInputHandler");
            if (p == null) { UnityEngine.Debug.LogWarning("[パチ戦記] 入力設定が見つかりません。編集 > プロジェクト設定 > プレイヤー > アクティブな入力処理 を「入力マネージャー(旧)」にしてください"); return; }
            if (p.intValue != 1) return;   // 0=旧方式 2=両方 は OK
            p.intValue = 0; so.ApplyModifiedPropertiesWithoutUndo(); AssetDatabase.SaveAssets();
            if (EditorUtility.DisplayDialog("パチ戦記", "入力の設定を自動で直しました。\n反映には Unity の再起動が必要です。", "今すぐ再起動", "あとで"))
                EditorApplication.OpenProject(System.IO.Directory.GetCurrentDirectory());
        };
    }
}
