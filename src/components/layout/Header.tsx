"use client";

import React from "react";
import { useMatches, useNavigate } from "react-router-dom";
import NotificationCenter from "./NotificationCenter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useFleet } from "@/context/FleetContext";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

interface RouteHandle {
  title?: string;
}

const Header = () => {
  const matches = useMatches();
  const navigate = useNavigate();
  const { profile } = useFleet();
  const currentMatch = matches[matches.length - 1];
  const handle = currentMatch?.handle as RouteHandle | undefined;
  const title = handle?.title || "Bienvenue";

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Échec de la déconnexion : " + error.message);
    }
  };

  return (
    <header className="mb-6 flex justify-between items-center animate-fadeIn">
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <div className="flex items-center space-x-4">
        <NotificationCenter />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {profile?.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt="Avatar" />
                ) : (
                  <AvatarFallback>
                    {profile?.firstName ? profile.firstName[0] : <User className="h-4 w-4" />}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass rounded-xl animate-scaleIn" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.firstName || "Utilisateur"} {profile?.lastName || ""}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.id}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Mon Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;