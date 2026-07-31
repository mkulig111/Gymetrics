"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { createRoutine } from "@/lib/actions/routines";

export default function NewRoutineButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const routine = await createRoutine("New Routine");
    router.push(`/train/routines/${routine.id}/edit`);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label="New routine"
      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-surface-2 hover:bg-border disabled:opacity-50"
    >
      <IconPlus className="h-6 w-6" stroke={1.5} />
    </button>
  );
}
