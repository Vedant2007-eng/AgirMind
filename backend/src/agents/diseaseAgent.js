// Disease Agent (v0 — mock classifier).
// Returns a plausible result so the full replan loop can be demoed end-to-end
// before a real vision model is wired in. Swap analyzeImage() for a real
// vision API call later — the return shape is what UploadImage.jsx expects.

function analyzeImage({ crop = "wheat", field = "Field 1 (North)" } = {}) {
  return {
    label: "Leaf Rust Detected",
    confidence: 87,
    severity: "Moderate Risk",
    impact: "This disease can reduce yield if not treated on time.",
    detectedOn: new Date().toISOString().slice(0, 10),
    crop,
    field,
    description:
      "Leaf rust is a fungal disease that affects wheat leaves. It appears as orange or brown pustules on the leaf surface and can reduce photosynthesis and grain yield.",
    symptoms: [
      "Orange to brown pustules on leaves",
      "Yellowing of leaves",
      "Premature leaf drying",
    ],
  };
}

module.exports = { analyzeImage };