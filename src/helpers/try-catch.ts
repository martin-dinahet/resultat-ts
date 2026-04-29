import type { Failure } from "../types/failure.js";
import type { Result } from "../types/result.js";
import type { Success } from "../types/success.js";
import { fail } from "./fail.js";
import { ok } from "./ok.js";

/**
 * Executes a function and captures thrown exceptions as a {@link Failure}.
 *
 * This is useful for integrating exception-based code into a `Result` workflow.
 *
 * @template T - The function's return type.
 * @template E - The error type (defaults to `string`).
 * @param fn - Function to execute.
 * @returns A {@link Success} if no error is thrown, otherwise a {@link Failure}.
 *
 * @example
 * const result = tryCatch(() => JSON.parse("{ invalid json }"));
 *
 * @example
 * const result = tryCatch<string, Error>(() => {
 *   throw new Error("custom");
 * });
 */
export function tryCatch<T, E = string>(fn: () => T): Result<T, E> {
  try {
    return ok(fn());
  } catch (e) {
    return fail(e instanceof Error ? (e as E) : String(e) as unknown as E);
  }
}
