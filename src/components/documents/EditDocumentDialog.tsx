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
import { Pencil, CalendarIcon } from "lucide-react";
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
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  id: z.string(),
  vehicleLicensePlate: z.string().optional(),
  driverLicenseNumber: z.string().optional(),
  name: z.string().min(2, {
    message: "Le nom du document doit contenir au moins 2 caractères.",
  }),
  type: z.enum(["Assurance", "Vignette", "Visite Technique", "Taxe", "Permis de conduire"], {
    message: "Veuillez sélectionner un type de document valide.",
  }),
  url: z.string().url({
    message: "L'URL du document n'est pas valide.",
  }),
  uploadDate: z.string(),
  issueDate: z.string().min(1, {
    message: "Veuillez sélectionner une date d'émission.",
  }),
  expiryDate: z.string().min(1, {
    message: "Veuillez sélectionner une date d'expiration.",
  }),
}).refine((data) => {
  if (data.issueDate && data.expiryDate) {
    return new Date(data.expiryDate) >= new Date(data.issueDate);
  }
  return true;
}, {
  message: "La date d'expiration ne peut pas être antérieure à la date d'émission.",
  path: ["expiryDate"],
});

type EditDocumentFormValues = z.infer<typeof formSchema>;

interface EditDocumentDialogProps {
  document: Document;
}

const EditDocumentDialog: React.FC<EditDocumentDialogProps> = ({ document }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { editDocument, vehicles, drivers } = useFleet();
  const form = useForm<EditDocumentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...document,
      vehicleLicensePlate: document.vehicleLicensePlate || "",
      driverLicenseNumber: document.driverLicenseNumber || "",
    },
  });

  React.useEffect(() => {
    form.reset({
      ...document,
      vehicleLicensePlate: document.vehicleLicensePlate || "",
      driverLicenseNumber: document.driverLicenseNumber || "",
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
        issueDate: values.issueDate,
        expiryDate: values.expiryDate,
        vehicleLicensePlate: values.vehicleLicensePlate === "" ? undefined : values.vehicleLicensePlate,
        driverLicenseNumber: values.driverLicenseNumber === "" ? undefined : values.driverLicenseNumber,
      };
      editDocument(document, updatedDocument);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to edit document:", error);
    }
  };

  const availableLicensePlates = vehicles.map(v => v.licensePlate);
  const availableDriverLicenses = drivers.map(d => d.licenseNumber);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass rounded-2xl animate-slideUp">
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
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Aucun véhicule" />
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
              name="driverLicenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de permis du conducteur (optionnel)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Aucun conducteur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
                      <SelectItem value="Permis de conduire">Permis de conduire</SelectItem>
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
            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date d'émission</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date d'expiration</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-4 hover:animate-hover-lift">Enregistrer les modifications</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDocumentDialog;