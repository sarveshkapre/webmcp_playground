# Reliability and Performance Notes

## Current reliability controls

- Strict request shape validation via `zod`.
- Strict per-tool argument schemas.
- Explicit, machine-readable error codes.
- Protocol-version mismatch rejection.
- Confirmation/session gates for write/sensitive tools.
- Audit logging with argument/result redaction.

## Current performance profile

For local development usage, request latency is typically dominated by:

1. Tool execution logic.
2. JSON serialization.
3. Optional file persistence writes.

Current in-memory operations are O(1) to O(n) for small lists and bounded audit size (`MAX_AUDIT_ENTRIES=500`).

## Known limits

- Persistence is local file-backed and not multi-process coordinated.
- No distributed locking.
- No streaming tool results yet.

## Next reliability steps

1. Add structured retry guidance for clients.
2. Expand metrics with latency buckets and percentile views.
3. Add chaos/adversarial tests for malformed and high-volume traffic.

## Metrics endpoint

Current runtime metrics are exposed at:

- `GET /mcp/metrics`

The endpoint returns:

- global call totals (`totalCalls`, `okCalls`, `errorCalls`)
- per-tool totals and latency summaries
- error counts keyed by error code
