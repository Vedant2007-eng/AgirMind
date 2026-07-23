const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/connection");

const farmRoutes = require("./routes/farm");
const goalRoutes = require("./routes/goal");
const seasonPlanRoutes = require("./routes/seasonPlan");
const imageRoutes = require("./routes/image");
const updatePlanRoutes = require("./routes/updatePlan");
const notificationRoutes = require("./routes/notifications");
const weatherRoutes = require("./routes/weather");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "AgriMind backend is running" });
});

app.use("/api/farm", farmRoutes);
app.use("/api/goal", goalRoutes);
app.use("/api/season-plan", seasonPlanRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/update-plan", updatePlanRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/weather", weatherRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`AgriMind backend listening on http://localhost:${PORT}`);
  });
});