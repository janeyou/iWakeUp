import Link from "next/link";
import type { Metadata } from "next";
import { SuggestToolForm } from "@/components/SuggestToolForm";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Tool request · AI Radar",
  description:
    "Suggest an AI agent we should track. Send name, official URL, X handle, and a note.",
};

export default function SuggestPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
      >
        ← AI Radar
      </Link>

      <header className="mt-10 mb-10">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
          Tool request
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] font-normal text-[clamp(28px,3.6vw,44px)] leading-[1.15] tracking-[-0.01em] text-[var(--color-text)]">
          Suggest an agent we should track.
        </h1>
        <p className="mt-4 max-w-xl text-base text-[var(--color-text-muted)]">
          Drop a name, an official URL, and an X handle if you have one. We add a few new tools per release.
        </p>
      </header>

      <SuggestToolForm />

      <SiteFooter />
    </main>
  );
}
