"use client";

import React, { useEffect, useRef } from "react";
import { format, differenceInDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { showError } from "@/utils/toast"; // Garder showError pour les messages d'erreur généraux si besoin
import { AlertRule } from "@/types/alertRule";
import { MaintenancePlan } from "@/types/maintenancePlan";
import { Document } from "@/types/document";
import { Assignment } from "@/types/assignment";
import { Driver } from "@/types/driver";
import { Alert } from "@/types/alert"; // Importez le nouveau type Alert

interface UseAlertCheckerProps {
  alertRules: AlertRule[];
  maintenancePlans: MaintenancePlan[];
  documents: Document[];
  assignments: Assignment[];
  drivers: Driver[];
  setAlertRules: React.Dispatch<React.SetStateAction<AlertRule[]>>;
  addActiveAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'isRead'>) => void; // Nouveau : fonction pour ajouter une alerte active
}

export function useAlertChecker({
  alertRules,
  maintenancePlans,
  documents,
  assignments,
  drivers,
  setAlertRules,
  addActiveAlert,
}: UseAlertCheckerProps) {
  const triggeredAlertsRef = useRef<Set<string>>(new Set());

  const checkAlerts = React.useCallback(() => {
    const now = new Date();
    alertRules.filter(rule => rule.status === "Active").forEach(rule => {
      let shouldTrigger = false;
      let alertMessage = rule.message;
      const alertKey = `${rule.id}-${format(now, 'yyyy-MM-dd')}`; // Unique key for daily alerts per rule

      if (triggeredAlertsRef.current.has(alertKey)) {
        return; // Already triggered this specific alert today
      }

      switch (rule.type) {
        case "MaintenanceDue":
          maintenancePlans.filter(plan =>
            (!rule.criteria.vehicleLicensePlate || plan.vehicleLicensePlate === rule.criteria.vehicleLicensePlate) &&
            (!rule.criteria.maintenanceType || plan.type === rule.criteria.maintenanceType) &&
            plan.status === "Actif" &&
            plan.nextDueDate
          ).forEach(plan => {
            const nextDueDate = parseISO(plan.nextDueDate!);
            const daysUntilDue = differenceInDays(nextDueDate, now);

            if (rule.criteria.thresholdUnit === "days" && rule.criteria.thresholdValue !== undefined && daysUntilDue <= rule.criteria.thresholdValue && daysUntilDue >= 0) {
              shouldTrigger = true;
              alertMessage = `Maintenance "${plan.description}" pour le véhicule ${plan.vehicleLicensePlate} est due dans ${daysUntilDue} jours.`;
            }
            // TODO: Add mileage-based checks if odometer readings are available
          });
          break;

        case "DocumentExpiry":
          documents.filter(doc =>
            (!rule.criteria.vehicleLicensePlate || doc.vehicleLicensePlate === rule.criteria.vehicleLicensePlate) &&
            (!rule.criteria.driverLicenseNumber || doc.driverLicenseNumber === rule.criteria.driverLicenseNumber) &&
            (!rule.criteria.documentType || doc.type === rule.criteria.documentType) &&
            doc.expiryDate
          ).forEach(doc => {
            const expiryDate = parseISO(doc.expiryDate);
            const daysUntilExpiry = differenceInDays(expiryDate, now);

            if (rule.criteria.thresholdUnit === "days" && rule.criteria.thresholdValue !== undefined && daysUntilExpiry <= rule.criteria.thresholdValue && daysUntilExpiry >= 0) {
              shouldTrigger = true;
              alertMessage = `Le document "${doc.name}" (${doc.type}) pour ${doc.vehicleLicensePlate || doc.driverLicenseNumber || 'un élément non spécifié'} expire dans ${daysUntilExpiry} jours.`;
            }
          });
          break;

        case "VehicleAssignmentEnd":
          assignments.filter(assign =>
            (!rule.criteria.vehicleLicensePlate || assign.vehicleLicensePlate === rule.criteria.vehicleLicensePlate) &&
            assign.status === "Active" &&
            assign.endDate
          ).forEach(assign => {
            const endDate = parseISO(assign.endDate);
            const daysUntilEnd = differenceInDays(endDate, now);

            if (rule.criteria.thresholdUnit === "days" && rule.criteria.thresholdValue !== undefined && daysUntilEnd <= rule.criteria.thresholdValue && daysUntilEnd >= 0) {
              shouldTrigger = true;
              alertMessage = `L'affectation du véhicule ${assign.vehicleLicensePlate} se termine dans ${daysUntilEnd} jours.`;
            }
          });
          break;

        case "DriverLicenseExpiry":
          drivers.filter(driver =>
            (!rule.criteria.driverLicenseNumber || driver.licenseNumber === rule.criteria.driverLicenseNumber) &&
            documents.some(doc => doc.driverLicenseNumber === driver.licenseNumber && doc.type === "Permis de conduire" && doc.expiryDate)
          ).forEach(driver => {
            const licenseDoc = documents.find(doc => doc.driverLicenseNumber === driver.licenseNumber && doc.type === "Permis de conduire" && doc.expiryDate);
            if (licenseDoc) {
              const expiryDate = parseISO(licenseDoc.expiryDate);
              const daysUntilExpiry = differenceInDays(expiryDate, now);

              if (rule.criteria.thresholdUnit === "days" && rule.criteria.thresholdValue !== undefined && daysUntilExpiry <= rule.criteria.thresholdValue && daysUntilExpiry >= 0) {
                shouldTrigger = true;
                alertMessage = `Le permis de conduire de ${driver.firstName} ${driver.lastName} expire dans ${daysUntilExpiry} jours.`;
              }
            }
          });
          break;
      }

      if (shouldTrigger) {
        addActiveAlert({
          ruleId: rule.id,
          message: alertMessage,
          type: rule.type,
        });
        triggeredAlertsRef.current.add(alertKey);
        setAlertRules(prevRules =>
          prevRules.map(r => r.id === rule.id ? { ...r, lastTriggered: format(now, 'yyyy-MM-dd') } : r)
        );
      }
    });
  }, [alertRules, maintenancePlans, documents, assignments, drivers, setAlertRules, addActiveAlert]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkAlerts();
    }, 60 * 60 * 1000); // Check every hour

    checkAlerts(); // Initial check

    return () => clearInterval(interval);
  }, [checkAlerts]);
}