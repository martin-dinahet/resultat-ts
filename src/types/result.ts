/**
 * Represents a computation that may either succeed with a value of type `T`
 * or fail with an error of type `E`.
 *
 * `Result` is an abstract base class — use {@link Result.ok} and {@link Result.err}
 * to construct instances, or {@link Result.try} / {@link Result.tryAsync} to wrap functions that may throw.
 *
 * @typeParam T - The type of the success value.
 * @typeParam E - The type of the error value.
 *
 * @example
 * ```ts
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return Result.err("Division by zero");
 *   return Result.ok(a / b);
 * }
 *
 * const result = divide(10, 2);
 *
 * if (result.isOk()) {
 *   console.log(result.value); // 5
 * }
 * ```
 */
export abstract class Result<T, E> {
  /**
   * Narrows this `Result` to an {@link Ok} if it represents a success.
   *
   * @returns `true` if this is an {@link Ok}, `false` otherwise.
   *
   * @example
   * ```ts
   * const result: Result<number, string> = Result.ok(42);
   *
   * if (result.isOk()) {
   *   result.value; // typed as number ✅
   * }
   * ```
   */
  public isOk(): this is Ok<T> {
    return this instanceof Ok;
  }

  /**
   * Narrows this `Result` to an {@link Err} if it represents a failure.
   *
   * @returns `true` if this is an {@link Err}, `false` otherwise.
   *
   * @example
   * ```ts
   * const result: Result<number, string> = Result.err("oops");
   *
   * if (result.isErr()) {
   *   result.error; // typed as string ✅
   * }
   * ```
   */
  public isErr(): this is Err<E> {
    return this instanceof Err;
  }

  /**
   * Creates a successful `Result` wrapping the given value.
   *
   * @typeParam T - The type of the success value.
   * @param value - The success value to wrap.
   * @returns An {@link Ok} instance containing `value`.
   *
   * @example
   * ```ts
   * const result = Result.ok(42);
   * result.unwrap(); // 42
   * ```
   */
  static ok<T>(value: T): Ok<T> {
    return new Ok(value);
  }

  /**
   * Creates a failed `Result` wrapping the given error.
   *
   * @typeParam E - The type of the error value.
   * @param error - The error value to wrap.
   * @returns An {@link Err} instance containing `error`.
   *
   * @example
   * ```ts
   * const result = Result.err("something went wrong");
   * result.isErr(); // true
   * ```
   */
  static err<E>(error: E): Err<E> {
    return new Err(error);
  }

  /**
   * Executes a sync function and wraps the outcome in a `Result`.
   * If the function throws, the error is caught and returned as an {@link Err}.
   *
   * The error type is `unknown` since anything can be thrown in JavaScript.
   *
   * @typeParam T - The return type of `fn`.
   * @param fn - A sync function that may throw.
   * @returns `Ok<T>` on success or `Err<unknown>` on failure.
   *
   * @example
   * ```ts
   * const result = Result.try(() => JSON.parse("{\"a\":1}"));
   * // Result<unknown, unknown>
   * ```
   */
  static try<T>(fn: () => T): Result<T, unknown> {
    try {
      return Result.ok(fn());
    } catch (e) {
      return Result.err(e);
    }
  }

  /**
   * Executes a function (sync or async) and wraps the outcome in a `Result`.
   * If the function throws or rejects, the error is caught and returned as an {@link Err}.
   *
   * The error type is `unknown` since anything can be thrown in JavaScript.
   * Narrow it using {@link match} or {@link unwrapOrElse}.
   *
   * @typeParam T - The return type of `fn`.
   * @param fn - A function (or async function) that may throw.
   * @returns A `Promise` resolving to `Ok<T>` on success or `Err<unknown>` on failure.
   *
   * @example
   * ```ts
   * // Wrap a potentially throwing async call
   * const result = await Result.tryAsync(() => fetchUser(userId));
   *
   * // Wrap a sync call (still returns Promise)
   * const result = await Result.tryAsync(() => fs.readFileSync(path));
   * ```
   */
  static async tryAsync<T>(fn: () => T | Promise<T>): Promise<Result<T, unknown>> {
    try {
      return Result.ok(await fn());
    } catch (e) {
      return Result.err(e);
    }
  }

