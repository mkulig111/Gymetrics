"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { formatSeconds } from "@/lib/types";

const PRESETS = [60, 120, 180, 300];

export function RestTimerPickerModal({
  onPick,
  onClose,
}: {
  onPick: (seconds: number) => void;
  onClose: () => void;
}) {
  const [custom, setCustom] = useState("90");
  return (
    <Modal title="Rest Timer" onClose={onClose}>
      <div className="grid grid-cols-3 gap-3">
        {PRESETS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="flex aspect-square items-center justify-center rounded-full border border-border bg-surface-2 text-lg font-bold hover:border-accent"
          >
            {formatSeconds(s)}
          </button>
        ))}
        <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-full border border-border bg-surface-2 px-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-12 bg-transparent text-center text-lg font-bold outline-none"
          />
          <button
            onClick={() => onPick(parseInt(custom || "0", 10))}
            className="text-xs text-accent"
          >
            Custom
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function RestTimerBar({
  endAt,
  onAdjust,
  onClear,
}: {
  endAt: number;
  onAdjust: (deltaSeconds: number) => void;
  onClear: () => void;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 250);
    const immediate = setTimeout(tick, 0);
    return () => {
      clearInterval(id);
      clearTimeout(immediate);
    };
  }, []);

  const remainingMs = now == null ? endAt - 1 : endAt - now;
  useEffect(() => {
    if (now != null && remainingMs <= 0) {
      const t = setTimeout(onClear, 0);
      return () => clearTimeout(t);
    }
  }, [now, remainingMs, onClear]);

  if (remainingMs <= 0) return null;
  const remaining = Math.ceil(remainingMs / 1000);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-2xl items-center justify-between gap-3 border-t border-border bg-surface px-4 py-3">
      <span className="font-semibold text-muted">Rest</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onAdjust(-15)}
          className="rounded-full bg-surface-2 px-3 py-1 text-sm"
        >
          -15
        </button>
        <span className="w-14 text-center text-xl font-bold tabular-nums text-accent">
          {formatSeconds(remaining)}
        </span>
        <button
          onClick={() => onAdjust(15)}
          className="rounded-full bg-surface-2 px-3 py-1 text-sm"
        >
          +15
        </button>
      </div>
      <button onClick={onClear} className="text-sm text-muted underline">
        Skip
      </button>
    </div>
  );
}
