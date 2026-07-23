const express = require("express");
const router = express.Router();
const SeasonPlan = require("../db/models/SeasonPlan");
const Task = require("../db/models/Task");
const Notification = require("../db/models/Notification");

// POST /api/update-plan
// body: { seasonPlanId, reason: "disease_detected" | "weather_event" | ..., diseaseResult? }
router.post("/", async (req, res) => {
  try {
    const { seasonPlanId, reason, diseaseResult } = req.body;

    if (!seasonPlanId || !reason) {
      return res.status(400).json({ error: "Missing seasonPlanId or reason" });
    }

    const seasonPlan = await SeasonPlan.findById(seasonPlanId);
    if (!seasonPlan) return res.status(404).json({ error: "Season plan not found" });

    let newTask = null;
    let notificationMessage = "";

    // This is the "scoped replan" — only insert/modify the task(s) relevant
    // to the trigger, leave everything else untouched.
    if (reason === "disease_detected") {
      newTask = await Task.create({
        seasonPlanId,
        type: "treatment",
        title: `Apply fungicide — ${diseaseResult?.label ?? "disease"} treatment`,
        detail: diseaseResult?.impact ?? "Treatment recommended based on image analysis.",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        priority: "high",
        isNewTask: true,
      });

      seasonPlan.reasoningLog.push(
        {
          agentType: "disease",
          decisionSummary: `Image classified as ${diseaseResult?.label ?? "disease"}, confidence ${diseaseResult?.confidence ?? "n/a"}%.`,
        },
        {
          agentType: "coordinator",
          decisionSummary: "Scoped the change to the disease-response subgoal. Inserted a treatment task, left irrigation and fertilizer tasks untouched.",
        }
      );

      notificationMessage = `${diseaseResult?.label ?? "A disease"} was detected, so a treatment task was added. Nothing else in your plan changed.`;
    } else {
      seasonPlan.reasoningLog.push({
        agentType: "coordinator",
        decisionSummary: `Replan triggered by ${reason}, no task changes applied yet (handler not implemented for this trigger).`,
      });
      notificationMessage = `Your plan was reviewed after a ${reason} event.`;
    }

    seasonPlan.version += 1;
    await seasonPlan.save();

    await Notification.create({
      seasonPlanId,
      message: notificationMessage,
      severity: reason === "disease_detected" ? "warning" : "info",
    });

    res.json({ seasonPlanId, version: seasonPlan.version, newTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update plan" });
  }
});

module.exports = router;