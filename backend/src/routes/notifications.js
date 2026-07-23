const express = require("express");
const router = express.Router();
const Notification = require("../db/models/Notification");

// GET /api/notifications?seasonPlanId=...
router.get("/", async (req, res) => {
  try {
    const { seasonPlanId } = req.query;
    if (!seasonPlanId) return res.status(400).json({ error: "Provide seasonPlanId" });

    const notifications = await Notification.find({ seasonPlanId }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

module.exports = router;