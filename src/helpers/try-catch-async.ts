import type { Failure } from "../types/failure.js";
import type { Result } from "../types/result.js";
import { fail } from "./fail.js";
import { ok } from "./ok.js";

/**
 * Async version of {@link tryCatch}.
 *
 * Executes an async function and converts rejected promises or thrown errors
 * into a {@link Failure}.
 *
 * @template T - The resolved type of the promise.
 * @param fn - Async function to execute.
 * @returns A promise resolving to a {@link Result}.
 *
 * @example
 * const result = await tryCatchAsync(() => fetch("/api").then(r => r.json()));
 */
export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
