# Changelog

All notable changes to this project are documented in this file.

## [0.3.0] - 2026-02-15

### Added

- Side-effect-aware tool policy (`read`/`write`/`sensitive`) with confirmation and session requirements.
- Session-scoped tools: `append_note`, `list_notes`, `clear_notes`.
- Protocol envelope fields: `protocolVersion`, `requestId`.
- Protocol mismatch handling (`UNSUPPORTED_PROTOCOL_VERSION`).
- Tool-call audit endpoint (`GET /mcp/audit_log`).
- Audit argument/result redaction with configurable keys (`WEBMCP_REDACT_KEYS`).
- Output sanitization for risky prompt-injection-like text (`WEBMCP_SANITIZE_OUTPUT`).
- Optional file-backed persistence for audit/session stores (`WEBMCP_DATA_DIR`).
- Security and persistence test suites.
- Architecture, transcript, and reliability documentation.

### Changed

- OpenAI example now supports session-aware and confirmation-gated tool calls.

## [0.2.0] - 2026-02-15

### Added

- Initial strict tool validation, integration tests, and LLM integration example.

## [0.1.0] - 2026-02-15

### Added

- Initial WebMCP playground scaffold.
