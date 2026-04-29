import { beforeEach, describe, expect, it, vi } from "vitest";
import { Err, Ok, Result } from "../src/index.js";

describe("Result (OOP implementation)", () => {
  describe("static factories", () => {
    it("Result.ok creates Ok instance", () => {
      const result = Result.ok(42);
      expect(result).toBeInstanceOf(Ok);
      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
    });

    it("Result.err creates Err instance", () => {
      const result = Result.err("error");
      expect(result).toBeInstanceOf(Err);
      expect(result.isOk()).toBe(false);
      expect(result.isErr()).toBe(true);
    });
  });

  describe("Result.handle (async error wrapper)", () => {
    it("wraps sync success value", async () => {
      const result = await Result.handle(() => 42);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.value).toBe(42);
    });

    it("wraps sync thrown error", async () => {
      const result = await Result.handle(() => {
        throw new Error("oops");
      });
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBeInstanceOf(Error);
    });

    it("wraps async success value", async () => {
      const result = await Result.handle(async () => Promise.resolve(42));
      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.value).toBe(42);
    });

    it("wraps async rejected promise", async () => {
      const result = await Result.handle(async () => Promise.reject("oops"));
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBe("oops");
    });
  });

  describe("Ok class", () => {
    let ok: Ok<number>;

    beforeEach(() => {
      ok = Result.ok(42);
    });

    it("unwrap returns the success value", () => {
      expect(ok.unwrap()).toBe(42);
    });

    it("unwrapOr returns value, ignores fallback", () => {
      expect(ok.unwrapOr(0)).toBe(42);
    });

    it("unwrapOrElse returns value, does not call fallbackFn", () => {
      const fallbackFn = vi.fn();
      expect(ok.unwrapOrElse(fallbackFn)).toBe(42);
      expect(fallbackFn).not.toHaveBeenCalled();
    });

    it("match calls ok branch with value", () => {
      const result = ok.match({
        ok: (v) => v * 2,
        err: () => 0,
      });
      expect(result).toBe(84);
    });

    it("map transforms the success value", () => {
      const mapped = ok.map((v) => v * 2);
      expect(mapped.isOk()).toBe(true);
      if (mapped.isOk()) expect(mapped.value).toBe(84);
    });

    it("mapErr returns same Ok, ignores error mapper", () => {
      const mapped = ok.mapErr((e) => new Error(String(e)));
      expect(mapped).toBe(ok);
    });

    it("flatMap chains result-returning functions without nesting", () => {
      const flatMapped = ok.flatMap((v) => Result.ok(v + 1));
      expect(flatMapped.isOk()).toBe(true);
      if (flatMapped.isOk()) expect(flatMapped.value).toBe(43);
    });

    it("tap calls function with value, returns same Ok", () => {
      const fn = vi.fn();
      const returned = ok.tap(fn);
      expect(fn).toHaveBeenCalledWith(42);
      expect(returned).toBe(ok);
    });

    it("tapErr does not call function, returns same Ok", () => {
      const fn = vi.fn();
      const returned = ok.tapErr(fn);
      expect(fn).not.toHaveBeenCalled();
      expect(returned).toBe(ok);
    });

    it("toNullable returns the success value", () => {
      expect(ok.toNullable()).toBe(42);
    });
  });

  describe("Err class", () => {
    let err: Err<string>;

    beforeEach(() => {
      err = Result.err("oops");
    });

    it("unwrap throws Error with error message", () => {
      expect(() => err.unwrap()).toThrow(/Tried to unwrap an Err value: oops/);
    });

    it("unwrapOr returns the fallback value", () => {
      expect(err.unwrapOr(42)).toBe(42);
    });

    it("unwrapOrElse calls fallbackFn with error, returns its result", () => {
      const fallbackFn = vi.fn((e: string) => e.length);
      expect(err.unwrapOrElse(fallbackFn)).toBe(4);
      expect(fallbackFn).toHaveBeenCalledWith("oops");
    });

    it("match calls err branch with error", () => {
      const result = err.match({
        ok: () => "success",
        err: (e) => `error: ${e}`,
      });
      expect(result).toBe("error: oops");
    });

    it("map returns same Err, ignores value mapper", () => {
      const mapped = err.map((v) => v * 2);
      expect(mapped).toBe(err);
    });

    it("mapErr transforms error, returns new Err", () => {
      const mapped = err.mapErr((e) => new Error(e));
      expect(mapped.isErr()).toBe(true);
      if (mapped.isErr()) expect(mapped.error).toBeInstanceOf(Error);
    });

    it("flatMap returns same Err, ignores function", () => {
      const flatMapped = err.flatMap((v) => Result.ok(v * 2));
      expect(flatMapped).toBe(err);
    });

    it("tap does not call function, returns same Err", () => {
      const fn = vi.fn();
      const returned = err.tap(fn);
      expect(fn).not.toHaveBeenCalled();
      expect(returned).toBe(err);
    });

    it("tapErr calls function with error, returns same Err", () => {
      const fn = vi.fn();
      const returned = err.tapErr(fn);
      expect(fn).toHaveBeenCalledWith("oops");
      expect(returned).toBe(err);
    });

    it("toNullable returns null", () => {
      expect(err.toNullable()).toBeNull();
    });
  });

  describe("method chaining", () => {
    it("supports chaining for Ok", () => {
      const result = Result.ok(10)
        .map((v) => v * 2)
        .flatMap((v) => Result.ok(v + 1))
        .tap((v) => expect(v).toBe(21))
        .tapErr(() => {});

      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.value).toBe(21);
    });

    it("supports chaining for Err", () => {
      const result = Result.err<string>("oops")
        .map((v) => v * 2)
        .mapErr((e) => e.toUpperCase())
        .tap(() => {})
        .tapErr((e) => expect(e).toBe("OOPS"));

      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBe("OOPS");
    });
  });
});
