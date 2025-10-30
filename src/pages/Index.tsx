import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFleet } from "@/context/FleetContext";
import { Car, Users, PlusCircle, Wrench, Fuel } from "lucide-react"; // Importez de nouvelles icônes
import AddVehicleDialog from "@/components/vehicles/AddVehicleDialog";
import AddDriverDialog from "@/components/drivers/AddDriverDialog";

const Index = () => {
  const { vehicles, drivers } = useFleet();

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Card className="w-full max-w-4xl text-center glass rounded-2xl"> {/* Appliquer glass et rounded-2xl */}
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Bienvenue dans Fleet Manager Pro !</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground mb-6">
            Commencez à gérer votre flotte de véhicules et vos conducteurs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="glass rounded-2xl"> {/* Appliquer glass et rounded-2xl */}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Véhicules</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicles.length}</div>
                <p className="text-xs text-muted-foreground">véhicules enregistrés</p>
              </CardContent>
            </Card>
            <Card className="glass rounded-2xl"> {/* Appliquer glass et rounded-2xl */}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Conducteurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{drivers.length}</div>
                <p className="text-xs text-muted-foreground">conducteurs enregistrés</p>
              </CardContent>
            </Card>
            <Card className="glass rounded-2xl"> {/* Nouvelle carte KPI */}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenances à venir</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div> {/* Placeholder */}
                <p className="text-xs text-muted-foreground">opérations planifiées</p>
              </CardContent>
            </Card>
            <Card className="glass rounded-2xl"> {/* Nouvelle carte KPI */}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coûts Carburant (Mois)</CardTitle>
                <Fuel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.00 €</div> {/* Placeholder */}
                <p className="text-xs text-muted-foreground">ce mois-ci</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 glass rounded-2xl"> {/* Appliquer glass et rounded-2xl */}
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <AddVehicleDialog />
              <AddDriverDialog />
            </CardContent>
          </Card>

          <Card className="glass rounded-2xl"> {/* Nouvelle carte pour le graphique */}
            <CardHeader>
              <CardTitle>Aperçu des Coûts et Statut de la Flotte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                {/* Placeholder pour le graphique Recharts */}
                <p>Graphique des coûts ou de la répartition de la flotte à venir ici.</p>
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