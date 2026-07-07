import { enqueueOfflineAction, getOfflineQueue, isBrowserOffline, removeQueuedAction } from "./offline-cache";
import { getAuthToken, queryClient } from "./queryClient";

let flushPromise: Promise<void> | null = null;

function buildHeaders() {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function flushOfflineQueue() {
  if (flushPromise) {
    return flushPromise;
  }

  flushPromise = (async () => {
    if (isBrowserOffline()) {
      return;
    }

    const queue = [...getOfflineQueue()];
    let flushedAnyAction = false;

    for (const entry of queue) {
      try {
        const response = await fetch(entry.url, {
          method: entry.method,
          headers: buildHeaders(),
          body: JSON.stringify(entry.body),
        });

        if (!response.ok) {
          if (response.status >= 500) {
            break;
          }

          removeQueuedAction(entry.id);
          continue;
        }

        removeQueuedAction(entry.id);
        flushedAnyAction = true;
      } catch {
        break;
      }
    }

    if (flushedAnyAction) {
      await queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    }
  })().finally(() => {
    flushPromise = null;
  });

  return flushPromise;
}

export function queueRuntimeAction(body: {
  action: string;
  documentId?: string | null;
  revisionId?: string | null;
  timestamp?: string;
}, label: string) {
  enqueueOfflineAction({
    method: "POST",
    url: "/api/logs",
    body: {
      ...body,
      timestamp: body.timestamp ?? new Date().toISOString(),
    },
    label,
  });
}

export function startOfflineSync() {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const onOnline = () => {
    void flushOfflineQueue();
  };

  window.addEventListener("online", onOnline);
  void flushOfflineQueue();

  return () => {
    window.removeEventListener("online", onOnline);
  };
}
