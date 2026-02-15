interface ToolMetrics {
  totalCalls: number;
  okCalls: number;
  errorCalls: number;
  totalLatencyMs: number;
  maxLatencyMs: number;
}

interface MetricsState {
  totalCalls: number;
  okCalls: number;
  errorCalls: number;
  tools: Record<string, ToolMetrics>;
  errorsByCode: Record<string, number>;
}

const state: MetricsState = {
  totalCalls: 0,
  okCalls: 0,
  errorCalls: 0,
  tools: {},
  errorsByCode: {}
};

function ensureToolMetrics(toolName: string): ToolMetrics {
  if (!state.tools[toolName]) {
    state.tools[toolName] = {
      totalCalls: 0,
      okCalls: 0,
      errorCalls: 0,
      totalLatencyMs: 0,
      maxLatencyMs: 0
    };
  }
  return state.tools[toolName];
}

export function recordToolCall(
  toolName: string,
  outcome: "ok" | "error",
  latencyMs: number,
  errorCode?: string
): void {
  state.totalCalls += 1;
  if (outcome === "ok") {
    state.okCalls += 1;
  } else {
    state.errorCalls += 1;
    if (errorCode) {
      state.errorsByCode[errorCode] = (state.errorsByCode[errorCode] ?? 0) + 1;
    }
  }

  const tool = ensureToolMetrics(toolName);
  tool.totalCalls += 1;
  if (outcome === "ok") {
    tool.okCalls += 1;
  } else {
    tool.errorCalls += 1;
  }
  tool.totalLatencyMs += latencyMs;
  tool.maxLatencyMs = Math.max(tool.maxLatencyMs, latencyMs);
}

export function getMetricsSnapshot(): MetricsState {
  const tools: MetricsState["tools"] = {};
  for (const [toolName, metric] of Object.entries(state.tools)) {
    tools[toolName] = { ...metric };
  }

  return {
    totalCalls: state.totalCalls,
    okCalls: state.okCalls,
    errorCalls: state.errorCalls,
    tools,
    errorsByCode: { ...state.errorsByCode }
  };
}

export function resetMetrics(): void {
  state.totalCalls = 0;
  state.okCalls = 0;
  state.errorCalls = 0;
  state.tools = {};
  state.errorsByCode = {};
}
