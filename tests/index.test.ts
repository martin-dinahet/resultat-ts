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

  describe("Result.try (sync error wrapper)", () => {
    it("wraps sync success value", () => {
      const result = Result.try(() => 42);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.value).toBe(42);
    });

    it("wraps sync thrown error", () => {
      const error = new Error("oops");
      const result = Result.try(() => {
        throw error;
      });
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBe(error);
    });

    it("preserves non-Error thrown values", () => {
      const result = Result.try(() => {
        throw "string error";
      });
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBe("string error");
    });
  });

  describe("Result.tryAsync (async error wrapper)", () => {
    it("wraps sync success value", async () => {
      const result = await Result.tryAsync(() => 42);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.value).toBe(42);
    });

    it("wraps sync thrown error", async () => {
      const result = await Result.tryAsync(() => {
        throw new Error("oops");
      });
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBeInstanceOf(Error);
    });

    it("wraps async success value", async () => {
      const result = await Result.tryAsync(async () => Promise.resolve(42));
      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.value).toBe(42);
    });

    it("wraps async rejected promise", async () => {
      const result = await Result.tryAsync(async () => Promise.reject("oops"));
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBe("oops");
    });
  });

  describe("Result.all (combine multiple Results)", () => {
    it("returns Ok with array of values when all are Ok", () => {
      const a = Result.ok(1);
      const b = Result.ok(2);
      const c = Result.ok(3);

      const result = Result.all([a, b, c]);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual([1, 2, 3]);
      }
    });

    it("returns first Err when any result is Err (fail-fast)", () => {
      const a = Result.ok(1);
      const b = Result.err("second failed");
      const c = Result.err("third failed");

      const result = Result.all([a, b, c]);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe("second failed");
      }
    });

    it("works with empty array", () => {
      const result = Result.all([]);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual([]);
      }
    });

    it("preserves type inference for mixed Result types", () => {
      const a = Result.ok(42);
      const b = Result.ok("hello");
      const result = Result.all([a, b]);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual([42, "hello"]);
      }
    });
  });

  describe("Result.fromNullable", () => {
    it("returns Ok when value is non-null", () => {
      const result = Result.fromNullable("value", "default error");
      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.value).toBe("value");
    });

    it("returns Err when value is null", () => {
      const result = Result.fromNullable(null, "was null");
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBe("was null");
    });

    it("returns Err when value is undefined", () => {
      const result = Result.fromNullable(undefined, "was undefined");
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBe("was undefined");
    });
  });

  describe("Result.fromPredicate", () => {
    it("returns Ok when predicate passes", () => {
      const result = Result.fromPredicate(5, (x) => x > 0, "not positive");
      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.value).toBe(5);
    });

    it("returns Err when predicate fails", () => {
      const result = Result.fromPredicate(-1, (x) => x > 0, "not positive");
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBe("not positive");
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

    it("andThen is alias for flatMap", () => {
      const result = ok.andThen((v) => Result.ok(v * 2));
      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.value).toBe(84);
    });

    it("orElse returns same Ok, ignores recovery function", () => {
      const recovered = ok.orElse(() => Result.ok(0));
      expect(recovered).toBe(ok);
    });

    it("isOkAnd returns true when predicate passes", () => {
      expect(ok.isOkAnd((v) => v > 40)).toBe(true);
    });

    it("isOkAnd returns false when predicate fails", () => {
      expect(ok.isOkAnd((v) => v > 50)).toBe(false);
    });

    it("isErrAnd always returns false", () => {
      expect(ok.isErrAnd(() => true)).toBe(false);
    });

    it("flip returns Err with the success value", () => {
      const flipped = ok.flip();
      expect(flipped.isErr()).toBe(true);
      if (flipped.isErr()) expect(flipped.error).toBe(42);
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

    it("toPromise resolves with the success value", async () => {
      await expect(ok.toPromise()).resolves.toBe(42);
    });

    it("toString returns human-readable Ok string", () => {
      expect(ok.toString()).toBe("Ok(42)");
    });

    it("toString formats strings with quotes", () => {
      const strOk = Result.ok("hello");
      expect(strOk.toString()).toBe('Ok("hello")');
    });

    it("toJSON returns object with ok property", () => {
      expect(ok.toJSON()).toEqual({ ok: 42 });
    });
  });

  describe("Err class", () => {
    let err: Err<string>;

    beforeEach(() => {
      err = Result.err("oops");
    });

    it("unwrap throws Error with error message for string errors", () => {
      expect(() => err.unwrap()).toThrow(/Tried to unwrap an Err value: "oops"/);
    });

    it("unwrap throws original Error instance for Error errors", () => {
      const originalError = new Error("original");
      const errWithError = Result.err(originalError);
      expect(() => errWithError.unwrap()).toThrow(originalError);
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

    it("andThen returns same Err, ignores function", () => {
      const result = err.andThen((v) => Result.ok(v * 2));
      expect(result).toBe(err);
    });

    it("orElse calls recovery function, returns its Result", () => {
      const recovered = err.orElse((e) => Result.ok(`recovered from ${e}`));
      expect(recovered.isOk()).toBe(true);
      if (recovered.isOk()) expect(recovered.value).toBe("recovered from oops");
    });

    it("isOkAnd always returns false", () => {
      expect(err.isOkAnd(() => true)).toBe(false);
    });

    it("isErrAnd returns true when predicate passes", () => {
      expect(err.isErrAnd((e) => e.length > 3)).toBe(true);
    });

    it("isErrAnd returns false when predicate fails", () => {
      expect(err.isErrAnd((e) => e.length > 10)).toBe(false);
    });

    it("flip returns Ok with the error value", () => {
      const flipped = err.flip();
      expect(flipped.isOk()).toBe(true);
      if (flipped.isOk()) expect(flipped.value).toBe("oops");
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

    it("toPromise rejects with the error", async () => {
      await expect(err.toPromise()).rejects.toBe("oops");
    });

    it("toString returns human-readable Err string", () => {
      expect(err.toString()).toBe('Err("oops")');
    });

    it("toString formats Error objects", () => {
      const errWithError = Result.err(new Error("test"));
      const str = errWithError.toString();
      expect(str).toBe("Err(Error: test)");
    });

    it("toJSON returns object with err property", () => {
      expect(err.toJSON()).toEqual({ err: "oops" });
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

    it("supports chaining with andThen", () => {
      const result = Result.ok(10)
        .andThen((v) => Result.ok(v * 2))
        .andThen((v) => Result.ok(v + 1));

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

    it("supports orElse in chain for Ok", () => {
      const result = Result.ok(42)
        .orElse(() => Result.ok(0))
        .map((v) => v * 2);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.value).toBe(84);
    });

    it("supports orElse in chain for Err", () => {
      const result = Result.err<string>("oops")
        .orElse((e) => Result.ok(`recovered: ${e}`))
        .map((v) => v.toUpperCase());

      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.value).toBe("RECOVERED: OOPS");
    });
  });
});
