package org.antigravity.agenticessence.core.swarm

import kotlinx.serialization.Serializable

/**
 * Agent Roles and Persona Boundaries in the Swarm.
 */
enum class AgentRole {
    PLANNER,
    SYNTHESIZER,
    EXECUTOR,
    CRITIC,
    COORDINATOR
}

@Serializable
data class AgentState(
    val role: AgentRole,
    val isBusy: Boolean = false,
    val currentObjective: String? = null,
    val lastThoughtTrace: String? = null,
    val completedTasksCount: Int = 0
)

/**
 * Concrete definitions and operational prompts for each swarm participant.
 */
sealed class AgentDefinition(
    val role: AgentRole,
    val name: String,
    val avatarTag: String,
    val systemPrompt: String
) {
    object Planner : AgentDefinition(
        role = AgentRole.PLANNER,
        name = "Alan Turing",
        avatarTag = "🧠",
        systemPrompt = """
            You are Turing, the Lead Strategy and Architecture Planner for the Agentic Swarm.
            Your role is to deconstruct high-level user directives into structured, atomic execution graphs.
            You identify dependencies, isolate required tools, and detect when existing tools are insufficient,
            passing tasks to the Synthesizer when capability gaps arise.
            Format your planning output as clear, sequential step graphs.
        """.trimIndent()
    )

    object Synthesizer : AgentDefinition(
        role = AgentRole.SYNTHESIZER,
        name = "Donald Knuth",
        avatarTag = "⚡",
        systemPrompt = """
            You are Knuth, the Dynamic Tool Synthesizer & Code Craftsman.
            When the swarm lacks a tool to complete an objective, your mission is to write executable,
            sandboxed JavaScript (QuickJS) or Shell logic with a strict JSON schema definition.
            Your synthesized code must be self-contained, robustly handle errors, and return structured JSON outputs.
            Format synthesized tools with:
            - name: identifier string
            - description: concise purpose
            - parameters: JSON Schema object
            - executionType: "JAVASCRIPT" or "SHELL"
            - script: pure executable code
        """.trimIndent()
    )

    object Executor : AgentDefinition(
        role = AgentRole.EXECUTOR,
        name = "Ada Lovelace",
        avatarTag = "⚙️",
        systemPrompt = """
            You are Lovelace, the Execution Engine.
            You invoke native Android bridge hooks, dispatch JavaScript sandbox tasks to QuickJS,
            execute privileged Shizuku ADB shells, and interact with the device UI via Accessibility.
            You collect stdout, stderr, execution duration, and exit codes accurately without speculation.
        """.trimIndent()
    )

    object Critic : AgentDefinition(
        role = AgentRole.CRITIC,
        name = "John von Neumann",
        avatarTag = "🔬",
        systemPrompt = """
            You are von Neumann, the Verification & Telemetry Critic.
            You rigorously validate outputs from tool executions against the original sub-goal.
            If an execution fails (non-zero exit code, parsing failure, or incomplete result),
            you formulate precise feedback and trigger a self-correction loop back to the Planner or Synthesizer.
        """.trimIndent()
    )

    companion object {
        fun fromRole(role: AgentRole): AgentDefinition = when (role) {
            AgentRole.PLANNER -> Planner
            AgentRole.SYNTHESIZER -> Synthesizer
            AgentRole.EXECUTOR -> Executor
            AgentRole.CRITIC -> Critic
            AgentRole.COORDINATOR -> Planner
        }
    }
}
