export interface Maintenance {
  id: string;
  vehicleLicensePlate: string;
  type: "Préventive" | "Corrective" | "Inspection";
  description: string;
  cost: number;
  date: string; // Format ISO string, e.g., "YYYY-MM-DD"
  provider: string;
  status: "Planifiée" | "En cours" | "Terminée";
}