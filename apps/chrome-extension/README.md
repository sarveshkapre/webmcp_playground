# WebMCP Inspector (Chrome Extension MVP)

Purpose:

- Detect whether the active tab exposes `navigator.modelContext`.
- Query a local WebMCP server (`/mcp/list_tools`) from the popup.
- Provide a branded icon pack for Chrome toolbar and extension listing.

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select `/Users/sarvesh/code/webmcp_playground/apps/chrome-extension`.

## Branding assets

- Master artwork: `assets/icon-master.svg`
- Exported icons: `assets/icon-16.png`, `assets/icon-32.png`, `assets/icon-48.png`, `assets/icon-128.png`

## Local workflow

1. Start the playground server:

```bash
cd /Users/sarvesh/code/webmcp_playground
npm run dev
```

2. In the extension popup:

- Keep base URL as `http://localhost:8787`
- Click **List Tools** to confirm connectivity.
- Click **Detect in Tab** to inspect the current page.
