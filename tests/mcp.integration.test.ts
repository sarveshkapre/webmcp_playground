import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
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
    ["echo", "sum", "now_utc"]
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
