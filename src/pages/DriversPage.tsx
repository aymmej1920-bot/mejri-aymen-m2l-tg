"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddDriverDialog from "@/components/drivers/AddDriverDialog";
import EditDriverDialog from "@/components/drivers/EditDriverDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Users } from "lucide-react"; // Import Users icon
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
import { Driver } from "@/types/driver";
import DataTableSkeleton from "@/components/ui/DataTableSkeleton"; // Import DataTableSkeleton

const DriversPage = () => {
  const { drivers, deleteDriver, isLoadingFleetData } = useFleet(); // Get isLoadingFleetData
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deletingDriverId, setDeletingDriverId] = React.useState<string | null>(null); // Add deleting state

  const filteredDrivers = drivers.filter((driver) =>
    Object.values(driver).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDelete = async (driver: Driver) => {
    setDeletingDriverId(driver.id); // Set deleting item ID
    try {
      await deleteDriver(driver);
    } catch (error) {
      console.error("Failed to delete driver:", error);
    } finally {
      setDeletingDriverId(null); // Reset deleting item ID
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Conducteurs</h1>
        <AddDriverDialog />
      </div>

      <Card className="glass rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Liste des Conducteurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher un conducteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {isLoadingFleetData ? ( // Show skeleton loader when data is loading
            <DataTableSkeleton columns={5} />
          ) : filteredDrivers.length === 0 && drivers.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">
                Aucun conducteur ne correspond à votre recherche.
              </p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">
                Aucun conducteur enregistré pour le moment.
              </p>
              <p className="text-md text-muted-foreground text-center mt-2">
                Cliquez sur "Ajouter un conducteur" pour commencer à gérer vos conducteurs.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Numéro de permis</TableHead>
                  <TableHead>Numéro de téléphone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.firstName}</TableCell>
                    <TableCell>{driver.lastName}</TableCell>
                    <TableCell>{driver.licenseNumber}</TableCell>
                    <TableCell>{driver.phoneNumber}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <EditDriverDialog
                          driver={driver}
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
                                Cette action ne peut pas être annulée. Cela supprimera définitivement ce conducteur de votre liste.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(driver)}
                                disabled={deletingDriverId === driver.id} // Disable if currently deleting this item
                              >
                                {deletingDriverId === driver.id ? (
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

export default DriversPage;