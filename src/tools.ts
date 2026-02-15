import { z } from "zod";
import { sanitizeToolResult } from "./output-sanitizer.js";
import { evaluatePolicy } from "./policy.js";
import {
  PROTOCOL_VERSION,
  type CallToolRequest,
  type CallToolResponse,
  type Json,
  type ToolDescriptor
} from "./protocol.js";
import { addSessionNote, clearSessionNotes, listSessionNotes } from "./session-store.js";

interface ToolDefinition<T> {
  descriptor: ToolDescriptor;
  schema: z.ZodType<T>;
  execute: (args: T, context: ToolExecutionContext) => Json;
}

interface ToolExecutionContext {
  requestId: string;
  sessionId?: string;
  confirmed?: boolean;
}

const dangerousTextPatterns = [
  /ignore\s+all\s+previous\s+instructions/i,
  /system\s+instruction/i,
  /exfiltrat/i
];

function assertSafeDescriptorText(name: string, value: string): void {
  for (const pattern of dangerousTextPatterns) {
    if (pattern.test(value)) {
      throw new Error(`Tool "${name}" contains risky descriptor text matching ${pattern}.`);
    }
  }
}

function responseOk(requestId: string, result: Json): CallToolResponse {
  return {
    protocolVersion: PROTOCOL_VERSION,
    requestId,
    ok: true,
    result
  };
}

function responseError(requestId: string, code: string, message: string): CallToolResponse {
  return {
    protocolVersion: PROTOCOL_VERSION,
    requestId,
    ok: false,
    error: { code, message }
  };
}

const registry: Array<ToolDefinition<unknown>> = [
  {
    descriptor: {
      name: "echo",
      description: "Return the same text back.",
      input: { text: "string" },
      sideEffect: "read",
      requiresConfirmation: false,
      sessionScoped: false
    },
    schema: z.object({ text: z.string() }).strict(),
    execute: (args) => {
      const parsed = args as { text: string };
      return { text: parsed.text };
    }
  },
  {
    descriptor: {
      name: "sum",
      description: "Return the sum of two numbers.",
      input: { a: "number", b: "number" },
      sideEffect: "read",
      requiresConfirmation: false,
      sessionScoped: false
    },
    schema: z.object({ a: z.number().finite(), b: z.number().finite() }).strict(),
    execute: (args) => {
      const parsed = args as { a: number; b: number };
      return { value: parsed.a + parsed.b };
    }
  },
  {
    descriptor: {
      name: "now_utc",
      description: "Return current UTC timestamp in ISO format.",
      input: {},
      sideEffect: "read",
      requiresConfirmation: false,
      sessionScoped: false
    },
    schema: z.object({}).strict(),
    execute: () => ({ iso: new Date().toISOString() })
  },
  {
    descriptor: {
      name: "append_note",
      description: "Append a note to session-scoped state.",
      input: { text: "string" },
      sideEffect: "write",
      requiresConfirmation: true,
      sessionScoped: true
    },
    schema: z.object({ text: z.string().min(1).max(500) }).strict(),
    execute: (args, context) => {
      const parsed = args as { text: string };
      const count = addSessionNote(context.sessionId ?? "", parsed.text);
      return { added: true, count };
    }
  },
  {
    descriptor: {
      name: "list_notes",
      description: "List all notes for the current session.",
      input: {},
      sideEffect: "read",
      requiresConfirmation: false,
      sessionScoped: true
    },
    schema: z.object({}).strict(),
    execute: (_args, context) => ({ notes: listSessionNotes(context.sessionId ?? "") })
  },
  {
    descriptor: {
      name: "clear_notes",
      description: "Clear all notes for the current session.",
      input: {},
      sideEffect: "sensitive",
      requiresConfirmation: true,
      sessionScoped: true
    },
    schema: z.object({}).strict(),
    execute: (_args, context) => {
      const clearedCount = clearSessionNotes(context.sessionId ?? "");
      return { clearedCount };
    }
  }
];

export function validateToolCatalog(definitions: Array<ToolDefinition<unknown>> = registry): void {
  const names = new Set<string>();

  for (const tool of definitions) {
    if (names.has(tool.descriptor.name)) {
      throw new Error(`Duplicate tool name: ${tool.descriptor.name}`);
    }
    names.add(tool.descriptor.name);
    assertSafeDescriptorText(tool.descriptor.name, tool.descriptor.description);
  }
}

validateToolCatalog();

export function listTools(): ToolDescriptor[] {
  return registry.map((tool) => tool.descriptor);
}

export function getToolDescriptor(name: string): ToolDescriptor | undefined {
  return registry.find((tool) => tool.descriptor.name === name)?.descriptor;
}

export function callTool(req: CallToolRequest): CallToolResponse {
  const requestId = req.requestId ?? "unknown-request";
  const definition = registry.find((tool) => tool.descriptor.name === req.name);
  if (!definition) {
    return responseError(requestId, "TOOL_NOT_FOUND", `Unknown tool: ${req.name}`);
  }

  const policyError = evaluatePolicy(definition.descriptor, {
    requestId,
    sessionId: req.sessionId,
    confirmed: req.confirmed
  });
  if (policyError) {
    return policyError;
  }

  const parsed = definition.schema.safeParse(req.arguments ?? {});
  if (!parsed.success) {
    return responseError(
      requestId,
      "INVALID_ARGUMENTS",
      `Invalid arguments for "${definition.descriptor.name}".`
    );
  }

  const result = definition.execute(parsed.data, {
    requestId,
    sessionId: req.sessionId,
    confirmed: req.confirmed
  });
  return responseOk(requestId, sanitizeToolResult(result));
}
