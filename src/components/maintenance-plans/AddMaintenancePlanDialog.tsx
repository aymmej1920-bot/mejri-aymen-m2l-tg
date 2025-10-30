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
import { PlusCircle } from "lucide-react";
import { useFleet } from "@/context/FleetContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaintenancePlan } from "@/types/maintenancePlan";

const formSchema = z.object({
  vehicleLicensePlate: z.string().min(1, {
    message: "Veuillez sélectionner une plaque d'immatriculation.",
  }),
  type: z.enum(["Préventive", "Corrective", "Inspection"], {
    message: "Veuillez sélectionner un type de maintenance valide.",
  }),
  description: z.string().min(5, {
    message: "La description doit contenir au moins 5 caractères.",
  }),
  intervalType: z.enum(["Kilométrage", "Temps"], {
    message: "Veuillez sélectionner un type d'intervalle valide.",
  }),
  intervalValue: z.coerce.number().min(1, {
    message: "La valeur de l'intervalle doit être un nombre positif.",
  }),
  estimatedCost: z.coerce.number().min(0, {
    message: "Le coût estimé doit être un nombre positif.",
  }),
  provider: z.string().min(2, {
    message: "Le fournisseur doit contenir au moins 2 caractères.",
  }),
  status: z.enum(["Actif", "Inactif"], {
    message: "Veuillez sélectionner un statut valide.",
  }),
});

const AddMaintenancePlanDialog: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { addMaintenancePlan, vehicles } = useFleet();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleLicensePlate: "",
      type: "Préventive",
      description: "",
      intervalType: "Temps",
      intervalValue: 1,
      estimatedCost: 0,
      provider: "",
      status: "Actif",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      addMaintenancePlan(values as Omit<MaintenancePlan, 'id' | 'lastGeneratedDate' | 'nextDueDate'>);
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to add maintenance plan:", error);
    }
  };

  const availableLicensePlates = vehicles.map(v => v.licensePlate);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un plan de maintenance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass rounded-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau plan de maintenance</DialogTitle>
          <DialogDescription>
            Remplissez les détails du plan de maintenance ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="vehicleLicensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plaque d'immatriculation du véhicule</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une plaque" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de maintenance</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Changement d'huile, révision des freins..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="intervalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'intervalle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type d'intervalle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Kilométrage">Kilométrage</SelectItem>
                      <SelectItem value="Temps">Temps (Mois)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="intervalValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valeur de l'intervalle ({form.watch("intervalType") === "Kilométrage" ? "Km" : "Mois"})</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coût estimé (TND)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fournisseur habituel</FormLabel>
                  <FormControl>
                    <Input placeholder="Garage XYZ" {...field} />
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
                  <FormLabel>Statut du plan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Actif">Actif</SelectItem>
                      <SelectItem value="Inactif">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-4">Ajouter le plan</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaintenancePlanDialog;