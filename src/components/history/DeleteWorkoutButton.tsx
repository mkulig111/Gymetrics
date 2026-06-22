"use client";

import { useTransition } from "react";
import { deleteWorkoutSession } from "@/lib/actions/history";

export default function DeleteWorkoutButton({
  sessionId,
  className,
  children,
}: {
  sessionId: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("Delete this workout? This cannot be undone.")) return;
    startTransition(() => {
      deleteWorkoutSession(sessionId);
    });
  }

  return (
    <button onClick={onClick} disabled={isPending} className={className}>
      {isPending ? "Deleting…" : children ?? "🗑️ Delete"}
    </button>
  );
}
