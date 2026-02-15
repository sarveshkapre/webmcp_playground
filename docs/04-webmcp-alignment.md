# WebMCP Alignment Checklist

This document keeps `/Users/sarvesh/code/webmcp_playground` aligned with guidance from `/Users/sarvesh/code/webmcp`.

Reference snapshot date: 2026-02-15

Reference files:

- `/Users/sarvesh/code/webmcp/README.md`
- `/Users/sarvesh/code/webmcp/docs/proposal.md`
- `/Users/sarvesh/code/webmcp/docs/security-privacy-considerations.md`
- `/Users/sarvesh/code/webmcp/docs/service-workers.md`

## Scope For This Playground

This repo is an educational runtime playground, not the standard itself. We treat the following as mandatory for this codebase:

- Stable tool discovery and invocation contracts.
- Strict input validation and explicit error codes.
- Defensive defaults informed by security guidance.
- Repeatable tests for protocol behaviors.

## Must-Haves (Current)

| Item | Why it matters | Status | Enforced by |
|---|---|---|---|
| Tool discovery endpoint | Agents need a deterministic tool list | Implemented | `tests/mcp.integration.test.ts` |
| Tool invocation endpoint | Core tool-call lifecycle | Implemented | `tests/mcp.integration.test.ts` |
| Strict call payload validation | Reduces ambiguity and malformed requests | Implemented | `tests/webmcp.guidance.test.ts` |
| Explicit machine-readable errors | Agents need reliable recovery behavior | Implemented | `tests/webmcp.guidance.test.ts` |
| Unknown tool handling | Prevents silent behavior drift | Implemented | `tests/webmcp.guidance.test.ts` |
| Per-tool argument schemas | Minimizes unsafe or ambiguous inputs | Implemented | `src/tools.ts`, tests |
| Unique tool names | Aligns with proposal guidance | Implemented | `tests/webmcp.guidance.test.ts` |

## Security Guidance Mapping (Current)

| Guidance area | Current handling | Gap |
|---|---|---|
| Prompt/tool poisoning awareness | Strict schemas and explicit errors reduce malformed requests | Add output sanitization fixtures |
| Misrepresentation of tool intent | Tool descriptions remain concise and behavior-specific | Add side-effect classification metadata |
| Over-parameterization/privacy | Tool inputs intentionally minimal | Add policy layer for sensitive args |
| Session isolation | Not yet implemented | Add explicit session ID handling |

## Build-Order For Next Required Work

1. Add side-effect metadata and confirmation requirements for write/sensitive tools.
2. Add session ID support and per-session state isolation.
3. Add adversarial security tests for prompt and output injection scenarios.
4. Add protocol version field and compatibility tests.

## PR Rule

If a PR changes protocol shape, tool semantics, or security behavior:

1. Update this file.
2. Add or update tests in `tests/`.
3. Mention the alignment impact in the PR description.
