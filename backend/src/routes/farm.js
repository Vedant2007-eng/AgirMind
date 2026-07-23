const express = require("express");
const router = express.Router();
const Farm = require("../db/models/Farm");

// POST /api/farm
router.post("/", async (req, res) => {
  try {
    const { location, farmSize, soilType, waterSource, waterBudget } = req.body;

    if (!location || !farmSize || !soilType || !waterSource || !waterBudget) {
      return res.status(400).json({ error: "Missing required farm fields" });
    }

    const farm = await Farm.create({ location, farmSize, soilType, waterSource, waterBudget });
    res.status(201).json({ farmId: farm._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create farm" });
  }
});

module.exports = router;