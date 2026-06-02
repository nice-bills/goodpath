"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEMO_MODE_ENABLED } from "@/lib/demo-profile";

const STORAGE_KEY = "goodpath-demo-active";
const DEMO_EVENT = "goodpath-demo-change";

function readActive(): boolean {
  if (!DEMO_MODE_ENABLED || typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(DEMO_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(DEMO_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function setStored(active: boolean) {
  sessionStorage.setItem(STORAGE_KEY, active ? "1" : "0");
  window.dispatchEvent(new Event(DEMO_EVENT));
}

export function useDemoMode() {
  const active = useSyncExternalStore(
    subscribe,
    readActive,
    () => false,
  );

  const toggle = useCallback(() => {
    setStored(!readActive());
  }, []);

  const enable = useCallback(() => {
    setStored(true);
  }, []);

  return {
    canUseDemo: DEMO_MODE_ENABLED,
    active,
    ready: true,
    toggle,
    enable,
  };
}
