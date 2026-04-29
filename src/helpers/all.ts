import type { Result } from "../types/result.js";
import { ok } from "./ok.js";

/**
 * Combines an array of {@link Result}s into a single {@link Result}.
 *
 * - If all results are successful, returns a {@link Success} with all values.
 * - If any result is a failure, returns the first encountered {@link Failure}.
 *
 * This is useful for aggregating multiple independent operations.
 *
 * @template T - The value type.
 * @template E - The error type.
 * @param results - Array of results.
 * @returns A combined result.
 *
 * @example
 * all([ok(1), ok(2), ok(3)]); // ok([1,2,3])
 *
 * @example
 * all([ok(1), fail("err"), ok(3)]); // fail("err")
 */
export function all<T, E = string>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const result of results) {
    if (!result.success) return result;
    values.push(result.value);
  }
  return ok(values);
}
