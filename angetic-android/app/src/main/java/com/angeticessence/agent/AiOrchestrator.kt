package com.angeticessence.agent

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * The agent's "brain". Sends the current screen state + the user's task to the
 * Angetic Essence backend (Turing decomposes, Knuth/Lovelace-style reasoning picks
 * the next concrete action), and gets back one atomic step to execute via Shizuku.
 *
 * Loop: dump screen -> ask backend "what next?" -> execute step -> repeat until "done".
 */
object AiOrchestrator {

    // Point this at your deployed Base44 backend function endpoint.
    private const val BACKEND_URL = "https://superagent-313bcbd0.base44.app/functions/angeticAgentStep"

    private val client = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    data class AgentStep(
        val type: String,       // "tap" | "swipe" | "type" | "key" | "open_app" | "wait" | "done" | "error"
        val x: Int = 0,
        val y: Int = 0,
        val x2: Int = 0,
        val y2: Int = 0,
        val text: String = "",
        val packageName: String = "",
        val keyCode: Int = 0,
        val reasoning: String = ""
    )

    suspend fun nextStep(task: String, screenElements: JSONArray, history: JSONArray): AgentStep =
        withContext(Dispatchers.IO) {
            val payload = JSONObject().apply {
                put("task", task)
                put("screen", screenElements)
                put("history", history)
            }

            val body = payload.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url(BACKEND_URL)
                .post(body)
                .build()

            try {
                client.newCall(request).execute().use { response ->
                    val raw = response.body?.string() ?: "{}"
                    val json = JSONObject(raw)
                    AgentStep(
                        type = json.optString("type", "error"),
                        x = json.optInt("x", 0),
                        y = json.optInt("y", 0),
                        x2 = json.optInt("x2", 0),
                        y2 = json.optInt("y2", 0),
                        text = json.optString("text", ""),
                        packageName = json.optString("package_name", ""),
                        keyCode = json.optInt("key_code", 0),
                        reasoning = json.optString("reasoning", "")
                    )
                }
            } catch (e: Exception) {
                AgentStep(type = "error", reasoning = e.message ?: "network error")
            }
        }

    /** Executes one decided step using ShizukuManager (the agent's hands). */
    fun execute(step: AgentStep): String = when (step.type) {
        "tap" -> ShizukuManager.tap(step.x, step.y)
        "swipe" -> ShizukuManager.swipe(step.x, step.y, step.x2, step.y2)
        "type" -> { ShizukuManager.typeText(step.text); "typed" }
        "key" -> ShizukuManager.keyEvent(step.keyCode)
        "open_app" -> ShizukuManager.openApp(step.packageName)
        "wait" -> { Thread.sleep(800); "waited" }
        "done" -> "task complete"
        else -> "unrecognized step: ${step.type}"
    }
}
