import assert from "node:assert/strict";
import { createServer, request, type IncomingHttpHeaders, type Server } from "node:http";
import { after, before, test } from "node:test";
import { handleRequest } from "../src/app.js";

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
    tools?: Array<{ name?: string; description?: string; input?: unknown }>;
  };
  assert.ok(Array.isArray(body.tools));

  const names = body.tools.map((tool) => tool.name);
  assert.equal(new Set(names).size, names.length);

  for (const tool of body.tools) {
    assert.equal(typeof tool.name, "string");
    assert.ok((tool.name ?? "").length > 0);
    assert.equal(typeof tool.description, "string");
    assert.ok((tool.description ?? "").length > 0);
    assert.equal(typeof tool.input, "object");
    assert.notEqual(tool.input, null);
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
