import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VehiclesPage from "./pages/VehiclesPage";
import DriversPage from "./pages/DriversPage";
import SettingsPage from "./pages/SettingsPage";
import MaintenancePage from "./pages/MaintenancePage";
import FuelPage from "./pages/FuelPage";
import AssignmentsPage from "./pages/AssignmentsPage"; // Importez la nouvelle page
import { FleetProvider } from "@/context/FleetContext";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Index />,
        handle: { title: "Accueil" },
      },
      {
        path: "/vehicles",
        element: <VehiclesPage />,
        handle: { title: "Gestion des Véhicules" },
      },
      {
        path: "/drivers",
        element: <DriversPage />,
        handle: { title: "Gestion des Conducteurs" },
      },
      {
        path: "/maintenances",
        element: <MaintenancePage />,
        handle: { title: "Gestion des Maintenances" },
      },
      {
        path: "/fuel",
        element: <FuelPage />,
        handle: { title: "Gestion du Carburant" },
      },
      {
        path: "/assignments", // Nouvelle route pour les affectations
        element: <AssignmentsPage />,
        handle: { title: "Gestion des Affectations" },
      },
      {
        path: "/settings",
        element: <SettingsPage />,
        handle: { title: "Paramètres" },
      },
      {
        path: "*",
        element: <NotFound />,
        handle: { title: "Page Introuvable" },
      },
    ],
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <FleetProvider>
        <RouterProvider router={router} />
      </FleetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;