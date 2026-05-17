export function generateRevisionNumber(sequence: number): string {
  return `REV${String(sequence).padStart(2, "0")}`;
}
