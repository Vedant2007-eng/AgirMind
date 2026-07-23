const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    seasonPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "SeasonPlan", required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ["info", "warning", "critical"], default: "info" },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);