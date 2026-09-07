package org.antigravity.agenticessence.core.automation

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.BatteryManager
import android.os.Environment
import android.os.StatFs
import android.telephony.SmsManager
import rikka.shizuku.Shizuku
import java.io.BufferedReader
import java.io.InputStreamReader

data class ShellExecutionResult(
    val exitCode: Int,
    val stdout: String,
    val stderr: String
)

data class DeviceMetrics(
    val batteryPercent: Int,
    val isCharging: Boolean,
    val freeStorageGb: Double,
    val isNetworkConnected: Boolean,
    val isShizukuAvailable: Boolean
)

/**
 * High-privilege Automation Bridge.
 * Connects directly to Shizuku/ADB IPC, root shell, accessibility, and Android platform APIs.
 */
class DeviceAutomationBridge(
    private val context: Context
) {
    fun isShizukuReady(): Boolean {
        return try {
            Shizuku.pingBinder() && Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED
        } catch (e: Throwable) {
            false
        }
    }

    fun executeShellCommand(command: String): ShellExecutionResult {
        return if (isShizukuReady()) {
            executeShizukuShell(command)
        } else {
            executeStandardShell(command)
        }
    }

    private fun executeShizukuShell(command: String): ShellExecutionResult {
        return try {
            val process = Shizuku.newProcess(arrayOf("sh", "-c", command), null, null)
            val stdout = BufferedReader(InputStreamReader(process.inputStream)).readText()
            val stderr = BufferedReader(InputStreamReader(process.errorStream)).readText()
            val code = process.waitFor()
            ShellExecutionResult(code, stdout.trim(), stderr.trim())
        } catch (e: Exception) {
            ShellExecutionResult(-1, "", "Shizuku Shell Exception: ${e.message}")
        }
    }

    private fun executeStandardShell(command: String): ShellExecutionResult {
        return try {
            val process = Runtime.getRuntime().exec(arrayOf("sh", "-c", command))
            val stdout = BufferedReader(InputStreamReader(process.inputStream)).readText()
            val stderr = BufferedReader(InputStreamReader(process.errorStream)).readText()
            val code = process.waitFor()
            ShellExecutionResult(code, stdout.trim(), stderr.trim())
        } catch (e: Exception) {
            ShellExecutionResult(-1, "", "Standard Shell Exception: ${e.message}")
        }
    }

    fun getDeviceMetrics(): DeviceMetrics {
        // Battery
        val ifilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        val batteryStatus = context.registerReceiver(null, ifilter)
        val level = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        val batteryPct = if (level >= 0 && scale > 0) ((level / scale.toFloat()) * 100).toInt() else 100
        val status = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL

        // Storage
        val stat = StatFs(Environment.getDataDirectory().path)
        val freeBytes = stat.availableBlocksLong * stat.blockSizeLong
        val freeGb = freeBytes / (1024.0 * 1024.0 * 1024.0)

        // Network
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val activeNet = cm.activeNetwork
        val caps = cm.getNetworkCapabilities(activeNet)
        val isConnected = caps?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true

        return DeviceMetrics(
            batteryPercent = batteryPct,
            isCharging = isCharging,
            freeStorageGb = freeGb,
            isNetworkConnected = isConnected,
            isShizukuAvailable = isShizukuReady()
        )
    }

    fun sendDirectSms(phoneNumber: String, message: String): Boolean {
        return try {
            val smsManager = context.getSystemService(SmsManager::class.java) ?: SmsManager.getDefault()
            val parts = smsManager.divideMessage(message)
            if (parts.size > 1) {
                smsManager.sendMultipartTextMessage(phoneNumber, null, parts, null, null)
            } else {
                smsManager.sendTextMessage(phoneNumber, null, message, null, null)
            }
            true
        } catch (e: Exception) {
            false
        }
    }

    fun makeDirectCall(phoneNumber: String): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_CALL, Uri.parse("tel:${Uri.encode(phoneNumber)}")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            false
        }
    }
}
