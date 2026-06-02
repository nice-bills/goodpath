"use client";

import { motion } from "framer-motion";
import { springSnappy } from "@/lib/motion";

type MascotState = "start" | "mid" | "done";

export function PathMascot({
  state = "start",
  size = 72,
  className = "",
}: {
  state?: MascotState;
  size?: number;
  className?: string;
}) {
  const leafFill =
    state === "done" ? "#00c896" : state === "mid" ? "#00a878" : "#7cb8a4";

  return (
    <motion.div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
      initial={{ scale: 0.88, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={springSnappy}
      aria-hidden
    >
      <svg viewBox="0 0 80 80" fill="none" className="h-full w-full">
        <circle cx="40" cy="40" r="36" fill="var(--accent-soft)" />
        <circle cx="40" cy="40" r="36" stroke="rgba(0,168,120,0.2)" strokeWidth="1.5" />
        <path
          d="M40 18c-10 0-18 8-18 18 0 12 8 22 18 32 10-10 18-20 18-32 0-10-8-18-18-18z"
          fill="#fff"
          stroke={leafFill}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="40" cy="34" r="6" fill={leafFill} />
        {state === "done" && (
          <>
            <motion.circle
              cx="58"
              cy="24"
              r="4"
              fill="#d97706"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, ...springSnappy }}
            />
            <motion.circle
              cx="22"
              cy="28"
              r="3"
              fill="#00c896"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.35, ...springSnappy }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}
