const express = require("express");
const router = express.Router();
const { fetchWeather } = require("../agents/weatherAgent");

// GET /api/weather?location=Mandsaur,IN
router.get("/", async (req, res) => {
  try {
    const location = req.query.location || "Mandsaur,IN";
    const data = await fetchWeather({ location });
    res.json(data);
  } catch (err) {
    console.error("Weather fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch weather", detail: err.message });
  }
});

module.exports = router;