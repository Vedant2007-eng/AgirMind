import { useState } from "react";
import {
  Sprout, LayoutDashboard, Leaf, BrainCircuit, Settings,
  MapPin, Droplet, Mic, Globe, Volume2, ChevronDown,
  Target, ArrowRight, Lock, Home, User,
} from "lucide-react";

export default function Onboarding({ activeNav = "farm-setup", onNavigate, onSubmit }) {
  const [formData, setFormData] = useState({
    location: "Mandsaur, Madhya Pradesh, India",
    farmSize: "5",
    soilType: "Loamy",
    waterSource: "Borewell",
    waterBudget: "50000",
    crop: "Wheat",
    goalPreset: "Maximize yield",
    goalText: "Maximize wheat yield this season with limited water.",
  });
  const [language, setLanguage] = useState("en"); // "en" | "mr"
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Create farm profile
      const farmRes = await fetch("/api/farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: formData.location,
          farmSize: formData.farmSize,
          soilType: formData.soilType,
          waterSource: formData.waterSource,
          waterBudget: formData.waterBudget,
        }),
      });
      const { farmId } = await farmRes.json();

      // 2. Submit season goal
      const goalRes = await fetch("/api/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId,
          crop: formData.crop,
          objective: formData.goalPreset,
          goalText: formData.goalText,
        }),
      });
      const { seasonPlanId } = await goalRes.json();

      // 3. Navigate to Dashboard
      onSubmit?.(seasonPlanId);
    } catch (err) {
      console.error("Failed to create season plan", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAF7]">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-6 py-6 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 leading-tight">AgriMind</p>
            <p className="text-xs text-gray-500 leading-tight">AI Farm Manager</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <NavItem icon={Home} label="Farm Setup" active={activeNav === "farm-setup"} onClick={() => onNavigate?.("farm-setup")} />
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeNav === "dashboard"} onClick={() => onNavigate?.("dashboard")} />
          <NavItem icon={Leaf} label="Crop Health" active={activeNav === "crop-health"} onClick={() => onNavigate?.("crop-health")} />
          <NavItem icon={BrainCircuit} label="AI Reasoning" active={activeNav === "ai-reasoning"} onClick={() => onNavigate?.("ai-reasoning")} />
          <NavItem icon={Settings} label="Settings" active={activeNav === "settings"} onClick={() => onNavigate?.("settings")} />
        </nav>

        <div
          className="mx-3 mb-3 h-40 rounded-xl bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 100%), url('/farm-illustration.png')",
          }}
        />

        <div className="mx-3 mb-4 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Demo Farmer</p>
            <p className="text-xs text-gray-500 truncate">demo@agrimind.com</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </aside>

      {/* ---------------- Main content ---------------- */}
      <main className="flex-1 px-8 py-6">
        {/* Top banner */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 mr-4 rounded-xl bg-green-50 border border-green-100 px-5 py-3">
            <p className="text-sm text-green-800">
              <span className="font-medium">AI आपला संपूर्ण सीजन प्लान तयार करेल आणि परिस्थितीनुसार तो आपोआप अपडेट करेल.</span>
            </p>
            <p className="text-sm text-green-800">
              AI will create your complete season plan and update it automatically.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === "en" ? "mr" : "en")}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
            >
              <Globe className="w-4 h-4" />
              English <span className="text-gray-300">|</span> मराठी
            </button>
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
              <Volume2 className="w-4 h-4" />
              Listen
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Form column */}
          <div className="flex-1 max-w-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-green-600" /> आपले शेत सेट करा
                </h1>
                <h2 className="text-2xl font-semibold text-green-700 flex items-center gap-2">
                  Let&apos;s set up your farm <Sprout className="w-5 h-5" />
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  काही माहिती द्या आणि आपले ध्येय सांगा, बाकी काम AI संभाळेल.
                  <br />
                  Share a few details and your goal, AI will handle the rest.
                </p>
              </div>

              <div className="w-64 shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                <p className="text-sm font-medium text-amber-900 flex items-center justify-center gap-1">
                  <Mic className="w-4 h-4" /> आपले ध्येय बोला
                </p>
                <p className="text-xs text-amber-700 mt-1">You can also speak your goal</p>
                <p className="text-amber-400 mt-2 tracking-widest">••••••••••••</p>
              </div>
            </div>

            {/* Farm Location */}
            <Section title="स्थानाची माहिती / Farm Location" icon={MapPin}>
              <Field label={null}>
                <input
                  className="input"
                  value={formData.location}
                  onChange={update("location")}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Field label="शेताचा आकार (एकर) / Farm size (acres)">
                  <input
                    type="number"
                    className="input"
                    value={formData.farmSize}
                    onChange={update("farmSize")}
                  />
                </Field>
                <Field label="मातीचा प्रकार / Soil Type">
                  <select
                    className="input"
                    value={formData.soilType}
                    onChange={update("soilType")}
                  >
                    <option>Loamy</option>
                    <option>Clay</option>
                    <option>Sandy</option>
                    <option>Black cotton</option>
                  </select>
                </Field>
              </div>
            </Section>

            {/* Water Availability */}
            <Section title="पाण्याची उपलब्धता / Water Availability" icon={Droplet}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="पाण्याचा स्त्रोत / Water Source">
                  <select
                    className="input"
                    value={formData.waterSource}
                    onChange={update("waterSource")}
                  >
                    <option>Borewell</option>
                    <option>Canal</option>
                    <option>Rainfed</option>
                    <option>River</option>
                  </select>
                </Field>
                <Field label="पाण्याचा बजेट (लिटर/सीजन) / Water Budget (liters/season)">
                  <input
                    type="number"
                    className="input"
                    value={formData.waterBudget}
                    onChange={update("waterBudget")}
                  />
                </Field>
              </div>
            </Section>

            {/* Crop & Goal */}
            <Section title="पीक आणि ध्येय / Crop & Goal" icon={Sprout}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="पीक / Crop">
                  <select className="input" value={formData.crop} onChange={update("crop")}>
                    <option>Wheat</option>
                    <option>Rice</option>
                    <option>Cotton</option>
                    <option>Sugarcane</option>
                  </select>
                </Field>
                <Field label="आपले ध्येय / Your Goal">
                  <select
                    className="input"
                    value={formData.goalPreset}
                    onChange={update("goalPreset")}
                  >
                    <option>Maximize yield</option>
                    <option>Minimize cost</option>
                    <option>Balance yield and water use</option>
                  </select>
                </Field>
              </div>

              <Field
                label="आपले ध्येय थोडक्यात सांगा (पर्यायी) / Describe your goal (optional)"
                className="mt-4"
              >
                <textarea
                  className="input min-h-[80px] resize-none"
                  maxLength={200}
                  value={formData.goalText}
                  onChange={update("goalText")}
                />
                <p className="text-xs text-gray-400 text-right mt-1">
                  {formData.goalText.length}/200
                </p>
              </Field>
            </Section>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-xl bg-green-800 hover:bg-green-900 disabled:opacity-60 transition-colors text-white py-4 flex items-center justify-center gap-2 font-medium"
            >
              <span>
                {submitting
                  ? "प्लान तयार होत आहे... Creating your plan…"
                  : "माझा AI सीजन प्लान तयार करा   Create My AI Season Plan"}
              </span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>

            <p className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-3">
              <Lock className="w-3 h-3" /> आपला डेटा सुरक्षित आणि खाजगी आहे &nbsp;|&nbsp; Your data is
              secure and private
            </p>
          </div>

          {/* How it works column */}
          <aside className="w-80 shrink-0">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="font-medium text-gray-900 mb-4">
                AI कसे काम करते? / How it works
              </p>
              <div className="space-y-5">
                <HowStep
                  n={1}
                  title="आपण आपले ध्येय सेट करता"
                  titleEn="You set your goal"
                  bodyHi="आपण शेताची माहिती आणि ध्येय सांगता."
                  bodyEn="Tell us your farm details and goal."
                />
                <HowStep
                  n={2}
                  title="AI प्लान तयार करते"
                  titleEn="AI creates your plan"
                  bodyHi="आमचे AI एजंट आपले पूर्ण सीजन प्लान तयार करतात."
                  bodyEn="Our AI agents create a complete plan."
                />
                <HowStep
                  n={3}
                  title="AI निरीक्षण आणि अपडेट करते"
                  titleEn="AI monitors & updates"
                  bodyHi="हवामान, माती, पाणी, रोग आणि बाजारावर लक्ष ठेवते."
                  bodyEn="We monitor weather, soil, water, disease & market."
                />
                <HowStep
                  n={4}
                  title="आपणास सूचित केले जाते"
                  titleEn="You get notified"
                  bodyHi="योग्य वेळी अलर्ट आणि शिफारसी मिळतात."
                  bodyEn="You get timely alerts and recommendations."
                />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ---------------- small building blocks ---------------- */

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-green-700 text-white"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 mb-4">
      <p className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-4">
        <Icon className="w-4 h-4 text-green-700" /> {title}
      </p>
      {children}
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs text-gray-500 mb-1">{label}</label>}
      {children}
    </div>
  );
}

function HowStep({ n, title, titleEn, bodyHi, bodyEn }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 shrink-0 rounded-full bg-green-50 flex items-center justify-center text-green-700 text-sm font-semibold">
        {n}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">
          {n}. {title}
        </p>
        <p className="text-sm font-medium text-gray-900">{titleEn}</p>
        <p className="text-xs text-gray-500 mt-1">{bodyHi}</p>
        <p className="text-xs text-gray-500">{bodyEn}</p>
      </div>
    </div>
  );
}