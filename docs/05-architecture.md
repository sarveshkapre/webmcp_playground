# Architecture

This diagram reflects the current playground runtime.

```mermaid
flowchart LR
  U["User / Agent"] --> C["LLM Client (example script)"]
  C -->|"POST /mcp/list_tools"| A["WebMCP App Router"]
  C -->|"POST /mcp/call_tool"| A
  C -->|"GET /mcp/audit_log"| A
  C -->|"GET /mcp/metrics"| A

  A --> T["Tool Registry + Policy"]
  T --> S["Session Store"]
  A --> L["Audit Log"]
  A --> M["Metrics"]

  S --> P["Optional Persistence (WEBMCP_DATA_DIR)"]
  L --> P

  T --> O["Output Sanitizer"]
  A --> R["Audit Redaction"]
```

## Components

- `src/app.ts`: HTTP routing, request validation, protocol-version checks.
- `src/tools.ts`: tool catalog, policy evaluation, schema validation, execution.
- `src/policy.ts`: confirmation and session requirements.
- `src/session-store.ts`: session-scoped state for tools.
- `src/audit-log.ts`: audit entries and query path.
- `src/metrics.ts`: runtime counters, error codes, and latency summaries.
- `src/redaction.ts`: audit argument/result redaction.
- `src/output-sanitizer.ts`: risky output filtering.
- `src/store-config.ts` + `src/persistence.ts`: optional file-backed state.
