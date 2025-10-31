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
  LineChart, // Import LineChart
  Line,      // Import Line
} from "recharts";
import { useFleet } from "@/context/FleetContext";
import { format, parseISO, getMonth, getYear, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Car, Wrench, Fuel, Factory, TrendingUp } from "lucide-react"; // Import TrendingUp icon

const ReportsPage = () => {
  const { vehicles, fuelEntries, maintenances, getVehicleByLicensePlate } = useFleet();

  // 1. Coût du carburant par mois (Bar Chart)
  const fuelCostsByMonth = fuelEntries.reduce((acc, entry) => {
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
  const maintenanceTypeCounts = maintenances.reduce((acc, maintenance) => {
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

  // Using Tailwind CSS colors directly or CSS variables
  const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--secondary))"];

  // 3. Nombre de véhicules par marque (Pie Chart)
  const vehicleMakeCounts = vehicles.reduce((acc, vehicle) => {
    if (!acc[vehicle.make]) {
      acc[vehicle.make] = 0;
    }
    acc[vehicle.make]++;
    return acc;
  }, {} as Record<string, number>);

  const vehicleMakePieData = Object.keys(vehicleMakeCounts).map((make) => ({
    name: make,
    value: vehicleMakeCounts[make],
  }));

  // 4. Derniers relevés kilométriques par véhicule (Table)
  const latestOdometerReadings = vehicles.map(vehicle => {
    const vehicleFuelEntries = fuelEntries
      .filter(entry => entry.vehicleLicensePlate === vehicle.licensePlate)
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()); // Sort by date descending

    const latestEntry = vehicleFuelEntries.length > 0 ? vehicleFuelEntries[0] : null;

    return {
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
      latestOdometer: latestEntry ? latestEntry.odometerReading : "N/A",
      lastReadingDate: latestEntry ? format(parseISO(latestEntry.date), "PPP", { locale: fr }) : "N/A",
    };
  });

  // 5. Coût des maintenances par mois (Line Chart)
  const maintenanceCostsOverTime = maintenances.reduce((acc, maintenance) => {
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Rapports & Analyses</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="glass rounded-2xl animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">Coût du carburant par mois</CardTitle>
            <Fuel className="h-5 w-5 text-muted-foreground" />
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
              <p className="text-muted-foreground text-center mt-10">Aucune donnée de carburant disponible.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass rounded-2xl animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">Répartition des types de maintenance</CardTitle>
            <Wrench className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-80">
            {maintenancePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={maintenancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60} // Added for doughnut effect
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
              <p className="text-muted-foreground text-center mt-10">Aucune donnée de maintenance disponible.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass rounded-2xl animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">Nombre de véhicules par marque</CardTitle>
            <Factory className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-80">
            {vehicleMakePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleMakePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {vehicleMakePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value} véhicules`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center mt-10">Aucune donnée de véhicule disponible.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass rounded-2xl animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">Tendance des coûts de maintenance</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
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
              <p className="text-muted-foreground text-center mt-10">Aucune donnée de maintenance disponible pour la tendance.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass rounded-2xl animate-fadeIn">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold">Derniers relevés kilométriques</CardTitle>
          <Car className="h-5 w-5 text-muted-foreground" />
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