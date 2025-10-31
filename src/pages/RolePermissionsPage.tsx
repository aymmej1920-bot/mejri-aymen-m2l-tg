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
import { Button } from "@/components/ui/button";
import { Loader2, Save, XCircle, CheckCircle } from "lucide-react";
import { useFleet } from "@/context/FleetContext";
import { Permission, RolePermission } from "@/context/FleetContext"; // Import Permission and RolePermission from FleetContext
import { Role } from "@/types/profile"; // Import Role from profile types
import { Switch } from "@/components/ui/switch";
import { CustomBadge } from "@/components/CustomBadge";
import { ScrollArea } from "@/components/ui/scroll-area";

const RolePermissionsPage: React.FC = () => {
  const { roles, permissions, rolePermissions, updateRolePermissions, isLoadingFleetData, can } = useFleet();
  const [localRolePermissions, setLocalRolePermissions] = React.useState<RolePermission[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (rolePermissions.length > 0) {
      setLocalRolePermissions(rolePermissions);
    }
  }, [rolePermissions]);

  const handlePermissionChange = (roleId: string, permissionKey: string, enabled: boolean) => {
    setLocalRolePermissions(prev => {
      const existingIndex = prev.findIndex(rp => rp.roleId === roleId && rp.permissionKey === permissionKey);
      if (existingIndex > -1) {
        const newPermissions = [...prev];
        newPermissions[existingIndex] = { ...newPermissions[existingIndex], enabled };
        return newPermissions;
      } else {
        return [...prev, { roleId, permissionKey, enabled }];
      }
    });
  };

  const getPermissionStatus = (roleId: string, permissionKey: string) => {
    const rp = localRolePermissions.find(p => p.roleId === roleId && p.permissionKey === permissionKey);
    return rp ? rp.enabled : false;
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Filter only changed permissions to send to backend
      const changes = localRolePermissions.filter(localRp => {
        const originalRp = rolePermissions.find(rp => rp.roleId === localRp.roleId && rp.permissionKey === localRp.permissionKey);
        return !originalRp || originalRp.enabled !== localRp.enabled;
      });
      await updateRolePermissions(changes);
    } catch (error) {
      console.error("Failed to update role permissions:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedPermissions = React.useMemo(() => {
    const categories = Array.from(new Set(permissions.map(p => p.category))).sort();
    const sorted: Permission[] = [];
    categories.forEach(category => {
      sorted.push(...permissions.filter(p => p.category === category).sort((a, b) => a.description.localeCompare(b.description)));
    });
    return sorted;
  }, [permissions]);

  if (isLoadingFleetData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Chargement des permissions...</p>
      </div>
    );
  }

  if (!can('roles.manage_permissions')) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Card className="glass rounded-2xl animate-fadeIn text-center p-8">
          <CardTitle className="text-2xl font-bold mb-4">Accès Refusé</CardTitle>
          <p className="text-muted-foreground">Vous n'avez pas les permissions nécessaires pour gérer les droits d'accès des rôles.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Droits d'Accès des Rôles</h1>
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="hover:animate-hover-lift gradient-brand text-primary-foreground"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Enregistrer les modifications
        </Button>
      </div>

      <Card className="glass rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Permissions par Rôle</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[70vh] w-full">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[250px]">Fonctionnalité / Permission</TableHead>
                  {roles.map(role => (
                    <TableHead key={role.id} className="text-center">
                      <CustomBadge variant="secondary">{role.name}</CustomBadge>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPermissions.map((permission, index) => (
                  <React.Fragment key={permission.id}>
                    {index === 0 || permission.category !== sortedPermissions[index - 1].category ? (
                      <TableRow className="bg-muted/20 hover:bg-muted/20">
                        <TableCell colSpan={roles.length + 1} className="font-semibold text-primary py-2">
                          {permission.category}
                        </TableCell>
                      </TableRow>
                    ) : null}
                    <TableRow>
                      <TableCell className="font-medium text-sm">{permission.description}</TableCell>
                      {roles.map(role => (
                        <TableCell key={role.id} className="text-center">
                          <Switch
                            checked={getPermissionStatus(role.id, permission.key)}
                            onCheckedChange={(checked) => handlePermissionChange(role.id, permission.key, checked)}
                            disabled={isSubmitting}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default RolePermissionsPage;