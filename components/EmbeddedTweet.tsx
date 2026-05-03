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
};

/**
 * Wraps `react-tweet` so we can constrain its dimensions inside the lead
 * drop. The compact mode is the default for TodayPanel; profile pages can
 * still render the standard size.
 */
export function EmbeddedTweet({ id, compact = false }: Props) {
  return (
    <div
      className={compact ? "embedded-tweet embedded-tweet--compact" : "embedded-tweet"}
      style={compact ? { maxWidth: 420, width: "100%" } : undefined}
    >
      <Tweet id={id} />
    </div>
  );
}
