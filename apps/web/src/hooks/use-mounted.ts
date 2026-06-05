"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only after the client has mounted (false on server and first hydration pass). */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
