# ts-result

A tiny TypeScript Result type for explicit error handling without exceptions. Inspired by Rust's `Result` type.

[![npm version](https://badge.fury.io/js/@punpun-dev%2fts-result.svg)](https://www.npmjs.com/package/@punpun-dev/ts-result)

## Installation

```bash
npm install @punpun-dev/ts-result
# or
pnpm add @punpun-dev/ts-result
# or
yarn add @punpun-dev/ts-result
```

## Usage

```typescript
import { ok, fail, isOk, unwrap, map, match } from "@punpun-dev/ts-result";

// Create results
const success = ok(42);
const failure = fail("Something went wrong");

// Check result type
if (isOk(success)) {
  console.log(success.value); // 42
}

// Pattern matching
const message = match(result, {
  ok: (value) => `Success: ${value}`,
  fail: (error) => `Error: ${error}`,
});

// Transform values
const doubled = map(ok(21), (x) => x * 2); // ok(42)

// Unwrap safely
const value = unwrapOr(ok(10), 0); // 10
const fallback = unwrapOr(fail("err"), 0); // 0
```

## API

### Constructors

- **`ok<T>(value: T): Success<T>`** - Creates a success result
- **`fail<E = string>(error: E): Failure<E>`** - Creates a failure result (error can be any type)

### Type Guards

- **`isOk<T, E>(result: Result<T, E>): result is Success<T>`** - Checks if result is success
- **`isFail<T, E>(result: Result<T, E>): result is Failure<E>`** - Checks if result is failure

### Unwrap

- **`unwrap<T, E>(result: Result<T, E>): T`** - Extracts value or throws (preserves original error)
- **`unwrapOr<T, E>(result: Result<T, E>, fallback: T): T`** - Extracts value or returns fallback
- **`unwrapOrElse<T, E>(result: Result<T, E>, fn: (error: E) => T): T`** - Extracts value or computes fallback

### Transform

- **`map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>`** - Transforms success value
- **`mapError<T, E, E2>(result: Result<T, E>, fn: (error: E) => E2): Result<T, E2>`** - Transforms error value
- **`flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E>`** - Chains operations

### Pattern Matching

- **`match<T, U, E>(result: Result<T, E>, handlers: { ok: (value: T) => U; fail: (error: E) => U }): U`** - Exhaustive matching

### Combine

- **`all<T, E>(results: Result<T, E>[]): Result<T[], E>`** - Combines multiple results

### Try/Catch

- **`tryCatch<T, E>(fn: () => T): Result<T, E>`** - Wraps throwing functions (preserves error type)
- **`tryCatchAsync<T, E>(fn: () => Promise<T>): Promise<Result<T, E>>`** - Wraps async functions (preserves error type)

## Types

```typescript
type Success<T> = {
  success: true;
  value: T;
};

type Failure<E = string> = {
  success: false;
  error: E;
};

type Result<T, E = string> = Success<T> | Failure<E>;
```

## Generic Error Types

By default, errors are `string`. You can use custom error types for richer error handling:

```typescript
import { ok, fail, tryCatch, match, mapError } from "@punpun-dev/ts-result";

// Custom error type
class ValidationError {
  constructor(public field: string, public message: string) {}
}

// Create result with custom error
const result = fail(new ValidationError("email", "Invalid format"));
// result type: Failure<ValidationError>

// tryCatch preserves Error objects
const parsed = tryCatch(() => JSON.parse("invalid"));
// parsed.error instanceof Error === true

// Transform errors with mapError
const transformed = mapError(parsed, (err) =>
  err instanceof Error ? { code: "PARSE_ERROR", message: err.message } : { code: "UNKNOWN", message: "Unknown" }
);

// Pattern matching with custom error
const message = match(transformed, {
  ok: (value) => `Success: ${JSON.stringify(value)}`,
  fail: (error) => `Error ${error.code}: ${error.message}`,
});
```

## License

MIT
