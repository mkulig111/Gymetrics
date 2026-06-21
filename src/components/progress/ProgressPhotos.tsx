"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { addProgressPhoto, deleteProgressPhoto } from "@/lib/actions/progress";

type Photo = { id: string; date: Date; imageData: string };

export default function ProgressPhotos({ photos }: { photos: Photo[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await addProgressPhoto(reader.result as string);
      router.refresh();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleDelete(id: string) {
    await deleteProgressPhoto(id);
    router.refresh();
  }

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Progress Photos</h2>
        <button onClick={() => inputRef.current?.click()} className="text-xl text-accent">
          +
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      {photos.length === 0 ? (
        <p className="text-sm text-muted">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((p) => (
            <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageData} alt="Progress" className="h-full w-full object-cover" />
              <button
                onClick={() => handleDelete(p.id)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs opacity-0 group-hover:opacity-100"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
