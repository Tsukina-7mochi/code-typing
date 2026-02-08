import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTypingGame } from "./useTypingGame";

function pressKey(key: string) {
	act(() => {
		window.dispatchEvent(new KeyboardEvent("keydown", { key }));
	});
}

describe("useTypingGame", () => {
	it("starts with empty state", () => {
		const { result } = renderHook(() => useTypingGame("abc"));
		expect(result.current.typed).toEqual([]);
		expect(result.current.currentIndex).toBe(0);
		expect(result.current.isComplete).toBe(false);
		expect(result.current.result).toBeNull();
	});

	it("typing correct characters advances position", () => {
		const { result } = renderHook(() => useTypingGame("abc"));
		pressKey("a");
		expect(result.current.typed).toEqual(["a"]);
		expect(result.current.currentIndex).toBe(1);
	});

	it("typing wrong characters still advances position", () => {
		const { result } = renderHook(() => useTypingGame("abc"));
		pressKey("x");
		expect(result.current.typed).toEqual(["x"]);
		expect(result.current.currentIndex).toBe(1);
	});

	it("backspace removes last character", () => {
		const { result } = renderHook(() => useTypingGame("abc"));
		pressKey("a");
		pressKey("b");
		expect(result.current.typed).toEqual(["a", "b"]);
		pressKey("Backspace");
		expect(result.current.typed).toEqual(["a"]);
		expect(result.current.currentIndex).toBe(1);
	});

	it("backspace does nothing when nothing is typed", () => {
		const { result } = renderHook(() => useTypingGame("abc"));
		pressKey("Backspace");
		expect(result.current.typed).toEqual([]);
		expect(result.current.currentIndex).toBe(0);
	});

	it("timer starts on first keypress", () => {
		vi.spyOn(Date, "now").mockReturnValue(1000);
		const { result } = renderHook(() => useTypingGame("abc"));
		expect(result.current.startTime).toBeNull();
		pressKey("a");
		expect(result.current.startTime).toBe(1000);
		vi.restoreAllMocks();
	});

	it("timer does not reset on subsequent keypresses", () => {
		let now = 1000;
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const { result } = renderHook(() => useTypingGame("abc"));
		pressKey("a");
		expect(result.current.startTime).toBe(1000);
		now = 2000;
		pressKey("b");
		expect(result.current.startTime).toBe(1000);
		vi.restoreAllMocks();
	});

	it("typing completes when all positions filled", () => {
		let now = 1000;
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const { result } = renderHook(() => useTypingGame("ab"));
		pressKey("a");
		now = 2000;
		pressKey("b");
		expect(result.current.isComplete).toBe(true);
		vi.restoreAllMocks();
	});

	it("result computes correct metrics", () => {
		let now = 1000;
		vi.spyOn(Date, "now").mockImplementation(() => now);
		const { result } = renderHook(() => useTypingGame("ab"));
		pressKey("a");
		now = 4000;
		pressKey("b");
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
		const { result } = renderHook(() => useTypingGame("ab"));
		pressKey("x");
		pressKey("Backspace");
		pressKey("a");
		now = 5000;
		pressKey("b");
		expect(result.current.result).not.toBeNull();
		expect(result.current.result?.backspaceCount).toBe(1);
		expect(result.current.result?.totalKeystrokes).toBe(3);
		vi.restoreAllMocks();
	});

	it("keys are ignored after completion", () => {
		vi.spyOn(Date, "now").mockReturnValue(1000);
		const { result } = renderHook(() => useTypingGame("a"));
		pressKey("a");
		expect(result.current.isComplete).toBe(true);
		pressKey("b");
		expect(result.current.typed).toEqual(["a"]);
		expect(result.current.currentIndex).toBe(1);
		vi.restoreAllMocks();
	});

	it("ignores modifier keys and special keys", () => {
		const { result } = renderHook(() => useTypingGame("abc"));
		pressKey("Shift");
		pressKey("Control");
		pressKey("Alt");
		pressKey("Meta");
		pressKey("Escape");
		pressKey("ArrowLeft");
		expect(result.current.typed).toEqual([]);
		expect(result.current.currentIndex).toBe(0);
	});

	it("handles Enter key as newline character", () => {
		const { result } = renderHook(() => useTypingGame("a\nb"));
		pressKey("a");
		pressKey("Enter");
		expect(result.current.typed).toEqual(["a", "Enter"]);
		expect(result.current.currentIndex).toBe(2);
	});

	it("handles Tab key as tab character", () => {
		const { result } = renderHook(() => useTypingGame("a\tb"));
		pressKey("a");
		pressKey("Tab");
		expect(result.current.typed).toEqual(["a", "Tab"]);
		expect(result.current.currentIndex).toBe(2);
	});

	it("cleans up keydown listener on unmount", () => {
		const removeSpy = vi.spyOn(window, "removeEventListener");
		const { unmount } = renderHook(() => useTypingGame("abc"));
		unmount();
		expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
		removeSpy.mockRestore();
	});
});
