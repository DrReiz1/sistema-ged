export function generateDocumentCode(prefix: string, sequence: number): string {
  return `${prefix.toUpperCase()}-${String(sequence).padStart(3, "0")}`;
}
