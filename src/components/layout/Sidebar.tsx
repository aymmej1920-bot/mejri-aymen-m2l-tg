"use client";

import { NavLink } from "react-router-dom";
import { Home, Car, Users, Settings, Wrench, Fuel, Link, LogOut, CalendarCheck, FileText, Route, ClipboardCheck, BellRing, BarChart3, UserCircle, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { useFleet } from "@/context/FleetContext";

const Sidebar = () => {
  const { can } = useFleet(); // Get can function from FleetContext
  const navLinkClasses = "flex items-center px-3 py-2 rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
  const activeNavLinkClasses = "gradient-brand text-white";

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Échec de la déconnexion : " + error.message);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 glass rounded-2xl text-sidebar-foreground">
      <div className="mb-8 text-2xl font-bold text-sidebar-primary">
        Fleet Manager Pro
      </div>
      <nav className="flex flex-col space-y-2 flex-grow">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Home className="mr-2 h-4 w-4" />
          Accueil
        </NavLink>
        {can('profile.edit') && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(navLinkClasses, isActive && activeNavLinkClasses)
            }
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Mon Profil
          </NavLink>
        )}
        {can('users.view') && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              cn(navLinkClasses, isActive && activeNavLinkClasses)
            }
          >
            <UserCog className="mr-2 h-4 w-4" />
            Gestion des Utilisateurs
          </NavLink>
        )}
        {can('vehicles.view') && (
          <NavLink
            to="/vehicles"
            className={({ isActive }) =>
              cn(navLinkClasses, isActive && activeNavLinkClasses)
            }
          >
            <Car className="mr-2 h-4 w-4" />
            Véhicules
          </NavLink>
        )}
        {can('drivers.view') && (
          <NavLink
            to="/drivers"
            className={({ isActive }) =>
              cn(navLinkClasses, isActive && activeNavLinkClasses)
            }
          >
            <Users className="mr-2 h-4 w-4" />
            Conducteurs
          </NavLink>
        )}
        {can('maintenances.view') && (
          <NavLink
            to="/maintenances"
            className={({ isActive }) =>
              cn(navLinkClasses, isActive && activeNavLinkClasses)
            }
          >
            <Wrench className="mr-2 h-4 w-4" />
            Maintenances
          </NavLink>
        )}
        {can('maintenance_plans.view') && (
          <NavLink
            to="/maintenance-plans"
            className={({ isActive }) =>
              cn(navLinkClasses, isActive && activeNavLinkClasses)
            }
          >
            <CalendarCheck className="mr-2 h-4 w-4" />
            Plans de Maintenance
          </NavLink>
        )}
        {can('fuel_entries.view') && (
          <NavLink
            to="/fuel"
            className={({ isActive }) =>
              cn(navLinkClasses, isActive && activeNavLinkClasses)
            }
          >
            <Fuel className="mr-2 h-4 w-4" />
            Carburant
          </NavLink>
        )}
        {can('assignments.view') && (
          <NavLink
            to="/assignments"
            className={({ isActive }) =>
              cn(navLinkClasses, isActive && activeNavLinkClasses)
            }
          >
            <Link className="mr-2 h-4 w-4" />
            Affectations
          </NavLink>
        )}
        {can('documents.view') && (
          <NavLink
            to="/documents"
            className={({ isActive }) =>
              cn(navLinkClasses, isActive && activeNavLinkClasses)
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </NavLink>
        )}
        {can('tours.view') && (
          <NavLink
            to="/tours"
            className={({ isActive }) =>
              cn(navLinkClasses, isActive && activeNavLinkClasses)
            }
          >
            <Route className="mr-2 h-4 w-4" />
            Tournées & Missions
          </NavLink>
        )}
        {can('inspections.view') && (
          <NavLink
            to="/inspections"
            className={({ isActive }) =>
              cn(navLinkClasses, isActive && activeNavLinkClasses)
            }
          >
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Inspections
          </NavLink>
        )}
        {can('alert_rules.view') && (
          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              cn(navLinkClasses, isActive && activeNavLinkClasses)
            }
          >
            <BellRing className="mr-2 h-4 w-4" />
            Alertes
          </NavLink>
        )}
        {can('reports.view') && (
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              cn(navLinkClasses, isActive && activeNavLinkClasses)
            }
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Rapports & Analyses
          </NavLink>
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Settings className="mr-2 h-4 w-4" />
          Paramètres
        </NavLink>
      </nav>
      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn(navLinkClasses, "w-full justify-start")}
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;