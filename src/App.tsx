import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WorkHubProvider } from "@/contexts/WorkHubContext";
import { Layout } from "@/components/workhub/Layout";
import { useClickSound } from "@/hooks/useClickSound";

// Click sound wrapper component
const ClickSoundProvider = ({ children }: { children: React.ReactNode }) => {
  useClickSound();
  return <>{children}</>;
};

// Pages
import Dashboard from "./pages/Dashboard";
import Progetti from "./pages/Progetti";
import Cantieri from "./pages/Cantieri";
import CantiereDetail from "./pages/CantiereDetail";
import Imprese from "./pages/Imprese";
import Lavoratori from "./pages/Lavoratori";
import HSEDashboard from "./pages/HSEDashboard";
import SALPage from "./pages/SAL";
import Impostazioni from "./pages/Impostazioni";
import NotFound from "./pages/NotFound";

// HSE Pages
import Formazione from "./pages/Formazione";
import DPI from "./pages/DPI";
import SorveglianzaSanitaria from "./pages/SorveglianzaSanitaria";

// Compliance Pages
import GDPRCompliance from "./pages/GDPRCompliance";
import QualityISO from "./pages/QualityISO";
import SafetyDLgs81 from "./pages/SafetyDLgs81";
import EnvironmentalISO from "./pages/EnvironmentalISO";
import BusinessIntelligence from "./pages/BusinessIntelligence";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WorkHubProvider>
        <ClickSoundProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/progetti" element={<Progetti />} />
                <Route path="/cantieri" element={<Cantieri />} />
                <Route path="/cantieri/:id" element={<CantiereDetail />} />
                <Route path="/imprese" element={<Imprese />} />
                <Route path="/lavoratori" element={<Lavoratori />} />
                <Route path="/hse" element={<HSEDashboard />} />
                <Route path="/sal" element={<SALPage />} />
                <Route path="/impostazioni" element={<Impostazioni />} />
                {/* HSE Routes */}
                <Route path="/formazione" element={<Formazione />} />
                <Route path="/dpi" element={<DPI />} />
                <Route path="/sorveglianza-sanitaria" element={<SorveglianzaSanitaria />} />
                {/* Compliance Routes */}
                <Route path="/compliance/gdpr" element={<GDPRCompliance />} />
                <Route path="/compliance/qualita" element={<QualityISO />} />
                <Route path="/compliance/sicurezza" element={<SafetyDLgs81 />} />
                <Route path="/compliance/ambiente" element={<EnvironmentalISO />} />
                <Route path="/compliance/bi" element={<BusinessIntelligence />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ClickSoundProvider>
      </WorkHubProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
