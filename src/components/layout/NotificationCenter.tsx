"use client";

import React from "react";
import { Bell, XCircle, Loader2 } from "lucide-react"; // Import Loader2
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFleet } from "@/context/FleetContext";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const NotificationCenter: React.FC = () => {
  const { activeAlerts, markAlertAsRead, clearAllAlerts } = useFleet();
  const [isClearingAllAlerts, setIsClearingAllAlerts] = React.useState(false); // Add loading state
  const unreadAlerts = activeAlerts.filter(alert => !alert.isRead);

  const handleClearAllAlerts = async () => { // Make async
    setIsClearingAllAlerts(true); // Set loading to true
    try {
      await clearAllAlerts(); // Await the async operation
    } catch (error) {
      console.error("Failed to clear all alerts:", error);
    } finally {
      setIsClearingAllAlerts(false); // Set loading to false
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadAlerts.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
              {unreadAlerts.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col glass rounded-2xl animate-slideUp">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="flex-grow overflow-hidden">
          {activeAlerts.length === 0 ? (
            <p className="text-muted-foreground text-center mt-8">Aucune notification pour le moment.</p>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {activeAlerts
                  .sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime())
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "flex items-start space-x-3 p-3 rounded-md border",
                        alert.isRead ? "bg-muted/50 text-muted-foreground" : "bg-card text-foreground shadow-sm"
                      )}
                    >
                      <Bell className={cn("h-5 w-5 flex-shrink-0", alert.isRead ? "text-muted-foreground" : "text-primary")} />
                      <div className="flex-grow">
                        <p className={cn("text-sm", alert.isRead ? "line-through" : "font-medium")}>{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(parseISO(alert.createdAt), "PPP HH:mm", { locale: fr })}
                        </p>
                      </div>
                      {!alert.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0 text-gray-500 hover:text-primary"
                          onClick={() => markAlertAsRead(alert.id)}
                          title="Marquer comme lu"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            </ScrollArea>
          )}
        </div>
        {activeAlerts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearAllAlerts}
              disabled={isClearingAllAlerts}
            >
              {isClearingAllAlerts ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Effacer toutes les notifications"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;