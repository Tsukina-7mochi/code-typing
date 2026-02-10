import { useCallback, useState } from "react";

export interface TypingResult {
	readonly elapsedTime: number;
	readonly totalKeystrokes: number;
	readonly keystrokesPerSecond: number;
	readonly backspaceCount: number;
}

interface TypingState {
	readonly currentIndex: number;
	readonly errorInput: string;
	readonly startTime: number | null;
	readonly endTime: number | null;
	readonly backspaceCount: number;
	readonly totalKeystrokes: number;
}

const initialState: TypingState = {
	currentIndex: 0,
	errorInput: "",
	startTime: null,
	endTime: null,
	backspaceCount: 0,
	totalKeystrokes: 0,
};

function keyToChar(key: string): string {
	if (key === "Enter") return "\n";
	if (key === "Tab") return "\t";
	return key;
}

function findLineStart(code: string, index: number): number {
	const lastNewline = code.lastIndexOf("\n", Math.max(index - 1, 0));
	return lastNewline === -1 ? 0 : lastNewline + 1;
}

function findIndentEnd(code: string, lineStart: number): number {
	let current = lineStart;
	while (current < code.length) {
		const char = code[current];
		if (char !== " " && char !== "\t") break;
		current += 1;
	}
	return current;
}

export function useTypingState(code: string) {
	const [state, setState] = useState<TypingState>(initialState);

	const currentIndex = state.currentIndex;
	const isComplete = state.currentIndex === code.length;

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
				if (prev.currentIndex === code.length) return prev;

				if (key === "Backspace") {
					if (prev.errorInput.length > 0) {
						return {
							...prev,
							errorInput: prev.errorInput.slice(0, -1),
							backspaceCount: prev.backspaceCount + 1,
						};
					}

					if (prev.currentIndex === 0) return prev;

					const lineStart = findLineStart(code, prev.currentIndex);
					const indentEnd = findIndentEnd(code, lineStart);
					if (prev.currentIndex > lineStart && prev.currentIndex <= indentEnd) {
						const targetIndex = lineStart > 0 ? Math.max(lineStart - 1, 0) : 0;
						return {
							...prev,
							currentIndex: targetIndex,
							backspaceCount: prev.backspaceCount + 1,
						};
					}

					return {
						...prev,
						currentIndex: prev.currentIndex - 1,
						backspaceCount: prev.backspaceCount + 1,
					};
				}

				const now = Date.now();
				const typedChar = keyToChar(key);

				if (prev.errorInput.length > 0) {
					return {
						...prev,
						errorInput: prev.errorInput + typedChar,
						startTime: prev.startTime ?? now,
						totalKeystrokes: prev.totalKeystrokes + 1,
					};
				}

				if (key === "Tab") {
					const lineStart = findLineStart(code, prev.currentIndex);
					const indentEnd = findIndentEnd(code, lineStart);
					const isInIndent =
						indentEnd > lineStart &&
						prev.currentIndex >= lineStart &&
						prev.currentIndex <= indentEnd;
					if (isInIndent) {
						const newIndex = indentEnd;
						const isNowComplete = newIndex === code.length;
						return {
							...prev,
							currentIndex: newIndex,
							startTime: prev.startTime ?? now,
							endTime: isNowComplete ? now : prev.endTime,
							totalKeystrokes: prev.totalKeystrokes + 1,
						};
					}
				}

				const expectedChar = code[prev.currentIndex] ?? "";
				if (typedChar === expectedChar) {
					let newIndex = prev.currentIndex + 1;
					if (typedChar === "\n") {
						const lineStart = findLineStart(code, newIndex);
						const indentEnd = findIndentEnd(code, lineStart);
						if (indentEnd > newIndex) {
							newIndex = indentEnd;
						}
					}
					const isNowComplete = newIndex === code.length;
					return {
						...prev,
						currentIndex: newIndex,
						startTime: prev.startTime ?? now,
						endTime: isNowComplete ? now : prev.endTime,
						totalKeystrokes: prev.totalKeystrokes + 1,
					};
				}

				return {
					...prev,
					errorInput: typedChar,
					startTime: prev.startTime ?? now,
					totalKeystrokes: prev.totalKeystrokes + 1,
				};
			});
		},
		[code],
	);

	return {
		errorInput: state.errorInput,
		startTime: state.startTime,
		currentIndex,
		isComplete,
		result,
		handleKey,
	};
}
