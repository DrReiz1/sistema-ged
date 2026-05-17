export function buildStoragePath(prefix: string, code: string, revisionNumber: string, extension: string): string {
  return `documents/${prefix.toUpperCase()}/${code}/${revisionNumber}.${extension.toLowerCase()}`;
}
