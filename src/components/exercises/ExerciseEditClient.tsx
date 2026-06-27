"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExerciseType } from "@/generated/prisma";
import Button from "@/components/ui/Button";
import { updateExercise, createBodyPart } from "@/lib/actions/exercises";

type BodyPartOption = { id: string; name: string };
type BodyPartRow = { bodyPartId: string; percentage: number };

const TYPE_LABELS: Record<ExerciseType, string> = {
  [ExerciseType.WEIGHT_REPS]: "Weight x Reps",
  [ExerciseType.BODYWEIGHT_REPS]: "Bodyweight Reps",
  [ExerciseType.TIME]: "Time",
};

export default function ExerciseEditClient({
  exerciseId,
  initialName,
  initialType,
  initialBodyParts,
  bodyPartLibrary,
}: {
  exerciseId: string;
  initialName: string;
  initialType: ExerciseType;
  initialBodyParts: BodyPartRow[];
  bodyPartLibrary: BodyPartOption[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [type, setType] = useState<ExerciseType>(initialType);
  const [rows, setRows] = useState<BodyPartRow[]>(initialBodyParts);
  const [library, setLibrary] = useState(bodyPartLibrary);
  const [newBodyPartName, setNewBodyPartName] = useState("");
  const [saving, setSaving] = useState(false);

  function addRow() {
    const used = new Set(rows.map((r) => r.bodyPartId));
    const next = library.find((bp) => !used.has(bp.id));
    if (!next) return;
    setRows((prev) => [...prev, { bodyPartId: next.id, percentage: 100 }]);
  }

  function updateRow(index: number, patch: Partial<BodyPartRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleAddBodyPart() {
    if (!newBodyPartName.trim()) return;
    const created = await createBodyPart(newBodyPartName.trim());
    setLibrary((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setRows((prev) => [...prev, { bodyPartId: created.id, percentage: 100 }]);
    setNewBodyPartName("");
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateExercise(exerciseId, { name, type, bodyParts: rows });
      router.push("/exercises");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/exercises" className="text-sm text-muted underline">
          &larr; Back
        </Link>
        <Button variant="primary" disabled={saving} onClick={handleSave}>
          Save
        </Button>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-transparent text-2xl font-bold outline-none"
        placeholder="Exercise name"
      />

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
          Tracking Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ExerciseType)}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        >
          {Object.values(ExerciseType).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Body Parts Affected
        </h2>
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={row.bodyPartId}
                onChange={(e) => updateRow(index, { bodyPartId: e.target.value })}
                className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {library.map((bp) => (
                  <option key={bp.id} value={bp.id}>
                    {bp.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={row.percentage}
                onChange={(e) => updateRow(index, { percentage: parseFloat(e.target.value) || 0 })}
                className="w-20 rounded-lg border border-border bg-surface-2 px-2 py-2 text-center text-sm outline-none focus:border-accent"
              />
              <span className="text-xs text-muted">%</span>
              <button onClick={() => removeRow(index)} aria-label="Remove body part" className="text-danger">
                &times;
              </button>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-muted">No body parts assigned yet.</p>}
        </div>

        <button
          onClick={addRow}
          disabled={rows.length >= library.length}
          className="mt-3 w-full rounded-lg border border-dashed border-border py-2 text-sm font-semibold hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Add Body Part
        </button>

        <div className="mt-3 flex gap-2">
          <input
            value={newBodyPartName}
            onChange={(e) => setNewBodyPartName(e.target.value)}
            placeholder="New body part name"
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <Button variant="secondary" onClick={handleAddBodyPart}>
            Add New
          </Button>
        </div>
      </div>
    </div>
  );
}
