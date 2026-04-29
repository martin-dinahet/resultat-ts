import { describe, expect, it } from "vitest";
import * as Resultat from "../src/index.js";

describe("ok", () => {
  it("creates a success result", () => {
    const result = Resultat.ok(42);
    expect(result.success).toBe(true);
    expect(result.value).toBe(42);
  });
});

describe("fail", () => {
  it("creates a failure result", () => {
    const result = Resultat.fail("error");
    expect(result.success).toBe(false);
    expect(result.error).toBe("error");
  });
});

describe("isOk", () => {
  it("returns true for success", () => {
    expect(Resultat.isOk(Resultat.ok(1))).toBe(true);
  });
  it("returns false for failure", () => {
    expect(Resultat.isOk(Resultat.fail("err"))).toBe(false);
  });
});

describe("isFail", () => {
  it("returns true for failure", () => {
    expect(Resultat.isFail(Resultat.fail("err"))).toBe(true);
  });
  it("returns false for success", () => {
    expect(Resultat.isFail(Resultat.ok(1))).toBe(false);
  });
});

describe("unwrap", () => {
  it("returns value for success", () => {
    expect(Resultat.unwrap(Resultat.ok(42))).toBe(42);
  });
  it("throws for failure", () => {
    expect(() => Resultat.unwrap(Resultat.fail("boom"))).toThrow("boom");
  });
});

describe("unwrapOr", () => {
  it("returns value for success", () => {
    expect(Resultat.unwrapOr(Resultat.ok(10), 0)).toBe(10);
  });
  it("returns fallback for failure", () => {
    expect(Resultat.unwrapOr(Resultat.fail("err"), 0)).toBe(0);
  });
});

describe("unwrapOrElse", () => {
  it("returns value for success", () => {
    expect(Resultat.unwrapOrElse(Resultat.ok(10), (e) => e.length)).toBe(10);
  });
  it("returns computed fallback for failure", () => {
    expect(Resultat.unwrapOrElse(Resultat.fail("404"), (e) => e.length)).toBe(
      3,
    );
  });
});

describe("map", () => {
  it("transforms success value", () => {
    const result = Resultat.map(Resultat.ok(2), (x: number) => x * 2);
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe(4);
  });
  it("passes through failure unchanged", () => {
    const result = Resultat.map(Resultat.fail("err"), (_x: never) => 0);
    expect(result.success).toBe(false);
  });
});

describe("flatMap", () => {
  it("chains success results", () => {
    const parse = (
      s: string,
    ): ReturnType<typeof Resultat.ok<number>> | Resultat.Failure =>
      Number.isNaN(Number(s)) ? Resultat.fail("NaN") : Resultat.ok(Number(s));
    const result = Resultat.flatMap(Resultat.ok("42"), parse);
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe(42);
  });
  it("passes through failure", () => {
    const fn = (x: string) => Resultat.ok(x);
    const result = Resultat.flatMap(Resultat.fail("err"), fn);
    expect(result.success).toBe(false);
  });
});

describe("match", () => {
  it("calls ok handler for success", () => {
    const result = Resultat.match(Resultat.ok(42), {
      ok: (v) => v * 2,
      fail: (_e) => 0,
    });
    expect(result).toBe(84);
  });
  it("calls fail handler for failure", () => {
    const result = Resultat.match(Resultat.fail("err"), {
      ok: (v) => v,
      fail: (e) => e.length,
    });
    expect(result).toBe(3);
  });
});

describe("all", () => {
  it("combines successful results", () => {
    const result = Resultat.all([
      Resultat.ok(1),
      Resultat.ok(2),
      Resultat.ok(3),
    ] as Resultat.Result<number>[]);
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toEqual([1, 2, 3]);
  });
  it("returns first failure", () => {
    const result = Resultat.all([
      Resultat.ok(1) as Resultat.Result<number>,
      Resultat.fail("err"),
      Resultat.ok(3) as Resultat.Result<number>,
    ]);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("err");
  });
});

describe("tryCatch", () => {
  it("returns success for valid function", () => {
    const result = Resultat.tryCatch(() => JSON.parse('{"a":1}'));
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toEqual({ a: 1 });
  });
  it("returns failure for throwing function", () => {
    const result = Resultat.tryCatch(() => JSON.parse("{invalid}"));
    expect(result.success).toBe(false);
  });
});

describe("tryCatchAsync", () => {
  it("returns success for resolved promise", async () => {
    const result = await Resultat.tryCatchAsync(async () => 42);
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe(42);
  });
  it("returns failure for rejected promise", async () => {
    const result = await Resultat.tryCatchAsync<number, Error>(async () => {
      throw new Error("async error");
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      if (result.error instanceof Error)
        expect(result.error.message).toBe("async error");
    }
  });
});
