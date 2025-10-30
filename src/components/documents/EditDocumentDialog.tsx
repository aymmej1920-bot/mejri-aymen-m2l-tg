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
  id: z.string(),
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
  uploadDate: z.string(),
});

type EditDocumentFormValues = z.infer<typeof formSchema>;

interface EditDocumentDialogProps {
  document: Document;
}

const EditDocumentDialog: React.FC<EditDocumentDialogProps> = ({ document }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { editDocument, vehicles } = useFleet();
  const form = useForm<EditDocumentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...document,
      vehicleLicensePlate: document.vehicleLicensePlate || "", // Assurez-vous que c'est une chaîne vide si undefined
    },
  });

  React.useEffect(() => {
    form.reset({
      ...document,
      vehicleLicensePlate: document.vehicleLicensePlate || "",
    });
  }, [document, form]);

  const onSubmit = (values: EditDocumentFormValues) => {
    try {
      const updatedDocument: Document = {
        id: values.id,
        name: values.name,
        type: values.type,
        url: values.url,
        uploadDate: values.uploadDate,
        vehicleLicensePlate: values.vehicleLicensePlate === "" ? undefined : values.vehicleLicensePlate,
      };
      editDocument(document, updatedDocument);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to edit document:", error);
    }
  };

  const availableLicensePlates = vehicles.map(v => v.licensePlate);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le document</DialogTitle>
          <DialogDescription>
            Mettez à jour les détails du document ci-dessous.
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
                    <Input {...field} />
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

export default EditDocumentDialog;