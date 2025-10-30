"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const VehiclesPage = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Véhicules</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un véhicule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Véhicules</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aucun véhicule enregistré pour le moment. Cliquez sur "Ajouter un véhicule" pour commencer.
          </p>
          {/* Ici, nous ajouterons la logique pour afficher la liste des véhicules plus tard */}
        </CardContent>
      </Card>
    </div>
  );
};

export default VehiclesPage;