const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    seasonPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "SeasonPlan", required: true },
    type: { type: String, required: true }, // irrigation | fertilizer | scouting | treatment | weeding
    title: { type: String, required: true },
    detail: { type: String },
    scheduledDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "in_progress", "done", "skipped", "replaced"], default: "pending" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    isNewTask: { type: Boolean, default: false }, // flags tasks just added by a replan, for the UI
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);