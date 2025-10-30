import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // Importez createBrowserRouter et RouterProvider
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VehiclesPage from "./pages/VehiclesPage";
import DriversPage from "./pages/DriversPage";
import SettingsPage from "./pages/SettingsPage";
import { FleetProvider } from "@/context/FleetContext";

const queryClient = new QueryClient();

// Définissez vos routes sous forme d'un tableau d'objets
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
        <RouterProvider router={router} /> {/* Utilisez RouterProvider avec le routeur créé */}
      </FleetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;