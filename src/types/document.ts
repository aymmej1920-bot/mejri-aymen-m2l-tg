export interface Document {
  id: string;
  vehicleLicensePlate?: string; // Lien vers un véhicule (optionnel, si le document est lié à un véhicule)
  driverLicenseNumber?: string; // Lien vers un conducteur (optionnel, si le document est lié à un conducteur)
  name: string; // Nom du document (ex: "Contrat d'assurance")
  type: "Assurance" | "Vignette" | "Visite Technique" | "Taxe" | "Permis de conduire"; // Type de document (ex: "Assurance", "Carte Grise", "Facture", "Permis de conduire")
  url: string; // URL vers le document stocké (sera géré par Supabase Storage plus tard)
  uploadDate: string; // Date d'upload (format ISO string)
  issueDate: string; // Date d'émission du document (format ISO string)
  expiryDate: string; // Date d'expiration du document (format ISO string)
}