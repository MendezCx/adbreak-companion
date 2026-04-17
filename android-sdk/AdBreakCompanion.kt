package com.adbreak.companion

import android.content.Context
import android.util.Log
import kotlinx.coroutines.*
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

/**
 * AdBreak Companion SDK
 *
 * Detects, logs, and helps fix ad break UX problems in mobile games.
 *
 * QUICK START:
 * 1. Initialize once in your Application class or MainActivity:
 *      AdBreakCompanion.init(context, "YOUR_GAME_ID")
 *
 * 2. Log an ad event anywhere in your game:
 *      AdBreakCompanion.logAdEvent(AdEvent.started("admob", "interstitial"))
 *      AdBreakCompanion.logAdEvent(AdEvent.completed("admob", "interstitial"))
 *      AdBreakCompanion.logAdEvent(AdEvent.skipped("admob", "interstitial"))
 *      AdBreakCompanion.logAdEvent(AdEvent.failed("admob", "interstitial", "No fill"))
 */
object AdBreakCompanion {

    private const val TAG = "AdBreakCompanion"

    // Your Cloud Function URL
    private const val PRIMARY_ENDPOINT =
        "https://us-central1-adbreak-companion-40eaa.cloudfunctions.net/logAdEvent"

    // Fallback: Firestore REST API
    private const val FALLBACK_ENDPOINT =
        "https://firestore.googleapis.com/v1/projects/adbreak-companion-40eaa/databases/(default)/documents/adEvents"

    private var gameId: String = "unknown"
    private var sessionId: String = UUID.randomUUID().toString()
    private var isInitialized: Boolean = false
    private var sdkScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    /**
     * Initialize the SDK. Call this once when your app starts.
     *
     * @param context   Your app's Context (e.g. applicationContext)
     * @param gameId    A unique ID for your game (e.g. "com.mygame.app")
     */
    fun init(context: Context, gameId: String) {
        this.gameId = gameId
        this.sessionId = UUID.randomUUID().toString()
        this.isInitialized = true
        Log.i(TAG, "AdBreak Companion initialized | game=$gameId | session=$sessionId")
    }

    /**
     * Log an ad event. This is the main method you'll call.
     *
     * @param event  An AdEvent object (use AdEvent.started/completed/skipped/failed)
     */
    fun logAdEvent(event: AdEvent) {
        if (!isInitialized) {
            Log.w(TAG, "SDK not initialized! Call AdBreakCompanion.init() first.")
            return
        }

        val payload = buildPayload(event)
        Log.d(TAG, "Logging ad event: ${event.type} | network=${event.network}")

        sdkScope.launch {
            val success = sendToCloudFunction(payload)
            if (!success) {
                Log.w(TAG, "Primary endpoint failed, trying Firestore fallback...")
                sendToFirestoreFallback(payload)
            }
        }
    }

    // ─── Private Helpers ────────────────────────────────────────────────────────

    private fun buildPayload(event: AdEvent): JSONObject {
        return JSONObject().apply {
            put("gameId", gameId)
            put("sessionId", sessionId)
            put("eventType", event.type)
            put("adNetwork", event.network)
            put("adFormat", event.format)
            put("errorMessage", event.errorMessage ?: "")
            put("durationMs", event.durationMs)
            put("timestamp", System.currentTimeMillis())
            put("sdkVersion", BuildConfig.SDK_VERSION)
        }
    }

    private fun sendToCloudFunction(payload: JSONObject): Boolean {
        return try {
            val url = URL(PRIMARY_ENDPOINT)
            val connection = url.openConnection() as HttpURLConnection
            connection.apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
                doOutput = true
                connectTimeout = 5000
                readTimeout = 5000
            }

            connection.outputStream.use { os ->
                os.write(payload.toString().toByteArray(Charsets.UTF_8))
            }

            val responseCode = connection.responseCode
            connection.disconnect()

            if (responseCode in 200..299) {
                Log.d(TAG, "✅ Event sent successfully (HTTP $responseCode)")
                true
            } else {
                Log.w(TAG, "⚠️ Server returned HTTP $responseCode")
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to send event: ${e.message}")
            false
        }
    }

    private fun sendToFirestoreFallback(payload: JSONObject): Boolean {
        return try {
            // Convert our payload to Firestore REST format
            val firestoreDoc = JSONObject().apply {
                put("fields", JSONObject().apply {
                    payload.keys().forEach { key ->
                        val value = payload.get(key)
                        put(key, when (value) {
                            is String -> JSONObject().put("stringValue", value)
                            is Int    -> JSONObject().put("integerValue", value.toString())
                            is Long   -> JSONObject().put("integerValue", value.toString())
                            is Double -> JSONObject().put("doubleValue", value)
                            is Boolean -> JSONObject().put("booleanValue", value)
                            else      -> JSONObject().put("stringValue", value.toString())
                        })
                    }
                })
            }

            val url = URL(FALLBACK_ENDPOINT)
            val connection = url.openConnection() as HttpURLConnection
            connection.apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
                connectTimeout = 5000
                readTimeout = 5000
            }

            connection.outputStream.use { os ->
                os.write(firestoreDoc.toString().toByteArray(Charsets.UTF_8))
            }

            val responseCode = connection.responseCode
            connection.disconnect()

            if (responseCode in 200..299) {
                Log.d(TAG, "✅ Fallback: Event saved to Firestore (HTTP $responseCode)")
                true
            } else {
                Log.w(TAG, "⚠️ Fallback failed with HTTP $responseCode")
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Fallback failed: ${e.message}")
            false
        }
    }
}
