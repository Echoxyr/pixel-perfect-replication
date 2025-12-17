import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WorkHubProvider } from "@/contexts/WorkHubContext";
import { Layout } from "@/components/workhub/Layout";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WorkHubProvider>
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
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WorkHubProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
