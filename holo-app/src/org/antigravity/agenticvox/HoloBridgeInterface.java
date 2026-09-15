package org.antigravity.agenticvox;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import android.speech.tts.Voice;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Enumeration;
import java.util.Set;

public class HoloBridgeInterface {
    private static final String TAG = "AgenticHoloBridge";
    private final Activity mActivity;
    private final WebView mWebView;
    private TextToSpeech mTTS;
    private boolean mTTSReady = false;
    private SpeechRecognizer mSpeechRecognizer;
    private boolean mIsListening = false;
    private float mCustomPitch = 1.0f;
    private float mCustomSpeechRate = 1.0f;
    private String mSelectedVoiceName = null;

    public HoloBridgeInterface(Activity activity, WebView webView) {
        this.mActivity = activity;
        this.mWebView = webView;
        initTTS();
    }

    private void initTTS() {
        try {
            mTTS = new TextToSpeech(mActivity.getApplicationContext(), status -> {
                if (status == TextToSpeech.SUCCESS) {
                    mTTS.setLanguage(Locale.US);
                    mTTSReady = true;
                    Log.d(TAG, "TextToSpeech initialized successfully");
                } else {
                    Log.w(TAG, "TextToSpeech initialization failed");
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error initializing TTS: " + e.getMessage());
        }
    }

    // ========================================================
    // 1. VOICE & SPEECH SYNTHESIS / RECOGNITION
    // ========================================================

    @JavascriptInterface
    public void speakPersona(String text, String persona) {
        if (text == null || text.trim().isEmpty()) return;
        final String cleanText = text.replaceAll("<[^>]*>", "")
                                     .replaceAll("```[\\s\\S]*?```", "")
                                     .replaceAll("[#*_`]", "")
                                     .trim();

        mActivity.runOnUiThread(() -> {
            if (mTTSReady && mTTS != null) {
                mTTS.stop();
                // Tune voice profile per persona with user custom pitch and rate multipliers
                float basePitch = 1.00f;
                float baseRate = 1.00f;
                if ("swarm".equalsIgnoreCase(persona) || "planner".equalsIgnoreCase(persona)) {
                    basePitch = 0.85f;
                    baseRate = 1.05f;
                } else if ("turing".equalsIgnoreCase(persona) || "builder".equalsIgnoreCase(persona)) {
                    basePitch = 1.00f;
                    baseRate = 0.98f;
                } else if ("knuth".equalsIgnoreCase(persona) || "auditor".equalsIgnoreCase(persona)) {
                    basePitch = 0.92f;
                    baseRate = 0.95f;
                } else if ("lovelace".equalsIgnoreCase(persona)) {
                    basePitch = 1.18f;
                    baseRate = 1.02f;
                } else if ("shadow".equalsIgnoreCase(persona)) {
                    basePitch = 0.72f;
                    baseRate = 1.10f;
                } else if ("sentry".equalsIgnoreCase(persona)) {
                    basePitch = 0.88f;
                    baseRate = 1.08f;
                } else if ("cipher".equalsIgnoreCase(persona)) {
                    basePitch = 1.06f;
                    baseRate = 0.92f;
                } else if ("valkyrie".equalsIgnoreCase(persona)) {
                    basePitch = 1.22f;
                    baseRate = 1.14f;
                } else if ("matrix".equalsIgnoreCase(persona)) {
                    basePitch = 0.62f;
                    baseRate = 0.96f;
                } else if ("ghost".equalsIgnoreCase(persona)) {
                    basePitch = 0.78f;
                    baseRate = 0.96f;
                } else if ("glitch".equalsIgnoreCase(persona)) {
                    basePitch = 1.38f;
                    baseRate = 1.22f;
                } else if ("archon".equalsIgnoreCase(persona)) {
                    basePitch = 0.75f;
                    baseRate = 0.90f;
                } else {
                    basePitch = 1.00f;
                    baseRate = 1.00f;
                }

                mTTS.setPitch(Math.max(0.4f, Math.min(2.0f, basePitch * mCustomPitch)));
                mTTS.setSpeechRate(Math.max(0.4f, Math.min(2.0f, baseRate * mCustomSpeechRate)));

                // Re-apply selected system voice if chosen
                if (mSelectedVoiceName != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    try {
                        Set<Voice> voices = mTTS.getVoices();
                        if (voices != null) {
                            for (Voice v : voices) {
                                if (v.getName().equalsIgnoreCase(mSelectedVoiceName)) {
                                    mTTS.setVoice(v);
                                    break;
                                }
                            }
                        }
                    } catch (Exception ignored) {}
                }

                String utteranceId = "holo_" + System.currentTimeMillis();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    mTTS.speak(cleanText, TextToSpeech.QUEUE_FLUSH, null, utteranceId);
                } else {
                    mTTS.speak(cleanText, TextToSpeech.QUEUE_FLUSH, null);
                }
            } else {
                // Fallback to JS speech synthesis trigger
                evaluateJs("window.onNativeTTSFallback('" + cleanText.replace("'", "\\'") + "')");
            }
        });
    }

    @JavascriptInterface
    public String getAvailableVoices() {
        JSONArray array = new JSONArray();
        if (mTTS != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            try {
                Set<Voice> voices = mTTS.getVoices();
                if (voices != null) {
                    for (Voice v : voices) {
                        JSONObject obj = new JSONObject();
                        obj.put("name", v.getName());
                        obj.put("locale", v.getLocale() != null ? v.getLocale().toString() : "");
                        obj.put("quality", v.getQuality());
                        obj.put("latency", v.getLatency());
                        obj.put("isNetwork", v.isNetworkConnectionRequired());
                        array.put(obj);
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "Error fetching voices: " + e.getMessage());
            }
        }
        return array.toString();
    }

    @JavascriptInterface
    public boolean setVoice(String voiceName) {
        mSelectedVoiceName = voiceName;
        if (mTTS != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && voiceName != null) {
            try {
                Set<Voice> voices = mTTS.getVoices();
                if (voices != null) {
                    for (Voice v : voices) {
                        if (v.getName().equalsIgnoreCase(voiceName)) {
                            mTTS.setVoice(v);
                            return true;
                        }
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "Error setting voice: " + e.getMessage());
            }
        }
        return false;
    }

    @JavascriptInterface
    public void setVoicePitch(float pitch) {
        mCustomPitch = pitch;
        if (mTTS != null) {
            mTTS.setPitch(pitch);
        }
    }

    @JavascriptInterface
    public void setVoiceSpeechRate(float rate) {
        mCustomSpeechRate = rate;
        if (mTTS != null) {
            mTTS.setSpeechRate(rate);
        }
    }

    @JavascriptInterface
    public String getDeviceSecurityPosture() {
        JSONObject posture = new JSONObject();
        try {
            boolean isRooted = false;
            String[] suPaths = {
                "/system/bin/su", "/system/xbin/su", "/sbin/su",
                "/data/local/xbin/su", "/data/local/bin/su", "/system/sd/xbin/su",
                "/system/bin/failsafe/su", "/data/local/su", "/data/data/com.termux/files/usr/bin/su"
            };
            for (String p : suPaths) {
                if (new File(p).exists()) {
                    isRooted = true;
                    break;
                }
            }
            posture.put("isRooted", isRooted);
            posture.put("androidVersion", Build.VERSION.RELEASE);
            posture.put("sdkVersion", Build.VERSION.SDK_INT);
            posture.put("deviceModel", Build.MANUFACTURER + " " + Build.MODEL);
            posture.put("kernelVersion", System.getProperty("os.version", "Linux 5.15 aarch64"));
            posture.put("isNetHunterBridgeActive", isNetHunterOnline());
        } catch (Exception e) {
            Log.w(TAG, "Security posture error: " + e.getMessage());
        }
        return posture.toString();
    }

    @JavascriptInterface
    public String runPortScan(String host, String portCsv) {
        JSONArray results = new JSONArray();
        String targetHost = (host == null || host.trim().isEmpty()) ? "127.0.0.1" : host.trim();
        String[] portStrs = (portCsv == null || portCsv.trim().isEmpty()) 
            ? "21,22,23,25,53,80,110,135,139,443,445,1433,3306,3389,8080,8443".split(",")
            : portCsv.split(",");

        for (String pStr : portStrs) {
            int port;
            try {
                port = Integer.parseInt(pStr.trim());
            } catch (Exception e) {
                continue;
            }
            JSONObject portObj = new JSONObject();
            try {
                portObj.put("port", port);
                long start = System.currentTimeMillis();
                try (Socket socket = new Socket()) {
                    socket.connect(new InetSocketAddress(targetHost, port), 250);
                    portObj.put("status", "OPEN");
                    portObj.put("latencyMs", System.currentTimeMillis() - start);
                } catch (Exception e) {
                    portObj.put("status", "CLOSED");
                    portObj.put("latencyMs", System.currentTimeMillis() - start);
                }
                results.put(portObj);
            } catch (Exception ignored) {}
        }
        return results.toString();
    }

    @JavascriptInterface
    public void stopSpeaking() {
        mActivity.runOnUiThread(() -> {
            if (mTTS != null) {
                mTTS.stop();
            }
        });
    }

    @JavascriptInterface
    public boolean isSpeaking() {
        return mTTS != null && mTTS.isSpeaking();
    }

    @JavascriptInterface
    public void startNativeVoiceRecognition() {
        mActivity.runOnUiThread(() -> {
            try {
                if (!SpeechRecognizer.isRecognitionAvailable(mActivity)) {
                    showToast("Speech recognition not available on device");
                    return;
                }

                if (mSpeechRecognizer != null) {
                    mSpeechRecognizer.destroy();
                }

                mSpeechRecognizer = SpeechRecognizer.createSpeechRecognizer(mActivity);
                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.US.toString());
                intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
                intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);

                mSpeechRecognizer.setRecognitionListener(new RecognitionListener() {
                    @Override public void onReadyForSpeech(Bundle params) {
                        mIsListening = true;
                        evaluateJs("if(window.HoloVoice) HoloVoice.onNativeStateChange('listening')");
                    }
                    @Override public void onBeginningOfSpeech() {
                        evaluateJs("if(window.HoloVoice) HoloVoice.onNativeSpeechDetected()");
                    }
                    @Override public void onRmsChanged(float rmsdB) {
                        evaluateJs("if(window.HoloVoice) HoloVoice.onNativeAudioLevel(" + rmsdB + ")");
                    }
                    @Override public void onBufferReceived(byte[] buffer) {}
                    @Override public void onEndOfSpeech() {
                        mIsListening = false;
                        evaluateJs("if(window.HoloVoice) HoloVoice.onNativeStateChange('processing')");
                    }
                    @Override public void onError(int error) {
                        mIsListening = false;
                        evaluateJs("if(window.HoloVoice) HoloVoice.onNativeError(" + error + ")");
                    }
                    @Override public void onResults(Bundle results) {
                        mIsListening = false;
                        ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                        if (matches != null && !matches.isEmpty()) {
                            String spoken = matches.get(0).replace("'", "\\'");
                            evaluateJs("if(window.HoloVoice) HoloVoice.onNativeSpeechResult('" + spoken + "')");
                        }
                    }
                    @Override public void onPartialResults(Bundle partialResults) {
                        ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                        if (matches != null && !matches.isEmpty()) {
                            String partial = matches.get(0).replace("'", "\\'");
                            evaluateJs("if(window.HoloVoice) HoloVoice.onNativePartialResult('" + partial + "')");
                        }
                    }
                    @Override public void onEvent(int eventType, Bundle params) {}
                });

                mSpeechRecognizer.startListening(intent);
            } catch (Exception e) {
                Log.e(TAG, "Failed to start speech recognizer: " + e.getMessage());
            }
        });
    }

    @JavascriptInterface
    public void stopNativeVoiceRecognition() {
        mActivity.runOnUiThread(() -> {
            if (mSpeechRecognizer != null) {
                mSpeechRecognizer.stopListening();
                mIsListening = false;
            }
        });
    }

    // ========================================================
    // 2. HARDWARE APIS (Wi-Fi, Torch, Haptics, Battery)
    // ========================================================

    @JavascriptInterface
    public void vibrate(int ms) {
        try {
            Vibrator v = (Vibrator) mActivity.getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    v.vibrate(ms);
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Vibration failed: " + e.getMessage());
        }
    }

    @JavascriptInterface
    public boolean toggleFlashlight(boolean enable) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                CameraManager cm = (CameraManager) mActivity.getSystemService(Context.CAMERA_SERVICE);
                if (cm != null) {
                    String[] ids = cm.getCameraIdList();
                    for (String id : ids) {
                        CameraCharacteristics cc = cm.getCameraCharacteristics(id);
                        Boolean hasFlash = cc.get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                        Integer facing = cc.get(CameraCharacteristics.LENS_FACING);
                        if (hasFlash != null && hasFlash && facing != null && facing == CameraCharacteristics.LENS_FACING_BACK) {
                            cm.setTorchMode(id, enable);
                            return true;
                        }
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Flashlight error: " + e.getMessage());
            }
        }
        return false;
    }

    @JavascriptInterface
    public int getBatteryLevel() {
        try {
            IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
            Intent batteryStatus = mActivity.registerReceiver(null, ifilter);
            if (batteryStatus != null) {
                int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
                int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
                if (level >= 0 && scale > 0) {
                    return (int) ((level / (float) scale) * 100);
                }
            }
        } catch (Exception ignored) {}
        return 85;
    }

    @JavascriptInterface
    public boolean isDeviceCharging() {
        try {
            IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
            Intent batteryStatus = mActivity.registerReceiver(null, ifilter);
            if (batteryStatus != null) {
                int status = batteryStatus.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
                return status == BatteryManager.BATTERY_STATUS_CHARGING ||
                       status == BatteryManager.BATTERY_STATUS_FULL;
            }
        } catch (Exception ignored) {}
        return false;
    }

    @JavascriptInterface
    public String getDeviceIpAddress() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                Enumeration<InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    if (!addr.isLoopbackAddress() && addr instanceof Inet4Address) {
                        return addr.getHostAddress();
                    }
                }
            }
        } catch (Exception ignored) {}
        return "127.0.0.1";
    }

    @JavascriptInterface
    public String scanWifiNetworks() {
        try {
            WifiManager wm = (WifiManager) mActivity.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wm != null) {
                List<ScanResult> results = wm.getScanResults();
                if (results != null && !results.isEmpty()) {
                    JSONArray arr = new JSONArray();
                    for (ScanResult r : results) {
                        JSONObject obj = new JSONObject();
                        obj.put("ssid", r.SSID != null && !r.SSID.isEmpty() ? r.SSID : "<Hidden Network>");
                        obj.put("bssid", r.BSSID);
                        obj.put("level", r.level);
                        obj.put("frequency", r.frequency);
                        obj.put("capabilities", r.capabilities);
                        arr.put(obj);
                    }
                    return arr.toString();
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Wi-Fi scan failed: " + e.getMessage());
        }
        return "[{\"ssid\":\"Cyberdeck_Mesh_5G\",\"bssid\":\"02:00:00:00:00:01\",\"level\":-54,\"frequency\":5180,\"capabilities\":\"[WPA2-PSK-CCMP]\"}]";
    }

    // ========================================================
    // 3. KALI NETHUNTER ROOT BRIDGE
    // ========================================================

    @JavascriptInterface
    public String runShellCommand(String cmd) {
        if (cmd == null || cmd.trim().isEmpty()) return "";
        String trimmed = cmd.trim();

        // 1. Direct hardware intercepts
        String lower = trimmed.toLowerCase(Locale.US);
        if (lower.equals("wifi scan") || lower.equals("wifiscan")) return scanWifiNetworks();
        if (lower.equals("battery")) return "Battery Level: " + getBatteryLevel() + "%";
        if (lower.equals("torch on") || lower.equals("flashlight on")) { toggleFlashlight(true); return "[*] Torch enabled."; }
        if (lower.equals("torch off") || lower.equals("flashlight off")) { toggleFlashlight(false); return "[*] Torch disabled."; }

        // 2. Query NetHunter bridge daemon
        try {
            URL url = new URL("http://127.0.0.1:8765/api/exec");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setConnectTimeout(2500);
            conn.setReadTimeout(30000);
            conn.setDoOutput(true);

            JSONObject req = new JSONObject();
            req.put("cmd", trimmed);
            byte[] input = req.toString().getBytes("utf-8");
            conn.setFixedLengthStreamingMode(input.length);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(input);
                os.flush();
            }

            if (conn.getResponseCode() == 200) {
                BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) sb.append(line).append("\n");
                JSONObject resJson = new JSONObject(sb.toString().trim());
                String out = resJson.optString("output", "");
                if (out.isEmpty()) out = resJson.optString("stdout", "");
                return out.trim();
            }
        } catch (Exception ignored) {}

        // 3. Fallback to local process
        try {
            Process p = Runtime.getRuntime().exec(new String[]{"sh", "-c", trimmed});
            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String l;
            while ((l = r.readLine()) != null) sb.append(l).append("\n");
            return sb.toString().trim();
        } catch (Exception e) {
            return "ERR: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String executeNetHunter(String cmd) {
        return runShellCommand(cmd);
    }

    @JavascriptInterface
    public boolean isNetHunterOnline() {
        try {
            URL url = new URL("http://127.0.0.1:8765/api/status");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(1500);
            conn.setReadTimeout(1500);
            return conn.getResponseCode() == 200;
        } catch (Exception e) {
            return false;
        }
    }

    @JavascriptInterface
    public void openExternalUrl(String url) {
        if (url == null || url.trim().isEmpty()) return;
        mActivity.runOnUiThread(() -> {
            try {
                Intent browserIntent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url.trim()));
                browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                mActivity.startActivity(browserIntent);
            } catch (Exception e) {
                Log.e(TAG, "Failed to open external URL: " + e.getMessage());
            }
        });
    }

    @JavascriptInterface
    public void showToast(String msg) {
        mActivity.runOnUiThread(() -> Toast.makeText(mActivity, msg, Toast.LENGTH_SHORT).show());
    }

    private void evaluateJs(String script) {
        mActivity.runOnUiThread(() -> {
            if (mWebView != null) {
                mWebView.evaluateJavascript(script, null);
            }
        });
    }

    public void destroy() {
        if (mTTS != null) {
            mTTS.stop();
            mTTS.shutdown();
        }
        if (mSpeechRecognizer != null) {
            mSpeechRecognizer.destroy();
        }
    }
}
