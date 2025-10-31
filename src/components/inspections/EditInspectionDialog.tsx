"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
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
import { Pencil, CalendarIcon, Loader2 } from "lucide-react"; // Import Loader2
import { useFleet } from "@/context/FleetContext";
import { Inspection, InspectionCheckpoint } from "@/types/inspection";
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
import InspectionCheckpointForm from "./InspectionCheckpointForm";

const checkpointSchema = z.object({
  name: z.string(),
  status: z.enum(["OK", "NOK", "N/A"], {
    message: "Veuillez sélectionner un statut pour le point de contrôle.",
  }),
  observation: z.string().optional(),
});

const formSchema = z.object({
  id: z.string(),
  vehicleLicensePlate: z.string().min(1, {
    message: "Veuillez sélectionner une plaque d'immatriculation.",
  }),
  date: z.string().min(1, {
    message: "Veuillez sélectionner une date d'inspection.",
  }),
  inspectorName: z.string().min(2, {
    message: "Le nom de l'inspecteur doit contenir au moins 2 caractères.",
  }),
  checkpoints: z.array(checkpointSchema).min(1, {
    message: "Au moins un point de contrôle est requis.",
  }).refine(
    (checkpoints) => checkpoints.every((cp) => cp.status !== undefined),
    { message: "Tous les points de contrôle doivent avoir un statut." }
  ),
});

type EditInspectionFormValues = z.infer<typeof formSchema>;

interface EditInspectionDialogProps {
  inspection: Inspection;
}

const EditInspectionDialog: React.FC<EditInspectionDialogProps> = ({ inspection }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // Add loading state
  const { editInspection, vehicles } = useFleet();

  const form = useForm<EditInspectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: inspection,
  });

  React.useEffect(() => {
    form.reset(inspection);
  }, [inspection, form]);

  const onSubmit = async (values: EditInspectionFormValues) => { // Make onSubmit async
    setIsSubmitting(true); // Set loading to true
    try {
      const overallStatus: Inspection['overallStatus'] = values.checkpoints.some(cp => cp.status === "NOK")
        ? "Non conforme"
        : "Conforme";

      const updatedInspection: Inspection = {
        id: values.id,
        vehicleLicensePlate: values.vehicleLicensePlate,
        date: values.date,
        inspectorName: values.inspectorName,
        checkpoints: values.checkpoints as InspectionCheckpoint[],
        overallStatus: overallStatus,
      };
      await editInspection(inspection, updatedInspection); // Await the async operation
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to edit inspection:", error);
    } finally {
      setIsSubmitting(false); // Set loading to false
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass rounded-2xl animate-scaleIn">
        <DialogHeader>
          <DialogTitle>Modifier l'inspection</DialogTitle>
          <DialogDescription>
            Mettez à jour les détails de l'inspection et évaluez les points de contrôle.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
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
              name="inspectorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'inspecteur</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date d'inspection</FormLabel>
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

            <h3 className="text-lg font-semibold mt-4 mb-2">Points de contrôle</h3>
            <div className="grid gap-4">
              {form.watch("checkpoints").map((checkpoint, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`checkpoints.${index}`}
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <InspectionCheckpointForm index={index} checkpoint={checkpoint as InspectionCheckpoint} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Button type="submit" className="w-full mt-4 hover:animate-hover-lift gradient-brand text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Pencil className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default EditInspectionDialog;