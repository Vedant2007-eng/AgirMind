import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import UploadImage from "./pages/UploadImage";
import ReasoningLog from "./pages/ReasoningLog";

// Maps the sidebar's nav "key" (used inside each page's NAV_ITEMS) to a real route.
const ROUTES = {
  "farm-setup": "/",
  "dashboard": "/dashboard",
  "crop-health": "/crop-health",
  "ai-reasoning": "/ai-reasoning",
};

// Every page calls onNavigate(key) from its sidebar. This turns that into
// an actual route change using React Router's navigate().
function useAppNavigate() {
  const navigate = useNavigate();
  return (key) => {
    const path = ROUTES[key];
    if (path) navigate(path);
  };
}

function OnboardingRoute() {
  const navigate = useAppNavigate();
  const appNavigate = useNavigate();
  return (
    <Onboarding
      activeNav="farm-setup"
      onNavigate={navigate}
      onSubmit={(seasonPlanId) => {
        // Save so Dashboard (and later UploadImage/ReasoningLog) know which
        // plan to fetch/update.
        localStorage.setItem("agrimind_seasonPlanId", seasonPlanId);
        appNavigate("/dashboard");
      }}
    />
  );
}

function DashboardRoute() {
  const navigate = useAppNavigate();
  return <Dashboard activeNav="dashboard" onNavigate={navigate} />;
}

function UploadImageRoute() {
  const navigate = useAppNavigate();
  const appNavigate = useNavigate();
  return (
    <UploadImage
      activeNav="crop-health"
      onNavigate={navigate}
      onAddTreatmentTask={() => appNavigate("/ai-reasoning")}
    />
  );
}

function ReasoningLogRoute() {
  const navigate = useAppNavigate();
  return <ReasoningLog activeNav="ai-reasoning" onNavigate={navigate} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OnboardingRoute />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/crop-health" element={<UploadImageRoute />} />
        <Route path="/ai-reasoning" element={<ReasoningLogRoute />} />
      </Routes>
    </BrowserRouter>
  );
}