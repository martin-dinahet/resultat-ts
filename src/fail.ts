import type { Failure } from "./types/failure.js";
import type { Result } from "./types/result.js";

export class Fail<E> {
  readonly success = false as const;

  constructor(public readonly error: E) {}

  isOk(): false {
    return false;
  }

  isFail(): this is Fail<E> {
    return true;
  }

  map<_U>(_fn: never): this {
    return this;
  }

  mapError<E2>(fn: (error: E) => E2): Fail<E2> {
    return new Fail(fn(this.error));
  }

  flatMap<_U, _E2>(_fn: never): this {
    return this;
  }

  tap(_fn: never): this {
    return this;
  }

  match<U>(handlers: { ok: (value: never) => U; fail: (error: E) => U }): U {
    return handlers.fail(this.error);
  }

  unwrap(): never {
    throw this.error instanceof Error ? this.error : new Error(String(this.error));
  }

  unwrapOr<T>(fallback: T): T {
    return fallback;
  }

  unwrapOrElse<T>(fn: (error: E) => T): T {
    return fn(this.error);
  }

  toJSON(): Failure<E> {
    return { success: false, error: this.error };
  }
}
