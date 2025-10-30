"use client";

import React from "react";
import { Outlet } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header"; // Importez le composant Header
import { cn } from "@/lib/utils";

const Layout = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen app-background-gradient text-foreground"> {/* Ajout de la classe de dégradé */}
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <div className={cn("w-64 flex-shrink-0", !isMobile && "border-r")}>
          <Sidebar />
        </div>
      )}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <Header /> {/* Affichez l'en-tête ici */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;