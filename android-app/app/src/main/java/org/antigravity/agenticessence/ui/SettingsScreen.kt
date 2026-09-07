package org.antigravity.agenticessence.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.antigravity.agenticessence.core.automation.DeviceAutomationBridge
import org.antigravity.agenticessence.core.provider.ModelProviderType
import org.antigravity.agenticessence.core.provider.UniversalModelClient

@Composable
fun SettingsScreen(
    modelClient: UniversalModelClient,
    automationBridge: DeviceAutomationBridge,
    onNavigateBack: () -> Unit
) {
    var selectedProvider by remember { mutableStateOf(modelClient.providerType) }
    var apiKey by remember { mutableStateOf(modelClient.apiKey) }
    var customEndpoint by remember { mutableStateOf(modelClient.customEndpoint) }
    var modelName by remember { mutableStateOf(modelClient.modelName) }

    val metrics = remember { automationBridge.getDeviceMetrics() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0E1117))
    ) {
        // HEADER
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF151922))
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "⚙️ Settings & Engine Config",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // DEVICE TELEMETRY CARD
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF161C26)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("📱 Device Automation Telemetry", fontSize = 13.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFF38BDF8))
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("• Battery: ${metrics.batteryPercent}% (${if (metrics.isCharging) "Charging ⚡" else "On battery 🔋"})", fontSize = 12.sp, color = Color(0xFFCBD5E1))
                    Text("• Free Storage: ${String.format("%.2f", metrics.freeStorageGb)} GB", fontSize = 12.sp, color = Color(0xFFCBD5E1))
                    Text("• Network: ${if (metrics.isNetworkConnected) "Connected (Internet Online)" else "Offline"}", fontSize = 12.sp, color = Color(0xFFCBD5E1))
                    Text("• Shizuku ADB Bridge: ${if (metrics.isShizukuAvailable) "ACTIVE (Privileged ADB Shells Enabled)" else "Standard Sandboxed Shell"}", fontSize = 12.sp, color = if (metrics.isShizukuAvailable) Color(0xFF10B981) else Color(0xFFFFB86C))
                }
            }

            // MODEL PROVIDER CONFIG
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF161C26)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("⚡ BYOK AI Model Connector", fontSize = 13.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))

                    OutlinedTextField(
                        value = apiKey,
                        onValueChange = { apiKey = it },
                        label = { Text("API Key (OpenRouter / OpenAI)", color = Color(0xFF94A3B8)) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF3B82F6),
                            unfocusedBorderColor = Color(0xFF2B3345),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    OutlinedTextField(
                        value = customEndpoint,
                        onValueChange = { customEndpoint = it },
                        label = { Text("Local Ollama / Custom Endpoint URL", color = Color(0xFF94A3B8)) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF3B82F6),
                            unfocusedBorderColor = Color(0xFF2B3345),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    OutlinedTextField(
                        value = modelName,
                        onValueChange = { modelName = it },
                        label = { Text("Model Name (e.g. openai, mistral, llama3)", color = Color(0xFF94A3B8)) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF3B82F6),
                            unfocusedBorderColor = Color(0xFF2B3345),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    Button(
                        onClick = {
                            modelClient.apiKey = apiKey
                            modelClient.customEndpoint = customEndpoint
                            modelClient.modelName = modelName
                            modelClient.providerType = if (apiKey.isNotEmpty()) ModelProviderType.OPENROUTER else ModelProviderType.POLLINATIONS_FREE
                            onNavigateBack()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
                    ) {
                        Text("Save & Apply Config", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
