export function buildStoragePath(prefix: string, code: string, revisionNumber: string, extension: string): string {
  return `${prefix.toUpperCase()}/${code}/${revisionNumber}.${extension.toLowerCase()}`;
}

export function normalizeStoragePath(fileUrl: string): string {
  return fileUrl.replace(/^documents\//i, "");
}
