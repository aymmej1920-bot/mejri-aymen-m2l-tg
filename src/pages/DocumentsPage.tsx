"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddDocumentDialog from "@/components/documents/AddDocumentDialog";
import EditDocumentDialog from "@/components/documents/EditDocumentDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Loader2 } from "lucide-react"; // Import Loader2
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useFleet } from "@/context/FleetContext";
import { Document } from "@/types/document";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const DocumentsPage = () => {
  const { documents, deleteDocument, vehicles, drivers } = useFleet();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deletingDocumentId, setDeletingDocumentId] = React.useState<string | null>(null); // Add deleting state

  const getVehicleDetails = (licensePlate: string | undefined) => {
    if (!licensePlate) return "N/A";
    const vehicle = vehicles.find(v => v.licensePlate === licensePlate);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${licensePlate})` : licensePlate;
  };

  const getDriverDetails = (licenseNumber: string | undefined) => {
    if (!licenseNumber) return "N/A";
    const driver = drivers.find(d => d.licenseNumber === licenseNumber);
    return driver ? `${driver.firstName} ${driver.lastName} (${licenseNumber})` : licenseNumber;
  };

  const filteredDocuments = documents.filter((doc) =>
    Object.values(doc).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    getVehicleDetails(doc.vehicleLicensePlate).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDriverDetails(doc.driverLicenseNumber).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (doc: Document) => {
    setDeletingDocumentId(doc.id); // Set deleting item ID
    try {
      await deleteDocument(doc);
    } catch (error) {
      console.error("Failed to delete document:", error);
    } finally {
      setDeletingDocumentId(null); // Reset deleting item ID
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Documents</h1>
        <AddDocumentDialog />
      </div>

      <Card className="glass rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Liste des Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {filteredDocuments.length === 0 && documents.length > 0 && (
            <p className="text-muted-foreground">
              Aucun document ne correspond à votre recherche.
            </p>
          )}
          {documents.length === 0 ? (
            <p className="text-muted-foreground">
              Aucun document enregistré pour le moment. Cliquez sur "Ajouter un document" pour commencer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Conducteur</TableHead>
                  <TableHead>Date d'émission</TableHead>
                  <TableHead>Date d'expiration</TableHead>
                  <TableHead>Date d'upload</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        {doc.name}
                      </a>
                    </TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{getVehicleDetails(doc.vehicleLicensePlate)}</TableCell>
                    <TableCell>{getDriverDetails(doc.driverLicenseNumber)}</TableCell>
                    <TableCell>{format(new Date(doc.issueDate), "PPP", { locale: fr })}</TableCell>
                    <TableCell>{format(new Date(doc.expiryDate), "PPP", { locale: fr })}</TableCell>
                    <TableCell>{format(new Date(doc.uploadDate), "PPP", { locale: fr })}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <EditDocumentDialog
                          document={doc}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action ne peut pas être annulée. Cela supprimera définitivement ce document de votre liste.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(doc)}
                                disabled={deletingDocumentId === doc.id} // Disable if currently deleting this item
                              >
                                {deletingDocumentId === doc.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  "Supprimer"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;