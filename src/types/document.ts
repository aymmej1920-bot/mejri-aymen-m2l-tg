export interface Document {
  id: string;
  vehicleLicensePlate?: string; // Lien vers un véhicule (optionnel, si le document est lié à un véhicule)
  name: string; // Nom du document (ex: "Contrat d'assurance")
  type: string; // Type de document (ex: "Assurance", "Carte Grise", "Facture")
  url: string; // URL vers le document stocké (sera géré par Supabase Storage plus tard)
  uploadDate: string; // Date d'upload (format ISO string)
}