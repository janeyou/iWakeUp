import Link from "next/link";
import type { Metadata } from "next";
import { LEVEL_DETAILS } from "@/content/levels";
import { LandscapeMatrix } from "@/components/LandscapeMatrix";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "The landscape, agent products by autonomy level · AI Radar",
  description:
    "Where each AI product sits on the 5-level autonomy ladder. The full framework lives at pmclaws.com/framework.",
};

export default function LearnPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
      >
        ← AI Radar
      </Link>

      <header className="mt-10 mb-12">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
          The landscape
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--color-text)]">
          AI products by autonomy level.
        </h1>
        <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-[var(--color-text-muted)]">
          <p>
            Where each tracked product sits on the 5-level ladder, from Chat to
            Executive, across software dev, personal/life, business ops, and
            frameworks.
          </p>
          <p>
            The full framework with the PM-trust lens, jumps that matter, and
            decision table lives at{" "}
            <a
              href="https://pmclaws.com/framework"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              pmclaws.com/framework
            </a>
            .
          </p>
        </div>
      </header>

      {/* Quick 5-level summary table */}
      <section className="mb-12">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
          Quick summary
        </h2>
        <div className="overflow-x-auto -mx-6 px-6">
          <div
            className="min-w-[640px] grid gap-px rounded-xl border border-[var(--color-border)] bg-[var(--color-border)] overflow-hidden"
            style={{ gridTemplateColumns: "100px 1fr 1.5fr" }}
          >
            <div className="bg-[var(--color-bg)] p-3 text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
              Level
            </div>
            <div className="bg-[var(--color-bg)] p-3 text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
              Role
            </div>
            <div className="bg-[var(--color-bg)] p-3 text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
              What it is
            </div>
            {LEVEL_DETAILS.map((l) => (
              <SummaryRow key={l.id} level={l} />
            ))}
          </div>
        </div>
      </section>

      {/* Landscape matrix (radar's strength) */}
      <section className="mb-12">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
          Where each product sits
        </h2>
        <p className="mb-6 max-w-2xl text-sm text-[var(--color-text-muted)]">
          Levels × categories. Reference only, no clicks.
        </p>
        <LandscapeMatrix />
      </section>

      {/* CTA back to pmclaws.com/framework */}
      <section className="mb-16 rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] p-8">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
          Want the framework, not just the map?
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
          Read the full 5-level framework on pmclaws.com.
        </h2>
        <p className="mt-3 max-w-2xl text-base text-[var(--color-text-muted)]">
          Each level with the capability lens, the PM-trust lens, jumps that
          matter, decision table, and a field guide for picking the right level
          for the task.
        </p>
        <a
          href="https://pmclaws.com/framework"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          Read at pmclaws.com/framework →
        </a>
      </section>

      <footer className="border-t border-[var(--color-border)] pt-8 space-y-2 text-sm text-[var(--color-text-faint)]">
        <p>
          The landscape view of the 5-level taxonomy. Full definition lives at{" "}
          <a
            href="https://pmclaws.com/framework"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--color-text)]"
          >
            pmclaws.com/framework
          </a>
          .
        </p>
        <SiteFooter />
      </footer>
    </main>
  );
}

function SummaryRow({ level }: { level: (typeof LEVEL_DETAILS)[number] }) {
  return (
    <>
      <div className="bg-[var(--color-surface)] p-3">
        <p className="font-mono text-xs text-[var(--color-text-faint)]">{level.id}</p>
        <p className="mt-0.5 text-sm font-semibold uppercase tracking-wide text-[var(--color-text)]">
          {level.role}
        </p>
      </div>
      <div className="bg-[var(--color-surface)] p-3 text-sm">
        <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-accent)]">
          AI = {level.aiIs}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
          Human = {level.humanIs}
        </p>
      </div>
      <div className="bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text-muted)]">
        {level.description}
      </div>
    </>
  );
}
