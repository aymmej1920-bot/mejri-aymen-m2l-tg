"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { InspectionCheckpoint } from "@/types/inspection";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils"; // Import cn for conditional classNames

interface InspectionCheckpointFormProps {
  index: number;
  checkpoint: InspectionCheckpoint;
  onRemove?: (index: number) => void; // Optionnel si on ne permet pas de supprimer des checkpoints prédéfinis
}

const predefinedCheckpoints = [
  "Pneus (état, pression)",
  "Freins (plaquettes, disques, liquide)",
  "Niveaux (huile, liquide de refroidissement, lave-glace)",
  "Éclairage (phares, feux stop, clignotants)",
  "Pare-brise et essuie-glaces",
  "Rétroviseurs",
  "Ceintures de sécurité",
  "Klaxon",
  "Extincteur et trousse de secours",
  "Documents du véhicule (carte grise, assurance)",
];

const InspectionCheckpointForm: React.FC<InspectionCheckpointFormProps> = ({ index }) => {
  const { control, watch } = useFormContext();
  const checkpointName = watch(`checkpoints.${index}.name`);
  const checkpointStatus = watch(`checkpoints.${index}.status`);

  return (
    <div className="grid gap-2 border p-3 rounded-md">
      <Label className="font-semibold">{checkpointName}</Label>
      <FormField
        control={control}
        name={`checkpoints.${index}.status`}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>Statut</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem value="OK" />
                  </FormControl>
                  <FormLabel className={cn("font-normal", field.value === "OK" ? "text-success" : "text-foreground")}>OK</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem value="NOK" />
                  </FormControl>
                  <FormLabel className={cn("font-normal", field.value === "NOK" ? "text-destructive" : "text-foreground")}>NOK</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem value="N/A" />
                  </FormControl>
                  <FormLabel className={cn("font-normal", field.value === "N/A" ? "text-muted-foreground" : "text-foreground")}>N/A</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {checkpointStatus === "NOK" && (
        <FormField
          control={control}
          name={`checkpoints.${index}.observation`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observations</FormLabel>
              <FormControl>
                <Textarea placeholder="Détails de l'anomalie..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default InspectionCheckpointForm;