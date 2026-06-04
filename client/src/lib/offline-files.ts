const FILE_CACHE_NAME = "docstation-offline-files-v1";

function buildFileCacheKey(documentId: string, revisionId: string, mode: "preview" | "download") {
  return `https://docstation.local/offline/${mode}/${documentId}/${revisionId}`;
}

async function openFileCache() {
  return caches.open(FILE_CACHE_NAME);
}

export async function fetchDocumentBinary(params: {
  url: string;
  documentId: string;
  revisionId: string;
  mode: "preview" | "download";
  headers?: HeadersInit;
}) {
  const cacheKey = buildFileCacheKey(params.documentId, params.revisionId, params.mode);
  const cache = await openFileCache();

  try {
    const response = await fetch(params.url, {
      headers: params.headers,
    });

    if (!response.ok) {
      throw new Error(await response.text() || "Falha ao carregar arquivo");
    }

    const clone = response.clone();
    await cache.put(cacheKey, clone);
    const blob = await response.blob();

    return {
      blob,
      source: "network" as const,
      contentType: response.headers.get("content-type") ?? blob.type,
    };
  } catch (error) {
    const cached = await cache.match(cacheKey);
    if (!cached) {
      throw error;
    }

    const blob = await cached.blob();
    return {
      blob,
      source: "cache" as const,
      contentType: cached.headers.get("content-type") ?? blob.type,
    };
  }
}

export async function warmDocumentBinary(params: {
  url: string;
  documentId: string;
  revisionId: string;
  mode: "preview" | "download";
  headers?: HeadersInit;
}) {
  try {
    await fetchDocumentBinary(params);
  } catch {
    return;
  }
}
