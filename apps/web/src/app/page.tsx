import { ArrowRight, Chrome, Rocket, Workflow } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="pb-20">
      <SiteHeader currentPath="/" />

      <section className="grid-pattern border-b border-[var(--line)] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="max-w-3xl text-4xl leading-tight md:text-6xl">
            WebMCP-ready website starter with a runnable tutorial and local playground.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[var(--muted)]">
            This front-end demonstrates how product teams can integrate WebMCP responsibly: protocol contracts,
            confirmation/session policy, audits, metrics, and extension-assisted capability checks.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/tutorial">
              <Button size="lg">
                Start Tutorial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/playground">
              <Button size="lg" variant="secondary">
                Open Playground
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<Workflow className="h-5 w-5 text-[var(--brand)]" />}
            title="Tutorial Track"
            body="Step-by-step implementation guidance for adding WebMCP support to a modern website."
            href="/tutorial"
            cta="Read tutorial"
          />
          <FeatureCard
            icon={<Rocket className="h-5 w-5 text-[var(--brand)]" />}
            title="Live Playground"
            body="List tools, call endpoints, inspect audit logs, and validate metrics from your browser UI."
            href="/playground"
            cta="Open console"
          />
          <FeatureCard
            icon={<Chrome className="h-5 w-5 text-[var(--brand)]" />}
            title="Chrome Companion"
            body="Use WebMCP Inspector to detect `navigator.modelContext` and quickly verify local server connectivity."
            href="/extension"
            cta="See extension"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  href,
  cta
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link className="text-sm font-semibold text-[var(--brand)] hover:underline" href={href}>
          {cta}
        </Link>
      </CardContent>
    </Card>
  );
}
