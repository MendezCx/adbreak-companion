package com.adbreak.companion

/**
 * Represents a single ad lifecycle event.
 *
 * Use the factory methods instead of constructing directly:
 *
 *   AdEvent.started("admob", "interstitial")
 *   AdEvent.completed("admob", "rewarded")
 *   AdEvent.skipped("unity", "interstitial")
 *   AdEvent.failed("ironsource", "banner", "No fill")
 */
data class AdEvent(
    val type: String,           // "started" | "completed" | "skipped" | "failed" | "clicked"
    val network: String,        // "admob" | "unity" | "ironsource" | "applovin"
    val format: String,         // "interstitial" | "rewarded" | "banner" | "native"
    val errorMessage: String? = null,
    val durationMs: Long = 0L
) {
    companion object {

        // ── Ad Networks ──────────────────────────────────────────────────────────
        const val NETWORK_ADMOB      = "admob"
        const val NETWORK_UNITY      = "unity"
        const val NETWORK_IRONSOURCE = "ironsource"
        const val NETWORK_APPLOVIN   = "applovin"

        // ── Ad Formats ───────────────────────────────────────────────────────────
        const val FORMAT_INTERSTITIAL = "interstitial"
        const val FORMAT_REWARDED     = "rewarded"
        const val FORMAT_BANNER       = "banner"
        const val FORMAT_NATIVE       = "native"

        // ── Event Types ──────────────────────────────────────────────────────────

        /** Call when an ad starts showing to the user */
        fun started(network: String, format: String) =
            AdEvent(type = "started", network = network, format = format)

        /** Call when an ad finishes playing completely */
        fun completed(network: String, format: String, durationMs: Long = 0L) =
            AdEvent(type = "completed", network = network, format = format, durationMs = durationMs)

        /** Call when the user skips/closes an ad early */
        fun skipped(network: String, format: String, durationMs: Long = 0L) =
            AdEvent(type = "skipped", network = network, format = format, durationMs = durationMs)

        /** Call when an ad fails to load or show */
        fun failed(network: String, format: String, errorMessage: String = "") =
            AdEvent(type = "failed", network = network, format = format, errorMessage = errorMessage)

        /** Call when the user taps/clicks an ad */
        fun clicked(network: String, format: String) =
            AdEvent(type = "clicked", network = network, format = format)

        /** Call when an ad is loaded and ready to show (not yet shown) */
        fun loaded(network: String, format: String) =
            AdEvent(type = "loaded", network = network, format = format)
    }
}
