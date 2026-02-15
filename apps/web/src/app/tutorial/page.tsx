import { BookMarked, ShieldCheck, Workflow } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Expose tools with predictable contracts",
    body: "Define `list_tools` and `call_tool` behavior with explicit schemas, request IDs, and protocol versioning."
  },
  {
    title: "Gate side-effects with policy",
    body: "Classify tools as read/write/sensitive and require `confirmed=true` plus `sessionId` where needed."
  },
  {
    title: "Audit and observe",
    body: "Use audit logs + metrics with redaction and output sanitization to keep behavior transparent and safe."
  }
];

const tutorialSnippet = `// 1) List tools\nPOST /mcp/list_tools\n{}\n\n// 2) Call a write tool (session + confirmation)\nPOST /mcp/call_tool\n{\n  "name": "append_note",\n  "sessionId": "my-session",\n  "confirmed": true,\n  "arguments": { "text": "ship webmcp tutorial" }\n}`;

export default function TutorialPage() {
  return (
    <div className="pb-20">
      <SiteHeader currentPath="/tutorial" />

      <section className="px-6 py-10 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl">WebMCP Integration Tutorial</h1>
          <p className="mt-3 max-w-3xl text-lg text-[var(--muted)]">
            Use this checklist to integrate WebMCP into your website with stable protocol behavior and safe defaults.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-[var(--brand)]" />
                Step-by-step flow
              </CardTitle>
              <CardDescription>Use these three steps as your default implementation backbone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
                  <p className="text-sm font-semibold text-[var(--text)]">
                    {index + 1}. {step.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{step.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-[var(--brand)]" />
                Starter request sequence
              </CardTitle>
              <CardDescription>Minimal payload sequence to verify a full local tool loop.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4 text-xs">
                {tutorialSnippet}
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-6 py-8 md:px-12">
        <div className="mx-auto max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[var(--brand)]" />
                Safety defaults to keep
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <Info title="Confirmation gates" body="Require explicit `confirmed=true` for write/sensitive tools." />
              <Info title="Session isolation" body="Use `sessionId` for scoped mutable state and guard missing IDs." />
              <Info
                title="Audit + sanitize"
                body="Redact logs and sanitize risky output-like prompt injection text before returning results."
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Info({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
      <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{body}</p>
    </div>
  );
}
