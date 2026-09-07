package org.antigravity.agenticessence.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.antigravity.agenticessence.core.swarm.AgentRole
import org.antigravity.agenticessence.core.swarm.StepExecution
import org.antigravity.agenticessence.core.swarm.StepStatus
import org.antigravity.agenticessence.core.swarm.SwarmManager

data class UIMessage(
    val id: String,
    val sender: String,
    val text: String,
    val isUser: Boolean,
    val steps: List<StepExecution> = emptyList(),
    val timestamp: Long = System.currentTimeMillis()
)

@Composable
fun ChatScreen(
    swarmManager: SwarmManager,
    onNavigateToTools: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    val swarmState by swarmManager.swarmState.collectAsState()
    val messages = remember { mutableStateListOf<UIMessage>() }
    var inputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    // Auto-append assistant response when finished
    LaunchedEffect(swarmState.isRunning, swarmState.liveResponse) {
        if (!swarmState.isRunning && swarmState.liveResponse.isNotEmpty()) {
            if (messages.isEmpty() || messages.last().text != swarmState.liveResponse) {
                messages.add(
                    UIMessage(
                        id = "msg_${System.currentTimeMillis()}",
                        sender = "Agentic Swarm",
                        text = swarmState.liveResponse,
                        isUser = false,
                        steps = swarmState.executionPlan
                    )
                )
            }
        }
    }

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0E1117))
    ) {
        // TOP APP BAR
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF151922))
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(if (swarmState.isRunning) Color(0xFFFFB86C) else Color(0xFF10B981))
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Agentic Swarm",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Row {
                IconButton(onClick = onNavigateToTools) {
                    Icon(Icons.Default.Build, contentDescription = "Toolbox", tint = Color(0xFF94A3B8))
                }
                IconButton(onClick = onNavigateToSettings) {
                    Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color(0xFF94A3B8))
                }
            }
        }

        // CHAT MESSAGES
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (messages.isEmpty()) {
                item {
                    WelcomeCard(
                        onSelectPrompt = { prompt ->
                            inputText = prompt
                        }
                    )
                }
            }

            items(messages) { msg ->
                MessageBubble(message = msg)
            }

            // Live streaming execution trace
            if (swarmState.isRunning) {
                item {
                    LiveExecutionCard(
                        activeAgent = swarmState.activeAgent,
                        thought = swarmState.liveThought,
                        plan = swarmState.executionPlan
                    )
                }
            }
        }

        // INPUT BAR
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF151922))
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = { Text("Prompt swarm or request tool synthesis...", color = Color(0xFF64748B), fontSize = 13.5.sp) },
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp)),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF3B82F6),
                    unfocusedBorderColor = Color(0xFF2B3345),
                    focusedContainerColor = Color(0xFF0E1117),
                    unfocusedContainerColor = Color(0xFF0E1117),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                maxLines = 3
            )

            Spacer(modifier = Modifier.width(8.dp))

            IconButton(
                onClick = {
                    if (inputText.isNotBlank() && !swarmState.isRunning) {
                        val userText = inputText.trim()
                        messages.add(
                            UIMessage(
                                id = "user_${System.currentTimeMillis()}",
                                sender = "You",
                                text = userText,
                                isUser = true
                            )
                        )
                        swarmManager.submitDirective(userText)
                        inputText = ""
                    }
                },
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF2563EB))
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = Color.White, modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
fun MessageBubble(message: UIMessage) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start
    ) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (message.isUser) Color(0xFF2563EB) else Color(0xFF1C2230)
            ),
            modifier = Modifier.fillMaxWidth(0.9f)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                if (!message.isUser) {
                    Text(
                        text = message.sender,
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFFA78BFA),
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                }

                Text(
                    text = message.text,
                    fontSize = 14.sp,
                    lineHeight = 20.sp,
                    color = Color.White
                )

                // Render execution steps traces if present
                if (message.steps.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    ExecutionPlanTrace(steps = message.steps)
                }
            }
        }
    }
}

@Composable
fun LiveExecutionCard(
    activeAgent: AgentRole?,
    thought: String,
    plan: List<StepExecution>
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF131722)),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF3B82F6).copy(alpha = 0.4f), RoundedCornerShape(14.dp))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    color = Color(0xFF38BDF8),
                    strokeWidth = 2.dp
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "${activeAgent?.name ?: "SWARM"} ACTIVE",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF38BDF8),
                    fontFamily = FontFamily.Monospace
                )
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = thought,
                fontSize = 12.5.sp,
                color = Color(0xFFE2E8F0)
            )

            if (plan.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                ExecutionPlanTrace(steps = plan)
            }
        }
    }
}

@Composable
fun ExecutionPlanTrace(steps: List<StepExecution>) {
    var expanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFF090B0E))
            .padding(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { expanded = !expanded },
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "⚡ Execution Plan (${steps.count { it.status == StepStatus.SUCCESS }}/${steps.size} steps)",
                fontSize = 11.5.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF94A3B8),
                fontFamily = FontFamily.Monospace
            )
            Icon(
                if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                contentDescription = null,
                tint = Color(0xFF94A3B8),
                modifier = Modifier.size(16.dp)
            )
        }

        AnimatedVisibility(visible = expanded) {
            Column(modifier = Modifier.padding(top = 8.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                steps.forEach { step ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val icon = when (step.status) {
                            StepStatus.SUCCESS -> Icons.Default.CheckCircle
                            StepStatus.FAILED -> Icons.Default.Error
                            StepStatus.RUNNING -> Icons.Default.PlayArrow
                            else -> Icons.Default.PlayArrow
                        }
                        val tint = when (step.status) {
                            StepStatus.SUCCESS -> Color(0xFF10B981)
                            StepStatus.FAILED -> Color(0xFFEF4444)
                            StepStatus.RUNNING -> Color(0xFF38BDF8)
                            else -> Color(0xFF64748B)
                        }
                        Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "[${step.agentRole}] ${step.description}",
                            fontSize = 11.sp,
                            color = Color(0xFFCBD5E1),
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun WelcomeCard(onSelectPrompt: (String) -> Unit) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1C2230)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("✦ Agentic Autonomous Swarm", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                "Direct peer architect with on-demand code synthesis & Android device automation.",
                fontSize = 13.sp,
                color = Color(0xFF94A3B8)
            )
            Spacer(modifier = Modifier.height(12.dp))

            val examples = listOf(
                "Synthesize a tip & split calculator widget with currency selector",
                "Synthesize a high-res wallpaper gradient generator canvas",
                "Inspect running packages and memory usage via Shizuku shell",
                "Build a live countdown timer with audio chime"
            )

            examples.forEach { ex ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 3.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFF0F141E))
                        .clickable { onSelectPrompt(ex) }
                        .padding(8.dp)
                ) {
                    Text("⚡ $ex", fontSize = 12.sp, color = Color(0xFFE2E8F0))
                }
            }
        }
    }
}
