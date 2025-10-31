"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddMaintenancePlanDialog from "@/components/maintenance-plans/AddMaintenancePlanDialog";
import EditMaintenancePlanDialog from "@/components/maintenance-plans/EditMaintenancePlanDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, PlayCircle, Loader2, CalendarCheck } from "lucide-react"; // Import CalendarCheck icon
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
import { MaintenancePlan } from "@/types/maintenancePlan";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DataTableSkeleton from "@/components/ui/DataTableSkeleton"; // Import DataTableSkeleton

const MaintenancePlansPage = () => {
  const { maintenancePlans, deleteMaintenancePlan, generateMaintenanceFromPlan, getVehicleByLicensePlate, isLoadingFleetData } = useFleet(); // Get isLoadingFleetData
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deletingPlanId, setDeletingPlanId] = React.useState<string | null>(null); // Add deleting state
  const [generatingPlanId, setGeneratingPlanId] = React.useState<string | null>(null); // Add generating state

  const getVehicleDetails = (licensePlate: string) => {
    const vehicle = getVehicleByLicensePlate(licensePlate);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${licensePlate})` : licensePlate;
  };

  const filteredMaintenancePlans = maintenancePlans.filter((plan) =>
    Object.values(plan).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    getVehicleDetails(plan.vehicleLicensePlate).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (plan: MaintenancePlan) => {
    setDeletingPlanId(plan.id); // Set deleting item ID
    try {
      await deleteMaintenancePlan(plan);
    } catch (error) {
      console.error("Failed to delete maintenance plan:", error);
    } finally {
      setDeletingPlanId(null); // Reset deleting item ID
    }
  };

  const handleGenerateMaintenance = async (plan: MaintenancePlan) => {
    setGeneratingPlanId(plan.id); // Set generating item ID
    try {
      await generateMaintenanceFromPlan(plan);
    } catch (error) {
      console.error("Failed to generate maintenance from plan:", error);
    } finally {
      setGeneratingPlanId(null); // Reset generating item ID
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Plans de Maintenance</h1>
        <AddMaintenancePlanDialog />
      </div>

      <Card className="glass rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Liste des Plans de Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher un plan de maintenance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {isLoadingFleetData ? ( // Show skeleton loader when data is loading
            <DataTableSkeleton columns={10} />
          ) : filteredMaintenancePlans.length === 0 && maintenancePlans.length > 0 ? (
            <p className="text-muted-foreground">
              Aucun plan de maintenance ne correspond à votre recherche.
            </p>
          ) : maintenancePlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CalendarCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Aucun plan de maintenance enregistré pour le moment. Cliquez sur "Ajouter un plan de maintenance" pour commencer.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Intervalle</TableHead>
                  <TableHead>Coût Estimé</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Dernière Génération</TableHead>
                  <TableHead>Prochaine Échéance</TableHead>
                  <TableHead>Prochain Km</TableHead> {/* New column */}
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenancePlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{getVehicleDetails(plan.vehicleLicensePlate)}</TableCell>
                    <TableCell>{plan.type}</TableCell>
                    <TableCell>{plan.description}</TableCell>
                    <TableCell>{plan.intervalValue} {plan.intervalType === "Kilométrage" ? "Km" : "Mois"}</TableCell>
                    <TableCell>{plan.estimatedCost.toFixed(2)} TND</TableCell>
                    <TableCell>{plan.provider}</TableCell>
                    <TableCell>
                      {plan.lastGeneratedDate ? format(new Date(plan.lastGeneratedDate), "PPP", { locale: fr }) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {plan.nextDueDate ? format(new Date(plan.nextDueDate), "PPP", { locale: fr }) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {plan.nextDueOdometer !== null ? `${plan.nextDueOdometer} Km` : "N/A"}
                    </TableCell>
                    <TableCell>{plan.status}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-100"
                          onClick={() => handleGenerateMaintenance(plan)}
                          title="Générer maintenance"
                          disabled={generatingPlanId === plan.id} // Disable if currently generating
                        >
                          {generatingPlanId === plan.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <EditMaintenancePlanDialog
                          plan={plan}
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
                                Cette action ne peut pas être annulée. Cela supprimera définitivement ce plan de maintenance de votre liste.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(plan)}
                                disabled={deletingPlanId === plan.id} // Disable if currently deleting this item
                              >
                                {deletingPlanId === plan.id ? (
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

export default MaintenancePlansPage;