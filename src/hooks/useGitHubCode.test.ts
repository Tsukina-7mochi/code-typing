import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Language } from "../data/languages";
import { useGitHubCode } from "./useGitHubCode";

vi.mock("../api/github", () => ({
	fetchRandomCode: vi.fn(),
}));

import { fetchRandomCode } from "../api/github";

const mockFetchRandomCode = vi.mocked(fetchRandomCode);

const language: Language = {
	id: "go",
	name: "Go",
	githubQuery: "go",
	extensions: [".go"],
	lineCommentTokens: ["//"],
	blockCommentPairs: [{ start: "/*", end: "*/" }],
};

describe("useGitHubCode", () => {
	it("starts in idle state", () => {
		const { result } = renderHook(() => useGitHubCode());

		expect(result.current.state).toEqual({ status: "idle" });
	});

	it("transitions to loading when fetchCode is called", async () => {
		mockFetchRandomCode.mockReturnValue(new Promise(() => {}));

		const { result } = renderHook(() => useGitHubCode());

		act(() => {
			result.current.fetchCode(language);
		});

		expect(result.current.state.status).toBe("loading");
	});

	it("transitions to success on successful fetch", async () => {
		const sample = {
			id: "github-test",
			languageId: "go",
			language: "Go",
			title: "main.go from test/repo",
			code: "package main",
		};
		mockFetchRandomCode.mockResolvedValue({ ok: true, data: sample });

		const { result } = renderHook(() => useGitHubCode());

		await act(async () => {
			result.current.fetchCode(language);
		});

		expect(result.current.state).toEqual({
			status: "success",
			sample,
		});
	});

	it("transitions to error on failed fetch", async () => {
		const error = {
			type: "rate_limit" as const,
			message: "Rate limited",
			retryAfter: 60,
		};
		mockFetchRandomCode.mockResolvedValue({ ok: false, error });

		const { result } = renderHook(() => useGitHubCode());

		await act(async () => {
			result.current.fetchCode(language);
		});

		expect(result.current.state).toEqual({
			status: "error",
			error,
		});
	});

	it("resets to idle state", async () => {
		const sample = {
			id: "github-test",
			languageId: "go",
			language: "Go",
			title: "main.go",
			code: "package main",
		};
		mockFetchRandomCode.mockResolvedValue({ ok: true, data: sample });

		const { result } = renderHook(() => useGitHubCode());

		await act(async () => {
			result.current.fetchCode(language);
		});
		expect(result.current.state.status).toBe("success");

		act(() => {
			result.current.reset();
		});

		expect(result.current.state).toEqual({ status: "idle" });
	});
});
