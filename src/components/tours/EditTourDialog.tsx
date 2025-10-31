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
import { Tour } from "@/types/tour";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(2, {
    message: "Le nom de la tournée doit contenir au moins 2 caractères.",
  }),
  description: z.string().optional(),
  vehicleLicensePlate: z.string().min(1, {
    message: "Veuillez sélectionner une plaque d'immatriculation.",
  }),
  driverLicenseNumber: z.string().min(1, {
    message: "Veuillez sélectionner un numéro de permis.",
  }),
  startDate: z.string().min(1, {
    message: "Veuillez sélectionner une date de début.",
  }),
  endDate: z.string().min(1, {
    message: "Veuillez sélectionner une date de fin.",
  }),
  startOdometer: z.coerce.number().min(0, {
    message: "Le kilométrage de début doit être un nombre positif.",
  }),
  endOdometer: z.coerce.number().min(0, {
    message: "Le kilométrage de fin doit être un nombre positif.",
  }).nullable(),
  status: z.enum(["Planifiée", "En cours", "Terminée", "Annulée"], {
    message: "Veuillez sélectionner un statut valide.",
  }),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "La date de fin ne peut pas être antérieure à la date de début.",
  path: ["endDate"],
}).refine((data) => {
  if (data.status === "Terminée" && data.endOdometer === null) {
    return false;
  }
  return true;
}, {
  message: "Le kilométrage de fin est requis pour une tournée terminée.",
  path: ["endOdometer"],
}).refine((data) => {
  if (data.status === "Terminée" && data.endOdometer !== null && data.endOdometer < data.startOdometer) {
    return false;
  }
  return true;
}, {
  message: "Le kilométrage de fin ne peut pas être inférieur au kilométrage de début.",
  path: ["endOdometer"],
});

type EditTourFormValues = z.infer<typeof formSchema>;

interface EditTourDialogProps {
  tour: Tour;
}

const EditTourDialog: React.FC<EditTourDialogProps> = ({ tour }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { editTour, vehicles, drivers } = useFleet();
  const form = useForm<EditTourFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: tour,
  });

  React.useEffect(() => {
    form.reset(tour);
  }, [tour, form]);

  const onSubmit = (values: EditTourFormValues) => {
    try {
      editTour(tour, values as Tour);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to edit tour:", error);
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
      <DialogContent className="sm:max-w-[425px] glass rounded-2xl animate-scaleIn">
        <DialogHeader>
          <DialogTitle>Modifier la tournée</DialogTitle>
          <DialogDescription>
            Mettez à jour les détails de la tournée ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la tournée</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="driverLicenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de permis du conducteur</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un permis" />
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
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de début</FormLabel>
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
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de fin</FormLabel>
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
              name="startOdometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kilométrage de début (Km)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endOdometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kilométrage de fin (Km) (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value === null ? "" : field.value}
                      onChange={e => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                    />
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
                      <SelectItem value="Planifiée">Planifiée</SelectItem>
                      <SelectItem value="En cours">En cours</SelectItem>
                      <SelectItem value="Terminée">Terminée</SelectItem>
                      <SelectItem value="Annulée">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-4 hover:animate-hover-lift gradient-brand text-primary-foreground">Enregistrer les modifications</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTourDialog;