package org.antigravity.agenticessence.core.automation

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import org.antigravity.agenticessence.MainActivity

/**
 * Foreground Execution Coordinator.
 * Keeps long-running swarm background loops, tool compilations, and automation bridges active without OS termination.
 */
class SwarmForegroundService : Service() {

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val taskTitle = intent?.getStringExtra(EXTRA_TASK_TITLE) ?: "Swarm Active"
        val notification = buildNotification(taskTitle)
        startForeground(NOTIFICATION_ID, notification)
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Agentic Swarm Background Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps autonomous multi-agent tasks executing reliably"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(contentText: String): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Agentic Essence Autonomous Swarm")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    companion object {
        const val CHANNEL_ID = "agentic_swarm_channel"
        const val NOTIFICATION_ID = 4040
        const val EXTRA_TASK_TITLE = "extra_task_title"

        fun start(context: Context, taskTitle: String = "Swarm Engine Active") {
            val intent = Intent(context, SwarmForegroundService::class.java).apply {
                putExtra(EXTRA_TASK_TITLE, taskTitle)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, SwarmForegroundService::class.java)
            context.stopService(intent)
        }
    }
}
