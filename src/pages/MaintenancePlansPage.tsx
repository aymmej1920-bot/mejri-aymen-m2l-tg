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
import { Trash2, PlayCircle } from "lucide-react";
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

const MaintenancePlansPage = () => {
  const { maintenancePlans, deleteMaintenancePlan, generateMaintenanceFromPlan, vehicles } = useFleet();
  const [searchTerm, setSearchTerm] = React.useState("");

  const getVehicleDetails = (licensePlate: string) => {
    const vehicle = vehicles.find(v => v.licensePlate === licensePlate);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${licensePlate})` : licensePlate;
  };

  const filteredMaintenancePlans = maintenancePlans.filter((plan) =>
    Object.values(plan).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    getVehicleDetails(plan.vehicleLicensePlate).toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {filteredMaintenancePlans.length === 0 && maintenancePlans.length > 0 && (
            <p className="text-muted-foreground">
              Aucun plan de maintenance ne correspond à votre recherche.
            </p>
          )}
          {maintenancePlans.length === 0 ? (
            <p className="text-muted-foreground">
              Aucun plan de maintenance enregistré pour le moment. Cliquez sur "Ajouter un plan de maintenance" pour commencer.
            </p>
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
                    <TableCell>{plan.status}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-100"
                          onClick={() => generateMaintenanceFromPlan(plan)}
                          title="Générer maintenance"
                        >
                          <PlayCircle className="h-4 w-4" />
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
                              <AlertDialogAction onClick={() => deleteMaintenancePlan(plan)}>
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

export default MaintenancePlansPage;