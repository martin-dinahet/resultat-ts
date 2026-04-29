import type { Result } from "../types/result.js";

/**
 * Extracts the value from a {@link Result}, or computes a fallback using the error.
 *
 * Similar to {@link unwrapOr}, but allows deriving the fallback dynamically.
 *
 * @template T - The value type.
 * @template E - The error type.
 * @param result - The result to unwrap.
 * @param fn - Function that maps the error to a fallback value.
 * @returns The success value or the computed fallback.
 *
 * @example
 * unwrapOrElse(fail("404"), err => err.length); // 3
 */
export function unwrapOrElse<T, E = string>(result: Result<T, E>, fn: (error: E) => T): T {
  if (result.success) return result.value;
  return fn(result.error);
}

/**
 * Computes a fallback using the error (method-chaining version for failure).
 *
 * @template E - The error type.
 * @template T - The fallback type.
 * @param result - The failure result.
 * @param fn - Function that maps the error to a fallback value.
 * @returns The computed fallback.
 */
export function unwrapOrElseFailMethod<E, T>(
  result: { success: false; error: E },
  fn: (error: E) => T,
): T {
  return fn(result.error);
}
