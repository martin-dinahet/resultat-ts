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
 * @template E - The error type (defaults to `string`).
 * @param fn - Async function to execute.
 * @returns A promise resolving to a {@link Result}.
 *
 * @example
 * const result = await tryCatchAsync(() => fetch("/api").then(r => r.json()));
 *
 * @example
 * const result = await tryCatchAsync<string, Error>(async () => {
 *   throw new Error("custom");
 * });
 */
export async function tryCatchAsync<T, E = string>(fn: () => Promise<T>): Promise<Result<T, E>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (e) {
    return fail(e instanceof Error ? (e as E) : (String(e) as unknown as E));
  }
}
