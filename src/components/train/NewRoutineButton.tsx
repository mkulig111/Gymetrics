"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
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
    <Button variant="secondary" className="w-full" disabled={loading} onClick={handleClick}>
      + New Routine
    </Button>
  );
}
