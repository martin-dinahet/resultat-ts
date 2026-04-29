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

/**
 * Extracts the value from a {@link Success} or returns a fallback (method-chaining version).
 *
 * @template T - The value type.
 * @param result - The success result.
 * @param fallback - Value returned.
 * @returns The success value.
 */
export function unwrapOrMethod<T>(result: { success: true; value: T }, fallback: T): T {
  return result.value;
}

/**
 * Extracts the value from a {@link Failure} or returns a fallback (method-chaining version).
 *
 * @template T - The fallback type.
 * @param result - The failure result.
 * @param fallback - Value returned.
 * @returns The fallback value.
 */
export function unwrapOrFailMethod<T>(result: { success: false }, fallback: T): T {
  return fallback;
}
