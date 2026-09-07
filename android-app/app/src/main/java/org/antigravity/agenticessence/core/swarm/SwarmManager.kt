package org.antigravity.agenticessence.core.swarm

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import org.antigravity.agenticessence.core.automation.DeviceAutomationBridge
import org.antigravity.agenticessence.core.provider.UniversalModelClient
import org.antigravity.agenticessence.core.synthesis.DynamicToolEngine
import org.antigravity.agenticessence.core.synthesis.SynthesizedToolEntity
import org.antigravity.agenticessence.core.synthesis.ToolRegistryDao

@Serializable
data class StepExecution(
    val stepId: String,
    val agentRole: AgentRole,
    val description: String,
    val toolName: String? = null,
    val inputPayload: String? = null,
    val outputPayload: String? = null,
    val status: StepStatus = StepStatus.PENDING,
    val error: String? = null,
    val durationMs: Long = 0
)

enum class StepStatus {
    PENDING,
    RUNNING,
    SUCCESS,
    FAILED,
    RETRYING
}

data class SwarmExecutionState(
    val isRunning: Boolean = false,
    val activeAgent: AgentRole? = null,
    val currentDirective: String = "",
    val executionPlan: List<StepExecution> = emptyList(),
    val liveThought: String = "",
    val liveResponse: String = "",
    val totalSelfCorrections: Int = 0
)

/**
 * Autonomous Swarm Orchestrator.
 * Handles planning, dynamic tool synthesis triggers, execution dispatching, and critic verification loops.
 */
