import Link from "next/link";

/**
 * AI Radar wordmark, bold sans, "AI" in accent purple, "RADAR" in --text,
 * with a pulsing accent dot. Locked production style. The mono-ticker and
 * italic-serif variants exist in the prototype Tweaks panel only.
 */
export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const px = size === "lg" ? 28 : size === "sm" ? 18 : 22;
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] font-bold tracking-[-0.02em] leading-none"
      style={{ fontSize: px }}
    >
      <span>
        <span className="text-[var(--color-accent)]">AI</span>
        <span className="text-[var(--color-text)]"> RADAR</span>
      </span>
      <span
        className="pulse-dot inline-block rounded-full bg-[var(--color-accent)]"
        style={{ width: px * 0.32, height: px * 0.32 }}
        aria-hidden
      />
    </Link>
  );
}
