"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/types";

export default function ElapsedTimer({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(startedAt);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 1000);
    const immediate = setTimeout(tick, 0);
    return () => {
      clearInterval(id);
      clearTimeout(immediate);
    };
  }, []);

  return (
    <span className="tabular-nums">{formatDuration(now - startedAt)}</span>
  );
}
