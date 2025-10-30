export type AlertRuleType = "MaintenanceDue" | "DocumentExpiry" | "VehicleAssignmentEnd" | "DriverLicenseExpiry";
export type AlertRuleStatus = "Active" | "Inactive";

export interface AlertRule {
  id: string;
  name: string;
  type: AlertRuleType;
  message: string;
  status: AlertRuleStatus;
  criteria: {
    vehicleLicensePlate?: string; // Pour les alertes liées à un véhicule spécifique
    driverLicenseNumber?: string; // Pour les alertes liées à un conducteur spécifique
    thresholdValue?: number; // Ex: kilométrage restant, jours restants
    thresholdUnit?: "km" | "days" | "months"; // Unité du seuil
    maintenanceType?: "Préventive" | "Corrective" | "Inspection"; // Pour les alertes de maintenance
    documentType?: "Assurance" | "Vignette" | "Visite Technique" | "Taxe"; // Pour les alertes de document
  };
  lastTriggered?: string | null; // Date de la dernière fois que l'alerte a été déclenchée (ISO string)
}