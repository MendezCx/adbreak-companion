# AdBreak Companion SDK — Android Integration Guide

Track, analyze, and fix ad break UX problems in your mobile game.

---

## 📦 Installation

### Step 1: Copy the SDK files into your project

Copy the `adbreak-companion-sdk` folder into your Android project root.

### Step 2: Add to your `settings.gradle`

```gradle
include ':app', ':adbreak-companion-sdk'
```

### Step 3: Add dependency in your app's `build.gradle`

```gradle
dependencies {
    implementation project(':adbreak-companion-sdk')
}
```

### Step 4: Add internet permission to `AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

---

## 🚀 Quick Start

### Initialize once (in your `Application` class or `MainActivity`)

```kotlin
import com.adbreak.companion.AdBreakCompanion

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        AdBreakCompanion.init(this, "com.mygame.app")
    }
}
```

### Log ad events

```kotlin
import com.adbreak.companion.AdEvent

// Ad started showing
AdBreakCompanion.logAdEvent(AdEvent.started("admob", "interstitial"))

// Ad completed
AdBreakCompanion.logAdEvent(AdEvent.completed("admob", "interstitial"))

// Ad skipped
AdBreakCompanion.logAdEvent(AdEvent.skipped("admob", "interstitial"))

// Ad failed
AdBreakCompanion.logAdEvent(AdEvent.failed("admob", "interstitial", "No fill"))

// Ad clicked
AdBreakCompanion.logAdEvent(AdEvent.clicked("admob", "interstitial"))
```

---

## 🔌 Network Adapters (Recommended)

Use our pre-built adapters for cleaner integration.

### AdMob

```kotlin
import com.adbreak.companion.adapters.AdMobAdapter

val tracker = AdMobAdapter("interstitial") // or "rewarded", "banner"

// Wire up in your AdMob FullScreenContentCallback:
object : FullScreenContentCallback() {
    override fun onAdShowedFullScreenContent() { tracker.onAdStarted() }
    override fun onAdDismissedFullScreenContent() { tracker.onAdDismissed() }
    override fun onAdFailedToShowFullScreenContent(error: AdError) {
        tracker.onAdFailed(error.message)
    }
    override fun onAdClicked() { tracker.onAdClicked() }
}
```

### Unity Ads

```kotlin
import com.adbreak.companion.adapters.UnityAdsAdapter

val tracker = UnityAdsAdapter("interstitial")

object : IUnityAdsShowListener {
    override fun onUnityAdsShowStart(placementId: String) { tracker.onAdStarted() }
    override fun onUnityAdsShowComplete(placementId: String, state: UnityAds.UnityAdsShowCompletionState) {
        if (state == UnityAds.UnityAdsShowCompletionState.COMPLETED) tracker.onAdCompleted()
        else tracker.onAdSkipped()
    }
    override fun onUnityAdsShowFailure(placementId: String, error: UnityAdsShowError, message: String) {
        tracker.onAdFailed(message)
    }
    override fun onUnityAdsShowClick(placementId: String) { tracker.onAdClicked() }
}
```

### IronSource

```kotlin
import com.adbreak.companion.adapters.IronSourceAdapter

val tracker = IronSourceAdapter("interstitial")

IronSource.setInterstitialListener(object : InterstitialAdListener {
    override fun onInterstitialAdShowSucceeded() { tracker.onAdStarted() }
    override fun onInterstitialAdClosed() { tracker.onAdDismissed() }
    override fun onInterstitialAdShowFailed(error: IronSourceError) {
        tracker.onAdFailed(error.errorMessage)
    }
    override fun onInterstitialAdClicked() { tracker.onAdClicked() }
})
```

### AppLovin MAX

```kotlin
import com.adbreak.companion.adapters.AppLovinAdapter

val tracker = AppLovinAdapter("interstitial")

interstitialAd.setListener(object : MaxAdListener {
    override fun onAdLoaded(ad: MaxAd) { tracker.onAdLoaded() }
    override fun onAdDisplayed(ad: MaxAd) { tracker.onAdStarted() }
    override fun onAdHidden(ad: MaxAd) { tracker.onAdDismissed() }
    override fun onAdDisplayFailed(ad: MaxAd, error: MaxError) {
        tracker.onAdFailed(error.message)
    }
    override fun onAdClicked(ad: MaxAd) { tracker.onAdClicked() }
})
```

---

## 📊 View Your Data

All events appear in real-time on your dashboard:
**https://adbreak-companion.vercel.app**

---

## 📁 File Structure

```
adbreak-companion-sdk/
├── build.gradle
└── src/main/java/com/adbreak/companion/
    ├── AdBreakCompanion.kt       ← Main SDK (init & logAdEvent)
    ├── AdEvent.kt                ← Event model
    ├── BuildConfig.kt            ← SDK version
    └── adapters/
        ├── AdMobAdapter.kt       ← AdMob integration
        ├── UnityAdsAdapter.kt    ← Unity Ads integration
        ├── IronSourceAdapter.kt  ← IronSource integration
        └── AppLovinAdapter.kt    ← AppLovin MAX integration
```

---

## 📡 How It Works

1. Your game calls `logAdEvent()`
2. SDK sends event to **Cloud Function** (primary)
3. If that fails → falls back to **Firestore directly**
4. Event appears on your **AdBreak dashboard** in real-time

---

## 🆘 Support

Dashboard: https://adbreak-companion.vercel.app  
GitHub: https://github.com/MendezCx/adbreak-companion
