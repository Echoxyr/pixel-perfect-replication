import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WorkHubProvider } from "@/contexts/WorkHubContext";
import { UserProvider } from "@/contexts/UserContext";
import { Layout } from "@/components/workhub/Layout";
import { PasswordGate } from "@/components/PasswordGate";
import { UIConfigProvider } from "@/components/workhub/UIConfigProvider";

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
import UserProfile from "./pages/UserProfile";

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
import UfficioCommerciale from "./pages/UfficioCommerciale";
import ComputoMetrico from "./pages/ComputoMetrico";
import RepartoAmministrazione from "./pages/RepartoAmministrazione";
import Timbrature from "./pages/Timbrature";
import Risorse from "./pages/Risorse";
import Scadenzario from "./pages/Scadenzario";
import Rapportini from "./pages/Rapportini";
import Magazzino from "./pages/Magazzino";
import Contatti from "./pages/Contatti";
import CheckinSicurezza from "./pages/CheckinSicurezza";
import ListinoPrezzi from "./pages/ListinoPrezzi";
import Azienda from "./pages/Azienda";
import FlussoDocumentale from "./pages/FlussoDocumentale";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WorkHubProvider>
        <UserProvider>
          <UIConfigProvider>
            <PasswordGate>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* All Routes - Password Protected */}
                  <Route element={<Layout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/utente" element={<UserProfile />} />
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
                    <Route path="/checkin-sicurezza" element={<CheckinSicurezza />} />
                    {/* Compliance Routes */}
                    <Route path="/compliance/gdpr" element={<GDPRCompliance />} />
                    <Route path="/compliance/qualita" element={<QualityISO />} />
                    <Route path="/compliance/sicurezza" element={<SafetyDLgs81 />} />
                    <Route path="/compliance/ambiente" element={<EnvironmentalISO />} />
                    <Route path="/compliance/bi" element={<BusinessIntelligence />} />
                    <Route path="/reparto-commerciale" element={<UfficioCommerciale />} />
                    <Route path="/computo-metrico" element={<ComputoMetrico />} />
                    <Route path="/listino-prezzi" element={<ListinoPrezzi />} />
                    <Route path="/reparto-amministrazione" element={<RepartoAmministrazione />} />
                    {/* New Features */}
                    <Route path="/timbrature" element={<Timbrature />} />
                    <Route path="/risorse" element={<Risorse />} />
                    <Route path="/scadenzario" element={<Scadenzario />} />
                    <Route path="/rapportini" element={<Rapportini />} />
                    <Route path="/magazzino" element={<Magazzino />} />
                    <Route path="/contatti" element={<Contatti />} />
                    <Route path="/azienda" element={<Azienda />} />
                    <Route path="/flusso-documentale" element={<FlussoDocumentale />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </PasswordGate>
          </UIConfigProvider>
        </UserProvider>
      </WorkHubProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
