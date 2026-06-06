const CHUNK_RELOAD_KEY = "goodpath-chunk-reload";

export function isChunkLoadError(message: string): boolean {
  return (
    message.includes("Loading chunk") ||
    message.includes("ChunkLoadError") ||
    message.includes("Failed to fetch dynamically imported module")
  );
}

/** Reload once after a deploy invalidates lazy-loaded chunks. Returns true if reloading. */
export function reloadOnceOnChunkError(): boolean {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
    return false;
  }
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return false;
  sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
  window.location.reload();
  return true;
}

export function clearChunkReloadFlag(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(CHUNK_RELOAD_KEY);
}
