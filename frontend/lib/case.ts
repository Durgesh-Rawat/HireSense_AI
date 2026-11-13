/** Key-case conversion, used only when NEXT_PUBLIC_API_CASE=snake. */
const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && Object.getPrototypeOf(v) === Object.prototype;
}

function convert(value: unknown, fn: (s: string) => string): unknown {
  if (Array.isArray(value)) return value.map((v) => convert(v, fn));
  if (isPlainObject(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [fn(k), convert(v, fn)]));
  return value;
}

export const keysToCamel = <T>(v: unknown) => convert(v, toCamel) as T;
export const keysToSnake = <T>(v: unknown) => convert(v, toSnake) as T;
