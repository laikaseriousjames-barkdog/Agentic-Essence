package org.antigravity.agenticessence;

import android.app.Activity;
import android.app.SearchManager;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Vibrator;
import android.provider.AlarmClock;
import android.provider.ContactsContract;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.telephony.SmsManager;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class WebAppInterface implements TextToSpeech.OnInitListener {
    private static final String TAG = "AgenticBridge";
    private Activity mActivity;
    private WebView mWebView;
    private TextToSpeech mTTS;
    private boolean mTTSReady = false;
    private ToneGenerator mToneGenerator;
    private boolean mTorchState = false;

    public WebAppInterface(Activity activity, WebView webView) {
        this.mActivity = activity;
        this.mWebView = webView;
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

    // ==========================================
    // 1. PHONE CALLS & TELEPHONY
    // ==========================================

    @JavascriptInterface
    public String makePhoneCall(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return "ERR: empty phone number";
        }
        try {
            Intent callIntent = new Intent(Intent.ACTION_CALL);
            callIntent.setData(Uri.parse("tel:" + Uri.encode(phoneNumber.trim())));
            callIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mActivity.startActivity(callIntent);
            return "Calling " + phoneNumber;
        } catch (SecurityException se) {
            // If direct call permission not yet granted, fallback smoothly to dialer
            return dialPhoneNumber(phoneNumber);
        } catch (Exception e) {
            Log.e(TAG, "Call error: " + e.getMessage());
            return "ERR: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String dialPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return "ERR: empty phone number";
        }
        try {
            Intent dialIntent = new Intent(Intent.ACTION_DIAL);
            dialIntent.setData(Uri.parse("tel:" + Uri.encode(phoneNumber.trim())));
            dialIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mActivity.startActivity(dialIntent);
            return "Dialer opened for " + phoneNumber;
        } catch (Exception e) {
            return "ERR: " + e.getMessage();
        }
    }

    // ==========================================
    // 2. SMS & MESSAGING
    // ==========================================

    @JavascriptInterface
    public String sendSmsDirect(String phoneNumber, String message) {
        if (phoneNumber == null || message == null || phoneNumber.trim().isEmpty()) {
            return "ERR: missing phone number or message";
        }
        try {
            SmsManager sms = SmsManager.getDefault();
            ArrayList<String> parts = sms.divideMessage(message);
            if (parts.size() > 1) {
                sms.sendMultipartTextMessage(phoneNumber.trim(), null, parts, null, null);
            } else {
                sms.sendTextMessage(phoneNumber.trim(), null, message, null, null);
            }
            showToast("SMS sent to " + phoneNumber);
            return "SMS successfully sent to " + phoneNumber;
        } catch (SecurityException se) {
            // If background SMS permission is not granted, fallback to SMS composer intent
            return composeSms(phoneNumber, message);
        } catch (Exception e) {
            Log.e(TAG, "SMS error: " + e.getMessage());
            return "ERR: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String composeSms(String phoneNumber, String message) {
        try {
            Intent smsIntent = new Intent(Intent.ACTION_SENDTO);
            smsIntent.setData(Uri.parse("smsto:" + Uri.encode(phoneNumber != null ? phoneNumber.trim() : "")));
            if (message != null) {
                smsIntent.putExtra("sms_body", message);
            }
            smsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mActivity.startActivity(smsIntent);
            return "SMS composer opened";
        } catch (Exception e) {
            return "ERR: " + e.getMessage();
        }
    }

    // ==========================================
    // 3. CONTACTS RESOLUTION & LOOKUP
    // ==========================================

    @JavascriptInterface
    public String findContactNumber(String queryName) {
        if (queryName == null || queryName.trim().isEmpty()) return "";
        Cursor cursor = null;
        try {
            cursor = mActivity.getContentResolver().query(
                ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                new String[]{
                    ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                    ContactsContract.CommonDataKinds.Phone.NUMBER
                },
                null,
                null,
                null
            );

            if (cursor != null) {
                String cleanQuery = queryName.trim().toLowerCase();
                String bestMatch = "";
                while (cursor.moveToNext()) {
                    String name = cursor.getString(0);
                    String number = cursor.getString(1);
                    if (name != null) {
                        String cleanName = name.toLowerCase();
                        if (cleanName.equals(cleanQuery)) {
                            return number; // Exact match
                        } else if (cleanName.contains(cleanQuery) && bestMatch.isEmpty()) {
                            bestMatch = number; // Partial match
                        }
                    }
                }
                return bestMatch;
            }
        } catch (Exception e) {
            Log.w(TAG, "Contacts query error: " + e.getMessage());
        } finally {
            if (cursor != null) cursor.close();
        }
        return "";
    }

    @JavascriptInterface
    public String getAllContactsJson() {
        JSONArray array = new JSONArray();
        Cursor cursor = null;
        try {
            cursor = mActivity.getContentResolver().query(
                ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                new String[]{
                    ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                    ContactsContract.CommonDataKinds.Phone.NUMBER
                },
                null,
                null,
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + " ASC"
            );

            if (cursor != null) {
                int count = 0;
                while (cursor.moveToNext() && count < 80) {
                    JSONObject obj = new JSONObject();
                    obj.put("name", cursor.getString(0));
                    obj.put("number", cursor.getString(1));
                    array.put(obj);
                    count++;
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "getAllContactsJson error: " + e.getMessage());
        } finally {
            if (cursor != null) cursor.close();
        }
        return array.toString();
    }

    // ==========================================
    // 4. APPS LAUNCHING & DISCOVERY
    // ==========================================

    @JavascriptInterface
    public String openAppByName(String targetName) {
        if (targetName == null || targetName.trim().isEmpty()) return "ERR: empty app name";
        String cleanTarget = targetName.trim().toLowerCase();
        PackageManager pm = mActivity.getPackageManager();

        // Common package shortcuts
        if (cleanTarget.contains("youtube")) return launchPackage("com.google.android.youtube");
        if (cleanTarget.contains("whatsapp")) return launchPackage("com.whatsapp");
        if (cleanTarget.contains("chrome")) return launchPackage("com.android.chrome");
        if (cleanTarget.contains("spotify")) return launchPackage("com.spotify.music");
        if (cleanTarget.contains("camera")) {
            Intent camIntent = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
            camIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mActivity.startActivity(camIntent);
            return "Camera opened";
        }
        if (cleanTarget.contains("settings")) {
            mActivity.startActivity(new Intent(android.provider.Settings.ACTION_SETTINGS));
            return "Settings opened";
        }

        // Search installed applications
        try {
            List<ApplicationInfo> apps = pm.getInstalledApplications(PackageManager.GET_META_DATA);
            for (ApplicationInfo app : apps) {
                String label = pm.getApplicationLabel(app).toString().toLowerCase();
                if (label.contains(cleanTarget) || app.packageName.toLowerCase().contains(cleanTarget)) {
                    Intent launchIntent = pm.getLaunchIntentForPackage(app.packageName);
                    if (launchIntent != null) {
                        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        mActivity.startActivity(launchIntent);
                        return "Launched " + label;
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "App launch error: " + e.getMessage());
        }
        return "ERR: App not found for '" + targetName + "'";
    }

    private String launchPackage(String pkg) {
        try {
            PackageManager pm = mActivity.getPackageManager();
            Intent intent = pm.getLaunchIntentForPackage(pkg);
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                mActivity.startActivity(intent);
                return "Launched " + pkg;
            }
        } catch (Exception e) {
            // Ignore
        }
        return "ERR: package " + pkg + " not installed";
    }

    // ==========================================
    // 5. ALARMS, TIMERS & NAVIGATION
    // ==========================================

    @JavascriptInterface
    public String setDeviceAlarm(int hour, int minute, String message) {
        try {
            Intent alarmIntent = new Intent(AlarmClock.ACTION_SET_ALARM);
            alarmIntent.putExtra(AlarmClock.EXTRA_HOUR, hour);
            alarmIntent.putExtra(AlarmClock.EXTRA_MINUTES, minute);
            alarmIntent.putExtra(AlarmClock.EXTRA_MESSAGE, message != null ? message : "Agentic Assistant");
            alarmIntent.putExtra(AlarmClock.EXTRA_SKIP_UI, true);
            alarmIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mActivity.startActivity(alarmIntent);
            showToast("Alarm set for " + String.format(Locale.US, "%02d:%02d", hour, minute));
            return "Alarm set for " + String.format(Locale.US, "%02d:%02d", hour, minute);
        } catch (Exception e) {
            return "ERR: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String setDeviceTimer(int lengthSeconds, String message) {
        try {
            Intent timerIntent = new Intent(AlarmClock.ACTION_SET_TIMER);
            timerIntent.putExtra(AlarmClock.EXTRA_LENGTH, lengthSeconds);
            timerIntent.putExtra(AlarmClock.EXTRA_MESSAGE, message != null ? message : "Agentic Timer");
            timerIntent.putExtra(AlarmClock.EXTRA_SKIP_UI, true);
            timerIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mActivity.startActivity(timerIntent);
            showToast("Timer set for " + lengthSeconds + "s");
            return "Timer started for " + lengthSeconds + " seconds";
        } catch (Exception e) {
            return "ERR: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String openMapsNavigation(String destination) {
        if (destination == null || destination.trim().isEmpty()) return "ERR: empty destination";
        try {
            Uri gmmIntentUri = Uri.parse("google.navigation:q=" + Uri.encode(destination.trim()));
            Intent mapIntent = new Intent(Intent.ACTION_VIEW, gmmIntentUri);
            mapIntent.setPackage("com.google.android.apps.maps");
            mapIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            if (mapIntent.resolveActivity(mActivity.getPackageManager()) != null) {
                mActivity.startActivity(mapIntent);
                return "Navigating to " + destination;
            } else {
                Intent geoIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=" + Uri.encode(destination.trim())));
                geoIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                mActivity.startActivity(geoIntent);
                return "Opened map for " + destination;
            }
        } catch (Exception e) {
            return "ERR: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String searchWeb(String query) {
        if (query == null || query.trim().isEmpty()) return "ERR: empty query";
        try {
            Intent searchIntent = new Intent(Intent.ACTION_WEB_SEARCH);
            searchIntent.putExtra(SearchManager.QUERY, query.trim());
            searchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mActivity.startActivity(searchIntent);
            return "Web search for " + query;
        } catch (Exception e) {
            openUrl("https://www.google.com/search?q=" + Uri.encode(query.trim()));
            return "Opened browser search for " + query;
        }
    }

    @JavascriptInterface
    public void startVoiceRecognition() {
        mActivity.runOnUiThread(() -> {
            try {
                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
                intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak your command...");
                mActivity.startActivityForResult(intent, MainActivity.SPEECH_REQUEST_CODE);
            } catch (Exception e) {
                showToast("Speech recognition unavailable: " + e.getMessage());
            }
        });
    }

    // ==========================================
    // 6. HARDWARE & DEVICE CONTROLS
    // ==========================================

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
                ClipData clip = ClipData.newPlainText("Agentic Assistant", text);
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
