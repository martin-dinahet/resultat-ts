import type { Failure } from "../types/failure.js";

/**
 * Creates a {@link Failure} result.
 *
 * Use this to represent an error condition without throwing.
 *
 * @template E - The type of the error (defaults to `string`).
 * @param error - The error value.
 * @returns A {@link Failure} containing the error.
 *
 * @example
 * return fail("User not found");
 *
 * @example
 * return fail(new Error("User not found"));
 */
export function fail<E = string>(error: E): Failure<E> {
  return { success: false, error };
}
