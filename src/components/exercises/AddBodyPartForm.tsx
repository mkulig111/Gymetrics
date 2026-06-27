"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { createBodyPart } from "@/lib/actions/exercises";

export default function AddBodyPartForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createBodyPart(name.trim());
      setName("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New body part name"
        className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <Button variant="primary" disabled={saving} onClick={handleAdd}>
        Add
      </Button>
    </div>
  );
}
