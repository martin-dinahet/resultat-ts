import type { Success } from "../types/success.js";

/**
 * Creates a {@link Success} result.
 *
 * Use this to wrap a value in a success variant.
 *
 * @template T - The type of the value.
 * @param value - The value to wrap.
 * @returns A {@link Success} containing the provided value.
 *
 * @example
 * return ok(user);
 */
export function ok<T>(value: T): Success<T> {
  return { success: true, value };
}
