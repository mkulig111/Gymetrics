const WIDTH = 280;
const HEIGHT = 120;
const TICKS = 5;
const MAX_LABELS = 6;

type Entry = { date: Date; value: number };

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function WeeklyTrendChart({
  entries,
  color = "#f5b700",
}: {
  entries: Entry[];
  color?: string;
}) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const n = sorted.length;

  const vals = sorted.map((e) => e.value);
  const min = n ? Math.min(...vals) : 0;
  const max = n ? Math.max(...vals) : 1;
  const range = max - min || 1;
  const paddedMin = min - range * 0.15;
  const paddedMax = max + range * 0.15;
  const paddedRange = paddedMax - paddedMin || 1;

  const tickValues = Array.from({ length: TICKS }, (_, i) => paddedMax - (i / (TICKS - 1)) * paddedRange);

  const xOf = (i: number) => (n <= 1 ? WIDTH / 2 : (i / (n - 1)) * WIDTH);
  const yOf = (v: number) => HEIGHT - ((v - paddedMin) / paddedRange) * HEIGHT;

  const points = sorted.map((e, i) => ({ x: xOf(i), y: yOf(e.value) }));

  const labelIndices =
    n <= MAX_LABELS
      ? sorted.map((_, i) => i)
      : Array.from({ length: MAX_LABELS }, (_, j) =>
          Math.round((j * (n - 1)) / (MAX_LABELS - 1)),
        );

  return (
    <div className="flex gap-2">
      <div
        className="flex flex-col justify-between text-right text-[10px] text-muted"
        style={{ height: HEIGHT }}
      >
        {tickValues.map((t, i) => (
          <span key={i}>{Math.round(t)}</span>
        ))}
      </div>
      <div className="flex-1">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full text-border"
          preserveAspectRatio="none"
        >
          {labelIndices.map((i) => (
            <line
              key={i}
              x1={xOf(i)}
              y1={0}
              x2={xOf(i)}
              y2={HEIGHT}
              stroke="currentColor"
              strokeWidth={1}
            />
          ))}
          {points.length > 1 && (
            <polyline
              points={points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
            />
          ))}
        </svg>
        <div className="relative mt-1" style={{ height: "1rem" }}>
          {labelIndices.map((i) => (
            <span
              key={i}
              className="absolute -translate-x-1/2 text-[10px] text-muted"
              style={{ left: `${(xOf(i) / WIDTH) * 100}%` }}
            >
              {fmtDate(sorted[i].date)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
