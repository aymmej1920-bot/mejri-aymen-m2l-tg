"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, UserX } from "lucide-react";
import { useFleet } from "@/context/FleetContext";
import { Profile } from "@/types/profile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ToggleUserStatusButtonProps {
  userProfile: Profile & { email: string; is_suspended: boolean };
}

const ToggleUserStatusButton: React.FC<ToggleUserStatusButtonProps> = ({ userProfile }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { updateUserStatus } = useFleet();

  const handleToggleStatus = async () => {
    setIsSubmitting(true);
    try {
      await updateUserStatus(userProfile.id, !userProfile.is_suspended);
    } catch (error) {
      console.error("Failed to toggle user status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 p-0 ${userProfile.is_suspended ? "text-success hover:bg-success/10" : "text-destructive hover:bg-destructive/10"}`}
          title={userProfile.is_suspended ? "Activer le compte" : "Suspendre le compte"}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : userProfile.is_suspended ? (
            <UserCheck className="h-4 w-4" />
          ) : (
            <UserX className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {userProfile.is_suspended ? "Activer le compte ?" : "Suspendre le compte ?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir {userProfile.is_suspended ? "activer" : "suspendre"} le compte de {userProfile.firstName} {userProfile.lastName} ({userProfile.email}) ?
            {userProfile.is_suspended ? " L'utilisateur pourra à nouveau se connecter." : " L'utilisateur ne pourra plus se connecter."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleToggleStatus} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              userProfile.is_suspended ? "Activer" : "Suspendre"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ToggleUserStatusButton;