# WebMCP Playground

A public playground repository to learn, prototype, and test **WebMCP patterns for LLM applications**.

## Goals

- Learn WebMCP concepts hands-on.
- Build a small end-to-end playground (server + client).
- Keep reusable project scaffolding for future experiments.

## What Is Included

- Minimal TypeScript WebMCP-style playground server (`src/server.ts`)
- Example client (`src/client.ts`)
- Learning docs and roadmap (`docs/`)
- Contributor and agent guidelines (`CONTRIBUTING.md`, `AGENTS.md`)
- Basic CI for typecheck + build (`.github/workflows/ci.yml`)

## Quickstart

```bash
npm install
npm run dev
```

In another terminal:

```bash
npm run client
```

## Project Structure

```text
.
├── .github/workflows/ci.yml
├── AGENTS.md
├── CONTRIBUTING.md
├── docs/
│   ├── 01-webmcp-primer.md
│   └── 02-roadmap.md
├── src/
│   ├── client.ts
│   ├── protocol.ts
│   ├── server.ts
│   └── tools.ts
└── package.json
```

## Suggested Learning Path

1. Run the local server and client.
2. Add a new tool in `src/tools.ts`.
3. Extend the protocol shapes in `src/protocol.ts`.
4. Wire a real LLM app to call this playground.
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
