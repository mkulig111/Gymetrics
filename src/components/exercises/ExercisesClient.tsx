"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconPencil, IconSearch } from "@tabler/icons-react";

type BodyPartEntry = { percentage: number; bodyPart: { id: string; name: string } };
type Exercise = { id: string; name: string; bodyParts: BodyPartEntry[] };

export default function ExercisesClient({ exercises }: { exercises: Exercise[] }) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const allBodyParts = useMemo(() => {
    const map = new Map<string, string>();
    for (const ex of exercises)
      for (const bp of ex.bodyParts)
        map.set(bp.bodyPart.id, bp.bodyPart.name);
    return [...map.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((e) => {
      const matchesQuery =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.bodyParts.some((bp) => bp.bodyPart.name.toLowerCase().includes(q));
      const matchesFilter =
        !activeFilter ||
        e.bodyParts.some((bp) => bp.bodyPart.id === activeFilter);
      return matchesQuery && matchesFilter;
    });
  }, [exercises, query, activeFilter]);

  return (
    <>
      <div className="relative mb-3">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" stroke={1.5} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises"
          className="w-full rounded-xl border border-border bg-surface-2 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-accent"
        />
      </div>

      {allBodyParts.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {allBodyParts.map((bp) => (
            <button
              key={bp.id}
              onClick={() => setActiveFilter(activeFilter === bp.id ? null : bp.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeFilter === bp.id
                  ? "bg-accent text-black"
                  : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {bp.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((ex) => {
          const primary = ex.bodyParts.reduce<BodyPartEntry | null>(
            (best, bp) => (!best || bp.percentage > best.percentage ? bp : best),
            null,
          );
          const letter = primary ? primary.bodyPart.name[0].toUpperCase() : "?";

          return (
            <Link
              key={ex.id}
              href={`/exercises/${ex.id}/edit`}
              className="flex items-center gap-3 rounded-xl bg-surface p-3 hover:bg-surface-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-bold text-accent">
                {letter}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{ex.name}</p>
                {ex.bodyParts.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {ex.bodyParts.map((bp) => (
                      <span
                        key={bp.bodyPart.id}
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          activeFilter === bp.bodyPart.id
                            ? "bg-accent/20 text-accent"
                            : "bg-surface-2 text-muted"
                        }`}
                      >
                        {bp.bodyPart.name}
                      </span>
                    ))}
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
            {query || activeFilter ? "No exercises match your filter." : "No exercises yet."}
          </p>
        )}
      </div>
    </>
  );
}
