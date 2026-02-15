import type { Json } from "./protocol.js";

const riskyPatterns = [/ignore\s+all\s+previous\s+instructions/i, /system\s+instruction/i, /exfiltrat/i];

function outputSanitizationEnabled(): boolean {
  return (process.env.WEBMCP_SANITIZE_OUTPUT ?? "true").toLowerCase() !== "false";
}

function sanitizeString(value: string): string {
  for (const pattern of riskyPatterns) {
    if (pattern.test(value)) {
      return "[FILTERED_PROMPT_INJECTION]";
    }
  }
  return value;
}

function sanitizeJson(value: Json): Json {
  if (typeof value === "string") {
    return sanitizeString(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJson(item));
  }
  if (value && typeof value === "object") {
    const next: Record<string, Json> = {};
    for (const [key, child] of Object.entries(value)) {
      next[key] = sanitizeJson(child);
    }
    return next;
  }
  return value;
}

export function sanitizeToolResult(result: Json): Json {
  if (!outputSanitizationEnabled()) {
    return result;
  }
  return sanitizeJson(result);
}
