import type { Failure } from "./failure.js";
import type { Success } from "./success.js";

/**
 * Represents the result of an operation that can either succeed (`Success`)
 * or fail (`Failure`). This pattern avoids throwing exceptions and makes
 * error handling explicit and type-safe.
 *
 * Commonly used in functional-style pipelines and async flows.
 *
 * @template T - The type of the success value.
 * @template E - The type of the error (defaults to `string`).
 *
 * @example
 * const result: Result<number> = ok(42);
 * if (result.success) {
 *   console.log(result.value);
 * } else {
 *   console.error(result.error);
 * }
 */
export type Result<T, E = string> = Success<T> | Failure<E>;
