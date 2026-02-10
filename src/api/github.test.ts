import { afterEach, describe, expect, it, vi } from "vitest";
import type { Language } from "../data/languages";
import {
	fetchRandomCode,
	filterSourceFiles,
	type GitHubRepo,
	type GitHubTreeEntry,
	getFileContent,
	getRepoTree,
	pickRandom,
	sanitizeCode,
	searchRepos,
} from "./github";

function mockFetch(response: {
	status?: number;
	headers?: Record<string, string>;
	body?: unknown;
	text?: string;
}) {
	return vi.fn().mockResolvedValue({
		ok: (response.status ?? 200) >= 200 && (response.status ?? 200) < 300,
		status: response.status ?? 200,
		headers: new Headers(response.headers ?? {}),
		json: () => Promise.resolve(response.body),
		text: () => Promise.resolve(response.text ?? ""),
	});
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("searchRepos", () => {
	it("returns repos on success", async () => {
		const repos = [
			{
				full_name: "owner/repo",
				owner: { login: "owner" },
				name: "repo",
				default_branch: "main",
			},
		];
		vi.stubGlobal("fetch", mockFetch({ body: { items: repos } }));

		const result = await searchRepos("typescript");

		expect(result).toEqual({ ok: true, data: repos });
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining("language:typescript"),
			expect.any(Object),
		);
	});

	it("passes per_page=50 and sort=stars", async () => {
		vi.stubGlobal("fetch", mockFetch({ body: { items: [] } }));

		await searchRepos("go");

		const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
		expect(url).toContain("per_page=50");
		expect(url).toContain("sort=stars");
		expect(url).toContain("order=desc");
	});

	it("returns rate_limit error on 403", async () => {
		vi.stubGlobal(
			"fetch",
			mockFetch({
				status: 403,
				headers: { "x-ratelimit-remaining": "0", "retry-after": "42" },
			}),
		);

		const result = await searchRepos("typescript");

		expect(result).toEqual({
			ok: false,
			error: {
				type: "rate_limit",
				message: expect.any(String),
				retryAfter: 42,
			},
		});
	});

	it("returns network error on fetch failure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new Error("Network error")),
		);

		const result = await searchRepos("typescript");

		expect(result).toEqual({
			ok: false,
			error: { type: "network", message: expect.any(String) },
		});
	});
});

describe("getRepoTree", () => {
	it("returns tree entries on success", async () => {
		const tree = [{ path: "src/main.ts", type: "blob", size: 100, sha: "abc" }];
		vi.stubGlobal("fetch", mockFetch({ body: { tree, truncated: false } }));

		const result = await getRepoTree("owner", "repo", "main");

		expect(result).toEqual({ ok: true, data: tree });
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining("/git/trees/main?recursive=1"),
			expect.any(Object),
		);
	});

	it("returns error on 404", async () => {
		vi.stubGlobal("fetch", mockFetch({ status: 404 }));

		const result = await getRepoTree("owner", "repo", "main");

		expect(result.ok).toBe(false);
	});
});

describe("getFileContent", () => {
	it("returns raw text on success", async () => {
		vi.stubGlobal(
			"fetch",
			mockFetch({ text: 'fn main() { println!("hello"); }' }),
		);

		const result = await getFileContent("owner", "repo", "src/main.rs");

		expect(result).toEqual({
			ok: true,
			data: 'fn main() { println!("hello"); }',
		});
		const headers = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1]
			.headers;
		expect(headers.Accept).toBe("application/vnd.github.raw+json");
	});

	it("returns error on failure", async () => {
		vi.stubGlobal("fetch", mockFetch({ status: 404 }));

		const result = await getFileContent("owner", "repo", "missing.ts");

		expect(result.ok).toBe(false);
	});
});

describe("filterSourceFiles", () => {
	const entries: GitHubTreeEntry[] = [
		{ path: "src/main.ts", type: "blob", size: 1000, sha: "a" },
		{ path: "src/utils.tsx", type: "blob", size: 2000, sha: "b" },
		{ path: "README.md", type: "blob", size: 500, sha: "c" },
		{ path: "src", type: "tree", sha: "d" },
		{ path: "src/tiny.ts", type: "blob", size: 10, sha: "e" },
		{ path: "src/huge.ts", type: "blob", size: 99999, sha: "f" },
		{ path: "node_modules/lib/index.ts", type: "blob", size: 1000, sha: "g" },
		{ path: "dist/bundle.js", type: "blob", size: 1000, sha: "h" },
		{ path: "src/__tests__/foo.test.ts", type: "blob", size: 1000, sha: "i" },
		{ path: "src/types.d.ts", type: "blob", size: 1000, sha: "j" },
	];

	it("filters by extension and size", () => {
		const result = filterSourceFiles(entries, [".ts", ".tsx"]);
		const paths = result.map((e) => e.path);

		expect(paths).toContain("src/main.ts");
		expect(paths).toContain("src/utils.tsx");
	});

	it("excludes non-matching extensions", () => {
		const result = filterSourceFiles(entries, [".ts", ".tsx"]);
		const paths = result.map((e) => e.path);

		expect(paths).not.toContain("README.md");
	});

	it("excludes tree entries", () => {
		const result = filterSourceFiles(entries, [".ts"]);
		const paths = result.map((e) => e.path);

		expect(paths).not.toContain("src");
	});

	it("excludes files below min size", () => {
		const result = filterSourceFiles(entries, [".ts"]);
		const paths = result.map((e) => e.path);

		expect(paths).not.toContain("src/tiny.ts");
	});

	it("excludes files above max size", () => {
		const result = filterSourceFiles(entries, [".ts"]);
		const paths = result.map((e) => e.path);

		expect(paths).not.toContain("src/huge.ts");
	});

	it("excludes vendor/generated/test paths", () => {
		const result = filterSourceFiles(entries, [".ts", ".tsx", ".js"]);
		const paths = result.map((e) => e.path);

		expect(paths).not.toContain("node_modules/lib/index.ts");
		expect(paths).not.toContain("dist/bundle.js");
		expect(paths).not.toContain("src/__tests__/foo.test.ts");
		expect(paths).not.toContain("src/types.d.ts");
	});

	it("does not over-exclude paths containing excluded words as substrings", () => {
		const edgeCases: GitHubTreeEntry[] = [
			{ path: "src/protest/handler.ts", type: "blob", size: 1000, sha: "k" },
			{ path: "src/distribution/index.ts", type: "blob", size: 1000, sha: "l" },
		];
		const result = filterSourceFiles(edgeCases, [".ts"]);
		const paths = result.map((e) => e.path);

		expect(paths).toContain("src/protest/handler.ts");
		expect(paths).toContain("src/distribution/index.ts");
	});
});

