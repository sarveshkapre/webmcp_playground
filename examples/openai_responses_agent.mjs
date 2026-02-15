#!/usr/bin/env node

const openAiApiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const mcpBaseUrl = process.env.BASE_URL ?? "http://localhost:8787";
const userPrompt = process.argv.slice(2).join(" ") || "What is 12 + 30?";

if (!openAiApiKey) {
  console.error("Missing OPENAI_API_KEY. Export it before running this script.");
  process.exit(1);
}

async function postJson(url, body, headers = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}) for ${url}: ${text}`);
  }

  return response.json();
}

function toJsonSchema(tool) {
  const properties = {};
  const required = [];

  for (const [name, type] of Object.entries(tool.input ?? {})) {
    const jsonType = type === "number" ? "number" : type === "boolean" ? "boolean" : "string";
    properties[name] = { type: jsonType };
    required.push(name);
  }

  return {
    type: "object",
    properties,
    required,
    additionalProperties: false
  };
}

function extractOutputText(responseBody) {
  if (typeof responseBody.output_text === "string" && responseBody.output_text.length > 0) {
    return responseBody.output_text;
  }

  const output = Array.isArray(responseBody.output) ? responseBody.output : [];
  const chunks = [];

  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === "output_text" && typeof part.text === "string") {
        chunks.push(part.text);
      }
    }
  }

  return chunks.join("\n").trim();
}

function extractFunctionCalls(responseBody) {
  const output = Array.isArray(responseBody.output) ? responseBody.output : [];
  return output.filter((item) => item?.type === "function_call");
}

async function main() {
  const toolsResponse = await postJson(`${mcpBaseUrl}/mcp/list_tools`, {});
  const mcpTools = Array.isArray(toolsResponse.tools) ? toolsResponse.tools : [];

  const openAiTools = mcpTools.map((tool) => ({
    type: "function",
    name: tool.name,
    description: tool.description,
    parameters: toJsonSchema(tool)
  }));

  const commonHeaders = {
    Authorization: `Bearer ${openAiApiKey}`
  };

  const first = await postJson(
    "https://api.openai.com/v1/responses",
    {
      model,
      input: userPrompt,
      tools: openAiTools,
      instructions:
        "You can call available functions to answer the user. Use function tools when they help produce a precise answer."
    },
    commonHeaders
  );

  const functionCalls = extractFunctionCalls(first);
  if (functionCalls.length === 0) {
    const text = extractOutputText(first);
    console.log(text || JSON.stringify(first, null, 2));
    return;
  }

  const functionOutputs = [];

  for (const call of functionCalls) {
    let args = {};
    if (typeof call.arguments === "string" && call.arguments.length > 0) {
      try {
        args = JSON.parse(call.arguments);
      } catch {
        args = {};
      }
    }

    const toolResult = await postJson(`${mcpBaseUrl}/mcp/call_tool`, {
      name: call.name,
      arguments: args
    });

    functionOutputs.push({
      type: "function_call_output",
      call_id: call.call_id,
      output: JSON.stringify(toolResult)
    });
  }

  const second = await postJson(
    "https://api.openai.com/v1/responses",
    {
      model,
      previous_response_id: first.id,
      input: functionOutputs
    },
    commonHeaders
  );

  const text = extractOutputText(second);
  console.log(text || JSON.stringify(second, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
