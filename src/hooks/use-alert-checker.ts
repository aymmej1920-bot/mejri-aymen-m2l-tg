"use client";

import React, { useEffect, useRef } from "react";
import { format, differenceInDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { showError } from "@/utils/toast";
import { AlertRule } from "@/types/alertRule";
import { MaintenancePlan } from "@/types/maintenancePlan";
import { Document } from "@/types/document";
import { Assignment } from "@/types/assignment";
import { Driver } from "@/types/driver";

interface UseAlertCheckerProps {
  alertRules: AlertRule[];
  maintenancePlans: MaintenancePlan[];
  documents: Document[];
  assignments: Assignment[];
  drivers: Driver[];
  setAlertRules: React.Dispatch<React.SetStateAction<AlertRule[]>>;
}

export function useAlertChecker({
  alertRules,
  maintenancePlans,
  documents,
  assignments,
  drivers,
  setAlertRules,
}: UseAlertCheckerProps) {
  const triggeredAlertsRef = useRef<Set<string>>(new Set());

  const checkAlerts = React.useCallback(() => {
    const now = new Date();
    alertRules.filter(rule => rule.status === "Active").forEach(rule => {
      let shouldTrigger = false;
      let alertMessage = rule.message;
      const alertId = `${rule.id}-${format(now, 'yyyy-MM-dd')}`; // Unique ID for daily alerts

      if (triggeredAlertsRef.current.has(alertId)) {
        return;
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
              alertMessage = `Le document "${doc.name}" (${doc.type}) pour ${doc.vehicleLicensePlate || doc.driverLicenseNumber} expire dans ${daysUntilExpiry} jours.`;
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
        showError(alertMessage);
        triggeredAlertsRef.current.add(alertId);
        setAlertRules(prevRules =>
          prevRules.map(r => r.id === rule.id ? { ...r, lastTriggered: format(now, 'yyyy-MM-dd') } : r)
        );
      }
    });
  }, [alertRules, maintenancePlans, documents, assignments, drivers, setAlertRules]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkAlerts();
    }, 60 * 60 * 1000); // Check every hour

    checkAlerts(); // Initial check

    return () => clearInterval(interval);
  }, [checkAlerts]);
}