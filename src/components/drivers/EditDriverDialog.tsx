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
import { Driver } from "@/types/driver";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères.",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  licenseNumber: z.string().min(5, {
    message: "Le numéro de permis doit contenir au moins 5 caractères.",
  }),
  phoneNumber: z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, {
    message: "Le numéro de téléphone n'est pas valide.",
  }),
});

interface EditDriverDialogProps {
  driver: Driver;
  // Plus besoin de onEditDriver en prop, car le contexte gère la modification
}

const EditDriverDialog: React.FC<EditDriverDialogProps> = ({ driver }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { editDriver } = useFleet(); // Utilisez le contexte pour la fonction editDriver
  const form = useForm<Driver>({
    resolver: zodResolver(formSchema),
    defaultValues: driver,
  });

  React.useEffect(() => {
    form.reset(driver);
  }, [driver, form]);

  const onSubmit = (values: Driver) => {
    try {
      editDriver(driver, values); // Appelez la fonction du contexte, en passant l'original et le mis à jour
      setIsOpen(false);
    } catch (error) {
      // showError est déjà géré dans le contexte, mais on peut logguer ici si besoin
      console.error("Failed to edit driver:", error);
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
          <DialogTitle>Modifier le conducteur</DialogTitle>
          <DialogDescription>
            Mettez à jour les détails du conducteur ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de permis</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de téléphone</FormLabel>
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

export default EditDriverDialog;