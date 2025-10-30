"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddDriverDialog from "@/components/drivers/AddDriverDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Driver } from "@/types/driver";

const DriversPage = () => {
  const [drivers, setDrivers] = React.useState<Driver[]>([]);

  const handleAddDriver = (newDriver: Driver) => {
    setDrivers((prevDrivers) => [...prevDrivers, newDriver]);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Conducteurs</h1>
        <AddDriverDialog onAddDriver={handleAddDriver} />
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
                      {/* Les boutons d'action (modifier/supprimer) seront ajoutés ici plus tard */}
                      <span className="text-muted-foreground text-sm">Actions</span>
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