// Planning Agent (v0 — rule-based mock).
// Generates a starter set of tasks for a season plan based on crop + objective.
// Swap generateTasks() for a real Claude/GPT API call later without touching
// anything that calls this function — the interface (farm, crop, objective, goalText) -> tasks[] stays the same.

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function generateTasks({ crop, objective, goalText, startDate = new Date() }) {
  const tasks = [
    {
      type: "irrigation",
      title: "Irrigation — drip cycle, 2 hrs",
      detail: "Run drip irrigation for 2 hours",
      scheduledDate: addDays(startDate, 2),
      priority: "high",
    },
    {
      type: "fertilizer",
      title: "Fertilizer — urea top-dressing",
      detail: "Apply urea @ 45 kg/acre",
      scheduledDate: addDays(startDate, 5),
      priority: "medium",
    },
    {
      type: "scouting",
      title: "Field scouting — check for rust",
      detail: `Inspect ${crop} leaves for any disease`,
      scheduledDate: addDays(startDate, 9),
      priority: "medium",
    },
    {
      type: "weeding",
      title: "Weed management",
      detail: "Manual weeding in patches",
      scheduledDate: addDays(startDate, 1),
      priority: "low",
    },
  ];

  const reasoning = [
    {
      agentType: "goal_understanding",
      decisionSummary: `Parsed goal "${goalText}" for ${crop} with objective ${objective}.`,
    },
    {
      agentType: "planning",
      decisionSummary: `Generated ${tasks.length} starter tasks covering irrigation, fertilizer, scouting and weeding.`,
    },
  ];

  return { tasks, reasoning };
}

module.exports = { generateTasks };