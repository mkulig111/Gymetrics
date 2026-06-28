"use client";

import Modal from "@/components/ui/Modal";
import { SetType } from "@/generated/prisma";

export const SET_TYPE_META: Record<SetType, { letter: string; label: string; className: string | null }> = {
  WORK: { letter: "", label: "Work Set", className: null },
  WARMUP: { letter: "W", label: "Warm-up Set", className: "bg-amber-700" },
  DROP: { letter: "D", label: "Drop Set", className: "bg-teal-700" },
  FAILURE: { letter: "F", label: "Failure Set", className: "bg-red-800" },
};

const ORDER: SetType[] = [SetType.WORK, SetType.WARMUP, SetType.DROP, SetType.FAILURE];

export default function SetTypeModal({
  setNumber,
  onPick,
  onClose,
}: {
  setNumber: number;
  onPick: (type: SetType) => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Set Type" onClose={onClose}>
      <div className="space-y-1">
        {ORDER.map((type, i) => {
          const meta = SET_TYPE_META[type];
          return (
            <button
              key={type}
              onClick={() => onPick(type)}
              className={`flex w-full items-center gap-4 px-1 py-3 text-left ${i > 0 ? "border-t border-border" : ""}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-lg font-bold ${
                  meta.className ? `${meta.className} text-white` : "text-muted"
                }`}
              >
                {type === SetType.WORK ? setNumber : meta.letter}
              </span>
              <span className="text-lg">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
