import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { appendAuditEntry, listAuditEntries } from "./audit-log.js";
import { PROTOCOL_VERSION, type AuditLogResponse, type ListToolsResponse } from "./protocol.js";
import { summarizeArgumentsForAudit } from "./redaction.js";
import { initializeStorePersistence } from "./store-config.js";
import { callTool, getToolDescriptor, listTools } from "./tools.js";

const CallToolRequestSchema = z
  .object({
    name: z.string().min(1),
    arguments: z.record(z.string(), z.unknown()).optional(),
    sessionId: z.string().min(1).max(128).optional(),
    requestId: z.string().min(1).max(128).optional(),
    confirmed: z.boolean().optional()
  })
  .strict();

initializeStorePersistence();

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
    sendJson(res, 200, { ok: true, service: "webmcp-playground", protocolVersion: PROTOCOL_VERSION });
    return;
  }

  if (method === "POST" && url === "/mcp/list_tools") {
    const body: ListToolsResponse = { protocolVersion: PROTOCOL_VERSION, tools: listTools() };
    sendJson(res, 200, body);
    return;
  }

  if (method === "GET" && url.startsWith("/mcp/audit_log")) {
    const parsedUrl = new URL(url, "http://localhost");
    const limit = Number(parsedUrl.searchParams.get("limit") ?? "100");
    const body: AuditLogResponse = {
      protocolVersion: PROTOCOL_VERSION,
      entries: listAuditEntries(Number.isFinite(limit) ? limit : 100)
    };
    sendJson(res, 200, body);
    return;
  }

  if (method === "POST" && url === "/mcp/call_tool") {
    const requestId = randomUUID();
    try {
      const parsed = CallToolRequestSchema.safeParse(await readJson(req));
      if (!parsed.success) {
        sendJson(res, 400, {
          protocolVersion: PROTOCOL_VERSION,
          requestId,
          ok: false,
          error: {
            code: "BAD_REQUEST",
            message: "Expected { name: string, arguments?: object }."
          }
        });
        return;
      }

      const request = {
        ...parsed.data,
        requestId: parsed.data.requestId ?? requestId
      };
      const result = callTool(request);

      const descriptor = getToolDescriptor(request.name);
      appendAuditEntry({
        timestamp: new Date().toISOString(),
        requestId: result.requestId,
        sessionId: request.sessionId,
        toolName: request.name,
        sideEffect: descriptor?.sideEffect ?? "read",
        argumentSummary: summarizeArgumentsForAudit(request.arguments, descriptor?.sideEffect ?? "read"),
        outcome: result.ok ? "ok" : "error",
        errorCode: result.error?.code
      });

      sendJson(res, 200, result);
      return;
    } catch {
      sendJson(res, 400, {
        protocolVersion: PROTOCOL_VERSION,
        requestId,
        ok: false,
        error: { code: "BAD_JSON", message: "Invalid JSON body." }
      });
      return;
    }
  }

  if (method === "GET" && url === "/") {
    sendJson(res, 200, {
      name: "webmcp-playground",
      protocolVersion: PROTOCOL_VERSION,
      endpoints: [
        "GET /health",
        "POST /mcp/list_tools",
        "POST /mcp/call_tool",
        "GET /mcp/audit_log"
      ]
    });
    return;
  }

  sendJson(res, 404, { ok: false, error: { code: "NOT_FOUND", message: "Route not found." } });
}
