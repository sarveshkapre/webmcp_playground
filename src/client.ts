import type { CallToolResponse, ListToolsResponse } from "./protocol.js";

const baseUrl = process.env.BASE_URL ?? "http://localhost:8787";

async function main(): Promise<void> {
  const listRes = await fetch(`${baseUrl}/mcp/list_tools`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });

  const listData = (await listRes.json()) as ListToolsResponse;
  console.log("Available tools:", listData.tools.map((t) => t.name));

  const callRes = await fetch(`${baseUrl}/mcp/call_tool`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "sum",
      arguments: { a: 7, b: 35 }
    })
  });

  const callData = (await callRes.json()) as CallToolResponse;
  console.log("Tool call response:", callData);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
