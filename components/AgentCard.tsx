import Link from "next/link";
import type { Agent } from "@/content/agents";

type Props = {
  agent: Agent;
  latestTitle?: string | null;
};

export function AgentCard({ agent, latestTitle }: Props) {
  const isLive = agent.status === "live";
  const inner = (
    <div
      className={[
        "h-full rounded-xl border p-5 transition",
        "border-[var(--color-border)] bg-[var(--color-surface)]",
        isLive ? "hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)]" : "opacity-40",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text)]">{agent.name}</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{agent.blurb}</p>
        </div>
        {!isLive && (
          <span className="shrink-0 rounded-full border border-[var(--color-border-strong)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
            Soon
          </span>
        )}
      </div>

      {isLive && latestTitle && (
        <p className="mt-4 line-clamp-2 text-sm text-[var(--color-text-muted)]">
          <span className="text-[var(--color-text-faint)]">Latest:</span> {latestTitle}
        </p>
      )}

      {isLive && (
        <p className="mt-4 text-sm text-[var(--color-accent)]">View timeline →</p>
      )}
    </div>
  );

  if (!isLive) return <div>{inner}</div>;
  return <Link href={`/agents/${agent.slug}`}>{inner}</Link>;
}
