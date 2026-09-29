import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { digestBytes, digestUtf8, isDigestString } from "../src/infrastructure/evidence/digest.js";
import {
  DeterministicNormalizer,
  NORMALIZER_VERSION,
} from "../src/infrastructure/evidence/normalize.js";

describe("digest", () => {
  it("is deterministic SHA-256 hex with prefix", () => {
    const a = digestUtf8("hello");
    const b = digestUtf8("hello");
    const c = digestBytes(Buffer.from("hello", "utf8"));
    assert.equal(a, b);
    assert.equal(a, c);
    assert.ok(isDigestString(a));
    assert.notEqual(a, digestUtf8("hello!"));
  });
});

describe("DeterministicNormalizer", () => {
  const normalizer = new DeterministicNormalizer();

  it("exposes versioned metadata and stable digests", () => {
    assert.equal(normalizer.version, NORMALIZER_VERSION);
    const once = normalizer.apply(Buffer.from("a\nb\n", "utf8"));
    const twice = normalizer.apply(Buffer.from("a\nb\n", "utf8"));
    assert.equal(once.rep.digest, twice.rep.digest);
    assert.equal(once.version, NORMALIZER_VERSION);
  });

  it("strips ANSI when configured", () => {
    const withAnsi = Buffer.from("\u001b[31mred\u001b[0m", "utf8");
    const stripped = normalizer.apply(withAnsi, { stripAnsi: true });
    const plain = normalizer.apply(Buffer.from("red", "utf8"), { stripAnsi: true });
    assert.equal(stripped.rep.digest, plain.rep.digest);
  });

  it("stable-sorts lines when configured", () => {
    const sorted = normalizer.apply(Buffer.from("b\na\n", "utf8"), {
      stableSortLines: true,
    });
    const expected = normalizer.apply(Buffer.from("a\nb\n", "utf8"), {
      stableSortLines: true,
    });
    assert.equal(sorted.rep.digest, expected.rep.digest);
  });

  it("bounds maxBytes", () => {
    const result = normalizer.apply(Buffer.from("abcdefghij", "utf8"), { maxBytes: 4 });
    assert.equal(result.truncatedByMaxBytes, true);
    assert.equal(result.bytes.byteLength, 4);
  });
});
