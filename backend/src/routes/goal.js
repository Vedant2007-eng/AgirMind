const express = require("express");
const router = express.Router();
const Farm = require("../db/models/Farm");
const SeasonPlan = require("../db/models/SeasonPlan");
const Task = require("../db/models/Task");
const Notification = require("../db/models/Notification");
const { generateTasks } = require("../agents/planningAgent");

// POST /api/goal
router.post("/", async (req, res) => {
  try {
    const { farmId, crop, objective, goalText } = req.body;

    if (!farmId || !crop || !objective || !goalText) {
      return res.status(400).json({ error: "Missing required goal fields" });
    }

    const farm = await Farm.findById(farmId);
    if (!farm) return res.status(404).json({ error: "Farm not found" });

    const seasonPlan = await SeasonPlan.create({
      farmId,
      cropType: crop,
      objective,
      goalText,
      currentYieldEstimate: { value: 4.1, unit: "t/acre", confidence: 0.78 },
    });

    const { tasks, reasoning } = generateTasks({ crop, objective, goalText });

    const createdTasks = await Task.insertMany(
      tasks.map((t) => ({ ...t, seasonPlanId: seasonPlan._id }))
    );

    seasonPlan.reasoningLog.push(...reasoning);
    await seasonPlan.save();

    await Notification.create({
      seasonPlanId: seasonPlan._id,
      message: `Your ${crop} season plan is ready with ${createdTasks.length} tasks.`,
      severity: "info",
    });

    res.status(201).json({ seasonPlanId: seasonPlan._id, status: "ready" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create season plan" });
  }
});

module.exports = router;