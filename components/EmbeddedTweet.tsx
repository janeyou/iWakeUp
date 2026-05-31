"use client";

import type { ReactNode } from "react";
import { Tweet } from "react-tweet";
import { TweetErrorBoundary } from "@/components/TweetErrorBoundary";

type Props = {
  id: string;
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
  /**
   * Rendered when react-tweet can't embed the post (e.g. X syndication
   * returns empty `entities`, which makes react-tweet throw). Call sites
   * pass the stored summary so the block keeps real content instead of
   * collapsing to nothing. Defaults to null (embed simply disappears).
   */
  fallback?: ReactNode;
};

/**
 * Wraps `react-tweet` so we can constrain its dimensions inside the lead
 * drop. The compact mode is the default for TodayPanel; profile pages can
 * still render the standard size.
 */
export function EmbeddedTweet({ id, compact = false, card = false, fallback = null }: Props) {
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
      <TweetErrorBoundary fallback={fallback}>
        <Tweet id={id} />
      </TweetErrorBoundary>
    </div>
  );
}
