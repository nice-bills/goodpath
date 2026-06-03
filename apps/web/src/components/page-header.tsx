"use client";

import { motion } from "framer-motion";
import { ConnectButton } from "@/components/connect-button";
import { fadeUp } from "@/lib/motion";

export function PageHeader({
  eyebrow = "GoodDollar",
  title,
  subtitle,
  showConnect = true,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Hide header connect chip (e.g. Home passport has the primary CTA). */
  showConnect?: boolean;
  className?: string;
}) {
  return (
    <motion.header
      {...fadeUp}
      className={["page-header", className].filter(Boolean).join(" ")}
    >
      <div className="page-header-row flex items-center justify-between gap-3">
        <span className="eyebrow">{eyebrow}</span>
        {showConnect ? <ConnectButton /> : null}
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
