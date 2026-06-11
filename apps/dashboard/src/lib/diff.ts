import type { ProductData } from "@passaporto/shared";

export type DiffKind = "added" | "removed" | "changed";

export interface DiffEntry {
  key: string;
  kind: DiffKind;
  before: unknown;
  after: unknown;
}

function serialize(value: unknown): string {
  if (value === null || value === undefined) return "";
  return JSON.stringify(value);
}

export function diffData(before: ProductData, after: ProductData): DiffEntry[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const entries: DiffEntry[] = [];
  keys.forEach((key) => {
    const a = before[key];
    const b = after[key];
    if (serialize(a) === serialize(b)) return;
    const kind: DiffKind =
      a === undefined ? "added" : b === undefined ? "removed" : "changed";
    entries.push({ key, kind, before: a, after: b });
  });
  return entries;
}
