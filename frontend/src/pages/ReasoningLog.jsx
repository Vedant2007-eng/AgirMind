import { useState, useEffect } from "react";
import {
  Sprout, LayoutGrid, Leaf, BrainCircuit, Settings, Globe, Bell,
  ChevronDown, ChevronRight, CloudSun, Sprout as SproutIcon, FileText,
  Satellite, Database, Radar, ShieldAlert, Lightbulb, RefreshCw,
  Droplet, TrendingUp, FlaskConical, Sparkles, ArrowRight, ThumbsUp,
  ThumbsDown, Ruler, Leaf as LeafIcon, Bug, Route
} from "lucide-react";

const NAV_ITEMS = [
  { key: "farm-setup", label: "Farm Setup", icon: Sprout },
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "crop-health", label: "Crop Health", icon: Leaf },
  { key: "ai-reasoning", label: "AI Reasoning", icon: BrainCircuit },
  { key: "settings", label: "Settings", icon: Settings },
];

const DATA_SOURCES = [
  { icon: CloudSun, label: "Weather Data", note: "Live forecast & history" },
  { icon: Database, label: "Soil Data", note: "Moisture, NPK, pH" },
  { icon: SproutIcon, label: "Crop Data", note: "Growth stage & health" },
  { icon: FileText, label: "Field History", note: "Past activities & yield" },
  { icon: Satellite, label: "Satellite Data", note: "NDVI & vegetation index" },
];

const PROCESS_STEPS = [
  { icon: Database, title: "Data Collection", body: "Collecting data from multiple sources" },
  { icon: BrainCircuit, title: "Pattern Recognition", body: "AI identifies patterns and abnormalities" },
  { icon: ShieldAlert, title: "Risk Assessment", body: "Calculating risk levels and impact" },
  { icon: Lightbulb, title: "Recommendations", body: "Generating actionable recommendations" },
  { icon: RefreshCw, title: "Continuous Learning", body: "Improving with more data and feedback" },
];

// Maps a reasoning log entry's agentType (from MongoDB) to an icon/color,
// since the backend only sends back a plain string, not a React component.
const AGENT_STYLE = {
  goal_understanding: { icon: Sprout, iconBg: "bg-green-50 text-green-700", tag: "Goal", tagColor: "bg-green-50 text-green-700" },
  planning: { icon: BrainCircuit, iconBg: "bg-green-50 text-green-700", tag: "Planning", tagColor: "bg-green-50 text-green-700" },
  disease: { icon: Bug, iconBg: "bg-red-50 text-red-600", tag: "Disease", tagColor: "bg-red-50 text-red-600" },
  weather: { icon: CloudSun, iconBg: "bg-amber-50 text-amber-600", tag: "Weather", tagColor: "bg-amber-50 text-amber-600" },
  coordinator: { icon: Route, iconBg: "bg-blue-50 text-blue-600", tag: "Coordinator", tagColor: "bg-blue-50 text-blue-600" },
};

const FARM_OVERVIEW = [
  { icon: SproutIcon, label: "Crop", value: "Wheat" },
  { icon: LeafIcon, label: "Variety", value: "HD 2967" },
  { icon: Ruler, label: "Field Area", value: "5 Acres" },
  { icon: Radar, label: "Crop Age", value: "81 Days" },
  { icon: Sprout, label: "Growth Stage", value: "Tillering" },
];

const SMART_TIPS = [
  { icon: Droplet, iconBg: "bg-blue-50 text-blue-600", text: "Irrigate early morning or late evening to reduce water loss." },
  { icon: Leaf, iconBg: "bg-green-50 text-green-700", text: "Monitor leaves regularly for early sign of leaf rust." },
  { icon: FlaskConical, iconBg: "bg-green-50 text-green-700", text: "Apply urea as per recommendation to avoid nitrogen deficiency." },
];

