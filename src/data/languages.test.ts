import { describe, expect, it } from "vitest";
import { languages, matchesExtension } from "./languages";

describe("languages", () => {
	it("has unique ids", () => {
		const ids = languages.map((l) => l.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("each language has at least one extension", () => {
		for (const lang of languages) {
			expect(lang.extensions.length).toBeGreaterThanOrEqual(1);
		}
	});
});

describe("matchesExtension", () => {
	it("returns true for matching extension", () => {
		expect(matchesExtension("src/main.ts", [".ts", ".tsx"])).toBe(true);
	});

	it("returns true for second extension in list", () => {
		expect(matchesExtension("App.tsx", [".ts", ".tsx"])).toBe(true);
	});

	it("returns false for non-matching extension", () => {
		expect(matchesExtension("README.md", [".ts", ".tsx"])).toBe(false);
	});

	it("returns false for partial match", () => {
		expect(matchesExtension("scripts.tsconfig", [".ts"])).toBe(false);
	});

	it("returns false for empty extensions list", () => {
		expect(matchesExtension("main.ts", [])).toBe(false);
	});
});
