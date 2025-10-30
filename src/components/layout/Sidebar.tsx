"use client";

import { NavLink } from "react-router-dom"; // Utiliser NavLink au lieu de Link
import { Button } from "@/components/ui/button";
import { Home, Car, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils"; // Importer la fonction cn pour combiner les classes Tailwind

const Sidebar = () => {
  return (
    <div className="flex flex-col h-full p-4 border-r bg-sidebar text-sidebar-foreground">
      <div className="mb-8 text-2xl font-bold text-sidebar-primary">
        Fleet Manager Pro
      </div>
      <nav className="flex flex-col space-y-2">
        <Button
          asChild
          variant="ghost"
          className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <Home className="mr-2 h-4 w-4" />
            Accueil
          </NavLink>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <NavLink
            to="/vehicles"
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <Car className="mr-2 h-4 w-4" />
            Véhicules
          </NavLink>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <NavLink
            to="/drivers"
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <Users className="mr-2 h-4 w-4" />
            Conducteurs
          </NavLink>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </NavLink>
        </Button>
      </nav>
    </div>
  );
};

export default Sidebar;