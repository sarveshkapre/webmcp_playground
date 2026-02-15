import { readJsonFile, writeJsonFile } from "./persistence.js";

const notesBySession = new Map<string, string[]>();
let persistenceFilePath: string | null = null;

interface SessionStorePayload {
  sessions: Record<string, string[]>;
}

function hydrateFromDisk(): void {
  if (!persistenceFilePath) {
    return;
  }

  const payload = readJsonFile<SessionStorePayload>(persistenceFilePath, { sessions: {} });
  notesBySession.clear();
  for (const [sessionId, notes] of Object.entries(payload.sessions)) {
    notesBySession.set(sessionId, Array.isArray(notes) ? [...notes] : []);
  }
}

function persistToDisk(): void {
  if (!persistenceFilePath) {
    return;
  }

  const sessions = Object.fromEntries(
    [...notesBySession.entries()].map(([sessionId, notes]) => [sessionId, [...notes]])
  );

  writeJsonFile(persistenceFilePath, { sessions } satisfies SessionStorePayload);
}

export function configureSessionPersistence(filePath: string | null): void {
  persistenceFilePath = filePath;
  hydrateFromDisk();
}

export function addSessionNote(sessionId: string, text: string): number {
  const existing = notesBySession.get(sessionId) ?? [];
  existing.push(text);
  notesBySession.set(sessionId, existing);
  persistToDisk();
  return existing.length;
}

export function listSessionNotes(sessionId: string): string[] {
  const existing = notesBySession.get(sessionId) ?? [];
  return [...existing];
}

export function clearSessionNotes(sessionId: string): number {
  const existing = notesBySession.get(sessionId) ?? [];
  notesBySession.set(sessionId, []);
  persistToDisk();
  return existing.length;
}

export function resetSessionStore(): void {
  notesBySession.clear();
  persistToDisk();
}