describe("pickRandom", () => {
	it("returns an element from the array", () => {
		const items = [1, 2, 3, 4, 5];
		const result = pickRandom(items);

		expect(items).toContain(result);
	});

	it("uses Math.random for selection", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		const items = ["a", "b", "c", "d"];

		expect(pickRandom(items)).toBe("c");
	});

	it("throws on empty array", () => {
		expect(() => pickRandom([])).toThrow("Cannot pick from an empty array");
	});
});

describe("sanitizeCode", () => {
	it("normalizes CRLF to LF", () => {
		expect(sanitizeCode("a\r\nb\r\nc")).toBe("a\nb\nc");
	});

	it("trims trailing whitespace per line", () => {
		expect(sanitizeCode("hello   \nworld  ")).toBe("hello\nworld");
	});

	it("removes leading and trailing blank lines", () => {
		expect(sanitizeCode("\n\nhello\nworld\n\n")).toBe("hello\nworld");
	});

	it("replaces tabs with 4 spaces", () => {
		expect(sanitizeCode("\tif (x) {\n\t\treturn y;\n\t}")).toBe(
			"    if (x) {\n        return y;\n    }",
		);
	});

	it("truncates at 2000 chars on a line boundary", () => {
		const longLine = "x".repeat(100);
		const lines = Array.from({ length: 30 }, () => longLine).join("\n");
		const result = sanitizeCode(lines);

		expect(result.length).toBeLessThanOrEqual(2000);
		expect(result.endsWith("x")).toBe(true);
	});

	it("handles empty string", () => {
		expect(sanitizeCode("")).toBe("");
	});
});

describe("fetchRandomCode", () => {
	const language: Language = {
		id: "typescript",
		name: "TypeScript",
		githubQuery: "typescript",
		extensions: [".ts", ".tsx"],
		lineCommentTokens: ["//"],
		blockCommentPairs: [{ start: "/*", end: "*/" }],
	};

	const fakeRepo: GitHubRepo = {
		full_name: "owner/repo",
		owner: { login: "owner" },
		name: "repo",
		default_branch: "main",
	};

	const fakeTree: GitHubTreeEntry[] = [
		{ path: "src/app.ts", type: "blob", size: 1000, sha: "abc" },
	];

	function setupFetchSequence(
		responses: Array<{
			status?: number;
			headers?: Record<string, string>;
			body?: unknown;
			text?: string;
		}>,
	) {
		let callIndex = 0;
		vi.stubGlobal(
			"fetch",
			vi.fn().mockImplementation(() => {
				const response = responses[callIndex++] ?? responses.at(-1);
				const status = response?.status ?? 200;
				return Promise.resolve({
					ok: status >= 200 && status < 300,
					status,
					headers: new Headers(response?.headers ?? {}),
					json: () => Promise.resolve(response?.body),
					text: () => Promise.resolve(response?.text ?? ""),
				});
			}),
		);
	}

	it("returns CodeSample on success", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		setupFetchSequence([
			{ body: { items: [fakeRepo] } },
			{ body: { tree: fakeTree, truncated: false } },
			{ text: "const x = 1;" },
		]);

		const result = await fetchRandomCode(language);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.languageId).toBe("typescript");
			expect(result.data.language).toBe("TypeScript");
			expect(result.data.title).toContain("owner/repo");
			expect(result.data.code).toBe("const x = 1;");
		}
	});

	it("returns error when search fails", async () => {
		setupFetchSequence([
			{ status: 403, headers: { "x-ratelimit-remaining": "0" } },
		]);

		const result = await fetchRandomCode(language);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("rate_limit");
		}
	});

	it("returns not_found when no repos returned", async () => {
		setupFetchSequence([{ body: { items: [] } }]);

		const result = await fetchRandomCode(language);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("not_found");
		}
	});

	it("retries with another repo when tree has no suitable files", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const repo2: GitHubRepo = {
			...fakeRepo,
			full_name: "owner/repo2",
			name: "repo2",
		};
		setupFetchSequence([
			{ body: { items: [fakeRepo, repo2] } },
			{ body: { tree: [], truncated: false } },
			{ body: { tree: fakeTree, truncated: false } },
			{ text: "const y = 2;" },
		]);

		const result = await fetchRandomCode(language);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.code).toBe("const y = 2;");
		}
	});

	it("returns no_suitable_files after exhausting retries", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		setupFetchSequence([
			{ body: { items: [fakeRepo, fakeRepo, fakeRepo] } },
			{ body: { tree: [], truncated: false } },
			{ body: { tree: [], truncated: false } },
			{ body: { tree: [], truncated: false } },
		]);

		const result = await fetchRandomCode(language);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("no_suitable_files");
		}
	});
});
