package org.antigravity.agenticessence.core.synthesis

import app.cash.quickjs.QuickJs
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.antigravity.agenticessence.core.automation.DeviceAutomationBridge
import java.io.BufferedReader
import java.io.InputStreamReader
import java.util.concurrent.ConcurrentHashMap

data class ToolExecutionResult(
    val isSuccess: Boolean,
    val output: String,
    val error: String? = null,
    val exitCode: Int = 0,
    val durationMs: Long = 0
)

/**
 * Dynamic in-process tool runtime.
 * Evaluates synthesized JavaScript in isolated QuickJS sandboxes or dispatches to privileged device shell bridges.
 */
class DynamicToolEngine(
    private val automationBridge: DeviceAutomationBridge
) {
    private val activeTools = ConcurrentHashMap<String, SynthesizedToolEntity>()

    fun registerTool(tool: SynthesizedToolEntity) {
        activeTools[tool.name] = tool
    }

    fun unregisterTool(toolName: String) {
        activeTools.remove(toolName)
    }

    suspend fun executeTool(toolName: String, jsonParams: String): ToolExecutionResult = withContext(Dispatchers.IO) {
        val tool = activeTools[toolName] ?: return@withContext ToolExecutionResult(
            isSuccess = false,
            output = "",
            error = "ERR: Tool '$toolName' not registered in runtime",
            exitCode = -1
        )

        val startTime = System.currentTimeMillis()
        try {
            when (tool.executionType.uppercase()) {
                "JAVASCRIPT" -> executeJavaScriptTool(tool.scriptContent, jsonParams, startTime)
                "SHELL" -> executeShellTool(tool.scriptContent, jsonParams, startTime)
                else -> ToolExecutionResult(
                    isSuccess = false,
                    output = "",
                    error = "Unsupported execution type: ${tool.executionType}",
                    exitCode = -2
                )
            }
        } catch (e: Exception) {
            ToolExecutionResult(
                isSuccess = false,
                output = "",
                error = "Runtime Exception in '${tool.name}': ${e.message}",
                exitCode = 1,
                durationMs = System.currentTimeMillis() - startTime
            )
        }
    }

    suspend fun executeDirectJavaScript(script: String): ToolExecutionResult = withContext(Dispatchers.Default) {
        val startTime = System.currentTimeMillis()
        var quickJs: QuickJs? = null
        try {
            quickJs = QuickJs.create()
            val result = quickJs.evaluate(script)
            ToolExecutionResult(
                isSuccess = true,
                output = result?.toString() ?: "undefined",
                exitCode = 0,
                durationMs = System.currentTimeMillis() - startTime
            )
        } catch (e: Exception) {
            ToolExecutionResult(
                isSuccess = false,
                output = "",
                error = "QuickJS evaluation error: ${e.message}",
                exitCode = 1,
                durationMs = System.currentTimeMillis() - startTime
            )
        } finally {
            quickJs?.close()
        }
    }

    private fun executeJavaScriptTool(script: String, jsonParams: String, startTime: Long): ToolExecutionResult {
        var quickJs: QuickJs? = null
        return try {
            quickJs = QuickJs.create()
            // Inject standard helper globals
            val bootstrap = """
                var params = $jsonParams;
                function runTool(params) {
                    $script
                }
                JSON.stringify(runTool(params));
            """.trimIndent()

            val result = quickJs.evaluate(bootstrap)?.toString() ?: "{}"
            ToolExecutionResult(
                isSuccess = true,
                output = result,
                exitCode = 0,
                durationMs = System.currentTimeMillis() - startTime
            )
        } catch (e: Exception) {
            ToolExecutionResult(
                isSuccess = false,
                output = "",
                error = "JS Error: ${e.message}",
                exitCode = 1,
                durationMs = System.currentTimeMillis() - startTime
            )
        } finally {
            quickJs?.close()
        }
    }

    private fun executeShellTool(script: String, jsonParams: String, startTime: Long): ToolExecutionResult {
        return try {
            // First check if privileged Shizuku execution is available
            val shellResult = automationBridge.executeShellCommand(script)
            ToolExecutionResult(
                isSuccess = shellResult.exitCode == 0,
                output = shellResult.stdout,
                error = shellResult.stderr.ifEmpty { null },
                exitCode = shellResult.exitCode,
                durationMs = System.currentTimeMillis() - startTime
            )
        } catch (e: Exception) {
            // Fallback to local ProcessBuilder
            val process = Runtime.getRuntime().exec(arrayOf("sh", "-c", script))
            val stdout = BufferedReader(InputStreamReader(process.inputStream)).readText()
            val stderr = BufferedReader(InputStreamReader(process.errorStream)).readText()
            val code = process.waitFor()

            ToolExecutionResult(
                isSuccess = code == 0,
                output = stdout.trim(),
                error = stderr.trim().ifEmpty { null },
                exitCode = code,
                durationMs = System.currentTimeMillis() - startTime
            )
        }
    }
}
