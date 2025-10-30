"use client";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Car, Users, Settings } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="flex flex-col h-full p-4 border-r bg-sidebar text-sidebar-foreground">
      <div className="mb-8 text-2xl font-bold text-sidebar-primary">
        Fleet Manager Pro
      </div>
      <nav className="flex flex-col space-y-2">
        <Button asChild variant="ghost" className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Accueil
          </Link>
        </Button>
        <Button asChild variant="ghost" className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Link to="/vehicles">
            <Car className="mr-2 h-4 w-4" />
            Véhicules
          </Link>
        </Button>
        <Button asChild variant="ghost" className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Link to="/drivers">
            <Users className="mr-2 h-4 w-4" />
            Conducteurs
          </Link>
        </Button>
        <Button asChild variant="ghost" className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </Link>
        </Button>
      </nav>
    </div>
  );
};

export default Sidebar;