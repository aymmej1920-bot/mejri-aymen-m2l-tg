"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useFleet } from "@/context/FleetContext";
import { format, parseISO, isWithinInterval, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Car, Wrench, Fuel, TrendingUp, Download, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToXlsx } from "@/utils/export-xlsx"; // Import the new XLSX export utility
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker"; // Import DateRange type

const ReportsPage = () => {
  const { vehicles, fuelEntries, maintenances, getVehicleByLicensePlate } = useFleet();

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => ({
    from: subMonths(new Date(), 6), // Default to last 6 months
    to: new Date(),
  }));
  const [selectedVehicleLicensePlate, setSelectedVehicleLicensePlate] = React.useState<string | undefined>(undefined);
  const [selectedDriverLicenseNumber, setSelectedDriverLicenseNumber] = React.useState<string | undefined>(undefined);

  // Filtered data based on selected criteria
  const filteredFuelEntries = React.useMemo(() => {
    return fuelEntries.filter(entry => {
      const entryDate = parseISO(entry.date);
      const isDateMatch = dateRange?.from && dateRange?.to
        ? isWithinInterval(entryDate, { start: dateRange.from, end: dateRange.to })
        : true;
      const isVehicleMatch = selectedVehicleLicensePlate
        ? entry.vehicleLicensePlate === selectedVehicleLicensePlate
        : true;
      return isDateMatch && isVehicleMatch;
    });
  }, [fuelEntries, dateRange, selectedVehicleLicensePlate]);

  const filteredMaintenances = React.useMemo(() => {
    return maintenances.filter(maintenance => {
      const maintenanceDate = parseISO(maintenance.date);
      const isDateMatch = dateRange?.from && dateRange?.to
        ? isWithinInterval(maintenanceDate, { start: dateRange.from, end: dateRange.to })
        : true;
      const isVehicleMatch = selectedVehicleLicensePlate
        ? maintenance.vehicleLicensePlate === selectedVehicleLicensePlate
        : true;
      return isDateMatch && isVehicleMatch;
    });
  }, [maintenances, dateRange, selectedVehicleLicensePlate]);

  // 1. Coût du carburant par mois (Bar Chart)
  const fuelCostsByMonth = filteredFuelEntries.reduce((acc, entry) => {
    const date = parseISO(entry.date);
    const monthYear = format(date, "MMM yyyy", { locale: fr });
    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    acc[monthYear] += entry.cost;
    return acc;
  }, {} as Record<string, number>);

  const fuelChartData = Object.keys(fuelCostsByMonth)
    .map((monthYear) => ({
      name: monthYear,
      "Coût (TND)": fuelCostsByMonth[monthYear],
    }))
    .sort((a, b) => {
      const [monthA, yearA] = a.name.split(" ");
      const [monthB, yearB] = b.name.split(" ");
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateA.getTime() - dateB.getTime();
    });

  // 2. Répartition des types de maintenance (Doughnut Chart)
  const maintenanceTypeCounts = filteredMaintenances.reduce((acc, maintenance) => {
    if (!acc[maintenance.type]) {
      acc[maintenance.type] = 0;
    }
    acc[maintenance.type]++;
    return acc;
  }, {} as Record<string, number>);

  const maintenancePieData = Object.keys(maintenanceTypeCounts).map((type) => ({
    name: type,
    value: maintenanceTypeCounts[type],
  }));

  const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--secondary))"];

  // 3. Coût de maintenance par véhicule (Bar Chart)
  const maintenanceCostByVehicle = filteredMaintenances.reduce((acc, maintenance) => {
    const vehicle = getVehicleByLicensePlate(maintenance.vehicleLicensePlate);
    const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model} (${maintenance.vehicleLicensePlate})` : maintenance.vehicleLicensePlate;
    if (!acc[vehicleName]) {
      acc[vehicleName] = 0;
    }
    acc[vehicleName] += maintenance.cost;
    return acc;
  }, {} as Record<string, number>);

  const maintenanceCostByVehicleData = Object.keys(maintenanceCostByVehicle)
    .map((vehicleName) => ({
      name: vehicleName,
      "Coût Maintenance (TND)": maintenanceCostByVehicle[vehicleName],
    }))
    .sort((a, b) => b["Coût Maintenance (TND)"] - a["Coût Maintenance (TND)"]);

  // 4. Derniers relevés kilométriques par véhicule (Table)
  const latestOdometerReadings = vehicles.map(vehicle => {
    const vehicleFuelEntries = fuelEntries // Use unfiltered fuelEntries for latest odometer regardless of date range
      .filter(entry => entry.vehicleLicensePlate === vehicle.licensePlate)
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

    const latestEntry = vehicleFuelEntries.length > 0 ? vehicleFuelEntries[0] : null;

    return {
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
      latestOdometer: latestEntry ? latestEntry.odometerReading : "N/A",
      lastReadingDate: latestEntry ? format(parseISO(latestEntry.date), "PPP", { locale: fr }) : "N/A",
    };
  }).filter(data => selectedVehicleLicensePlate ? data.licensePlate === selectedVehicleLicensePlate : true); // Filter by selected vehicle

  // 5. Coût des maintenances par mois (Line Chart)
  const maintenanceCostsOverTime = filteredMaintenances.reduce((acc, maintenance) => {
    const date = parseISO(maintenance.date);
    const monthYear = format(date, "MMM yyyy", { locale: fr });
    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    acc[monthYear] += maintenance.cost;
    return acc;
  }, {} as Record<string, number>);

  const maintenanceLineData = Object.keys(maintenanceCostsOverTime)
    .map((monthYear) => ({
      name: monthYear,
      "Coût Maintenance (TND)": maintenanceCostsOverTime[monthYear],
    }))
    .sort((a, b) => {
      const [monthA, yearA] = a.name.split(" ");
      const [monthB, yearB] = b.name.split(" ");
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateA.getTime() - dateB.getTime();
    });

  // NEW CHART: Fuel Consumption by Vehicle (Bar Chart)
  const fuelConsumptionByVehicle = filteredFuelEntries.reduce((acc, entry) => {
    const vehicle = getVehicleByLicensePlate(entry.vehicleLicensePlate);
    const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model} (${entry.vehicleLicensePlate})` : entry.vehicleLicensePlate;
    if (!acc[vehicleName]) {
      acc[vehicleName] = 0;
    }
    acc[vehicleName] += entry.volume;
    return acc;
  }, {} as Record<string, number>);

  const fuelConsumptionData = Object.keys(fuelConsumptionByVehicle)
    .map((vehicleName) => ({
      name: vehicleName,
      "Volume Carburant (L)": fuelConsumptionByVehicle[vehicleName],
    }))
    .sort((a, b) => b["Volume Carburant (L)"] - a["Volume Carburant (L)"]);

  // NEW CHART: Total Cost by Maintenance Type (Bar Chart)
  const totalCostByMaintenanceType = filteredMaintenances.reduce((acc, maintenance) => {
    if (!acc[maintenance.type]) {
      acc[maintenance.type] = 0;
    }
    acc[maintenance.type] += maintenance.cost;
    return acc;
  }, {} as Record<string, number>);

  const totalCostByMaintenanceTypeData = Object.keys(totalCostByMaintenanceType)
    .map((type) => ({
      name: type,
      "Coût Total (TND)": totalCostByMaintenanceType[type],
    }))
    .sort((a, b) => b["Coût Total (TND)"] - a["Coût Total (TND)"]);


  const handleExportFuelCosts = () => {
    exportToXlsx("rapport_couts_carburant", fuelChartData, "Coûts Carburant", [
      { key: "name", label: "Mois" },
      { key: "Coût (TND)", label: "Coût (TND)" },
    ]);
  };

  const handleExportMaintenanceTypes = () => {
    exportToXlsx("rapport_types_maintenance", maintenancePieData, "Types Maintenance", [
      { key: "name", label: "Type de Maintenance" },
      { key: "value", label: "Nombre" },
    ]);
  };

  const handleExportMaintenanceCostByVehicle = () => {
    exportToXlsx("rapport_cout_maintenance_par_vehicule", maintenanceCostByVehicleData, "Coût Maintenance Véhicule", [
      { key: "name", label: "Véhicule" },
      { key: "Coût Maintenance (TND)", label: "Coût Maintenance (TND)" },
    ]);
  };

  const handleExportMaintenanceCosts = () => {
    exportToXlsx("rapport_tendance_couts_maintenance", maintenanceLineData, "Tendance Coûts Maintenance", [
      { key: "name", label: "Mois" },
      { key: "Coût Maintenance (TND)", label: "Coût Maintenance (TND)" },
    ]);
  };

  const handleExportOdometerReadings = () => {
    exportToXlsx("rapport_releves_kilometriques", latestOdometerReadings, "Relevés Kilométriques", [
      { key: "licensePlate", label: "Plaque d'immatriculation" },
      { key: "make", label: "Marque" },
      { key: "model", label: "Modèle" },
      { key: "latestOdometer", label: "Dernier Kilométrage" },
      { key: "lastReadingDate", label: "Date du relevé" },
    ]);
  };

  const handleExportFuelConsumptionByVehicle = () => {
    exportToXlsx("rapport_consommation_carburant_par_vehicule", fuelConsumptionData, "Conso Carburant Véhicule", [
      { key: "name", label: "Véhicule" },
      { key: "Volume Carburant (L)", label: "Volume Carburant (L)" },
    ]);
  };

  const handleExportTotalCostByMaintenanceType = () => {
    exportToXlsx("rapport_cout_total_par_type_maintenance", totalCostByMaintenanceTypeData, "Coût Total Type Maintenance", [
      { key: "name", label: "Type de Maintenance" },
      { key: "Coût Total (TND)", label: "Coût Total (TND)" },
    ]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Rapports & Analyses</h1>

      <Card className="glass rounded-2xl animate-fadeIn mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Filtres de Rapport</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Plage de dates</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y", { locale: fr })} -{" "}
                        {format(dateRange.to, "LLL dd, y", { locale: fr })}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y", { locale: fr })
                    )
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    // Ensure that if 'from' is undefined, the whole range is undefined
                    if (range && range.from) {
                      setDateRange(range);
                    } else {
                      setDateRange(undefined);
                    }
                  }}
                  numberOfMonths={2}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Filtrer par véhicule</label>
            <Select
              value={selectedVehicleLicensePlate}
              onValueChange={(value) => setSelectedVehicleLicensePlate(value === "__ALL__" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les véhicules" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__ALL__">Tous les véhicules</SelectItem>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.licensePlate} value={vehicle.licensePlate}>
                            {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Driver filter (optional, as not all reports are driver-specific) */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium">Filtrer par conducteur</label>
                    <Select
                      value={selectedDriverLicenseNumber}
                      onValueChange={(value) => setSelectedDriverLicenseNumber(value === "__ALL__" ? undefined : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les conducteurs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__ALL__">Tous les conducteurs</SelectItem>
                        {/* Assuming you have a drivers array in useFleet context */}
                        {/* {drivers.map((driver) => (
                          <SelectItem key={driver.licenseNumber} value={driver.licenseNumber}>
                            {driver.firstName} {driver.lastName} ({driver.licenseNumber})
                          </SelectItem>
                        ))} */}
                        <SelectItem value="N/A" disabled>Fonctionnalité à venir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="glass rounded-2xl animate-fadeIn">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold">Coût du carburant par mois</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handleExportFuelCosts} disabled={fuelChartData.length === 0}>
                        <Download className="h-4 w-4 mr-2" /> XLSX
                      </Button>
                      <Fuel className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="h-80">
                    {fuelChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fuelChartData}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} TND`} />
                          <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => `${value.toFixed(2)} TND`} />
                          <Legend />
                          <Bar dataKey="Coût (TND)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center mt-10">Aucune donnée de carburant disponible pour la période sélectionnée.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass rounded-2xl animate-fadeIn">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold">Répartition des types de maintenance</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handleExportMaintenanceTypes} disabled={maintenancePieData.length === 0}>
                        <Download className="h-4 w-4 mr-2" /> XLSX
                      </Button>
                      <Wrench className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="h-80">
                    {maintenancePieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={maintenancePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="hsl(var(--primary))"
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {maintenancePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${value} maintenances`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center mt-10">Aucune donnée de maintenance disponible pour la période sélectionnée.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass rounded-2xl animate-fadeIn">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold">Coût de maintenance par véhicule</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handleExportMaintenanceCostByVehicle} disabled={maintenanceCostByVehicleData.length === 0}>
                        <Download className="h-4 w-4 mr-2" /> XLSX
                      </Button>
                      <Car className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="h-80">
                    {maintenanceCostByVehicleData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={maintenanceCostByVehicleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} TND`} />
                          <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => `${value.toFixed(2)} TND`} />
                          <Legend />
                          <Bar dataKey="Coût Maintenance (TND)" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center mt-10">Aucune donnée de maintenance par véhicule disponible pour la période sélectionnée.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass rounded-2xl animate-fadeIn">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold">Tendance des coûts de maintenance</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handleExportMaintenanceCosts} disabled={maintenanceLineData.length === 0}>
                        <Download className="h-4 w-4 mr-2" /> XLSX
                      </Button>
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="h-80">
                    {maintenanceLineData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={maintenanceLineData}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} TND`} />
                          <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => `${value.toFixed(2)} TND`} />
                          <Legend />
                          <Line type="monotone" dataKey="Coût Maintenance (TND)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center mt-10">Aucune donnée de maintenance disponible pour la tendance et la période sélectionnée.</p>
                    )}
                  </CardContent>
                </Card>

                {/* New Chart: Fuel Consumption by Vehicle */}
                <Card className="glass rounded-2xl animate-fadeIn">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold">Consommation de carburant par véhicule</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handleExportFuelConsumptionByVehicle} disabled={fuelConsumptionData.length === 0}>
                        <Download className="h-4 w-4 mr-2" /> XLSX
                      </Button>
                      <Fuel className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="h-80">
                    {fuelConsumptionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fuelConsumptionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} L`} />
                          <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => `${value.toFixed(2)} L`} />
                          <Legend />
                          <Bar dataKey="Volume Carburant (L)" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center mt-10">Aucune donnée de consommation de carburant disponible pour la période sélectionnée.</p>
                    )}
                  </CardContent>
                </Card>

                {/* New Chart: Total Cost by Maintenance Type */}
                <Card className="glass rounded-2xl animate-fadeIn">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold">Coût total par type de maintenance</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handleExportTotalCostByMaintenanceType} disabled={totalCostByMaintenanceTypeData.length === 0}>
                        <Download className="h-4 w-4 mr-2" /> XLSX
                      </Button>
                      <Wrench className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="h-80">
                    {totalCostByMaintenanceTypeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={totalCostByMaintenanceTypeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} TND`} />
                          <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => `${value.toFixed(2)} TND`} />
                          <Legend />
                          <Bar dataKey="Coût Total (TND)" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center mt-10">Aucune donnée de coût par type de maintenance disponible pour la période sélectionnée.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="glass rounded-2xl animate-fadeIn">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold">Derniers relevés kilométriques</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleExportOdometerReadings} disabled={latestOdometerReadings.length === 0}>
                      <Download className="h-4 w-4 mr-2" /> XLSX
                    </Button>
                    <Car className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  {latestOdometerReadings.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plaque</TableHead>
                          <TableHead>Marque</TableHead>
                          <TableHead>Modèle</TableHead>
                          <TableHead>Dernier Km</TableHead>
                          <TableHead>Date du relevé</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {latestOdometerReadings.map((data, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{data.licensePlate}</TableCell>
                            <TableCell>{data.make}</TableCell>
                            <TableCell>{data.model}</TableCell>
                            <TableCell>{data.latestOdometer} Km</TableCell>
                            <TableCell>{data.lastReadingDate}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center mt-10">Aucun relevé kilométrique disponible.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        };

export default ReportsPage;