  /**
   * Combines multiple `Result`s into a single `Result`.
   *
   * Returns `Ok` with an array of all values if every result is `Ok`,
   * or the first `Err` encountered (fail-fast).
   *
   * @typeParam T - Tuple of success types.
   * @typeParam E - The error type (inferred as union of all error types).
   * @param results - An array of `Result` instances.
   * @returns `Ok<T[]>` if all are `Ok`, or the first `Err`.
   *
   * @example
   * ```ts
   * const a = Result.ok(1);
   * const b = Result.ok(2);
   * const c = Result.ok(3);
   *
   * Result.all([a, b, c]); // Ok([1, 2, 3])
   *
   * const d = Result.err("oops");
   * Result.all([a, d, c]); // Err("oops") — fails fast
   * ```
   */
  static all<T extends readonly Result<unknown, unknown>[]>(
    results: T,
  ): Result<
    { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
    T extends readonly Result<unknown, infer E>[] ? E : never
  > {
    const values: unknown[] = [];
    for (const result of results) {
      if (result.isErr()) {
        return result as unknown as Result<
          { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
          T extends readonly Result<unknown, infer E>[] ? E : never
        >;
      }
      values.push(result.unwrap());
    }
    return Result.ok(
      values as { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
    );
  }

  /**
   * Creates a `Result` from a nullable value.
   *
   * Returns `Ok` if the value is non-null/non-undefined, or `Err` with the provided error.
   *
   * @typeParam T - The type of the value.
   * @typeParam E - The type of the error.
   * @param value - The value to check (may be `T | null | undefined`).
   * @param error - The error to use if the value is null/undefined.
   * @returns `Ok<T>` if value exists, `Err<E>` otherwise.
   *
   * @example
   * ```ts
   * const user = Result.fromNullable(localStorage.getItem("user"), "No user found");
   * // Result<string, string>
   * ```
   */
  static fromNullable<T, E>(value: T | null | undefined, error: E): Result<T, E> {
    if (value == null) {
      return Result.err(error);
    }
    return Result.ok(value);
  }

  /**
   * Creates a `Result` based on a predicate check.
   *
   * Returns `Ok` with the value if the predicate returns `true`, or `Err` with the provided error.
   *
   * @typeParam T - The type of the value.
   * @typeParam E - The type of the error.
   * @param value - The value to check.
   * @param predicate - A function that returns `true` if the value is valid.
   * @param error - The error to use if the predicate returns `false`.
   * @returns `Ok<T>` if predicate passes, `Err<E>` otherwise.
   *
   * @example
   * ```ts
   * const result = Result.fromPredicate(5, x => x > 0, "Must be positive");
   * // Ok(5)
   *
   * Result.fromPredicate(-1, x => x > 0, "Must be positive");
   * // Err("Must be positive")
   * ```
   */
  static fromPredicate<T, E>(value: T, predicate: (value: T) => boolean, error: E): Result<T, E> {
    if (predicate(value)) {
      return Result.ok(value);
    }
    return Result.err(error);
  }

  /**
   * Extracts the success value, or throws if this is an {@link Err}.
   *
   * Only use this when you are certain the result is `Ok`, or when a thrown
   * error is an acceptable failure mode (e.g. in tests or top-level guards).
   *
   * @throws {Error | E} If this result is an {@link Err}, throws the original error if it's an `Error` instance.
   * @returns The wrapped success value.
   *
   * @example
   * ```ts
   * Result.ok(42).unwrap();        // 42
   * Result.err("oops").unwrap();   // throws Error
   * ```
   */
  public abstract unwrap(): T;

  /**
   * Returns the success value, or `fallback` if this is an {@link Err}.
   *
   * @param fallback - The value to return in case of failure.
   * @returns The success value or `fallback`.
   *
   * @example
   * ```ts
   * Result.ok(42).unwrapOr(0);       // 42
   * Result.err("oops").unwrapOr(0);  // 0
   * ```
   */
  public abstract unwrapOr(fallback: T): T;

  /**
   * Returns the success value, or computes a fallback from the error using `fallbackFn`.
   *
   * Prefer this over {@link unwrapOr} when the fallback value is expensive to compute
   * or depends on the error.
   *
   * @param fallbackFn - A function receiving the error and returning a fallback value.
   * @returns The success value or the result of `fallbackFn`.
   *
   * @example
   * ```ts
   * Result.ok(42).unwrapOrElse(() => 0);                     // 42
   * Result.err("oops").unwrapOrElse(e => e.length);          // 4
   * ```
   */
  public abstract unwrapOrElse(fallbackFn: (error: E) => T): T;

  /**
   * Pattern matches on this result, executing the corresponding branch.
   *
   * This is the most expressive way to handle both cases exhaustively.
   * The `ok` and `err` branches can return different types `U` and `V`.
   *
   * @typeParam U - The return type of the `ok` branch.
   * @typeParam V - The return type of the `err` branch.
   * @param cases - An object with an `ok` branch and an `err` branch.
   * @returns The return value of whichever branch was executed (`U | V`).
   *
   * @example
   * ```ts
   * const message = result.match({
   *   ok: value => `Success: ${value}`,
   *   err: error => `Failed: ${error}`,
   * });
   * ```
   */
  public abstract match<U, V>(cases: { ok: (value: T) => U; err: (error: E) => V }): U | V;

  /**
   * Transforms the success value using `fn`, leaving errors untouched.
   *
   * @typeParam U - The type returned by `fn`.
   * @param fn - A function to apply to the success value.
   * @returns A new `Result` with the transformed value, or the original {@link Err}.
   *
   * @example
   * ```ts
   * Result.ok(2).map(n => n * 3);         // Ok(6)
   * Result.err("oops").map(n => n * 3);   // Err("oops")
   * ```
   */
  public abstract map<U>(fn: (value: T) => U): Result<U, E>;

  /**
   * Transforms the error value using `fn`, leaving successes untouched.
   *
   * Useful for normalising errors across different sources into a unified error type.
   *
   * @typeParam F - The type returned by `fn`.
   * @param fn - A function to apply to the error value.
   * @returns A new `Result` with the transformed error, or the original {@link Ok}.
   *
   * @example
   * ```ts
   * Result.err("not found").mapErr(e => new Error(e));  // Err(Error("not found"))
   * Result.ok(42).mapErr(e => new Error(e));            // Ok(42)
   * ```
   */
  public abstract mapErr<F>(fn: (error: E) => F): Result<T, F>;

  /**
   * Chains a result-returning function onto a success value, flattening the result.
   *
   * Unlike {@link map}, `fn` returns a `Result` itself — `flatMap` prevents nesting
   * (`Result<Result<U, E>, E>` becomes `Result<U, E>`).
   *
   * Also known as `andThen` in other libraries.
   *
   * @typeParam U - The success type of the `Result` returned by `fn`.
   * @param fn - A function that receives the success value and returns a new `Result`.
   * @returns The `Result` returned by `fn`, or the original {@link Err}.
   *
   * @example
   * ```ts
   * const parse = (s: string): Result<number, string> =>
   *   isNaN(Number(s)) ? Result.err("not a number") : Result.ok(Number(s));
   *
   * Result.ok("42").flatMap(parse);      // Ok(42)
   * Result.ok("abc").flatMap(parse);     // Err("not a number")
   * Result.err("oops").flatMap(parse);   // Err("oops")
   * ```
   */
  public abstract flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;

  /**
   * Alias for {@link flatMap}. Chains a result-returning function onto a success value.
   *
   * Named `andThen` to align with Rust's `Result::and_then` and other Result libraries.
   *
   * @typeParam U - The success type of the `Result` returned by `fn`.
   * @param fn - A function that receives the success value and returns a new `Result`.
   * @returns The `Result` returned by `fn`, or the original {@link Err}.   *
   * @example
   * ```ts
   * Result.ok(10).andThen(x => Result.ok(x * 2)); // Ok(20)
   * ```
   */
  public andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.flatMap(fn);
  }

  /**
   * Recovers from an error by applying `fn` to the error value.
   *
   * Unlike {@link unwrapOrElse} which returns a plain value, `orElse` returns a new `Result`.
   * This allows error recovery without breaking the Result chain.
   *
   * @typeParam F - The error type of the returned `Result`.
   * @param fn - A function that receives the error and returns a new `Result`.
   * @returns The original `Result` if `Ok`, or the result of `fn` if `Err`.
   *
   * @example
   * ```ts
   * const cached = getCachedUser(id); // Result<User, string>
   * const user = cached.orElse(() => fetchUserFromDb(id));
   * // Still Result<User, string> — chain continues
   * ```
   */
  public abstract orElse<U>(fn: (error: E) => Result<U, E>): Result<U, E>;

  /**
   * Runs a side effect on the success value without transforming the result.
   *
   * Useful for logging or debugging in a chain without breaking it.
   * Has no effect on {@link Err} results.
   *
   * @param fn - A function to call with the success value.
   * @returns The same `Result`, unchanged.
   *
   * @example
   * ```ts
   * Result.ok(42)
   *   .tap(v => console.log("Got:", v))  // logs "Got: 42"
   *   .map(v => v * 2);                  // Ok(84)
   *
   * Result.err("oops")
   *   .tap(v => console.log("Got:", v))  // does not log
   *   .map(v => v * 2);                  // Err("oops")
   * ```
   */
  public abstract tap(fn: (value: T) => void): Result<T, E>;

  /**
   * Runs a side effect on the error value without transforming the result.
   *
   * Useful for logging or reporting errors in a chain without breaking it.
   * Has no effect on {@link Ok} results.
   *
   * @param fn - A function to call with the error value.
   * @returns The same `Result`, unchanged.
   *
   * @example
   * ```ts
   * Result.err("oops")
   *   .tapErr(e => console.error("Error:", e))  // logs "Error: oops"
   *   .mapErr(e => e.toUpperCase());             // Err("OOPS")
   *
   * Result.ok(42)
   *   .tapErr(e => console.error("Error:", e))  // does not log
   *   .map(v => v * 2);                         // Ok(84)
   * ```
   */
  public abstract tapErr(fn: (error: E) => void): Result<T, E>;

  /**
   * Converts this result to a nullable value.
   *
   * Returns the success value if `Ok`, or `null` if `Err`.
   * Useful when interoperating with code that uses `null` to signal absence.
   *
   * @returns The success value, or `null`.
   *
   * @example
   * ```ts
   * Result.ok(42).toNullable();      // 42
   * Result.err("oops").toNullable(); // null
   * ```
   */
  public abstract toNullable(): T | null;

  /**
   * Checks if this result is `Ok` and the value satisfies the predicate.
   *
   * @param predicate - A function to test the success value.
   * @returns `true` if `Ok` and predicate returns `true`, `false` otherwise.
   *
   * @example
   * ```ts
   * Result.ok(10).isOkAnd(x => x > 5);  // true
   * Result.ok(3).isOkAnd(x => x > 5);   // false
   * Result.err("oops").isOkAnd(x => x > 5); // false
   * ```
   */
  public isOkAnd(predicate: (value: T) => boolean): boolean {
    return this.isOk() && predicate(this.unwrap());
  }

  /**
   * Checks if this result is `Err` and the error satisfies the predicate.
   *
   * @param predicate - A function to test the error value.
   * @returns `true` if `Err` and predicate returns `true`, `false` otherwise.
   *
   * @example
   * ```ts
   * Result.err("oops").isErrAnd(e => e.length > 3);  // true
   * Result.err("no").isErrAnd(e => e.length > 3);     // false
   * Result.ok(42).isErrAnd(e => true);                // false
   * ```
   */
  public isErrAnd(predicate: (error: E) => boolean): boolean {
    if (this.isErr()) {
      return predicate(this.error);
    }
    return false;
  }

  /**
   * Swaps the `Ok` and `Err` sides of this result.
   *
   * @returns `Err` containing the success value if `Ok`, or `Ok` containing the error if `Err`.
   *
   * @example
   * ```ts
   * Result.ok(42).flip();   // Err(42)
   * Result.err("oops").flip(); // Ok("oops")
   * ```
   */
  public abstract flip(): Result<E, T>;

  /**
   * Converts this result to a Promise.
   *
   * `Ok` values resolve the promise, `Err` values reject the promise.
   *
   * @returns A Promise that resolves with the success value or rejects with the error.
   *
   * @example
   * ```ts
   * await Result.ok(42).toPromise(); // 42
   *
   * try {
   *   await Result.err("oops").toPromise();
   * } catch (e) {
   *   // e === "oops"
   * }
   * ```
   */
  public toPromise(): Promise<T> {
    if (this.isOk()) {
      return Promise.resolve(this.unwrap());
    }
    return Promise.reject((this as unknown as Err<E>).error);
  }

  /**
   * Returns a human-readable string representation of this result.
   *
   * @returns A string like `Ok(value)` or `Err(error)`.
   *
   * @example
   * ```ts
   * Result.ok(42).toString();   // "Ok(42)"
   * Result.err("oops").toString(); // "Err(oops)"
   * ```
   */
  public abstract toString(): string;

  /**
   * Returns a JSON-serializable representation of this result.
   *
   * @returns An object with `ok` or `err` property.
   *
   * @example
   * ```ts
   * Result.ok(42).toJSON();   // { ok: 42 }
   * Result.err("oops").toJSON(); // { err: "oops" }
   * ```
   */
  public abstract toJSON(): { ok: T } | { err: E };
}

/**
 * Represents a successful `Result` containing a value of type `T`.
 *
 * Do not construct directly — use {@link Result.ok}.
 *
 * @typeParam T - The type of the success value.
 */
export class Ok<T> extends Result<T, never> {
  /**
   * The success value.
   *
   * Only accessible after narrowing with {@link Result.isOk}:
   * ```ts
   * if (result.isOk()) {
   *   result.value; // T
   * }
   * ```
   */
  constructor(public readonly value: T) {
    super();
  }

  public unwrap(): T {
    return this.value;
  }

  public unwrapOr(_fallback: T): T {
    return this.value;
  }

  public unwrapOrElse(_fallbackFn: (error: never) => T): T {
    return this.value;
  }

  public match<U, V>(cases: { ok: (value: T) => U; err: (error: never) => V }): U {
    return cases.ok(this.value);
  }

  public map<U>(fn: (value: T) => U): Result<U, never> {
    return Result.ok(fn(this.value));
  }

  public mapErr<F>(_fn: (error: never) => F): Result<T, F> {
    return this;
  }

  public flatMap<U>(fn: (value: T) => Result<U, never>): Result<U, never> {
    return fn(this.value);
  }

  public orElse<U>(_fn: (error: never) => Result<U, never>): Result<U, never> {
    return this as unknown as Result<U, never>;
  }

  public tap(fn: (value: T) => void): Result<T, never> {
    fn(this.value);
    return this;
  }

  public tapErr(_fn: (error: never) => void): Result<T, never> {
    return this;
  }

  public toNullable(): T {
    return this.value;
  }

  public flip(): Result<never, T> {
    return Result.err(this.value);
  }

  public toString(): string {
    return `Ok(${formatValue(this.value)})`;
  }

  public toJSON(): { ok: T } {
    return { ok: this.value };
  }
}

/**
 * Represents a failed `Result` containing an error of type `E`.
 *
 * Do not construct directly — use {@link Result.err}.
 *
 * @typeParam E - The type of the error value.
 */
export class Err<E> extends Result<never, E> {
  /**
   * The error value.
   *
   * Only accessible after narrowing with {@link Result.isErr}:
   * ```ts
   * if (result.isErr()) {
   *   result.error; // E
   * }
   * ```
   */
  constructor(public readonly error: E) {
    super();
  }

  /** @throws {E | Error} Throws the original error if it's an Error instance, otherwise wraps it. */
  public unwrap(): never {
    if (this.error instanceof Error) {
      throw this.error;
    }
    throw new Error(`Tried to unwrap an Err value: ${formatValue(this.error)}`);
  }

  public unwrapOr<T>(fallback: T): T {
    return fallback;
  }

  public unwrapOrElse<T>(fallbackFn: (error: E) => T): T {
    return fallbackFn(this.error);
  }

  public match<U, V>(cases: { ok: (value: never) => U; err: (error: E) => V }): V {
    return cases.err(this.error);
  }

  public map<U>(_fn: (value: never) => U): Result<U, E> {
    return this;
  }

  public mapErr<F>(fn: (error: E) => F): Result<never, F> {
    return Result.err(fn(this.error));
  }

  public flatMap<U>(_fn: (value: never) => Result<U, E>): Result<U, E> {
    return this;
  }

  public orElse<U>(fn: (error: E) => Result<U, E>): Result<U, E> {
    return fn(this.error);
  }

  public tap(_fn: (value: never) => void): Result<never, E> {
    return this;
  }

  public tapErr(fn: (error: E) => void): Result<never, E> {
    fn(this.error);
    return this;
  }

  public toNullable(): null {
    return null;
  }

  public flip(): Result<E, never> {
    return Result.ok(this.error);
  }

  public toString(): string {
    return `Err(${formatValue(this.error)})`;
  }

  public toJSON(): { err: E } {
    return { err: this.error };
  }
}

/**
 * Helper to format values for string representation.
 */
function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "function") return "Function";
  if (value instanceof Error) return `Error: ${value.message}`;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
