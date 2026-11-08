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
            Screen.sleepTimeout = SleepTimeout.NeverSleep;   // 放置ゲームなので画面を消さない
#if !UNITY_EDITOR && (UNITY_IOS || UNITY_ANDROID)
            Screen.orientation = ScreenOrientation.Portrait;   // 縦画面に固定(筐体が縦長)
            // スマホの WebView は Unity の描画とは別に OS が表示する(Unity は裏で黒を塗るだけ)。発熱・電池を抑えるため Unity 側は 30fps
            Application.targetFrameRate = 30;
#else
            Application.targetFrameRate = 60;   // エディタ/PC は WebView の画面を Unity のテクスチャで表示するので 60fps
#endif
            // 背景用のカメラ(WebView の外側を黒に)
            if (Camera.main == null) { var cg = new GameObject("Camera"); cg.tag = "MainCamera"; var c = cg.AddComponent<Camera>(); c.clearFlags = CameraClearFlags.SolidColor; c.backgroundColor = Color.black; DontDestroyOnLoad(cg); }

            wv = new GameObject("WebViewObject").AddComponent<WebViewObject>(); DontDestroyOnLoad(wv.gameObject);
            wv.Init(
                cb: OnJs,
                err: m => { status = "エラー: " + m; Debug.LogWarning("[WebShell] " + m); },
                httpErr: m => Debug.LogWarning("[WebShell] http " + m),
                ld: m =>
                {
                    loaded = true; status = ""; wv.SetVisibility(true);
                    // Unity.call はプラグインがページ先頭で用意する(iOS/Mac: messageHandlers.unityControl、Windows: chrome.webview、Android: JavascriptInterface)。無い時だけの予備
                    wv.EvaluateJS("if(!window.Unity){window.Unity={call:function(m){if(window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.unityControl){window.webkit.messageHandlers.unityControl.postMessage(m)}else{window.location='unity:'+m}}}}");
#if !UNITY_ANDROID
                    // Android 以外では WebViewObject.CallFromJS が受け取った文字列を URL デコードする(UnEscapeURL: %xx と + を空白に変換)。
                    // セーブの控え(JSON)の "1e+21" や % が壊れるので、送る前に encodeURIComponent しておく(デコードで元に戻る)。
                    wv.EvaluateJS("(function(){var u=window.Unity;if(!u||u.__pe)return;var c=u.call;u.call=function(m){return c.call(u,encodeURIComponent(String(m)))};u.__pe=1})()");
#endif
                    // アプリで動いている印(Web版 97u-app.js が振動とセーブの控えを使う)。控えがあれば書き戻しを頼む(Web 側にセーブが無い時だけ反映)
                    wv.EvaluateJS("window.PachiApp={v:1,platform:'" + Application.platform + "'};");
                    var bak = PlayerPrefs.GetString(BackupKey, "");
                    if (bak.Length > 2) wv.EvaluateJS("try{typeof appRestore==='function'&&appRestore('" + JsStr(bak) + "')}catch(e){}");
                },
                zoom: false,
                wkAllowsLinkPreview: false,
                wkAllowsBackForwardNavigationGestures: false);
            while (!wv.IsInitialized()) yield return null;
#if UNITY_EDITOR_WIN || UNITY_STANDALONE_WIN || UNITY_EDITOR_OSX || UNITY_STANDALONE_OSX
            wv.bitmapRefreshCycle = 2;   // エディタ/PC は画面をテクスチャに写して表示する(毎フレームは重いので2フレームに1回)
#endif
            FitMargins();
            // 読み込み完了(ld)で表示する(読み込み前の白い画面を見せない)。ld が来ない環境に備えて 5 秒後にも表示
            StartCoroutine(ShowLater(5f));

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

        IEnumerator ShowLater(float sec) { yield return new WaitForSecondsRealtime(sec); if (wv != null) wv.SetVisibility(true); }

        // ノッチ等を避けて画面いっぱいに置く(回転・ウィンドウサイズ変更にも追従)
        void FitMargins()
        {
            if (wv == null) return; var sa = Screen.safeArea; lastSafe = sa; lastW = Screen.width; lastH = Screen.height;
            int l = (int)sa.xMin, t = (int)(Screen.height - sa.yMax), r = (int)(Screen.width - sa.xMax), b = (int)sa.yMin;
#if UNITY_IOS && !UNITY_EDITOR
            // iOS: 絶対指定だとプラグインが「Unity の画素 / 画面の nativeScale」で換算するため、Unity の描画解像度を下げる設定
            // (解像度スケーリング)だとずれる。割合指定(relative)なら Screen.width/height 比で換算されるので解像度に依存しない
            wv.SetMargins(l, t, r, b, true);
#else
            wv.SetMargins(l, t, r, b);
#endif
        }
        void Update()
        {
            if (wv != null && (Screen.safeArea != lastSafe || Screen.width != lastW || Screen.height != lastH)) FitMargins();
#if UNITY_ANDROID && !UNITY_EDITOR
            // 戻るボタン: アプリを終了せずホームへ(放置ゲームなので誤タップで消えないように)
            bool back = false; try { back = Input.GetKeyDown(KeyCode.Escape); } catch (System.InvalidOperationException) { }
            if (back) { try { using (var up = new AndroidJavaClass("com.unity3d.player.UnityPlayer")) using (var act = up.GetStatic<AndroidJavaObject>("currentActivity")) act.Call<bool>("moveTaskToBack", true); } catch (System.Exception) { } }
#endif
        }

        // バックグラウンドに回ったら音を止める(AC は Web版の AudioContext)
        void OnApplicationPause(bool p)
        {
            if (wv == null || !loaded) return;
            wv.EvaluateJS(p ? "try{typeof AC!=='undefined'&&AC&&AC.suspend()}catch(e){}" : "try{typeof AC!=='undefined'&&AC&&AC.resume()}catch(e){}");
        }

        // Web版 → Unity へのメッセージ(将来: 広告・課金の受け口 window.PachiNative をここで実装する)
        const string BackupKey = "pachi_web_backup";
        float lastVib = -9;
        void OnJs(string msg)
        {
            if (string.IsNullOrEmpty(msg)) return;
            if (msg.StartsWith("vib:"))
            {
                if (Time.unscaledTime - lastVib < .6f) return; lastVib = Time.unscaledTime;
#if UNITY_IOS || UNITY_ANDROID
                Handheld.Vibrate();
#endif
                return;
            }
            if (msg.StartsWith("save:")) { PlayerPrefs.SetString(BackupKey, msg.Substring(5)); PlayerPrefs.Save(); return; }
            Debug.Log("[WebShell] JS: " + msg);
        }
        static string JsStr(string s) => s.Replace("\\", "\\\\").Replace("'", "\\'").Replace("\n", "\\n").Replace("\r", "\\r").Replace("\u2028", "\\u2028").Replace("\u2029", "\\u2029");

        void OnGUI()
        {
            if (string.IsNullOrEmpty(status)) return;
            var st = new GUIStyle(GUI.skin.label) { fontSize = Mathf.Max(14, Screen.height / 40), alignment = TextAnchor.MiddleCenter }; st.normal.textColor = Color.white;
            GUI.Label(new Rect(0, Screen.height / 2 - 40, Screen.width, 80), status, st);
        }
    }
}
