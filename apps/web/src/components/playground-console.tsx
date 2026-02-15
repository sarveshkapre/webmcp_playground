"use client";

import { useMemo, useState } from "react";
import { Activity, ListChecks, Rocket, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ToolDescriptor = {
  name: string;
  description: string;
  input: Record<string, string>;
  sideEffect: "read" | "write" | "sensitive";
  requiresConfirmation: boolean;
  sessionScoped: boolean;
};

type ListToolsResponse = {
  protocolVersion: string;
  tools: ToolDescriptor[];
};

type CallToolResponse = {
  protocolVersion: string;
  requestId: string;
  ok: boolean;
  result?: unknown;
  error?: { code: string; message: string };
};

type AuditEntry = {
  timestamp: string;
  requestId: string;
  toolName: string;
  outcome: "ok" | "error";
  sideEffect: "read" | "write" | "sensitive";
  errorCode?: string;
  argumentSummary?: Record<string, string>;
  resultSummary?: string;
};

type Metrics = {
  protocolVersion: string;
  totals: { totalCalls: number; okCalls: number; errorCalls: number };
  tools: Record<string, { totalCalls: number; okCalls: number; errorCalls: number; avgLatencyMs: number }>;
  errorsByCode: Record<string, number>;
};

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function PlaygroundConsole() {
  const [baseUrl, setBaseUrl] = useState("http://localhost:8787");
  const [sessionId, setSessionId] = useState("web-tutorial-session");
  const [confirmed, setConfirmed] = useState(true);
  const [protocolVersion, setProtocolVersion] = useState("");
  const [toolName, setToolName] = useState("sum");
  const [argsText, setArgsText] = useState('{\n  "a": 7,\n  "b": 35\n}');

  const [tools, setTools] = useState<ToolDescriptor[]>([]);
  const [listOutput, setListOutput] = useState("No tools loaded yet.");
  const [callOutput, setCallOutput] = useState("No call executed yet.");
  const [auditOutput, setAuditOutput] = useState("No audit entries loaded yet.");
  const [metricsOutput, setMetricsOutput] = useState("No metrics loaded yet.");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const activeTool = useMemo(() => tools.find((tool) => tool.name === toolName), [tools, toolName]);

  async function fetchTools() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/mcp/list_tools`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}"
      });
      const data = (await res.json()) as ListToolsResponse;
      setTools(data.tools ?? []);
      if (data.tools?.length && !data.tools.some((tool) => tool.name === toolName)) {
        setToolName(data.tools[0].name);
      }
      setListOutput(pretty(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tools.");
    } finally {
      setBusy(false);
    }
  }

  async function callTool() {
    setBusy(true);
    setError("");
    try {
      const parsedArgs = JSON.parse(argsText) as Record<string, unknown>;
      const payload: Record<string, unknown> = {
        name: toolName,
        arguments: parsedArgs,
        confirmed
      };
      if (sessionId.trim()) {
        payload.sessionId = sessionId.trim();
      }
      if (protocolVersion.trim()) {
        payload.protocolVersion = protocolVersion.trim();
      }

      const res = await fetch(`${baseUrl}/mcp/call_tool`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await res.json()) as CallToolResponse;
      setCallOutput(pretty(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to call tool.");
    } finally {
      setBusy(false);
    }
  }

  async function loadAudit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/mcp/audit_log?limit=15`, { method: "GET" });
      const data = (await res.json()) as { entries: AuditEntry[] };
      setAuditOutput(pretty(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit log.");
    } finally {
      setBusy(false);
    }
  }

  async function loadMetrics() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/mcp/metrics`, { method: "GET" });
      const data = (await res.json()) as Metrics;
      setMetricsOutput(pretty(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load metrics.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[var(--line)] bg-[linear-gradient(180deg,var(--surface),var(--surface-2))]">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Rocket className="h-5 w-5 text-[var(--brand)]" /> WebMCP Playground Console
        </CardTitle>
        <CardDescription>
          Run the local protocol loop from the browser and inspect safety outputs (policy, audit, metrics).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Base URL</label>
            <Input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} placeholder="http://localhost:8787" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Session ID</label>
            <Input value={sessionId} onChange={(event) => setSessionId(event.target.value)} placeholder="session-1" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Tool Name</label>
            <Input value={toolName} onChange={(event) => setToolName(event.target.value)} placeholder="sum" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Protocol Version (optional)</label>
            <Input
              value={protocolVersion}
              onChange={(event) => setProtocolVersion(event.target.value)}
              placeholder="2026-02-playground"
            />
          </div>
          <label className="mt-6 flex items-center gap-2 text-sm text-[var(--muted)]">
            <input
              className="h-4 w-4 rounded border-[var(--line)]"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              type="checkbox"
            />
            Send `confirmed=true`
          </label>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Arguments (JSON)</label>
          <Textarea value={argsText} onChange={(event) => setArgsText(event.target.value)} className="min-h-36 font-mono" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={fetchTools} disabled={busy}>
            <ListChecks className="h-4 w-4" /> List Tools
          </Button>
          <Button onClick={callTool} disabled={busy} variant="secondary">
            <Rocket className="h-4 w-4" /> Call Tool
          </Button>
          <Button onClick={loadAudit} disabled={busy} variant="secondary">
            <ShieldCheck className="h-4 w-4" /> Audit Log
          </Button>
          <Button onClick={loadMetrics} disabled={busy} variant="secondary">
            <Activity className="h-4 w-4" /> Metrics
          </Button>
          {activeTool ? (
            <Badge className="ml-auto">
              {activeTool.sideEffect} / {activeTool.requiresConfirmation ? "confirm" : "no-confirm"}
            </Badge>
          ) : null}
        </div>

        {error ? <p className="rounded-xl bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</p> : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <OutputCard title="list_tools response" value={listOutput} />
          <OutputCard title="call_tool response" value={callOutput} />
          <OutputCard title="audit_log response" value={auditOutput} />
          <OutputCard title="metrics response" value={metricsOutput} />
        </div>
      </CardContent>
    </Card>
  );
}

function OutputCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
      <div className="border-b border-[var(--line)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{title}</div>
      <pre className="max-h-56 overflow-auto p-3 text-xs text-[var(--text)]">{value}</pre>
    </div>
  );
}
