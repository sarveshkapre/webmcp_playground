import { Rocket } from "lucide-react";
import { PlaygroundConsole } from "@/components/playground-console";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlaygroundPage() {
  return (
    <div className="pb-20">
      <SiteHeader currentPath="/playground" />

      <section className="px-6 py-10 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl">WebMCP Playground</h1>
          <p className="mt-3 max-w-3xl text-lg text-[var(--muted)]">
            Connect to your local WebMCP server, execute tool calls, and inspect policy outputs and observability data.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12">
        <div className="mx-auto max-w-6xl">
          <PlaygroundConsole />
        </div>
      </section>

      <section className="px-6 py-8 md:px-12">
        <div className="mx-auto max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-[var(--brand)]" />
                Quick local run
              </CardTitle>
              <CardDescription>Keep one terminal for the API server and one for the UI.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4 text-xs">
                {`# terminal 1\ncd /Users/sarvesh/code/webmcp_playground\nnpm run dev\n\n# terminal 2\ncd /Users/sarvesh/code/webmcp_playground\nnpm run web:dev`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
