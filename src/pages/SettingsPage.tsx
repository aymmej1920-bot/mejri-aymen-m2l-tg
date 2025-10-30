"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes"; // Importez le hook useTheme
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Importez les composants Select de shadcn/ui
import { Label } from "@/components/ui/label"; // Importez le composant Label

const SettingsPage = () => {
  const { theme, setTheme } = useTheme(); // Utilisez le hook useTheme

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Paramètres de l'application</h1>

      <Card>
        <CardHeader>
          <CardTitle>Général</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Gérez les paramètres généraux de votre application ici.
          </p>
          <div className="flex items-center space-x-2">
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
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
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