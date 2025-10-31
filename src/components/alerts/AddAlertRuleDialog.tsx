"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2 } from "lucide-react"; // Import Loader2
import { useFleet } from "@/context/FleetContext";
import { AlertRule } from "@/types/alertRule";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom de la règle doit contenir au moins 2 caractères.",
  }),
  type: z.enum(["MaintenanceDue", "DocumentExpiry", "VehicleAssignmentEnd", "DriverLicenseExpiry"], {
    message: "Veuillez sélectionner un type de règle valide.",
  }),
  message: z.string().min(5, {
    message: "Le message d'alerte doit contenir au moins 5 caractères.",
  }),
  status: z.enum(["Active", "Inactive"], {
    message: "Veuillez sélectionner un statut valide.",
  }),
  // Critères conditionnels
  vehicleLicensePlate: z.string().optional(),
  driverLicenseNumber: z.string().optional(),
  thresholdValue: z.coerce.number().optional(),
  thresholdUnit: z.enum(["km", "days", "months"]).optional(),
  maintenanceType: z.enum(["Préventive", "Corrective", "Inspection"]).optional(),
  documentType: z.enum(["Assurance", "Vignette", "Visite Technique", "Taxe"]).optional(),
}).superRefine((data, ctx) => {
  if (data.type === "MaintenanceDue") {
    if (!data.vehicleLicensePlate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La plaque d'immatriculation du véhicule est requise pour ce type d'alerte.",
        path: ["vehicleLicensePlate"],
      });
    }
    if (!data.maintenanceType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le type de maintenance est requis pour ce type d'alerte.",
        path: ["maintenanceType"],
      });
    }
    if (data.thresholdValue === undefined || data.thresholdValue === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La valeur du seuil est requise pour ce type d'alerte.",
        path: ["thresholdValue"],
      });
    }
    if (!data.thresholdUnit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'unité du seuil est requise pour ce type d'alerte.",
        path: ["thresholdUnit"],
      });
    }
  }
  if (data.type === "DocumentExpiry") {
    if (!data.vehicleLicensePlate && !data.driverLicenseNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Une plaque d'immatriculation ou un numéro de permis est requis pour ce type d'alerte.",
        path: ["vehicleLicensePlate"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Une plaque d'immatriculation ou un numéro de permis est requis pour ce type d'alerte.",
        path: ["driverLicenseNumber"],
      });
    }
    if (!data.documentType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le type de document est requis pour ce type d'alerte.",
        path: ["documentType"],
      });
    }
    if (data.thresholdValue === undefined || data.thresholdValue === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La valeur du seuil (jours avant expiration) est requise pour ce type d'alerte.",
        path: ["thresholdValue"],
      });
    }
    if (data.thresholdUnit !== "days") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'unité du seuil doit être 'days' pour ce type d'alerte.",
        path: ["thresholdUnit"],
      });
    }
  }
  if (data.type === "VehicleAssignmentEnd") {
    if (!data.vehicleLicensePlate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La plaque d'immatriculation du véhicule est requise pour ce type d'alerte.",
        path: ["vehicleLicensePlate"],
      });
    }
    if (data.thresholdValue === undefined || data.thresholdValue === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La valeur du seuil (jours avant fin) est requise pour ce type d'alerte.",
        path: ["thresholdValue"],
      });
    }
    if (data.thresholdUnit !== "days") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'unité du seuil doit être 'days' pour ce type d'alerte.",
        path: ["thresholdUnit"],
      });
    }
  }
  if (data.type === "DriverLicenseExpiry") {
    if (!data.driverLicenseNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le numéro de permis du conducteur est requis pour ce type d'alerte.",
        path: ["driverLicenseNumber"],
      });
    }
    if (data.thresholdValue === undefined || data.thresholdValue === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La valeur du seuil (jours avant expiration) est requise pour ce type d'alerte.",
        path: ["thresholdValue"],
      });
    }
    if (data.thresholdUnit !== "days") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'unité du seuil doit être 'days' pour ce type d'alerte.",
        path: ["thresholdUnit"],
      });
    }
  }
});

type AddAlertRuleFormValues = z.infer<typeof formSchema>;

