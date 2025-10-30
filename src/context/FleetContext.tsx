"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Vehicle } from "@/types/vehicle";
import { Driver } from "@/types/driver";
import { Maintenance } from "@/types/maintenance";
import { FuelEntry } from "@/types/fuel";
import { Assignment } => void;
  editAssignment: (originalAssignment: Assignment, updatedAssignment: Assignment) => void;
  deleteAssignment: (assignmentToDelete: Assignment) => void;
  maintenancePlans: MaintenancePlan[];
  addMaintenancePlan: (plan: Omit<MaintenancePlan, 'id' | 'lastGeneratedDate' | 'nextDueDate'>) => void;
  editMaintenancePlan: (originalPlan: MaintenancePlan, updatedPlan: MaintenancePlan) => void;
  deleteMaintenancePlan: (planToDelete: MaintenancePlan) => void;
  generateMaintenanceFromPlan: (plan: MaintenancePlan) => void;
  documents: Document[];
  addDocument: (document: Omit<Document, 'id'>) => void;
  editDocument: (originalDocument: Document, updatedDocument: Document) => void;
  deleteDocument: (documentToDelete: Document) => void;
  tours: Tour[];
  addTour: (tour: Omit<Tour, 'id'>) => void;
  editTour: (originalTour: Tour, updatedTour: Tour) => void;
  deleteTour: (tourToDelete: Tour) => void;
  inspections: Inspection[];
  addInspection: (inspection: Omit<Inspection, 'id'>) => void;
  editInspection: (originalInspection: Inspection, updatedInspection: Inspection) => void;
  deleteInspection: (inspectionToDelete: Inspection) => void;
  clearAllData: () => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    if (typeof window !== "undefined") {
      const savedVehicles = localStorage.getItem("fleet-vehicles");
      return savedVehicles ? JSON.parse(savedVehicles) : [];
    }
    return [];
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    if (typeof window !== "undefined") {
      const savedDrivers = localStorage.getItem("fleet-drivers");
      return savedDrivers ? JSON.parse(savedDrivers) : [];
    }
    return [];
  });

  const [maintenances, setMaintenances] = useState<Maintenance[]>(() => {
    if (typeof window !== "undefined") {
      const savedMaintenances = localStorage.getItem("fleet-maintenances");
      return savedMaintenances ? JSON.parse(savedMaintenances) : [];
    }
    return [];
  });

  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(() => {
    if (typeof window !== "undefined") {
      const savedFuelEntries = localStorage.getItem("fleet-fuel-entries");
      return savedFuelEntries ? JSON.parse(savedFuelEntries) : [];
    }
    return [];
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    if (typeof window !== "undefined") {
      const savedAssignments = localStorage.getItem("fleet-assignments");
      return savedAssignments ? JSON.parse(savedAssignments) : [];
    }
    return [];
  });

  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>(() => {
    if (typeof window !== "undefined") {
      const savedPlans = localStorage.getItem("fleet-maintenance-plans");
      return savedPlans ? JSON.parse(savedPlans) : [];
    }
    return [];
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    if (typeof window !== "undefined") {
      const savedDocuments = localStorage.getItem("fleet-documents");
      return savedDocuments ? JSON.parse(savedDocuments) : [];
    }
    return [];
  });

  const [tours, setTours] = useState<Tour[]>(() => {
    if (typeof window !== "undefined") {
      const savedTours = localStorage.getItem("fleet-tours");
      return savedTours ? JSON.parse(savedTours) : [];
    }
    return [];
  });

  const [inspections, setInspections] = useState<Inspection[]>(() => {
    if (typeof window !== "undefined") {
      const savedInspections = localStorage.getItem("fleet-inspections");
      return savedInspections ? JSON.parse(savedInspections) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fleet-vehicles", JSON.stringify(vehicles));
    }
  }, [vehicles]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fleet-drivers", JSON.stringify(drivers));
    }
  }, [drivers]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fleet-maintenances", JSON.stringify(maintenances));
    }
  }, [maintenances]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fleet-fuel-entries", JSON.stringify(fuelEntries));
    }
  }, [fuelEntries]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fleet-assignments", JSON.stringify(assignments));
    }
  }, [assignments]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fleet-maintenance-plans", JSON.stringify(maintenancePlans));
    }
  }, [maintenancePlans]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fleet-documents", JSON.stringify(documents));
    }
  }, [documents]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fleet-tours", JSON.stringify(tours));
    }
  }, [tours]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fleet-inspections", JSON.stringify(inspections));
    }
  }, [inspections]);

  const addVehicle = (newVehicle: Vehicle) => {
    setVehicles((prev) => [...prev, newVehicle]);
    showSuccess("Véhicule ajouté avec succès !");
  };

  const editVehicle = (originalVehicle: Vehicle, updatedVehicle: Vehicle) => {
    setVehicles((prev) =>
      prev.map((v) => (v === originalVehicle ? updatedVehicle : v))
    );
    showSuccess("Véhicule modifié avec succès !");
  };

  const deleteVehicle = (vehicleToDelete: Vehicle) => {
    setVehicles((prev) => prev.filter((v) => v !== vehicleToDelete));
    showSuccess("Véhicule supprimé avec succès !");
  };

  const addDriver = (newDriver: Driver) => {
    setDrivers((prev) => [...prev, newDriver]);
    showSuccess("Conducteur ajouté avec succès !");
  };

  const editDriver = (originalDriver: Driver, updatedDriver: Driver) => {
    setDrivers((prev) =>
      prev.map((d) => (d === originalDriver ? updatedDriver : d))
    );
    showSuccess("Conducteur modifié avec succès !");
  };

  const deleteDriver = (driverToDelete: Driver) => {
    setDrivers((prev) => prev.filter((d) => d !== driverToDelete));
    showSuccess("Conducteur supprimé avec succès !");
  };

  const addMaintenance = (newMaintenance: Omit<Maintenance, 'id'>) => {
    const maintenanceWithId = { ...newMaintenance, id: uuidv4() };
    setMaintenances((prev) => [...prev, maintenanceWithId]);
    showSuccess("Maintenance ajoutée avec succès !");
  };

  const editMaintenance = (originalMaintenance: Maintenance, updatedMaintenance: Maintenance) => {
    setMaintenances((prev) =>
      prev.map((m) => (m.id === originalMaintenance.id ? updatedMaintenance : m))
    );
    showSuccess("Maintenance modifiée avec succès !");
  };

  const deleteMaintenance = (maintenanceToDelete: Maintenance) => {
    setMaintenances((prev) => prev.filter((m) => m.id !== maintenanceToDelete.id));
    showSuccess("Maintenance supprimée avec succès !");
  };

  const addFuelEntry = (newFuelEntry: Omit<FuelEntry, 'id'>) => {
    const fuelEntryWithId = { ...newFuelEntry, id: uuidv4() };
    setFuelEntries((prev) => [...prev, fuelEntryWithId]);
    showSuccess("Entrée de carburant ajoutée avec succès !");
  };

  const editFuelEntry = (originalFuelEntry: FuelEntry, updatedFuelEntry: FuelEntry) => {
    setFuelEntries((prev) =>
      prev.map((f) => (f.id === originalFuelEntry.id ? updatedFuelEntry : f))
    );
    showSuccess("Entrée de carburant modifiée avec succès !");
  };

  const deleteFuelEntry = (fuelEntryToDelete: FuelEntry) => {
    setFuelEntries((prev) => prev.filter((f) => f.id !== fuelEntryToDelete.id));
    showSuccess("Entrée de carburant supprimée avec succès !");
  };

  const addAssignment = (newAssignment: Omit<Assignment, 'id'>) => {
    const assignmentWithId = { ...newAssignment, id: uuidv4() };
    setAssignments((prev) => [...prev, assignmentWithId]);
    showSuccess("Affectation ajoutée avec succès !");
  };

  const editAssignment = (originalAssignment: Assignment, updatedAssignment: Assignment) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === originalAssignment.id ? updatedAssignment : a))
    );
    showSuccess("Affectation modifiée avec succès !");
  };

  const deleteAssignment = (assignmentToDelete: Assignment) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentToDelete.id));
    showSuccess("Affectation supprimée avec succès !");
  };

  const addMaintenancePlan = (newPlan: Omit<MaintenancePlan, 'id' | 'lastGeneratedDate' | 'nextDueDate'>) => {
    const today = format(new Date(), "yyyy-MM-dd");
    let nextDueDate: string | null = null;

    if (newPlan.intervalType === "Temps") {
      const futureDate = addMonths(new Date(), newPlan.intervalValue);
      nextDueDate = format(futureDate, "yyyy-MM-dd");
    }

    const planWithId: MaintenancePlan = {
      ...newPlan,
      id: uuidv4(),
      lastGeneratedDate: null,
      nextDueDate: nextDueDate,
    };
    setMaintenancePlans((prev) => [...prev, planWithId]);
    showSuccess("Plan de maintenance ajouté avec succès !");
  };

  const editMaintenancePlan = (originalPlan: MaintenancePlan, updatedPlan: MaintenancePlan) => {
    setMaintenancePlans((prev) =>
      prev.map((p) => (p.id === originalPlan.id ? updatedPlan : p))
    );
    showSuccess("Plan de maintenance modifié avec succès !");
  };

  const deleteMaintenancePlan = (planToDelete: MaintenancePlan) => {
    setMaintenancePlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
    showSuccess("Plan de maintenance supprimé avec succès !");
  };

  const generateMaintenanceFromPlan = (plan: MaintenancePlan) => {
    const today = format(new Date(), "yyyy-MM-dd");

    const newMaintenance: Omit<Maintenance, 'id'> = {
      vehicleLicensePlate: plan.vehicleLicensePlate,
      type: plan.type,
      description: `Maintenance générée par plan: ${plan.description}`,
      cost: plan.estimatedCost,
      date: today,
      provider: plan.provider,
      status: "Planifiée",
    };

    addMaintenance(newMaintenance);

    let nextDueDate: string | null = null;
    if (plan.intervalType === "Temps") {
      const lastDate = new Date(today);
      const futureDate = addMonths(lastDate, plan.intervalValue);
      nextDueDate = format(futureDate, "yyyy-MM-dd");
    }

    const updatedPlan: MaintenancePlan = {
      ...plan,
      lastGeneratedDate: today,
      nextDueDate: nextDueDate,
      status: "Actif",
    };
    editMaintenancePlan(plan, updatedPlan);
    showSuccess(`Maintenance générée pour le véhicule ${plan.vehicleLicensePlate} !`);
  };

  const addDocument = (newDocument: Omit<Document, 'id'>) => {
    const documentWithId = { ...newDocument, id: uuidv4() };
    setDocuments((prev) => [...prev, documentWithId]);
    showSuccess("Document ajouté avec succès !");
  };

  const editDocument = (originalDocument: Document, updatedDocument: Document) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === originalDocument.id ? updatedDocument : d))
    );
    showSuccess("Document modifié avec succès !");
  };

  const deleteDocument = (documentToDelete: Document) => {
    setDocuments((prev) => prev.filter((d) => d.id !== documentToDelete.id));
    showSuccess("Document supprimé avec succès !");
  };

  const addTour = (newTour: Omit<Tour, 'id'>) => {
    const tourWithId = { ...newTour, id: uuidv4() };
    setTours((prev) => [...prev, tourWithId]);
    showSuccess("Tournée ajoutée avec succès !");
  };

  const editTour = (originalTour: Tour, updatedTour: Tour) => {
    setTours((prev) =>
      prev.map((t) => (t.id === originalTour.id ? updatedTour : t))
    );
    showSuccess("Tournée modifiée avec succès !");
  };

  const deleteTour = (tourToDelete: Tour) => {
    setTours((prev) => prev.filter((t) => t.id !== tourToDelete.id));
    showSuccess("Tournée supprimée avec succès !");
  };

  const addInspection = (newInspection: Omit<Inspection, 'id'>) => {
    const inspectionWithId = { ...newInspection, id: uuidv4() };
    setInspections((prev) => [...prev, inspectionWithId]);
    showSuccess("Inspection ajoutée avec succès !");

    // Générer des tâches de maintenance corrective pour les points "NOK"
    newInspection.checkpoints.forEach(cp => {
      if (cp.status === "NOK") {
        addMaintenance({
          vehicleLicensePlate: newInspection.vehicleLicensePlate,
          type: "Corrective",
          description: `Maintenance corrective requise suite à l'inspection du ${format(new Date(newInspection.date), "PPP", { locale: fr })} - Point: ${cp.name}. Observation: ${cp.observation || "Aucune"}.`,
          cost: 0, // Coût initial à 0, à mettre à jour lors de la planification
          date: format(new Date(), "yyyy-MM-dd"),
          provider: "À définir",
          status: "Planifiée",
        });
      }
    });
  };

  const editInspection = (originalInspection: Inspection, updatedInspection: Inspection) => {
    setInspections((prev) =>
      prev.map((i) => (i.id === originalInspection.id ? updatedInspection : i))
    );
    showSuccess("Inspection modifiée avec succès !");

    // Re-évaluer et générer des tâches de maintenance corrective si nécessaire
    updatedInspection.checkpoints.forEach(cp => {
      // Si un point est NOK et qu'il n'y avait pas de maintenance corrective pour ce point spécifique de cette inspection
      // (Simplification: pour l'instant, on génère une nouvelle tâche si NOK, sans vérifier les doublons complexes)
      if (cp.status === "NOK") {
        addMaintenance({
          vehicleLicensePlate: updatedInspection.vehicleLicensePlate,
          type: "Corrective",
          description: `Maintenance corrective requise suite à la modification de l'inspection du ${format(new Date(updatedInspection.date), "PPP", { locale: fr })} - Point: ${cp.name}. Observation: ${cp.observation || "Aucune"}.`,
          cost: 0,
          date: format(new Date(), "yyyy-MM-dd"),
          provider: "À définir",
          status: "Planifiée",
        });
      }
    });
  };

  const deleteInspection = (inspectionToDelete: Inspection) => {
    setInspections((prev) => prev.filter((i) => i.id !== inspectionToDelete.id));
    showSuccess("Inspection supprimée avec succès !");
  };

  const clearAllData = () => {
    setVehicles([]);
    setDrivers([]);
    setMaintenances([]);
    setFuelEntries([]);
    setAssignments([]);
    setMaintenancePlans([]);
    setDocuments([]);
    setTours([]);
    setInspections([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("fleet-vehicles");
      localStorage.removeItem("fleet-drivers");
      localStorage.removeItem("fleet-maintenances");
      localStorage.removeItem("fleet-fuel-entries");
      localStorage.removeItem("fleet-assignments");
      localStorage.removeItem("fleet-maintenance-plans");
      localStorage.removeItem("fleet-documents");
      localStorage.removeItem("fleet-tours");
      localStorage.removeItem("fleet-inspections");
    }
    showSuccess("Toutes les données de la flotte ont été effacées !");
  };

  return (
    <FleetContext.Provider
      value={{
        vehicles,
        addVehicle,
        editVehicle,
        deleteVehicle,
        drivers,
        addDriver,
        editDriver,
        deleteDriver,
        maintenances,
        addMaintenance,
        editMaintenance,
        deleteMaintenance,
        fuelEntries,
        addFuelEntry,
        editFuelEntry,
        deleteFuelEntry,
        assignments,
        addAssignment,
        editAssignment,
        deleteAssignment,
        maintenancePlans,
        addMaintenancePlan,
        editMaintenancePlan,
        deleteMaintenancePlan,
        generateMaintenanceFromPlan,
        documents,
        addDocument,
        editDocument,
        deleteDocument,
        tours,
        addTour,
        editTour,
        deleteTour,
        inspections,
        addInspection,
        editInspection,
        deleteInspection,
        clearAllData,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (context === undefined) {
    throw new Error("useFleet must be used within a FleetProvider");
  }
  return context;
};