# WebMCP Inspector (Chrome Extension)

Purpose:

- Detect whether the active tab exposes `navigator.modelContext`.
- Inspect local WebMCP endpoints from a guided UI.
- Run quick conformance checks against the local server.

## Features

- Popup and side panel modes.
- Tabs: `Detect`, `Tools`, `Call`, `Audit`, `Metrics`.
- Safe `call_tool` guardrails:
  - warning for `write`/`sensitive` tools
  - requires `confirmed=true` when needed
  - enforces `sessionId` for session-scoped tools
- Conformance quick check button:
  - verifies `list_tools`, valid/invalid `call_tool`, protocol mismatch handling, and metrics.
- Deep-link button to website playground (`http://localhost:3000/playground`).

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select `/Users/sarvesh/code/webmcp_playground/apps/chrome-extension`.

## Local workflow

1. Start the WebMCP server:

```bash
cd /Users/sarvesh/code/webmcp_playground
npm run dev
```

2. Optional: start website playground:

```bash
cd /Users/sarvesh/code/webmcp_playground
npm run web:dev
```

3. Use extension popup:

- **Detect in Active Tab**
- **Refresh Tools**
- **Conformance Quick Check**
- **Open Side Panel** for larger workflow.

## Branding assets

- Master artwork: `assets/icon-master.svg`
- Exported icons: `assets/icon-16.png`, `assets/icon-32.png`, `assets/icon-48.png`, `assets/icon-128.png`
