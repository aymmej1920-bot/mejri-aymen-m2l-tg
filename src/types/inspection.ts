export interface InspectionCheckpoint {
  name: string;
  status: "OK" | "NOK" | "N/A"; // OK, Not OK, Not Applicable
  observation?: string;
}

export interface Inspection {
  id: string;
  vehicleLicensePlate: string;
  date: string; // Format ISO string, e.g., "YYYY-MM-DD"
  inspectorName: string;
  checkpoints: InspectionCheckpoint[];
  overallStatus: "Conforme" | "Non conforme" | "En cours"; // Déduit des checkpoints
}