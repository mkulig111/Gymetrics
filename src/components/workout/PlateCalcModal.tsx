"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";

const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export default function PlateCalcModal({ onClose }: { onClose: () => void }) {
  const [target, setTarget] = useState("100");
  const [barWeight, setBarWeight] = useState("20");

  const result = useMemo(() => {
    const t = parseFloat(target) || 0;
    const bar = parseFloat(barWeight) || 0;
    let perSide = Math.max(0, (t - bar) / 2);
    const plates: number[] = [];
    for (const p of PLATES) {
      while (perSide >= p - 0.001) {
        plates.push(p);
        perSide -= p;
      }
    }
    return plates;
  }, [target, barWeight]);

  return (
    <Modal title="Plate Calculator" onClose={onClose}>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Target weight (kg)
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Bar weight (kg)
          <input
            value={barWeight}
            onChange={(e) => setBarWeight(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </label>
      </div>
      <p className="mb-2 text-sm text-muted">Plates per side:</p>
      {result.length === 0 ? (
        <p className="text-sm text-muted">Just the bar.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {result.map((p, i) => (
            <span
              key={i}
              className="rounded-md bg-surface-2 px-3 py-1.5 text-sm font-semibold text-accent"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </Modal>
  );
}