const AddAlertRuleDialog: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // Add loading state
  const { addAlertRule, vehicles, drivers } = useFleet();

  const form = useForm<AddAlertRuleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "MaintenanceDue",
      message: "",
      status: "Active",
      vehicleLicensePlate: undefined,
      driverLicenseNumber: undefined,
      thresholdValue: 7,
      thresholdUnit: "days",
      maintenanceType: "Préventive",
      documentType: "Assurance",
    },
  });

  const selectedType = form.watch("type");
  // const selectedThresholdUnit = form.watch("thresholdUnit"); // Removed unused variable

  const onSubmit = async (values: AddAlertRuleFormValues) => { // Make onSubmit async
    setIsSubmitting(true); // Set loading to true
    try {
      const newAlertRule: Omit<AlertRule, 'id' | 'lastTriggered'> = {
        name: values.name,
        type: values.type,
        message: values.message,
        status: values.status,
        criteria: {
          vehicleLicensePlate: values.vehicleLicensePlate,
          driverLicenseNumber: values.driverLicenseNumber,
          thresholdValue: values.thresholdValue,
          thresholdUnit: values.thresholdUnit,
          maintenanceType: values.maintenanceType,
          documentType: values.documentType,
        },
      };
      await addAlertRule(newAlertRule); // Await the async operation
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to add alert rule:", error);
    } finally {
      setIsSubmitting(false); // Set loading to false
    }
  };

  const availableLicensePlates = vehicles.map(v => v.licensePlate);
  const availableDriverLicenses = drivers.map(d => d.licenseNumber);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="hover:animate-hover-lift gradient-warning text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une règle d'alerte
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass rounded-2xl animate-scaleIn">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle règle d'alerte</DialogTitle>
          <DialogDescription>
            Définissez les critères pour déclencher des notifications automatiques.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la règle</FormLabel>
                  <FormControl>
                    <Input placeholder="Alerte maintenance pneus" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'alerte</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type d'alerte" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MaintenanceDue">Maintenance due</SelectItem>
                      <SelectItem value="DocumentExpiry">Expiration de document</SelectItem>
                      <SelectItem value="VehicleAssignmentEnd">Fin d'affectation véhicule</SelectItem>
                      <SelectItem value="DriverLicenseExpiry">Expiration permis conducteur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message d'alerte</FormLabel>
                  <FormControl>
                    <Textarea placeholder="La maintenance des pneus est due pour le véhicule..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(selectedType === "MaintenanceDue" || selectedType === "VehicleAssignmentEnd" || selectedType === "DocumentExpiry") && (
              <FormField
                control={form.control}
                name="vehicleLicensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plaque d'immatriculation du véhicule (optionnel)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "__NONE_SELECTED__" ? undefined : value)}
                      value={field.value || "__NONE_SELECTED__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les véhicules ou sélectionner un spécifique" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__NONE_SELECTED__">Tous les véhicules</SelectItem>
                        {availableLicensePlates.map((plate) => (
                          <SelectItem key={plate} value={plate}>
                            {plate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(selectedType === "DriverLicenseExpiry" || selectedType === "DocumentExpiry") && (
              <FormField
                control={form.control}
                name="driverLicenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de permis du conducteur (optionnel)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "__NONE_SELECTED__" ? undefined : value)}
                      value={field.value || "__NONE_SELECTED__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les conducteurs ou sélectionner un spécifique" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__NONE_SELECTED__">Tous les conducteurs</SelectItem>
                        {availableDriverLicenses.map((license) => (
                          <SelectItem key={license} value={license}>
                            {license}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedType === "MaintenanceDue" && (
              <FormField
                control={form.control}
                name="maintenanceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de maintenance</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type de maintenance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Préventive">Préventive</SelectItem>
                        <SelectItem value="Corrective">Corrective</SelectItem>
                        <SelectItem value="Inspection">Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedType === "DocumentExpiry" && (
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de document</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type de document" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Assurance">Assurance</SelectItem>
                        <SelectItem value="Vignette">Vignette</SelectItem>
                        <SelectItem value="Visite Technique">Visite Technique</SelectItem>
                        <SelectItem value="Taxe">Taxe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(selectedType === "MaintenanceDue" || selectedType === "DocumentExpiry" || selectedType === "VehicleAssignmentEnd" || selectedType === "DriverLicenseExpiry") && (
              <>
                <FormField
                  control={form.control}
                  name="thresholdValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valeur du seuil</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="7" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="thresholdUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unité du seuil</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une unité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="days">Jours</SelectItem>
                          <SelectItem value="km">Kilomètres</SelectItem>
                          <SelectItem value="months">Mois</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" className="w-full mt-4 hover:animate-hover-lift gradient-warning text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? "Ajout en cours..." : "Ajouter la règle"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlertRuleDialog;