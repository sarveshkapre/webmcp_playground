import { z } from "zod";
import type { CallToolRequest, CallToolResponse, ToolDescriptor } from "./protocol.js";

const tools: ToolDescriptor[] = [
  {
    name: "echo",
    description: "Return the same text back.",
    input: {
      text: "string"
    }
  },
  {
    name: "sum",
    description: "Return the sum of two numbers.",
    input: {
      a: "number",
      b: "number"
    }
  },
  {
    name: "now_utc",
    description: "Return current UTC timestamp in ISO format.",
    input: {}
  }
];

export function listTools(): ToolDescriptor[] {
  return tools;
}

const EchoArgsSchema = z.object({ text: z.string() }).strict();
const SumArgsSchema = z.object({ a: z.number().finite(), b: z.number().finite() }).strict();
const EmptyArgsSchema = z.object({}).strict();

function invalidArguments(message: string): CallToolResponse {
  return {
    ok: false,
    error: { code: "INVALID_ARGUMENTS", message }
  };
}

export function callTool(req: CallToolRequest): CallToolResponse {
  const args = req.arguments ?? {};

  switch (req.name) {
    case "echo": {
      const parsed = EchoArgsSchema.safeParse(args);
      if (!parsed.success) {
        return invalidArguments("Expected { text: string }.");
      }
      return { ok: true, result: { text: parsed.data.text } };
    }

    case "sum": {
      const parsed = SumArgsSchema.safeParse(args);
      if (!parsed.success) {
        return invalidArguments("Expected { a: number, b: number }.");
      }
      return { ok: true, result: { value: parsed.data.a + parsed.data.b } };
    }

    case "now_utc": {
      const parsed = EmptyArgsSchema.safeParse(args);
      if (!parsed.success) {
        return invalidArguments("Expected no arguments.");
      }
      return {
        ok: true,
        result: { iso: new Date().toISOString() }
      };
    }

    default:
      return {
        ok: false,
        error: { code: "TOOL_NOT_FOUND", message: `Unknown tool: ${req.name}` }
      };
  }
}
