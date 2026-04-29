import type { Result } from "../types/result.js";
import { ok } from "./ok.js";

/**
 * Transforms the value inside a {@link Success} using the provided function.
 * If the result is a {@link Failure}, it is returned unchanged.
 *
 * This is analogous to `Array.prototype.map`, but for `Result`.
 *
 * @template T - The input value type.
 * @template U - The output value type.
 * @template E - The error type.
 * @param result - The result to transform.
 * @param fn - Function applied to the success value.
 * @returns A new {@link Result} with the transformed value, or the original failure.
 *
 * @example
 * const result = map(ok(2), x => x * 2); // ok(4)
 *
 * @example
 * const result = map(fail("err"), x => x * 2); // fail("err")
 */
export function map<T, U, E = string>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (result.success) return ok(fn(result.value));
  return result;
}

/**
 * Transforms the value inside a {@link Success} using the provided function.
 * This is the method-chaining version that works on Ok instances.
 *
 * @template T - The input value type.
 * @template U - The output value type.
 * @param fn - Function applied to the success value.
 * @returns A new {@link Result} with the transformed value.
 */
export function mapMethod<T, U>(
  result: { success: true; value: T },
  fn: (value: T) => U,
): Result<U, never> {
  return ok(fn(result.value));
}
