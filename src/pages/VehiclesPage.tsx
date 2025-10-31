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
import { Trash2, Loader2, Car } from "lucide-react"; // Import Car icon
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
import { Input } from "@/components/ui/input";
import { useFleet } from "@/context/FleetContext";
import { Vehicle } from "@/types/vehicle";
import DataTableSkeleton from "@/components/ui/DataTableSkeleton"; // Import DataTableSkeleton

const VehiclesPage = () => {
  const { vehicles, deleteVehicle, isLoadingFleetData } = useFleet(); // Get isLoadingFleetData
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deletingVehicleId, setDeletingVehicleId] = React.useState<string | null>(null); // Add deleting state

  const filteredVehicles = vehicles.filter((vehicle) =>
    Object.values(vehicle).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDelete = async (vehicle: Vehicle) => {
    setDeletingVehicleId(vehicle.id); // Set deleting item ID
    try {
      await deleteVehicle(vehicle);
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
    } finally {
      setDeletingVehicleId(null); // Reset deleting item ID
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Véhicules</h1>
        <AddVehicleDialog />
      </div>

      <Card className="glass rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Liste des Véhicules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher un véhicule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {isLoadingFleetData ? ( // Show skeleton loader when data is loading
            <DataTableSkeleton columns={5} />
          ) : filteredVehicles.length === 0 && vehicles.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Car className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">
                Aucun véhicule ne correspond à votre recherche.
              </p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Car className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">
                Aucun véhicule enregistré pour le moment.
              </p>
              <p className="text-md text-muted-foreground text-center mt-2">
                Cliquez sur "Ajouter un véhicule" pour commencer à gérer votre flotte.
              </p>
            </div>
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
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.make}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>{vehicle.licensePlate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <EditVehicleDialog
                          vehicle={vehicle}
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
                              <AlertDialogAction
                                onClick={() => handleDelete(vehicle)}
                                disabled={deletingVehicleId === vehicle.id} // Disable if currently deleting this item
                              >
                                {deletingVehicleId === vehicle.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  "Supprimer"
                                )}
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