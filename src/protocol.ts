export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface ToolDescriptor {
  name: string;
  description: string;
  input: Record<string, string>;
}

export interface ListToolsResponse {
  tools: ToolDescriptor[];
}

export interface CallToolRequest {
  name: string;
  arguments?: Record<string, unknown>;
}

export interface CallToolResponse {
  ok: boolean;
  result?: Json;
  error?: {
    code: string;
    message: string;
  };
}
