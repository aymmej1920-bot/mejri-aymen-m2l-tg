"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddInspectionDialog from "@/components/inspections/AddInspectionDialog";
import EditInspectionDialog from "@/components/inspections/EditInspectionDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, ClipboardCheck, Eye } from "lucide-react";
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
import { Inspection, InspectionCheckpoint } from "@/types/inspection";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CustomBadge } from "@/components/CustomBadge"; // Import CustomBadge

const InspectionsPage = () => {
  const { inspections, deleteInspection, vehicles } = useFleet();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [viewingInspection, setViewingInspection] = React.useState<Inspection | null>(null);

  const getVehicleDetails = (licensePlate: string) => {
    const vehicle = vehicles.find(v => v.licensePlate === licensePlate);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${licensePlate})` : licensePlate;
  };

  const filteredInspections = inspections.filter((inspection) =>
    Object.values(inspection).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    getVehicleDetails(inspection.vehicleLicensePlate).toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.checkpoints.some(cp => cp.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getOverallStatusBadgeVariant = (status: Inspection['overallStatus']) => {
    switch (status) {
      case "Conforme":
        return "success"; // Using new success variant
      case "Non conforme":
        return "destructive";
      case "En cours":
        return "warning"; // Using new warning variant
      default:
        return "outline";
    }
  };

  const getCheckpointStatusBadgeVariant = (status: InspectionCheckpoint['status']) => { // Corrected type here
    switch (status) {
      case "OK":
        return "success";
      case "NOK":
        return "destructive";
      case "N/A":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Inspections</h1>
        <AddInspectionDialog />
      </div>

      <Card className="glass rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle>Liste des Inspections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher une inspection..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {filteredInspections.length === 0 && inspections.length > 0 && (
            <p className="text-muted-foreground">
              Aucune inspection ne correspond à votre recherche.
            </p>
          )}
          {inspections.length === 0 ? (
            <p className="text-muted-foreground">
              Aucune inspection enregistrée pour le moment. Cliquez sur "Ajouter une inspection" pour commencer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Inspecteur</TableHead>
                  <TableHead>Statut Global</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.map((inspection) => (
                  <TableRow key={inspection.id}>
                    <TableCell className="font-medium">{getVehicleDetails(inspection.vehicleLicensePlate)}</TableCell>
                    <TableCell>{format(new Date(inspection.date), "PPP", { locale: fr })}</TableCell>
                    <TableCell>{inspection.inspectorName}</TableCell>
                    <TableCell>
                      <CustomBadge variant={getOverallStatusBadgeVariant(inspection.overallStatus)}>
                        {inspection.overallStatus}
                      </CustomBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => setViewingInspection(inspection)} title="Voir les détails">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <EditInspectionDialog
                          inspection={inspection}
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
                                Cette action ne peut pas être annulée. Cela supprimera définitivement cette inspection de votre liste.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteInspection(inspection)}>
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

      {viewingInspection && (
        <Dialog open={!!viewingInspection} onOpenChange={() => setViewingInspection(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass rounded-2xl animate-slideUp">
            <DialogHeader>
              <DialogTitle>Détails de l'inspection</DialogTitle>
              <DialogDescription>
                Inspection du véhicule {getVehicleDetails(viewingInspection.vehicleLicensePlate)} par {viewingInspection.inspectorName} le {format(new Date(viewingInspection.date), "PPP", { locale: fr })}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p><strong>Statut Global :</strong> <CustomBadge variant={getOverallStatusBadgeVariant(viewingInspection.overallStatus)}>{viewingInspection.overallStatus}</CustomBadge></p>
              <h4 className="font-semibold text-md mt-2">Points de contrôle :</h4>
              <div className="grid gap-2">
                {viewingInspection.checkpoints.map((cp, idx) => (
                  <div key={idx} className="border p-2 rounded-md">
                    <p><strong>{cp.name} :</strong> <CustomBadge variant={getCheckpointStatusBadgeVariant(cp.status)}>{cp.status}</CustomBadge></p>
                    {cp.observation && <p className="text-sm text-muted-foreground mt-1">Observations : {cp.observation}</p>}
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InspectionsPage;