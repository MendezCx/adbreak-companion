const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// ── INGEST ────────────────────────────────────────────────────────────────
exports.ingest = functions
  .runWith({ memory: "256MB", timeoutSeconds: 30 })
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return res.status(204).send("");
    }
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const authHeader = req.headers.authorization || "";
    const apiKey = authHeader.replace("Bearer ", "").trim();
    if (!apiKey) {
      return res.status(401).json({ error: "Missing API key" });
    }
    const studioSnap = await db
      .collection("studios")
      .where("sdkApiKey", "==", apiKey)
      .limit(1)
      .get();
    if (studioSnap.empty) {
      return res.status(401).json({ error: "Invalid API key" });
    }
    const studioId = studioSnap.docs[0].id;
    let events;
    try {
      events = Array.isArray(req.body) ? req.body : JSON.parse(req.body);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: "Body must be a non-empty array" });
    }
    if (events.length > 100) {
      return res.status(400).json({ error: "Maximum 100 events per batch" });
    }
    const batch = db.batch();
    const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();
    let accepted = 0;
    for (const event of events) {
      if (!event.event_id || !event.event_type || !event.studio_id ||
          !event.game_id || !event.session_id || !event.break_id) continue;
      if (event.studio_id !== studioId) continue;
      const ref = db
        .collection("studios").doc(studioId)
        .collection("events").doc(event.event_id);
      batch.set(ref, { ...event, server_received_at: serverTimestamp, studio_id: studioId });
      accepted++;
    }
    await batch.commit();

    // Update realtime dashboard
    const rtdb = admin.database();
    const gameId = events[0]?.game_id;
    if (gameId) {
      const latestEvent = events[events.length - 1];
      await rtdb.ref(`live/${studioId}`).update({
        lastEventType: latestEvent.event_type,
        lastEventTime: Date.now(),
        breakActive: latestEvent.event_type === "ad_started",
        network: latestEvent.network || "unknown",
        format: latestEvent.ad_format || "rewarded",
        phase: getPhase(latestEvent.event_type),
      });
    }

    return res.status(200).json({ accepted_count: accepted });
  });

function getPhase(eventType) {
  switch (eventType) {
    case "ad_requested": return "loading";
    case "ad_loaded": return "loading";
    case "ad_started": return "playing";
    case "ad_phase_changed": return "playing";
    case "ad_completed": return "reward_pending";
    case "player_resumed": return "returning";
    default: return "idle";
  }
}

// ── AGGREGATE ─────────────────────────────────────────────────────────────
exports.aggregate = functions
  .runWith({ memory: "512MB", timeoutSeconds: 300 })
  .pubsub.schedule("every 5 minutes")
  .onRun(async () => {
    const studios = await db.collection("studios").get();
    for (const studioDoc of studios.docs) {
      const studioId = studioDoc.id;
      const eventsSnap = await db
        .collection("studios").doc(studioId)
        .collection("events")
        .where("event_type", "==", "ad_completed")
        .where("is_simulated", "==", false)
        .get();
      if (eventsSnap.empty) continue;
      const events = eventsSnap.docs.map(d => d.data());
      const gameIds = [...new Set(events.map(e => e.game_id))];
      for (const gameId of gameIds) {
        const gameEvents = events.filter(e => e.game_id === gameId);
        const totalBreaks = gameEvents.length;
        const completed = gameEvents.filter(e => e.result === "completed").length;
        const completionRate = totalBreaks > 0 ? Math.round((completed / totalBreaks) * 100) : 0;
        const resumeEvents = gameEvents.filter(e => e.resume_time_ms);
        const avgResumeMs = resumeEvents.length > 0
          ? Math.round(resumeEvents.reduce((sum, e) => sum + e.resume_time_ms, 0) / resumeEvents.length)
          : 0;
        const durationEvents = gameEvents.filter(e => e.duration_ms);
        const avgDurationMs = durationEvents.length > 0
          ? Math.round(durationEvents.reduce((sum, e) => sum + e.duration_ms, 0) / durationEvents.length)
          : 0;
        const networkCounts = {};
        gameEvents.forEach(e => {
          networkCounts[e.network] = (networkCounts[e.network] || 0) + 1;
        });
        const networkPcts = {};
        Object.entries(networkCounts).forEach(([net, count]) => {
          networkPcts[`${net}_pct`] = Math.round((count / totalBreaks) * 100);
        });
        await db
          .collection("studios").doc(studioId)
          .collection("metrics").doc(gameId)
          .set({
            completion_rate: completionRate,
            avg_resume_time_ms: avgResumeMs,
            avg_break_length_ms: avgDurationMs,
            total_breaks: totalBreaks,
            ...networkPcts,
            computed_at: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
      }
    }
    return null;
  });

// ── CHECK ALERTS ──────────────────────────────────────────────────────────
exports.checkAlerts = functions
  .firestore
  .document("studios/{studioId}/metrics/{gameId}")
  .onWrite(async (change, context) => {
    const { studioId, gameId } = context.params;
    const metrics = change.after.data();
    if (!metrics) return;
    const thresholds = {
      max_duration_ms: 45000,
      max_churn_rate: 3.0,
      max_resume_time_ms: 6000,
    };
    const alerts = [];
    if (metrics.avg_break_length_ms > thresholds.max_duration_ms) {
      alerts.push({
        type: "high_duration",
        message: `Avg break ${Math.round(metrics.avg_break_length_ms / 1000)}s — above ${Math.round(thresholds.max_duration_ms / 1000)}s threshold`,
        severity: "warn",
      });
    }
    if (metrics.avg_resume_time_ms > thresholds.max_resume_time_ms) {
      alerts.push({
        type: "slow_resume",
        message: `Slow resume ${(metrics.avg_resume_time_ms / 1000).toFixed(1)}s — above ${(thresholds.max_resume_time_ms / 1000).toFixed(1)}s target`,
        severity: "review",
      });
    }
    await db
      .collection("studios").doc(studioId)
      .collection("alerts").doc(gameId)
      .set({ alerts, updated_at: admin.firestore.FieldValue.serverTimestamp() });
  });

// ── SIM CONFIG ────────────────────────────────────────────────────────────
exports.simConfig = functions
  .runWith({ memory: "128MB", timeoutSeconds: 10 })
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "GET, POST, DELETE");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return res.status(204).send("");
    }
    const authHeader = req.headers.authorization || "";
    const apiKey = authHeader.replace("Bearer ", "").trim();
    if (!apiKey) return res.status(401).json({ error: "Missing API key" });
    const studioSnap = await db
      .collection("studios")
      .where("sdkApiKey", "==", apiKey)
      .limit(1)
      .get();
    if (studioSnap.empty) return res.status(401).json({ error: "Invalid API key" });
    const studioId = studioSnap.docs[0].id;
    const gameId = req.query.game_id;
    if (!gameId) return res.status(400).json({ error: "game_id required" });
    const configRef = db
      .collection("studios").doc(studioId)
      .collection("sim_configs").doc(gameId);
    if (req.method === "GET") {
      const snap = await configRef.get();
      if (!snap.exists) return res.status(204).send();
      return res.status(200).json(snap.data());
    }
    if (req.method === "POST") {
      await configRef.set({
        ...req.body,
        studio_id: studioId,
        game_id: gameId,
        is_active: true,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(200).json({ success: true });
    }
    if (req.method === "DELETE") {
      await configRef.delete();
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: "Method not allowed" });
  });
