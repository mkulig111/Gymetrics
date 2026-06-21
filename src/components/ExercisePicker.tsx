"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { createCustomExercise } from "@/lib/actions/exercises";
import { ExerciseType } from "@/generated/prisma";

export type ExerciseOption = {
  id: string;
  name: string;
  muscleGroup: string;
  type: ExerciseType;
};

export default function ExercisePicker({
  title,
  exercises,
  onPick,
  onClose,
}: {
  title: string;
  exercises: ExerciseOption[];
  onPick: (exerciseId: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter(
      (e) => e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q),
    );
  }, [exercises, query]);

  async function handleCreateCustom() {
    if (!query.trim()) return;
    setCreating(true);
    try {
      const created = await createCustomExercise(query.trim(), "Other", ExerciseType.WEIGHT_REPS);
      onPick(created.id);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search or add your own alternative"
        className="mb-4 w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-accent"
      />
      {query.trim() && (
        <Button
          variant="secondary"
          className="mb-3 w-full"
          disabled={creating}
          onClick={handleCreateCustom}
        >
          + Add &quot;{query.trim()}&quot; as new exercise
        </Button>
      )}
      <ul className="divide-y divide-border">
        {filtered.map((ex) => (
          <li key={ex.id}>
            <button
              onClick={() => onPick(ex.id)}
              className="flex w-full flex-col items-start py-3 text-left hover:text-accent"
            >
              <span className="font-medium">{ex.name}</span>
              <span className="text-xs text-muted">{ex.muscleGroup}</span>
            </button>
          </li>
        ))}
        {filtered.length === 0 && !query.trim() && (
          <li className="py-6 text-center text-sm text-muted">No exercises yet.</li>
        )}
      </ul>
    </Modal>
  );
}
