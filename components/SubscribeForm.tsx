"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function SubscribeForm({ source }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, honeypot, source }),
      });
      const body = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(body.error ?? "Something went wrong.");
        return;
      }
      setStatus("success");
      setMessage(body.message ?? "Check your email.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
          ✓ Subscribed
        </p>
        <p className="mt-2 text-base text-[var(--color-text-muted)]">{message}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
        Weekly digest
      </p>
      <h2 className="mt-2 text-xl font-semibold text-[var(--color-text)]">
        One email Monday morning. The week in AI agents.
      </h2>
      <p className="mt-1 font-mono text-xs italic text-[var(--color-text-faint)]">
        i wake up, there is another AI update.
      </p>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Curated releases from the agents we track. Unsubscribe one click anytime.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] focus:outline-none"
          disabled={status === "submitting"}
        />
        <input
          type="text"
          name="company"
          tabIndex={-1}
          aria-hidden
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-[var(--color-bg)] transition hover:opacity-90 disabled:opacity-50"
        >
          {status === "submitting" ? "Sending..." : "Subscribe"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-3 text-sm text-[var(--color-news)]">{message}</p>
      )}
    </form>
  );
}
