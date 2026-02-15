import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/tutorial", label: "Tutorial" },
  { href: "/playground", label: "Playground" },
  { href: "/extension", label: "Extension" }
];

export function SiteHeader({ currentPath }: { currentPath: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[color:var(--surface)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:px-12">
        <Link className="flex items-center gap-2" href="/">
          <Badge className="bg-[var(--surface-3)] text-[var(--text)]">WebMCP Studio</Badge>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-[var(--surface-3)] text-[var(--text)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                )}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
