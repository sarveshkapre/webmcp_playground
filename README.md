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
- Strict tool input validation with `zod` (`src/tools.ts`)
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

## LLM Integration Example

This repo includes a minimal OpenAI Responses tool loop example that calls local WebMCP endpoints.

```bash
export OPENAI_API_KEY="<your_key>"
node examples/openai_responses_agent.mjs "What is 7 + 35?"
```

Details: `docs/03-llm-integration.md`

## Project Structure

```text
.
├── .github/workflows/ci.yml
├── AGENTS.md
├── CONTRIBUTING.md
├── docs/
│   ├── 01-webmcp-primer.md
│   ├── 02-roadmap.md
│   └── 03-llm-integration.md
├── examples/
│   └── openai_responses_agent.mjs
├── src/
│   ├── app.ts
│   ├── client.ts
│   ├── protocol.ts
│   ├── server.ts
│   └── tools.ts
├── tests/
│   └── mcp.integration.test.ts
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
