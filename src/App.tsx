import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VehiclesPage from "./pages/VehiclesPage";
import DriversPage from "./pages/DriversPage";
import SettingsPage from "./pages/SettingsPage";
import { FleetProvider } from "@/context/FleetContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner /> {/* Seul le composant Sonner est conservé pour les toasts */}
      <BrowserRouter>
        <FleetProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} handle={{ title: "Accueil" }} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/vehicles" element={<VehiclesPage />} handle={{ title: "Gestion des Véhicules" }} />
              <Route path="/drivers" element={<DriversPage />} handle={{ title: "Gestion des Conducteurs" }} />
              <Route path="/settings" element={<SettingsPage />} handle={{ title: "Paramètres" }} />
              <Route path="*" element={<NotFound />} handle={{ title: "Page Introuvable" }} />
            </Route>
          </Routes>
        </FleetProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;