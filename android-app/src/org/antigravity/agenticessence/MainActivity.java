package org.antigravity.agenticessence;

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
import android.webkit.ConsoleMessage;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.ArrayList;

public class MainActivity extends Activity {
    private static final String TAG = "AgenticEssence";
    public static final int PERMISSION_REQUEST_CODE = 101;
    public static final int SPEECH_REQUEST_CODE = 102;
    private WebView mWebView;
    private WebAppInterface mBridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Request all runtime permissions on Android 6.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            java.util.List<String> permList = new java.util.ArrayList<>();
            permList.add(android.Manifest.permission.CALL_PHONE);
            permList.add(android.Manifest.permission.SEND_SMS);
            permList.add(android.Manifest.permission.READ_SMS);
            permList.add(android.Manifest.permission.READ_CONTACTS);
            permList.add(android.Manifest.permission.CAMERA);
            permList.add(android.Manifest.permission.RECORD_AUDIO);
            permList.add(android.Manifest.permission.MODIFY_AUDIO_SETTINGS);
            permList.add(android.Manifest.permission.VIBRATE);
            permList.add(android.Manifest.permission.WAKE_LOCK);
            permList.add(android.Manifest.permission.ACCESS_FINE_LOCATION);
            permList.add(android.Manifest.permission.ACCESS_COARSE_LOCATION);
            if (Build.VERSION.SDK_INT >= 33) {
                permList.add("android.permission.POST_NOTIFICATIONS");
            }
            requestPermissions(permList.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }

        mWebView = (WebView) findViewById(R.id.webview);
        mWebView.setBackgroundColor(Color.parseColor("#0B0C10"));
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
        settings.setTextZoom(100); // 100% native font scale
        settings.setUseWideViewPort(false); // Eliminates blur: renders at native 1:1 device pixels
        settings.setLoadWithOverviewMode(false); // Eliminates overview downsampling blur
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);

        mBridge = new WebAppInterface(this, mWebView);
        mWebView.addJavascriptInterface(mBridge, "AndroidBridge");

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    mBridge.openUrl(url);
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

        // Load self-contained Agentic Essence Autonomous Assistant UI
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
                    final String safeText = spokenText.replace("'", "\\'").replace("\n", " ");
                    mWebView.post(() -> mWebView.evaluateJavascript("if(window.onSpeechResult) { window.onSpeechResult('" + safeText + "'); }", null));
                }
            }
        }
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
