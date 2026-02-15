# LLM Integration Example (OpenAI Responses)

This repository includes a simple agent loop script at `examples/openai_responses_agent.mjs`.

It does the following:

1. Reads available tools from local WebMCP server (`/mcp/list_tools`).
2. Exposes those tools to an OpenAI Responses call as function tools.
3. Executes any requested function calls against local WebMCP (`/mcp/call_tool`).
4. Sends function outputs back to OpenAI to produce a final answer.

Note: tools with side effects may require `sessionId` and `confirmed=true` in tool-call payloads.

## Run

Start the local WebMCP playground server:

```bash
npm run dev
```

In another terminal:

```bash
export OPENAI_API_KEY="<your_key>"
node examples/openai_responses_agent.mjs "What is 7 + 35?"
```

Optional environment variables:

- `OPENAI_MODEL` (default: `gpt-4.1-mini`)
- `BASE_URL` (default: `http://localhost:8787`)
- `WEBMCP_SESSION_ID` (default: `agent-session`)
- `WEBMCP_AUTO_CONFIRM` (default: `true`)
- `WEBMCP_DATA_DIR` (optional path for persistent session/audit state)

## Notes

- This is intentionally minimal for learning.
- For production, add retries, stronger schema constraints, and auth controls.
