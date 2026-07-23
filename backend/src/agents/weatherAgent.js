// Weather Agent (v1 — real OpenWeatherMap integration).
// Fetches current conditions + a 5-day forecast for a given location.
// Falls back to null/error so the route can decide how to respond if the
// API key is missing or the request fails — keeps this agent swappable.

async function fetchWeather({ location = "Mandsaur,IN" } = {}) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY is missing. Check your .env file.");
  }

  // Current weather
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    location
  )}&units=metric&appid=${apiKey}`;

  // 5-day / 3-hour forecast (free tier)
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
    location
  )}&units=metric&appid=${apiKey}`;

  const [currentRes, forecastRes] = await Promise.all([
    fetch(currentUrl),
    fetch(forecastUrl),
  ]);

  if (!currentRes.ok) throw new Error(`Current weather fetch failed (${currentRes.status})`);
  if (!forecastRes.ok) throw new Error(`Forecast fetch failed (${forecastRes.status})`);

  const currentData = await currentRes.json();
  const forecastData = await forecastRes.json();

  const current = {
    tempC: Math.round(currentData.main.temp),
    condition: currentData.weather?.[0]?.main ?? "Unknown",
    description: currentData.weather?.[0]?.description ?? "",
    humidity: currentData.main.humidity,
    windKmh: Math.round(currentData.wind.speed * 3.6), // m/s -> km/h
  };

  // The free /forecast endpoint returns data every 3 hours. Reduce it to
  // one entry per day (picking the midday reading) for a simple 5-day view.
  const dailyMap = new Map();
  for (const entry of forecastData.list) {
    const date = entry.dt_txt.split(" ")[0];
    const hour = entry.dt_txt.split(" ")[1];
    if (!dailyMap.has(date) || hour === "12:00:00") {
      dailyMap.set(date, entry);
    }
  }

  const forecast = Array.from(dailyMap.values())
    .slice(0, 5)
    .map((entry) => {
      const day = new Date(entry.dt_txt).toLocaleDateString("en-IN", { weekday: "short" });
      return {
        day,
        hi: Math.round(entry.main.temp_max),
        lo: Math.round(entry.main.temp_min),
        condition: entry.weather?.[0]?.main ?? "Unknown",
      };
    });

  return { current, forecast };
}

module.exports = { fetchWeather };