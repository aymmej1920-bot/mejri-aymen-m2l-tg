"use client";

import { NavLink } from "react-router-dom"; // Utiliser NavLink au lieu de Link
import { Home, Car, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils"; // Importer la fonction cn pour combiner les classes Tailwind

const Sidebar = () => {
  const navLinkClasses = "flex items-center px-3 py-2 rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
  const activeNavLinkClasses = "bg-sidebar-primary text-sidebar-primary-foreground";

  return (
    <div className="flex flex-col h-full p-4 border-r bg-sidebar text-sidebar-foreground">
      <div className="mb-8 text-2xl font-bold text-sidebar-primary">
        Fleet Manager Pro
      </div>
      <nav className="flex flex-col space-y-2">
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
          to="/settings"
          className={({ isActive }) =>
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Settings className="mr-2 h-4 w-4" />
          Paramètres
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;