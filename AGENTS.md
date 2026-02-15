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
- `src/server.ts`: HTTP routes and protocol handling.
- `src/client.ts`: Example usage against local server.
- `docs/`: Learning notes and roadmap.

## Change Checklist

Before opening a PR:

1. Update docs for behavior changes.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Verify client still works against local server.

## Style

- TypeScript strict mode only.
- Avoid adding dependencies unless needed.
- Keep public response payloads stable and explicit.
