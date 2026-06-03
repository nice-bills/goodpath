"use client";

import { useEffect, useState } from "react";

const DESKTOP_MIN = 768;

/** `true` when viewport is at least tablet/desktop width. */
export function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return desktop;
}
