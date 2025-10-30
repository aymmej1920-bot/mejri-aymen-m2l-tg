export interface FuelEntry {
  id: string;
  vehicleLicensePlate: string;
  date: string; // Format ISO string, e.g., "YYYY-MM-DD"
  fuelType: string; // e.g., "Essence", "Diesel"
  volume: number; // Liters
  cost: number; // TND
  odometerReading: number; // Kilometers
}