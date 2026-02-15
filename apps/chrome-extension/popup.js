const baseUrlInput = document.getElementById("baseUrl");
const detectBtn = document.getElementById("detectBtn");
const listBtn = document.getElementById("listBtn");
const capability = document.getElementById("capability");
const toolsOutput = document.getElementById("toolsOutput");

const DEFAULT_BASE_URL = "http://localhost:8787";

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function saveBaseUrl(value) {
  await chrome.storage.local.set({ baseUrl: value });
}

async function loadBaseUrl() {
  const state = await chrome.storage.local.get(["baseUrl"]);
  return state.baseUrl || DEFAULT_BASE_URL;
}

async function detectWebMcpInTab() {
  const tab = await getActiveTab();
  if (!tab?.id) {
    capability.textContent = "No active tab available.";
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return {
          hasModelContext: typeof navigator === "object" && "modelContext" in navigator,
          url: window.location.href
        };
      }
    });

    const result = results?.[0]?.result;
    if (!result) {
      capability.textContent = "Unable to inspect tab.";
      return;
    }

    capability.textContent = result.hasModelContext
      ? `WebMCP API detected on ${new URL(result.url).host}`
      : `No navigator.modelContext on ${new URL(result.url).host}`;
  } catch (error) {
    capability.textContent = `Detection failed: ${String(error)}`;
  }
}

async function listToolsFromServer() {
  const baseUrl = baseUrlInput.value.trim() || DEFAULT_BASE_URL;
  await saveBaseUrl(baseUrl);

  try {
    const response = await fetch(`${baseUrl}/mcp/list_tools`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}"
    });

    const data = await response.json();
    const names = Array.isArray(data.tools) ? data.tools.map((tool) => tool.name) : [];
    toolsOutput.textContent = JSON.stringify(
      {
        protocolVersion: data.protocolVersion,
        toolCount: names.length,
        tools: names
      },
      null,
      2
    );
  } catch (error) {
    toolsOutput.textContent = `Failed to load tools: ${String(error)}`;
  }
}

(async function init() {
  baseUrlInput.value = await loadBaseUrl();
})();

baseUrlInput.addEventListener("change", () => {
  void saveBaseUrl(baseUrlInput.value.trim() || DEFAULT_BASE_URL);
});

detectBtn.addEventListener("click", () => {
  void detectWebMcpInTab();
});

listBtn.addEventListener("click", () => {
  void listToolsFromServer();
});
