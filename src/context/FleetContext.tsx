"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { Vehicle } from "@/types/vehicle";
import { Driver } from "@/types/driver";
import { showSuccess, showError } from "@/utils/toast";

interface FleetContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Vehicle) => void;
  editVehicle: (originalVehicle: Vehicle, updatedVehicle: Vehicle) => void;
  deleteVehicle: (vehicleToDelete: Vehicle) => void;
  drivers: Driver[];
  addDriver: (driver: Driver) => void;
  editDriver: (originalDriver: Driver, updatedDriver: Driver) => void;
  deleteDriver: (driverToDelete: Driver) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

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