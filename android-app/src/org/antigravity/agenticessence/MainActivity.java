package org.antigravity.agenticessence;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.ConsoleMessage;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private static final String TAG = "AgenticEssence";
    private static final int PERMISSION_REQUEST_CODE = 101;
    private WebView mWebView;
    private WebAppInterface mBridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Request runtime permissions on Android 6.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String[] permissions = {
                android.Manifest.permission.CAMERA,
                android.Manifest.permission.RECORD_AUDIO,
                android.Manifest.permission.MODIFY_AUDIO_SETTINGS,
                android.Manifest.permission.VIBRATE,
                android.Manifest.permission.WAKE_LOCK
            };
            requestPermissions(permissions, PERMISSION_REQUEST_CODE);
        }

        mWebView = (WebView) findViewById(R.id.webview);
        mWebView.setBackgroundColor(Color.parseColor("#0B0C10"));

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);

        mBridge = new WebAppInterface(this);
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

        // Load self-contained Agentic Essence Cyberdeck UI
        mWebView.loadUrl("file:///android_asset/www/index.html");
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
