# Roadmap

## Phase 1: Local Playground

- [x] Basic server/client scaffold
- [x] Tool registry
- [x] Minimal docs and contributor guidance

## Phase 2: Stronger Protocol

- [x] Add argument schema validation
- [x] Add richer error codes
- [x] Add request IDs and tracing

## Phase 3: Real LLM Integration

- [x] Wire into an LLM agent framework
- [x] Add example prompts and transcripts
- [x] Capture reliability/performance notes

## Phase 4: Public Learning Repo Quality

- [x] Add tests
- [x] Add architecture diagram
- [x] Add release tags/changelog

## Phase 5: WebMCP Guidance Alignment

- [x] Add explicit alignment checklist against reference docs
- [x] Add guidance/conformance test coverage
- [x] Add side-effect and confirmation policy model
- [x] Add session isolation semantics

## Phase 6: Hardening

- [x] Add in-memory audit trail for tool calls
- [x] Add protocol version envelope fields
- [x] Add adversarial descriptor validation tests
- [x] Add persistence-backed audit/session storage (opt-in via `WEBMCP_DATA_DIR`)
- [x] Add configurable argument/result redaction for audit logs
- [x] Add output sanitization for risky prompt-injection-like content

## Phase 7: Adoption UX

- [x] Build Next.js + Tailwind + shadcn-style tutorial website
- [x] Add in-browser playground console for local WebMCP endpoints
- [x] Add Chrome extension MVP for capability detection and local tool listing
