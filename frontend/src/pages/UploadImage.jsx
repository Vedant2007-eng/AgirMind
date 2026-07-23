import { useRef, useState } from "react";
import {
  Sprout, LayoutGrid, Leaf, BrainCircuit, Settings, Globe, Volume2, Bell,
  UploadCloud, Camera, Sun, ChevronDown, AlertTriangle, Calendar,
  MapPin, ShieldAlert, Check, ArrowRight, ClipboardList, Sparkles, ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
  { key: "farm-setup", label: "Farm Setup", icon: Sprout },
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "crop-health", label: "Crop Health", icon: Leaf },
  { key: "ai-reasoning", label: "AI Reasoning", icon: BrainCircuit },
  { key: "settings", label: "Settings", icon: Settings },
];

const TIPS = [
  { icon: Camera, text: "Use a clear and focused photo" },
  { icon: Sun, text: "Capture in good lighting" },
  { icon: Leaf, text: "Show the affected area clearly" },
];

const SYMPTOMS = [
  "Orange to brown pustules on leaves",
  "Yellowing of leaves",
  "Premature leaf drying",
];

const RECENT_SCANS = [
  {
    thumbUrl: null,
    label: "Leaf Rust Detected",
    riskLabel: "Moderate",
    riskColor: "bg-orange-50 text-orange-600",
    field: "Field 1 (North)",
    date: "3 Aug 2025",
  },
  {
    thumbUrl: null,
    label: "Healthy",
    riskLabel: "Healthy",
    riskColor: "bg-green-50 text-green-700",
    field: "Field 1 (North)",
    date: "28 Jul 2025",
  },
  {
    thumbUrl: null,
    label: "Powdery Mildew",
    riskLabel: "Low",
    riskColor: "bg-amber-50 text-amber-600",
    field: "Field 2 (South)",
    date: "24 Jul 2025",
  },
];

