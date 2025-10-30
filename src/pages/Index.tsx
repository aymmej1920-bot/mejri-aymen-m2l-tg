import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFleet } from "@/context/FleetContext"; // Importez le hook useFleet
import { Car, Users } from "lucide-react"; // Importez les icônes

const Index = () => {
  const { vehicles, drivers } = useFleet(); // Utilisez le contexte pour obtenir les données

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Bienvenue dans Fleet Manager Pro !</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground mb-6">
            Commencez à gérer votre flotte de véhicules et vos conducteurs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Véhicules</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicles.length}</div>
                <p className="text-xs text-muted-foreground">véhicules enregistrés</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Conducteurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{drivers.length}</div>
                <p className="text-xs text-muted-foreground">conducteurs enregistrés</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Véhicules</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Ajoutez, modifiez et suivez tous vos véhicules.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Conducteurs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Gérez les informations et les affectations de vos conducteurs.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default Index;