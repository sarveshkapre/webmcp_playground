import type { CallToolResponse, ListToolsResponse } from "./protocol.js";

const baseUrl = process.env.BASE_URL ?? "http://localhost:8787";
const sessionId = process.env.SESSION_ID ?? "demo-session";

async function main(): Promise<void> {
  const listRes = await fetch(`${baseUrl}/mcp/list_tools`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });

  const listData = (await listRes.json()) as ListToolsResponse;
  console.log("Protocol version:", listData.protocolVersion);
  console.log("Available tools:", listData.tools.map((t) => t.name));

  const sumRes = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "sum",
      arguments: { a: 7, b: 35 }
    })
  });

  const sumData = (await sumRes.json()) as CallToolResponse;
  console.log("sum response:", sumData);

  const appendRes = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "append_note",
      sessionId,
      confirmed: true,
      arguments: { text: "Remember to test session isolation." }
    })
  });

  const appendData = (await appendRes.json()) as CallToolResponse;
  console.log("append_note response:", appendData);

  const notesRes = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "list_notes",
      sessionId,
      arguments: {}
    })
  });

  const notesData = (await notesRes.json()) as CallToolResponse;
  console.log("list_notes response:", notesData);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
