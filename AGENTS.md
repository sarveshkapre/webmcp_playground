# AGENTS.md

Guidance for human and AI contributors working in this repository.

## Mission

Build and refine a practical WebMCP playground for LLM integrations.

## Core Principles

- Keep changes small, explicit, and testable.
- Prefer readability over clever abstractions.
- Keep docs aligned with code in the same PR.
- Preserve backwards compatibility in protocol fields when possible.

## Local Setup

```bash
npm install
npm test
npm run typecheck
npm run build
```

Run the playground:

```bash
npm run dev
npm run client
```

## File Responsibilities

- `src/protocol.ts`: Shared protocol types and envelopes.
- `src/tools.ts`: Tool registry and tool implementations.
- `src/policy.ts`: Tool policy checks (confirmation/session requirements).
- `src/session-store.ts`: Session-scoped in-memory state used by tools.
- `src/audit-log.ts`: In-memory audit trail for tool calls.
- `src/persistence.ts`: JSON file persistence helpers.
- `src/store-config.ts`: Optional persistence wiring from environment config.
- `src/app.ts`: HTTP route handling and request validation.
- `src/server.ts`: HTTP server bootstrap.
- `src/client.ts`: Example usage against local server.
- `tests/`: Endpoint integration, guidance, and security tests.
- `docs/`: Learning notes and roadmap.
- `docs/04-webmcp-alignment.md`: Required alignment checklist against reference WebMCP guidance.

## Change Checklist

Before opening a PR:

1. Update docs for behavior changes.
2. Run `npm test`.
3. Run `npm run typecheck`.
4. Run `npm run build`.
5. Verify client still works against local server.
6. If protocol/security semantics changed, update `docs/04-webmcp-alignment.md`.

## Style

- TypeScript strict mode only.
- Avoid adding dependencies unless needed.
- Keep public response payloads stable and explicit.
