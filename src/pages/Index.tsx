import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddVehicleDialog from "@/components/vehicles/AddVehicleDialog";
import AddDriverDialog from "@/components/drivers/AddDriverDialog";
import AddTourDialog from "@/components/tours/AddTourDialog";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
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
} from "recharts";
import { Car, Users, Wrench, Fuel as FuelIcon } from "lucide-react"; // Import FuelIcon
import { useFleet } from "@/context/FleetContext";

const Index = () => {
  const { vehicles, drivers, fuelEntries, maintenances } = useFleet();

  // Calculer le nombre de maintenances planifiées (statut "Planifiée")
  const upcomingMaintenancesCount = maintenances.filter(m => m.status === "Planifiée").length;

  // Préparer les données pour le graphique des coûts de carburant par mois
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

  // Préparer les données pour le graphique de répartition des statuts de maintenance
  const maintenanceStatusCounts = maintenances.reduce((acc, maintenance) => {
    if (!acc[maintenance.status]) {
      acc[maintenance.status] = 0;
    }
    acc[maintenance.status]++;
    return acc;
  }, {} as Record<string, number>);

  const maintenancePieData = Object.keys(maintenanceStatusCounts).map((status) => ({
    name: status,
    value: maintenanceStatusCounts[status],
  }));

  // Using Tailwind CSS colors directly or CSS variables
  const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--secondary))"];

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Card className="w-full max-w-4xl text-center glass rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Bienvenue dans Fleet Manager Pro !</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground mb-6">
            Commencez à gérer votre flotte de véhicules et vos conducteurs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"> {/* Ajusté à 3 colonnes */}
            <Card className="glass rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Véhicules</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicles.length}</div>
                <p className="text-xs text-muted-foreground">véhicules enregistrés</p>
              </CardContent>
            </Card>
            <Card className="glass rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Conducteurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{drivers.length}</div>
                <p className="text-xs text-muted-foreground">conducteurs enregistrés</p>
              </CardContent>
            </Card>
            <Card className="glass rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenances à venir</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingMaintenancesCount}</div>
                <p className="text-xs text-muted-foreground">opérations planifiées</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 glass rounded-2xl">
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <AddVehicleDialog />
              <AddDriverDialog />
              <AddTourDialog />
            </CardContent>
          </Card>

          <Card className="glass rounded-2xl">
            <CardHeader>
              <CardTitle>Aperçu des Coûts et Statut de la Flotte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
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
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <FuelIcon className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground text-center">
                      Aucune donnée de carburant disponible.
                    </p>
                    <p className="text-md text-muted-foreground text-center mt-2">
                      Ajoutez des ravitaillements pour voir les tendances des coûts.
                    </p>
                  </div>
                )}

                {maintenancePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={maintenancePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {maintenancePieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value} maintenances`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground text-center">
                      Aucune donnée de maintenance disponible.
                    </p>
                    <p className="text-md text-muted-foreground text-center mt-2">
                      Ajoutez des maintenances pour voir la répartition des statuts.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default Index;