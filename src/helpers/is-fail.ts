import type { Failure } from "../types/failure.js";
import type { Result } from "../types/result.js";

/**
 * Type guard that checks whether a {@link Result} is a {@link Failure}.
 *
 * Enables TypeScript narrowing:
 * inside the `if`, `result` is inferred as `Failure<E>`.
 *
 * @template T - The value type.
 * @template E - The error type.
 * @param result - The result to check.
 * @returns `true` if the result is a failure.
 *
 * @example
 * if (isFail(result)) {
 *   console.error(result.error);
 * }
 */
export function isFail<T, E>(result: Result<T, E>): result is Failure<E> {
  return !result.success;
}
