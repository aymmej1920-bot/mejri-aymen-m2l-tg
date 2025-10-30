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
import { Pencil } from "lucide-react";
import { useFleet } from "@/context/FleetContext"; // Importez le hook useFleet
import { Vehicle } from "@/types/vehicle";

const formSchema = z.object({
  make: z.string().min(2, {
    message: "La marque doit contenir au moins 2 caractères.",
  }),
  model: z.string().min(2, {
    message: "Le modèle doit contenir au moins 2 caractères.",
  }),
  year: z.string().regex(/^\d{4}$/, {
    message: "L'année doit être un nombre à 4 chiffres.",
  }),
  licensePlate: z.string().min(4, {
    message: "La plaque d'immatriculation doit contenir au moins 4 caractères.",
  }),
});

interface EditVehicleDialogProps {
  vehicle: Vehicle;
  // Plus besoin de onEditVehicle en prop, car le contexte gère la modification
}

const EditVehicleDialog: React.FC<EditVehicleDialogProps> = ({ vehicle }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { editVehicle } = useFleet(); // Utilisez le contexte pour la fonction editVehicle
  const form = useForm<Vehicle>({
    resolver: zodResolver(formSchema),
    defaultValues: vehicle,
  });

  React.useEffect(() => {
    form.reset(vehicle);
  }, [vehicle, form]);

  const onSubmit = (values: Vehicle) => {
    try {
      editVehicle(vehicle, values); // Appelez la fonction du contexte, en passant l'original et le mis à jour
      setIsOpen(false);
    } catch (error) {
      // showError est déjà géré dans le contexte, mais on peut logguer ici si besoin
      console.error("Failed to edit vehicle:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le véhicule</DialogTitle>
          <DialogDescription>
            Mettez à jour les détails du véhicule ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marque</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modèle</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Année</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plaque d'immatriculation</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-4">Enregistrer les modifications</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVehicleDialog;