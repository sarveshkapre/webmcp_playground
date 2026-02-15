(function () {
  const DEFAULT_BASE_URL = "http://localhost:8787";
  const DEFAULT_PLAYGROUND_URL = "http://localhost:3000/playground";

  function pretty(value) {
    return JSON.stringify(value, null, 2);
  }

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  async function readStorage(keys) {
    return chrome.storage.local.get(keys);
  }

  async function writeStorage(value) {
    return chrome.storage.local.set(value);
  }

  async function postJson(baseUrl, path, payload) {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = { raw: "non-json response" };
    }

    return { response, data };
  }

  async function getJson(baseUrl, path) {
    const response = await fetch(`${baseUrl}${path}`, { method: "GET" });
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = { raw: "non-json response" };
    }

    return { response, data };
  }

  function inferDefaultArgs(tool) {
    const args = {};
    if (!tool?.input) {
      return args;
    }

    for (const [key, type] of Object.entries(tool.input)) {
      if (type === "number") {
        args[key] = 0;
      } else if (type === "boolean") {
        args[key] = false;
      } else {
        args[key] = "";
      }
    }

    return args;
  }

  function createState() {
    return {
      tools: [],
      currentToolName: "",
      mode: "popup"
    };
  }

  function bindTabs(root) {
    const tabs = Array.from(root.querySelectorAll(".tab"));
    const panels = Array.from(root.querySelectorAll(".tab-panel"));

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        tabs.forEach((candidate) => candidate.classList.remove("active"));
        panels.forEach((panel) => panel.classList.remove("active"));

        tab.classList.add("active");
        const panel = root.querySelector(`.tab-panel[data-panel="${target}"]`);
        if (panel) {
          panel.classList.add("active");
        }
      });
    });
  }

  function updateGuardrail(root, state) {
    const guardrail = root.querySelector("#callGuardrail");
    const callBtn = root.querySelector("#callBtn");
    const confirmedCheckbox = root.querySelector("#callConfirmed");
    const sessionInput = root.querySelector("#sessionId");

    if (!guardrail || !callBtn || !confirmedCheckbox || !sessionInput) {
      return;
    }

    const tool = state.tools.find((item) => item.name === state.currentToolName);
    const messages = [];
    let blocked = false;

    if (tool?.sideEffect === "write" || tool?.sideEffect === "sensitive") {
      messages.push(`This is a ${tool.sideEffect} tool and may change state.`);
      if (tool.requiresConfirmation && !confirmedCheckbox.checked) {
        messages.push("Enable confirmed=true before calling this tool.");
        blocked = true;
      }
    }

    if (tool?.sessionScoped && !sessionInput.value.trim()) {
      messages.push("This tool requires a sessionId.");
      blocked = true;
    }

    if (messages.length > 0) {
      guardrail.classList.remove("hidden");
      guardrail.textContent = messages.join(" ");
    } else {
      guardrail.classList.add("hidden");
      guardrail.textContent = "";
    }

    callBtn.disabled = blocked;
  }

  async function setup(root, mode) {
    const state = createState();
    state.mode = mode;

    bindTabs(root);

    const baseUrlInput = root.querySelector("#baseUrl");
    const capability = root.querySelector("#capability");
    const toolsOutput = root.querySelector("#toolsOutput");
    const callOutput = root.querySelector("#callOutput");
    const auditOutput = root.querySelector("#auditOutput");
    const metricsOutput = root.querySelector("#metricsOutput");
    const quickCheckOutput = root.querySelector("#quickCheckOutput");

    const toolSelect = root.querySelector("#toolSelect");
    const callArgs = root.querySelector("#callArgs");
    const sessionIdInput = root.querySelector("#sessionId");
    const protocolVersionInput = root.querySelector("#protocolVersion");
    const callConfirmed = root.querySelector("#callConfirmed");
    const auditLimitInput = root.querySelector("#auditLimit");

    const detectBtn = root.querySelector("#detectBtn");
    const listBtn = root.querySelector("#listBtn");
    const callBtn = root.querySelector("#callBtn");
    const auditBtn = root.querySelector("#auditBtn");
    const metricsBtn = root.querySelector("#metricsBtn");
    const quickCheckBtn = root.querySelector("#quickCheckBtn");
    const openPlaygroundBtn = root.querySelector("#openPlaygroundBtn");
    const openSidePanelBtn = root.querySelector("#openSidePanelBtn");

    const persisted = await readStorage(["baseUrl", "playgroundUrl"]);
    baseUrlInput.value = persisted.baseUrl || DEFAULT_BASE_URL;

    baseUrlInput.addEventListener("change", async () => {
      await writeStorage({ baseUrl: baseUrlInput.value.trim() || DEFAULT_BASE_URL });
    });

    async function detectWebMcpInTab() {
      const tab = await getActiveTab();
      if (!tab?.id) {
        capability.textContent = "No active tab available.";
        return;
      }

      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => ({
            hasModelContext: typeof navigator === "object" && "modelContext" in navigator,
            title: document.title,
            url: window.location.href
          })
        });

        const result = results?.[0]?.result;
        if (!result) {
          capability.textContent = "Unable to inspect tab.";
          return;
        }

        capability.textContent = result.hasModelContext
          ? `Detected on ${new URL(result.url).host} (${result.title || "untitled"})`
          : `No navigator.modelContext on ${new URL(result.url).host}`;
      } catch (error) {
        capability.textContent = `Detection failed: ${String(error)}`;
      }
    }

    async function refreshTools() {
      const baseUrl = baseUrlInput.value.trim() || DEFAULT_BASE_URL;
      await writeStorage({ baseUrl });

      try {
        const { data } = await postJson(baseUrl, "/mcp/list_tools", {});
        state.tools = Array.isArray(data.tools) ? data.tools : [];

        toolsOutput.textContent = pretty({
          protocolVersion: data.protocolVersion,
          tools: state.tools.map((tool) => ({
            name: tool.name,
            sideEffect: tool.sideEffect,
            requiresConfirmation: tool.requiresConfirmation,
            sessionScoped: tool.sessionScoped
          }))
        });

        toolSelect.innerHTML = "";
        for (const tool of state.tools) {
          const option = document.createElement("option");
          option.value = tool.name;
          option.textContent = `${tool.name} (${tool.sideEffect})`;
          toolSelect.appendChild(option);
        }

        if (state.tools.length > 0) {
          const first = state.tools[0];
          state.currentToolName = first.name;
          toolSelect.value = first.name;
          callArgs.value = pretty(inferDefaultArgs(first));
        }

        updateGuardrail(root, state);
      } catch (error) {
        toolsOutput.textContent = `Failed to load tools: ${String(error)}`;
      }
    }

    toolSelect.addEventListener("change", () => {
      state.currentToolName = toolSelect.value;
      const tool = state.tools.find((item) => item.name === state.currentToolName);
      if (tool) {
        callArgs.value = pretty(inferDefaultArgs(tool));
      }
      updateGuardrail(root, state);
    });

    callConfirmed.addEventListener("change", () => updateGuardrail(root, state));
    sessionIdInput.addEventListener("input", () => updateGuardrail(root, state));

    async function callTool() {
      const baseUrl = baseUrlInput.value.trim() || DEFAULT_BASE_URL;
      await writeStorage({ baseUrl });

      try {
        const args = JSON.parse(callArgs.value || "{}");
        const payload = {
          name: toolSelect.value,
          arguments: args,
          sessionId: sessionIdInput.value.trim() || undefined,
          protocolVersion: protocolVersionInput.value.trim() || undefined,
          confirmed: callConfirmed.checked
        };

        const { response, data } = await postJson(baseUrl, "/mcp/call_tool", payload);
        callOutput.textContent = pretty({ status: response.status, body: data });
      } catch (error) {
        callOutput.textContent = `Failed to call tool: ${String(error)}`;
      }
    }

    async function loadAudit() {
      const baseUrl = baseUrlInput.value.trim() || DEFAULT_BASE_URL;
      const limit = Number(auditLimitInput.value) || 20;

      try {
        const { response, data } = await getJson(baseUrl, `/mcp/audit_log?limit=${Math.min(Math.max(limit, 1), 100)}`);
        auditOutput.textContent = pretty({ status: response.status, body: data });
      } catch (error) {
        auditOutput.textContent = `Failed to load audit: ${String(error)}`;
      }
    }

    async function loadMetrics() {
      const baseUrl = baseUrlInput.value.trim() || DEFAULT_BASE_URL;

      try {
        const { response, data } = await getJson(baseUrl, "/mcp/metrics");
        metricsOutput.textContent = pretty({ status: response.status, body: data });
      } catch (error) {
        metricsOutput.textContent = `Failed to load metrics: ${String(error)}`;
      }
    }

    async function runQuickCheck() {
      const baseUrl = baseUrlInput.value.trim() || DEFAULT_BASE_URL;
      const checks = [];

      async function run(name, fn) {
        try {
          const detail = await fn();
          checks.push({ name, status: "PASS", detail });
        } catch (error) {
          checks.push({ name, status: "FAIL", detail: String(error) });
        }
      }

      await run("list_tools", async () => {
        const { response, data } = await postJson(baseUrl, "/mcp/list_tools", {});
        if (response.status !== 200 || !Array.isArray(data.tools)) {
          throw new Error(`Unexpected response: ${response.status}`);
        }
        return { toolCount: data.tools.length, protocolVersion: data.protocolVersion };
      });

      await run("sum valid call", async () => {
        const { response, data } = await postJson(baseUrl, "/mcp/call_tool", {
          name: "sum",
          arguments: { a: 7, b: 35 }
        });

        if (response.status !== 200 || data.ok !== true || data.result?.value !== 42) {
          throw new Error(`Expected 42; got ${pretty(data)}`);
        }
        return { requestId: data.requestId };
      });

      await run("sum invalid args", async () => {
        const { response, data } = await postJson(baseUrl, "/mcp/call_tool", {
          name: "sum",
          arguments: { a: "bad", b: 35 }
        });

        if (response.status !== 200 || data.ok !== false || data.error?.code !== "INVALID_ARGUMENTS") {
          throw new Error(`Expected INVALID_ARGUMENTS; got ${pretty(data)}`);
        }
        return { error: data.error?.code };
      });

      await run("session-required check", async () => {
        const { response, data } = await postJson(baseUrl, "/mcp/call_tool", {
          name: "list_notes",
          arguments: {}
        });

        if (response.status !== 200 || data.ok !== false || data.error?.code !== "SESSION_REQUIRED") {
          throw new Error(`Expected SESSION_REQUIRED; got ${pretty(data)}`);
        }
        return { error: data.error?.code };
      });

      await run("protocol mismatch check", async () => {
        const { response, data } = await postJson(baseUrl, "/mcp/call_tool", {
          name: "sum",
          protocolVersion: "legacy-v1",
          arguments: { a: 1, b: 2 }
        });

        if (response.status !== 400 || data.error?.code !== "UNSUPPORTED_PROTOCOL_VERSION") {
          throw new Error(`Expected UNSUPPORTED_PROTOCOL_VERSION; got ${pretty(data)}`);
        }
        return { error: data.error?.code };
      });

      await run("metrics endpoint", async () => {
        const { response, data } = await getJson(baseUrl, "/mcp/metrics");
        if (response.status !== 200 || !data.totals) {
          throw new Error(`Unexpected metrics response: ${response.status}`);
        }
        return data.totals;
      });

      quickCheckOutput.textContent = pretty({
        passed: checks.filter((check) => check.status === "PASS").length,
        failed: checks.filter((check) => check.status === "FAIL").length,
        checks
      });
    }

    async function openPlayground() {
      const storage = await readStorage(["playgroundUrl"]);
      const url = storage.playgroundUrl || DEFAULT_PLAYGROUND_URL;
      await chrome.tabs.create({ url });
    }

    async function openSidePanel() {
      if (!chrome.sidePanel) {
        quickCheckOutput.textContent = "Side Panel API unavailable in this Chrome build.";
        return;
      }

      const tab = await getActiveTab();
      if (!tab?.id || !tab?.windowId) {
        quickCheckOutput.textContent = "No active tab found for side panel.";
        return;
      }

      await chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: "sidepanel.html",
        enabled: true
      });
      await chrome.sidePanel.open({ tabId: tab.id });
    }

    detectBtn.addEventListener("click", () => {
      void detectWebMcpInTab();
    });

    listBtn.addEventListener("click", () => {
      void refreshTools();
    });

    callBtn.addEventListener("click", () => {
      void callTool();
    });

    auditBtn.addEventListener("click", () => {
      void loadAudit();
    });

    metricsBtn.addEventListener("click", () => {
      void loadMetrics();
    });

    quickCheckBtn.addEventListener("click", () => {
      void runQuickCheck();
    });

    openPlaygroundBtn.addEventListener("click", () => {
      void openPlayground();
    });

    if (openSidePanelBtn) {
      openSidePanelBtn.addEventListener("click", () => {
        void openSidePanel();
      });
    }

    await refreshTools();
  }

  window.WebMcpInspector = {
    init: setup
  };
})();
