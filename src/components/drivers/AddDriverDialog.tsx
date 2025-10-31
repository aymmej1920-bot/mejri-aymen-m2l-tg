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

interface AddDriverDialogProps {}

const AddDriverDialog: React.FC<AddDriverDialogProps> = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { addDriver } = useFleet();
  const form = useForm<Driver>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      licenseNumber: "",
      phoneNumber: "",
    },
  });

  const onSubmit = (values: Driver) => {
    try {
      addDriver(values);
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to add driver:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="hover:animate-hover-lift">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un conducteur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass rounded-2xl animate-scaleIn">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau conducteur</DialogTitle>
          <DialogDescription>
            Remplissez les détails du conducteur ci-dessous.
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
                    <Input placeholder="Jean" {...field} />
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
                    <Input placeholder="Dupont" {...field} />
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
                    <Input placeholder="ABC12345" {...field} />
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
                    <Input placeholder="+33 6 12 34 56 78" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-4 hover:animate-hover-lift gradient-brand text-primary-foreground">Ajouter</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDriverDialog;