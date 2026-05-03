/**
 * Result type for explicit error handling without exceptions.
 *
 * Inspired by Rust's `Result<T, E>`.
 *
 * @example
 * ```ts
 * import { Result } from "@punpun-dev/ts-result";
 *
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return Result.err("Division by zero");
 *   return Result.ok(a / b);
 * }
 * ```
 */
export { Err, Ok, Result } from "./types/result.js";
