import type { CallToolRequest, CallToolResponse, Json, ToolDescriptor } from "./protocol.js";

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

function toNumber(value: Json | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function callTool(req: CallToolRequest): CallToolResponse {
  const args = req.arguments ?? {};

  switch (req.name) {
    case "echo": {
      const text = args.text;
      if (typeof text !== "string") {
        return {
          ok: false,
          error: { code: "INVALID_ARGUMENTS", message: "Expected { text: string }." }
        };
      }
      return { ok: true, result: { text } };
    }

    case "sum": {
      const a = toNumber(args.a);
      const b = toNumber(args.b);
      if (a === null || b === null) {
        return {
          ok: false,
          error: { code: "INVALID_ARGUMENTS", message: "Expected { a: number, b: number }." }
        };
      }
      return { ok: true, result: { value: a + b } };
    }

    case "now_utc": {
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
