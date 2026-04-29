import type { Result } from "../types/result.js";
import { fail } from "./fail.js";

/**
 * Transforms the error inside a {@link Failure} using the provided function.
 * If the result is a {@link Success}, it is returned unchanged.
 *
 * Useful for normalizing errors or adding context.
 *
 * @template T - The success value type.
 * @template E - The input error type.
 * @template E2 - The output error type.
 * @param result - The result to transform.
 * @param fn - Function applied to the error value.
 * @returns A new {@link Result} with the transformed error, or the original success.
 *
 * @example
 * const result = mapError(fail("not found"), err => ({ code: "ERR_NOT_FOUND", message: err }));
 *
 * @example
 * const result = mapError(ok(42), err => err); // ok(42) unchanged
 */
export function mapError<T, E, E2>(result: Result<T, E>, fn: (error: E) => E2): Result<T, E2> {
  if (!result.success) return fail(fn(result.error));
  return result;
}

/**
 * Transforms the error inside a {@link Failure} using the provided function.
 * This is the method-chaining version that works on Fail instances.
 *
 * @template E - The input error type.
 * @template E2 - The output error type.
 * @param result - The failure result.
 * @param fn - Function applied to the error value.
 * @returns A new {@link Result} with the transformed error.
 */
export function mapErrorMethod<E, E2>(
  result: { success: false; error: E },
  fn: (error: E) => E2,
): Result<never, E2> {
  return fail(fn(result.error));
}
