"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Paramètres de l'application</h1>

      <Card>
        <CardHeader>
          <CardTitle>Général</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Gérez les paramètres généraux de votre application ici.
          </p>
          {/* Future settings options can go here */}
          <div className="mt-4">
            <p className="text-sm font-medium">Thème :</p>
            <p className="text-sm text-muted-foreground">Option pour changer le thème (clair/sombre) à venir.</p>
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