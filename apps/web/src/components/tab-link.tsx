"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useAppTab } from "@/hooks/use-app-tab";
import { appTabHref, type AppTab } from "@/lib/app-tab";

type TabLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  tab: AppTab;
  hash?: string;
};

export function TabLink({ tab, hash, onClick, ...props }: TabLinkProps) {
  const { setTab } = useAppTab();
  const href = appTabHref(tab, hash);

  return (
    <Link
      href={href}
      scroll={false}
      {...props}
      onClick={(e) => {
        e.preventDefault();
        setTab(tab);
        if (hash) {
          const id = hash.replace(/^#/, "");
          requestAnimationFrame(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
        onClick?.(e);
      }}
    />
  );
}
