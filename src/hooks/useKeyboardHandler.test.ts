import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useKeyboardHandler } from "./useKeyboardHandler";

function pressKey(key: string) {
	act(() => {
		window.dispatchEvent(new KeyboardEvent("keydown", { key }));
	});
}

function pressKeyWithModifiers(
	key: string,
	modifiers: Pick<KeyboardEventInit, "ctrlKey" | "altKey" | "metaKey">,
) {
	act(() => {
		window.dispatchEvent(new KeyboardEvent("keydown", { key, ...modifiers }));
	});
}

describe("useKeyboardHandler", () => {
	it("calls onKey for single character keys", () => {
		const onKey = vi.fn();
		renderHook(() => useKeyboardHandler(onKey));
		pressKey("a");
		expect(onKey).toHaveBeenCalledWith("a");
	});

	it("calls onKey for Backspace", () => {
		const onKey = vi.fn();
		renderHook(() => useKeyboardHandler(onKey));
		pressKey("Backspace");
		expect(onKey).toHaveBeenCalledWith("Backspace");
	});

	it("calls onKey for Enter", () => {
		const onKey = vi.fn();
		renderHook(() => useKeyboardHandler(onKey));
		pressKey("Enter");
		expect(onKey).toHaveBeenCalledWith("Enter");
	});

	it("calls onKey for Tab", () => {
		const onKey = vi.fn();
		renderHook(() => useKeyboardHandler(onKey));
		pressKey("Tab");
		expect(onKey).toHaveBeenCalledWith("Tab");
	});

	it("ignores modifier and special keys", () => {
		const onKey = vi.fn();
		renderHook(() => useKeyboardHandler(onKey));
		pressKey("Shift");
		pressKey("Control");
		pressKey("Alt");
		pressKey("Meta");
		pressKey("Escape");
		pressKey("ArrowLeft");
		expect(onKey).not.toHaveBeenCalled();
	});

	it("ignores typable keys when ctrl, alt, or meta is pressed", () => {
		const onKey = vi.fn();
		renderHook(() => useKeyboardHandler(onKey));
		pressKeyWithModifiers("r", { ctrlKey: true });
		pressKeyWithModifiers("r", { altKey: true });
		pressKeyWithModifiers("r", { metaKey: true });
		expect(onKey).not.toHaveBeenCalled();
	});

	it("calls preventDefault for typable keys", () => {
		const onKey = vi.fn();
		renderHook(() => useKeyboardHandler(onKey));
		const event = new KeyboardEvent("keydown", { key: "a" });
		const spy = vi.spyOn(event, "preventDefault");
		act(() => {
			window.dispatchEvent(event);
		});
		expect(spy).toHaveBeenCalled();
	});

	it("does not call preventDefault for non-typable keys", () => {
		const onKey = vi.fn();
		renderHook(() => useKeyboardHandler(onKey));
		const event = new KeyboardEvent("keydown", { key: "Shift" });
		const spy = vi.spyOn(event, "preventDefault");
		act(() => {
			window.dispatchEvent(event);
		});
		expect(spy).not.toHaveBeenCalled();
	});

	it("cleans up listener on unmount", () => {
		const onKey = vi.fn();
		const removeSpy = vi.spyOn(window, "removeEventListener");
		const { unmount } = renderHook(() => useKeyboardHandler(onKey));
		unmount();
		expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
		removeSpy.mockRestore();
	});
});
