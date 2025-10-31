"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddMaintenanceDialog from "@/components/maintenance/AddMaintenanceDialog";
import EditMaintenanceDialog from "@/components/maintenance/EditMaintenanceDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react"; // Import Loader2
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
import { Maintenance } from "@/types/maintenance";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const MaintenancePage = () => {
  const { maintenances, deleteMaintenance } = useFleet();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deletingMaintenanceId, setDeletingMaintenanceId] = React.useState<string | null>(null); // Add deleting state

  const filteredMaintenances = maintenances.filter((maintenance) =>
    Object.values(maintenance).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDelete = async (maintenance: Maintenance) => {
    setDeletingMaintenanceId(maintenance.id); // Set deleting item ID
    try {
      await deleteMaintenance(maintenance);
    } catch (error) {
      console.error("Failed to delete maintenance:", error);
    } finally {
      setDeletingMaintenanceId(null); // Reset deleting item ID
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Maintenances</h1>
        <AddMaintenanceDialog />
      </div>

      <Card className="glass rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Liste des Maintenances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher une maintenance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {filteredMaintenances.length === 0 && maintenances.length > 0 && (
            <p className="text-muted-foreground">
              Aucune maintenance ne correspond à votre recherche.
            </p>
          )}
          {maintenances.length === 0 ? (
            <p className="text-muted-foreground">
              Aucune maintenance enregistrée pour le moment. Cliquez sur "Ajouter une maintenance" pour commencer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plaque Véhicule</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Coût</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenances.map((maintenance) => (
                  <TableRow key={maintenance.id}>
                    <TableCell className="font-medium">{maintenance.vehicleLicensePlate}</TableCell>
                    <TableCell>{maintenance.type}</TableCell>
                    <TableCell>{maintenance.description}</TableCell>
                    <TableCell>{maintenance.cost.toFixed(2)} TND</TableCell>
                    <TableCell>{format(new Date(maintenance.date), "PPP", { locale: fr })}</TableCell>
                    <TableCell>{maintenance.provider}</TableCell>
                    <TableCell>{maintenance.status}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <EditMaintenanceDialog
                          maintenance={maintenance}
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
                                Cette action ne peut pas être annulée. Cela supprimera définitivement cette maintenance de votre liste.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(maintenance)}
                                disabled={deletingMaintenanceId === maintenance.id} // Disable if currently deleting this item
                              >
                                {deletingMaintenanceId === maintenance.id ? (
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

export default MaintenancePage;