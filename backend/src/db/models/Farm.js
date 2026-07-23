const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
  {
    location: { type: String, required: true },
    farmSize: { type: Number, required: true },
    soilType: { type: String, required: true },
    waterSource: { type: String, required: true },
    waterBudget: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farm", farmSchema);