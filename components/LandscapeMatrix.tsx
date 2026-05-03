import {
  CATEGORIES,
  LANDSCAPE,
  LEVELS,
  type Category,
  type Level,
  type LandscapeEntry,
} from "@/content/landscape";

export function LandscapeMatrix() {
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <div
        className="min-w-[820px] grid gap-px rounded-xl border border-[var(--color-border)] bg-[var(--color-border)] overflow-hidden"
        style={{ gridTemplateColumns: "100px repeat(4, minmax(0, 1fr))" }}
      >
        {/* Header row */}
        <div className="bg-[var(--color-bg)] p-3" />
        {CATEGORIES.map((c) => (
          <div
            key={c.id}
            className="bg-[var(--color-bg)] p-3 text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]"
          >
            {c.label}
          </div>
        ))}

        {/* Level rows */}
        {LEVELS.map((level) =>
          level.id === "L5" ? <L5Row key={level.id} /> : <RowCells key={level.id} level={level} />
        )}
      </div>
    </div>
  );
}

function RowCells({ level }: { level: (typeof LEVELS)[number] }) {
  return (
    <>
      <div className="bg-[var(--color-surface)] p-3">
        <div className="font-mono text-xs text-[var(--color-text-faint)]">{level.label}</div>
        <div className="mt-1 text-sm font-semibold text-[var(--color-text)]">{level.role}</div>
      </div>
      {CATEGORIES.map((cat) => (
        <Cell key={cat.id} level={level.id} category={cat.id} />
      ))}
    </>
  );
}

function Cell({ level, category }: { level: Level; category: Category }) {
  const items = LANDSCAPE.filter((e) => e.level === level && e.category === category);
  return (
    <div className="bg-[var(--color-surface)] p-3 text-sm leading-relaxed">
      {items.length === 0 ? (
        <span className="text-[var(--color-text-faint)]">none</span>
      ) : (
        <ul className="flex flex-col gap-1">
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
  return <span className="text-[var(--color-text-muted)]">{entry.name}</span>;
}

function L5Row() {
  return (
    <>
      <div className="bg-[var(--color-surface)] p-3">
        <div className="font-mono text-xs text-[var(--color-text-faint)]">L5</div>
        <div className="mt-1 text-sm font-semibold text-[var(--color-text)]">Executive</div>
      </div>
      <div
        className="col-span-4 bg-[var(--color-surface)] p-3 text-sm italic text-[var(--color-text-faint)]"
        style={{ gridColumn: "span 4" }}
      >
        not yet shipped in 2026.04
      </div>
    </>
  );
}
