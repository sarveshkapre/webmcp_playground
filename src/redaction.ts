import type { Json, ToolSideEffect } from "./protocol.js";

const DEFAULT_REDACT_KEYS = ["password", "token", "secret", "email", "address", "card", "ssn"];

function resolveRedactKeys(): string[] {
  const configured = process.env.WEBMCP_REDACT_KEYS;
  if (!configured) {
    return DEFAULT_REDACT_KEYS;
  }

  return configured
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);
}

function isSensitiveKey(key: string, redactKeys: string[]): boolean {
  const normalized = key.toLowerCase();
  return redactKeys.some((candidate) => normalized.includes(candidate));
}

function summarizeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return String(value);
  }
  if (typeof value === "string") {
    return value.length <= 80 ? value : `${value.slice(0, 77)}...`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "[COMPLEX]";
}

export function summarizeArgumentsForAudit(
  args: Record<string, unknown> | undefined,
  sideEffect: ToolSideEffect
): Record<string, string> {
  if (!args) {
    return {};
  }

  const redactKeys = resolveRedactKeys();
  const summary: Record<string, string> = {};

  for (const [key, value] of Object.entries(args)) {
    if (sideEffect !== "read" || isSensitiveKey(key, redactKeys)) {
      summary[key] = "[REDACTED]";
      continue;
    }

    summary[key] = summarizeValue(value);
  }

  return summary;
}

export function summarizeResultForAudit(result: Json | undefined, sideEffect: ToolSideEffect): string {
  if (result === undefined) {
    return "[NONE]";
  }

  if (sideEffect !== "read") {
    return "[REDACTED]";
  }

  try {
    const serialized = JSON.stringify(result);
    if (!serialized) {
      return "[NONE]";
    }
    return serialized.length <= 200 ? serialized : `${serialized.slice(0, 197)}...`;
  } catch {
    return "[UNSERIALIZABLE]";
  }
}
