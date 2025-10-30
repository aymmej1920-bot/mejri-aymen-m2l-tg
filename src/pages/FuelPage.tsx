"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddFuelEntryDialog from "@/components/fuel/AddFuelEntryDialog";
import EditFuelEntryDialog from "@/components/fuel/EditFuelEntryDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Fuel } from "lucide-react";
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
import { FuelEntry } from "@/types/fuel";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const FuelPage = () => {
  const { fuelEntries, deleteFuelEntry } = useFleet();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredFuelEntries = fuelEntries.filter((entry) =>
    Object.values(entry).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion du Carburant</h1>
        <AddFuelEntryDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Ravitaillements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher un ravitaillement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {filteredFuelEntries.length === 0 && fuelEntries.length > 0 && (
            <p className="text-muted-foreground">
              Aucun ravitaillement ne correspond à votre recherche.
            </p>
          )}
          {fuelEntries.length === 0 ? (
            <p className="text-muted-foreground">
              Aucun ravitaillement enregistré pour le moment. Cliquez sur "Ajouter un ravitaillement" pour commencer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plaque Véhicule</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type Carburant</TableHead>
                  <TableHead>Volume (L)</TableHead>
                  <TableHead>Coût (TND)</TableHead>
                  <TableHead>Kilométrage (Km)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFuelEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.vehicleLicensePlate}</TableCell>
                    <TableCell>{format(new Date(entry.date), "PPP", { locale: fr })}</TableCell>
                    <TableCell>{entry.fuelType}</TableCell>
                    <TableCell>{entry.volume.toFixed(2)}</TableCell>
                    <TableCell>{entry.cost.toFixed(2)}</TableCell>
                    <TableCell>{entry.odometerReading}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <EditFuelEntryDialog
                          fuelEntry={entry}
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
                                Cette action ne peut pas être annulée. Cela supprimera définitivement ce ravitaillement de votre liste.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteFuelEntry(entry)}>
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

export default FuelPage;