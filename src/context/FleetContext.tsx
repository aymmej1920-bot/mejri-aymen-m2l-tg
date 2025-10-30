"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { Vehicle } from "@/types/vehicle";
import { Driver } from "@/types/driver";
import { Maintenance } from "@/types/maintenance";
import { FuelEntry } from "@/types/fuel";
import { Assignment } from "@/types/assignment";
import { MaintenancePlan } from "@/types/maintenancePlan";
import { Document } from "@/types/document";
import { Tour } from "@/types/tour";
import { Inspection } from "@/types/inspection";
import { AlertRule } from "@/types/alertRule";
import { Alert } from "@/types/alert"; // Importez le nouveau type Alert
import { showSuccess } from "@/utils/toast";
import { v4 as uuidv4 } from "uuid";
import { addMonths, format } from "date-fns";
import { fr } from "date-fns/locale";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { useAlertChecker } from "@/hooks/use-alert-checker";

interface FleetContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  editVehicle: (originalVehicle: Vehicle, updatedVehicle: Vehicle) => void;
  deleteVehicle: (vehicleToDelete: Vehicle) => void;
  drivers: Driver[];
  addDriver: (driver: Omit<Driver, 'id'>) => void;
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
  tours: Tour[];
  addTour: (tour: Omit<Tour, 'id'>) => void;
  editTour: (originalTour: Tour, updatedTour: Tour) => void;
  deleteTour: (tourToDelete: Tour) => void;
  inspections: Inspection[];
  addInspection: (inspection: Omit<Inspection, 'id'>) => void;
  editInspection: (originalInspection: Inspection, updatedInspection: Inspection) => void;
  deleteInspection: (inspectionToDelete: Inspection) => void;
  alertRules: AlertRule[];
  addAlertRule: (rule: Omit<AlertRule, 'id' | 'lastTriggered'>) => void;
  editAlertRule: (originalRule: AlertRule, updatedRule: AlertRule) => void;
  deleteAlertRule: (ruleToDelete: AlertRule) => void;
  activeAlerts: Alert[]; // Nouveau : stocke les alertes actives
  addActiveAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'isRead'>) => void; // Nouveau : ajoute une alerte
  markAlertAsRead: (alertId: string) => void; // Nouveau : marque une alerte comme lue
  clearAllAlerts: () => void; // Nouveau : efface toutes les alertes
  clearAllData: () => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { items: vehicles, addItem: addVehicleBase, editItem: editVehicle, deleteItem: deleteVehicle, setItems: setVehicles } = useLocalStorageState<Vehicle>("fleet-vehicles", [], "Véhicule");
  const { items: drivers, addItem: addDriverBase, editItem: editDriver, deleteItem: deleteDriver, setItems: setDrivers } = useLocalStorageState<Driver>("fleet-drivers", [], "Conducteur");
  const { items: maintenances, addItem: addMaintenanceBase, editItem: editMaintenance, deleteItem: deleteMaintenance, setItems: setMaintenances } = useLocalStorageState<Maintenance>("fleet-maintenances", [], "Maintenance");
  const { items: fuelEntries, addItem: addFuelEntryBase, editItem: editFuelEntry, deleteItem: deleteFuelEntry, setItems: setFuelEntries } = useLocalStorageState<FuelEntry>("fleet-fuel-entries", [], "Entrée de carburant");
  const { items: assignments, addItem: addAssignmentBase, editItem: editAssignment, deleteItem: deleteAssignment, setItems: setAssignments } = useLocalStorageState<Assignment>("fleet-assignments", [], "Affectation");
  const { items: maintenancePlans, addItem: addMaintenancePlanBase, editItem: editMaintenancePlan, deleteItem: deleteMaintenancePlan, setItems: setMaintenancePlans } = useLocalStorageState<MaintenancePlan>("fleet-maintenance-plans", [], "Plan de maintenance");
  const { items: documents, addItem: addDocumentBase, editItem: editDocument, deleteItem: deleteDocument, setItems: setDocuments } = useLocalStorageState<Document>("fleet-documents", [], "Document");
  const { items: tours, addItem: addTourBase, editItem: editTour, deleteItem: deleteTour, setItems: setTours } = useLocalStorageState<Tour>("fleet-tours", [], "Tournée");
  const { items: inspections, addItem: addInspectionBase, editItem: editInspection, deleteItem: deleteInspection, setItems: setInspections } = useLocalStorageState<Inspection>("fleet-inspections", [], "Inspection");
  const { items: alertRules, addItem: addAlertRuleBase, editItem: editAlertRule, deleteItem: deleteAlertRule, setItems: setAlertRules } = useLocalStorageState<AlertRule>("fleet-alert-rules", [], "Règle d'alerte");
  const { items: activeAlerts, addItem: addActiveAlertBase, setItems: setActiveAlerts } = useLocalStorageState<Alert>("fleet-active-alerts", [], "Alerte"); // Nouveau : pour les alertes actives

  // Custom add functions to generate IDs
  const addVehicle = (newVehicle: Omit<Vehicle, 'id'>) => {
    addVehicleBase({ ...newVehicle, id: uuidv4() });
  };

  const addDriver = (newDriver: Omit<Driver, 'id'>) => {
    addDriverBase({ ...newDriver, id: uuidv4() });
  };

  const addMaintenance = (newMaintenance: Omit<Maintenance, 'id'>) => {
    addMaintenanceBase({ ...newMaintenance, id: uuidv4() });
  };

  const addFuelEntry = (newFuelEntry: Omit<FuelEntry, 'id'>) => {
    addFuelEntryBase({ ...newFuelEntry, id: uuidv4() });
  };

  const addAssignment = (newAssignment: Omit<Assignment, 'id'>) => {
    addAssignmentBase({ ...newAssignment, id: uuidv4() });
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
    addMaintenancePlanBase(planWithId);
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
    addDocumentBase({ ...newDocument, id: uuidv4() });
  };

  const addTour = (newTour: Omit<Tour, 'id'>) => {
    addTourBase({ ...newTour, id: uuidv4() });
  };

  const addInspection = (newInspection: Omit<Inspection, 'id'>) => {
    const inspectionWithId = { ...newInspection, id: uuidv4() };
    addInspectionBase(inspectionWithId);
    showSuccess("Inspection ajoutée avec succès !");

    newInspection.checkpoints.forEach(cp => {
      if (cp.status === "NOK") {
        addMaintenance({
          vehicleLicensePlate: newInspection.vehicleLicensePlate,
          type: "Corrective",
          description: `Maintenance corrective requise suite à l'inspection du ${format(new Date(newInspection.date), "PPP", { locale: fr })} - Point: ${cp.name}. Observation: ${cp.observation || "Aucune"}.`,
          cost: 0,
          date: format(new Date(), "yyyy-MM-dd"),
          provider: "À définir",
          status: "Planifiée",
        });
      }
    });
  };

  const editInspectionCustom = (originalInspection: Inspection, updatedInspection: Inspection) => {
    editInspection(originalInspection, updatedInspection);
    showSuccess("Inspection modifiée avec succès !");

    updatedInspection.checkpoints.forEach(cp => {
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

  const addAlertRule = (newRule: Omit<AlertRule, 'id' | 'lastTriggered'>) => {
    addAlertRuleBase({ ...newRule, id: uuidv4(), lastTriggered: null });
  };

  // Nouveau : fonctions pour gérer les alertes actives
  const addActiveAlert = (newAlert: Omit<Alert, 'id' | 'createdAt' | 'isRead'>) => {
    const alertWithId: Alert = {
      ...newAlert,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    addActiveAlertBase(alertWithId);
  };

  const markAlertAsRead = (alertId: string) => {
    setActiveAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const clearAllAlerts = () => {
    setActiveAlerts([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("fleet-active-alerts");
    }
    showSuccess("Toutes les alertes ont été effacées !");
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
    setAlertRules([]);
    setActiveAlerts([]); // Efface aussi les alertes actives
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
      localStorage.removeItem("fleet-alert-rules");
      localStorage.removeItem("fleet-active-alerts"); // Efface aussi les alertes actives du localStorage
    }
    showSuccess("Toutes les données de la flotte ont été effacées !");
  };

  // Integrate alert checker
  useAlertChecker({
    alertRules,
    maintenancePlans,
    documents,
    assignments,
    drivers,
    setAlertRules,
    addActiveAlert, // Passe la nouvelle fonction au checker
  });

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
        editInspection: editInspectionCustom,
        deleteInspection,
        alertRules,
        addAlertRule,
        editAlertRule,
        deleteAlertRule,
        activeAlerts, // Expose les alertes actives
        addActiveAlert, // Expose la fonction pour ajouter des alertes
        markAlertAsRead, // Expose la fonction pour marquer comme lue
        clearAllAlerts, // Expose la fonction pour effacer toutes les alertes
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