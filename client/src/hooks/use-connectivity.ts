import { useEffect, useState } from "react";
import { getOfflineQueue } from "@/lib/offline-cache";
import { flushOfflineQueue, startOfflineSync } from "@/lib/offline-sync";

export function useConnectivity() {
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? navigator.onLine === false : false);
  const [pendingActions, setPendingActions] = useState(() => getOfflineQueue().length);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      void flushOfflineQueue();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    const handleQueueChange = () => {
      setPendingActions(getOfflineQueue().length);
    };

    const stopSync = startOfflineSync();
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("docstation:offline-queue-changed", handleQueueChange as EventListener);

    return () => {
      stopSync();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("docstation:offline-queue-changed", handleQueueChange as EventListener);
    };
  }, []);

  return {
    isOffline,
    pendingActions,
  };
}
