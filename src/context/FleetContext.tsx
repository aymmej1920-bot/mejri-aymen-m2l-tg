"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Vehicle } from "@/types/vehicle";
import { Driver } from "@/types/driver";
import { Maintenance } from "@/types/maintenance";
import { FuelEntry } from "@/types/fuel";
import { Assignment } from "@/types/assignment"; // Importez le type Assignment
import { showSuccess, showError } from "@/utils/toast";
import { v4 as uuidv4 } from "uuid";

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
  assignments: Assignment[]; // Ajoutez l'état des affectations
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void; // Ajoutez la fonction d'ajout
  editAssignment: (originalAssignment: Assignment, updatedAssignment: Assignment) => void; // Ajoutez la fonction de modification
  deleteAssignment: (assignmentToDelete: Assignment) => void; // Ajoutez la fonction de suppression
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

  const clearAllData = () => {
    setVehicles([]);
    setDrivers([]);
    setMaintenances([]);
    setFuelEntries([]);
    setAssignments([]); // Effacez aussi les affectations
    if (typeof window !== "undefined") {
      localStorage.removeItem("fleet-vehicles");
      localStorage.removeItem("fleet-drivers");
      localStorage.removeItem("fleet-maintenances");
      localStorage.removeItem("fleet-fuel-entries");
      localStorage.removeItem("fleet-assignments"); // Supprimez du localStorage
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
        assignments, // Exposez les affectations
        addAssignment, // Exposez les fonctions d'affectation
        editAssignment,
        deleteAssignment,
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