"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddVehicleDialog from "@/components/vehicles/AddVehicleDialog";
import EditVehicleDialog from "@/components/vehicles/EditVehicleDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import { useFleet } from "@/context/FleetContext"; // Importez le hook useFleet
import { Vehicle } from "@/types/vehicle";

const VehiclesPage = () => {
  const { vehicles, deleteVehicle } = useFleet(); // Utilisez le contexte pour les véhicules et la fonction de suppression

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Véhicules</h1>
        <AddVehicleDialog /> {/* Le composant AddVehicleDialog gérera l'ajout via le contexte */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Véhicules</CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <p className="text-muted-foreground">
              Aucun véhicule enregistré pour le moment. Cliquez sur "Ajouter un véhicule" pour commencer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marque</TableHead>
                  <TableHead>Modèle</TableHead>
                  <TableHead>Année</TableHead>
                  <TableHead>Plaque d'immatriculation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{vehicle.make}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>{vehicle.licensePlate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <EditVehicleDialog
                          vehicle={vehicle}
                          // La fonction onEditVehicle sera gérée par le composant EditVehicleDialog lui-même via le contexte
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action ne peut pas être annulée. Cela supprimera définitivement ce véhicule de votre liste.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteVehicle(vehicle)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VehiclesPage;