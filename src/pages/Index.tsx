import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
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