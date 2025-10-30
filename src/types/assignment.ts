export interface Assignment {
  id: string;
  vehicleLicensePlate: string;
  driverLicenseNumber: string;
  startDate: string; // Format ISO string, e.g., "YYYY-MM-DD"
  endDate: string; // Format ISO string, e.g., "YYYY-MM-DD"
  status: "Active" | "Terminée" | "Planifiée";
}