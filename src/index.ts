// Types

export { Fail } from "./fail";
// Combine
export { all } from "./helpers/all";
export { fail } from "./helpers/fail";
export { flatMap, flatMapMethod } from "./helpers/flat-map";
export { isFail, isFailMethod } from "./helpers/is-fail";
// Type guards
export { isOk, isOkMethod } from "./helpers/is-ok";
// Transform
export { map, mapMethod } from "./helpers/map";
export { mapError, mapErrorMethod } from "./helpers/map-error";
// Pattern matching
export { match, matchFailMethod, matchMethod } from "./helpers/match";
// Constructors
export { ok } from "./helpers/ok";
// Try/catch
export { tryCatch } from "./helpers/try-catch";
export { tryCatchAsync } from "./helpers/try-catch-async";
// Unwrap
export { unwrap, unwrapMethod } from "./helpers/unwrap";
export { unwrapOr, unwrapOrFailMethod, unwrapOrMethod } from "./helpers/unwrap-or";
export { unwrapOrElse, unwrapOrElseFailMethod } from "./helpers/unwrap-or-else";
// Classes
export { Ok } from "./ok";
export type { Failure } from "./types/failure";
export type { Result } from "./types/result";
export type { Success } from "./types/success";