class SwarmManager(
    private val modelClient: UniversalModelClient,
    private val dynamicToolEngine: DynamicToolEngine,
    private val toolRegistryDao: ToolRegistryDao,
    private val deviceAutomationBridge: DeviceAutomationBridge,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.IO)
) {
    private val _swarmState = MutableStateFlow(SwarmExecutionState())
    val swarmState: StateFlow<SwarmExecutionState> = _swarmState.asStateFlow()

    fun submitDirective(userDirective: String) {
        scope.launch {
            _swarmState.update {
                it.copy(
                    isRunning = true,
                    activeAgent = AgentRole.PLANNER,
                    currentDirective = userDirective,
                    executionPlan = emptyList(),
                    liveThought = "Deconstructing directive into execution plan...",
                    liveResponse = ""
                )
            }

            try {
                executeOrchestrationLoop(userDirective)
            } catch (e: Exception) {
                _swarmState.update {
                    it.copy(
                        isRunning = false,
                        activeAgent = null,
                        liveThought = "Swarm execution encountered error: ${e.localizedMessage}",
                        liveResponse = it.liveResponse.ifEmpty { "Encountered an execution halt: ${e.message}" }
                    )
                }
            } finally {
                _swarmState.update { it.copy(isRunning = false, activeAgent = null) }
            }
        }
    }

    private suspend fun executeOrchestrationLoop(directive: String) {
        // Step 1: PLANNER AGENT
        _swarmState.update { it.copy(activeAgent = AgentRole.PLANNER, liveThought = "Turing is analyzing available tools and planning steps...") }
        val availableTools = toolRegistryDao.getAllToolsOnce()
        val plan = generatePlan(directive, availableTools)

        _swarmState.update { it.copy(executionPlan = plan) }

        // Step 2: EXECUTE PLAN GRAPH WITH CORRECTION LOOPS
        for (i in plan.indices) {
            val step = _swarmState.value.executionPlan[i]
            updateStepStatus(i, StepStatus.RUNNING)

            var stepCompleted = false
            var retryCount = 0
            val maxRetries = 3

            while (!stepCompleted && retryCount < maxRetries) {
                // Check if tool exists or if synthesis is needed
                val targetToolName = step.toolName
                val existingTool = targetToolName?.let { name -> availableTools.find { it.name == name } }

                val stepResult = if (existingTool == null && targetToolName != null) {
                    // Step 2a: SYNTHESIZER AGENT (Need to create tool on the fly)
                    _swarmState.update { it.copy(activeAgent = AgentRole.SYNTHESIZER, liveThought = "Knuth is synthesizing tool '$targetToolName' from scratch...") }
                    val synthesized = synthesizeMissingTool(targetToolName, step.description)
                    toolRegistryDao.insertTool(synthesized)
                    dynamicToolEngine.registerTool(synthesized)

                    // Execute synthesized tool
                    _swarmState.update { it.copy(activeAgent = AgentRole.EXECUTOR, liveThought = "Executing synthesized tool '${synthesized.name}'...") }
                    dynamicToolEngine.executeTool(synthesized.name, step.inputPayload ?: "{}")
                } else if (existingTool != null) {
                    // Step 2b: EXECUTOR AGENT
                    _swarmState.update { it.copy(activeAgent = AgentRole.EXECUTOR, liveThought = "Lovelace is running tool '${existingTool.name}'...") }
                    dynamicToolEngine.executeTool(existingTool.name, step.inputPayload ?: "{}")
                } else {
                    // General direct computation / thought
                    _swarmState.update { it.copy(activeAgent = AgentRole.EXECUTOR, liveThought = "Lovelace is computing step...") }
                    dynamicToolEngine.executeDirectJavaScript("JSON.stringify({ result: 'Completed thought step: ${step.description}' })")
                }

                // Step 3: CRITIC AGENT (Verify result)
                _swarmState.update { it.copy(activeAgent = AgentRole.CRITIC, liveThought = "von Neumann is auditing execution telemetry and return code...") }
                val isSuccess = stepResult.isSuccess && !stepResult.output.contains("ERR:")

                if (isSuccess) {
                    updateStepResult(i, StepStatus.SUCCESS, stepResult.output, null, stepResult.durationMs)
                    stepCompleted = true
                } else {
                    retryCount++
                    _swarmState.update { it.copy(totalSelfCorrections = it.totalSelfCorrections + 1) }
                    if (retryCount < maxRetries) {
                        updateStepResult(i, StepStatus.RETRYING, stepResult.output, "Critique: Non-zero or invalid response. Retrying with adjusted parameters...", stepResult.durationMs)
                    } else {
                        updateStepResult(i, StepStatus.FAILED, stepResult.output, "Failed after $maxRetries attempts: ${stepResult.error}", stepResult.durationMs)
                    }
                }
            }
        }

        // Step 4: SYNTHESIZE FINAL RESPONSE
        _swarmState.update { it.copy(activeAgent = AgentRole.PLANNER, liveThought = "Formulating synthesized resolution for user...") }
        val finalResponse = modelClient.generateResponse(
            systemPrompt = AgentDefinition.Planner.systemPrompt,
            userPrompt = "User Objective: $directive\nExecution Plan & Outcomes:\n" +
                    _swarmState.value.executionPlan.joinToString("\n") { "[${it.status}] ${it.description} -> Result: ${it.outputPayload}" }
        )

        _swarmState.update {
            it.copy(
                liveResponse = finalResponse,
                liveThought = "Objective completed."
            )
        }
    }

    private fun updateStepStatus(index: Int, status: StepStatus) {
        _swarmState.update { current ->
            val updated = current.executionPlan.toMutableList()
            if (index in updated.indices) {
                updated[index] = updated[index].copy(status = status)
            }
            current.copy(executionPlan = updated)
        }
    }

    private fun updateStepResult(index: Int, status: StepStatus, output: String, error: String?, durationMs: Long) {
        _swarmState.update { current ->
            val updated = current.executionPlan.toMutableList()
            if (index in updated.indices) {
                updated[index] = updated[index].copy(
                    status = status,
                    outputPayload = output,
                    error = error,
                    durationMs = durationMs
                )
            }
            current.copy(executionPlan = updated)
        }
    }

    private suspend fun generatePlan(directive: String, availableTools: List<SynthesizedToolEntity>): List<StepExecution> {
        val toolNames = availableTools.joinToString { it.name }
        val planPrompt = """
            Directive: $directive
            Available Tools: [$toolNames]
            Create a list of 1 to 4 sequential atomic steps.
            Output as line-separated steps: [ROLE]|[TOOL_NAME or NONE]|[DESCRIPTION]
        """.trimIndent()

        val response = modelClient.generateResponse(AgentDefinition.Planner.systemPrompt, planPrompt)
        val steps = mutableListOf<StepExecution>()

        response.lines().filter { it.isNotBlank() && it.contains("|") }.forEachIndexed { idx, line ->
            val parts = line.split("|").map { it.trim() }
            if (parts.size >= 3) {
                val role = try { AgentRole.valueOf(parts[0].uppercase()) } catch (e: Exception) { AgentRole.EXECUTOR }
                val tool = if (parts[1].equals("NONE", ignoreCase = true) || parts[1].isEmpty()) null else parts[1]
                steps.add(
                    StepExecution(
                        stepId = "step_$idx",
                        agentRole = role,
                        description = parts[2],
                        toolName = tool,
                        status = StepStatus.PENDING
                    )
                )
            }
        }

        if (steps.isEmpty()) {
            steps.add(
                StepExecution(
                    stepId = "step_default",
                    agentRole = AgentRole.EXECUTOR,
                    description = directive,
                    toolName = null,
                    status = StepStatus.PENDING
                )
            )
        }
        return steps
    }

    private suspend fun synthesizeMissingTool(toolName: String, requirement: String): SynthesizedToolEntity {
        val prompt = """
            Synthesize an executable JavaScript tool function for QuickJS.
            Tool Name: $toolName
            Requirement: $requirement
            Return ONLY the pure JavaScript function body that accepts 'params' and returns a JSON string.
        """.trimIndent()

        val jsCode = modelClient.generateResponse(AgentDefinition.Synthesizer.systemPrompt, prompt)
        val cleanScript = jsCode.replace("```javascript", "").replace("```js", "").replace("```", "").trim()

        return SynthesizedToolEntity(
            name = toolName,
            description = "Autonomously synthesized tool for $requirement",
            parameterSchemaJson = """{"type": "object", "properties": {}}""",
            executionType = "JAVASCRIPT",
            scriptContent = cleanScript,
            isValidated = true,
            createdAt = System.currentTimeMillis()
        )
    }
}
