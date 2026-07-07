package com.angeticessence.agent

import android.app.AlertDialog
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import org.json.JSONArray
import com.angeticessence.agent.databinding.ActivityMainBinding

/**
 * Angetic Essence Mobile — main control surface.
 * Type a task in plain English; the agent looks at the screen (Accessibility),
 * asks the AI backend what to do next, and acts on it (Shizuku). Repeats until done.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var isRunning = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        ShizukuManager.init()
        ShizukuManager.onPermissionResult = { granted ->
            runOnUiThread {
                binding.statusText.text = if (granted) "Shizuku: connected ✓" else "Shizuku: permission denied"
            }
        }

        binding.grantShizukuBtn.setOnClickListener {
            if (!ShizukuManager.isAvailable()) {
                AlertDialog.Builder(this)
                    .setTitle("Shizuku not running")
                    .setMessage("Install the Shizuku app and start it via Wireless debugging (Settings > Developer options), then come back here.")
                    .setPositiveButton("Got it", null)
                    .show()
            } else if (ShizukuManager.hasPermission()) {
                binding.statusText.text = "Shizuku: already connected ✓"
            } else {
                ShizukuManager.requestPermission()
            }
        }

        binding.openAccessibilityBtn.setOnClickListener {
            startActivity(android.content.Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS))
        }

        binding.runTaskBtn.setOnClickListener {
            val task = binding.taskInput.text.toString().trim()
            if (task.isEmpty()) return@setOnClickListener
            if (!ShizukuManager.hasPermission()) {
                binding.logText.append("\n⚠️ Grant Shizuku permission first.")
                return@setOnClickListener
            }
            if (AgentAccessibilityService.instance == null) {
                binding.logText.append("\n⚠️ Enable the Accessibility Service first.")
                return@setOnClickListener
            }
            runTaskLoop(task)
        }
    }

    private fun runTaskLoop(task: String) {
        if (isRunning) return
        isRunning = true
        binding.logText.text = "Starting task: $task"
        val history = JSONArray()

        lifecycleScope.launch {
            var steps = 0
            while (isRunning && steps < 25) {
                steps++
                val screen = AgentAccessibilityService.instance?.dumpScreen() ?: JSONArray()
                val step = AiOrchestrator.nextStep(task, screen, history)

                runOnUiThread {
                    binding.logText.append("\n[$steps] ${step.type} — ${step.reasoning}")
                }

                if (step.type == "done" || step.type == "error") {
                    isRunning = false
                    runOnUiThread { binding.logText.append("\n✅ ${step.type}: ${step.reasoning}") }
                    break
                }

                val result = AiOrchestrator.execute(step)
                history.put("${step.type} -> $result")
            }
            isRunning = false
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
    }
}
