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
import { Document } from "@/types/document";
import { format } from "date-fns";

const formSchema = z.object({
  vehicleLicensePlate: z.string().optional(),
  name: z.string().min(2, {
    message: "Le nom du document doit contenir au moins 2 caractères.",
  }),
  type: z.enum(["Assurance", "Vignette", "Visite Technique", "Taxe"], {
    message: "Veuillez sélectionner un type de document valide.",
  }),
  url: z.string().url({
    message: "L'URL du document n'est pas valide.",
  }),
});

type AddDocumentFormValues = z.infer<typeof formSchema>;

const AddDocumentDialog: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { addDocument, vehicles } = useFleet();
  const form = useForm<AddDocumentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleLicensePlate: "", // La valeur par défaut est une chaîne vide
      name: "",
      type: "Assurance",
      url: "",
    },
  });

  const onSubmit = (values: AddDocumentFormValues) => {
    try {
      const newDocument: Omit<Document, 'id'> = {
        name: values.name,
        type: values.type,
        url: values.url,
        uploadDate: format(new Date(), "yyyy-MM-dd"),
        vehicleLicensePlate: values.vehicleLicensePlate === "" ? undefined : values.vehicleLicensePlate,
      };
      addDocument(newDocument);
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to add document:", error);
    }
  };

  const availableLicensePlates = vehicles.map(v => v.licensePlate);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau document</DialogTitle>
          <DialogDescription>
            Remplissez les détails du document ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="vehicleLicensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plaque d'immatriculation du véhicule (optionnel)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}> {/* Utilisez value pour contrôler le Select */}
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Aucun véhicule" /> {/* Placeholder pour l'état vide */}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Pas de SelectItem avec value="" ici */}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du document</FormLabel>
                  <FormControl>
                    <Input placeholder="Contrat d'assurance" {...field} />
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
                  <FormLabel>Type de document</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
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
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL du document</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/document.pdf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-4">Ajouter le document</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDocumentDialog;