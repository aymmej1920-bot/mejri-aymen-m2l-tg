import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFleet } from "@/context/FleetContext";
import { Car, Users, PlusCircle, Wrench, Fuel, Link } from "lucide-react"; // Importez l'icône Link
import AddVehicleDialog from "@/components/vehicles/AddVehicleDialog";
import AddDriverDialog from "@/components/drivers/AddDriverDialog";
import { format, isSameMonth, parseISO, getMonth, getYear } from "date-fns";
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

const Index = () => {
  const { vehicles, drivers, fuelEntries, maintenances, assignments } = useFleet();

  // Calculer le coût total du carburant pour le mois en cours
  const currentMonth = new Date();
  const totalFuelCostThisMonth = fuelEntries.reduce((sum, entry) => {
    const entryDate = parseISO(entry.date);
    if (isSameMonth(entryDate, currentMonth)) {
      return sum + entry.cost;
    }
    return sum;
  }, 0);

  // Calculer le nombre de maintenances planifiées (statut "Planifiée")
  const upcomingMaintenancesCount = maintenances.filter(m => m.status === "Planifiée").length;

  // Calculer le nombre d'affectations actives
  const activeAssignmentsCount = assignments.filter(a => a.status === "Active").length;

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

  const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]; // Couleurs pour le graphique en secteurs

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Card className="w-full max-w-4xl text-center glass rounded-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Bienvenue dans Fleet Manager Pro !</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground mb-6">
            Commencez à gérer votre flotte de véhicules et vos conducteurs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <Card className="glass rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Affectations Actives</CardTitle>
                <Link className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAssignmentsCount}</div>
                <p className="text-xs text-muted-foreground">affectations en cours</p>
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
            </CardContent>
          </Card>

          <Card className="glass rounded-2xl">
            <CardHeader>
              <CardTitle>Aperçu des Coûts et Statut de la Flotte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fuelChartData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} TND`} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => `${value.toFixed(2)} TND`} />
                    <Legend />
                    <Bar dataKey="Coût (TND)" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={maintenancePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
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