"use client";

import { useEffect, useState } from "react";

/** True only after the client has mounted (false on server and first hydration pass). */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
