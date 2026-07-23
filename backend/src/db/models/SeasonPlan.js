const mongoose = require("mongoose");

const reasoningEntrySchema = new mongoose.Schema(
  {
    agentType: { type: String, required: true },
    decisionSummary: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const seasonPlanSchema = new mongoose.Schema(
  {
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true },
    cropType: { type: String, required: true },
    objective: { type: String, required: true }, // maximize_yield | minimize_cost | balance
    goalText: { type: String, required: true },
    status: { type: String, enum: ["active", "completed", "abandoned"], default: "active" },
    version: { type: Number, default: 1 },
    currentRiskScore: { type: String, default: "Low" },
    currentYieldEstimate: {
      value: { type: Number, default: 0 },
      unit: { type: String, default: "t/acre" },
      confidence: { type: Number, default: 0 },
    },
    reasoningLog: [reasoningEntrySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeasonPlan", seasonPlanSchema);