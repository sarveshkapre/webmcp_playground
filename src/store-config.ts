import { join } from "node:path";
import { configureAuditPersistence } from "./audit-log.js";
import { configureSessionPersistence } from "./session-store.js";

export function initializeStorePersistence(): void {
  const dataDir = process.env.WEBMCP_DATA_DIR;
  if (!dataDir) {
    return;
  }

  configureAuditPersistence(join(dataDir, "audit-log.json"));
  configureSessionPersistence(join(dataDir, "sessions.json"));
}
