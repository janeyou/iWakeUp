import { Suspense, type CSSProperties } from "react";
import { Tweet } from "react-tweet";
import { TweetErrorBoundary } from "./TweetErrorBoundary";

const SIZE_VARS: Record<"sm" | "xs", CSSProperties> = {
  sm: {
    ["--tweet-container-margin" as string]: "0.5rem 0 0",
    ["--tweet-header-font-size" as string]: "0.625rem",
    ["--tweet-header-line-height" as string]: "1.1",
    ["--tweet-body-font-size" as string]: "0.6875rem",
    ["--tweet-body-line-height" as string]: "1.25",
    ["--tweet-body-margin" as string]: "0.2rem 0 0",
    ["--tweet-info-font-size" as string]: "0.5625rem",
    ["--tweet-info-line-height" as string]: "1.1",
    ["--tweet-actions-font-size" as string]: "0.5625rem",
    ["--tweet-actions-line-height" as string]: "1.1",
    ["--tweet-replies-font-size" as string]: "0.5625rem",
    ["--tweet-replies-line-height" as string]: "1.1",
    ["--tweet-quoted-container-margin" as string]: "0.4rem 0",
  },
  xs: {
    ["--tweet-container-margin" as string]: "0.4rem 0 0",
    ["--tweet-header-font-size" as string]: "0.5rem",
    ["--tweet-header-line-height" as string]: "1.05",
    ["--tweet-body-font-size" as string]: "0.5625rem",
    ["--tweet-body-line-height" as string]: "1.2",
    ["--tweet-body-margin" as string]: "0.15rem 0 0",
    ["--tweet-info-font-size" as string]: "0.4375rem",
    ["--tweet-info-line-height" as string]: "1.05",
    ["--tweet-actions-font-size" as string]: "0.4375rem",
    ["--tweet-actions-line-height" as string]: "1.05",
    ["--tweet-replies-font-size" as string]: "0.4375rem",
    ["--tweet-replies-line-height" as string]: "1.05",
    ["--tweet-quoted-container-margin" as string]: "0.3rem 0",
  },
};

const SIZE_CLASS: Record<"sm" | "xs", string> = {
  sm: "max-w-[224px] text-[11px]",
  xs: "max-w-full text-[9px]",
};

export function EmbeddedTweet({
  id,
  size = "sm",
}: {
  id: string;
  size?: "sm" | "xs";
}) {
  return (
    <div
      className={`mt-2 dark ${SIZE_CLASS[size]}`}
      style={SIZE_VARS[size]}
    >
      <TweetErrorBoundary fallback={null}>
        <Suspense fallback={<TweetSkeleton size={size} />}>
          <Tweet id={id} />
        </Suspense>
      </TweetErrorBoundary>
    </div>
  );
}

function TweetSkeleton({ size }: { size: "sm" | "xs" }) {
  return (
    <div
      className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse ${
        size === "xs" ? "h-12 max-w-full" : "h-16 max-w-[224px]"
      }`}
    />
  );
}
