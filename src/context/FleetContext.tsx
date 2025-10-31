"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
import { Alert } from "@/types/alert";
import { showSuccess, showError } from "@/utils/toast";
import { v4 as uuidv4 } from "uuid";
import { addMonths, format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAlertChecker } from "@/hooks/use-alert-checker";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/context/SessionContext';

interface FleetContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  editVehicle: (originalVehicle: Vehicle, updatedVehicle: Vehicle) => Promise<void>;
  deleteVehicle: (vehicleToDelete: Vehicle) => Promise<void>;
  drivers: Driver[];
  addDriver: (driver: Omit<Driver, 'id'>) => Promise<void>;
  editDriver: (originalDriver: Driver, updatedDriver: Driver) => Promise<void>;
  deleteDriver: (driverToDelete: Driver) => Promise<void>;
  maintenances: Maintenance[];
  addMaintenance: (maintenance: Omit<Maintenance, 'id'>) => Promise<void>;
  editMaintenance: (originalMaintenance: Maintenance, updatedMaintenance: Maintenance) => Promise<void>;
  deleteMaintenance: (maintenanceToDelete: Maintenance) => Promise<void>;
  fuelEntries: FuelEntry[];
  addFuelEntry: (fuelEntry: Omit<FuelEntry, 'id'>) => Promise<void>;
  editFuelEntry: (originalFuelEntry: FuelEntry, updatedFuelEntry: FuelEntry) => Promise<void>;
  deleteFuelEntry: (fuelEntryToDelete: FuelEntry) => Promise<void>;
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  editAssignment: (originalAssignment: Assignment, updatedAssignment: Assignment) => Promise<void>;
  deleteAssignment: (assignmentToDelete: Assignment) => Promise<void>;
  maintenancePlans: MaintenancePlan[];
  addMaintenancePlan: (plan: Omit<MaintenancePlan, 'id' | 'lastGeneratedDate' | 'nextDueDate'>) => Promise<void>;
  editMaintenancePlan: (originalPlan: MaintenancePlan, updatedPlan: MaintenancePlan) => Promise<void>;
  deleteMaintenancePlan: (planToDelete: MaintenancePlan) => Promise<void>;
  generateMaintenanceFromPlan: (plan: MaintenancePlan) => Promise<void>;
  documents: Document[];
  addDocument: (document: Omit<Document, 'id'>) => Promise<void>;
  editDocument: (originalDocument: Document, updatedDocument: Document) => Promise<void>;
  deleteDocument: (documentToDelete: Document) => Promise<void>;
  tours: Tour[];
  addTour: (tour: Omit<Tour, 'id'>) => Promise<void>;
  editTour: (originalTour: Tour, updatedTour: Tour) => Promise<void>;
  deleteTour: (tourToDelete: Tour) => Promise<void>;
  inspections: Inspection[];
  addInspection: (inspection: Omit<Inspection, 'id'>) => Promise<void>;
  editInspection: (originalInspection: Inspection, updatedInspection: Inspection) => Promise<void>;
  deleteInspection: (inspectionToDelete: Inspection) => Promise<void>;
  alertRules: AlertRule[];
  addAlertRule: (rule: Omit<AlertRule, 'id' | 'lastTriggered'>) => Promise<void>;
  editAlertRule: (originalRule: AlertRule, updatedRule: AlertRule) => Promise<void>;
  deleteAlertRule: (ruleToDelete: AlertRule) => Promise<void>;
  activeAlerts: Alert[];
  addActiveAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  clearAllAlerts: () => Promise<void>;
  clearAllData: () => Promise<void>;
  isLoadingFleetData: boolean;
  getVehicleByLicensePlate: (licensePlate: string) => Vehicle | undefined;
  getDriverByLicenseNumber: (licenseNumber: string) => Driver | undefined;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading: isLoadingSession } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [isLoadingFleetData, setIsLoadingFleetData] = useState(true);

  // Memoized maps for quick lookups
  const [vehicleMap, setVehicleMap] = useState<Record<string, Vehicle>>({});
  const [driverMap, setDriverMap] = useState<Record<string, Driver>>({});

  // Helper to map snake_case to camelCase for Supabase data (recursive for nested objects)
  const mapToCamelCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => mapToCamelCase(item));
    }
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        newObj[camelKey] = mapToCamelCase(obj[key]); // Recursively map nested objects
      }
    }
    return newObj;
  };

  // Helper to map camelCase to snake_case for Supabase inserts/updates
  const mapToSnakeCase = (obj: any) => {
    if (!obj) return obj;
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        newObj[snakeKey] = obj[key];
      }
    }
    return newObj;
  };

  const fetchFleetData = React.useCallback(async () => {
    if (!user) {
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
      setActiveAlerts([]);
      setVehicleMap({});
      setDriverMap({});
      setIsLoadingFleetData(false);
      return;
    }

    setIsLoadingFleetData(true);
    try {
      const [
        { data: vehiclesData, error: vehiclesError },
        { data: driversData, error: driversError },
        { data: maintenancesData, error: maintenancesError },
        { data: fuelEntriesData, error: fuelEntriesError },
        { data: assignmentsData, error: assignmentsError },
        { data: maintenancePlansData, error: maintenancePlansError },
        { data: documentsData, error: documentsError },
        { data: toursData, error: toursError },
        { data: inspectionsData, error: inspectionsError },
        { data: alertRulesData, error: alertRulesError },
        { data: activeAlertsData, error: activeAlertsError },
      ] = await Promise.all([
        supabase.from('vehicles').select('*'),
        supabase.from('drivers').select('*'),
        supabase.from('maintenances').select('*'),
        supabase.from('fuel_entries').select('*'),
        supabase.from('assignments').select('*'),
        supabase.from('maintenance_plans').select('*'),
        supabase.from('documents').select('*'),
        supabase.from('tours').select('*'),
        supabase.from('inspections').select('*, checkpoints'),
        supabase.from('alert_rules').select('*, criteria'),
        supabase.from('alerts').select('*'),
      ]);

      if (vehiclesError) throw vehiclesError;
      if (driversError) throw driversError;
      if (maintenancesError) throw maintenancesError;
      if (fuelEntriesError) throw fuelEntriesError;
      if (assignmentsError) throw assignmentsError;
      if (maintenancePlansError) throw maintenancePlansError;
      if (documentsError) throw documentsError;
      if (toursError) throw toursError;
      if (inspectionsError) throw inspectionsError;
      if (alertRulesError) throw alertRulesError;
      if (activeAlertsError) throw activeAlertsError;

      const camelCaseVehicles = mapToCamelCase(vehiclesData) as Vehicle[];
      const camelCaseDrivers = mapToCamelCase(driversData) as Driver[];

      setVehicles(camelCaseVehicles);
      setDrivers(camelCaseDrivers);
      setMaintenances(mapToCamelCase(maintenancesData));
      setFuelEntries(mapToCamelCase(fuelEntriesData));
      setAssignments(mapToCamelCase(assignmentsData));
      setMaintenancePlans(mapToCamelCase(maintenancePlansData));
      setDocuments(mapToCamelCase(documentsData));
      setTours(mapToCamelCase(toursData));
      setInspections(mapToCamelCase(inspectionsData));
      setAlertRules(mapToCamelCase(alertRulesData));
      setActiveAlerts(mapToCamelCase(activeAlertsData));

      // Populate maps for quick lookups
      const newVehicleMap = camelCaseVehicles.reduce((acc, v) => {
        acc[v.licensePlate] = v;
        return acc;
      }, {} as Record<string, Vehicle>);
      setVehicleMap(newVehicleMap);

      const newDriverMap = camelCaseDrivers.reduce((acc, d) => {
        acc[d.licenseNumber] = d;
        return acc;
      }, {} as Record<string, Driver>);
      setDriverMap(newDriverMap);

    } catch (error: any) {
      showError("Erreur lors du chargement des données de la flotte : " + error.message);
      console.error("Error fetching fleet data:", error);
    } finally {
      setIsLoadingFleetData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoadingSession) {
      fetchFleetData();
    }
  }, [user, isLoadingSession, fetchFleetData]);

  // Optimized getter functions
  const getVehicleByLicensePlate = React.useCallback((licensePlate: string) => vehicleMap[licensePlate], [vehicleMap]);
  const getDriverByLicenseNumber = React.useCallback((licenseNumber: string) => driverMap[licenseNumber], [driverMap]);

  // --- Vehicles ---
  const addVehicle = async (newVehicle: Omit<Vehicle, 'id'>) => {
    if (!user) { showError("Vous devez être connecté pour ajouter un véhicule."); return; }
    try {
      const { data, error } = await supabase.from('vehicles').insert({ ...mapToSnakeCase(newVehicle), user_id: user.id }).select();
      if (error) throw error;
      const addedVehicle = mapToCamelCase(data[0]);
      setVehicles((prev) => [...prev, addedVehicle]);
      setVehicleMap((prev) => ({ ...prev, [addedVehicle.licensePlate]: addedVehicle }));
      showSuccess("Véhicule ajouté avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout du véhicule : " + error.message);
      console.error("Error adding vehicle:", error);
    }
  };

  const editVehicle = async (originalVehicle: Vehicle, updatedVehicle: Vehicle) => {
    if (!user) { showError("Vous devez être connecté pour modifier un véhicule."); return; }
    try {
      const { data, error } = await supabase.from('vehicles').update(mapToSnakeCase(updatedVehicle)).eq('id', originalVehicle.id).select();
      if (error) throw error;
      const editedVehicle = mapToCamelCase(data[0]);
      setVehicles((prev) => prev.map((item) => (item.id === originalVehicle.id ? editedVehicle : item)));
      setVehicleMap((prev) => {
        const newMap = { ...prev };
        if (originalVehicle.licensePlate !== editedVehicle.licensePlate) {
          delete newMap[originalVehicle.licensePlate];
        }
        newMap[editedVehicle.licensePlate] = editedVehicle;
        return newMap;
      });
      showSuccess("Véhicule modifié avec succès !");
    } catch (error: any) {
      showError("Échec de la modification du véhicule : " + error.message);
      console.error("Error editing vehicle:", error);
    }
  };

  const deleteVehicle = async (vehicleToDelete: Vehicle) => {
    if (!user) { showError("Vous devez être connecté pour supprimer un véhicule."); return; }
    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', vehicleToDelete.id);
      if (error) throw error;
      setVehicles((prev) => prev.filter((item) => item.id !== vehicleToDelete.id));
      setVehicleMap((prev) => {
        const newMap = { ...prev };
        delete newMap[vehicleToDelete.licensePlate];
        return newMap;
      });
      showSuccess("Véhicule supprimé avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression du véhicule : " + error.message);
      console.error("Error deleting vehicle:", error);
    }
  };

  // --- Drivers ---
  const addDriver = async (newDriver: Omit<Driver, 'id'>) => {
    if (!user) { showError("Vous devez être connecté pour ajouter un conducteur."); return; }
    try {
      const { data, error } = await supabase.from('drivers').insert({ ...mapToSnakeCase(newDriver), user_id: user.id }).select();
      if (error) throw error;
      const addedDriver = mapToCamelCase(data[0]);
      setDrivers((prev) => [...prev, addedDriver]);
      setDriverMap((prev) => ({ ...prev, [addedDriver.licenseNumber]: addedDriver }));
      showSuccess("Conducteur ajouté avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout du conducteur : " + error.message);
      console.error("Error adding driver:", error);
    }
  };

  const editDriver = async (originalDriver: Driver, updatedDriver: Driver) => {
    if (!user) { showError("Vous devez être connecté pour modifier un conducteur."); return; }
    try {
      const { data, error } = await supabase.from('drivers').update(mapToSnakeCase(updatedDriver)).eq('id', originalDriver.id).select();
      if (error) throw error;
      const editedDriver = mapToCamelCase(data[0]);
      setDrivers((prev) => prev.map((item) => (item.id === originalDriver.id ? editedDriver : item)));
      setDriverMap((prev) => {
        const newMap = { ...prev };
        if (originalDriver.licenseNumber !== editedDriver.licenseNumber) {
          delete newMap[originalDriver.licenseNumber];
        }
        newMap[editedDriver.licenseNumber] = editedDriver;
        return newMap;
      });
      showSuccess("Conducteur modifié avec succès !");
    } catch (error: any) {
      showError("Échec de la modification du conducteur : " + error.message);
      console.error("Error editing driver:", error);
    }
  };

  const deleteDriver = async (driverToDelete: Driver) => {
    if (!user) { showError("Vous devez être connecté pour supprimer un conducteur."); return; }
    try {
      const { error } = await supabase.from('drivers').delete().eq('id', driverToDelete.id);
      if (error) throw error;
      setDrivers((prev) => prev.filter((item) => item.id !== driverToDelete.id));
      setDriverMap((prev) => {
        const newMap = { ...prev };
        delete newMap[driverToDelete.licenseNumber];
        return newMap;
      });
      showSuccess("Conducteur supprimé avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression du conducteur : " + error.message);
      console.error("Error deleting driver:", error);
    }
  };

  // --- Maintenances ---
  const addMaintenance = async (newMaintenance: Omit<Maintenance, 'id'>) => {
    if (!user) { showError("Vous devez être connecté pour ajouter une maintenance."); return; }
    try {
      const { data, error } = await supabase.from('maintenances').insert({ ...mapToSnakeCase(newMaintenance), user_id: user.id }).select();
      if (error) throw error;
      setMaintenances((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Maintenance ajoutée avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout de la maintenance : " + error.message);
      console.error("Error adding maintenance:", error);
    }
  };

  const editMaintenance = async (originalMaintenance: Maintenance, updatedMaintenance: Maintenance) => {
    if (!user) { showError("Vous devez être connecté pour modifier une maintenance."); return; }
    try {
      const { data, error } = await supabase.from('maintenances').update(mapToSnakeCase(updatedMaintenance)).eq('id', originalMaintenance.id).select();
      if (error) throw error;
      setMaintenances((prev) => prev.map((item) => (item.id === originalMaintenance.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Maintenance modifiée avec succès !");
    } catch (error: any) {
      showError("Échec de la modification de la maintenance : " + error.message);
      console.error("Error editing maintenance:", error);
    }
  };

  const deleteMaintenance = async (maintenanceToDelete: Maintenance) => {
    if (!user) { showError("Vous devez être connecté pour supprimer une maintenance."); return; }
    try {
      const { error } = await supabase.from('maintenances').delete().eq('id', maintenanceToDelete.id);
      if (error) throw error;
      setMaintenances((prev) => prev.filter((item) => item.id !== maintenanceToDelete.id));
      showSuccess("Maintenance supprimée avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression de la maintenance : " + error.message);
      console.error("Error deleting maintenance:", error);
    }
  };

  // --- Fuel Entries ---
  const addFuelEntry = async (newFuelEntry: Omit<FuelEntry, 'id'>) => {
    if (!user) { showError("Vous devez être connecté pour ajouter une entrée de carburant."); return; }
    try {
      const { data, error } = await supabase.from('fuel_entries').insert({ ...mapToSnakeCase(newFuelEntry), user_id: user.id }).select();
      if (error) throw error;
      setFuelEntries((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Entrée de carburant ajoutée avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout de l'entrée de carburant : " + error.message);
      console.error("Error adding fuel entry:", error);
    }
  };

  const editFuelEntry = async (originalFuelEntry: FuelEntry, updatedFuelEntry: FuelEntry) => {
    if (!user) { showError("Vous devez être connecté pour modifier une entrée de carburant."); return; }
    try {
      const { data, error } = await supabase.from('fuel_entries').update(mapToSnakeCase(updatedFuelEntry)).eq('id', originalFuelEntry.id).select();
      if (error) throw error;
      setFuelEntries((prev) => prev.map((item) => (item.id === originalFuelEntry.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Entrée de carburant modifiée avec succès !");
    } catch (error: any) {
      showError("Échec de la modification de l'entrée de carburant : " + error.message);
      console.error("Error editing fuel entry:", error);
    }
  };

  const deleteFuelEntry = async (fuelEntryToDelete: FuelEntry) => {
    if (!user) { showError("Vous devez être connecté pour supprimer une entrée de carburant."); return; }
    try {
      const { error } = await supabase.from('fuel_entries').delete().eq('id', fuelEntryToDelete.id);
      if (error) throw error;
      setFuelEntries((prev) => prev.filter((item) => item.id !== fuelEntryToDelete.id));
      showSuccess("Entrée de carburant supprimée avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression de l'entrée de carburant : " + error.message);
      console.error("Error deleting fuel entry:", error);
    }
  };

  // --- Assignments ---
  const addAssignment = async (newAssignment: Omit<Assignment, 'id'>) => {
    if (!user) { showError("Vous devez être connecté pour ajouter une affectation."); return; }
    try {
      const { data, error } = await supabase.from('assignments').insert({ ...mapToSnakeCase(newAssignment), user_id: user.id }).select();
      if (error) throw error;
      setAssignments((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Affectation ajoutée avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout de l'affectation : " + error.message);
      console.error("Error adding assignment:", error);
    }
  };

  const editAssignment = async (originalAssignment: Assignment, updatedAssignment: Assignment) => {
    if (!user) { showError("Vous devez être connecté pour modifier une affectation."); return; }
    try {
      const { data, error } = await supabase.from('assignments').update(mapToSnakeCase(updatedAssignment)).eq('id', originalAssignment.id).select();
      if (error) throw error;
      setAssignments((prev) => prev.map((item) => (item.id === originalAssignment.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Affectation modifiée avec succès !");
    } catch (error: any) {
      showError("Échec de la modification de l'affectation : " + error.message);
      console.error("Error editing assignment:", error);
    }
  };

  const deleteAssignment = async (assignmentToDelete: Assignment) => {
    if (!user) { showError("Vous devez être connecté pour supprimer une affectation."); return; }
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', assignmentToDelete.id);
      if (error) throw error;
      setAssignments((prev) => prev.filter((item) => item.id !== assignmentToDelete.id));
      showSuccess("Affectation supprimée avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression de l'affectation : " + error.message);
      console.error("Error deleting assignment:", error);
    }
  };

  // --- Maintenance Plans ---
  const addMaintenancePlan = async (newPlan: Omit<MaintenancePlan, 'id' | 'lastGeneratedDate' | 'nextDueDate'>) => {
    if (!user) { showError("Vous devez être connecté pour ajouter un plan de maintenance."); return; }
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      let nextDueDate: string | null = null;

      if (newPlan.intervalType === "Temps") {
        const futureDate = addMonths(new Date(), newPlan.intervalValue);
        nextDueDate = format(futureDate, "yyyy-MM-dd");
      }

      const planToInsert = {
        ...mapToSnakeCase(newPlan),
        user_id: user.id,
        last_generated_date: null,
        next_due_date: nextDueDate,
      };

      const { data, error } = await supabase.from('maintenance_plans').insert(planToInsert).select();
      if (error) throw error;
      setMaintenancePlans((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Plan de maintenance ajouté avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout du plan de maintenance : " + error.message);
      console.error("Error adding maintenance plan:", error);
    }
  };

  const editMaintenancePlan = async (originalPlan: MaintenancePlan, updatedPlan: MaintenancePlan) => {
    if (!user) { showError("Vous devez être connecté pour modifier un plan de maintenance."); return; }
    try {
      const { data, error } = await supabase.from('maintenance_plans').update(mapToSnakeCase(updatedPlan)).eq('id', originalPlan.id).select();
      if (error) throw error;
      setMaintenancePlans((prev) => prev.map((item) => (item.id === originalPlan.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Plan de maintenance modifié avec succès !");
    } catch (error: any) {
      showError("Échec de la modification du plan de maintenance : " + error.message);
      console.error("Error editing maintenance plan:", error);
    }
  };

  const deleteMaintenancePlan = async (planToDelete: MaintenancePlan) => {
    if (!user) { showError("Vous devez être connecté pour supprimer un plan de maintenance."); return; }
    try {
      const { error } = await supabase.from('maintenance_plans').delete().eq('id', planToDelete.id);
      if (error) throw error;
      setMaintenancePlans((prev) => prev.filter((item) => item.id !== planToDelete.id));
      showSuccess("Plan de maintenance supprimé avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression du plan de maintenance : " + error.message);
      console.error("Error deleting maintenance plan:", error);
    }
  };

  const generateMaintenanceFromPlan = async (plan: MaintenancePlan) => {
    if (!user) { showError("Vous devez être connecté pour générer une maintenance."); return; }
    try {
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

      await addMaintenance(newMaintenance); // Use the Supabase-enabled addMaintenance

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
      await editMaintenancePlan(plan, updatedPlan); // Use the Supabase-enabled editMaintenancePlan
      showSuccess(`Maintenance générée pour le véhicule ${plan.vehicleLicensePlate} !`);
    } catch (error: any) {
      showError("Échec de la génération de la maintenance : " + error.message);
      console.error("Error generating maintenance from plan:", error);
    }
  };

  // --- Documents ---
  const addDocument = async (newDocument: Omit<Document, 'id'>) => {
    if (!user) { showError("Vous devez être connecté pour ajouter un document."); return; }
    try {
      const { data, error } = await supabase.from('documents').insert({ ...mapToSnakeCase(newDocument), user_id: user.id }).select();
      if (error) throw error;
      setDocuments((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Document ajouté avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout du document : " + error.message);
      console.error("Error adding document:", error);
    }
  };

  const editDocument = async (originalDocument: Document, updatedDocument: Document) => {
    if (!user) { showError("Vous devez être connecté pour modifier un document."); return; }
    try {
      const { data, error } = await supabase.from('documents').update(mapToSnakeCase(updatedDocument)).eq('id', originalDocument.id).select();
      if (error) throw error;
      setDocuments((prev) => prev.map((item) => (item.id === originalDocument.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Document modifié avec succès !");
    } catch (error: any) {
      showError("Échec de la modification du document : " + error.message);
      console.error("Error editing document:", error);
    }
  };

  const deleteDocument = async (documentToDelete: Document) => {
    if (!user) { showError("Vous devez être connecté pour supprimer un document."); return; }
    try {
      const { error } = await supabase.from('documents').delete().eq('id', documentToDelete.id);
      if (error) throw error;
      setDocuments((prev) => prev.filter((item) => item.id !== documentToDelete.id));
      showSuccess("Document supprimé avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression du document : " + error.message);
      console.error("Error deleting document:", error);
    }
  };

  // --- Tours ---
  const addTour = async (newTour: Omit<Tour, 'id'>) => {
    if (!user) { showError("Vous devez être connecté pour ajouter une tournée."); return; }
    try {
      const { data, error } = await supabase.from('tours').insert({ ...mapToSnakeCase(newTour), user_id: user.id }).select();
      if (error) throw error;
      setTours((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Tournée ajoutée avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout de la tournée : " + error.message);
      console.error("Error adding tour:", error);
    }
  };

  const editTour = async (originalTour: Tour, updatedTour: Tour) => {
    if (!user) { showError("Vous devez être connecté pour modifier une tournée."); return; }
    try {
      const { data, error } = await supabase.from('tours').update(mapToSnakeCase(updatedTour)).eq('id', originalTour.id).select();
      if (error) throw error;
      setTours((prev) => prev.map((item) => (item.id === originalTour.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Tournée modifiée avec succès !");
    } catch (error: any) {
      showError("Échec de la modification de la tournée : " + error.message);
      console.error("Error editing tour:", error);
    }
  };

  const deleteTour = async (tourToDelete: Tour) => {
    if (!user) { showError("Vous devez être connecté pour supprimer une tournée."); return; }
    try {
      const { error } = await supabase.from('tours').delete().eq('id', tourToDelete.id);
      if (error) throw error;
      setTours((prev) => prev.filter((item) => item.id !== tourToDelete.id));
      showSuccess("Tournée supprimée avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression de la tournée : " + error.message);
      console.error("Error deleting tour:", error);
    }
  };

  // --- Inspections ---
  const addInspection = async (newInspection: Omit<Inspection, 'id'>) => {
    if (!user) { showError("Vous devez être connecté pour ajouter une inspection."); return; }
    try {
      const { data, error } = await supabase.from('inspections').insert({ ...mapToSnakeCase(newInspection), user_id: user.id }).select();
      if (error) throw error;
      setInspections((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Inspection ajoutée avec succès !");

      newInspection.checkpoints.forEach(async cp => {
        if (cp.status === "NOK") {
          await addMaintenance({ // Use the Supabase-enabled addMaintenance
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
    } catch (error: any) {
      showError("Échec de l'ajout de l'inspection : " + error.message);
      console.error("Error adding inspection:", error);
    }
  };

  const editInspection = async (originalInspection: Inspection, updatedInspection: Inspection) => {
    if (!user) { showError("Vous devez être connecté pour modifier une inspection."); return; }
    try {
      const { data, error } = await supabase.from('inspections').update(mapToSnakeCase(updatedInspection)).eq('id', originalInspection.id).select();
      if (error) throw error;
      setInspections((prev) => prev.map((item) => (item.id === originalInspection.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Inspection modifiée avec succès !");

      updatedInspection.checkpoints.forEach(async cp => {
        if (cp.status === "NOK") {
          await addMaintenance({ // Use the Supabase-enabled addMaintenance
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
    } catch (error: any) {
      showError("Échec de la modification de l'inspection : " + error.message);
      console.error("Error editing inspection:", error);
    }
  };

  const deleteInspection = async (inspectionToDelete: Inspection) => {
    if (!user) { showError("Vous devez être connecté pour supprimer une inspection."); return; }
    try {
      const { error } = await supabase.from('inspections').delete().eq('id', inspectionToDelete.id);
      if (error) throw error;
      setInspections((prev) => prev.filter((item) => item.id !== inspectionToDelete.id));
      showSuccess("Inspection supprimée avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression de l'inspection : " + error.message);
      console.error("Error deleting inspection:", error);
    }
  };

  // --- Alert Rules ---
  const addAlertRule = async (newRule: Omit<AlertRule, 'id' | 'lastTriggered'>) => {
    if (!user) { showError("Vous devez être connecté pour ajouter une règle d'alerte."); return; }
    try {
      const { data, error } = await supabase.from('alert_rules').insert({ ...mapToSnakeCase(newRule), user_id: user.id, last_triggered: null }).select();
      if (error) throw error;
      setAlertRules((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Règle d'alerte ajoutée avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout de la règle d'alerte : " + error.message);
      console.error("Error adding alert rule:", error);
    }
  };

  const editAlertRule = async (originalRule: AlertRule, updatedRule: AlertRule) => {
    if (!user) { showError("Vous devez être connecté pour modifier une règle d'alerte."); return; }
    try {
      const { data, error } = await supabase.from('alert_rules').update(mapToSnakeCase(updatedRule)).eq('id', originalRule.id).select();
      if (error) throw error;
      setAlertRules((prev) => prev.map((item) => (item.id === originalRule.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Règle d'alerte modifiée avec succès !");
    } catch (error: any) {
      showError("Échec de la modification de la règle d'alerte : " + error.message);
      console.error("Error editing alert rule:", error);
    }
  };

  const deleteAlertRule = async (ruleToDelete: AlertRule) => {
    if (!user) { showError("Vous devez être connecté pour supprimer une règle d'alerte."); return; }
    try {
      const { error } = await supabase.from('alert_rules').delete().eq('id', ruleToDelete.id);
      if (error) throw error;
      setAlertRules((prev) => prev.filter((item) => item.id !== ruleToDelete.id));
      showSuccess("Règle d'alerte supprimée avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression de la règle d'alerte : " + error.message);
      console.error("Error deleting alert rule:", error);
    }
  };

  // --- Active Alerts ---
  const addActiveAlert = async (newAlert: Omit<Alert, 'id' | 'createdAt' | 'isRead'>) => {
    if (!user) { showError("Vous devez être connecté pour ajouter une alerte."); return; }
    try {
      const alertToInsert = {
        ...mapToSnakeCase(newAlert),
        user_id: user.id,
        created_at: new Date().toISOString(),
        is_read: false,
      };
      const { data, error } = await supabase.from('alerts').insert(alertToInsert).select();
      if (error) throw error;
      setActiveAlerts((prev) => [...prev, mapToCamelCase(data[0])]);
    } catch (error: any) {
      showError("Échec de l'ajout de l'alerte : " + error.message);
      console.error("Error adding active alert:", error);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    if (!user) { showError("Vous devez être connecté pour marquer une alerte comme lue."); return; }
    try {
      const { data, error } = await supabase.from('alerts').update({ is_read: true }).eq('id', alertId).select();
      if (error) throw error;
      setActiveAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
      showSuccess("Alerte marquée comme lue !");
    } catch (error: any) {
      showError("Échec de la mise à jour de l'alerte : " + error.message);
      console.error("Error marking alert as read:", error);
    }
  };

  const clearAllAlerts = async () => {
    if (!user) { showError("Vous devez être connecté pour effacer les alertes."); return; }
    try {
      const { error } = await supabase.from('alerts').delete().eq('user_id', user.id);
      if (error) throw error;
      setActiveAlerts([]);
      showSuccess("Toutes les alertes ont été effacées !");
    } catch (error: any) {
      showError("Échec de l'effacement des alertes : " + error.message);
      console.error("Error clearing all alerts:", error);
    }
  };

  const clearAllData = async () => {
    if (!user) { showError("Vous devez être connecté pour effacer toutes les données."); return; }
    try {
      // Delete from all tables for the current user
      await Promise.all([
        supabase.from('vehicles').delete().eq('user_id', user.id),
        supabase.from('drivers').delete().eq('user_id', user.id),
        supabase.from('maintenances').delete().eq('user_id', user.id),
        supabase.from('fuel_entries').delete().eq('user_id', user.id),
        supabase.from('assignments').delete().eq('user_id', user.id),
        supabase.from('maintenance_plans').delete().eq('user_id', user.id),
        supabase.from('documents').delete().eq('user_id', user.id),
        supabase.from('tours').delete().eq('user_id', user.id),
        supabase.from('inspections').delete().eq('user_id', user.id),
        supabase.from('alert_rules').delete().eq('user_id', user.id),
        supabase.from('alerts').delete().eq('user_id', user.id),
      ]);
      // Reset local states
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
      setActiveAlerts([]);
      setVehicleMap({});
      setDriverMap({});
      showSuccess("Toutes les données de la flotte ont été effacées !");
    } catch (error: any) {
      showError("Échec de l'effacement de toutes les données : " + error.message);
      console.error("Error clearing all data:", error);
    }
  };

  // Integrate alert checker
  useAlertChecker({
    alertRules,
    maintenancePlans,
    documents,
    assignments,
    drivers,
    setAlertRules, // This will need to be updated to call Supabase for rule updates
    addActiveAlert,
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
        editInspection,
        deleteInspection,
        alertRules,
        addAlertRule,
        editAlertRule,
        deleteAlertRule,
        activeAlerts,
        addActiveAlert,
        markAlertAsRead,
        clearAllAlerts,
        clearAllData,
        isLoadingFleetData,
        getVehicleByLicensePlate,
        getDriverByLicenseNumber,
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