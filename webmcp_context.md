# WebMCP Context Log

Last updated: 2026-02-15
Owner: WebMCP Playground

## Objective
Build a best-in-class **WebMCP Inspector** Chrome extension and associated website workflow that help teams:

- detect WebMCP capability in real pages,
- validate local/remote WebMCP servers,
- inspect safety/policy behavior,
- and accelerate onboarding for WebMCP adoption.

## Current Project Snapshot

### Local repositories
- Primary build repo: `/Users/sarvesh/code/webmcp_playground`
- Reference/spec repo: `/Users/sarvesh/code/webmcp`

### What exists today
- WebMCP local server with:
  - `list_tools`, `call_tool`, `audit_log`, `metrics`
  - policy gates (`requiresConfirmation`, `sessionScoped`)
  - protocol version checks
  - redaction + output sanitization
  - persistence toggle (`WEBMCP_DATA_DIR`)
- Next.js site in `apps/web`
- Chrome extension in `apps/chrome-extension` (renamed to **WebMCP Inspector**)

## Sources Reviewed

### Local source of truth
- `/Users/sarvesh/code/webmcp/README.md`
- `/Users/sarvesh/code/webmcp/docs/proposal.md`
- `/Users/sarvesh/code/webmcp/docs/security-privacy-considerations.md`
- `/Users/sarvesh/code/webmcp/docs/service-workers.md`
- `/Users/sarvesh/code/webmcp_playground/docs/04-webmcp-alignment.md`

### Web research (external)
- WebMCP proposal repo: https://github.com/webmachinelearning/webmcp
- MCP introduction: https://modelcontextprotocol.io/introduction
- MCP Inspector docs: https://modelcontextprotocol.io/docs/tools/inspector
- MCP servers repository: https://github.com/modelcontextprotocol/servers
- Chrome extension docs (MV3): https://developer.chrome.com/docs/extensions/develop
- Chrome side panel API: https://developer.chrome.com/docs/extensions/reference/api/sidePanel

---

## Context Iteration 1/5: Baseline Inventory

### Questions asked
1. What have we already built in the playground that the extension can leverage?
2. What is duplicated vs missing across server, web UI, and extension?

### Findings
- Strong backend core already exists (policy, audit, metrics, sanitization).
- Extension currently performs only two checks:
  - detect `navigator.modelContext`
  - call `/mcp/list_tools`
- Biggest gap is not backend capability, but **inspection UX** and **workflow glue**.

### Insight
The extension should be a thin, high-trust inspector on top of existing backend primitives, not a second backend.

---

## Context Iteration 2/5: Spec Alignment

### Questions asked
1. What parts of WebMCP proposal are most relevant to extension UX?
2. Which spec concerns map directly to inspector features?

### Findings
- Discovery, session routing, and safety concerns are central.
- Security/privacy doc emphasizes prompt injection, intent mismatch, and over-parameterization.
- Service worker explainer implies future background interactions and routing ambiguity.

### Insight
Inspector should surface:
- origin + context boundaries,
- tool metadata risk indicators,
- session scoping clarity,
- and explicit user confirmation state.

---

## Context Iteration 3/5: Ecosystem Scan

### Questions asked
1. What are people building around MCP today?
2. Where can a browser extension provide unique value?

### Findings
- MCP ecosystem has server catalogs, integration runtimes, and an official inspector tool.
- Existing tools are mostly developer-console and transport-centric.
- Browser-native inspection for **page-level WebMCP capability** remains underserved.

### Insight
WebMCP Inspector should differentiate via browser-context awareness:
- active tab capability,
- page+server correlation,
- UI-first diagnostics.

---

## Context Iteration 4/5: Product Framing

### Questions asked
1. Who is the first user persona?
2. What is the shortest path to repeated daily use?

### Findings
- Primary persona: frontend/platform engineers integrating WebMCP into sites.
- Secondary persona: AI platform integration engineers validating tool contracts.
- Daily-use jobs:
  - "Does this page expose WebMCP?"
  - "Which tools are live right now?"
  - "Why did this call fail?"

