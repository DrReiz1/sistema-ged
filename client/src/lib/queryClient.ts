import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { readCachedJson, writeCachedJson } from "./offline-cache";

const AUTH_TOKEN_KEY = "docstation.auth.token";

export class ApiError extends Error {
  status: number;
  response: Response;
  body: string;

  constructor(response: Response, body: string) {
    super(`${response.status}: ${body || response.statusText}`);
    this.name = "ApiError";
    this.status = response.status;
    this.response = response;
    this.body = body;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

function buildHeaders(data?: unknown): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function shouldCacheGet(url: string) {
  return url.startsWith("/api/");
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new ApiError(res, text);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: buildHeaders(data),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export async function fetchJson<T>(url: string): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: buildHeaders(),
      credentials: "include",
    });

    await throwIfResNotOk(res);
    const data = await res.json() as T;

    if (shouldCacheGet(url)) {
      writeCachedJson(url, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const cached = shouldCacheGet(url) ? readCachedJson<T>(url) : null;
    if (cached) {
      return cached;
    }

    throw error;
  }
}

export function buildAuthenticatedUrl(url: string): string {
  const token = getAuthToken();
  if (!token) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;

    try {
      const res = await fetch(url, {
        headers: buildHeaders(),
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      if (shouldCacheGet(url)) {
        writeCachedJson(url, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      const cached = shouldCacheGet(url) ? readCachedJson<unknown>(url) : null;
      if (cached) {
        return cached;
      }

      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
