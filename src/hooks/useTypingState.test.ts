import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTypingState } from "./useTypingState";

describe("useTypingState", () => {
	it("starts with empty state", () => {
		const { result } = renderHook(() => useTypingState("abc"));
		expect(result.current.errorInput).toBe("");
		expect(result.current.currentIndex).toBe(0);
		expect(result.current.isComplete).toBe(false);
		expect(result.current.result).toBeNull();
	});

	it("handleKey advances position", () => {
		const { result } = renderHook(() => useTypingState("abc"));
		act(() => result.current.handleKey("a"));
		expect(result.current.errorInput).toBe("");
		expect(result.current.currentIndex).toBe(1);
	});

	it("handleKey accepts wrong characters", () => {
		const { result } = renderHook(() => useTypingState("abc"));
		act(() => result.current.handleKey("x"));
		expect(result.current.errorInput).toBe("x");
		expect(result.current.currentIndex).toBe(0);
	});

	it("appends error input when already in error state", () => {
		const { result } = renderHook(() => useTypingState("abc"));
		act(() => result.current.handleKey("x"));
		act(() => result.current.handleKey("y"));
		expect(result.current.errorInput).toBe("xy");
		expect(result.current.currentIndex).toBe(0);
	});

	it("Backspace removes error input before moving index", () => {
		const { result } = renderHook(() => useTypingState("abc"));
		act(() => result.current.handleKey("x"));
		act(() => result.current.handleKey("Backspace"));
		expect(result.current.errorInput).toBe("");
		expect(result.current.currentIndex).toBe(0);
	});

	it("Backspace removes last character", () => {
		const { result } = renderHook(() => useTypingState("abc"));
		act(() => result.current.handleKey("a"));
		act(() => result.current.handleKey("b"));
		act(() => result.current.handleKey("Backspace"));
		expect(result.current.errorInput).toBe("");
		expect(result.current.currentIndex).toBe(1);
	});

	it("Backspace does nothing when nothing is typed", () => {
		const { result } = renderHook(() => useTypingState("abc"));
		act(() => result.current.handleKey("Backspace"));
		expect(result.current.errorInput).toBe("");
		expect(result.current.currentIndex).toBe(0);
	});

	it("timer starts on first key", () => {
		vi.spyOn(Date, "now").mockReturnValue(1000);
		const { result } = renderHook(() => useTypingState("abc"));
		expect(result.current.startTime).toBeNull();
		act(() => result.current.handleKey("a"));
		expect(result.current.startTime).toBe(1000);
		vi.restoreAllMocks();
	});

	it("timer does not reset on subsequent keys", () => {
		let now = 1000;
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const { result } = renderHook(() => useTypingState("abc"));
		act(() => result.current.handleKey("a"));
		expect(result.current.startTime).toBe(1000);
		now = 2000;
		act(() => result.current.handleKey("b"));
		expect(result.current.startTime).toBe(1000);
		vi.restoreAllMocks();
	});

	it("completes when all positions filled", () => {
		let now = 1000;
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const { result } = renderHook(() => useTypingState("ab"));
		act(() => result.current.handleKey("a"));
		now = 2000;
		act(() => result.current.handleKey("b"));
		expect(result.current.isComplete).toBe(true);
		vi.restoreAllMocks();
	});

	it("result computes correct metrics", () => {
		let now = 1000;
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const { result } = renderHook(() => useTypingState("ab"));
		act(() => result.current.handleKey("a"));
		now = 4000;
		act(() => result.current.handleKey("b"));
		expect(result.current.result).toEqual({
			elapsedTime: 3,
			totalKeystrokes: 2,
			keystrokesPerSecond: 2 / 3,
			backspaceCount: 0,
		});
		vi.restoreAllMocks();
	});

	it("result includes backspace count", () => {
		let now = 1000;
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const { result } = renderHook(() => useTypingState("ab"));
		act(() => result.current.handleKey("x"));
		act(() => result.current.handleKey("Backspace"));
		act(() => result.current.handleKey("a"));
		now = 5000;
		act(() => result.current.handleKey("b"));
		expect(result.current.result).not.toBeNull();
		expect(result.current.result?.backspaceCount).toBe(1);
		expect(result.current.result?.totalKeystrokes).toBe(3);
		vi.restoreAllMocks();
	});

	it("keys are ignored after completion", () => {
		vi.spyOn(Date, "now").mockReturnValue(1000);
		const { result } = renderHook(() => useTypingState("a"));
		act(() => result.current.handleKey("a"));
		expect(result.current.isComplete).toBe(true);
		act(() => result.current.handleKey("b"));
		expect(result.current.errorInput).toBe("");
		expect(result.current.currentIndex).toBe(1);
		vi.restoreAllMocks();
	});

	it("auto-indents after Enter", () => {
		const { result } = renderHook(() => useTypingState("a\n    b"));
		act(() => result.current.handleKey("a"));
		act(() => result.current.handleKey("Enter"));
		expect(result.current.currentIndex).toBe("a\n    ".length);
	});

	it("Tab skips leading indentation", () => {
		const { result } = renderHook(() => useTypingState("    a"));
		act(() => result.current.handleKey("Tab"));
		expect(result.current.currentIndex).toBe(4);
	});

	it("Backspace skips leading indentation", () => {
		const { result } = renderHook(() => useTypingState("a\n    b"));
		act(() => result.current.handleKey("a"));
		act(() => result.current.handleKey("Enter"));
		act(() => result.current.handleKey("Backspace"));
		expect(result.current.currentIndex).toBe(1);
	});

	it("auto-skipped indentation does not add keystrokes", () => {
		const { result } = renderHook(() => useTypingState("a\n    b"));
		act(() => result.current.handleKey("a"));
		act(() => result.current.handleKey("Enter"));
		expect(result.current.result).toBeNull();
		act(() => result.current.handleKey("b"));
		expect(result.current.result?.totalKeystrokes).toBe(3);
	});
});
