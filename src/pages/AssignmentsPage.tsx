"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddAssignmentDialog from "@/components/assignments/AddAssignmentDialog";
import EditAssignmentDialog from "@/components/assignments/EditAssignmentDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Users } from "lucide-react";
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
import { Assignment } from "@/types/assignment";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const AssignmentsPage = () => {
  const { assignments, deleteAssignment, vehicles, drivers } = useFleet();
  const [searchTerm, setSearchTerm] = React.useState("");

  const getVehicleDetails = (licensePlate: string) => {
    const vehicle = vehicles.find(v => v.licensePlate === licensePlate);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${licensePlate})` : licensePlate;
  };

  const getDriverDetails = (licenseNumber: string) => {
    const driver = drivers.find(d => d.licenseNumber === licenseNumber);
    return driver ? `${driver.firstName} ${driver.lastName} (${licenseNumber})` : licenseNumber;
  };

  const filteredAssignments = assignments.filter((assignment) =>
    Object.values(assignment).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    getVehicleDetails(assignment.vehicleLicensePlate).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDriverDetails(assignment.driverLicenseNumber).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Affectations</h1>
        <AddAssignmentDialog />
      </div>

      <Card className="glass rounded-2xl">
        <CardHeader>
          <CardTitle>Liste des Affectations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher une affectation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {filteredAssignments.length === 0 && assignments.length > 0 && (
            <p className="text-muted-foreground">
              Aucune affectation ne correspond à votre recherche.
            </p>
          )}
          {assignments.length === 0 ? (
            <p className="text-muted-foreground">
              Aucune affectation enregistrée pour le moment. Cliquez sur "Ajouter une affectation" pour commencer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Conducteur</TableHead>
                  <TableHead>Date de début</TableHead>
                  <TableHead>Date de fin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{getVehicleDetails(assignment.vehicleLicensePlate)}</TableCell>
                    <TableCell>{getDriverDetails(assignment.driverLicenseNumber)}</TableCell>
                    <TableCell>{format(new Date(assignment.startDate), "PPP", { locale: fr })}</TableCell>
                    <TableCell>{format(new Date(assignment.endDate), "PPP", { locale: fr })}</TableCell>
                    <TableCell>{assignment.status}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <EditAssignmentDialog
                          assignment={assignment}
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
                                Cette action ne peut pas être annulée. Cela supprimera définitivement cette affectation de votre liste.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteAssignment(assignment)}>
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

export default AssignmentsPage;