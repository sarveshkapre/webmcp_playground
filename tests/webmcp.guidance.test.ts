import assert from "node:assert/strict";
import { createServer, request, type IncomingHttpHeaders, type Server } from "node:http";
import { after, before, beforeEach, test } from "node:test";
import { resetAuditLog } from "../src/audit-log.js";
import { handleRequest } from "../src/app.js";
import { PROTOCOL_VERSION } from "../src/protocol.js";
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

function postRawJson(path: string, body: string): Promise<{
  statusCode: number;
  headers: IncomingHttpHeaders;
  body: unknown;
}> {
  const url = new URL(path, baseUrl);

  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: url.hostname,
        port: Number(url.port),
        path: url.pathname,
        method: "POST",
        headers: {
          "content-type": "application/json"
        }
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        res.on("end", () => {
          const payload = Buffer.concat(chunks).toString("utf8");
          let parsed: unknown = payload;
          try {
            parsed = JSON.parse(payload);
          } catch {
            // Keep raw payload if parsing fails.
          }

          resolve({
            statusCode: res.statusCode ?? 0,
            headers: res.headers,
            body: parsed
          });
        });
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

test("tool names are unique and include required metadata", async () => {
  const response = await fetch(`${baseUrl}/mcp/list_tools`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    protocolVersion?: string;
    tools?: Array<{
      name?: string;
      description?: string;
      input?: unknown;
      sideEffect?: string;
      requiresConfirmation?: boolean;
      sessionScoped?: boolean;
    }>;
  };
  assert.ok(Array.isArray(body.tools));
  assert.equal(body.protocolVersion, PROTOCOL_VERSION);

  const names = body.tools.map((tool) => tool.name);
  assert.equal(new Set(names).size, names.length);

  for (const tool of body.tools) {
    assert.equal(typeof tool.name, "string");
    assert.ok((tool.name ?? "").length > 0);
    assert.equal(typeof tool.description, "string");
    assert.ok((tool.description ?? "").length > 0);
    assert.equal(typeof tool.input, "object");
    assert.notEqual(tool.input, null);
    assert.ok(["read", "write", "sensitive"].includes(tool.sideEffect ?? ""));
    assert.equal(typeof tool.requiresConfirmation, "boolean");
    assert.equal(typeof tool.sessionScoped, "boolean");
  }
});

test("unknown tool returns TOOL_NOT_FOUND", async () => {
  const response = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "does_not_exist",
      arguments: {}
    })
  });

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    ok?: boolean;
    error?: { code?: string };
  };
  assert.equal(body.ok, false);
  assert.equal(body.error?.code, "TOOL_NOT_FOUND");
});

test("responses include protocolVersion and requestId envelope fields", async () => {
  const response = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "sum",
      arguments: { a: 1, b: 2 }
    })
  });

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    protocolVersion?: string;
    requestId?: string;
    ok?: boolean;
  };
  assert.equal(body.ok, true);
  assert.equal(body.protocolVersion, PROTOCOL_VERSION);
  assert.equal(typeof body.requestId, "string");
  assert.ok((body.requestId ?? "").length > 0);
});

test("session-scoped tools require sessionId", async () => {
  const response = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "list_notes",
      arguments: {}
    })
  });

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    ok?: boolean;
    error?: { code?: string };
  };
  assert.equal(body.ok, false);
  assert.equal(body.error?.code, "SESSION_REQUIRED");
});

test("unsupported protocol version returns explicit error", async () => {
  const response = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "sum",
      protocolVersion: "legacy-v1",
      arguments: { a: 1, b: 2 }
    })
  });

  assert.equal(response.status, 400);
  const body = (await response.json()) as {
    ok?: boolean;
    error?: { code?: string };
  };
  assert.equal(body.ok, false);
  assert.equal(body.error?.code, "UNSUPPORTED_PROTOCOL_VERSION");
});

test("invalid request shape returns BAD_REQUEST with HTTP 400", async () => {
  const response = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "sum",
      arguments: {},
      extra: true
    })
  });

  assert.equal(response.status, 400);
  const body = (await response.json()) as {
    ok?: boolean;
    error?: { code?: string };
  };
  assert.equal(body.ok, false);
  assert.equal(body.error?.code, "BAD_REQUEST");
});

test("malformed JSON returns BAD_JSON with HTTP 400", async () => {
  const response = await postRawJson("/mcp/call_tool", "{not valid json");

  assert.equal(response.statusCode, 400);
  const body = response.body as {
    ok?: boolean;
    error?: { code?: string };
  };
  assert.equal(body.ok, false);
  assert.equal(body.error?.code, "BAD_JSON");
});
