"use client";

import { useSyncExternalStore } from "react";

const DESKTOP_MIN = 768;

function subscribeDesktop(cb: () => void) {
  const mq = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getDesktopSnapshot() {
  return window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`).matches;
}

/** `true` when viewport is at least tablet/desktop width. */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, () => false);
}
