package com.adbreak.companion.adapters

import com.adbreak.companion.AdBreakCompanion
import com.adbreak.companion.AdEvent

/**
 * AdMob Adapter for AdBreak Companion SDK
 *
 * Use this to automatically log AdMob ad events.
 *
 * USAGE with AdMob Interstitial:
 *
 *   val tracker = AdMobAdapter("interstitial")
 *
 *   // In your AdMob FullScreenContentCallback:
 *   override fun onAdShowedFullScreenContent() { tracker.onAdStarted() }
 *   override fun onAdDismissedFullScreenContent() { tracker.onAdDismissed() }
 *   override fun onAdFailedToShowFullScreenContent(error: AdError) { tracker.onAdFailed(error.message) }
 *   override fun onAdClicked() { tracker.onAdClicked() }
 */
class AdMobAdapter(private val format: String = AdEvent.FORMAT_INTERSTITIAL) {

    private var adStartTime: Long = 0L

    fun onAdLoaded() {
        AdBreakCompanion.logAdEvent(AdEvent.loaded(AdEvent.NETWORK_ADMOB, format))
    }

    fun onAdStarted() {
        adStartTime = System.currentTimeMillis()
        AdBreakCompanion.logAdEvent(AdEvent.started(AdEvent.NETWORK_ADMOB, format))
    }

    fun onAdDismissed() {
        val duration = if (adStartTime > 0) System.currentTimeMillis() - adStartTime else 0L
        // If dismissed quickly it's a skip, otherwise completed
        if (duration < 5000 && format == AdEvent.FORMAT_INTERSTITIAL) {
            AdBreakCompanion.logAdEvent(AdEvent.skipped(AdEvent.NETWORK_ADMOB, format, duration))
        } else {
            AdBreakCompanion.logAdEvent(AdEvent.completed(AdEvent.NETWORK_ADMOB, format, duration))
        }
        adStartTime = 0L
    }

    fun onAdFailed(errorMessage: String = "") {
        AdBreakCompanion.logAdEvent(AdEvent.failed(AdEvent.NETWORK_ADMOB, format, errorMessage))
    }

    fun onAdClicked() {
        AdBreakCompanion.logAdEvent(AdEvent.clicked(AdEvent.NETWORK_ADMOB, format))
    }
}
