import type { Failure } from "../types/failure.js";
import type { Result } from "../types/result.js";
import type { Success } from "../types/success.js";

/**
 * Chains operations that themselves return a {@link Result}.
 *
 * If the input is a {@link Success}, the function is executed and its result returned.
 * If the input is a {@link Failure}, it is propagated unchanged.
 *
 * This is analogous to `flatMap`, `bind`, or `andThen` in other libraries.
 *
 * @template T - The input value type.
 * @template U - The output value type.
 * @template E - The error type.
 * @param result - The result to chain.
 * @param fn - Function that returns another result.
 * @returns The next result in the chain, or the original failure.
 *
 * @example
 * const parse = (s: string): Result<number> =>
 *   isNaN(Number(s)) ? fail("NaN") : ok(Number(s));
 *
 * const result = flatMap(ok("42"), parse); // ok(42)
 */
export function flatMap<T, U, E = string>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  if (result.success) return fn(result.value);
  return result;
}
