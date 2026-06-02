"use client";

import { motion, animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

export function ProgressRing({ progress }: { progress: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const motionProgress = useMotionValue(0);
  const [label, setLabel] = useState(0);

  useMotionValueEvent(motionProgress, "change", (v) => setLabel(Math.round(v)));

  useEffect(() => {
    const ctrl = animate(motionProgress, progress, {
      duration: 0.6,
      ease: [0.32, 0.72, 0, 1],
    });
    return () => ctrl.stop();
  }, [progress, motionProgress]);

  const offset = c - (progress / 100) * c;

  return (
    <div className="relative h-[96px] w-[96px] shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--ring-bg)" strokeWidth="6" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-semibold tabular-nums">{label}%</span>
      </div>
    </div>
  );
}
