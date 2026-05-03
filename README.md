# ts-result

A tiny TypeScript Result type for explicit error handling without exceptions. Inspired by Rust's `Result<T, E>`.

[![npm version](https://badge.fury.io/js/@punpun-dev%2fts-result.svg)](https://www.npmjs.com/package/@punpun-dev/ts-result)

## Philosophy

### Why Result Types?

Exceptions in JavaScript/TypeScript are implicit, untyped, and easily forgotten. A function can throw without its type signature indicating it, making error handling opt-in rather than explicit.

Result types flip this: errors become part of the return type, forcing callers to acknowledge them at compile time.

### The Problems with Exceptions

1. **Invisible in types** — `fetchUser(id)` tells you nothing about what could go wrong
2. **Async/await breaks try/catch** — Promises that reject require separate handling from sync errors
3. **Forgotten handling** — It's easy to forget a `try/catch`, leading to uncaught exceptions in production
4. **No error shape guarantee** — Thrown values can be anything: strings, Error objects, or random values

### How Result Helps

```typescript
// With exceptions — easy to forget, invisible in types
function getUser(id: string) {
  const user = db.find(id);
  if (!user) throw new Error("Not found");
  return user;
}

// With Result — explicit in type, must be handled
function getUser(id: string): Result<User, AppError> {
  const user = db.find(id);
  if (!user) return Result.err({ kind: "not_found", resource: "user" });
  return Result.ok(user);
}
```

### Core Principles

1. **Explicit over implicit** — Errors are part of the return type
2. **Type-safe errors** — Use custom error types (not just `Error` or `string`)
3. **Composable** — Chain operations with `map`, `flatMap`, and `tap` without nesting try/catch blocks
4. **Exhaustive matching** — `match()` forces you to handle both success and failure cases

### When to Use Result

- **Use Result for expected errors** — validation failures, not found, unauthorized (these are part of normal program flow)
- **Use exceptions for unexpected errors** — bugs, impossible states, programmer errors (things that shouldn't happen)

### Inspiration

This library is inspired by Rust's `Result<T, E>` type, which makes error handling a first-class part of the type system rather than an afterthought. The API is object-oriented: `Result` is an abstract base class with two concrete subclasses, `Ok` and `Err`, and all operations are methods you chain directly on the result instance.

## Usage

```typescript
import { Result } from "@punpun-dev/ts-result";

// Create results
const success = Result.ok(42);
const failure = Result.err("Something went wrong");

// Check result type with type-narrowing methods
if (success.isOk()) {
  console.log(success.value); // 42
}

// Pattern matching — branches can return different types
const message = failure.match({
  ok: (value) => `Success: ${value}`,
  err: (error) => `Error: ${error}`,
});

// Chain operations fluently
const doubled = Result.ok(21)
  .map((x) => x * 2)              // Ok(42)
  .flatMap((x) => Result.ok(x + 1)) // Ok(43)
  .unwrapOr(0);                    // 43

// Wrap throwing code
// Sync: Result.try
const syncResult = Result.try(() => JSON.parse("{\"a\":1}"));

// Async: Result.tryAsync
const asyncResult = await Result.tryAsync(async () => {
  const res = await fetch("/api/user");
  if (!res.ok) throw new Error("Request failed");
  return res.json();
});
```

## Installation

```bash
npm install @punpun-dev/ts-result
# or
pnpm add @punpun-dev/ts-result
# or
yarn add @punpun-dev/ts-result
```

## API

### `Result<T, E>` (abstract base class)

#### Instance Methods

| Method | Description |
|--------|-------------|
| `isOk(): this is Ok<T>` | Narrow to `Ok` (type guard) |
| `isErr(): this is Err<E>` | Narrow to `Err` (type guard) |
| `isOkAnd(predicate: (value: T) => boolean): boolean` | Check if `Ok` and predicate passes |
| `isErrAnd(predicate: (error: E) => boolean): boolean` | Check if `Err` and predicate passes |
| `unwrap(): T` | Returns value or throws if `Err` |
| `unwrapOr(fallback: T): T` | Returns value or `fallback` if `Err` |
| `unwrapOrElse(fn: (error: E) => T): T` | Returns value or computes fallback from error |
| `match<U, V>(cases): U \| V` | Exhaustive match with `ok` and `err` branches (can return different types) |
| `map<U>(fn: (value: T) => U): Result<U, E>` | Transform the success value |
| `mapErr<F>(fn: (error: E) => F): Result<T, F>` | Transform the error value |
| `flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>` | Chain result-returning functions (no nesting) |
| `andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>` | Alias for `flatMap` (Rust-style) |
| `orElse<U>(fn: (error: E) => Result<U, E>): Result<U, E>` | Recover from error with a new Result |
| `tap(fn: (value: T) => void): this` | Side-effect on `Ok`, returns same instance |
| `tapErr(fn: (error: E) => void): this` | Side-effect on `Err`, returns same instance |
| `toNullable(): T \| null` | Returns value or `null` |
| `flip(): Result<E, T>` | Swap `Ok` and `Err` |
| `toPromise(): Promise<T>` | Convert to Promise (Ok → resolve, Err → reject) |
| `toString(): string` | Human-readable string representation |
| `toJSON(): { ok: T } \| { err: E }` | JSON-serializable representation |

#### Static Methods

| Method | Description |
|--------|-------------|
| `Result.ok<T>(value: T): Ok<T>` | Creates a successful result |
| `Result.err<E>(error: E): Err<E>` | Creates a failed result |
| `Result.try<T>(fn: () => T): Result<T, unknown>` | Wraps sync throwing code |
| `Result.tryAsync<T>(fn: () => T \| Promise<T>): Promise<Result<T, unknown>>` | Wraps sync/async throwing code |
| `Result.all<T>(results: Result[]): Result<T[], E>` | Combines multiple Results (fail-fast) |
| `Result.fromNullable<T, E>(value: T \| null \| undefined, error: E): Result<T, E>` | Convert nullable to Result |
| `Result.fromPredicate<T, E>(value: T, predicate: (value: T) => boolean, error: E): Result<T, E>` | Create Result from predicate check |

### `Ok<T>` and `Err<E>`

These are the concrete subclasses of `Result`. You typically don't construct them directly — use `Result.ok()` and `Result.err()`.

- `Ok<T>` exposes a `value: T` property (access after narrowing with `isOk()`)
- `Err<E>` exposes an `error: E` property (access after narrowing with `isErr()`)

## Examples

### Basic Usage

```typescript
import { Result } from "@punpun-dev/ts-result";

// Creating results
const success = Result.ok(42);
const failure = Result.err("Something went wrong");

// Type narrowing
if (success.isOk()) {
  console.log(success.value); // 42
}

// Pattern matching
const message = failure.match({
  ok: (value) => `Success: ${value}`,
  err: (error) => `Error: ${error}`,
});
```

### Wrapping Throwing Code

```typescript
import { Result } from "@punpun-dev/ts-result";

// Sync code
const parseResult = Result.try(() => JSON.parse("{\"a\":1}"));
// Result<unknown, unknown>

// Async code
const fetchResult = await Result.tryAsync(async () => {
  const res = await fetch("/api/user");
  if (!res.ok) throw new Error("Request failed");
  return res.json();
});
// Promise<Result<User, unknown>>
```

### Combining Results

```typescript
import { Result } from "@punpun-dev/ts-result";

const a = Result.ok(1);
const b = Result.ok(2);
const c = Result.ok(3);

const combined = Result.all([a, b, c]);
// Result<[1, 2, 3], never>

// With an error (fail-fast)
const d = Result.err("oops");
const withError = Result.all([a, d, c]);
// Result<never, string> — returns first error
```

### Error Recovery

```typescript
import { Result } from "@punpun-dev/ts-result";

const cached = getCachedUser(id); // Result<User, string>

// Recover from error without breaking chain
const user = cached.orElse(() => fetchUserFromDb(id));
// Still Result<User, string>
```

### Nullable Interop

```typescript
import { Result } from "@punpun-dev/ts-result";

const user = Result.fromNullable(
  localStorage.getItem("user"),
  "No user found"
);
// Result<string, string>

if (user.isOk()) {
  console.log(user.value);
} else {
  console.log(user.error); // "No user found"
}
```

### Validation with Predicate

```typescript
import { Result } from "@punpun-dev/ts-result";

function validateAge(age: number): Result<number, string> {
  return Result.fromPredicate(
    age,
    (a) => a >= 0 && a <= 150,
    "Invalid age"
  );
}

validateAge(25); // Ok(25)
validateAge(-5); // Err("Invalid age")
```

### Flip Result

```typescript
import { Result } from "@punpun-dev/ts-result";

const exists = checkFileExists(path);

if (exists.isOk()) {
  // File exists, proceed
}

const notExists = exists.flip();
// Now Ok means file doesn't exist
```

### Promise Interop

```typescript
import { Result } from "@punpun-dev/ts-result";

const result = Result.ok(42);

// Convert to Promise
try {
  const value = await result.toPromise();
  console.log(value); // 42
} catch (e) {
  // Won't happen for Ok
}

const errResult = Result.err("oops");
await errResult.toPromise(); // Throws "oops"
```

### Debugging

```typescript
import { Result } from "@punpun-dev/ts-result";

console.log(Result.ok(42).toString()); // "Ok(42)"
console.log(Result.err("oops").toString()); // "Err(oops)"

// JSON serialization
JSON.stringify(Result.ok({ a: 1 }).toJSON()); // '{"ok":{"a":1}}'
JSON.stringify(Result.err("fail").toJSON()); // '{"err":"fail"}'
```

## Fullstack Examples

### Shared Types (frontend + backend)

```typescript
import { Result } from "@punpun-dev/ts-result";

export type AppError =
  | { kind: "not_found"; resource: string }
  | { kind: "unauthorized" }
  | { kind: "validation"; fields: Record<string, string> }
  | { kind: "internal"; message: string };

export type ApiResponse<T> = Result<T, AppError>;
```

### Backend: Express Route Handler

```typescript
// server/routes/user.ts
import { Result } from "@punpun-dev/ts-result";
import express from "express";

const router = express.Router();

function findUserById(id: string): Result<User | null, Error> {
  return Result.try(() => db.users.findById(id));
}

function updateUserEmail(user: User, email: string): Result<User, AppError> {
  if (!email.includes("@")) {
    return Result.err({ kind: "validation", fields: { email: "Invalid email format" } });
  }
  return Result.ok({ ...user, email });
}

router.patch("/users/:id/email", async (req, res) => {
  const result = await Result.tryAsync(async () => {
    const { id } = req.params;
    const { email } = req.body;

    const userResult = findUserById(id).flatMap((user) =>
      user ? Result.ok(user) : Result.err({ kind: "not_found", resource: "user" } as const)
    );

    return userResult.flatMap((user) => updateUserEmail(user, email));
  });

  result.match({
    ok: (user) => res.json({ success: true, data: user }),
    err: (error) => {
      switch (error.kind) {
        case "not_found":
          res.status(404).json({ error: "User not found" });
          break;
        case "validation":
          res.status(400).json({ error: "Validation failed", fields: error.fields });
          break;
        default:
          res.status(500).json({ error: "Internal server error" });
      }
    },
  });
});
```

### Backend: Database Transaction

```typescript
// server/services/order.ts
import { Result } from "@punpun-dev/ts-result";

export async function createOrder(
  userId: string,
  items: CartItem[]
): Promise<Result<Order, AppError>> {
  // Validate all items — collect first error if any
  for (const item of items) {
    if (item.stock <= 0) {
      return Result.err({
        kind: "validation",
        fields: { [item.id]: "Out of stock" },
      });
    }
  }

  // Run async database transaction
  const result = await Result.tryAsync(async () => {
    return db.transaction(async (tx) => {
      const order = await tx.orders.create({ userId, status: "pending" });
      await tx.orderItems.createMany(
        items.map((item) => ({ orderId: order.id, ...item }))
      );
      return order;
    });
  });

  // Map unexpected errors to our AppError type
  return result.mapErr((err): AppError => ({
    kind: "internal",
    message: err instanceof Error ? err.message : String(err),
  }));
}
```

### Frontend: Type-Safe API Client

```typescript
// client/api/client.ts
import { Result } from "@punpun-dev/ts-result";
import type { ApiResponse } from "shared/types";

type FetchError = { status: number; message: string };

async function apiFetch<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const result = await Result.tryAsync(async () => {
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });

    if (!res.ok) {
      throw { status: res.status, message: res.statusText };
    }

    return res.json() as Promise<T>;
  });

  // Map fetch errors to our AppError type
  return result.mapErr((err): AppError => {
    if (typeof err === "object" && err !== null && "status" in err) {
      if (err.status === 401) return { kind: "unauthorized" };
      if (err.status === 404) return { kind: "not_found", resource: "resource" };
    }
    return { kind: "internal", message: String(err) };
  });
}

// Usage in a React component
async function loadUserProfile(userId: string) {
  const result = await apiFetch<User>(`/api/users/${userId}`);

  return result.match({
    ok: (user) => ({ type: "success" as const, user }),
    err: (error) => ({
      type: "error" as const,
      message:
        error.kind === "not_found"
          ? "User not found"
          : error.kind === "unauthorized"
          ? "Please log in"
          : "Something went wrong",
    }),
  });
}
```

### Frontend: Form Validation

```typescript
// client/components/SignupForm.tsx
import { Result } from "@punpun-dev/ts-result";

function validateSignup(data: {
  email: string;
  password: string;
  confirmPassword: string;
}): Result<typeof data, string> {
  if (!data.email.includes("@")) return Result.err("Invalid email");
  if (data.password.length < 8) return Result.err("Password must be at least 8 characters");
  if (data.password !== data.confirmPassword) return Result.err("Passwords do not match");
  return Result.ok(data);
}

// In your form submit handler
function handleSubmit(e: FormEvent) {
  e.preventDefault();
  const formData = getFormData();

  const validation = validateSignup(formData);

  validation.match({
    ok: (data) => submitToApi(data),
    err: (error) => setError(error), // Show the error message
  });
}
```

## Generic Error Types

By default, errors are `string`. You can use custom error types for richer error handling:

```typescript
import { Result } from "@punpun-dev/ts-result";

// Custom error class
class ValidationError {
  constructor(public field: string, public message: string) {}
}

// Create result with custom error
const result = Result.err(new ValidationError("email", "Invalid format"));
// result type: Result<never, ValidationError>

// Result.try preserves thrown error types
const parsed = Result.try(() => JSON.parse("invalid"));
// parsed.error is `unknown` — narrow as needed

// Transform errors with mapErr
const transformed = parsed.mapErr((err) =>
  err instanceof Error
    ? { code: "PARSE_ERROR", message: err.message }
    : { code: "UNKNOWN", message: "Unknown" }
);

// Pattern matching with custom error
const message = transformed.match({
  ok: (value) => `Success: ${JSON.stringify(value)}`,
  err: (error) => `Error ${error.code}: ${error.message}`,
});
```

## License

MIT
