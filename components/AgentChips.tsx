import Link from "next/link";
import type { Agent } from "@/content/agents";

export function AgentChips({
  agents,
  current,
  basePath,
  carry,
}: {
  agents: Agent[];
  current: string | "all";
  basePath: string;
  carry?: Record<string, string | undefined>;
}) {
  const carryParts = carry
    ? Object.entries(carry).filter(([, v]) => v != null && v !== "")
    : [];

  const chips: { id: string | "all"; label: string }[] = [
    { id: "all", label: "All" },
    ...agents.filter((a) => a.status === "live").map((a) => ({ id: a.slug, label: a.name })),
  ];

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => {
        const isActive = chip.id === current;
        const params = new URLSearchParams();
        if (chip.id !== "all") params.set("agent", chip.id);
        for (const [k, v] of carryParts) params.set(k, v as string);
        const qs = params.toString();
        const href = qs ? `${basePath}?${qs}` : basePath;
        const dot =
          chip.id === "all"
            ? null
            : `var(--color-agent-${chip.id}, var(--color-accent))`;

        return (
          <Link
            key={chip.id}
            href={href}
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              isActive
                ? "border-[var(--color-text)] bg-[var(--color-surface-hover)] text-[var(--color-text)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]",
            ].join(" ")}
          >
            {dot && (
              <span
                aria-hidden
                className="block h-2 w-2 rounded-full"
                style={{ backgroundColor: dot }}
              />
            )}
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
