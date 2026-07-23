import { useState, useEffect } from "react";
import {
  Sprout, LayoutGrid, Leaf, BrainCircuit, Settings, Globe, Bell,
  TrendingUp, Droplet, ShieldCheck, FileText, Wheat, ArrowRight,
  Calendar, Clock, ChevronDown, CloudSun, CloudRain, Sun, Radar,
  Bug, LineChart, Sprout as SproutIcon, Cloud, CloudSnow, CloudLightning, CloudFog
} from "lucide-react";

const NAV_ITEMS = [
  { key: "farm-setup", label: "Farm Setup", icon: Sprout },
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "crop-health", label: "Crop Health", icon: Leaf },
  { key: "ai-reasoning", label: "AI Reasoning", icon: BrainCircuit },
  { key: "settings", label: "Settings", icon: Settings },
];

// Maps OpenWeatherMap's "main" condition string to an icon.
const WEATHER_ICON = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudRain,
  Thunderstorm: CloudLightning,
  Snow: CloudSnow,
  Mist: CloudFog,
  Fog: CloudFog,
  Haze: CloudFog,
};

const INSIGHTS = [
  { icon: Droplet, iconBg: "bg-blue-50 text-blue-600", title: "Water Efficiency", body: "Good! You are using water within the budget.", value: "92%", valueLabel: "Efficiency", valueColor: "text-blue-600" },
  { icon: Leaf, iconBg: "bg-green-50 text-green-700", title: "Disease Risk", body: "Low risk of leaf rust right now.", value: "Low", valueLabel: "Risk", valueColor: "text-green-600" },
  { icon: CloudSun, iconBg: "bg-amber-50 text-amber-600", title: "Weather Risk", body: "No heavy rain expected in next 5 days.", value: "Low", valueLabel: "Risk", valueColor: "text-green-600" },
  { icon: LineChart, iconBg: "bg-purple-50 text-purple-600", title: "Market Trend", body: "Wheat price is stable this week.", value: "Stable", valueLabel: "Trend", valueColor: "text-purple-600" },
];

const AGENTS = [
  "Planning Agent", "Weather Agent", "Soil Agent", "Disease Agent",
  "Irrigation Agent", "Market Agent", "Risk Agent", "Coordinator Agent",
];

// Maps a task's `type` (from MongoDB) to an icon + color, since the backend
// only sends back plain strings, not React components.
const TASK_TYPE_STYLE = {
  irrigation: { icon: Droplet, iconBg: "bg-blue-50 text-blue-600" },
  fertilizer: { icon: SproutIcon, iconBg: "bg-green-50 text-green-700" },
  scouting: { icon: Radar, iconBg: "bg-orange-50 text-orange-600" },
  weeding: { icon: FileText, iconBg: "bg-purple-50 text-purple-600" },
  treatment: { icon: Bug, iconBg: "bg-red-50 text-red-600" },
};

const PRIORITY_STYLE = {
  high: { label: "High Priority", color: "bg-blue-50 text-blue-600" },
  medium: { label: "Medium Priority", color: "bg-green-50 text-green-700" },
  low: { label: "Low Priority", color: "bg-neutral-100 text-neutral-500" },
};

const STATUS_STYLE = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-600" },
  in_progress: { label: "In Progress", color: "bg-blue-50 text-blue-600" },
  done: { label: "Done", color: "bg-green-50 text-green-700" },
  skipped: { label: "Skipped", color: "bg-neutral-100 text-neutral-500" },
  replaced: { label: "Replaced", color: "bg-neutral-100 text-neutral-500" },
};

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", { weekday: undefined, hour: "2-digit", minute: "2-digit" });
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(dateStr).toLocaleDateString("en-IN");
}

