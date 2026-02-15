import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, before, beforeEach, test } from "node:test";
import { resetAuditLog } from "../src/audit-log.js";
import { handleRequest } from "../src/app.js";
import { resetSessionStore } from "../src/session-store.js";

let server: Server;
let baseUrl = "";

before(async () => {
  server = createServer((req, res) => {
    void handleRequest(req, res);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Failed to bind test server.");
      }
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

beforeEach(() => {
  resetSessionStore();
  resetAuditLog();
});

test("POST /mcp/list_tools returns tool descriptors", async () => {
  const response = await fetch(`${baseUrl}/mcp/list_tools`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });

  assert.equal(response.status, 200);
  const body = (await response.json()) as { tools?: Array<{ name: string }> };
  assert.ok(Array.isArray(body.tools));
  assert.deepEqual(
    body.tools?.map((tool) => tool.name),
    ["echo", "sum", "now_utc", "append_note", "list_notes", "clear_notes"]
  );
});

test("POST /mcp/call_tool executes tool and returns result", async () => {
  const response = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "sum",
      arguments: { a: 2, b: 40 }
    })
  });

  assert.equal(response.status, 200);
  const body = (await response.json()) as { ok?: boolean; result?: { value?: number } };
  assert.equal(body.ok, true);
  assert.equal(body.result?.value, 42);
});

test("POST /mcp/call_tool rejects invalid args", async () => {
  const response = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "sum",
      arguments: { a: "2", b: 40 }
    })
  });

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    ok?: boolean;
    error?: { code?: string; message?: string };
  };
  assert.equal(body.ok, false);
  assert.equal(body.error?.code, "INVALID_ARGUMENTS");
});

test("POST /mcp/call_tool requires confirmation for append_note", async () => {
  const response = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "append_note",
      sessionId: "s-1",
      arguments: { text: "test note" }
    })
  });

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    ok?: boolean;
    error?: { code?: string };
  };
  assert.equal(body.ok, false);
  assert.equal(body.error?.code, "CONFIRMATION_REQUIRED");
});

test("POST /mcp/call_tool enforces session isolation for notes", async () => {
  const appendOne = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "append_note",
      sessionId: "alpha",
      confirmed: true,
      arguments: { text: "alpha note" }
    })
  });
  assert.equal(appendOne.status, 200);

  const appendTwo = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "append_note",
      sessionId: "beta",
      confirmed: true,
      arguments: { text: "beta note" }
    })
  });
  assert.equal(appendTwo.status, 200);

  const alphaList = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "list_notes",
      sessionId: "alpha",
      arguments: {}
    })
  });
  const alphaBody = (await alphaList.json()) as {
    ok?: boolean;
    result?: { notes?: string[] };
  };

  const betaList = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "list_notes",
      sessionId: "beta",
      arguments: {}
    })
  });
  const betaBody = (await betaList.json()) as {
    ok?: boolean;
    result?: { notes?: string[] };
  };

  assert.equal(alphaBody.ok, true);
  assert.equal(betaBody.ok, true);
  assert.deepEqual(alphaBody.result?.notes, ["alpha note"]);
  assert.deepEqual(betaBody.result?.notes, ["beta note"]);
});

test("GET /mcp/audit_log returns recent entries", async () => {
  const call = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "sum",
      arguments: { a: 20, b: 22 }
    })
  });
  assert.equal(call.status, 200);

  const audit = await fetch(`${baseUrl}/mcp/audit_log?limit=5`, {
    method: "GET"
  });
  assert.equal(audit.status, 200);

  const body = (await audit.json()) as {
    entries?: Array<{
      toolName?: string;
      outcome?: string;
      argumentSummary?: Record<string, string>;
      resultSummary?: string;
    }>;
  };
  assert.ok(Array.isArray(body.entries));
  assert.equal(body.entries.length > 0, true);
  assert.equal(body.entries[0]?.toolName, "sum");
  assert.equal(body.entries[0]?.outcome, "ok");
  assert.equal(body.entries[0]?.argumentSummary?.a, "20");
  assert.equal(body.entries[0]?.argumentSummary?.b, "22");
  assert.equal(body.entries[0]?.resultSummary?.includes("42"), true);
});

test("GET /mcp/audit_log redacts write-tool arguments", async () => {
  const call = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "append_note",
      sessionId: "alpha",
      confirmed: true,
      arguments: { text: "top secret note" }
    })
  });
  assert.equal(call.status, 200);

  const audit = await fetch(`${baseUrl}/mcp/audit_log?limit=5`, {
    method: "GET"
  });
  assert.equal(audit.status, 200);

  const body = (await audit.json()) as {
    entries?: Array<{
      toolName?: string;
      argumentSummary?: Record<string, string>;
      resultSummary?: string;
    }>;
  };
  assert.ok(Array.isArray(body.entries));
  const entry = body.entries.find((candidate) => candidate.toolName === "append_note");
  assert.equal(entry?.argumentSummary?.text, "[REDACTED]");
  assert.equal(entry?.resultSummary, "[REDACTED]");
});
