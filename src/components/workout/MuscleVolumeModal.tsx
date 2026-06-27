"use client";

import Modal from "@/components/ui/Modal";

export default function MuscleVolumeModal({
  volume,
  onClose,
}: {
  volume: { muscle: string; volume: number }[];
  onClose: () => void;
}) {
  const max = Math.max(1, ...volume.map((v) => v.volume));
  return (
    <Modal title="Muscle Volume" onClose={onClose}>
      {volume.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          Complete some sets to see muscle volume for this workout.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between text-xs uppercase tracking-wide text-muted">
            <span>Muscle</span>
            <span>Volume</span>
          </div>
          {volume.map((v) => (
            <div key={v.muscle}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{v.muscle}</span>
                <span className="font-semibold">{Math.round(v.volume)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-2">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${(v.volume / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
