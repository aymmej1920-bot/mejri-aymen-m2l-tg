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
import { Driver } from "@/types/driver";

const DriversPage = () => {
  const { drivers, deleteDriver } = useFleet(); // Utilisez le contexte pour les conducteurs et la fonction de suppression

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Conducteurs</h1>
        <AddDriverDialog /> {/* Le composant AddDriverDialog gérera l'ajout via le contexte */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Conducteurs</CardTitle>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <p className="text-muted-foreground">
              Aucun conducteur enregistré pour le moment. Cliquez sur "Ajouter un conducteur" pour commencer.
            </p>
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
                {drivers.map((driver, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{driver.firstName}</TableCell>
                    <TableCell>{driver.lastName}</TableCell>
                    <TableCell>{driver.licenseNumber}</TableCell>
                    <TableCell>{driver.phoneNumber}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <EditDriverDialog
                          driver={driver}
                          // La fonction onEditDriver sera gérée par le composant EditDriverDialog lui-même via le contexte
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
                              <AlertDialogAction onClick={() => deleteDriver(driver)}>
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

export default DriversPage;