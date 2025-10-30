export interface Alert {
  id: string; // Unique ID for the alert instance
  ruleId: string; // ID of the rule that generated this alert
  message: string;
  type: "MaintenanceDue" | "DocumentExpiry" | "VehicleAssignmentEnd" | "DriverLicenseExpiry" | "Custom";
  createdAt: string; // ISO string, e.g., "YYYY-MM-DDTHH:mm:ssZ"
  isRead: boolean;
}