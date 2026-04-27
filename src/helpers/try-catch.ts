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
 * @param fn - Function to execute.
 * @returns A {@link Success} if no error is thrown, otherwise a {@link Failure}.
 *
 * @example
 * const result = tryCatch(() => JSON.parse("{ invalid json }"));
 */
export function tryCatch<T>(fn: () => T): Result<T> {
  try {
    return ok(fn());
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