function formatTimestamp(ts) {
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReasoningLog({ activeNav = "ai-reasoning", onNavigate }) {
  const [language, setLanguage] = useState("en");
  const [feedback, setFeedback] = useState(null); // null | "helpful" | "not_helpful"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reasoningLog, setReasoningLog] = useState([]);

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
        // Most recent first
        const log = [...(data.seasonPlan.reasoningLog || [])].reverse();
        setReasoningLog(log);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const sendFeedback = async (value) => {
    setFeedback(value);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
    } catch (err) {
      console.error("Failed to send feedback", err);
    }
  };

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
      <main className="flex-1 px-8 py-6 grid grid-cols-[1fr_320px] gap-6">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
                AI Reasoning <BrainCircuit className="w-5 h-5 text-green-700" />
              </h1>
              <p className="text-[13px] text-neutral-500 mt-1">
                See how AgriMind analyzes your farm data and gives smart recommendations.
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
              <button className="relative border border-black/10 bg-white rounded-lg p-2.5">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-600 text-white text-[9px] flex items-center justify-center">2</span>
              </button>
            </div>
          </div>

          {/* What AgriMind is analyzing */}
          <div className="bg-green-50/60 border border-green-100 rounded-2xl p-5 mb-4">
            <p className="text-[14px] font-semibold text-neutral-900 mb-4">What AgriMind is analyzing</p>
            <div className="grid grid-cols-5 gap-4">
              {DATA_SOURCES.map(({ icon: Icon, label, note }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12px] font-medium text-neutral-800 leading-tight">{label}</p>
                    <p className="text-[11px] text-neutral-500 leading-tight">{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Reasoning Process */}
          <div className="bg-white border border-black/10 rounded-2xl p-5 mb-4">
            <p className="text-[14px] font-semibold text-neutral-900">AI Reasoning Process</p>
            <p className="text-[12px] text-neutral-500 mb-5">
              AgriMind uses advanced AI models to understand patterns and predict outcomes.
            </p>
            <div className="flex items-start">
              {PROCESS_STEPS.map(({ icon: Icon, title, body }, i) => (
                <div key={title} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center text-center w-32">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-green-700" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-800 text-white text-[10px] font-semibold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <p className="text-[12px] font-medium text-neutral-800 mt-2">{title}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">{body}</p>
                  </div>
                  {i < PROCESS_STEPS.length - 1 && (
                    <div className="flex-1 h-px bg-neutral-200 mx-1 mt-[-40px]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reasoning Log — real data */}
          <div className="bg-white border border-black/10 rounded-2xl p-5">
            <p className="text-[14px] font-semibold text-neutral-900 mb-3">Reasoning Log</p>

            {loading && (
              <p className="text-[13px] text-neutral-400 py-6 text-center">Loading reasoning history…</p>
            )}

            {!loading && error && (
              <p className="text-[13px] text-red-600 py-6 text-center">{error}</p>
            )}

            {!loading && !error && (
              <div className="divide-y divide-black/5">
                {reasoningLog.length === 0 && (
                  <p className="text-[13px] text-neutral-400 py-6 text-center">
                    No reasoning history yet.
                  </p>
                )}
                {reasoningLog.map((entry, i) => {
                  const style = AGENT_STYLE[entry.agentType] || AGENT_STYLE.coordinator;
                  const Icon = style.icon;
                  return (
                    <div key={i} className="w-full flex items-center gap-3 py-3.5 text-left">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-neutral-900">{entry.decisionSummary}</p>
                        <p className="text-[12px] text-neutral-400 mt-0.5">{formatTimestamp(entry.timestamp)}</p>
                      </div>
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${style.tagColor}`}>
                        {style.tag}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feedback bar */}
          <div className="flex items-center justify-between bg-green-50/60 border border-green-100 rounded-2xl px-5 py-4 mt-4">
            <div className="flex items-center gap-3">
              <SproutIcon className="w-5 h-5 text-green-700" />
              <div>
                <p className="text-[13px] font-semibold text-neutral-900">AgriMind improves with your feedback!</p>
                <p className="text-[12px] text-neutral-500">Rate the recommendations and help us serve you better.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => sendFeedback("helpful")}
                className={`flex items-center gap-2 border rounded-lg px-4 py-2 text-[13px] font-medium ${
                  feedback === "helpful" ? "border-green-700 bg-green-50 text-green-800" : "border-black/10 bg-white text-neutral-700"
                }`}
              >
                <ThumbsUp className="w-4 h-4" /> Helpful
              </button>
              <button
                onClick={() => sendFeedback("not_helpful")}
                className={`flex items-center gap-2 border rounded-lg px-4 py-2 text-[13px] font-medium ${
                  feedback === "not_helpful" ? "border-red-400 bg-red-50 text-red-600" : "border-black/10 bg-white text-neutral-700"
                }`}
              >
                <ThumbsDown className="w-4 h-4" /> Not Helpful
              </button>
            </div>
          </div>
        </div>

        {/* Right column — still mocked, no backend endpoint yet */}
        <aside className="flex flex-col gap-4">
          <div className="bg-white border border-black/10 rounded-2xl p-5">
            <p className="text-[14px] font-semibold text-neutral-900 mb-3">Farm Overview</p>
            <div className="rounded-xl overflow-hidden h-32 mb-4 bg-gradient-to-b from-sky-200 to-green-700 relative">
              <img
                src="/assets/farm-overview-hero.jpg"
                alt="Farm overview"
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
            <div className="divide-y divide-black/5">
              {FARM_OVERVIEW.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2 text-[13px] text-neutral-600">
                    <Icon className="w-4 h-4 text-green-700" />
                    {label}
                  </div>
                  <p className="text-[13px] font-medium text-neutral-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-black/10 rounded-2xl p-5">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-neutral-900 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Smart Tips
            </p>
            <div className="space-y-3 mb-4">
              {SMART_TIPS.map(({ icon: Icon, iconBg, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-[13px] text-neutral-700 leading-snug">{text}</p>
                </div>
              ))}
            </div>
            <button className="w-full flex items-center justify-center gap-2 border border-green-700 text-green-800 rounded-xl py-2.5 text-[13px] font-medium">
              View All Tips <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}