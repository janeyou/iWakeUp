import { Suspense } from "react";
import { Tweet } from "react-tweet";

export function EmbeddedTweet({ id }: { id: string }) {
  return (
    <div className="mt-3 dark">
      <Suspense fallback={<TweetSkeleton />}>
        <Tweet id={id} />
      </Suspense>
    </div>
  );
}

function TweetSkeleton() {
  return (
    <div className="h-32 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse" />
  );
}
