export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export const PROTOCOL_VERSION = "2026-02-playground";

export type ToolSideEffect = "read" | "write" | "sensitive";

export interface ToolDescriptor {
  name: string;
  description: string;
  input: Record<string, string>;
  sideEffect: ToolSideEffect;
  requiresConfirmation: boolean;
  sessionScoped: boolean;
}

export interface ListToolsResponse {
  protocolVersion: string;
  tools: ToolDescriptor[];
}

export interface CallToolRequest {
  name: string;
  arguments?: Record<string, unknown>;
  sessionId?: string;
  requestId?: string;
  confirmed?: boolean;
  protocolVersion?: string;
}

export interface CallToolResponse {
  protocolVersion: string;
  requestId: string;
  ok: boolean;
  result?: Json;
  error?: {
    code: string;
    message: string;
  };
}

export interface AuditEntry {
  timestamp: string;
  requestId: string;
  sessionId?: string;
  toolName: string;
  sideEffect: ToolSideEffect;
  argumentSummary?: Record<string, string>;
  outcome: "ok" | "error";
  errorCode?: string;
}

export interface AuditLogResponse {
  protocolVersion: string;
  entries: AuditEntry[];
}
