# @punpun/tinyresult

A tiny TypeScript Result type for explicit error handling without exceptions. Inspired by Rust's `Result` type.

[![npm version](https://badge.fury.io/js/@punpun%2Ftinyresult.svg)](https://www.npmjs.com/package/@punpun/tinyresult)

## Installation

```bash
npm install @punpun/tinyresult
# or
pnpm add @punpun/tinyresult
# or
yarn add @punpun/tinyresult
```

## Usage

```typescript
import { ok, fail, isOk, unwrap, map, match } from "@punpun/tinyresult";

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
- **`fail(error: string): Failure`** - Creates a failure result

### Type Guards

- **`isOk<T>(result: Result<T>): result is Success<T>`** - Checks if result is success
- **`isFail<T>(result: Result<T>): result is Failure`** - Checks if result is failure

### Unwrap

- **`unwrap<T>(result: Result<T>): T`** - Extracts value or throws
- **`unwrapOr<T>(result: Result<T>, fallback: T): T`** - Extracts value or returns fallback
- **`unwrapOrElse<T>(result: Result<T>, fn: (error: string) => T): T`** - Extracts value or computes fallback

### Transform

- **`map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U>`** - Transforms success value
- **`flatMap<T, U>(result: Result<T>, fn: (value: T) => Result<U>): Result<U>`** - Chains operations

### Pattern Matching

- **`match<T, U>(result: Result<T>, handlers: { ok: (value: T) => U; fail: (error: string) => U }): U`** - Exhaustive matching

### Combine

- **`all<T>(results: Result<T>[]): Result<T[]>`** - Combines multiple results

### Try/Catch

- **`tryCatch<T>(fn: () => T): Result<T>`** - Wraps throwing functions
- **`tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T>>`** - Wraps async functions

## Types

```typescript
type Success<T> = {
  success: true;
  value: T;
};

type Failure = {
  success: false;
  error: string;
};

type Result<T> = Success<T> | Failure;
```

## License

MIT
