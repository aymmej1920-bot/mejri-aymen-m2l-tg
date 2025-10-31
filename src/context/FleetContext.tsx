"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Vehicle } from "@/types/vehicle";
import { Driver } from "@/types/driver";
import { Maintenance } from "@/types/maintenance";
import { FuelEntry } from "@/types/fuel";
import { Assignment } from "@/types/assignment";
import { MaintenancePlan } from "@/types/maintenancePlan";
import { Document } from "@/types/document";
import { Tour } from "@/types/tour";
import { Inspection } from "@/types/inspection";
import { AlertRule } from "@/types/alertRule";
import { Alert } from "@/types/alert";
import { Profile, Role } from "@/types/profile";
import { showSuccess, showError } from "@/utils/toast";
import { addMonths, format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useAlertChecker } from "@/hooks/use-alert-checker";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/context/SessionContext';

// Removed Permission and RolePermission types

interface FleetContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  editVehicle: (originalVehicle: Vehicle, updatedVehicle: Vehicle) => Promise<void>;
  deleteVehicle: (vehicleToDelete: Vehicle) => Promise<void>;
  drivers: Driver[];
  addDriver: (driver: Omit<Driver, 'id'>) => Promise<void>;
  editDriver: (originalDriver: Driver, updatedDriver: Driver) => Promise<void>;
  deleteDriver: (driverToDelete: Driver) => Promise<void>;
  maintenances: Maintenance[];
  addMaintenance: (maintenance: Omit<Maintenance, 'id'>) => Promise<void>;
  editMaintenance: (originalMaintenance: Maintenance, updatedMaintenance: Maintenance) => Promise<void>;
  deleteMaintenance: (maintenanceToDelete: Maintenance) => Promise<void>;
  fuelEntries: FuelEntry[];
  addFuelEntry: (fuelEntry: Omit<FuelEntry, 'id'>) => Promise<void>;
  editFuelEntry: (originalFuelEntry: FuelEntry, updatedFuelEntry: FuelEntry) => Promise<void>;
  deleteFuelEntry: (fuelEntryToDelete: FuelEntry) => Promise<void>;
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  editAssignment: (originalAssignment: Assignment, updatedAssignment: Assignment) => Promise<void>;
  deleteAssignment: (assignmentToDelete: Assignment) => Promise<void>;
  maintenancePlans: MaintenancePlan[];
  addMaintenancePlan: (plan: Omit<MaintenancePlan, 'id' | 'lastGeneratedDate' | 'nextDueDate' | 'nextDueOdometer'>) => Promise<void>;
  editMaintenancePlan: (originalPlan: MaintenancePlan, updatedPlan: MaintenancePlan) => Promise<void>;
  deleteMaintenancePlan: (planToDelete: MaintenancePlan) => Promise<void>;
  generateMaintenanceFromPlan: (plan: MaintenancePlan) => Promise<void>;
  documents: Document[];
  addDocument: (document: Omit<Document, 'id'>) => Promise<void>;
  editDocument: (originalDocument: Document, updatedDocument: Document) => Promise<void>;
  deleteDocument: (documentToDelete: Document) => Promise<void>;
  tours: Tour[];
  addTour: (tour: Omit<Tour, 'id'>) => Promise<void>;
  editTour: (originalTour: Tour, updatedTour: Tour) => Promise<void>;
  deleteTour: (tourToDelete: Tour) => Promise<void>;
  inspections: Inspection[];
  addInspection: (inspection: Omit<Inspection, 'id'>) => Promise<void>;
  editInspection: (originalInspection: Inspection, updatedInspection: Inspection) => Promise<void>;
  deleteInspection: (inspectionToDelete: Inspection) => Promise<void>;
  alertRules: AlertRule[];
  addAlertRule: (rule: Omit<AlertRule, 'id' | 'lastTriggered'>) => Promise<void>;
  editAlertRule: (originalRule: AlertRule, updatedRule: AlertRule) => Promise<void>;
  deleteAlertRule: (ruleToDelete: AlertRule) => Promise<void>;
  activeAlerts: Alert[];
  addActiveAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  clearAllAlerts: () => Promise<void>;
  clearAllData: () => Promise<void>;
  isLoadingFleetData: boolean;
  getVehicleByLicensePlate: (licensePlate: string) => Vehicle | undefined;
  getDriverByLicenseNumber: (licenseNumber: string) => Driver | undefined;
  profile: Profile | null;
  updateProfile: (updatedProfile: Omit<Profile, 'id' | 'updatedAt' | 'roleId' | 'role'>) => Promise<void>;
  roles: Role[];
  users: (Profile & { email: string; is_suspended: boolean })[];
  can: (permission: string) => boolean; // Simplified permission check
  inviteUser: (email: string, roleName: string, firstName?: string, lastName?: string) => Promise<void>;
  createUser: (email: string, password: string, roleName: string, firstName?: string, lastName?: string) => Promise<void>;
  updateUserRole: (userId: string, roleName: string) => Promise<void>;
  updateUserStatus: (userId: string, suspend: boolean) => Promise<void>;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading: isLoadingSession } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<(Profile & { email: string; is_suspended: boolean })[]>([]);
  const [isLoadingFleetData, setIsLoadingFleetData] = useState(true);

  // Memoized maps for quick lookups
  const [vehicleMap, setVehicleMap] = useState<Record<string, Vehicle>>({});
  const [driverMap, setDriverMap] = useState<Record<string, Driver>>({});

  // Helper to map snake_case to camelCase for Supabase data (recursive for nested objects)
  const mapToCamelCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => mapToCamelCase(item));
    }
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        newObj[camelKey] = mapToCamelCase(obj[key]); // Recursively map nested objects
      }
    }
    return newObj;
  };

  // Helper to map camelCase to snake_case for Supabase inserts/updates
  const mapToSnakeCase = (obj: any) => {
    if (!obj) return obj;
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        newObj[snakeKey] = obj[key];
      }
    }
    return newObj;
  };

  const getLatestOdometerReading = React.useCallback((licensePlate: string): number | null => {
    const vehicleFuelEntries = fuelEntries
      .filter(entry => entry.vehicleLicensePlate === licensePlate)
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

    return vehicleFuelEntries.length > 0 ? vehicleFuelEntries[0].odometerReading : null;
  }, [fuelEntries]);

  const fetchFleetData = React.useCallback(async () => {
    if (!user) {
      setVehicles([]);
      setDrivers([]);
      setMaintenances([]);
      setFuelEntries([]);
      setAssignments([]);
      setMaintenancePlans([]);
      setDocuments([]);
      setTours([]);
      setInspections([]);
      setAlertRules([]);
      setActiveAlerts([]);
      setProfile(null);
      setRoles([]);
      setUsers([]);
      setVehicleMap({});
      setDriverMap({});
      setIsLoadingFleetData(false);
      return;
    }

    setIsLoadingFleetData(true);
    try {
      const [
        { data: vehiclesData, error: vehiclesError },
        { data: driversData, error: driversError },
        { data: maintenancesData, error: maintenancesError },
        { data: fuelEntriesData, error: fuelEntriesError },
        { data: assignmentsData, error: assignmentsError },
        { data: maintenancePlansData, error: maintenancePlansError },
        { data: documentsData, error: documentsError },
        { data: toursData, error: toursError },
        { data: inspectionsData, error: inspectionsError },
        { data: alertRulesData, error: alertRulesError },
        { data: activeAlertsData, error: activeAlertsError },
        { data: profileData, error: profileError },
        { data: rolesData, error: rolesError },
      ] = await Promise.all([
        supabase.from('vehicles').select('*').eq('user_id', user.id),
        supabase.from('drivers').select('*').eq('user_id', user.id),
        supabase.from('maintenances').select('*').eq('user_id', user.id),
        supabase.from('fuel_entries').select('*').eq('user_id', user.id),
        supabase.from('assignments').select('*').eq('user_id', user.id),
        supabase.from('maintenance_plans').select('*').eq('user_id', user.id),
        supabase.from('documents').select('*').eq('user_id', user.id),
        supabase.from('tours').select('*').eq('user_id', user.id),
        supabase.from('inspections').select('*, checkpoints').eq('user_id', user.id),
        supabase.from('alert_rules').select('*, criteria').eq('user_id', user.id),
        supabase.from('alerts').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('id, first_name, last_name, avatar_url, updated_at, role_id').eq('id', user.id).single(),
        supabase.from('roles').select('*'),
      ]);

      if (vehiclesError) throw vehiclesError;
      if (driversError) throw driversError;
      if (maintenancesError) throw maintenancesError;
      if (fuelEntriesError) throw fuelEntriesError;
      if (assignmentsError) throw assignmentsError;
      if (maintenancePlansError) throw maintenancePlansError;
      if (documentsError) throw documentsError;
      if (toursError) throw toursError;
      if (inspectionsError) throw inspectionsError;
      if (alertRulesError) throw alertRulesError;
      if (activeAlertsError) throw activeAlertsError;
      if (rolesError) throw rolesError;

      const camelCaseRoles = mapToCamelCase(rolesData) as Role[];
      setRoles(camelCaseRoles);

      // Handle profile data and attach role manually
      if (profileError && profileError.code !== 'PGRST116') {
        console.warn("No profile found for user, creating one.", profileError);
        const { data: newProfileData, error: newProfileError } = await supabase.from('profiles').insert({ id: user.id }).select('id, first_name, last_name, avatar_url, updated_at, role_id').single();
        if (newProfileError) throw newProfileError;
        const mappedProfile = mapToCamelCase(newProfileData) as Profile;
        mappedProfile.role = camelCaseRoles.find(r => r.id === mappedProfile.roleId);
        setProfile(mappedProfile);
      } else if (profileData) {
        const mappedProfile = mapToCamelCase(profileData) as Profile;
        mappedProfile.role = camelCaseRoles.find(r => r.id === mappedProfile.roleId);
        setProfile(mappedProfile);
      }

      const camelCaseVehicles = mapToCamelCase(vehiclesData) as Vehicle[];
      const camelCaseDrivers = mapToCamelCase(driversData) as Driver[];

      setVehicles(camelCaseVehicles);
      setDrivers(camelCaseDrivers);
      setMaintenances(mapToCamelCase(maintenancesData));
      setFuelEntries(mapToCamelCase(fuelEntriesData));
      setAssignments(mapToCamelCase(assignmentsData));
      setMaintenancePlans(mapToCamelCase(maintenancePlansData));
      setDocuments(mapToCamelCase(documentsData));
      setTours(mapToCamelCase(toursData));
      setInspections(mapToCamelCase(inspectionsData));
      setAlertRules(mapToCamelCase(alertRulesData));
      setActiveAlerts(mapToCamelCase(activeAlertsData));

      // Populate maps for quick lookups
      const newVehicleMap = camelCaseVehicles.reduce((acc, v) => {
        acc[v.licensePlate] = v;
        return acc;
      }, {} as Record<string, Vehicle>);
      setVehicleMap(newVehicleMap);

      const newDriverMap = camelCaseDrivers.reduce((acc, d) => {
        acc[d.licenseNumber] = d;
        return acc;
      }, {} as Record<string, Driver>);
      setDriverMap(newDriverMap);

      // Fetch all users for Admin if current user is Admin
      const currentUserProfile = profileData ? (mapToCamelCase(profileData) as Profile) : null;
      if (currentUserProfile?.roleId) {
        const adminRole = camelCaseRoles.find(r => r.id === currentUserProfile.roleId && r.name === 'Admin');
        if (adminRole) {
          const { data: edgeFunctionUsersData, error: edgeFunctionUsersError } = await supabase.functions.invoke('admin-user-management', {
              body: { action: 'listUsers' },
              headers: {
                'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
                'Content-Type': 'application/json',
              },
            });

            if (edgeFunctionUsersError) throw edgeFunctionUsersError;
            if (edgeFunctionUsersData?.error) throw new Error(edgeFunctionUsersData.error);

            // Manually attach role objects to users fetched from Edge Function
            const usersWithAttachedRoles = edgeFunctionUsersData.users.map((u: any) => ({
              ...u,
              role: camelCaseRoles.find(r => r.id === u.roleId) || null,
            }));
            setUsers(usersWithAttachedRoles);
        }
      }


    } catch (error: any) {
      showError("Erreur lors du chargement des données de la flotte : " + error.message);
      console.error("Error fetching fleet data:", error);
    } finally {
      setIsLoadingFleetData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoadingSession) {
      fetchFleetData();
    }
  }, [user, isLoadingSession, fetchFleetData]);

  // Real-time subscription for alerts
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('public:alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts', filter: `user_id=eq.${user.id}` }, (payload) => {
        const camelCasePayload = mapToCamelCase(payload.new);
        if (payload.eventType === 'INSERT') {
          setActiveAlerts((prev) => [...prev, camelCasePayload]);
          showSuccess("Nouvelle alerte reçue !");
        } else if (payload.eventType === 'UPDATE') {
          setActiveAlerts((prev) =>
            prev.map((alert) => (alert.id === camelCasePayload.id ? camelCasePayload : alert))
          );
        } else if (payload.eventType === 'DELETE') {
          setActiveAlerts((prev) => prev.filter((alert) => alert.id !== camelCasePayload.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Simplified Permissions logic: only check if user is Admin for admin-level actions
  const can = React.useCallback((permissionKey: string): boolean => {
    // For now, only 'Admin' role has special permissions for user management and settings.
    // Other permissions are implicitly granted by being logged in and having RLS set up.
    const isAdmin = profile?.role?.name === 'Admin';

    switch (permissionKey) {
      case 'users.view':
      case 'users.invite':
      case 'users.create':
      case 'users.edit_role':
      case 'users.toggle_status':
      case 'settings.clear_data':
        return isAdmin;
      // All other permissions are implicitly true for authenticated users based on RLS
      default:
        return !!user;
    }
  }, [profile, user]);


  // Optimized getter functions
  const getVehicleByLicensePlate = React.useCallback((licensePlate: string) => vehicleMap[licensePlate], [vehicleMap]);
  const getDriverByLicenseNumber = React.useCallback((licenseNumber: string) => driverMap[licenseNumber], [driverMap]);

  // --- Profile ---
  const updateProfile = async (updatedProfile: Omit<Profile, 'id' | 'updatedAt' | 'roleId' | 'role'>) => {
    if (!user) { showError("Vous devez être connecté pour modifier votre profil."); return; }
    try {
      const { data, error } = await supabase.from('profiles').update(mapToSnakeCase(updatedProfile)).eq('id', user.id).select('id, first_name, last_name, avatar_url, updated_at, role_id').single();
      if (error) throw error;
      const mappedProfile = mapToCamelCase(data) as Profile;
      mappedProfile.role = roles.find(r => r.id === mappedProfile.roleId); // Attach role manually
      setProfile(mappedProfile);
      showSuccess("Profil mis à jour avec succès !");
    } catch (error: any) {
      showError("Échec de la mise à jour du profil : " + error.message);
      console.error("Error updating profile:", error);
    }
  };

  // --- User Management (Admin only, via Edge Functions for security) ---
  const invokeAdminFunction = async (functionName: string, payload: any) => {
    if (!user) {
      showError("Vous devez être connecté pour effectuer cette action.");
      throw new Error("Unauthorized");
    }
    // Simplified permission check: only Admin can invoke admin functions
    if (!can('users.view')) { // Using a generic admin permission check
      showError("Vous n'avez pas la permission d'effectuer cette action.");
      throw new Error("Permission denied");
    }

    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        headers: {
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      showSuccess(data.message || "Action d'administration réussie !");
      fetchFleetData(); // Re-fetch all data to update user list and roles
    } catch (error: any) {
      showError("Échec de l'action d'administration : " + error.message);
      console.error(`Error invoking ${functionName} function:`, error);
      throw error;
    }
  };

  const inviteUser = async (email: string, roleName: string, firstName?: string, lastName?: string) => {
    if (!can('users.invite')) { showError("Vous n'avez pas la permission d'inviter des utilisateurs."); return; }
    await invokeAdminFunction('admin-user-management', {
      action: 'inviteUser',
      email,
      roleName,
      firstName,
      lastName,
    });
  };

  const createUser = async (email: string, password: string, roleName: string, firstName?: string, lastName?: string) => {
    if (!can('users.create')) { showError("Vous n'avez pas la permission de créer des utilisateurs."); return; }
    await invokeAdminFunction('admin-user-management', {
      action: 'createUser',
      email,
      password,
      roleName,
      firstName,
      lastName,
    });
  };

  const updateUserRole = async (userId: string, roleName: string) => {
    if (!can('users.edit_role')) { showError("Vous n'avez pas la permission de modifier les rôles des utilisateurs."); return; }
    await invokeAdminFunction('admin-user-management', {
      action: 'updateUserRole',
      userId,
      roleName,
    });
  };

  const updateUserStatus = async (userId: string, suspend: boolean) => {
    if (!can('users.toggle_status')) { showError("Vous n'avez pas la permission de suspendre/activer des comptes utilisateurs."); return; }
    await invokeAdminFunction('admin-user-management', {
      action: 'updateUserStatus',
      userId,
      suspend,
    });
  };

  // This function is no longer used and was causing a TS6133 error.
  // const updateRolePermissions = async (updates: any[]) => {
  //   showError("La gestion des permissions de rôle n'est plus disponible.");
  //   throw new Error("Role permission management is disabled.");
  // };


  // --- Vehicles ---
  const addVehicle = async (newVehicle: Omit<Vehicle, 'id'>) => {
    if (!user || !can('vehicles.add')) { showError("Vous n'avez pas la permission d'ajouter un véhicule."); return; }
    try {
      const { data, error } = await supabase.from('vehicles').insert({ ...mapToSnakeCase(newVehicle), user_id: user.id }).select();
      if (error) throw error;
      const addedVehicle = mapToCamelCase(data[0]);
      setVehicles((prev) => [...prev, addedVehicle]);
      setVehicleMap((prev) => ({ ...prev, [addedVehicle.licensePlate]: addedVehicle }));
      showSuccess("Véhicule ajouté avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout du véhicule : " + error.message);
      console.error("Error adding vehicle:", error);
    }
  };

  const editVehicle = async (originalVehicle: Vehicle, updatedVehicle: Vehicle) => {
    if (!user || !can('vehicles.edit')) { showError("Vous n'avez pas la permission de modifier un véhicule."); return; }
    try {
      const { data, error } = await supabase.from('vehicles').update(mapToSnakeCase(updatedVehicle)).eq('id', originalVehicle.id).select();
      if (error) throw error;
      const editedVehicle = mapToCamelCase(data[0]);
      setVehicles((prev) => prev.map((item) => (item.id === originalVehicle.id ? editedVehicle : item)));
      setVehicleMap((prev) => {
        const newMap = { ...prev };
        if (originalVehicle.licensePlate !== editedVehicle.licensePlate) {
          delete newMap[originalVehicle.licensePlate];
        }
        newMap[editedVehicle.licensePlate] = editedVehicle;
        return newMap;
      });
      showSuccess("Véhicule modifié avec succès !");
    } catch (error: any) {
      showError("Échec de la modification du véhicule : " + error.message);
      console.error("Error editing vehicle:", error);
    }
  };

  const deleteVehicle = async (vehicleToDelete: Vehicle) => {
    if (!user || !can('vehicles.delete')) { showError("Vous n'avez pas la permission de supprimer un véhicule."); return; }
    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', vehicleToDelete.id);
      if (error) throw error;
      setVehicles((prev) => prev.filter((item) => item.id !== vehicleToDelete.id));
      setVehicleMap((prev) => {
        const newMap = { ...prev };
        delete newMap[vehicleToDelete.licensePlate];
        return newMap;
      });
      showSuccess("Véhicule supprimé avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression du véhicule : " + error.message);
      console.error("Error deleting vehicle:", error);
    }
  };

  // --- Drivers ---
  const addDriver = async (newDriver: Omit<Driver, 'id'>) => {
    if (!user || !can('drivers.add')) { showError("Vous n'avez pas la permission d'ajouter un conducteur."); return; }
    try {
      const { data, error } = await supabase.from('drivers').insert({ ...mapToSnakeCase(newDriver), user_id: user.id }).select();
      if (error) throw error;
      const addedDriver = mapToCamelCase(data[0]);
      setDrivers((prev) => [...prev, addedDriver]);
      setDriverMap((prev) => ({ ...prev, [addedDriver.licenseNumber]: addedDriver }));
      showSuccess("Conducteur ajouté avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout du conducteur : " + error.message);
      console.error("Error adding driver:", error);
    }
  };

  const editDriver = async (originalDriver: Driver, updatedDriver: Driver) => {
    if (!user || !can('drivers.edit')) { showError("Vous n'avez pas la permission de modifier un conducteur."); return; }
    try {
      const { data, error } = await supabase.from('drivers').update(mapToSnakeCase(updatedDriver)).eq('id', originalDriver.id).select();
      if (error) throw error;
      const editedDriver = mapToCamelCase(data[0]);
      setDrivers((prev) => prev.map((item) => (item.id === originalDriver.id ? editedDriver : item)));
      setDriverMap((prev) => {
        const newMap = { ...prev };
        if (originalDriver.licenseNumber !== editedDriver.licenseNumber) {
          delete newMap[originalDriver.licenseNumber];
        }
        newMap[editedDriver.licenseNumber] = editedDriver;
        return newMap;
      });
      showSuccess("Conducteur modifié avec succès !");
    } catch (error: any) {
      showError("Échec de la modification du conducteur : " + error.message);
      console.error("Error editing driver:", error);
    }
  };

  const deleteDriver = async (driverToDelete: Driver) => {
    if (!user || !can('drivers.delete')) { showError("Vous n'avez pas la permission de supprimer un conducteur."); return; }
    try {
      const { error } = await supabase.from('drivers').delete().eq('id', driverToDelete.id);
      if (error) throw error;
      setDrivers((prev) => prev.filter((item) => item.id !== driverToDelete.id));
      setDriverMap((prev) => {
        const newMap = { ...prev };
        delete newMap[driverToDelete.licenseNumber];
        return newMap;
      });
      showSuccess("Conducteur supprimé avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression du conducteur : " + error.message);
      console.error("Error deleting driver:", error);
    }
  };

  // --- Maintenances ---
  const addMaintenance = async (newMaintenance: Omit<Maintenance, 'id'>) => {
    if (!user || !can('maintenances.add')) { showError("Vous n'avez pas la permission d'ajouter une maintenance."); return; }
    try {
      const { data, error } = await supabase.from('maintenances').insert({ ...mapToSnakeCase(newMaintenance), user_id: user.id }).select();
      if (error) throw error;
      setMaintenances((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Maintenance ajoutée avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout de la maintenance : " + error.message);
      console.error("Error adding maintenance:", error);
    }
  };

  const editMaintenance = async (originalMaintenance: Maintenance, updatedMaintenance: Maintenance) => {
    if (!user || !can('maintenances.edit')) { showError("Vous n'avez pas la permission de modifier une maintenance."); return; }
    try {
      const { data, error } = await supabase.from('maintenances').update(mapToSnakeCase(updatedMaintenance)).eq('id', originalMaintenance.id).select();
      if (error) throw error;
      setMaintenances((prev) => prev.map((item) => (item.id === originalMaintenance.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Maintenance modifiée avec succès !");
    } catch (error: any) {
      showError("Échec de la modification de la maintenance : " + error.message);
      console.error("Error editing maintenance:", error);
    }
  };

  const deleteMaintenance = async (maintenanceToDelete: Maintenance) => {
    if (!user || !can('maintenances.delete')) { showError("Vous n'avez pas la permission de supprimer une maintenance."); return; }
    try {
      const { error } = await supabase.from('maintenances').delete().eq('id', maintenanceToDelete.id);
      if (error) throw error;
      setMaintenances((prev) => prev.filter((item) => item.id !== maintenanceToDelete.id));
      showSuccess("Maintenance supprimée avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression de la maintenance : " + error.message);
      console.error("Error deleting maintenance:", error);
    }
  };

  // --- Fuel Entries ---
  const addFuelEntry = async (newFuelEntry: Omit<FuelEntry, 'id'>) => {
    if (!user || !can('fuel_entries.add')) { showError("Vous n'avez pas la permission d'ajouter une entrée de carburant."); return; }
    try {
      const { data, error } = await supabase.from('fuel_entries').insert({ ...mapToSnakeCase(newFuelEntry), user_id: user.id }).select();
      if (error) throw error;
      setFuelEntries((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Entrée de carburant ajoutée avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout de l'entrée de carburant : " + error.message);
      console.error("Error adding fuel entry:", error);
    }
  };

  const editFuelEntry = async (originalFuelEntry: FuelEntry, updatedFuelEntry: FuelEntry) => {
    if (!user || !can('fuel_entries.edit')) { showError("Vous n'avez pas la permission de modifier une entrée de carburant."); return; }
    try {
      const { data, error } = await supabase.from('fuel_entries').update(mapToSnakeCase(updatedFuelEntry)).eq('id', originalFuelEntry.id).select();
      if (error) throw error;
      setFuelEntries((prev) => prev.map((item) => (item.id === originalFuelEntry.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Entrée de carburant modifiée avec succès !");
    } catch (error: any) {
      showError("Échec de la modification de l'entrée de carburant : " + error.message);
      console.error("Error editing fuel entry:", error);
    }
  };

  const deleteFuelEntry = async (fuelEntryToDelete: FuelEntry) => {
    if (!user || !can('fuel_entries.delete')) { showError("Vous n'avez pas la permission de supprimer une entrée de carburant."); return; }
    try {
      const { error } = await supabase.from('fuel_entries').delete().eq('id', fuelEntryToDelete.id);
      if (error) throw error;
      setFuelEntries((prev) => prev.filter((item) => item.id !== fuelEntryToDelete.id));
      showSuccess("Entrée de carburant supprimée avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression de l'entrée de carburant : " + error.message);
      console.error("Error deleting fuel entry:", error);
    }
  };

  // --- Assignments ---
  const addAssignment = async (newAssignment: Omit<Assignment, 'id'>) => {
    if (!user || !can('assignments.add')) { showError("Vous n'avez pas la permission d'ajouter une affectation."); return; }
    try {
      const { data, error } = await supabase.from('assignments').insert({ ...mapToSnakeCase(newAssignment), user_id: user.id }).select();
      if (error) throw error;
      setAssignments((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Affectation ajoutée avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout de l'affectation : " + error.message);
      console.error("Error adding assignment:", error);
    }
  };

  const editAssignment = async (originalAssignment: Assignment, updatedAssignment: Assignment) => {
    if (!user || !can('assignments.edit')) { showError("Vous n'avez pas la permission de modifier une affectation."); return; }
    try {
      const { data, error } = await supabase.from('assignments').update(mapToSnakeCase(updatedAssignment)).eq('id', originalAssignment.id).select();
      if (error) throw error;
      setAssignments((prev) => prev.map((item) => (item.id === originalAssignment.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Affectation modifiée avec succès !");
    } catch (error: any) {
      showError("Échec de la modification de l'affectation : " + error.message);
      console.error("Error editing assignment:", error);
    }
  };

  const deleteAssignment = async (assignmentToDelete: Assignment) => {
    if (!user || !can('assignments.delete')) { showError("Vous n'avez pas la permission de supprimer une affectation."); return; }
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', assignmentToDelete.id);
      if (error) throw error;
      setAssignments((prev) => prev.filter((item) => item.id !== assignmentToDelete.id));
      showSuccess("Affectation supprimée avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression de l'affectation : " + error.message);
      console.error("Error deleting assignment:", error);
    }
  };

  // --- Maintenance Plans ---
  const addMaintenancePlan = async (newPlan: Omit<MaintenancePlan, 'id' | 'lastGeneratedDate' | 'nextDueDate' | 'nextDueOdometer'>) => {
    if (!user || !can('maintenance_plans.add')) { showError("Vous n'avez pas la permission d'ajouter un plan de maintenance."); return; }
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      let nextDueDate: string | null = null;
      let nextDueOdometer: number | null = null;

      if (newPlan.intervalType === "Temps") {
        const futureDate = addMonths(new Date(), newPlan.intervalValue);
        nextDueDate = format(futureDate, "yyyy-MM-dd");
      } else if (newPlan.intervalType === "Kilométrage") {
        const latestOdometer = getLatestOdometerReading(newPlan.vehicleLicensePlate);
        if (latestOdometer !== null) {
          nextDueOdometer = latestOdometer + newPlan.intervalValue;
        } else {
          showError("Impossible de calculer le prochain kilométrage d'échéance : aucun relevé kilométrique trouvé pour ce véhicule.");
        }
      }

      const planToInsert = {
        ...mapToSnakeCase(newPlan),
        user_id: user.id,
        last_generated_date: null,
        next_due_date: nextDueDate,
        next_due_odometer: nextDueOdometer,
      };

      const { data, error } = await supabase.from('maintenance_plans').insert(planToInsert).select();
      if (error) throw error;
      setMaintenancePlans((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Plan de maintenance ajouté avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout du plan de maintenance : " + error.message);
      console.error("Error adding maintenance plan:", error);
    }
  };

  const editMaintenancePlan = async (originalPlan: MaintenancePlan, updatedPlan: MaintenancePlan) => {
    if (!user || !can('maintenance_plans.edit')) { showError("Vous n'avez pas la permission de modifier un plan de maintenance."); return; }
    try {
      let nextDueDate: string | null = updatedPlan.nextDueDate;
      let nextDueOdometer: number | null = updatedPlan.nextDueOdometer;

      // Recalculate if interval type or value changed, or if it's a new plan being activated
      if (originalPlan.intervalType !== updatedPlan.intervalType || originalPlan.intervalValue !== updatedPlan.intervalValue || (originalPlan.status === "Inactif" && updatedPlan.status === "Actif")) {
        if (updatedPlan.intervalType === "Temps") {
          const futureDate = addMonths(new Date(), updatedPlan.intervalValue);
          nextDueDate = format(futureDate, "yyyy-MM-dd");
          nextDueOdometer = null; // Reset odometer if changing to time-based
        } else if (updatedPlan.intervalType === "Kilométrage") {
          const latestOdometer = getLatestOdometerReading(updatedPlan.vehicleLicensePlate);
          if (latestOdometer !== null) {
            nextDueOdometer = latestOdometer + updatedPlan.intervalValue;
            nextDueDate = null; // Reset date if changing to mileage-based
          } else {
            showError("Impossible de calculer le prochain kilométrage d'échéance : aucun relevé kilométrique trouvé pour ce véhicule.");
            nextDueOdometer = null;
          }
        }
      }

      const planToUpdate = {
        ...mapToSnakeCase(updatedPlan),
        next_due_date: nextDueDate,
        next_due_odometer: nextDueOdometer,
      };

      const { data, error } = await supabase.from('maintenance_plans').update(planToUpdate).eq('id', originalPlan.id).select();
      if (error) throw error;
      setMaintenancePlans((prev) => prev.map((item) => (item.id === originalPlan.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Plan de maintenance modifié avec succès !");
    } catch (error: any) {
      showError("Échec de la modification du plan de maintenance : " + error.message);
      console.error("Error editing maintenance plan:", error);
    }
  };

  const deleteMaintenancePlan = async (planToDelete: MaintenancePlan) => {
    if (!user || !can('maintenance_plans.delete')) { showError("Vous n'avez pas la permission de supprimer un plan de maintenance."); return; }
    try {
      const { error } = await supabase.from('maintenance_plans').delete().eq('id', planToDelete.id);
      if (error) throw error;
      setMaintenancePlans((prev) => prev.filter((item) => item.id !== planToDelete.id));
      showSuccess("Plan de maintenance supprimé avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression du plan de maintenance : " + error.message);
      console.error("Error deleting maintenance plan:", error);
    }
  };

  const generateMaintenanceFromPlan = async (plan: MaintenancePlan) => {
    if (!user || !can('maintenance_plans.generate')) { showError("Vous n'avez pas la permission de générer une maintenance."); return; }
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      const newMaintenance: Omit<Maintenance, 'id'> = {
        vehicleLicensePlate: plan.vehicleLicensePlate,
        type: plan.type,
        description: `Maintenance générée par plan: ${plan.description}`,
        cost: plan.estimatedCost,
        date: today,
        provider: plan.provider,
        status: "Planifiée",
      };

      await addMaintenance(newMaintenance); // Use the Supabase-enabled addMaintenance

      let nextDueDate: string | null = null;
      let nextDueOdometer: number | null = null;

      if (plan.intervalType === "Temps") {
        const lastDate = new Date(today);
        const futureDate = addMonths(lastDate, plan.intervalValue);
        nextDueDate = format(futureDate, "yyyy-MM-dd");
      } else if (plan.intervalType === "Kilométrage") {
        const latestOdometer = getLatestOdometerReading(plan.vehicleLicensePlate);
        if (latestOdometer !== null) {
          nextDueOdometer = latestOdometer + plan.intervalValue;
        } else {
          showError("Impossible de calculer le prochain kilométrage d'échéance : aucun relevé kilométrique trouvé pour ce véhicule.");
        }
      }

      const updatedPlan: MaintenancePlan = {
        ...plan,
        lastGeneratedDate: today,
        nextDueDate: nextDueDate,
        nextDueOdometer: nextDueOdometer,
        status: "Actif",
      };
      await editMaintenancePlan(plan, updatedPlan); // Use the Supabase-enabled editMaintenancePlan
      showSuccess(`Maintenance générée pour le véhicule ${plan.vehicleLicensePlate} !`);
    } catch (error: any) {
      showError("Échec de la génération de la maintenance : " + error.message);
      console.error("Error generating maintenance from plan:", error);
    }
  };

  // --- Documents ---
  const addDocument = async (newDocument: Omit<Document, 'id'>) => {
    if (!user || !can('documents.add')) { showError("Vous n'avez pas la permission d'ajouter un document."); return; }
    try {
      const { data, error } = await supabase.from('documents').insert({ ...mapToSnakeCase(newDocument), user_id: user.id }).select();
      if (error) throw error;
      setDocuments((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Document ajouté avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout du document : " + error.message);
      console.error("Error adding document:", error);
    }
  };

  const editDocument = async (originalDocument: Document, updatedDocument: Document) => {
    if (!user || !can('documents.edit')) { showError("Vous n'avez pas la permission de modifier un document."); return; }
    try {
      const { data, error } = await supabase.from('documents').update(mapToSnakeCase(updatedDocument)).eq('id', originalDocument.id).select();
      if (error) throw error;
      setDocuments((prev) => prev.map((item) => (item.id === originalDocument.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Document modifié avec succès !");
    } catch (error: any) {
      showError("Échec de la modification du document : " + error.message);
      console.error("Error editing document:", error);
    }
  };

  const deleteDocument = async (documentToDelete: Document) => {
    if (!user || !can('documents.delete')) { showError("Vous n'avez pas la permission de supprimer un document."); return; }
    try {
      const { error } = await supabase.from('documents').delete().eq('id', documentToDelete.id);
      if (error) throw error;
      setDocuments((prev) => prev.filter((item) => item.id !== documentToDelete.id));
      showSuccess("Document supprimé avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression du document : " + error.message);
      console.error("Error deleting document:", error);
    }
  };

  // --- Tours ---
  const addTour = async (newTour: Omit<Tour, 'id'>) => {
    if (!user || !can('tours.add')) { showError("Vous n'avez pas la permission d'ajouter une tournée."); return; }
    try {
      const { data, error } = await supabase.from('tours').insert({ ...mapToSnakeCase(newTour), user_id: user.id }).select();
      if (error) throw error;
      setTours((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Tournée ajoutée avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout de la tournée : " + error.message);
      console.error("Error adding tour:", error);
    }
  };

  const editTour = async (originalTour: Tour, updatedTour: Tour) => {
    if (!user || !can('tours.edit')) { showError("Vous n'avez pas la permission de modifier une tournée."); return; }
    try {
      const { data, error } = await supabase.from('tours').update(mapToSnakeCase(updatedTour)).eq('id', originalTour.id).select();
      if (error) throw error;
      setTours((prev) => prev.map((item) => (item.id === originalTour.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Tournée modifiée avec succès !");
    } catch (error: any) {
      showError("Échec de la modification de la tournée : " + error.message);
      console.error("Error editing tour:", error);
    }
  };

  const deleteTour = async (tourToDelete: Tour) => {
    if (!user || !can('tours.delete')) { showError("Vous n'avez pas la permission de supprimer une tournée."); return; }
    try {
      const { error } = await supabase.from('tours').delete().eq('id', tourToDelete.id);
      if (error) throw error;
      setTours((prev) => prev.filter((item) => item.id !== tourToDelete.id));
      showSuccess("Tournée supprimée avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression de la tournée : " + error.message);
      console.error("Error deleting tour:", error);
    }
  };

  // --- Inspections ---
  const addInspection = async (newInspection: Omit<Inspection, 'id'>) => {
    if (!user || !can('inspections.add')) { showError("Vous n'avez pas la permission d'ajouter une inspection."); return; }
    try {
      const { data, error } = await supabase.from('inspections').insert({ ...mapToSnakeCase(newInspection), user_id: user.id }).select();
      if (error) throw error;
      setInspections((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Inspection ajoutée avec succès !");

      newInspection.checkpoints.forEach(async cp => {
        if (cp.status === "NOK") {
          try {
            await addMaintenance({ // Use the Supabase-enabled addMaintenance
              vehicleLicensePlate: newInspection.vehicleLicensePlate,
              type: "Corrective",
              description: `Maintenance corrective requise suite à l'inspection du ${format(new Date(newInspection.date), "PPP", { locale: fr })} - Point: ${cp.name}. Observation: ${cp.observation || "Aucune"}.`,
              cost: 0,
              date: format(new Date(), "yyyy-MM-dd"),
              provider: "À définir",
              status: "Planifiée",
            });
          } catch (maintenanceError: any) {
            showError("Échec de la génération de la maintenance corrective : " + maintenanceError.message);
            console.error("Error generating corrective maintenance:", maintenanceError);
          }
        }
      });
    } catch (error: any) {
      showError("Échec de l'ajout de l'inspection : " + error.message);
      console.error("Error adding inspection:", error);
    }
  };

  const editInspection = async (originalInspection: Inspection, updatedInspection: Inspection) => {
    if (!user || !can('inspections.edit')) { showError("Vous n'avez pas la permission de modifier une inspection."); return; }
    try {
      const { data, error } = await supabase.from('inspections').update(mapToSnakeCase(updatedInspection)).eq('id', originalInspection.id).select();
      if (error) throw error;
      setInspections((prev) => prev.map((item) => (item.id === originalInspection.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Inspection modifiée avec succès !");

      updatedInspection.checkpoints.forEach(async cp => {
        if (cp.status === "NOK") {
          try {
            await addMaintenance({ // Use the Supabase-enabled addMaintenance
              vehicleLicensePlate: updatedInspection.vehicleLicensePlate,
              type: "Corrective",
              description: `Maintenance corrective requise suite à la modification de l'inspection du ${format(new Date(updatedInspection.date), "PPP", { locale: fr })} - Point: ${cp.name}. Observation: ${cp.observation || "Aucune"}.`,
              cost: 0,
              date: format(new Date(), "yyyy-MM-dd"),
              provider: "À définir",
              status: "Planifiée",
            });
          } catch (maintenanceError: any) {
            showError("Échec de la génération de la maintenance corrective : " + maintenanceError.message);
            console.error("Error generating corrective maintenance on edit:", maintenanceError);
          }
        }
      });
    } catch (error: any) {
      showError("Échec de la modification de l'inspection : " + error.message);
      console.error("Error editing inspection:", error);
    }
  };

  const deleteInspection = async (inspectionToDelete: Inspection) => {
    if (!user || !can('inspections.delete')) { showError("Vous n'avez pas la permission de supprimer une inspection."); return; }
    try {
      const { error } = await supabase.from('inspections').delete().eq('id', inspectionToDelete.id);
      if (error) throw error;
      setInspections((prev) => prev.filter((item) => item.id !== inspectionToDelete.id));
      showSuccess("Inspection supprimée avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression de l'inspection : " + error.message);
      console.error("Error deleting inspection:", error);
    }
  };

  // --- Alert Rules ---
  const addAlertRule = async (newRule: Omit<AlertRule, 'id' | 'lastTriggered'>) => {
    if (!user || !can('alert_rules.add')) { showError("Vous n'avez pas la permission d'ajouter une règle d'alerte."); return; }
    try {
      const { data, error } = await supabase.from('alert_rules').insert({ ...mapToSnakeCase(newRule), user_id: user.id, last_triggered: null }).select();
      if (error) throw error;
      setAlertRules((prev) => [...prev, mapToCamelCase(data[0])]);
      showSuccess("Règle d'alerte ajoutée avec succès !");
    } catch (error: any) {
      showError("Échec de l'ajout de la règle d'alerte : " + error.message);
      console.error("Error adding alert rule:", error);
    }
  };

  const editAlertRule = async (originalRule: AlertRule, updatedRule: AlertRule) => {
    if (!user || !can('alert_rules.edit')) { showError("Vous n'avez pas la permission de modifier une règle d'alerte."); return; }
    try {
      const { data, error } = await supabase.from('alert_rules').update(mapToSnakeCase(updatedRule)).eq('id', originalRule.id).select();
      if (error) throw error;
      setAlertRules((prev) => prev.map((item) => (item.id === originalRule.id ? mapToCamelCase(data[0]) : item)));
      showSuccess("Règle d'alerte modifiée avec succès !");
    } catch (error: any) {
      showError("Échec de la modification de la règle d'alerte : " + error.message);
      console.error("Error editing alert rule:", error);
    }
  };

  const deleteAlertRule = async (ruleToDelete: AlertRule) => {
    if (!user || !can('alert_rules.delete')) { showError("Vous n'avez pas la permission de supprimer une règle d'alerte."); return; }
    try {
      const { error } = await supabase.from('alert_rules').delete().eq('id', ruleToDelete.id);
      if (error) throw error;
      setAlertRules((prev) => prev.filter((item) => item.id !== ruleToDelete.id));
      showSuccess("Règle d'alerte supprimée avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression de la règle d'alerte : " + error.message);
      console.error("Error deleting alert rule:", error);
    }
  };

  // --- Active Alerts ---
  const addActiveAlert = async (newAlert: Omit<Alert, 'id' | 'createdAt' | 'isRead'>) => {
    if (!user) { showError("Vous devez être connecté pour ajouter une alerte."); return; }
    try {
      const alertToInsert = {
        ...mapToSnakeCase(newAlert),
        user_id: user.id,
        created_at: new Date().toISOString(),
        is_read: false,
      };
      const { error } = await supabase.from('alerts').insert(alertToInsert).select();
      if (error) throw error;
      // Realtime subscription will handle updating the state, no need to do it here
      // setActiveAlerts((prev) => [...prev, mapToCamelCase(data[0])]);
    } catch (error: any) {
      showError("Échec de l'ajout de l'alerte : " + error.message);
      console.error("Error adding active alert:", error);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    if (!user) { showError("Vous devez être connecté pour marquer une alerte comme lue."); return; }
    try {
      const { error } = await supabase.from('alerts').update({ is_read: true }).eq('id', alertId).select();
      if (error) throw error;
      // Realtime subscription will handle updating the state, no need to do it here
      // setActiveAlerts(prev => prev.map(alert =>
      //   alert.id === alertId ? { ...alert, isRead: true } : alert
      // ));
      showSuccess("Alerte marquée comme lue !");
    } catch (error: any) {
      showError("Échec de la mise à jour de l'alerte : " + error.message);
      console.error("Error marking alert as read:", error);
    }
  };

  const clearAllAlerts = async () => {
    if (!user) { showError("Vous devez être connecté pour effacer les alertes."); return; }
    try {
      const { error } = await supabase.from('alerts').delete().eq('user_id', user.id);
      if (error) throw error;
      setActiveAlerts([]);
      showSuccess("Toutes les alertes ont été effacées !");
    } catch (error: any) {
      showError("Échec de l'effacement des alertes : " + error.message);
      console.error("Error clearing all alerts:", error);
    }
  };

  const clearAllData = async () => {
    if (!user || !can('settings.clear_data')) { showError("Vous n'avez pas la permission d'effacer toutes les données."); return; }
    try {
      // Delete from all tables for the current user
      const { error: vehiclesError } = await supabase.from('vehicles').delete().eq('user_id', user.id);
      const { error: driversError } = await supabase.from('drivers').delete().eq('user_id', user.id);
      const { error: maintenancesError } = await supabase.from('maintenances').delete().eq('user_id', user.id);
      const { error: fuelEntriesError } = await supabase.from('fuel_entries').delete().eq('user_id', user.id);
      const { error: assignmentsError } = await supabase.from('assignments').delete().eq('user_id', user.id);
      const { error: maintenancePlansError } = await supabase.from('maintenance_plans').delete().eq('user_id', user.id);
      const { error: documentsError } = await supabase.from('documents').delete().eq('user_id', user.id);
      const { error: toursError } = await supabase.from('tours').delete().eq('user_id', user.id);
      const { error: inspectionsError } = await supabase.from('inspections').delete().eq('user_id', user.id);
      const { error: alertRulesError } = await supabase.from('alert_rules').delete().eq('user_id', user.id);
      const { error: alertsError } = await supabase.from('alerts').delete().eq('user_id', user.id);
      const { error: profilesError } = await supabase.from('profiles').delete().eq('id', user.id); // Delete profile

      if (vehiclesError) throw vehiclesError;
      if (driversError) throw driversError;
      if (maintenancesError) throw maintenancesError;
      if (fuelEntriesError) throw fuelEntriesError;
      if (assignmentsError) throw assignmentsError;
      if (maintenancePlansError) throw maintenancePlansError;
      if (documentsError) throw documentsError;
      if (toursError) throw toursError;
      if (inspectionsError) throw inspectionsError;
      if (alertRulesError) throw alertRulesError;
      if (alertsError) throw alertsError;
      if (profilesError) throw profilesError;

      // Reset local states
      setVehicles([]);
      setDrivers([]);
      setMaintenances([]);
      setFuelEntries([]);
      setAssignments([]);
      setMaintenancePlans([]);
      setDocuments([]);
      setTours([]);
      setInspections([]);
      setAlertRules([]);
      setActiveAlerts([]);
      setProfile(null);
      setRoles([]);
      setUsers([]);
      setVehicleMap({});
      setDriverMap({});
      showSuccess("Toutes les données de la flotte ont été effacées !");
    } catch (error: any) {
      showError("Échec de l'effacement de toutes les données : " + error.message);
      console.error("Error clearing all data:", error);
    }
  };

  // Integrate alert checker
  useAlertChecker({
    alertRules,
    maintenancePlans,
    documents,
    assignments,
    drivers,
    setAlertRules, // This will need to be updated to call Supabase for rule updates
    addActiveAlert,
  });

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
        maintenances,
        addMaintenance,
        editMaintenance,
        deleteMaintenance,
        fuelEntries,
        addFuelEntry,
        editFuelEntry,
        deleteFuelEntry,
        assignments,
        addAssignment,
        editAssignment,
        deleteAssignment,
        maintenancePlans,
        addMaintenancePlan,
        editMaintenancePlan,
        deleteMaintenancePlan,
        generateMaintenanceFromPlan,
        documents,
        addDocument,
        editDocument,
        deleteDocument,
        tours,
        addTour,
        editTour,
        deleteTour,
        inspections,
        addInspection,
        editInspection,
        deleteInspection,
        alertRules,
        addAlertRule,
        editAlertRule,
        deleteAlertRule,
        activeAlerts,
        addActiveAlert,
        markAlertAsRead,
        clearAllAlerts,
        clearAllData,
        isLoadingFleetData,
        getVehicleByLicensePlate,
        getDriverByLicenseNumber,
        profile,
        updateProfile,
        roles,
        users,
        can,
        inviteUser,
        createUser,
        updateUserRole,
        updateUserStatus,
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