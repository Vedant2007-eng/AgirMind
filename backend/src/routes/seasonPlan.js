const express = require("express");
const router = express.Router();
const SeasonPlan = require("../db/models/SeasonPlan");
const Task = require("../db/models/Task");

// GET /api/season-plan?seasonPlanId=... OR ?farmId=...
router.get("/", async (req, res) => {
  try {
    const { seasonPlanId, farmId } = req.query;

    let seasonPlan;
    if (seasonPlanId) {
      seasonPlan = await SeasonPlan.findById(seasonPlanId);
    } else if (farmId) {
      seasonPlan = await SeasonPlan.findOne({ farmId, status: "active" }).sort({ createdAt: -1 });
    } else {
      return res.status(400).json({ error: "Provide seasonPlanId or farmId" });
    }

    if (!seasonPlan) return res.status(404).json({ error: "Season plan not found" });

    const tasks = await Task.find({ seasonPlanId: seasonPlan._id }).sort({ scheduledDate: 1 });

    res.json({ seasonPlan, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch season plan" });
  }
});

module.exports = router;