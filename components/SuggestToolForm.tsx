"use client";

import { useState } from "react";

const REPO_URL = "https://github.com/janeyou/iWakeUp";

type Status = "idle" | "submitting" | "success" | "error";

export function SuggestToolForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      toolName: String(fd.get("toolName") ?? ""),
      sourceUrl: String(fd.get("sourceUrl") ?? ""),
      xHandle: String(fd.get("xHandle") ?? ""),
      note: String(fd.get("note") ?? ""),
      contactEmail: String(fd.get("contactEmail") ?? ""),
      honeypot: String(fd.get("honeypot") ?? ""),
    };

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
        return;
      }
      setStatus("success");
      setMessage(data.message ?? "Got it.");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Try again?");
    }
  }

  const wrap = compact
    ? "rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] p-5"
    : "rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6 sm:p-8";
  const headingClass = compact
    ? "mt-1 text-sm font-medium text-[var(--color-text)]"
    : "mt-2 text-xl font-semibold text-[var(--color-text)]";

  if (status === "success") {
    return (
      <div className={wrap}>
        <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-accent)]">
          Suggest a tool
        </p>
        <h2 className={headingClass}>{message}</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          I&apos;ll review and wire it in if it fits.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
          className="mt-4 text-xs text-[var(--color-accent)] hover:underline"
        >
          Suggest another →
        </button>
      </div>
    );
  }

  return (
    <div className={wrap}>
      <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
        Suggest a tool
      </p>
      <h2 className={headingClass}>
        {compact ? "Missing one we should track?" : "Tell me which agent to wire in next."}
      </h2>

      <form onSubmit={onSubmit} className="mt-5 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          name="honeypot"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden
        />

        <label className="sm:col-span-2 flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
            Tool name *
          </span>
          <input
            name="toolName"
            required
            maxLength={80}
            placeholder="e.g. Devin"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
            Official URL or changelog
          </span>
          <input
            name="sourceUrl"
            type="url"
            maxLength={500}
            placeholder="https://..."
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
            X handle
          </span>
          <input
            name="xHandle"
            maxLength={32}
            placeholder="@handle"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </label>

        <label className="sm:col-span-2 flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
            Why this agent? (optional)
          </span>
          <textarea
            name="note"
            rows={2}
            maxLength={1000}
            placeholder="What makes it worth tracking?"
            className="resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
            Your email (optional)
          </span>
          <input
            name="contactEmail"
            type="email"
            maxLength={254}
            placeholder="so I can follow up"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </label>

        <div className="flex items-center justify-end sm:col-span-2 sm:justify-start sm:items-end">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] disabled:opacity-60"
          >
            {status === "submitting" ? "Sending…" : "Send suggestion"}
          </button>
        </div>
      </form>

      {status === "error" && message && (
        <p className="mt-3 text-sm text-[var(--color-news)]">{message}</p>
      )}

      <p className="mt-5 text-xs text-[var(--color-text-faint)]">
        Prefer GitHub? Open an{" "}
        <a
          href={`${REPO_URL}/issues/new`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-[var(--color-text)] hover:underline"
        >
          issue
        </a>{" "}
        or a{" "}
        <a
          href={`${REPO_URL}/pulls`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-[var(--color-text)] hover:underline"
        >
          PR
        </a>
        .
      </p>
    </div>
  );
}
