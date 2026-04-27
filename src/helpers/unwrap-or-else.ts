import type { Result } from "../types/result.js";

/**
 * Extracts the value from a {@link Result}, or computes a fallback using the error.
 *
 * Similar to {@link unwrapOr}, but allows deriving the fallback dynamically.
 *
 * @template T - The value type.
 * @param result - The result to unwrap.
 * @param fn - Function that maps the error to a fallback value.
 * @returns The success value or the computed fallback.
 *
 * @example
 * unwrapOrElse(fail("404"), err => err.length); // 3
 */
export function unwrapOrElse<T>(result: Result<T>, fn: (error: string) => T): T {
  if (result.success) return result.value;
  return fn(result.error);
}
