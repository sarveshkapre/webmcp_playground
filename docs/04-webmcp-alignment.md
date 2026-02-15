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
| Protocol envelope fields (`protocolVersion`, `requestId`) | Compatibility and traceability | Implemented | `tests/webmcp.guidance.test.ts` |
| Side-effect and confirmation policy | Safer handling for write/sensitive tools | Implemented | `tests/mcp.integration.test.ts` |
| Session-scoped tool isolation | Prevents cross-session state bleed | Implemented | `tests/mcp.integration.test.ts` |
| Tool-call audit logging | Accountability and debugging | Implemented | `tests/mcp.integration.test.ts` |
| Descriptor injection guard | Reduces metadata poisoning risk | Implemented | `tests/security.injection.test.ts` |

## Security Guidance Mapping (Current)

| Guidance area | Current handling | Gap |
|---|---|---|
| Prompt/tool poisoning awareness | Descriptor validator rejects risky metadata patterns; strict payload validation in place | Add richer output-sanitization fixtures |
| Misrepresentation of tool intent | Tool metadata includes side-effect class and confirmation requirements | Add stronger behavioral contracts for external integrations |
| Over-parameterization/privacy | Tool inputs remain minimal and schema-validated | Add configurable redaction/PII policies |
| Session isolation | Session-scoped tools require `sessionId`, with isolated in-memory state | Add persistence-backed session storage |

## Build-Order For Next Required Work

1. Add persistence-backed audit and session stores.
2. Add configurable redaction policies for sensitive tool arguments and outputs.
3. Add compatibility tests for multiple protocol versions.
4. Add stronger output sanitization fixtures for adversarial content.

## PR Rule

If a PR changes protocol shape, tool semantics, or security behavior:

1. Update this file.
2. Add or update tests in `tests/`.
3. Mention the alignment impact in the PR description.
