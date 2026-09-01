package org.antigravity.agenticessence;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Vibrator;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.util.Locale;

public class WebAppInterface implements TextToSpeech.OnInitListener {
    private static final String TAG = "AgenticBridge";
    private Activity mActivity;
    private TextToSpeech mTTS;
    private boolean mTTSReady = false;
    private ToneGenerator mToneGenerator;
    private boolean mTorchState = false;

    public WebAppInterface(Activity activity) {
        this.mActivity = activity;
        try {
            mTTS = new TextToSpeech(activity.getApplicationContext(), this);
        } catch (Exception e) {
            Log.w(TAG, "TTS init error: " + e.getMessage());
        }
        try {
            mToneGenerator = new ToneGenerator(AudioManager.STREAM_ALARM, 100);
        } catch (Exception e) {
            Log.w(TAG, "ToneGenerator init error: " + e.getMessage());
        }
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS && mTTS != null) {
            mTTS.setLanguage(Locale.US);
            mTTSReady = true;
        }
    }

    @JavascriptInterface
    public void showToast(String message) {
        if (message == null) return;
        mActivity.runOnUiThread(() -> Toast.makeText(mActivity, message, Toast.LENGTH_SHORT).show());
    }

    @JavascriptInterface
    public void vibrate(long milliseconds) {
        try {
            Vibrator v = (Vibrator) mActivity.getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) {
                v.vibrate(milliseconds);
            }
        } catch (Exception e) {
            Log.w(TAG, "Vibrate error: " + e.getMessage());
        }
    }

    @JavascriptInterface
    public void toggleFlashlight(boolean enable) {
        mTorchState = enable;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                CameraManager cameraManager = (CameraManager) mActivity.getSystemService(Context.CAMERA_SERVICE);
                if (cameraManager != null) {
                    for (String id : cameraManager.getCameraIdList()) {
                        CameraCharacteristics c = cameraManager.getCameraCharacteristics(id);
                        Boolean flashAvailable = c.get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                        Integer facing = c.get(CameraCharacteristics.LENS_FACING);
                        if (flashAvailable != null && flashAvailable &&
                            facing != null && facing == CameraCharacteristics.LENS_FACING_BACK) {
                            cameraManager.setTorchMode(id, enable);
                            break;
                        }
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "Flashlight error: " + e.getMessage());
            }
        }
    }

    @JavascriptInterface
    public boolean getFlashlightState() {
        return mTorchState;
    }

    @JavascriptInterface
    public void speakText(String text) {
        if (mTTSReady && mTTS != null && text != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mTTS.speak(text, TextToSpeech.QUEUE_FLUSH, null, "agentic_tts");
            } else {
                mTTS.speak(text, TextToSpeech.QUEUE_FLUSH, null);
            }
        }
    }

    @JavascriptInterface
    public void playAlarm(int durationSeconds) {
        new Thread(() -> {
            try {
                if (mToneGenerator != null) {
                    for (int i = 0; i < durationSeconds * 2; i++) {
                        mToneGenerator.startTone(ToneGenerator.TONE_CDMA_HIGH_L, 350);
                        Thread.sleep(500);
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "Alarm error: " + e.getMessage());
            }
        }).start();
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
        } catch (Exception e) {
            Log.w(TAG, "Battery level error: " + e.getMessage());
        }
        return -1;
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
        } catch (Exception e) {
            Log.w(TAG, "Charging status error: " + e.getMessage());
        }
        return false;
    }

    @JavascriptInterface
    public void keepScreenOn(boolean enable) {
        mActivity.runOnUiThread(() -> {
            if (enable) {
                mActivity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            } else {
                mActivity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            }
        });
    }

    @JavascriptInterface
    public void copyToClipboard(String text) {
        if (text == null) return;
        mActivity.runOnUiThread(() -> {
            try {
                ClipboardManager clipboard = (ClipboardManager) mActivity.getSystemService(Context.CLIPBOARD_SERVICE);
                ClipData clip = ClipData.newPlainText("Agentic Essence Log", text);
                if (clipboard != null) {
                    clipboard.setPrimaryClip(clip);
                    Toast.makeText(mActivity, "Copied to clipboard", Toast.LENGTH_SHORT).show();
                }
            } catch (Exception e) {
                Log.w(TAG, "Clipboard error: " + e.getMessage());
            }
        });
    }

    @JavascriptInterface
    public String getClipboardText() {
        try {
            ClipboardManager clipboard = (ClipboardManager) mActivity.getSystemService(Context.CLIPBOARD_SERVICE);
            if (clipboard != null && clipboard.hasPrimaryClip()) {
                ClipData.Item item = clipboard.getPrimaryClip().getItemAt(0);
                CharSequence text = item.getText();
                return text != null ? text.toString() : "";
            }
        } catch (Exception e) {
            Log.w(TAG, "Get clipboard error: " + e.getMessage());
        }
        return "";
    }

    @JavascriptInterface
    public void shareText(String title, String message) {
        try {
            Intent sendIntent = new Intent();
            sendIntent.setAction(Intent.ACTION_SEND);
            sendIntent.putExtra(Intent.EXTRA_TITLE, title != null ? title : "Agentic Essence");
            sendIntent.putExtra(Intent.EXTRA_TEXT, message);
            sendIntent.setType("text/plain");

            Intent shareIntent = Intent.createChooser(sendIntent, title);
            shareIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mActivity.startActivity(shareIntent);
        } catch (Exception e) {
            Log.w(TAG, "Share intent error: " + e.getMessage());
        }
    }

    @JavascriptInterface
    public void openUrl(String url) {
        try {
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mActivity.startActivity(browserIntent);
        } catch (Exception e) {
            Log.w(TAG, "Open URL error: " + e.getMessage());
        }
    }

    @JavascriptInterface
    public String getDeviceIpAddress() {
        try {
            java.util.Enumeration<java.net.NetworkInterface> interfaces = java.net.NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                java.net.NetworkInterface iface = interfaces.nextElement();
                java.util.Enumeration<java.net.InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    java.net.InetAddress addr = addresses.nextElement();
                    if (!addr.isLoopbackAddress() && addr instanceof java.net.Inet4Address) {
                        return addr.getHostAddress();
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "IP lookup error: " + e.getMessage());
        }
        return "127.0.0.1";
    }

    @JavascriptInterface
    public String runShellCommand(String cmd) {
        if (cmd == null || cmd.trim().isEmpty()) return "ERR: empty command";
        try {
            Process process = Runtime.getRuntime().exec(new String[]{"sh", "-c", cmd});
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            process.waitFor();
            String res = sb.toString().trim();
            return res.isEmpty() ? "OK" : res;
        } catch (Exception e) {
            return "ERR: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public boolean isShizukuAvailable() {
        try {
            Class<?> shizukuClass = Class.forName("moe.shizuku.api.ShizukuService");
            return shizukuClass != null;
        } catch (Throwable t) {
            return false;
        }
    }
}
