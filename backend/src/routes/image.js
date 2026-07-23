const express = require("express");
const multer = require("multer");
const router = express.Router();
const { analyzeImage } = require("../agents/diseaseAgent");

// Store uploads in memory for now — swap for disk/S3 storage later.
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/image  (multipart/form-data: image, cropId)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // req.file.buffer holds the raw image bytes if you wire in a real
    // vision model later (e.g. send req.file.buffer to a classification API).
    const result = analyzeImage({ crop: "wheat" });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

module.exports = router;