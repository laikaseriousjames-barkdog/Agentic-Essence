package org.antigravity.agenticvox;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.ArrayList;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final String TAG = "AgenticHolo";
    public static final int PERMISSION_REQUEST_CODE = 201;
    public static final int SPEECH_REQUEST_CODE = 202;
    public static final int SHIZUKU_PERMISSION_REQUEST_CODE = 203;
    private WebView mWebView;
    private HoloBridgeInterface mBridge;

    private final rikka.shizuku.Shizuku.OnRequestPermissionResultListener mShizukuPermissionListener =
        (requestCode, grantResult) -> {
            boolean granted = grantResult == PackageManager.PERMISSION_GRANTED;
            Log.i(TAG, "Shizuku permission result: " + granted);
            if (mWebView != null) {
                mWebView.post(() -> mWebView.evaluateJavascript("if(window.HoloVoice && window.HoloVoice.onShizukuPermissionResult) { window.HoloVoice.onShizukuPermissionResult(" + granted + "); } if(window.onShizukuPermissionResult) { window.onShizukuPermissionResult(" + granted + "); }", null));
            }
        };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Keep screen on for continuous holographic interaction
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        setContentView(R.layout.activity_main);

        // Native Shizuku binder registration & prompt
        try {
            rikka.shizuku.Shizuku.addRequestPermissionResultListener(mShizukuPermissionListener);
            if (rikka.shizuku.Shizuku.pingBinder()) {
                if (rikka.shizuku.Shizuku.checkSelfPermission() != PackageManager.PERMISSION_GRANTED) {
                    rikka.shizuku.Shizuku.requestPermission(SHIZUKU_PERMISSION_REQUEST_CODE);
                }
            }
        } catch (Throwable t) {
            Log.d(TAG, "Shizuku binder init skipped: " + t.getMessage());
        }

        // Request runtime permissions on Android 6.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            java.util.List<String> permList = new java.util.ArrayList<>();
            permList.add(android.Manifest.permission.RECORD_AUDIO);
            permList.add(android.Manifest.permission.MODIFY_AUDIO_SETTINGS);
            permList.add(android.Manifest.permission.CAMERA);
            permList.add(android.Manifest.permission.VIBRATE);
            permList.add(android.Manifest.permission.ACCESS_FINE_LOCATION);
            permList.add(android.Manifest.permission.ACCESS_COARSE_LOCATION);
            if (Build.VERSION.SDK_INT >= 33) {
                permList.add("android.permission.POST_NOTIFICATIONS");
            }
            requestPermissions(permList.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        mWebView = (WebView) findViewById(R.id.webview);
        mWebView.setBackgroundColor(Color.parseColor("#04060B"));
        mWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setTextZoom(100);
        settings.setUseWideViewPort(false);
        settings.setLoadWithOverviewMode(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);

        mBridge = new HoloBridgeInterface(this, mWebView);
        // Expose as HoloBridge, AndroidBridge, and Bridge for universal tool compatibility
        mWebView.addJavascriptInterface(mBridge, "HoloBridge");
        mWebView.addJavascriptInterface(mBridge, "AndroidBridge");
        mWebView.addJavascriptInterface(mBridge, "Bridge");

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    mBridge.openExternalUrl(url);
                    return true;
                }
                view.loadUrl(url);
                return true;
            }
        });

        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    try {
                        request.grant(request.getResources());
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d(TAG, "[JS " + consoleMessage.messageLevel() + "] " +
                           consoleMessage.message() + " (" + consoleMessage.sourceId() + ":" +
                           consoleMessage.lineNumber() + ")");
                return true;
            }
        });

        // Load the Holographic Chamber
        mWebView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == SPEECH_REQUEST_CODE && resultCode == RESULT_OK && data != null) {
            ArrayList<String> results = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (results != null && !results.isEmpty()) {
                String spokenText = results.get(0);
                if (mWebView != null && spokenText != null) {
                    mWebView.post(() -> mWebView.evaluateJavascript("if(window.HoloVoice) { window.HoloVoice.onNativeSpeechResult(" + JSONObject.quote(spokenText) + "); }", null));
                }
            }
        }
    }

    @Override
    protected void onDestroy() {
        try {
            rikka.shizuku.Shizuku.removeRequestPermissionResultListener(mShizukuPermissionListener);
        } catch (Throwable ignored) {}
        if (mBridge != null) {
            mBridge.destroy();
        }
        super.onDestroy();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
