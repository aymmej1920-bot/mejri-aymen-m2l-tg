"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from "react";
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
import { showSuccess, showError } from "@/utils/toast";
import { v4 as uuidv4 } from "uuid";
import { addMonths, addYears, addDays, parseISO, format, differenceInDays, isBefore } from "date-fns";
import { fr } from "date-fns/locale";

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

  const [alertRules, setAlertRules] = useState<AlertRule[]>(() => {
    if (typeof window !== "undefined") {
      const savedAlertRules = localStorage.getItem("fleet-alert-rules");
      return savedAlertRules ? JSON.parse(savedAlertRules) : [];
    }
    return [];
  });

  const triggeredAlertsRef = useRef<Set<string>>(new Set());

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fleet-alert-rules", JSON.stringify(alertRules));
    }
  }, [alertRules]);

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

  const editInspection = (originalInspection: Inspection, updatedInspection: Inspection) => {
    setInspections((prev) =>
      prev.map((i) => (i.id === originalInspection.id ? updatedInspection : i))
    );
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

  const deleteInspection = (inspectionToDelete: Inspection) => {
    setInspections((prev) => prev.filter((i) => i.id !== inspectionToDelete.id));
    showSuccess("Inspection supprimée avec succès !");
  };

  const addAlertRule = (newRule: Omit<AlertRule, 'id' | 'lastTriggered'>) => {
    const ruleWithId = { ...newRule, id: uuidv4(), lastTriggered: null };
    setAlertRules((prev) => [...prev, ruleWithId]);
    showSuccess("Règle d'alerte ajoutée avec succès !");
  };

  const editAlertRule = (originalRule: AlertRule, updatedRule: AlertRule) => {
    setAlertRules((prev) =>
      prev.map((r) => (r.id === originalRule.id ? updatedRule : r))
    );
    showSuccess("Règle d'alerte modifiée avec succès !");
  };

  const deleteAlertRule = (ruleToDelete: AlertRule) => {
    setAlertRules((prev) => prev.filter((r) => r.id !== ruleToDelete.id));
    showSuccess("Règle d'alerte supprimée avec succès !");
  };

  const checkAlerts = React.useCallback(() => {
    const now = new Date();
    alertRules.filter(rule => rule.status === "Active").forEach(rule => {
      let shouldTrigger = false;
      let alertMessage = rule.message;
      const alertId = `${rule.id}-${format(now, 'yyyy-MM-dd')}`; // Unique ID for daily alerts

      // Prevent duplicate alerts for the same rule on the same day
      if (triggeredAlertsRef.current.has(alertId)) {
        return;
      }

      switch (rule.type) {
        case "MaintenanceDue":
          maintenancePlans.filter(plan =>
            (!rule.criteria.vehicleLicensePlate || plan.vehicleLicensePlate === rule.criteria.vehicleLicensePlate) &&
            (!rule.criteria.maintenanceType || plan.type === rule.criteria.maintenanceType) &&
            plan.status === "Actif" &&
            plan.nextDueDate
          ).forEach(plan => {
            const nextDueDate = parseISO(plan.nextDueDate!);
            const daysUntilDue = differenceInDays(nextDueDate, now);

            if (rule.criteria.thresholdUnit === "days" && rule.criteria.thresholdValue !== undefined && daysUntilDue <= rule.criteria.thresholdValue && daysUntilDue >= 0) {
              shouldTrigger = true;
              alertMessage = `Maintenance "${plan.description}" pour le véhicule ${plan.vehicleLicensePlate} est due dans ${daysUntilDue} jours.`;
            }
            // TODO: Add mileage-based checks if odometer readings are available
          });
          break;

        case "DocumentExpiry":
          documents.filter(doc =>
            (!rule.criteria.vehicleLicensePlate || doc.vehicleLicensePlate === rule.criteria.vehicleLicensePlate) &&
            (!rule.criteria.driverLicenseNumber || doc.driverLicenseNumber === rule.criteria.driverLicenseNumber) &&
            (!rule.criteria.documentType || doc.type === rule.criteria.documentType) &&
            doc.expiryDate
          ).forEach(doc => {
            const expiryDate = parseISO(doc.expiryDate);
            const daysUntilExpiry = differenceInDays(expiryDate, now);

            if (rule.criteria.thresholdUnit === "days" && rule.criteria.thresholdValue !== undefined && daysUntilExpiry <= rule.criteria.thresholdValue && daysUntilExpiry >= 0) {
              shouldTrigger = true;
              alertMessage = `Le document "${doc.name}" (${doc.type}) pour ${doc.vehicleLicensePlate || doc.driverLicenseNumber} expire dans ${daysUntilExpiry} jours.`;
            }
          });
          break;

        case "VehicleAssignmentEnd":
          assignments.filter(assign =>
            (!rule.criteria.vehicleLicensePlate || assign.vehicleLicensePlate === rule.criteria.vehicleLicensePlate) &&
            assign.status === "Active" &&
            assign.endDate
          ).forEach(assign => {
            const endDate = parseISO(assign.endDate);
            const daysUntilEnd = differenceInDays(endDate, now);

            if (rule.criteria.thresholdUnit === "days" && rule.criteria.thresholdValue !== undefined && daysUntilEnd <= rule.criteria.thresholdValue && daysUntilEnd >= 0) {
              shouldTrigger = true;
              alertMessage = `L'affectation du véhicule ${assign.vehicleLicensePlate} se termine dans ${daysUntilEnd} jours.`;
            }
          });
          break;

        case "DriverLicenseExpiry":
          drivers.filter(driver =>
            (!rule.criteria.driverLicenseNumber || driver.licenseNumber === rule.criteria.driverLicenseNumber) &&
            documents.some(doc => doc.driverLicenseNumber === driver.licenseNumber && doc.type === "Permis de conduire" && doc.expiryDate)
          ).forEach(driver => {
            const licenseDoc = documents.find(doc => doc.driverLicenseNumber === driver.licenseNumber && doc.type === "Permis de conduire" && doc.expiryDate);
            if (licenseDoc) {
              const expiryDate = parseISO(licenseDoc.expiryDate);
              const daysUntilExpiry = differenceInDays(expiryDate, now);

              if (rule.criteria.thresholdUnit === "days" && rule.criteria.thresholdValue !== undefined && daysUntilExpiry <= rule.criteria.thresholdValue && daysUntilExpiry >= 0) {
                shouldTrigger = true;
                alertMessage = `Le permis de conduire de ${driver.firstName} ${driver.lastName} expire dans ${daysUntilExpiry} jours.`;
              }
            }
          });
          break;
      }

      if (shouldTrigger) {
        showError(alertMessage);
        triggeredAlertsRef.current.add(alertId);
        setAlertRules(prevRules =>
          prevRules.map(r => r.id === rule.id ? { ...r, lastTriggered: format(now, 'yyyy-MM-dd') } : r)
        );
      }
    });
  }, [alertRules, maintenancePlans, documents, assignments, drivers]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkAlerts();
    }, 60 * 60 * 1000);

    checkAlerts();

    return () => clearInterval(interval);
  }, [checkAlerts]);

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
        alertRules,
        addAlertRule,
        editAlertRule,
        deleteAlertRule,
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