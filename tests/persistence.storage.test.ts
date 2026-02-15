import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";
import {
  appendAuditEntry,
  configureAuditPersistence,
  resetAuditLog
} from "../src/audit-log.js";
import type { AuditEntry } from "../src/protocol.js";
import {
  addSessionNote,
  configureSessionPersistence,
  resetSessionStore
} from "../src/session-store.js";

const tempDirs: string[] = [];

afterEach(() => {
  configureSessionPersistence(null);
  configureAuditPersistence(null);
  resetSessionStore();
  resetAuditLog();

  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("session store persists notes when file persistence is configured", () => {
  const dir = mkdtempSync(join(tmpdir(), "webmcp-session-"));
  tempDirs.push(dir);
  const filePath = join(dir, "sessions.json");

  configureSessionPersistence(filePath);
  resetSessionStore();
  addSessionNote("alpha", "note one");
  addSessionNote("alpha", "note two");

  const payload = JSON.parse(readFileSync(filePath, "utf8")) as {
    sessions?: Record<string, string[]>;
  };
  assert.deepEqual(payload.sessions?.alpha, ["note one", "note two"]);
});

test("audit log persists entries when file persistence is configured", () => {
  const dir = mkdtempSync(join(tmpdir(), "webmcp-audit-"));
  tempDirs.push(dir);
  const filePath = join(dir, "audit-log.json");

  configureAuditPersistence(filePath);
  resetAuditLog();

  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    requestId: "req-1",
    sessionId: "s-1",
    toolName: "sum",
    sideEffect: "read",
    outcome: "ok"
  };
  appendAuditEntry(entry);

  const payload = JSON.parse(readFileSync(filePath, "utf8")) as {
    entries?: AuditEntry[];
  };
  assert.equal(Array.isArray(payload.entries), true);
  assert.equal(payload.entries?.[0]?.requestId, "req-1");
});
