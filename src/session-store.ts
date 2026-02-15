const notesBySession = new Map<string, string[]>();

export function addSessionNote(sessionId: string, text: string): number {
  const existing = notesBySession.get(sessionId) ?? [];
  existing.push(text);
  notesBySession.set(sessionId, existing);
  return existing.length;
}

export function listSessionNotes(sessionId: string): string[] {
  const existing = notesBySession.get(sessionId) ?? [];
  return [...existing];
}

export function clearSessionNotes(sessionId: string): number {
  const existing = notesBySession.get(sessionId) ?? [];
  notesBySession.set(sessionId, []);
  return existing.length;
}

export function resetSessionStore(): void {
  notesBySession.clear();
}
