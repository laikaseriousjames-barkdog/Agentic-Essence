package org.antigravity.agenticessence.core.automation

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.graphics.Rect
import android.os.Bundle
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import org.json.JSONArray
import org.json.JSONObject

/**
 * Programmatic Accessibility Automation Service.
 * Allows the Swarm Executor to inspect UI hierarchies, click elements, inject text, and dispatch gestures.
 */
class AgentAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Can be used for event-driven UI observation
    }

    override fun onInterrupt() {
        instance = null
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    companion object {
        var instance: AgentAccessibilityService? = null
            private set

        fun isServiceActive(): Boolean = instance != null

        fun dumpViewTreeJson(): String {
            val service = instance ?: return """{"error": "Accessibility service inactive"}"""
            val rootNode = service.rootInActiveWindow ?: return """{"error": "No active window found"}"""

            val json = JSONObject()
            json.put("packageName", rootNode.packageName?.toString() ?: "")
            json.put("className", rootNode.className?.toString() ?: "")
            json.put("children", dumpNodeRecursive(rootNode))
            return json.toString()
        }

        private fun dumpNodeRecursive(node: AccessibilityNodeInfo): JSONArray {
            val array = JSONArray()
            for (i in 0 until node.childCount) {
                val child = node.getChild(i) ?: continue
                val childObj = JSONObject()
                childObj.put("text", child.text?.toString() ?: "")
                childObj.put("contentDescription", child.contentDescription?.toString() ?: "")
                childObj.put("viewId", child.viewIdResourceName ?: "")
                childObj.put("isClickable", child.isClickable)
                childObj.put("isEditable", child.isEditable)

                val rect = Rect()
                child.getBoundsInScreen(rect)
                childObj.put("bounds", "${rect.left},${rect.top},${rect.right},${rect.bottom}")

                if (child.childCount > 0) {
                    childObj.put("children", dumpNodeRecursive(child))
                }
                array.put(childObj)
            }
            return array
        }

        fun clickElementByText(text: String): Boolean {
            val service = instance ?: return false
            val root = service.rootInActiveWindow ?: return false
            val nodes = root.findAccessibilityNodeInfosByText(text)
            for (node in nodes) {
                if (node.isClickable) {
                    return node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                }
                // Try parent if clickable
                var parent = node.parent
                while (parent != null) {
                    if (parent.isClickable) {
                        return parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                    }
                    parent = parent.parent
                }
            }
            return false
        }

        fun injectTextIntoFocused(text: String): Boolean {
            val service = instance ?: return false
            val root = service.rootInActiveWindow ?: return false
            val focused = root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT) ?: return false
            val arguments = Bundle().apply {
                putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
            }
            return focused.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
        }

        fun dispatchTap(x: Float, y: Float): Boolean {
            val service = instance ?: return false
            val path = Path().apply { moveTo(x, y) }
            val gesture = GestureDescription.Builder()
                .addStroke(GestureDescription.StrokeDescription(path, 0, 50))
                .build()
            return service.dispatchGesture(gesture, null, null)
        }
    }
}
