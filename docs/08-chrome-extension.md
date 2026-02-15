# Chrome Extension Companion (WebMCP Inspector)

Location:

- `/Users/sarvesh/code/webmcp_playground/apps/chrome-extension`

## Why this extension exists

The extension helps developers answer two onboarding questions quickly:

1. Does the current page expose `navigator.modelContext`?
2. Is my local WebMCP server reachable and publishing tools?

## What it does

- Supports popup and side panel inspection modes.
- Tabs: `Detect`, `Tools`, `Call`, `Audit`, `Metrics`.
- Detects `navigator.modelContext` on the active tab.
- Calls local WebMCP endpoints:
  - `POST /mcp/list_tools`
  - `POST /mcp/call_tool`
  - `GET /mcp/audit_log`
  - `GET /mcp/metrics`
- Provides safe call guardrails for write/sensitive/session-scoped tools.
- Runs a conformance quick check against existing local endpoint behavior.
- Deep-links to web playground route: `http://localhost:3000/playground`.
- Ships a branded icon pack for toolbar and extension listing.

## Branding assets

- `apps/chrome-extension/assets/icon-master.svg`
- `apps/chrome-extension/assets/icon-16.png`
- `apps/chrome-extension/assets/icon-32.png`
- `apps/chrome-extension/assets/icon-48.png`
- `apps/chrome-extension/assets/icon-128.png`

## Load it in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select `/Users/sarvesh/code/webmcp_playground/apps/chrome-extension`.

## Local development flow

1. Run the WebMCP server:

```bash
cd /Users/sarvesh/code/webmcp_playground
npm run dev
```

2. Open extension popup and click:

- **List Tools** to verify server connectivity.
- **Detect in Tab** while browsing a target page.
