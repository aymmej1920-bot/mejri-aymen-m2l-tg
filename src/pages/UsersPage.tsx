"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFleet } from "@/context/FleetContext";
import InviteUserDialog from "@/components/users/InviteUserDialog";
import CreateUserDialog from "@/components/users/CreateUserDialog";
import EditUserRoleDialog from "@/components/users/EditUserRoleDialog";
import ToggleUserStatusButton from "@/components/users/ToggleUserStatusButton";
import { CustomBadge } from "@/components/CustomBadge";
import DataTableSkeleton from "@/components/ui/DataTableSkeleton"; // Import DataTableSkeleton

const UsersPage = () => {
  const { users, isLoadingFleetData, can } = useFleet();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!can('users.view')) { // Using a more specific permission key
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Card className="glass rounded-2xl animate-fadeIn text-center p-8">
          <CardTitle className="text-2xl font-bold mb-4">Accès Refusé</CardTitle>
          <p className="text-lg text-muted-foreground">Vous n'avez pas les permissions nécessaires pour gérer les utilisateurs.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <div className="flex space-x-2">
          <InviteUserDialog />
          <CreateUserDialog />
        </div>
      </div>

      <Card className="glass rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Liste des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {isLoadingFleetData ? ( // Show skeleton loader when data is loading
            <DataTableSkeleton columns={5} />
          ) : filteredUsers.length === 0 && users.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">
                Aucun utilisateur ne correspond à votre recherche.
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">
                Aucun utilisateur enregistré pour le moment.
              </p>
              <p className="text-md text-muted-foreground text-center mt-2">
                Invitez ou créez de nouveaux utilisateurs pour commencer à gérer les accès.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((userProfile) => (
                  <TableRow key={userProfile.id}>
                    <TableCell className="font-medium">
                      {userProfile.firstName} {userProfile.lastName}
                    </TableCell>
                    <TableCell>{userProfile.email}</TableCell>
                    <TableCell>
                      <CustomBadge variant="secondary">
                        {userProfile.role?.name || "N/A"}
                      </CustomBadge>
                    </TableCell>
                    <TableCell>
                      <CustomBadge variant={userProfile.is_suspended ? "destructive" : "success"}>
                        {userProfile.is_suspended ? "Suspendu" : "Actif"}
                      </CustomBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <EditUserRoleDialog userProfile={userProfile} />
                        <ToggleUserStatusButton userProfile={userProfile} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;