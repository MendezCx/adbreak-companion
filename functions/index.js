const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Log ad events from SDK
exports.logAdEvent = onRequest({
  cors: true
}, async (req, res) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const event = req.body;
    event.serverTimestamp = admin.firestore.FieldValue.serverTimestamp();
    await db.collection("adEvents").add(event);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process new ad events
exports.processAdEvent = onDocumentCreated("adEvents/{eventId}", async (event) => {
  const data = event.data.data();
  console.log("New ad event:", data);
});
