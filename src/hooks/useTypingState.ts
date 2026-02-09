import { useCallback, useState } from "react";

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

const initialState: TypingState = {
	typed: [],
	startTime: null,
	endTime: null,
	backspaceCount: 0,
	totalKeystrokes: 0,
};

export function useTypingState(code: string) {
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

	const handleKey = useCallback(
		(key: string) => {
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

	return {
		typed: state.typed,
		startTime: state.startTime,
		currentIndex,
		isComplete,
		result,
		handleKey,
	};
}
