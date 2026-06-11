import it from "./it.json";

type Json = string | { [key: string]: Json };

const dict = it as Record<string, Json>;

function resolve(path: string): string {
  const parts = path.split(".");
  let current: Json | undefined = dict;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return path;
    current = current[part];
  }
  return typeof current === "string" ? current : path;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const raw = resolve(key);
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}

export function useT(): (key: string, vars?: Record<string, string | number>) => string {
  return t;
}
