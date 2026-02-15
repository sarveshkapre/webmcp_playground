import { PROTOCOL_VERSION, type CallToolResponse, type ToolDescriptor } from "./protocol.js";

function policyError(requestId: string, code: string, message: string): CallToolResponse {
  return {
    protocolVersion: PROTOCOL_VERSION,
    requestId,
    ok: false,
    error: { code, message }
  };
}

export function evaluatePolicy(
  tool: ToolDescriptor,
  context: {
    requestId: string;
    sessionId?: string;
    confirmed?: boolean;
  }
): CallToolResponse | null {
  if (tool.sessionScoped && !context.sessionId) {
    return policyError(
      context.requestId,
      "SESSION_REQUIRED",
      `Tool "${tool.name}" requires a sessionId.`
    );
  }

  if (tool.requiresConfirmation && context.confirmed !== true) {
    return policyError(
      context.requestId,
      "CONFIRMATION_REQUIRED",
      `Tool "${tool.name}" requires explicit confirmation (confirmed=true).`
    );
  }

  return null;
}