export default function UploadImage({ activeNav = "crop-health", onNavigate, onAddTreatmentTask }) {
  const fileInputRef = useRef(null);
  const [language, setLanguage] = useState("en");
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | analyzing | done
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [taskAdded, setTaskAdded] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setStatus("analyzing");
    setResult(null);
    setTaskAdded(false);

    try {
      const body = new FormData();
      body.append("image", file);
      body.append("cropId", "wheat-field-1"); // TODO: wire to selected field

      const res = await fetch("/api/image", { method: "POST", body });
      const data = await res.json();

      // Expected shape: { label, confidence, severity, description, symptoms, detectedOn, crop, field }
      setResult(data);
      setStatus("done");
    } catch (err) {
      console.error("Image analysis failed", err);
      setStatus("idle");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleAddTask = async () => {
    if (submitting || taskAdded) return; // guard against double-clicks / double-submits

    const seasonPlanId = localStorage.getItem("agrimind_seasonPlanId");
    if (!seasonPlanId) {
      console.error("No seasonPlanId found — set up your farm first.");
      return;
    }

    setSubmitting(true);
    try {
      await fetch("/api/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonPlanId,
          reason: "disease_detected",
          diseaseResult: result,
        }),
      });
      setTaskAdded(true);
      onAddTreatmentTask?.(result);
    } catch (err) {
      console.error("Failed to add treatment task", err);
    } finally {
      setSubmitting(false);
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
      <main className="flex-1 px-8 py-6 grid grid-cols-[1fr_340px] gap-6">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
                Crop Health <Leaf className="w-5 h-5 text-green-700" />
              </h1>
              <p className="text-[13px] text-neutral-500 mt-1">
                Check your crop health by uploading a leaf image and get AI insights.
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
              <button className="flex items-center gap-2 border border-black/10 bg-white rounded-lg px-3 py-2 text-[13px]">
                <Volume2 className="w-4 h-4" />
                Listen
              </button>
              <button className="relative border border-black/10 bg-white rounded-lg p-2.5">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-600 text-white text-[9px] flex items-center justify-center">2</span>
              </button>
            </div>
          </div>

          {/* Upload card */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-neutral-900">Check crop health</p>
                <p className="text-[13px] text-neutral-500">Upload a clear photo of a leaf or affected area</p>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_220px] gap-4">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-green-200 rounded-xl bg-green-50/40 flex flex-col items-center justify-center py-10 text-center"
              >
                <UploadCloud className="w-9 h-9 text-green-600 mb-3" />
                <p className="text-[14px] text-neutral-700 mb-3">Drag &amp; drop a photo here</p>
                <p className="text-[12px] text-neutral-400 mb-3">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-800 hover:bg-green-900 text-white text-[13px] font-medium rounded-lg px-5 py-2.5"
                >
                  Choose file
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <p className="text-[11px] text-neutral-400 mt-3">JPG, PNG up to 10MB</p>
              </div>

              <div className="bg-green-50/60 rounded-xl p-4">
                <p className="text-[13px] font-semibold text-neutral-800 mb-3">Tips for best results</p>
                <ul className="space-y-3">
                  {TIPS.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-2 text-[12px] text-neutral-600">
                      <Icon className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Analysis Result */}
          <div className="bg-white border border-black/10 rounded-2xl p-6">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-neutral-900 mb-4">
              <ClipboardList className="w-4 h-4 text-green-700" />
              Analysis Result
            </p>

            {status === "idle" && (
              <p className="text-[13px] text-neutral-400 py-8 text-center">
                Upload a photo above to see AI analysis here.
              </p>
            )}

            {status === "analyzing" && (
              <div className="flex items-center gap-4 py-6">
                {imagePreview && (
                  <img src={imagePreview} alt="Uploaded crop" className="w-32 h-32 rounded-xl object-cover" />
                )}
                <p className="text-[13px] text-neutral-500">Analyzing image…</p>
              </div>
            )}

            {status === "done" && result && (
              <>
                <div className="grid grid-cols-[190px_1fr] gap-6 mb-5">
                  <img
                    src={imagePreview}
                    alt="Analyzed leaf"
                    className="w-full h-44 rounded-xl object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <p className="text-[16px] font-semibold text-neutral-900">
                        {result.label ?? "Leaf Rust Detected"}
                      </p>
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-600">
                        {result.severity ?? "Moderate Risk"}
                      </span>
                    </div>
                    <p className="text-[13px] text-neutral-600 mb-2">
                      Confidence Score: <span className="text-orange-600 font-medium">{result.confidence ?? 87}%</span>
                    </p>
                    <div className="w-full h-2 bg-neutral-100 rounded-full mb-1">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${result.confidence ?? 87}%` }}
                      />
                    </div>
                    <p className="text-[12px] text-neutral-400 mb-3">{result.confidence ?? 87}%</p>
                    <p className="text-[13px] text-neutral-600">
                      {result.impact ?? "This disease can reduce yield if not treated on time."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="flex items-center gap-2 border border-black/10 rounded-lg px-3 py-2.5">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <div>
                      <p className="text-[11px] text-neutral-400">Detected On</p>
                      <p className="text-[13px] font-medium text-neutral-800">{result.detectedOn ?? "3 Aug 2025"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border border-black/10 rounded-lg px-3 py-2.5">
                    <Sprout className="w-4 h-4 text-neutral-400" />
                    <div>
                      <p className="text-[11px] text-neutral-400">Crop</p>
                      <p className="text-[13px] font-medium text-neutral-800">{result.crop ?? "Wheat"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border border-black/10 rounded-lg px-3 py-2.5">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    <div>
                      <p className="text-[11px] text-neutral-400">Field</p>
                      <p className="text-[13px] font-medium text-neutral-800">{result.field ?? "Field 1 (North)"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-[13px] font-semibold text-neutral-800 mb-2">About this disease</p>
                    <p className="text-[13px] text-neutral-600 leading-relaxed">
                      {result.description ??
                        "Leaf rust is a fungal disease that affects wheat leaves. It appears as orange or brown pustules on the leaf surface and can reduce photosynthesis and grain yield."}
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-[13px] font-semibold text-neutral-800 mb-2">Symptoms</p>
                    <ul className="space-y-1.5">
                      {(result.symptoms ?? SYMPTOMS).map((s) => (
                        <li key={s} className="flex items-start gap-2 text-[13px] text-neutral-600">
                          <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={handleAddTask}
                  disabled={submitting || taskAdded}
                  className="w-full bg-green-800 hover:bg-green-900 disabled:opacity-60 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 text-[15px] font-medium"
                >
                  {taskAdded
                    ? "Task added to plan ✓"
                    : submitting
                    ? "Updating plan…"
                    : "Add treatment task to plan"}
                  {!submitting && !taskAdded && <ArrowRight className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>

          <p className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 mt-4">
            <ShieldAlert className="w-3.5 h-3.5 text-green-700" />
            Your data is secure and private
          </p>
        </div>

        {/* Right column */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl overflow-hidden border border-black/10 bg-neutral-900 relative h-64">
            {/* Replace with an actual hero image asset in /public */}
            <img
              src="/assets/crop-health-hero.jpg"
              alt="Crop health scanning illustration"
              className="w-full h-full object-cover opacity-90"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 rounded-xl px-4 py-3 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
              <p className="text-[12px] text-neutral-700">
                AI analyzes your crop health and provides accurate insights and recommendations.
              </p>
            </div>
          </div>

          <div className="bg-white border border-black/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-semibold text-neutral-900">Recent Scans</p>
              <button className="flex items-center gap-1 text-[12px] text-green-700 font-medium">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-black/5">
              {RECENT_SCANS.map(({ label, riskLabel, riskColor, field, date }) => (
                <button key={label} className="w-full flex items-center gap-3 py-3 text-left">
                  <div className="w-12 h-12 rounded-lg bg-green-50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium text-neutral-900 truncate">{label}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${riskColor}`}>{riskLabel}</span>
                    </div>
                    <p className="text-[12px] text-neutral-400">{field} · {date}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}