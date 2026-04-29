import type { Result } from "./types/result.js";
import type { Success } from "./types/success.js";

export class Ok<T> {
  readonly success = true as const;

  constructor(public readonly value: T) {}

  isOk(): this is Ok<T> {
    return true;
  }

  isFail(): false {
    return false;
  }

  map<U>(fn: (value: T) => U): Ok<U> {
    return new Ok(fn(this.value));
  }

  mapError<E2>(_fn: never): this {
    return this;
  }

  flatMap<U, E2>(fn: (value: T) => Result<U, E2>): Result<U, E2> {
    return fn(this.value);
  }

  tap(fn: (value: T) => void): this {
    fn(this.value);
    return this;
  }

  match<U>(handlers: { ok: (value: T) => U; fail: (error: never) => U }): U {
    return handlers.ok(this.value);
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_fallback: T): T {
    return this.value;
  }

  unwrapOrElse(_fn: never): T {
    return this.value;
  }

  toJSON(): Success<T> {
    return { success: true, value: this.value };
  }
}
