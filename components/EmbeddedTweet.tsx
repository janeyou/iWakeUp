"use client";

import { Tweet } from "react-tweet";

type Props = {
  id: string;
  size?: "xs" | "sm" | "md";
  /**
   * Compact mode for the lead drop. Caps width at 420px and tightens
   * react-tweet's internal spacing via CSS overrides defined in globals.css.
   */
  compact?: boolean;
  /**
   * Card mode for /agents/<slug> expanded queue cards. Caps height around
   * half of a natural embed and clamps the body to 4 lines.
   */
  card?: boolean;
};

/**
 * Wraps `react-tweet` so we can constrain its dimensions inside the lead
 * drop. The compact mode is the default for TodayPanel; profile pages can
 * still render the standard size.
 */
export function EmbeddedTweet({ id, compact = false, card = false }: Props) {
  const variant = card
    ? "embedded-tweet embedded-tweet--card"
    : compact
      ? "embedded-tweet embedded-tweet--compact"
      : "embedded-tweet";
  return (
    <div
      className={variant}
      style={compact ? { maxWidth: 420, width: "100%" } : undefined}
    >
      <Tweet id={id} />
    </div>
  );
}
