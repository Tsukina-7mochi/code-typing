import { useCallback, useEffect, useState } from "react";

export interface TypingResult {
	readonly elapsedTime: number;
	readonly totalKeystrokes: number;
	readonly keystrokesPerSecond: number;
	readonly backspaceCount: number;
}

interface TypingState {
	readonly typed: readonly string[];
	readonly startTime: number | null;
	readonly endTime: number | null;
	readonly backspaceCount: number;
	readonly totalKeystrokes: number;
}

const IGNORED_KEYS = new Set([
	"Shift",
	"Control",
	"Alt",
	"Meta",
	"CapsLock",
	"Escape",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"Home",
	"End",
	"PageUp",
	"PageDown",
	"Insert",
	"Delete",
	"F1",
	"F2",
	"F3",
	"F4",
	"F5",
	"F6",
	"F7",
	"F8",
	"F9",
	"F10",
	"F11",
	"F12",
]);

const initialState: TypingState = {
	typed: [],
	startTime: null,
	endTime: null,
	backspaceCount: 0,
	totalKeystrokes: 0,
};

export function useTypingGame(code: string) {
	const [state, setState] = useState<TypingState>(initialState);

	const currentIndex = state.typed.length;
	const isComplete = state.typed.length === code.length;

	const result: TypingResult | null =
		isComplete && state.startTime !== null && state.endTime !== null
			? {
					elapsedTime: (state.endTime - state.startTime) / 1000,
					totalKeystrokes: state.totalKeystrokes,
					keystrokesPerSecond:
						state.totalKeystrokes / ((state.endTime - state.startTime) / 1000),
					backspaceCount: state.backspaceCount,
				}
			: null;

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const { key } = event;

			if (IGNORED_KEYS.has(key)) return;

			const isTypableKey =
				key === "Backspace" ||
				key === "Enter" ||
				key === "Tab" ||
				key.length === 1;
			if (!isTypableKey) return;

			event.preventDefault();

			setState((prev) => {
				if (prev.typed.length === code.length) return prev;

				if (key === "Backspace") {
					if (prev.typed.length === 0) return prev;
					return {
						...prev,
						typed: prev.typed.slice(0, -1),
						backspaceCount: prev.backspaceCount + 1,
					};
				}

				const now = Date.now();
				const newTyped = [...prev.typed, key];
				const isNowComplete = newTyped.length === code.length;

				return {
					...prev,
					typed: newTyped,
					startTime: prev.startTime ?? now,
					endTime: isNowComplete ? now : prev.endTime,
					totalKeystrokes: prev.totalKeystrokes + 1,
				};
			});
		},
		[code],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return {
		typed: state.typed,
		startTime: state.startTime,
		currentIndex,
		isComplete,
		result,
	};
}
