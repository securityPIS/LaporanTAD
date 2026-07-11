export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="mt-4 flex flex-col gap-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-surface p-4">
          <div className="h-3 w-1/3 rounded bg-surface-3" style={{ animation: "ltFade 1s ease infinite alternate" }} />
          <div className="mt-3 h-2.5 w-2/3 rounded bg-surface-3" style={{ animation: "ltFade 1s ease infinite alternate" }} />
          <div className="mt-2 h-2.5 w-1/2 rounded bg-surface-3" style={{ animation: "ltFade 1s ease infinite alternate" }} />
        </div>
      ))}
    </div>
  );
}
