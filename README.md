# WebMCP Playground

A public playground repository to learn, prototype, and test **WebMCP patterns for LLM applications**.

## Goals

- Learn WebMCP concepts hands-on.
- Build a small end-to-end playground (server + client).
- Keep reusable project scaffolding for future experiments.

## What Is Included

- Minimal TypeScript WebMCP-style playground server (`src/server.ts`)
- Example client (`src/client.ts`)
- Endpoint integration tests (`tests/mcp.integration.test.ts`)
- Guidance/conformance checks (`tests/webmcp.guidance.test.ts`)
- Adversarial descriptor security tests (`tests/security.injection.test.ts`)
- Strict tool input validation with `zod` (`src/tools.ts`)
- Tool side-effect policy (read/write/sensitive) with confirmation requirements
- Session-scoped tool isolation (`append_note`, `list_notes`, `clear_notes`)
- Protocol envelope fields (`protocolVersion`, `requestId`)
- Tool-call audit endpoint (`GET /mcp/audit_log`)
- Optional file-backed persistence for sessions/audit (`WEBMCP_DATA_DIR`)
- OpenAI Responses integration example (`examples/openai_responses_agent.mjs`)
- Learning docs and roadmap (`docs/`)
- Contributor and agent guidelines (`CONTRIBUTING.md`, `AGENTS.md`)
- Basic CI for test + typecheck + build (`.github/workflows/ci.yml`)

## Quickstart

```bash
npm install
npm run dev
```

In another terminal:

```bash
npm run client
```

Run tests:

```bash
npm test
```

Enable persistence for session notes and audit logs:

```bash
export WEBMCP_DATA_DIR=".webmcp-data"
npm run dev
```

Inspect recent audit entries:

```bash
curl "http://localhost:8787/mcp/audit_log?limit=10"
```

## LLM Integration Example

This repo includes a minimal OpenAI Responses tool loop example that calls local WebMCP endpoints.

```bash
export OPENAI_API_KEY="<your_key>"
node examples/openai_responses_agent.mjs "What is 7 + 35?"
```

Details: `docs/03-llm-integration.md`

## WebMCP Guidance Alignment

This repo tracks alignment to WebMCP reference guidance in:

- `docs/04-webmcp-alignment.md`

When protocol semantics change, update that file and matching tests.

## Project Structure

```text
.
├── .github/workflows/ci.yml
├── AGENTS.md
├── CONTRIBUTING.md
├── docs/
│   ├── 01-webmcp-primer.md
│   ├── 02-roadmap.md
│   ├── 03-llm-integration.md
│   └── 04-webmcp-alignment.md
├── examples/
│   └── openai_responses_agent.mjs
├── src/
│   ├── audit-log.ts
│   ├── app.ts
│   ├── client.ts
│   ├── persistence.ts
│   ├── policy.ts
│   ├── protocol.ts
│   ├── server.ts
│   ├── session-store.ts
│   ├── store-config.ts
│   └── tools.ts
├── tests/
│   ├── mcp.integration.test.ts
│   ├── persistence.storage.test.ts
│   ├── security.injection.test.ts
│   └── webmcp.guidance.test.ts
└── package.json
```

## Suggested Learning Path

1. Run the local server and client.
2. Add a new tool in `src/tools.ts`.
3. Extend the protocol shapes in `src/protocol.ts`.
4. Run `examples/openai_responses_agent.mjs` with your API key.
5. Iterate with notes in `docs/`.

## Publish As Public GitHub Repo

```bash
git init
git add .
git commit -m "Initial WebMCP playground scaffold"
gh repo create webmcp_playground --public --source=. --remote=origin --push
```

If `gh` is not authenticated, run:

```bash
gh auth login
```

## License

MIT
