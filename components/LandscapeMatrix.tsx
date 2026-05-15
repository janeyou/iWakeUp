import {
  CATEGORIES,
  LANDSCAPE,
  LEVELS,
  type Category,
  type Level,
  type LandscapeEntry,
} from "@/content/landscape";

// Levels run across the X axis (L1 → L4); categories down the Y axis.
// L5 lives in its own banner row below since nothing's shipped there yet.
const LEVELS_X = LEVELS.filter((l) => l.id !== "L5");

export function LandscapeMatrix() {
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <div
        className="min-w-[1100px] grid gap-px rounded-xl border border-[var(--color-border)] bg-[var(--color-border)] overflow-hidden"
        style={{ gridTemplateColumns: "140px repeat(4, minmax(0, 1fr))" }}
      >
        {/* Header row: blank corner + L1..L4 with role */}
        <div className="bg-[var(--color-bg)] p-3" />
        {LEVELS_X.map((l) => (
          <div
            key={l.id}
            className="bg-[var(--color-bg)] p-3"
          >
            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
              {l.label}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-[var(--color-text)]">
              {l.role}
            </div>
          </div>
        ))}

        {/* Category rows */}
        {CATEGORIES.map((c) => (
          <CategoryRow key={c.id} category={c} />
        ))}

        {/* L5 banner spanning the levels (label col + 4 levels = 5 cols) */}
        <div className="bg-[var(--color-surface)] p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
            L5
          </div>
          <div className="mt-0.5 text-sm font-semibold text-[var(--color-text)]">
            Executive
          </div>
        </div>
        <div
          className="bg-[var(--color-surface)] p-3 text-sm italic text-[var(--color-text-faint)]"
          style={{ gridColumn: "span 4" }}
        >
          not yet shipped, this row is the horizon
        </div>
      </div>

      <Legend />
    </div>
  );
}

function CategoryRow({ category }: { category: (typeof CATEGORIES)[number] }) {
  return (
    <>
      <div className="bg-[var(--color-surface)] p-3">
        <div className="text-sm font-semibold text-[var(--color-text)]">
          {category.label}
        </div>
      </div>
      {LEVELS_X.map((l) => (
        <Cell key={l.id} level={l.id} category={category.id} />
      ))}
    </>
  );
}

function Cell({ level, category }: { level: Level; category: Category }) {
  const items = LANDSCAPE.filter((e) => e.level === level && e.category === category);
  return (
    <div className="bg-[var(--color-surface)] p-3 text-sm leading-relaxed">
      {items.length === 0 ? (
        <span className="text-[var(--color-text-faint)]">—</span>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((entry) => (
            <li key={entry.name}>
              <Item entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Item({ entry }: { entry: LandscapeEntry }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-[var(--color-text-muted)]">{entry.name}</span>
      {entry.previousLevel && (
        <span
          title={`moved from ${entry.previousLevel}`}
          className="rounded-full border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--color-accent)]"
        >
          ← {entry.previousLevel}
        </span>
      )}
    </span>
  );
}

function Legend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-faint)]">
      <span>
        <span className="rounded-full border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          ← L2
        </span>{" "}
        marks a tool that graduated from a lower level since the last refresh
      </span>
    </div>
  );
}
