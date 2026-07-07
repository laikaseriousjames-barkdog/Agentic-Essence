package com.angeticessence.agent

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import org.json.JSONArray
import org.json.JSONObject

/**
 * The agent's "eyes". Reads the current screen's UI tree (text, bounds, clickability)
 * so the AI orchestrator knows what's actually on screen before deciding the next
 * Shizuku action — this is the same underlying tech screen readers use, just repurposed
 * to give the AI situational awareness instead of a person.
 */
class AgentAccessibilityService : AccessibilityService() {

    companion object {
        @Volatile
        var instance: AgentAccessibilityService? = null
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Passive — we pull the tree on demand via dumpScreen(), not on every event,
        // to keep this lightweight and avoid draining battery.
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    /** Returns a compact JSON description of visible, interactive elements on screen. */
    fun dumpScreen(): JSONArray {
        val result = JSONArray()
        val root = rootInActiveWindow ?: return result
        collectNodes(root, result)
        return result
    }

    private fun collectNodes(node: AccessibilityNodeInfo, out: JSONArray, depth: Int = 0) {
        if (depth > 40) return // guard against pathological trees

        val text = node.text?.toString()
        val desc = node.contentDescription?.toString()
        val isInteractive = node.isClickable || node.isEditable || node.isCheckable

        if (!text.isNullOrBlank() || !desc.isNullOrBlank() || isInteractive) {
            val bounds = android.graphics.Rect()
            node.getBoundsInScreen(bounds)
            val obj = JSONObject()
            obj.put("text", text ?: "")
            obj.put("desc", desc ?: "")
            obj.put("clickable", node.isClickable)
            obj.put("editable", node.isEditable)
            obj.put("bounds_x", bounds.centerX())
            obj.put("bounds_y", bounds.centerY())
            obj.put("class", node.className?.toString() ?: "")
            out.put(obj)
        }

        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { collectNodes(it, out, depth + 1) }
        }
    }
}
