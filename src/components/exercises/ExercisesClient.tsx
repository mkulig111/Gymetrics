"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconPencil, IconSearch } from "@tabler/icons-react";

type BodyPartEntry = { percentage: number; bodyPart: { id: string; name: string } };
type Exercise = { id: string; name: string; bodyParts: BodyPartEntry[] };

const PALETTE = [
  { bg: "rgba(124,58,237,0.15)", color: "#a78bfa" },
  { bg: "rgba(13,148,136,0.15)", color: "#2dd4bf" },
  { bg: "rgba(234,88,12,0.15)",  color: "#fb923c" },
  { bg: "rgba(29,78,216,0.15)",  color: "#60a5fa" },
  { bg: "rgba(190,24,93,0.15)",  color: "#f472b6" },
  { bg: "rgba(146,64,14,0.15)",  color: "#fbbf24" },
  { bg: "rgba(21,128,61,0.15)",  color: "#4ade80" },
  { bg: "rgba(185,28,28,0.15)",  color: "#f87171" },
];

function paletteFor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return PALETTE[h % PALETTE.length];
}

export default function ExercisesClient({ exercises }: { exercises: Exercise[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.bodyParts.some((bp) => bp.bodyPart.name.toLowerCase().includes(q)),
    );
  }, [exercises, query]);

  return (
    <>
      <div className="relative mb-4">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" stroke={1.5} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises"
          className="w-full rounded-xl border border-border bg-surface-2 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((ex) => {
          const primary = ex.bodyParts.reduce<BodyPartEntry | null>(
            (best, bp) => (!best || bp.percentage > best.percentage ? bp : best),
            null,
          );
          const pal = primary ? paletteFor(primary.bodyPart.name) : PALETTE[0];
          const letter = primary ? primary.bodyPart.name[0].toUpperCase() : "?";

          return (
            <Link
              key={ex.id}
              href={`/exercises/${ex.id}/edit`}
              className="flex items-center gap-3 rounded-xl bg-surface p-3 hover:bg-surface-2"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: pal.bg, color: pal.color }}
              >
                {letter}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{ex.name}</p>
                {ex.bodyParts.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {ex.bodyParts.map((bp) => {
                      const p = paletteFor(bp.bodyPart.name);
                      return (
                        <span
                          key={bp.bodyPart.id}
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ background: p.bg, color: p.color }}
                        >
                          {bp.bodyPart.name}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted">No body parts assigned</p>
                )}
              </div>
              <IconPencil className="h-4 w-4 shrink-0 text-muted" stroke={1.5} />
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <p className="rounded-xl bg-surface p-6 text-center text-sm text-muted">
            {query ? "No exercises match your search." : "No exercises yet."}
          </p>
        )}
      </div>
    </>
  );
}
