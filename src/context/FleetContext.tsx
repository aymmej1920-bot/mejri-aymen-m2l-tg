"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Vehicle } from "@/types/vehicle";
import { Driver } from "@/types/driver";
import { Maintenance } from "@/types/maintenance"; // Importez le type Maintenance
import { showSuccess, showError } from "@/utils/toast";
import { v4 as uuidv4 } from "uuid"; // Importez uuid

interface FleetContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Vehicle) => void;
  editVehicle: (originalVehicle: Vehicle, updatedVehicle: Vehicle) => void;
  deleteVehicle: (vehicleToDelete: Vehicle) => void;
  drivers: Driver[];
  addDriver: (driver: Driver) => void;
  editDriver: (originalDriver: Driver, updatedDriver: Driver) => void;
  deleteDriver: (driverToDelete: Driver) => void;
  maintenances: Maintenance[]; // Ajoutez l'état des maintenances
  addMaintenance: (maintenance: Omit<Maintenance, 'id'>) => void; // Ajoutez la fonction d'ajout de maintenance
  editMaintenance: (originalMaintenance: Maintenance, updatedMaintenance: Maintenance) => void; // Ajoutez la fonction de modification de maintenance
  deleteMaintenance: (maintenanceToDelete: Maintenance) => void; // Ajoutez la fonction de suppression de maintenance
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

  const clearAllData = () => {
    setVehicles([]);
    setDrivers([]);
    setMaintenances([]); // Effacez aussi les maintenances
    if (typeof window !== "undefined") {
      localStorage.removeItem("fleet-vehicles");
      localStorage.removeItem("fleet-drivers");
      localStorage.removeItem("fleet-maintenances"); // Supprimez du localStorage
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
        maintenances, // Exposez les maintenances
        addMaintenance, // Exposez les fonctions de maintenance
        editMaintenance,
        deleteMaintenance,
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