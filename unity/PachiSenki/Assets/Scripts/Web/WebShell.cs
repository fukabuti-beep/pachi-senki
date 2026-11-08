// Web版(dist/pachi-senki.html と同じ単一HTML)を、アプリの中の WebView でそのまま動かす。見た目・BGM・機能は Web版と完全に同じ。
// HTML は tools/build.js が Assets/StreamingAssets/pachi-senki.html に書き出す(Web版を直したら node tools/build.js で更新)。
// WebView は unity-webview(Packages/net.gree.unity-webview, GREE, zlib ライセンス)。Windows エディタは WebView2 で表示する。
// エディタでは上のメニュー「パチ戦記」で Web版 / Unity版(作り直し中)を切り替えられる。アプリ(ビルド)は常に Web版。
using System.Collections;
using System.IO;
using UnityEngine;
using UnityEngine.Networking;
using Gree.UnityWebView;

namespace PachiSenki.Web
{
    public sealed class WebShell : MonoBehaviour
    {
        const string Html = "pachi-senki.html";
        WebViewObject wv; Rect lastSafe; int lastW, lastH; string status = "読み込み中…"; bool loaded;

        public static bool UseWeb
        {
            get
            {
#if UNITY_EDITOR
                return UnityEditor.EditorPrefs.GetInt("pachi_mode", 0) == 0;
#else
                return true;
#endif
            }
        }

#if UNITY_EDITOR
        [UnityEditor.MenuItem("パチ戦記/Web版で起動(完全版)", false, 1)] static void ModeWeb() => UnityEditor.EditorPrefs.SetInt("pachi_mode", 0);
        [UnityEditor.MenuItem("パチ戦記/Web版で起動(完全版)", true)] static bool ModeWebV() { UnityEditor.Menu.SetChecked("パチ戦記/Web版で起動(完全版)", UseWeb); return true; }
        [UnityEditor.MenuItem("パチ戦記/Unity版で起動(作り直し中)", false, 2)] static void ModeNative() => UnityEditor.EditorPrefs.SetInt("pachi_mode", 1);
        [UnityEditor.MenuItem("パチ戦記/Unity版で起動(作り直し中)", true)] static bool ModeNativeV() { UnityEditor.Menu.SetChecked("パチ戦記/Unity版で起動(作り直し中)", !UseWeb); return true; }
#endif

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void Boot()
        {
            if (!UseWeb) return;
            PachiSenki.View.GameRunner.Disabled = true;   // Unity版(作り直し中)は起動しない
            var go = new GameObject("PachiSenkiWeb"); DontDestroyOnLoad(go); go.AddComponent<WebShell>();
        }

        IEnumerator Start()
        {
            Application.targetFrameRate = 60; Screen.sleepTimeout = SleepTimeout.NeverSleep;   // 放置ゲームなので画面を消さない
            // 背景用のカメラ(WebView の外側を黒に)
            if (Camera.main == null) { var cg = new GameObject("Camera"); cg.tag = "MainCamera"; var c = cg.AddComponent<Camera>(); c.clearFlags = CameraClearFlags.SolidColor; c.backgroundColor = Color.black; DontDestroyOnLoad(cg); }

            wv = new GameObject("WebViewObject").AddComponent<WebViewObject>(); DontDestroyOnLoad(wv.gameObject);
            wv.Init(
                cb: OnJs,
                err: m => { status = "エラー: " + m; Debug.LogWarning("[WebShell] " + m); },
                httpErr: m => Debug.LogWarning("[WebShell] http " + m),
                ld: m =>
                {
                    loaded = true; status = "";
                    // iOS/Mac で Unity.call が無い場合の受け口(Android/Windows はプラグインが用意する)
                    wv.EvaluateJS("if(!window.Unity){window.Unity={call:function(m){if(window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.unityControl){window.webkit.messageHandlers.unityControl.postMessage(m)}else{window.location='unity:'+m}}}}");
                },
                zoom: false,
                wkAllowsLinkPreview: false,
                wkAllowsBackForwardNavigationGestures: false);
            while (!wv.IsInitialized()) yield return null;
#if UNITY_EDITOR_WIN || UNITY_STANDALONE_WIN || UNITY_EDITOR_OSX || UNITY_STANDALONE_OSX
            wv.bitmapRefreshCycle = 2;   // エディタ/PC は画面をテクスチャに写して表示する(毎フレームは重いので2フレームに1回)
#endif
            FitMargins(); wv.SetVisibility(true);

            // StreamingAssets → キャッシュへコピーしてから file:// で開く(Android は jar の中にあるため)
            string src = Path.Combine(Application.streamingAssetsPath, Html), dst = Path.Combine(Application.temporaryCachePath, Html);
            byte[] data = null;
            if (src.Contains("://"))
            {
                using (var req = UnityWebRequest.Get(src)) { yield return req.SendWebRequest(); if (req.result == UnityWebRequest.Result.Success) data = req.downloadHandler.data; }
            }
            else if (File.Exists(src)) data = File.ReadAllBytes(src);
            if (data == null) { status = "pachi-senki.html が見つかりません(node tools/build.js で作成)"; Debug.LogError("[WebShell] " + status + " " + src); yield break; }
            File.WriteAllBytes(dst, data);
            wv.LoadURL("file://" + dst.Replace("\\", "/").Replace(" ", "%20"));
        }

        // ノッチ等を避けて画面いっぱいに置く(回転・ウィンドウサイズ変更にも追従)
        void FitMargins()
        {
            if (wv == null) return; var sa = Screen.safeArea; lastSafe = sa; lastW = Screen.width; lastH = Screen.height;
            wv.SetMargins((int)sa.xMin, (int)(Screen.height - sa.yMax), (int)(Screen.width - sa.xMax), (int)sa.yMin);
        }
        void Update() { if (wv != null && (Screen.safeArea != lastSafe || Screen.width != lastW || Screen.height != lastH)) FitMargins(); }

        // バックグラウンドに回ったら音を止める(AC は Web版の AudioContext)
        void OnApplicationPause(bool p)
        {
            if (wv == null || !loaded) return;
            wv.EvaluateJS(p ? "try{typeof AC!=='undefined'&&AC&&AC.suspend()}catch(e){}" : "try{typeof AC!=='undefined'&&AC&&AC.resume()}catch(e){}");
        }

        // Web版 → Unity へのメッセージ(将来: 広告・課金の受け口 window.PachiNative をここで実装する)
        void OnJs(string msg) { Debug.Log("[WebShell] JS: " + msg); }

        void OnGUI()
        {
            if (string.IsNullOrEmpty(status)) return;
            var st = new GUIStyle(GUI.skin.label) { fontSize = Mathf.Max(14, Screen.height / 40), alignment = TextAnchor.MiddleCenter }; st.normal.textColor = Color.white;
            GUI.Label(new Rect(0, Screen.height / 2 - 40, Screen.width, 80), status, st);
        }
    }
}
