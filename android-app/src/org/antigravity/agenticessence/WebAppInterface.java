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

import android.net.wifi.ScanResult;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
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
        } catch (Exception e) {
            Log.w(TAG, "IP lookup error: " + e.getMessage());
        }
        return "127.0.0.1";
    }

    @JavascriptInterface
    public String scanWifiNetworks() {
        try {
            Context ctx = mActivity.getApplicationContext();
            WifiManager wifiManager = (WifiManager) ctx.getSystemService(Context.WIFI_SERVICE);
            if (wifiManager == null) return "ERR: WifiManager is unavailable on this device.";

            if (!wifiManager.isWifiEnabled()) {
                return "[!] Wi-Fi interface is currently DISABLED.\nRun 'wifi on' to enable Wi-Fi hardware.";
            }

            try {
                wifiManager.startScan();
            } catch (Exception e) {
                Log.w(TAG, "startScan: " + e.getMessage());
            }

            List<ScanResult> results = wifiManager.getScanResults();
            StringBuilder sb = new StringBuilder();
            sb.append(String.format(Locale.US, "%-17s  %3s  %2s  %-17s  %s\n", "BSSID", "PWR", "CH", "SECURITY", "ESSID"));
            sb.append("-----------------  ---  --  -----------------  --------------------\n");

            if (results != null && !results.isEmpty()) {
                for (ScanResult r : results) {
                    int chan = convertFrequencyToChannel(r.frequency);
                    String ssid = (r.SSID != null && !r.SSID.isEmpty()) ? r.SSID : "<Hidden ESSID>";
                    if (ssid.length() > 22) ssid = ssid.substring(0, 19) + "...";
                    String bssid = r.BSSID != null ? r.BSSID.toUpperCase(Locale.US) : "00:00:00:00:00:00";
                    String caps = r.capabilities != null ? r.capabilities : "OPEN";
                    if (caps.length() > 17) caps = caps.substring(0, 15) + "..";
                    sb.append(String.format(Locale.US, "%-17s  %3d  %2d  %-17s  %s\n",
                            bssid, r.level, chan, caps, ssid));
                }
                sb.append(String.format(Locale.US, "\n[*] Found %d wireless access points via wlan0 hardware.", results.size()));
            } else {
                WifiInfo info = wifiManager.getConnectionInfo();
                if (info != null && info.getNetworkId() != -1) {
                    sb.append(String.format(Locale.US, "%-17s  %3d  %2d  [CONNECTED]        %s\n",
                            info.getBSSID() != null ? info.getBSSID().toUpperCase(Locale.US) : "ACTIVE",
                            info.getRssi(),
                            convertFrequencyToChannel(info.getFrequency()),
                            info.getSSID() != null ? info.getSSID() : "Connected AP"));
                    sb.append(String.format(Locale.US, "\n[*] Active connection: %s (%d Mbps, %d MHz)\n[*] For broader passive scanning, ensure Location / Nearby permissions are active in Android Settings.",
                            info.getSSID(), info.getLinkSpeed(), info.getFrequency()));
                } else {
                    sb.append("[!] No cached broadcast scan results returned by driver.\nCheck Location permissions or retry in 5 seconds.");
                }
            }
            return sb.toString();
        } catch (Exception e) {
            return "ERR: Wi-Fi scan failed: " + e.getMessage();
        }
    }

    private int convertFrequencyToChannel(int freq) {
        if (freq >= 2412 && freq <= 2484) {
            return (freq - 2412) / 5 + 1;
        } else if (freq >= 5170 && freq <= 5825) {
            return (freq - 5170) / 5 + 34;
        }
        return 0;
    }

    @JavascriptInterface
    public String getWifiInfo() {
        try {
            Context ctx = mActivity.getApplicationContext();
            WifiManager wifiManager = (WifiManager) ctx.getSystemService(Context.WIFI_SERVICE);
            if (wifiManager == null) return "WifiManager unavailable";
            WifiInfo info = wifiManager.getConnectionInfo();
            if (info == null || info.getNetworkId() == -1) {
                return "wlan0: Interface active, but not associated with an AP.";
            }
            return String.format(Locale.US,
                    "wlan0: IEEE 802.11  ESSID: %s\n" +
                    "       Mode: Managed  Frequency: %.3f GHz  Access Point: %s\n" +
                    "       Bit Rate: %d Mb/s   Tx-Power: 20 dBm\n" +
                    "       Signal level: %d dBm   Link Quality: %d%%\n" +
                    "       IPv4: %s",
                    info.getSSID(),
                    info.getFrequency() / 1000.0,
                    info.getBSSID(),
                    info.getLinkSpeed(),
                    info.getRssi(),
                    Math.min(100, Math.max(0, 2 * (info.getRssi() + 100))),
                    getDeviceIpAddress());
        } catch (Exception e) {
            return "ERR: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String getNetworkInterfacesInfo() {
        try {
            StringBuilder sb = new StringBuilder();
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            if (interfaces != null) {
                for (NetworkInterface iface : Collections.list(interfaces)) {
                    byte[] mac = iface.getHardwareAddress();
                    String macStr = "";
                    if (mac != null) {
                        StringBuilder mb = new StringBuilder();
                        for (int i = 0; i < mac.length; i++) {
                            mb.append(String.format(Locale.US, "%02X%s", mac[i], (i < mac.length - 1) ? ":" : ""));
                        }
                        macStr = mb.toString();
                    }

                    sb.append(String.format(Locale.US, "%-10s: flags=%d<%s>  mtu %d\n",
                            iface.getName(),
                            iface.isUp() ? 4163 : 4098,
                            (iface.isUp() ? "UP," : "") + (iface.isLoopback() ? "LOOPBACK," : "") + "RUNNING",
                            iface.getMTU()));

                    Enumeration<InetAddress> addrs = iface.getInetAddresses();
                    while (addrs.hasMoreElements()) {
                        InetAddress addr = addrs.nextElement();
                        if (addr instanceof Inet4Address) {
                            sb.append(String.format(Locale.US, "        inet %s  netmask 255.255.255.0\n", addr.getHostAddress()));
                        } else {
                            sb.append(String.format(Locale.US, "        inet6 %s\n", addr.getHostAddress()));
                        }
                    }
                    if (!macStr.isEmpty()) {
                        sb.append(String.format(Locale.US, "        ether %s  txqueuelen 1000  (Ethernet)\n", macStr));
                    }
                    sb.append("\n");
                }
            }
            return sb.toString().trim();
        } catch (Exception e) {
            return "ERR: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String runShellCommand(String cmd) {
        if (cmd == null || cmd.trim().isEmpty()) return "ERR: empty command";
        String trimmed = cmd.trim();
        String lower = trimmed.toLowerCase(Locale.US);

        // 1. Direct hardware wireless / network queries
        if (lower.equals("wifi scan") || lower.equals("iwlist scan") || lower.equals("wifiscan") ||
            lower.equals("airodump-ng") || lower.equals("nmcli dev wifi") || lower.startsWith("iwlist ") ||
            lower.equals("iw dev wlan0 scan") || lower.equals("wifi-scan") || lower.equals("scan")) {
            return scanWifiNetworks();
        }

        if (lower.equals("wifi") || lower.equals("wifi status") || lower.equals("wifi info") ||
            lower.equals("iwconfig") || lower.equals("iw dev")) {
            return getWifiInfo();
        }

        if (lower.equals("ifconfig") || lower.equals("ip a") || lower.equals("ip addr") || lower.equals("netstat -i")) {
            return getNetworkInterfacesInfo();
        }

        if (lower.equals("wifi on") || lower.equals("wifi enable")) {
            try {
                WifiManager wm = (WifiManager) mActivity.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
                if (wm != null) {
                    wm.setWifiEnabled(true);
                    return "[*] Wi-Fi hardware interface enabled.";
                }
            } catch (Exception e) { return "ERR: " + e.getMessage(); }
        }

        if (lower.equals("wifi off") || lower.equals("wifi disable")) {
            try {
                WifiManager wm = (WifiManager) mActivity.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
                if (wm != null) {
                    wm.setWifiEnabled(false);
                    return "[*] Wi-Fi hardware interface disabled.";
                }
            } catch (Exception e) { return "ERR: " + e.getMessage(); }
        }

        if (lower.equals("battery") || lower.equals("power")) {
            return String.format(Locale.US, "Battery Level: %d%%\nCharging: %s", getBatteryLevel(), isDeviceCharging() ? "YES" : "NO");
        }

        if (lower.equals("torch on") || lower.equals("flashlight on")) {
            toggleFlashlight(true);
            return "[*] Flashlight turned ON.";
        }
        if (lower.equals("torch off") || lower.equals("flashlight off")) {
            toggleFlashlight(false);
            return "[*] Flashlight turned OFF.";
        }

        // 2. Real process execution capturing both STDOUT and STDERR
        try {
            ProcessBuilder pb = new ProcessBuilder("sh", "-c", trimmed);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            int count = 0;
            while ((line = reader.readLine()) != null && count < 3000) {
                sb.append(line).append("\n");
                count++;
            }
            process.waitFor();
            String res = sb.toString().trim();
            if (res.isEmpty()) {
                int exitCode = process.exitValue();
                return exitCode == 0 ? "Command completed successfully (exit code 0)." : "Process exited with code " + exitCode;
            }
            return res;
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
