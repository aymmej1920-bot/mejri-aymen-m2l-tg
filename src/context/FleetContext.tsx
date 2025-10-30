"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Vehicle } from "@/types/vehicle";
import { Driver } from "@/types/driver";
import { Maintenance } from "@/types/maintenance";
import { FuelEntry } from "@/types/fuel";
import { Assignment } from "@/types/assignment";
import { MaintenancePlan } from "@/types/maintenancePlan";
import { Document } from "@/types/document";
import { Tour } from "@/types/tour"; // Importez le type Tour
import { showSuccess, showError } from "@/utils/toast";
import { v4 as uuidv4 } from "uuid";
import { addMonths, addYears, addDays, parseISO, format } from "date-fns";

interface FleetContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Vehicle) => void;
  editVehicle: (originalVehicle: Vehicle, updatedVehicle: Vehicle) => void;
  deleteVehicle: (vehicleToDelete: Vehicle) => void;
  drivers: Driver[];
  addDriver: (driver: Driver) => void;
  editDriver: (originalDriver: Driver, updatedDriver: Driver) => void;
  deleteDriver: (driverToDelete: Driver) => void;
  maintenances: Maintenance[];
  addMaintenance: (maintenance: Omit<Maintenance, 'id'>) => void;
  editMaintenance: (originalMaintenance: Maintenance, updatedMaintenance: Maintenance) => void;
  deleteMaintenance: (maintenanceToDelete: Maintenance) => void;
  fuelEntries: FuelEntry[];
  addFuelEntry: (fuelEntry: Omit<FuelEntry, 'id'>) => void;
  editFuelEntry: (originalFuelEntry: FuelEntry, updatedFuelEntry: FuelEntry) => void;
  deleteFuelEntry: (fuelEntryToDelete: FuelEntry) => void;
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
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
  tours: Tour[]; // Ajoutez l'état des tournées
  addTour: (tour: Omit<Tour, 'id'>) => void; // Ajoutez la fonction d'ajout de tournée
  editTour: (originalTour: Tour, updatedTour: Tour) => void; // Ajoutez la fonction de modification de tournée
  deleteTour: (tourToDelete: Tour) => void; // Ajoutez la fonction de suppression de tournée
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

  const clearAllData = () => {
    setVehicles([]);
    setDrivers([]);
    setMaintenances([]);
    setFuelEntries([]);
    setAssignments([]);
    setMaintenancePlans([]);
    setDocuments([]);
    setTours([]); // Effacez aussi les tournées
    if (typeof window !== "undefined") {
      localStorage.removeItem("fleet-vehicles");
      localStorage.removeItem("fleet-drivers");
      localStorage.removeItem("fleet-maintenances");
      localStorage.removeItem("fleet-fuel-entries");
      localStorage.removeItem("fleet-assignments");
      localStorage.removeItem("fleet-maintenance-plans");
      localStorage.removeItem("fleet-documents");
      localStorage.removeItem("fleet-tours"); // Supprimez du localStorage
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
        tours, // Exposez les tournées
        addTour, // Exposez les fonctions de tournée
        editTour,
        deleteTour,
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