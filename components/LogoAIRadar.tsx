// AI Radar wordmark glyph: concentric circles + sweep line ending in a dot.
// Inherits currentColor so it picks up surrounding text color (light/dark).
// Source design: janeyoubradley.com/logos.jsx, kept consistent across surfaces.

export function LogoAIRadar({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="32" cy="32" r="22" />
      <circle cx="32" cy="32" r="14" opacity="0.55" />
      <circle cx="32" cy="32" r="6.5" opacity="0.35" />
      <line x1="32" y1="32" x2="50" y2="14" />
      <circle cx="50" cy="14" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
