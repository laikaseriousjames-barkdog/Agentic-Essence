package com.angeticessence.agent

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder

/**
 * Keeps the agent alive while running multi-step tasks so Android doesn't kill
 * the process mid-automation (e.g. while waiting on a slow app to load).
 */
class AgentForegroundService : Service() {

    private val channelId = "angetic_agent_channel"

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        createChannelIfNeeded()
        val notification = Notification.Builder(this, channelId)
            .setContentTitle("Angetic Essence")
            .setContentText("Agent is running a task…")
            .setSmallIcon(android.R.drawable.sym_def_app_icon)
            .build()
        startForeground(1, notification)
        return START_STICKY
    }

    private fun createChannelIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "Agent Activity", NotificationManager.IMPORTANCE_LOW)
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
