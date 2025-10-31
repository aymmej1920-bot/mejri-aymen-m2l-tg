"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFleet } from "@/context/FleetContext";
import { supabase } from "@/integrations/supabase/client"; // Importez le client Supabase
import { showError } from "@/utils/toast"; // Importez showError

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { clearAllData } = useFleet();

  const handleClearAllData = () => {
    clearAllData();
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Échec de la déconnexion : " + error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Paramètres de l'application</h1>

      <Card className="glass rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Général</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Gérez les paramètres généraux de votre application ici.
          </p>
          <div className="flex items-center space-x-2 mb-4">
            <Label htmlFor="theme-select" className="text-sm font-medium">Thème :</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme-select" className="w-[180px]">
                <SelectValue placeholder="Sélectionner un thème" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Clair</SelectItem>
                <SelectItem value="dark">Sombre</SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Gestion des données</h3>
            <p className="text-muted-foreground mb-4">
              Attention : Cette action effacera toutes les données de véhicules et de conducteurs de votre application.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="hover:animate-hover-lift">Effacer toutes les données</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action ne peut pas être annulée. Cela supprimera définitivement toutes vos données de véhicules et de conducteurs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAllData}>
                    Effacer tout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Authentification</h3>
            <p className="text-muted-foreground mb-4">
              Déconnectez-vous de votre compte.
            </p>
            <Button variant="outline" onClick={handleLogout} className="hover:animate-hover-lift">
              Déconnexion
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 glass rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configurez vos préférences de notification.
          </p>
          {/* Future notification settings can go here */}
          <div className="mt-4">
            <p className="text-sm font-medium">Alertes par e-mail :</p>
            <p className="text-sm text-muted-foreground">Option pour activer/désactiver les alertes par e-mail à venir.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;