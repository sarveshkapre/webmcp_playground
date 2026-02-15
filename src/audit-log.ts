import type { AuditEntry } from "./protocol.js";
import { readJsonFile, writeJsonFile } from "./persistence.js";

const MAX_AUDIT_ENTRIES = 500;
const entries: AuditEntry[] = [];
let persistenceFilePath: string | null = null;

interface AuditLogPayload {
  entries: AuditEntry[];
}

function hydrateFromDisk(): void {
  if (!persistenceFilePath) {
    return;
  }

  const payload = readJsonFile<AuditLogPayload>(persistenceFilePath, { entries: [] });
  entries.length = 0;
  for (const entry of payload.entries) {
    entries.push(entry);
  }
}

function persistToDisk(): void {
  if (!persistenceFilePath) {
    return;
  }

  writeJsonFile(persistenceFilePath, { entries } satisfies AuditLogPayload);
}

export function configureAuditPersistence(filePath: string | null): void {
  persistenceFilePath = filePath;
  hydrateFromDisk();
}

export function appendAuditEntry(entry: AuditEntry): void {
  entries.push(entry);
  if (entries.length > MAX_AUDIT_ENTRIES) {
    entries.shift();
  }
  persistToDisk();
}

export function listAuditEntries(limit = 100): AuditEntry[] {
  const bounded = Math.max(1, Math.min(limit, MAX_AUDIT_ENTRIES));
  return entries.slice(-bounded).reverse();
}

export function resetAuditLog(): void {
  entries.length = 0;
  persistToDisk();
}