export default function Dashboard({ activeNav = "dashboard", onNavigate }) {
  const [language, setLanguage] = useState("en");
  const [tab, setTab] = useState("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seasonPlan, setSeasonPlan] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(null);

  const [simulating, setSimulating] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const seasonPlanId = localStorage.getItem("agrimind_seasonPlanId");

    if (!seasonPlanId) {
      setError("No season plan found. Please set up your farm first.");
      setLoading(false);
      return;
    }

    fetch(`/api/season-plan?seasonPlanId=${seasonPlanId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch season plan");
        return res.json();
      })
      .then((data) => {
        setSeasonPlan(data.seasonPlan);
        setTasks(data.tasks || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/weather?location=Mandsaur,IN")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch weather");
        return res.json();
      })
      .then((data) => setWeather(data))
      .catch((err) => setWeatherError(err.message));
  }, []);

  useEffect(() => {
    const seasonPlanId = localStorage.getItem("agrimind_seasonPlanId");
    if (!seasonPlanId) return;

    fetch(`/api/notifications?seasonPlanId=${seasonPlanId}`)
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch((err) => console.error("Failed to fetch notifications", err));
  }, [seasonPlan?.version]);

  const simulateHeavyRain = async () => {
    const seasonPlanId = localStorage.getItem("agrimind_seasonPlanId");
    if (!seasonPlanId || simulating) return;

    setSimulating(true);
    try {
      await fetch("/api/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonPlanId,
          reason: "weather_event",
          weatherEvent: { rainfallMm: 45 },
        }),
      });
      // Refetch so the UI shows the updated plan immediately
      const res = await fetch(`/api/season-plan?seasonPlanId=${seasonPlanId}`);
      const data = await res.json();
      setSeasonPlan(data.seasonPlan);
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Failed to simulate weather event", err);
    } finally {
      setSimulating(false);
    }
  };

  const metrics = seasonPlan
    ? [
        {
          icon: TrendingUp,
          iconBg: "bg-green-50 text-green-700",
          label: "Expected Yield",
          value: `${seasonPlan.currentYieldEstimate?.value ?? "—"} ${seasonPlan.currentYieldEstimate?.unit ?? ""}`,
          note: `Confidence: ${Math.round((seasonPlan.currentYieldEstimate?.confidence ?? 0) * 100)}%`,
          noteColor: "text-neutral-500",
        },
        {
          icon: Droplet,
          iconBg: "bg-blue-50 text-blue-600",
          label: "Water Used",
          value: "—",
          note: "Not tracked yet",
          noteColor: "text-neutral-500",
        },
        {
          icon: ShieldCheck,
          iconBg: "bg-amber-50 text-amber-600",
          label: "Risk Score",
          value: seasonPlan.currentRiskScore ?? "—",
          note: "Overall risk",
          noteColor: "text-green-600",
        },
        {
          icon: FileText,
          iconBg: "bg-purple-50 text-purple-600",
          label: "Plan Version",
          value: `v${seasonPlan.version ?? 1}.0`,
          note: `Last updated: ${new Date(seasonPlan.updatedAt).toLocaleString("en-IN")}`,
          noteColor: "text-neutral-500",
        },
      ]
    : [];

  const CurrentWeatherIcon = weather ? (WEATHER_ICON[weather.current.condition] || CloudSun) : CloudSun;

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-black/5 bg-[#FAFAF7] flex flex-col justify-between px-4 py-6">
        <div>
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-green-800 leading-tight">AgriMind</p>
              <p className="text-[11px] text-neutral-500 leading-tight">AI Farm Manager</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
              const active = key === activeNav;
              return (
                <button
                  key={key}
                  onClick={() => onNavigate?.(key)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-left transition-colors ${
                    active
                      ? "bg-green-100 text-green-800 font-medium"
                      : "text-neutral-600 hover:bg-black/5"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        <button className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-left">
          <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center text-white text-xs font-medium">
            DF
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-neutral-800 truncate">Demo Farmer</p>
            <p className="text-[11px] text-neutral-500 truncate">Mandsaur, MP</p>
          </div>
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 px-8 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
              Season Dashboard <Sprout className="w-5 h-5 text-green-700" />
            </h1>
            <p className="text-[13px] text-neutral-500 mt-1">
              AI is continuously planning, monitoring and updating your farm plan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage((l) => (l === "en" ? "mr" : "en"))}
              className="flex items-center gap-2 border border-black/10 bg-white rounded-lg px-3 py-2 text-[13px]"
            >
              <Globe className="w-4 h-4" />
              <span className={language === "en" ? "font-semibold text-green-800" : "text-neutral-500"}>English</span>
              <span className="text-neutral-300">|</span>
              <span className={language === "mr" ? "font-semibold text-green-800" : "text-neutral-500"}>मराठी</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications((s) => !s)}
                className="relative border border-black/10 bg-white rounded-lg p-2.5"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-600 text-white text-[9px] flex items-center justify-center">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-black/10 rounded-xl shadow-lg z-10 max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-black/5">
                    <p className="text-[13px] font-semibold text-neutral-900">Notifications</p>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-[13px] text-neutral-400 text-center py-6">No notifications yet.</p>
                  ) : (
                    <div className="divide-y divide-black/5">
                      {notifications.map((n) => (
                        <div key={n._id} className="px-4 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[13px] text-neutral-800 leading-snug">{n.message}</p>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                                n.severity === "critical"
                                  ? "bg-red-50 text-red-600"
                                  : n.severity === "warning"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-blue-50 text-blue-600"
                              }`}
                            >
                              {n.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="bg-white border border-black/10 rounded-2xl p-8 text-center text-[14px] text-neutral-400">
            Loading your season plan…
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-[14px] text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && seasonPlan && (
          <>
            {/* Goal banner */}
            <div className="flex items-center gap-6 bg-green-50 border border-green-200 rounded-2xl px-6 py-5 mb-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <SproutIcon className="w-6 h-6 text-green-700" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-neutral-500">Your Goal</p>
                <p className="text-[17px] font-semibold text-neutral-900 mt-0.5">
                  {seasonPlan.goalText}
                </p>
              </div>
              <Wheat className="w-16 h-16 text-amber-400 shrink-0" />
              <button
                onClick={() => onNavigate?.("ai-reasoning")}
                className="flex items-center gap-1.5 border border-green-700 text-green-800 rounded-lg px-4 py-2.5 text-[13px] font-medium whitespace-nowrap"
              >
                View Goal Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {metrics.map(({ icon: Icon, iconBg, label, value, note, noteColor }) => (
                <div key={label} className="bg-white border border-black/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-[13px] text-neutral-500">{label}</p>
                  </div>
                  <p className="text-[22px] font-semibold text-neutral-900">{value}</p>
                  <p className={`text-[12px] mt-1 ${noteColor}`}>{note}</p>
                </div>
              ))}
            </div>

            {/* Tasks + Weather/Insights */}
            <div className="grid grid-cols-[1fr_360px] gap-4 mb-6">
              {/* Today's Tasks */}
              <div className="bg-white border border-black/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="flex items-center gap-2 text-[14px] font-semibold text-neutral-900">
                    <Calendar className="w-4 h-4 text-green-700" />
                    Tasks
                  </p>
                  <p className="text-[12px] text-neutral-400">
                    {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>

                <div className="divide-y divide-black/5">
                  {tasks.length === 0 && (
                    <p className="text-[13px] text-neutral-400 py-6 text-center">No tasks yet.</p>
                  )}
                  {tasks.map((task) => {
                    const typeStyle = TASK_TYPE_STYLE[task.type] || TASK_TYPE_STYLE.scouting;
                    const priorityStyle = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.medium;
                    const statusStyle = STATUS_STYLE[task.status] || STATUS_STYLE.pending;
                    const Icon = typeStyle.icon;

                    return (
                      <div
                        key={task._id}
                        className={`flex items-center gap-3 py-3.5 ${task.isNewTask ? "bg-red-50/40 -mx-5 px-5 rounded-lg" : ""}`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${typeStyle.iconBg}`}>
                          <Icon className="w-[18px] h-[18px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-medium text-neutral-900">{task.title}</p>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full ${priorityStyle.color}`}>{priorityStyle.label}</span>
                            {task.isNewTask && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-600">New</span>
                            )}
                          </div>
                          <p className="text-[13px] text-neutral-500">{task.detail}</p>
                          <p className="flex items-center gap-1 text-[12px] text-neutral-400 mt-0.5">
                            <Clock className="w-3 h-3" /> {formatTime(task.scheduledDate)}
                          </p>
                        </div>
                        <span className={`text-[12px] font-medium px-3 py-1.5 rounded-lg shrink-0 ${statusStyle.color}`}>
                          {statusStyle.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-4">
                <div className="bg-white border border-black/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[14px] font-semibold text-neutral-900">Weather Forecast</p>
                    <p className="text-[12px] text-neutral-400">Mandsaur, MP</p>
                  </div>

                  {!weather && !weatherError && (
                    <p className="text-[13px] text-neutral-400 py-4 text-center">Loading weather…</p>
                  )}

                  {weatherError && (
                    <p className="text-[13px] text-red-500 py-4 text-center">Weather unavailable</p>
                  )}

                  {weather && (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <CurrentWeatherIcon className="w-9 h-9 text-amber-400" />
                        <div>
                          <p className="text-[22px] font-semibold text-neutral-900">{weather.current.tempC}°C</p>
                          <p className="text-[12px] text-neutral-500 capitalize">{weather.current.description || weather.current.condition}</p>
                        </div>
                      </div>
                      <p className="text-[12px] text-neutral-500 mb-3">
                        Humidity: {weather.current.humidity}% · Wind: {weather.current.windKmh} km/h
                      </p>
                      <div className="grid grid-cols-5 gap-1 text-center">
                        {weather.forecast.map(({ day, hi, lo, condition }) => {
                          const DayIcon = WEATHER_ICON[condition] || CloudSun;
                          return (
                            <div key={day} className="border border-black/5 rounded-lg py-2">
                              <p className="text-[11px] text-neutral-500">{day}</p>
                              <DayIcon className="w-4 h-4 mx-auto my-1 text-neutral-400" />
                              <p className="text-[12px] font-medium">{hi}°</p>
                              <p className="text-[11px] text-neutral-400">{lo}°</p>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={simulateHeavyRain}
                        disabled={simulating}
                        className="w-full mt-3 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 rounded-lg py-2 text-[12px] font-medium"
                      >
                        {simulating ? "Simulating…" : "Simulate Heavy Rain Event"}
                      </button>
                    </>
                  )}
                </div>

                {/* AI Insights — still mocked, no backend endpoint yet */}
                <div className="bg-white border border-black/10 rounded-2xl p-5 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <p className="flex items-center gap-2 text-[14px] font-semibold text-neutral-900">
                      <CloudSun className="w-4 h-4 text-green-700" />
                      AI Insights
                    </p>
                  </div>
                  <div className="divide-y divide-black/5">
                    {INSIGHTS.map(({ icon: Icon, iconBg, title, body, value, valueLabel, valueColor }) => (
                      <div key={title} className="flex items-center gap-3 py-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-neutral-900">{title}</p>
                          <p className="text-[12px] text-neutral-500">{body}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-[14px] font-semibold ${valueColor}`}>{value}</p>
                          <p className="text-[11px] text-neutral-400">{valueLabel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Active AI Agents — still mocked */}
            <div className="bg-white border border-black/10 rounded-2xl px-5 py-4">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900 mb-3">
                <BrainCircuit className="w-4 h-4 text-green-700" />
                Active AI Agents
              </p>
              <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
                {AGENTS.map((name) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                      <BrainCircuit className="w-4 h-4 text-green-700" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-neutral-800 leading-tight">{name}</p>
                      <p className="text-[11px] text-green-600 leading-tight">• Active</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}