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

## Philosophy

### Why Result Types?

Exceptions in JavaScript/TypeScript are implicit, untyped, and easily forgotten. A function can throw without its type signature indicating it, making error handling opt-in rather than explicit.

Result types flip this: errors become part of the return type, forcing callers to acknowledge them at compile time.

### The Problems with Exceptions

1. **Invisible in types** - `fetchUser(id)` tells you nothing about what could go wrong
2. **Async/await breaks try/catch** - Promises that reject require separate handling from sync errors
3. **Forgotten handling** - It's easy to forget a `try/catch`, leading to uncaught exceptions in production
4. **No error shape guarantee** - Thrown values can be anything: strings, Error objects, or random values

### How Result Helps

```typescript
// With exceptions - easy to forget, invisible in types
function getUser(id: string) {
  const user = db.find(id);
  if (!user) throw new Error("Not found");
  return user;
}

// With Result - explicit in type, must be handled
function getUser(id: string): Result<User, AppError> {
  const user = db.find(id);
  if (!user) return fail({ kind: "not_found", resource: "user" });
  return ok(user);
}
```

### Core Principles

1. **Explicit over implicit** - Errors are part of the return type
2. **Type-safe errors** - Use custom error types (not just `Error` or `string`)
3. **Composable** - Chain operations with `map`, `flatMap`, and `all` without nesting try/catch blocks
4. **Exhaustive matching** - `match()` forces you to handle both success and failure cases

### When to Use Result

- **Use Result for expected errors** - validation failures, not found, unauthorized (these are part of normal program flow)
- **Use exceptions for unexpected errors** - bugs, impossible states, programmer errors (things that shouldn't happen)

### Inspiration

This library is inspired by Rust's `Result<T, E>` type, which makes error handling a first-class part of the type system rather than an afterthought.

## Fullstack Examples

### Shared Types (frontend + backend)

```typescript
// shared/types.ts
import type { Result } from "@punpun-dev/ts-result";

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
import { ok, fail, flatMap, map, match, tryCatch } from "@punpun-dev/ts-result";
import express from "express";

const router = express.Router();

// Simulate database operations that return Results
function findUserById(id: string): Result<User | null, Error> {
  return tryCatch(() => db.users.findById(id));
}

function updateUserEmail(user: User, email: string): Result<User, AppError> {
  if (!email.includes("@")) {
    return fail({ kind: "validation", fields: { email: "Invalid email format" } });
  }
  return ok({ ...user, email });
}

router.patch("/users/:id/email", async (req, res) => {
  const result = await tryCatchAsync(async () => {
    const { id } = req.params;
    const { email } = req.body;

    // Chain operations with flatMap
    const updateResult = flatMap(
      flatMap(findUserById(id), (user) =>
        user ? ok(user) : fail({ kind: "not_found", resource: "user" })
      ),
      (user) => updateUserEmail(user, email)
    );

    return match(updateResult, {
      ok: (user) => res.json({ success: true, data: user }),
      fail: (error) => {
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

  if (!result.success) {
    res.status(500).json({ error: "Unexpected error" });
  }
});
```

### Backend: Database Query with Transaction

```typescript
// server/services/order.ts
import { all, fail, mapError, ok, tryCatchAsync } from "@punpun-dev/ts-result";

export async function createOrder(
  userId: string,
  items: CartItem[]
): Promise<Result<Order, AppError>> {
  // Validate all items first
  const itemValidation = all(
    items.map((item) =>
      item.stock > 0
        ? ok(item)
        : fail<CartItem, AppError>({
            kind: "validation",
            fields: { [item.id]: "Out of stock" },
          })
    )
  );

  // If validation failed, return early
  if (!itemValidation.success) {
    return itemValidation;
  }

  // Run async database transaction
  const result = await tryCatchAsync(async () => {
    const order = await db.transaction(async (tx) => {
      const created = await tx.orders.create({ userId, status: "pending" });
      await tx.orderItems.createMany(
        itemValidation.value.map((item) => ({ orderId: created.id, ...item }))
      );
      return created;
    });
    return ok(order);
  });

  // Map unexpected errors to our AppError type
  return mapError(result, (err): AppError => ({
    kind: "internal",
    message: err instanceof Error ? err.message : String(err),
  }));
}
```

### Frontend: Type-Safe API Client

```typescript
// client/api/client.ts
import { fail, map, mapError, match, tryCatchAsync } from "@punpun-dev/ts-result";
import type { ApiResponse } from "shared/types";

type FetchError = { status: number; message: string };

async function apiFetch<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const result = await tryCatchAsync(async () => {
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
  return mapError(result, (err): AppError => {
    if (typeof err === "object" && "status" in err) {
      if (err.status === 401) return { kind: "unauthorized" };
      if (err.status === 404) return { kind: "not_found", resource: "resource" };
    }
    return { kind: "internal", message: String(err) };
  });
}

// Usage in a React component
async function loadUserProfile(userId: string) {
  const result = await apiFetch<User>(`/api/users/${userId}`);

  return match(result, {
    ok: (user) => ({ type: "success" as const, user }),
    fail: (error) => ({
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
import { all, fail, map, ok } from "@punpun-dev/ts-result";

function validateSignup(data: {
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const emailResult = data.email.includes("@")
    ? ok(data.email)
    : fail("Invalid email");

  const passwordResult =
    data.password.length >= 8
      ? ok(data.password)
      : fail("Password must be at least 8 characters");

  const confirmResult =
    data.password === data.confirmPassword
      ? ok(data.confirmPassword)
      : fail("Passwords do not match");

  // Combine all validations - fails fast on first error
  return map(all([emailResult, passwordResult, confirmResult]), () => data);
}

// In your form submit handler
function handleSubmit(e: FormEvent) {
  e.preventDefault();
  const formData = getFormData();

  const validation = validateSignup(formData);

  if (!validation.success) {
    setError(validation.error); // Show the error message
    return;
  }

  // Safe to use validated data
  submitToApi(validation.value);
}
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
