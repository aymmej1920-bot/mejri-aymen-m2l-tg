"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddAlertRuleDialog from "@/components/alerts/AddAlertRuleDialog";
import EditAlertRuleDialog from "@/components/alerts/EditAlertRuleDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, BellRing } from "lucide-react";
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
import { AlertRule } from "@/types/alertRule";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const AlertsPage = () => {
  const { alertRules, deleteAlertRule, vehicles, drivers } = useFleet();
  const [searchTerm, setSearchTerm] = React.useState("");

  const getVehicleDetails = (licensePlate: string | undefined) => {
    if (!licensePlate) return "N/A";
    const vehicle = vehicles.find(v => v.licensePlate === licensePlate);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${licensePlate})` : licensePlate;
  };

  const getDriverDetails = (licenseNumber: string | undefined) => {
    if (!licenseNumber) return "N/A";
    const driver = drivers.find(d => d.licenseNumber === licenseNumber);
    return driver ? `${driver.firstName} ${driver.lastName} (${licenseNumber})` : licenseNumber;
  };

  const getCriteriaSummary = (rule: AlertRule) => {
    let summary = "";
    if (rule.criteria.vehicleLicensePlate) {
      summary += `Véhicule: ${rule.criteria.vehicleLicensePlate} `;
    }
    if (rule.criteria.driverLicenseNumber) {
      summary += `Conducteur: ${rule.criteria.driverLicenseNumber} `;
    }
    if (rule.criteria.maintenanceType) {
      summary += `Type maintenance: ${rule.criteria.maintenanceType} `;
    }
    if (rule.criteria.documentType) {
      summary += `Type document: ${rule.criteria.documentType} `;
    }
    if (rule.criteria.thresholdValue !== undefined && rule.criteria.thresholdUnit) {
      summary += `Seuil: ${rule.criteria.thresholdValue} ${rule.criteria.thresholdUnit}`;
    }
    return summary.trim() || "N/A";
  };

  const filteredAlertRules = alertRules.filter((rule) =>
    Object.values(rule).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    getCriteriaSummary(rule).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Règles d'Alerte</h1>
        <AddAlertRuleDialog />
      </div>

      <Card className="glass rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Liste des Règles d'Alerte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher une règle d'alerte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {filteredAlertRules.length === 0 && alertRules.length > 0 && (
            <p className="text-muted-foreground">
              Aucune règle d'alerte ne correspond à votre recherche.
            </p>
          )}
          {alertRules.length === 0 ? (
            <p className="text-muted-foreground">
              Aucune règle d'alerte enregistrée pour le moment. Cliquez sur "Ajouter une règle d'alerte" pour commencer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Critères</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernier déclenchement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlertRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{getCriteriaSummary(rule)}</TableCell>
                    <TableCell>{rule.message}</TableCell>
                    <TableCell>
                      <Badge variant={rule.status === "Active" ? "default" : "secondary"}>
                        {rule.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rule.lastTriggered ? format(new Date(rule.lastTriggered), "PPP", { locale: fr }) : "Jamais"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <EditAlertRuleDialog
                          alertRule={rule}
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
                                Cette action ne peut pas être annulée. Cela supprimera définitivement cette règle d'alerte.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteAlertRule(rule)}>
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

export default AlertsPage;