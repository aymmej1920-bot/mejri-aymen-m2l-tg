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
import DocumentsPage from "./pages/DocumentsPage";
import ToursPage from "./pages/ToursPage";
import InspectionsPage from "./pages/InspectionsPage";
import AlertsPage from "./pages/AlertsPage";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
// Removed UsersPage import
import { FleetProvider, useFleet } from "@/context/FleetContext";
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

const AppRoutes = () => {
  const { isLoadingFleetData } = useFleet();

  if (isLoadingFleetData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-muted-foreground">Chargement des données de la flotte...</p>
      </div>
    );
  }

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
          path: "/profile",
          element: <ProfilePage />,
          handle: { title: "Mon Profil" },
        },
        // Removed /users route
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
          path: "/documents",
          element: <DocumentsPage />,
          handle: { title: "Gestion des Documents" },
        },
        {
          path: "/tours",
          element: <ToursPage />,
          handle: { title: "Gestion des Tournées" },
        },
        {
          path: "/inspections",
          element: <InspectionsPage />,
          handle: { title: "Gestion des Inspections" },
        },
        {
          path: "/alerts",
          element: <AlertsPage />,
          handle: { title: "Gestion des Alertes" },
        },
        {
          path: "/reports",
          element: <ReportsPage />,
          handle: { title: "Rapports & Analyses" },
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
  return <RouterProvider router={router} />;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-right" />
      <SessionContextProvider>
        <FleetProvider>
          <AppRoutes />
        </FleetProvider>
      </SessionContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;