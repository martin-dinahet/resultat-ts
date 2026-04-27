import type { Failure } from "../types/failure.js";

/**
 * Creates a {@link Failure} result.
 *
 * Use this to represent an error condition without throwing.
 *
 * @param error - A descriptive error message.
 * @returns A {@link Failure} containing the error message.
 *
 * @example
 * return fail("User not found");
 */
export function fail(error: string): Failure {
  return { success: false, error };
}
