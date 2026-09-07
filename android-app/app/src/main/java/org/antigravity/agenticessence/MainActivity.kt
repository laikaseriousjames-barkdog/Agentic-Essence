package org.antigravity.agenticessence

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.room.Room
import org.antigravity.agenticessence.core.automation.DeviceAutomationBridge
import org.antigravity.agenticessence.core.automation.SwarmForegroundService
import org.antigravity.agenticessence.core.provider.UniversalModelClient
import org.antigravity.agenticessence.core.synthesis.DynamicToolEngine
import org.antigravity.agenticessence.core.synthesis.ToolDatabase
import org.antigravity.agenticessence.core.swarm.SwarmManager
import org.antigravity.agenticessence.ui.ChatScreen
import org.antigravity.agenticessence.ui.SettingsScreen
import org.antigravity.agenticessence.ui.ToolRegistryScreen

class MainActivity : ComponentActivity() {

    private lateinit var toolDatabase: ToolDatabase
    private lateinit var automationBridge: DeviceAutomationBridge
    private lateinit var dynamicToolEngine: DynamicToolEngine
    private lateinit var modelClient: UniversalModelClient
    private lateinit var swarmManager: SwarmManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize SQLite Room Database
        toolDatabase = Room.databaseBuilder(
            applicationContext,
            ToolDatabase::class.java,
            "agentic_tools.db"
        ).build()

        // Initialize Core Automation & Synthesis Engines
        automationBridge = DeviceAutomationBridge(applicationContext)
        dynamicToolEngine = DynamicToolEngine(automationBridge)
        modelClient = UniversalModelClient()
        swarmManager = SwarmManager(
            modelClient = modelClient,
            dynamicToolEngine = dynamicToolEngine,
            toolRegistryDao = toolDatabase.toolRegistryDao(),
            deviceAutomationBridge = automationBridge
        )

        // Start Foreground Service to keep swarm alive
        SwarmForegroundService.start(this)

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = Color(0xFF2563EB),
                    secondary = Color(0xFF38BDF8),
                    background = Color(0xFF0E1117),
                    surface = Color(0xFF151922),
                    onPrimary = Color.White,
                    onBackground = Color.White,
                    onSurface = Color.White
                )
            ) {
                AppNavigation(
                    swarmManager = swarmManager,
                    toolDatabase = toolDatabase,
                    dynamicToolEngine = dynamicToolEngine,
                    modelClient = modelClient,
                    automationBridge = automationBridge
                )
            }
        }
    }
}

@Composable
fun AppNavigation(
    swarmManager: SwarmManager,
    toolDatabase: ToolDatabase,
    dynamicToolEngine: DynamicToolEngine,
    modelClient: UniversalModelClient,
    automationBridge: DeviceAutomationBridge
) {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "chat") {
        composable("chat") {
            ChatScreen(
                swarmManager = swarmManager,
                onNavigateToTools = { navController.navigate("tools") },
                onNavigateToSettings = { navController.navigate("settings") }
            )
        }
        composable("tools") {
            ToolRegistryScreen(
                toolRegistryDao = toolDatabase.toolRegistryDao(),
                dynamicToolEngine = dynamicToolEngine,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable("settings") {
            SettingsScreen(
                modelClient = modelClient,
                automationBridge = automationBridge,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
