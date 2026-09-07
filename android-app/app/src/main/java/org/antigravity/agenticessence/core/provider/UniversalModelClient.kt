package org.antigravity.agenticessence.core.provider

import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

enum class ModelProviderType {
    POLLINATIONS_FREE,
    OPENROUTER,
    OPENAI,
    OLLAMA_LOCAL,
    CUSTOM_OPENAI_COMPATIBLE
}

@Serializable
data class ChatMessagePayload(
    val role: String,
    val content: String
)

@Serializable
data class OpenAiChatRequest(
    val model: String,
    val messages: List<ChatMessagePayload>,
    val temperature: Double = 0.7
)

/**
 * Universal BYOK Provider Client.
 * Connects seamlessly to OpenRouter, OpenAI, Local Ollama, and Free Anonymous APIs.
 */
class UniversalModelClient(
    var providerType: ModelProviderType = ModelProviderType.POLLINATIONS_FREE,
    var apiKey: String = "",
    var customEndpoint: String = "http://localhost:11434/v1",
    var modelName: String = "openai"
) {
    private val jsonParser = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    private val httpClient = HttpClient(OkHttp) {
        install(ContentNegotiation) {
            json(jsonParser)
        }
    }

    suspend fun generateResponse(systemPrompt: String, userPrompt: String): String = withContext(Dispatchers.IO) {
        val messages = listOf(
            ChatMessagePayload("system", systemPrompt),
            ChatMessagePayload("user", userPrompt)
        )
        return@withContext sendChatCompletion(messages)
    }

    suspend fun sendChatCompletion(messages: List<ChatMessagePayload>): String = withContext(Dispatchers.IO) {
        try {
            when (providerType) {
                ModelProviderType.POLLINATIONS_FREE -> {
                    val conversationText = messages.joinToString("\n\n") { "${it.role.uppercase()}: ${it.content}" }
                    val encoded = java.net.URLEncoder.encode(conversationText, "UTF-8")
                    val response = httpClient.post("https://text.pollinations.ai/$encoded?seed=${System.currentTimeMillis()}")
                    response.bodyAsText()
                }

                ModelProviderType.OPENROUTER -> {
                    val requestBody = OpenAiChatRequest(
                        model = modelName.ifEmpty { "openai/gpt-4o-mini" },
                        messages = messages
                    )
                    val response = httpClient.post("https://openrouter.ai/api/v1/chat/completions") {
                        contentType(ContentType.Application.Json)
                        header("Authorization", "Bearer $apiKey")
                        setBody(requestBody)
                    }
                    parseOpenAiChoice(response.bodyAsText())
                }

                ModelProviderType.OPENAI -> {
                    val requestBody = OpenAiChatRequest(
                        model = modelName.ifEmpty { "gpt-4o-mini" },
                        messages = messages
                    )
                    val response = httpClient.post("https://api.openai.com/v1/chat/completions") {
                        contentType(ContentType.Application.Json)
                        header("Authorization", "Bearer $apiKey")
                        setBody(requestBody)
                    }
                    parseOpenAiChoice(response.bodyAsText())
                }

                ModelProviderType.OLLAMA_LOCAL, ModelProviderType.CUSTOM_OPENAI_COMPATIBLE -> {
                    val endpoint = customEndpoint.trimEnd('/') + "/chat/completions"
                    val requestBody = OpenAiChatRequest(
                        model = modelName.ifEmpty { "llama3" },
                        messages = messages
                    )
                    val response = httpClient.post(endpoint) {
                        contentType(ContentType.Application.Json)
                        if (apiKey.isNotEmpty()) {
                            header("Authorization", "Bearer $apiKey")
                        }
                        setBody(requestBody)
                    }
                    parseOpenAiChoice(response.bodyAsText())
                }
            }
        } catch (e: Exception) {
            "ERR: Failed to connect to $providerType (${e.message}). Check network or BYOK credentials in Settings."
        }
    }

    private fun parseOpenAiChoice(responseBody: String): String {
        return try {
            val json = jsonParser.decodeFromString<JsonObject>(responseBody)
            val choices = json["choices"]?.jsonArray
            val firstChoice = choices?.firstOrNull()?.jsonObject
            val message = firstChoice?.get("message")?.jsonObject
            message?.get("content")?.jsonPrimitive?.content ?: responseBody
        } catch (e: Exception) {
            responseBody
        }
    }
}
