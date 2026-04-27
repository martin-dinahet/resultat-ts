/**
 * Represents a successful result.
 *
 * @template T - The type of the contained value.
 *
 */
export type Success<T> = {
  success: true;
  value: T;
};
