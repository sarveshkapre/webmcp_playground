import { ArrowRight, BookMarked, Chrome, ShieldCheck, Workflow } from "lucide-react";
import { PlaygroundConsole } from "@/components/playground-console";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function Home() {
  return (
    <div className="pb-20">
      <section className="grid-pattern border-b border-[var(--line)] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <Badge>WebMCP Studio</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight md:text-6xl">
            Build WebMCP-ready websites with a clean UI, safe defaults, and a runnable tutorial.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[var(--muted)]">
            This app is both a product surface and a teaching artifact. It demonstrates endpoint flows, policy
            guardrails, metrics, and integration patterns teams can copy into real websites.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#playground">
              <Button size="lg">
                Open Playground <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href="#tutorial">
              <Button size="lg" variant="secondary">
                Read Tutorial
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<Workflow className="h-5 w-5 text-[var(--brand)]" />}
            title="Protocol-first"
            body="Tool discovery + invocation, strict schema validation, explicit version checks, and clear error contracts."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5 text-[var(--brand)]" />}
            title="Safety-by-default"
            body="Confirmation gating, session isolation, audit redaction, and prompt-injection output filtering are built in."
          />
          <FeatureCard
            icon={<BookMarked className="h-5 w-5 text-[var(--brand)]" />}
            title="Teachable architecture"
            body="The same stack acts as a tutorial with examples, transcripts, architecture docs, and production-minded notes."
          />
        </div>
      </section>

      <section id="tutorial" className="px-6 py-6 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Integration Tutorial</CardTitle>
              <CardDescription>Copy this flow when adding WebMCP support to your own web product.</CardDescription>
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
              <CardTitle>Starter Request Flow</CardTitle>
              <CardDescription>Minimal payload sequence used throughout this repository.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4 text-xs">
                {tutorialSnippet}
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="playground" className="px-6 py-8 md:px-12">
        <div className="mx-auto max-w-6xl">
          <PlaygroundConsole />
        </div>
      </section>

      <section id="extension" className="px-6 py-4 md:px-12">
        <div className="mx-auto max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Chrome className="h-5 w-5 text-[var(--brand)]" /> Chrome Extension Companion
              </CardTitle>
              <CardDescription>
                We also include a Chrome extension MVP to detect page-level WebMCP capability and query your local
                playground server from a popup.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[var(--muted)]">{body}</p>
      </CardContent>
    </Card>
  );
}
