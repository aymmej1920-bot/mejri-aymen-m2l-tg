"use client";

import { NavLink } from "react-router-dom";
import { Home, Car, Users, Settings, Wrench, Fuel, Link, LogOut, CalendarCheck } from "lucide-react"; // Importez CalendarCheck
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

const Sidebar = () => {
  const navLinkClasses = "flex items-center px-3 py-2 rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
  const activeNavLinkClasses = "bg-sidebar-primary text-sidebar-primary-foreground";

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Échec de la déconnexion : " + error.message);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 bg-sidebar text-sidebar-foreground">
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
        <NavLink
          to="/vehicles"
          className={({ isActive }) =>
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Car className="mr-2 h-4 w-4" />
          Véhicules
        </NavLink>
        <NavLink
          to="/drivers"
          className={({ isActive }) =>
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Users className="mr-2 h-4 w-4" />
          Conducteurs
        </NavLink>
        <NavLink
          to="/maintenances"
          className={({ isActive }) =>
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Wrench className="mr-2 h-4 w-4" />
          Maintenances
        </NavLink>
        <NavLink
          to="/maintenance-plans"
          className={({ isActive }) =>
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <CalendarCheck className="mr-2 h-4 w-4" />
          Plans de Maintenance
        </NavLink>
        <NavLink
          to="/fuel"
          className={({ isActive }) =>
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Fuel className="mr-2 h-4 w-4" />
          Carburant
        </NavLink>
        <NavLink
          to="/assignments"
          className={({ isActive }) =>
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Link className="mr-2 h-4 w-4" />
          Affectations
        </NavLink>
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