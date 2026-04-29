import type { Result } from "../types/result.js";

/**
 * Extracts the value from a {@link Result}, or returns a fallback if it failed.
 *
 * Useful when you want a default value without handling errors explicitly.
 *
 * @template T - The value type.
 * @template E - The error type.
 * @param result - The result to unwrap.
 * @param fallback - Value returned if the result is a failure.
 * @returns The success value or the fallback.
 *
 * @example
 * unwrapOr(ok(10), 0); // 10
 * unwrapOr(fail("err"), 0); // 0
 */
export function unwrapOr<T, E = string>(result: Result<T, E>, fallback: T): T {
  if (result.success) return result.value;
  return fallback;
}
