/**
 * Represents a failed result.
 *
 * @template E - The type of the error (defaults to `string`).
 */
export type Failure<E = string> = {
  success: false;
  error: E;
};
