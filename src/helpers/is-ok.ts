import type { Result } from "../types/result.js";
import type { Success } from "../types/success.js";

/**
 * Type guard that checks whether a {@link Result} is a {@link Success}.
 *
 * Enables TypeScript narrowing:
 * inside the `if`, `result` is inferred as `Success<T>`.
 *
 * @template T - The value type.
 * @template E - The error type.
 * @param result - The result to check.
 * @returns `true` if the result is a success.
 *
 * @example
 * if (isOk(result)) {
 *   result.value; // typed as T
 * }
 */
export function isOk<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success;
}
