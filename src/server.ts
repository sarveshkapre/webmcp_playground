import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { callTool, listTools } from "./tools.js";
import type { CallToolRequest, ListToolsResponse } from "./protocol.js";

const port = Number(process.env.PORT ?? 8787);

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    return {};
  }
  return JSON.parse(raw);
}

async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const method = req.method ?? "GET";
  const url = req.url ?? "/";

  if (method === "GET" && url === "/health") {
    sendJson(res, 200, { ok: true, service: "webmcp-playground" });
    return;
  }

  if (method === "POST" && url === "/mcp/list_tools") {
    const body: ListToolsResponse = { tools: listTools() };
    sendJson(res, 200, body);
    return;
  }

  if (method === "POST" && url === "/mcp/call_tool") {
    try {
      const parsed = (await readJson(req)) as CallToolRequest;
      if (!parsed || typeof parsed !== "object" || typeof parsed.name !== "string") {
        sendJson(res, 400, {
          ok: false,
          error: { code: "BAD_REQUEST", message: "Expected { name: string, arguments?: object }." }
        });
        return;
      }
      sendJson(res, 200, callTool(parsed));
      return;
    } catch {
      sendJson(res, 400, {
        ok: false,
        error: { code: "BAD_JSON", message: "Invalid JSON body." }
      });
      return;
    }
  }

  if (method === "GET" && url === "/") {
    sendJson(res, 200, {
      name: "webmcp-playground",
      endpoints: ["GET /health", "POST /mcp/list_tools", "POST /mcp/call_tool"]
    });
    return;
  }

  sendJson(res, 404, { ok: false, error: { code: "NOT_FOUND", message: "Route not found." } });
}

createServer((req, res) => {
  void handler(req, res);
}).listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`webmcp-playground server listening on http://localhost:${port}`);
});