### Insight
The extension roadmap should prioritize **diagnostics speed** over advanced automation.

---

## Context Iteration 5/5: Constraints + Strategic Position

### Questions asked
1. What constraints could block trust or adoption?
2. What should never be done in v1-v2?

### Findings
- Key constraints:
  - permissions sensitivity in Chrome extensions,
  - security risk from over-broad host access,
  - ambiguity between page-declared tools vs local backend tools.
- Avoid in early phases:
  - broad scraping/automation claims,
  - background actions without clear user controls,
  - opaque data collection.

### Insight
Positioning should be: **transparent inspector + guided onboarding**, not autonomous actor.

---

# Chrome Extension Roadmap Brainstorm (Iterative)

## Roadmap Iteration 1/5: Candidate Features

### Questions asked
1. Which features map directly to known user jobs?
2. Which are low-effort, high-signal?

### Candidate set
- Capability probe (exists)
- Tool list + metadata rendering (partial)
- One-click sample `call_tool`
- Audit + metrics viewer
- Config profiles (local/staging/prod endpoints)

### Decision
Start with inspection and verification loop before advanced action features.

---

## Roadmap Iteration 2/5: Prioritization by User Value

### Questions asked
1. What reduces integration debugging time fastest?
2. What can be built with current backend endpoints?

### Prioritized
1. Tool metadata table (sideEffect/session/confirmation badges)
2. Structured tool call form + response viewer
3. Audit tail + metrics snapshot panels
4. Environment presets (saved base URLs)

### Deprioritized
- Tool execution automation across tabs
- Multi-origin orchestration in extension

---

## Roadmap Iteration 3/5: Security and Trust Layer

### Questions asked
1. How do we make users trust inspector output?
2. How do we reduce accidental misuse?

### Additions
- Permission minimization policy in docs/UI
- Explicit warning when calling write/sensitive tools
- Confirmation checkbox guard in popup before send
- Display of protocolVersion mismatch errors with remediation tips

### Insight
Security affordances should be first-class UI, not buried settings.

---

## Roadmap Iteration 4/5: UX Architecture Options

### Questions asked
1. Is popup enough for advanced workflows?
2. Where should deeper logs and tutorials live?

### Options compared
- Popup-only: simple, limited screen real estate
- Popup + side panel: richer inspection experience
- Popup + open website page: best for tutorial depth

### Decision
Phase to **Popup + Side Panel + Website deep links**.

---

## Roadmap Iteration 5/5: Final Phased Plan

### Phase A (Now)
- Rename and brand to WebMCP Inspector
- Capability detection
- Tool list verification
- Base URL persistence

### Phase B (Next)
- Metadata-rich tool table in popup/side panel
- Safe `call_tool` form (JSON args + session + confirmation)
- Audit and metrics views
- Error explainer hints

### Phase C
- Context correlation (active tab origin vs selected server profile)
- Session inspector (known session IDs + recent calls)
- Export diagnostics bundle (JSON)

### Phase D
- Team workflows:
  - shareable inspector snapshots
  - CI-friendly validation script parity
  - policy lint checks against WebMCP guidance

---

## High-Value Questions to Resolve Next

1. Should the extension call only local servers by default, with explicit opt-in for remote hosts?
2. Do we want side panel in Phase B immediately, or after popup reaches feature parity?
3. Should write/sensitive tool execution be disabled by default in extension UI?
4. What telemetry (if any) is acceptable, and where should logs stay (local only vs export)?
5. Should WebMCP Inspector include a built-in “conformance quick check” button tied to your current endpoints?

## Proposed Immediate Next Build Slice

- Add popup tabs: `Detect`, `Tools`, `Call`, `Audit`, `Metrics`
- Add call-form guardrails for write/sensitive tools
- Add “Open in Web UI” deep link to `/playground`
