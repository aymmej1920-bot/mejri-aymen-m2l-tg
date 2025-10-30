export interface MaintenancePlan {
  id: string;
  vehicleLicensePlate: string;
  type: "Préventive" | "Corrective" | "Inspection";
  description: string;
  intervalType: "Kilométrage" | "Temps"; // Basé sur le kilométrage ou le temps
  intervalValue: number; // Valeur de l'intervalle (ex: 10000 km ou 6 mois)
  lastGeneratedDate: string | null; // Date de la dernière maintenance générée (format ISO string)
  nextDueDate: string | null; // Date d'échéance calculée (format ISO string)
  status: "Actif" | "Inactif";
  estimatedCost: number; // Coût estimé pour la maintenance du plan
  provider: string; // Fournisseur habituel pour ce type de maintenance
}