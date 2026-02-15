import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { callTool, listTools } from "./tools.js";
import type { ListToolsResponse } from "./protocol.js";

const CallToolRequestSchema = z
  .object({
    name: z.string().min(1),
    arguments: z.record(z.string(), z.unknown()).optional()
  })
  .strict();

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

  return JSON.parse(raw) as unknown;
}

export async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
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
      const parsed = CallToolRequestSchema.safeParse(await readJson(req));
      if (!parsed.success) {
        sendJson(res, 400, {
          ok: false,
          error: {
            code: "BAD_REQUEST",
            message: "Expected { name: string, arguments?: object }."
          }
        });
        return;
      }

      sendJson(res, 200, callTool(parsed.data));
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
