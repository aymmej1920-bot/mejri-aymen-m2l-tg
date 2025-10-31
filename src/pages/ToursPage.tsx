"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddTourDialog from "@/components/tours/AddTourDialog";
import EditTourDialog from "@/components/tours/EditTourDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Route, Car, Users, Loader2 } from "lucide-react"; // Import Loader2 and Route icon
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
import { Tour } from "@/types/tour";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DataTableSkeleton from "@/components/ui/DataTableSkeleton"; // Import DataTableSkeleton

const ToursPage = () => {
  const { tours, deleteTour, getVehicleByLicensePlate, getDriverByLicenseNumber, isLoadingFleetData } = useFleet(); // Get isLoadingFleetData
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deletingTourId, setDeletingTourId] = React.useState<string | null>(null); // Add deleting state

  const getVehicleDetails = (licensePlate: string) => {
    const vehicle = getVehicleByLicensePlate(licensePlate);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${licensePlate})` : licensePlate;
  };

  const getDriverDetails = (licenseNumber: string) => {
    const driver = getDriverByLicenseNumber(licenseNumber);
    return driver ? `${driver.firstName} ${driver.lastName} (${licenseNumber})` : licenseNumber;
  };

  const filteredTours = tours.filter((tour) =>
    Object.values(tour).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    getVehicleDetails(tour.vehicleLicensePlate).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDriverDetails(tour.driverLicenseNumber).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (tour: Tour) => {
    setDeletingTourId(tour.id); // Set deleting item ID
    try {
      await deleteTour(tour);
    } catch (error) {
      console.error("Failed to delete tour:", error);
    } finally {
      setDeletingTourId(null); // Reset deleting item ID
    }
  };

  // Calculer les statistiques de résumé
  const totalTours = tours.length;
  const activeTours = tours.filter(t => t.status === "En cours").length;
  const plannedTours = tours.filter(t => t.status === "Planifiée").length;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Tournées & Missions</h1>
        <AddTourDialog />
      </div>

      {/* Nouvelles cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="glass rounded-2xl animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tournées</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTours}</div>
            <p className="text-xs text-muted-foreground">tournées enregistrées</p>
          </CardContent>
        </Card>
        <Card className="glass rounded-2xl animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournées Actives</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTours}</div>
            <p className="text-xs text-muted-foreground">en cours</p>
          </CardContent>
        </Card>
        <Card className="glass rounded-2xl animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournées Planifiées</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plannedTours}</div>
            <p className="text-xs text-muted-foreground">à venir</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Liste des Tournées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher une tournée..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {isLoadingFleetData ? ( // Show skeleton loader when data is loading
            <DataTableSkeleton columns={9} />
          ) : filteredTours.length === 0 && tours.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Route className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">
                Aucune tournée ne correspond à votre recherche.
              </p>
            </div>
          ) : tours.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Route className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">
                Aucune tournée enregistrée pour le moment.
              </p>
              <p className="text-md text-muted-foreground text-center mt-2">
                Cliquez sur "Ajouter une tournée" pour planifier vos missions.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Conducteur</TableHead>
                  <TableHead>Début</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Km Début</TableHead>
                  <TableHead>Km Fin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTours.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell className="font-medium">{tour.name}</TableCell>
                    <TableCell>{getVehicleDetails(tour.vehicleLicensePlate)}</TableCell>
                    <TableCell>{getDriverDetails(tour.driverLicenseNumber)}</TableCell>
                    <TableCell>{format(new Date(tour.startDate), "PPP", { locale: fr })}</TableCell>
                    <TableCell>{format(new Date(tour.endDate), "PPP", { locale: fr })}</TableCell>
                    <TableCell>{tour.startOdometer} Km</TableCell>
                    <TableCell>{tour.endOdometer !== null ? `${tour.endOdometer} Km` : "N/A"}</TableCell>
                    <TableCell>{tour.status}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <EditTourDialog
                          tour={tour}
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
                                Cette action ne peut pas être annulée. Cela supprimera définitivement cette tournée de votre liste.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(tour)}
                                disabled={deletingTourId === tour.id} // Disable if currently deleting this item
                              >
                                {deletingTourId === tour.id ? (
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

export default ToursPage;