import { Chrome, SearchCode } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExtensionPage() {
  return (
    <div className="pb-20">
      <SiteHeader currentPath="/extension" />

      <section className="px-6 py-10 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl">Chrome Extension Companion</h1>
          <p className="mt-3 max-w-3xl text-lg text-[var(--muted)]">
            WebMCP Scout helps teams quickly validate whether target pages expose browser-level WebMCP capability and
            whether local WebMCP servers are reachable.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Chrome className="h-5 w-5 text-[var(--brand)]" />
                What it does
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--muted)]">
              <p>1. Detects `navigator.modelContext` on the active tab.</p>
              <p>2. Calls local `POST /mcp/list_tools` and shows tool names.</p>
              <p>3. Stores preferred base URL in extension local storage.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchCode className="h-5 w-5 text-[var(--brand)]" />
                Load in Chrome
              </CardTitle>
              <CardDescription>Use unpacked extension mode during development.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4 text-xs">
                {`1) Open chrome://extensions\n2) Enable Developer mode\n3) Click Load unpacked\n4) Select:\n/Users/sarvesh/code/webmcp_playground/apps/chrome-extension`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
