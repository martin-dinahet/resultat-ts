import { describe, expect, it } from "vitest";
import {
  all,
  type Failure,
  fail,
  flatMap,
  isFail,
  isOk,
  map,
  match,
  ok,
  type Result,
  tryCatch,
  tryCatchAsync,
  unwrap,
  unwrapOr,
  unwrapOrElse,
} from "../src/index.js";

describe("ok", () => {
  it("creates a success result", () => {
    const result = ok(42);
    expect(result.success).toBe(true);
    expect(result.value).toBe(42);
  });
});

describe("fail", () => {
  it("creates a failure result", () => {
    const result = fail("error");
    expect(result.success).toBe(false);
    expect(result.error).toBe("error");
  });
});

describe("isOk", () => {
  it("returns true for success", () => {
    expect(isOk(ok(1))).toBe(true);
  });
  it("returns false for failure", () => {
    expect(isOk(fail("err"))).toBe(false);
  });
});

describe("isFail", () => {
  it("returns true for failure", () => {
    expect(isFail(fail("err"))).toBe(true);
  });
  it("returns false for success", () => {
    expect(isFail(ok(1))).toBe(false);
  });
});

describe("unwrap", () => {
  it("returns value for success", () => {
    expect(unwrap(ok(42))).toBe(42);
  });
  it("throws for failure", () => {
    expect(() => unwrap(fail("boom"))).toThrow("boom");
  });
});

describe("unwrapOr", () => {
  it("returns value for success", () => {
    expect(unwrapOr(ok(10), 0)).toBe(10);
  });
  it("returns fallback for failure", () => {
    expect(unwrapOr(fail("err"), 0)).toBe(0);
  });
});

describe("unwrapOrElse", () => {
  it("returns value for success", () => {
    expect(unwrapOrElse(ok(10), (e) => e.length)).toBe(10);
  });
  it("returns computed fallback for failure", () => {
    expect(unwrapOrElse(fail("404"), (e) => e.length)).toBe(3);
  });
});

describe("map", () => {
  it("transforms success value", () => {
    const result = map(ok(2), (x: number) => x * 2);
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe(4);
  });
  it("passes through failure unchanged", () => {
    const result = map(fail("err"), (_x: never) => 0);
    expect(result.success).toBe(false);
  });
});

describe("flatMap", () => {
  it("chains success results", () => {
    const parse = (s: string): ReturnType<typeof ok<number>> | Failure =>
      Number.isNaN(Number(s)) ? fail("NaN") : ok(Number(s));
    const result = flatMap(ok("42"), parse);
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe(42);
  });
  it("passes through failure", () => {
    const fn = (x: string) => ok(x);
    const result = flatMap(fail("err"), fn);
    expect(result.success).toBe(false);
  });
});

describe("match", () => {
  it("calls ok handler for success", () => {
    const result = match(ok(42), {
      ok: (v) => v * 2,
      fail: (_e) => 0,
    });
    expect(result).toBe(84);
  });
  it("calls fail handler for failure", () => {
    const result = match(fail("err"), {
      ok: (v) => v,
      fail: (e) => e.length,
    });
    expect(result).toBe(3);
  });
});

describe("all", () => {
  it("combines successful results", () => {
    const result = all([ok(1), ok(2), ok(3)] as Result<number>[]);
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toEqual([1, 2, 3]);
  });
  it("returns first failure", () => {
    const result = all([ok(1) as Result<number>, fail("err"), ok(3) as Result<number>]);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("err");
  });
});

describe("tryCatch", () => {
  it("returns success for valid function", () => {
    const result = tryCatch(() => JSON.parse('{"a":1}'));
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toEqual({ a: 1 });
  });
  it("returns failure for throwing function", () => {
    const result = tryCatch(() => JSON.parse("{invalid}"));
    expect(result.success).toBe(false);
  });
});

describe("tryCatchAsync", () => {
  it("returns success for resolved promise", async () => {
    const result = await tryCatchAsync(async () => 42);
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe(42);
  });
  it("returns failure for rejected promise", async () => {
    const result = await tryCatchAsync(async () => {
      throw new Error("async error");
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("async error");
  });
});
