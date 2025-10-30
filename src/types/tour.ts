export interface Tour {
  id: string;
  name: string;
  description?: string;
  vehicleLicensePlate: string;
  driverLicenseNumber: string;
  startDate: string; // Format ISO string, e.g., "YYYY-MM-DD"
  endDate: string; // Format ISO string, e.g., "YYYY-MM-DD"
  startOdometer: number; // Kilométrage au début de la tournée
  endOdometer: number | null; // Kilométrage à la fin de la tournée (peut être null si en cours)
  status: "Planifiée" | "En cours" | "Terminée" | "Annulée";
}