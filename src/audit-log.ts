import type { AuditEntry } from "./protocol.js";

const MAX_AUDIT_ENTRIES = 500;
const entries: AuditEntry[] = [];

export function appendAuditEntry(entry: AuditEntry): void {
  entries.push(entry);
  if (entries.length > MAX_AUDIT_ENTRIES) {
    entries.shift();
  }
}

export function listAuditEntries(limit = 100): AuditEntry[] {
  const bounded = Math.max(1, Math.min(limit, MAX_AUDIT_ENTRIES));
  return entries.slice(-bounded).reverse();
}

export function resetAuditLog(): void {
  entries.length = 0;
}
