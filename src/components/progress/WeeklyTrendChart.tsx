import { DayBucket } from "@/lib/weeklyChart";

const WIDTH = 280;
const HEIGHT = 120;
const TICKS = 5;

export default function WeeklyTrendChart({
  values,
  days,
  color = "#f5b700",
}: {
  values: (number | null)[];
  days: DayBucket[];
  color?: string;
}) {
  const present = values.filter((v): v is number => v !== null);
  const min = present.length ? Math.min(...present) : 0;
  const max = present.length ? Math.max(...present) : 1;
  const range = max - min || 1;
  const paddedMin = min - range * 0.15;
  const paddedMax = max + range * 0.15;
  const paddedRange = paddedMax - paddedMin || 1;

  const tickValues = Array.from({ length: TICKS }, (_, i) => paddedMax - (i / (TICKS - 1)) * paddedRange);

  const colWidth = WIDTH / (days.length - 1);
  const points = values.map((v, i) =>
    v === null ? null : { x: i * colWidth, y: HEIGHT - ((v - paddedMin) / paddedRange) * HEIGHT },
  );
  const linePoints = points.filter((p): p is { x: number; y: number } => p !== null);

  return (
    <div className="flex gap-2">
      <div className="flex flex-col justify-between text-right text-[10px] text-muted" style={{ height: HEIGHT }}>
        {tickValues.map((t, i) => (
          <span key={i}>{Math.round(t)}</span>
        ))}
      </div>
      <div className="flex-1">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full text-border" preserveAspectRatio="none">
          {days.map((_, i) => (
            <line key={i} x1={i * colWidth} y1={0} x2={i * colWidth} y2={HEIGHT} stroke="currentColor" strokeWidth={1} />
          ))}
          {linePoints.length > 1 && (
            <polyline
              points={linePoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {points.map(
            (p, i) => p && <circle key={i} cx={p.x} cy={p.y} r={4} fill="none" stroke={color} strokeWidth={2.5} />,
          )}
        </svg>
        <div className="mt-1 grid grid-cols-7 text-center text-[10px] text-muted">
          {days.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
