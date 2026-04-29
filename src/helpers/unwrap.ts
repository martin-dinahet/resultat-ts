import type { Failure } from "../types/failure.js";
import type { Result } from "../types/result.js";
import type { Success } from "../types/success.js";

/**
 * Extracts the value from a {@link Success}.
 *
 * ⚠️ Throws if the result is a {@link Failure}. Prefer safer alternatives
 * like {@link unwrapOr} or {@link unwrapOrElse} when possible.
 *
 * @template T - The value type.
 * @template E - The error type.
 * @param result - The result to unwrap.
 * @returns The contained value if successful.
 * @throws If the result is a failure, throws the error value if it's an Error, otherwise wraps it in an Error.
 *
 * @example
 * const value = unwrap(ok(42)); // 42
 *
 * @example
 * unwrap(fail("boom")); // throws Error("boom")
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) return result.value;
  throw result.error instanceof Error ? result.error : new Error(String(result.error));
}
