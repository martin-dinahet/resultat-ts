import type { Result } from "../types/result.js";

type MatchHandlers<T, U, E = string> = {
  ok: (value: T) => U;
  fail: (error: E) => U;
};

/**
 * Pattern-matches on a {@link Result}, forcing explicit handling of both
 * success and failure cases.
 *
 * This is inspired by pattern matching in languages like Rust and provides
 * a declarative alternative to `if/else` branching.
 *
 * @template T - The type of the success value.
 * @template U - The return type of the handlers.
 * @template E - The error type.
 *
 * @param result - The result to evaluate.
 * @param handlers - An object containing handlers for both success (`ok`)
 * and failure (`fail`) cases.
 *
 * @returns The value returned by the corresponding handler.
 *
 * @example
 * const result = ok(42);
 *
 * const output = match(result, {
 *   ok: value => value * 2,
 *   fail: error => 0,
 * });
 * // output = 84
 *
 * @example
 * const result = fail("Something went wrong");
 *
 * const message = match(result, {
 *   ok: value => `Value: ${value}`,
 *   fail: error => `Error: ${error}`,
 * });
 * // message = "Error: Something went wrong"
 *
 * @remarks
 * - Both handlers are required, ensuring exhaustive handling.
 * - Prefer this over `unwrap` when you want safe, explicit control flow.
 * - Works well as the "exit point" of a `Result` pipeline.
 */
export function match<T, U, E = string>(result: Result<T, E>, handlers: MatchHandlers<T, U, E>): U {
  if (result.success) return handlers.ok(result.value);
  return handlers.fail(result.error);
}
