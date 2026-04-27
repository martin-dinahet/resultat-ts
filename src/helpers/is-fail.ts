import type { Failure } from "../types/failure.js";
import type { Result } from "../types/result.js";

/**
 * Type guard that checks whether a {@link Result} is a {@link Failure}.
 *
 * Enables TypeScript narrowing:
 * inside the `if`, `result` is inferred as `Failure`.
 *
 * @template T - The value type.
 * @param result - The result to check.
 * @returns `true` if the result is a failure.
 *
 * @example
 * if (isFail(result)) {
 *   console.error(result.error);
 * }
 */
export function isFail<T>(result: Result<T>): result is Failure {
  return !result.success;
}
