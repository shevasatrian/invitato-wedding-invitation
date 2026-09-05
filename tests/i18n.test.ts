import { describe, it, expect } from "vitest";
import { pickLang, dictionaries } from "@/lib/i18n";

describe("pickLang", () => {
  it("mengembalikan id hanya untuk nilai persis 'id'", () => {
    expect(pickLang("id")).toBe("id");
  });

  it("jatuh ke en untuk nilai lain apa pun", () => {
    expect(pickLang("en")).toBe("en");
    expect(pickLang("xx")).toBe("en");
    expect(pickLang("ID")).toBe("en");
    expect(pickLang("")).toBe("en");
    expect(pickLang(undefined)).toBe("en");
  });
});

/**
 * Bentuk kamus sudah dijamin TypeScript lewat `const id: Dict`. Yang TIDAK
 * dijamin compiler adalah panjang array — alt galeri yang kurang satu tetap
 * lolos `tsc`. Dua test di bawah menutup celah itu.
 */
describe("kamus", () => {
  const shape = (value: unknown, path = ""): string[] => {
    if (Array.isArray(value)) return [`${path}[${value.length}]`];
    if (typeof value === "object" && value !== null) {
      return Object.entries(value).flatMap(([k, v]) => shape(v, `${path}${k}.`));
    }
    return [path];
  };

  it("kedua bahasa punya struktur kunci dan panjang array yang sama persis", () => {
    expect(shape(dictionaries.id)).toEqual(shape(dictionaries.en));
  });

  const empties = (value: unknown, path = ""): string[] => {
    if (typeof value === "string") return value.trim() === "" ? [path] : [];
    if (typeof value === "object" && value !== null) {
      return Object.entries(value).flatMap(([k, v]) => empties(v, `${path}${k}.`));
    }
    return [];
  };

  it("tidak ada nilai kosong di kedua kamus", () => {
    expect(empties(dictionaries.en)).toEqual([]);
    expect(empties(dictionaries.id)).toEqual([]);
  });
});
