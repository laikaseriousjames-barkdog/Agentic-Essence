package com.angeticessence.agent

import android.content.pm.PackageManager
import android.util.Log
import rikka.shizuku.Shizuku
import java.io.BufferedReader
import java.io.InputStreamReader

/**
 * Wraps Shizuku so the agent can run privileged shell commands (input taps/swipes/text,
 * screencap, package management) WITHOUT full root — the user just pairs once via
 * Wireless Debugging (Android 11+) or ADB, same one-time setup Shizuku itself uses.
 *
 * This is the "hands" of the agent: Turing/Knuth/Lovelace decide WHAT to do,
 * ShizukuManager is HOW it actually happens on the device.
 */
object ShizukuManager {

    private const val REQUEST_CODE = 9001
    private const val TAG = "AngeticShizuku"

    var onPermissionResult: ((granted: Boolean) -> Unit)? = null

    private val permissionListener = Shizuku.OnRequestPermissionResultListener { requestCode, grantResult ->
        if (requestCode == REQUEST_CODE) {
            val granted = grantResult == PackageManager.PERMISSION_GRANTED
            onPermissionResult?.invoke(granted)
        }
    }

    fun init() {
        Shizuku.addRequestPermissionResultListener(permissionListener)
    }

    fun isAvailable(): Boolean = try {
        Shizuku.pingBinder()
    } catch (e: Throwable) {
        false
    }

    fun hasPermission(): Boolean = try {
        Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED
    } catch (e: Throwable) {
        false
    }

    fun requestPermission() {
        try {
            if (Shizuku.isPreV11()) {
                // Pre-API 11 Shizuku permission model — handled via legacy request
                Shizuku.requestPermission(REQUEST_CODE)
            } else {
                Shizuku.requestPermission(REQUEST_CODE)
            }
        } catch (e: Throwable) {
            Log.e(TAG, "requestPermission failed", e)
        }
    }

    /**
     * Runs a shell command with Shizuku's elevated (shell UID) privileges.
     * Examples the AI orchestrator uses:
     *   input tap <x> <y>
     *   input swipe <x1> <y1> <x2> <y2> <durationMs>
     *   input text "<escaped text>"
     *   input keyevent <keycode>
     *   am start -n <package>/<activity>
     *   screencap -p /sdcard/angetic_screen.png
     */
    fun runCommand(cmd: String): String {
        if (!hasPermission()) return "ERROR: Shizuku permission not granted"
        return try {
            val process = Shizuku.newProcess(arrayOf("sh", "-c", cmd), null, null)
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            val output = reader.readText()
            process.waitFor()
            output.ifBlank { "OK" }
        } catch (e: Throwable) {
            Log.e(TAG, "runCommand failed: $cmd", e)
            "ERROR: ${e.message}"
        }
    }

    fun tap(x: Int, y: Int) = runCommand("input tap $x $y")

    fun swipe(x1: Int, y1: Int, x2: Int, y2: Int, durationMs: Int = 300) =
        runCommand("input swipe $x1 $y1 $x2 $y2 $durationMs")

    fun typeText(text: String) {
        // Shell 'input text' can't handle spaces/special chars directly — encode safely
        val escaped = text.replace(" ", "%s").replace("'", "\\'")
        runCommand("input text $escaped")
    }

    fun keyEvent(code: Int) = runCommand("input keyevent $code")

    fun openApp(packageName: String) =
        runCommand("monkey -p $packageName -c android.intent.category.LAUNCHER 1")

    fun screenshotToFile(path: String = "/sdcard/angetic_screen.png") =
        runCommand("screencap -p $path")
}
