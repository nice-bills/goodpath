"use client";

import { motion } from "framer-motion";
import { ConnectButton } from "@/components/connect-button";
import { fadeUp } from "@/lib/motion";

export function PageHeader({
  eyebrow = "GoodDollar",
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.header {...fadeUp} className="mb-8">
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow">{eyebrow}</span>
        <ConnectButton />
      </div>
      <h1 className="font-display mt-3 text-[32px] leading-[1.05] tracking-tight text-balance">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 text-sm leading-snug text-pretty text-muted">{subtitle}</p>
      ) : null}
    </motion.header>
  );
}
