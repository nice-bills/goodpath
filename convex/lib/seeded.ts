import { SEEDED_DIVISION_COHORT, type LeagueDivision } from "@goodpath/shared";

/** Deterministic pseudo-address for seeded cohort rows (Convex has no Node `Buffer`). */
export function seededIdToAddress(id: string): string {
  const bytes = new TextEncoder().encode(id);
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return `0x${hex.padEnd(40, "0").slice(0, 40)}`.toLowerCase();
}

/** "Benchmark · Echo" → "Echo" */
export function benchmarkHandle(label?: string | null): string {
  if (!label) return "Bench";
  return label.replace(/^Benchmark\s*·\s*/i, "").trim() || "Bench";
}

export function allSeededAddresses(): string[] {
  const divisions: LeagueDivision[] = ["bronze", "silver", "gold"];
  return divisions.flatMap((division) =>
    SEEDED_DIVISION_COHORT[division].map((c) => seededIdToAddress(c.id)),
  );
}

export function seededLabelByAddress(address: string): string | null {
  const lower = address.toLowerCase();
  for (const division of ["bronze", "silver", "gold"] as LeagueDivision[]) {
    for (const c of SEEDED_DIVISION_COHORT[division]) {
      if (seededIdToAddress(c.id) === lower) return c.label;
    }
  }
  return null;
}

export const JUDGE_DEMO_META = JSON.stringify({ judgeDemo: true });
