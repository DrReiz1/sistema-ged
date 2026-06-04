const JSON_CACHE_PREFIX = "docstation.offline.json.";
const QUEUE_KEY = "docstation.offline.queue";

export interface OfflineQueuedAction {
  id: string;
  url: string;
  method: "POST";
  body: unknown;
  createdAt: string;
  label: string;
}

function buildCacheKey(url: string) {
  return `${JSON_CACHE_PREFIX}${url}`;
}

export function isBrowserOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function readCachedJson<T>(url: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(buildCacheKey(url));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { data: T };
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeCachedJson<T>(url: string, data: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(buildCacheKey(url), JSON.stringify({
    data,
    updatedAt: new Date().toISOString(),
  }));
}

export function getOfflineQueue(): OfflineQueuedAction[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(QUEUE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as OfflineQueuedAction[];
  } catch {
    return [];
  }
}

function saveOfflineQueue(queue: OfflineQueuedAction[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new CustomEvent("docstation:offline-queue-changed", {
    detail: { count: queue.length },
  }));
}

export function enqueueOfflineAction(action: Omit<OfflineQueuedAction, "id" | "createdAt">) {
  const queue = getOfflineQueue();
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  saveOfflineQueue(queue);
}

export function clearOfflineQueue() {
  saveOfflineQueue([]);
}

export function removeQueuedAction(id: string) {
  saveOfflineQueue(getOfflineQueue().filter((entry) => entry.id !== id));
}
