import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VehiclesPage from "./pages/VehiclesPage";
import DriversPage from "./pages/DriversPage";
import SettingsPage from "./pages/SettingsPage";
import MaintenancePage from "./pages/MaintenancePage";
import FuelPage from "./pages/FuelPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import MaintenancePlansPage from "./pages/MaintenancePlansPage";
import DocumentsPage from "./pages/DocumentsPage"; // Importez la nouvelle page
import LoginPage from "./pages/LoginPage";
import { FleetProvider } from "@/context/FleetContext";
import { SessionContextProvider, useSession } from "@/context/SessionContext";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-muted-foreground">Chargement de la session...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    handle: { title: "Connexion" },
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
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
        path: "/maintenance-plans",
        element: <MaintenancePlansPage />,
        handle: { title: "Gestion des Plans de Maintenance" },
      },
      {
        path: "/fuel",
        element: <FuelPage />,
        handle: { title: "Gestion du Carburant" },
      },
      {
        path: "/assignments",
        element: <AssignmentsPage />,
        handle: { title: "Gestion des Affectations" },
      },
      {
        path: "/documents", // Nouvelle route
        element: <DocumentsPage />,
        handle: { title: "Gestion des Documents" },
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
      <SessionContextProvider>
        <FleetProvider>
          <RouterProvider router={router} />
        </FleetProvider>
      </SessionContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;